import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/admin";
import { gorselYukle } from "@/lib/ustam-db";
import { yoneticiyeBildir } from "@/lib/bildirim";
import { KATEGORILER, MAHALLELER, PAKETLER, slugify, telGecerli } from "@/lib/ustam";

// Usta kaydı (herkese açık) → anında yayında ("onayli"). Doğrulanmış rozeti ve ücretli paket yönetici onayıyla verilir.
// Ücretli paket istenirse yöneticiye telefon bildirimi gider; paket ödeme alınınca panelden etkinleştirilir.
export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const g = (k: string) => (fd.get(k) ?? "").toString().trim();
    if (g("web")) return NextResponse.json({ success: true, slug: "" }); // bot tuzağı: gizli alan doluysa kaydetme
    const istenenPaket = PAKETLER.some((p) => p.id === g("paket")) ? g("paket") : "ucretsiz";
    const ad = g("ad"), telefon = g("telefon");
    const kategoriler = fd.getAll("kategoriler").map(String).filter((k) => KATEGORILER.some((x) => x.slug === k)).slice(0, 5);
    const mahalleler = fd.getAll("mahalleler").map(String).filter((m) => MAHALLELER.includes(m));
    if (ad.length < 2) return NextResponse.json({ error: "Ad soyad veya işletme unvanı zorunludur." }, { status: 400 });
    if (!telGecerli(telefon)) return NextResponse.json({ error: "Geçerli bir cep telefonu girin." }, { status: 400 });
    if (!kategoriler.length) return NextResponse.json({ error: "En az bir uzmanlık alanı seçin." }, { status: 400 });
    if (!mahalleler.length) return NextResponse.json({ error: "Hizmet verdiğiniz en az bir bölgeyi seçin." }, { status: 400 });
    if (g("kvkk") !== "on") return NextResponse.json({ error: "Aydınlatma metnini onaylayın." }, { status: 400 });

    let slug = slugify(ad) || "usta";
    const { data: mevcut } = await supabaseAdmin.from("ustam_ustalar").select("slug").like("slug", `${slug}%`);
    if (mevcut?.some((r) => r.slug === slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const foto = await gorselYukle(fd.get("foto") as File, `usta-${slug}`);
    const galeri: string[] = [];
    for (const f of fd.getAll("galeri").slice(0, 6)) { const u = await gorselYukle(f as File, `is-${slug}`); if (u) galeri.push(u); }

    const { error } = await supabaseAdmin.from("ustam_ustalar").insert([{
      slug, ad: ad.slice(0, 120), telefon: telefon.slice(0, 20), whatsapp: g("whatsapp").slice(0, 20), kategoriler, mahalleler,
      deneyim_yil: Math.max(0, Math.min(60, parseInt(g("deneyim_yil")) || 0)), isyeri: g("isyeri").slice(0, 200),
      hakkinda: g("hakkinda").slice(0, 800), calisma_saatleri: g("calisma_saatleri").slice(0, 120), foto, galeri,
      belge_notu: g("belge_notu").slice(0, 300), durum: "onayli", istenen_paket: istenenPaket,
    }]);
    if (error) { console.error("usta insert:", error); return NextResponse.json({ error: "Kayıt yapılamadı." }, { status: 500 }); }

    // Bildirim üçüncü taraf servisten geçer: kişisel veri (ad, telefon) GÖNDERİLMEZ, ayrıntı yönetim panelinde
    if (istenenPaket !== "ucretsiz") {
      const p = PAKETLER.find((x) => x.id === istenenPaket)!;
      await yoneticiyeBildir(`Serik Ustam: yeni ${p.ad} talebi`, `Bir usta ${p.ad} paketini seçti (${p.fiyat}). Ayrıntılar ve iletişim bilgisi yönetim panelinde.`, "https://www.serikhaberleri.com/admin/ustam");
    }
    return NextResponse.json({ success: true, slug });
  } catch (e) {
    console.error(e); return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("ustam_ustalar").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id, durum, dogrulandi, paket, istenen_paket } = await req.json();
  const alan: Record<string, unknown> = {};
  if (["beklemede", "onayli", "reddedildi"].includes(durum)) alan.durum = durum;
  if (typeof dogrulandi === "boolean") alan.dogrulandi = dogrulandi;
  if (["ucretsiz", "profesyonel", "premium"].includes(paket)) alan.paket = paket;
  if (["ucretsiz", "profesyonel", "premium"].includes(istenen_paket)) alan.istenen_paket = istenen_paket;
  const { error } = await supabaseAdmin.from("ustam_ustalar").update(alan).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("ustam_ustalar").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
