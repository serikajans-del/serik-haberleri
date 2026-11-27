import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { imza, imzaDogru, paylasimDurumu, type Karar } from "@/lib/okur-sunucu/onay";

// Telefondan giriş yapmadan onay/ret. Bağlantı yalnız tek paylaşım + tek karar için imzalıdır.
// ntfy "Onayla/Reddet" düğmesi doğrudan POST atar; onay sayfasındaki form da buraya gelir.
export async function POST(req: NextRequest) {
  const u = req.nextUrl.searchParams;
  let id = Number(u.get("id")), karar = u.get("karar") as Karar, t = u.get("t") ?? "";
  const form = (req.headers.get("content-type") ?? "").includes("form");
  if (form) {
    const fd = await req.formData();
    id = Number(fd.get("id")); karar = fd.get("karar") as Karar; t = String(fd.get("t") ?? "");
  }
  if (!id || (karar !== "yayinda" && karar !== "reddedildi") || !imzaDogru(id, karar, t)) {
    return NextResponse.json({ hata: "Geçersiz ya da süresi geçmiş bağlantı." }, { status: 403 });
  }
  const { data: p } = await db.from("meydan_paylasimlar").select("id, slug, durum").eq("id", id).maybeSingle();
  if (!p) return NextResponse.json({ hata: "Paylaşım bulunamadı." }, { status: 404 });

  // Yalnız bekleyen paylaşım telefondan değiştirilir; yayındakini kaldırmak için yönetim paneli kullanılır
  const sonuc = p.durum === "beklemede" ? karar : `zaten-${p.durum}`;
  if (p.durum === "beklemede") await paylasimDurumu(id, { durum: karar });

  if (form) {
    const geri = new URL(`/admin/okur/onay?id=${id}&t=${imza(id, "gor")}&sonuc=${sonuc}`, req.url);
    return NextResponse.redirect(geri, 303);
  }
  return NextResponse.json({ ok: true, sonuc, slug: p.slug });
}
