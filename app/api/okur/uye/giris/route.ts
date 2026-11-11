import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { istemciIp, oturumAc, sifreDogru } from "@/lib/okur-sunucu/oturum";
import { sinirAsildi } from "@/lib/okur-sunucu/denetim";

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const rumuz = String(b.rumuz ?? "").trim().toLocaleLowerCase("tr-TR");
  const sifre = String(b.sifre ?? "");
  const ip = await istemciIp();

  // Kaba kuvvet denemesine karşı: aynı IP'den 15 dakikada en fazla 20 oturum açma
  if (ip && await sinirAsildi("meydan_oturumlar", "ip", ip, 15, 20)) {
    return NextResponse.json({ hata: "Çok fazla deneme yapıldı. Biraz sonra tekrar dene." }, { status: 429 });
  }

  const { data: uye } = await db.from("meydan_uyeler").select("id, sifre_hash, engelli").eq("rumuz_kucuk", rumuz).maybeSingle();
  if (!uye || !(await sifreDogru(sifre, uye.sifre_hash))) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ hata: "Rumuz veya şifre hatalı." }, { status: 401 });
  }
  if (uye.engelli) return NextResponse.json({ hata: "Bu hesap kurallara aykırılık nedeniyle kapatıldı." }, { status: 403 });

  await oturumAc(uye.id);
  return NextResponse.json({ ok: true });
}
