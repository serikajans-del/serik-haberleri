import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/admin";
import { KATEGORILER, kategoriAd, slugify } from "@/lib/firmalar";

// Esnafın kendi kaydını açtığı form (herkese açık) → "beklemede" olarak eklenir, admin onaylayınca yayına girer.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const ad = (b.ad ?? "").toString().trim();
    const kategori = (b.kategori ?? "").toString().trim();
    const telefon = (b.telefon ?? "").toString().trim();
    const adres = (b.adres ?? "").toString().trim();

    if (!ad || ad.length < 2) return NextResponse.json({ error: "İşletme adı zorunludur." }, { status: 400 });
    if (!KATEGORILER.some((k) => k.slug === kategori)) return NextResponse.json({ error: "Geçerli bir kategori seçin." }, { status: 400 });
    if (!telefon && !adres) return NextResponse.json({ error: "Telefon veya adres girin." }, { status: 400 });

    // benzersiz slug
    let slug = slugify(ad) || "isletme";
    const { data: mevcut } = await supabaseAdmin.from("isletmeler").select("slug").like("slug", `${slug}%`);
    if (mevcut && mevcut.some((r) => r.slug === slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const kayit = {
      slug,
      ad: ad.slice(0, 120),
      kategori,
      kategori_ad: kategoriAd(kategori),
      adres: adres.slice(0, 300),
      telefon: telefon.slice(0, 40),
      whatsapp: (b.whatsapp ?? "").toString().trim().slice(0, 40),
      instagram: (b.instagram ?? "").toString().trim().replace(/^@/, "").slice(0, 60),
      website: (b.website ?? "").toString().trim().slice(0, 200),
      calisma_saatleri: (b.calisma_saatleri ?? "").toString().trim().slice(0, 120),
      harita: (b.harita ?? "").toString().trim().slice(0, 400),
      aciklama: (b.aciklama ?? "").toString().trim().slice(0, 500),
      durum: "beklemede",
    };

    const { data, error } = await supabaseAdmin.from("isletmeler").insert([kayit]).select("id").single();
    if (error) {
      console.error("isletme insert:", error);
      return NextResponse.json({ error: "Kayıt eklenemedi." }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

// Admin: tüm kayıtları listele
export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("isletmeler").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Okunamadı." }, { status: 500 });
  return NextResponse.json(data);
}

// Admin: durum güncelle (onayla/reddet)
export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const { id, durum, guncelle } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  const yama: Record<string, unknown> = {};
  if (durum) yama.durum = durum;
  if (guncelle && typeof guncelle === "object") Object.assign(yama, guncelle);
  const { error } = await supabaseAdmin.from("isletmeler").update(yama).eq("id", id);
  if (error) return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  return NextResponse.json({ success: true });
}

// Admin: sil
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  const { error } = await supabaseAdmin.from("isletmeler").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Silinemedi." }, { status: 500 });
  return NextResponse.json({ success: true });
}
