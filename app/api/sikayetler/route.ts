import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const ad_soyad = formData.get("ad_soyad") as string;
    const email = formData.get("email") as string;
    const telefon = formData.get("telefon") as string;
    const baslik = formData.get("baslik") as string;
    const icerik = formData.get("icerik") as string;
    const adres = formData.get("adres") as string;
    const photos = formData.getAll("photos") as File[];

    if (!ad_soyad || !baslik || !icerik) {
      return NextResponse.json({ error: "Ad soyad, başlık ve şikayet içeriği zorunludur." }, { status: 400 });
    }

    const foto_urls: string[] = [];

    for (const photo of photos) {
      if (!photo || photo.size === 0) continue;
      const ext = photo.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabaseAdmin.storage
        .from("sikayet-fotograflar")
        .upload(fileName, buffer, { contentType: photo.type });

      if (!uploadError) {
        const { data } = supabaseAdmin.storage
          .from("sikayet-fotograflar")
          .getPublicUrl(fileName);
        foto_urls.push(data.publicUrl);
      }
    }

    const { data, error } = await supabaseAdmin
      .from("sikayetler")
      .insert([{ ad_soyad, email, telefon, baslik, icerik, adres, foto_urls, durum: "beklemede" }])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Şikayet kaydedilemedi." }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const adminPassword = req.headers.get("x-admin-password");
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("sikayetler")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Veri alınamadı." }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const adminPassword = req.headers.get("x-admin-password");
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id, durum } = await req.json();
  const { error } = await supabaseAdmin
    .from("sikayetler")
    .update({ durum })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "Güncelleme başarısız." }, { status: 500 });
  return NextResponse.json({ success: true });
}
