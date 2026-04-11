import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST /api/views?slug=xxx — görüntülenmeyi artır
export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug gerekli" }, { status: 400 });

  try {
    // views sütununu 1 artır (RPC ile atomic increment)
    const { error } = await supabaseAdmin.rpc("increment_views", { haber_slug: slug });
    if (error) {
      // RPC yoksa fallback: önce oku, sonra yaz
      const { data } = await supabaseAdmin
        .from("haberler")
        .select("views")
        .eq("slug", slug)
        .single();
      const current = (data?.views as number) || 0;
      await supabaseAdmin
        .from("haberler")
        .update({ views: current + 1 })
        .eq("slug", slug);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
