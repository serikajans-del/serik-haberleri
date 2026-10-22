import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/admin";
import { gorselYukle } from "@/lib/ustam-db";
import { KATEGORILER, MAHALLELER, ZAMANLAR, telGecerli } from "@/lib/ustam";

// Vatandaşın "Ücretsiz Teklif Al" talebi (herkese açık) → durum "yeni"; yönetici uygun ustalara iletir.
export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const g = (k: string) => (fd.get(k) ?? "").toString().trim();
    const kategori = g("kategori"), mahalle = g("mahalle"), zaman = g("zaman"), ad = g("ad"), telefon = g("telefon");
    if (!KATEGORILER.some((k) => k.slug === kategori)) return NextResponse.json({ error: "Hizmet seçin." }, { status: 400 });
    if (!MAHALLELER.includes(mahalle)) return NextResponse.json({ error: "Mahalle seçin." }, { status: 400 });
    if (!ZAMANLAR.some((z) => z.id === zaman)) return NextResponse.json({ error: "Hizmet zamanını seçin." }, { status: 400 });
    if (ad.length < 2) return NextResponse.json({ error: "Adınızı yazın." }, { status: 400 });
    if (!telGecerli(telefon)) return NextResponse.json({ error: "Geçerli bir cep telefonu girin (05xx xxx xx xx)." }, { status: 400 });
    if (g("kvkk") !== "on") return NextResponse.json({ error: "Aydınlatma metnini onaylayın." }, { status: 400 });

    const fotolar: string[] = [];
    for (const f of fd.getAll("foto").slice(0, 4)) { const u = await gorselYukle(f as File, "talep"); if (u) fotolar.push(u); }

    const kod = "SU" + Date.now().toString(36).toUpperCase().slice(-6);
    const tarih = zaman === "tarih" && /^\d{4}-\d{2}-\d{2}$/.test(g("tarih")) ? g("tarih") : null;
    const ekMahalle = mahalle === "Diğer" && g("mahalle_diger") ? `Diğer: ${g("mahalle_diger").slice(0, 60)}` : mahalle;
    const { error } = await supabaseAdmin.from("ustam_talepler").insert([{
      kod, kategori, mahalle: ekMahalle, aciklama: g("aciklama").slice(0, 1500), fotolar, zaman, tarih, ad: ad.slice(0, 80), telefon: telefon.slice(0, 20),
      istenen_usta: g("usta").replace(/[^a-z0-9-]/g, "").slice(0, 70),
    }]);
    if (error) { console.error("talep insert:", error); return NextResponse.json({ error: "Talep kaydedilemedi, lütfen tekrar deneyin." }, { status: 500 }); }
    return NextResponse.json({ success: true, kod });
  } catch (e) {
    console.error(e); return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("ustam_talepler").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id, durum, yonetici_notu } = await req.json();
  const alan: Record<string, string> = {};
  if (["yeni", "iletildi", "teklif", "tamamlandi", "iptal"].includes(durum)) alan.durum = durum;
  if (typeof yonetici_notu === "string") alan.yonetici_notu = yonetici_notu.slice(0, 1000);
  const { error } = await supabaseAdmin.from("ustam_talepler").update(alan).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
