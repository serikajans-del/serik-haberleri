import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { aktifUye } from "@/lib/okur-sunucu/oturum";

// Beğeni / "işime yaradı" aç-kapa. Sayaçlar veritabanı tetikleyicisiyle güncellenir.
export async function POST(req: NextRequest) {
  const uye = await aktifUye();
  if (!uye) return NextResponse.json({ hata: "Giriş yapmalısın." }, { status: 401 });
  const { id, tur } = await req.json().catch(() => ({}));
  const tablo = tur === "faydali" ? "meydan_faydali" : tur === "begeni" ? "meydan_begeniler" : null;
  if (!tablo || !Number.isInteger(id)) return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });

  const { data: p } = await db.from("meydan_paylasimlar").select("id, uye_id, durum").eq("id", id).maybeSingle();
  if (!p || p.durum !== "yayinda") return NextResponse.json({ hata: "Paylaşım bulunamadı." }, { status: 404 });
  if (p.uye_id === uye.id) return NextResponse.json({ hata: "Kendi paylaşımını işaretleyemezsin." }, { status: 400 });

  const { data: var_mi } = await db.from(tablo).select("uye_id").eq("paylasim_id", id).eq("uye_id", uye.id).maybeSingle();
  if (var_mi) await db.from(tablo).delete().eq("paylasim_id", id).eq("uye_id", uye.id);
  else await db.from(tablo).insert([{ paylasim_id: id, uye_id: uye.id }]);

  const { data: s } = await db.from("meydan_paylasimlar").select("begeni_sayisi, faydali_sayisi").eq("id", id).single();
  return NextResponse.json({ ok: true, aktif: !var_mi, sayi: tur === "faydali" ? s?.faydali_sayisi : s?.begeni_sayisi });
}
