import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { aktifUye, istemciIp } from "@/lib/okur-sunucu/oturum";
import { yoneticiyeBildir } from "@/lib/okur-sunucu/bildirim";
import { BILDIR_NEDENLERI, SITE_URL } from "@/lib/okur";

// Uygunsuz içerik bildirimi: giriş gerekmez (5651: hak sahibi üye olmayabilir). Aynı içerik 3 farklı bildirim alırsa geçici olarak yayından iner.
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const paylasim_id = Number.isInteger(b.paylasim_id) ? b.paylasim_id : null;
  const yorum_id = Number.isInteger(b.yorum_id) ? b.yorum_id : null;
  if (!paylasim_id && !yorum_id) return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
  if (!BILDIR_NEDENLERI.includes(b.neden)) return NextResponse.json({ hata: "Bir neden seç." }, { status: 400 });

  const uye = await aktifUye();
  const ip = await istemciIp();
  await db.from("meydan_bildirimler").insert([{ paylasim_id, yorum_id, uye_id: uye?.id ?? null, neden: b.neden, aciklama: String(b.aciklama ?? "").slice(0, 600), ip }]);

  const alan = yorum_id ? "yorum_id" : "paylasim_id";
  const deger = yorum_id ?? paylasim_id;
  const { data: tum } = await db.from("meydan_bildirimler").select("ip").eq(alan, deger).eq("durum", "yeni");
  const farkli = new Set((tum ?? []).map((r) => r.ip)).size;
  if (farkli >= 3) {
    if (yorum_id) await db.from("meydan_yorumlar").update({ durum: "beklemede" }).eq("id", yorum_id);
    else await db.from("meydan_paylasimlar").update({ durum: "beklemede" }).eq("id", paylasim_id);
  }
  await yoneticiyeBildir("Okur Haberleri: içerik bildirimi", `Bir ${yorum_id ? "yorum" : "paylaşım"} bildirildi: ${b.neden}`, `${SITE_URL}/admin/okur`);
  return NextResponse.json({ ok: true });
}
