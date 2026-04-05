import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("haberler")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const auth = req.headers.get("x-admin-password");
  if (auth !== adminPassword) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const body = await req.json();
  const { data, error } = await supabaseAdmin
    .from("haberler")
    .insert([body])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
