import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { aktifUye, istemciIp } from "@/lib/okur-sunucu/oturum";
import { kabaDilVar, kisiselVeriVar, sinirAsildi } from "@/lib/okur-sunucu/denetim";

export async function POST(req: NextRequest) {
  const uye = await aktifUye();
  if (!uye) return NextResponse.json({ hata: "Yorum yazmak için giriş yapmalısın." }, { status: 401 });
  const { id, icerik } = await req.json().catch(() => ({}));
  const metin = String(icerik ?? "").trim();
  if (!Number.isInteger(id)) return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
  if (metin.length < 2 || metin.length > 1500) return NextResponse.json({ hata: "Yorum 2-1500 karakter olmalı." }, { status: 400 });
  if (await sinirAsildi("meydan_yorumlar", "uye_id", uye.id, 10, 10)) return NextResponse.json({ hata: "Çok hızlı yorum yazıyorsun, biraz bekle." }, { status: 429 });

  const { data: p } = await db.from("meydan_paylasimlar").select("id, durum").eq("id", id).maybeSingle();
  if (!p || p.durum !== "yayinda") return NextResponse.json({ hata: "Paylaşım bulunamadı." }, { status: 404 });

  // Kaba dil veya kişisel veri içeren yorum onaya düşer
  const durum = kabaDilVar(metin) || kisiselVeriVar(metin) ? "beklemede" : "yayinda";
  const { data, error } = await db.from("meydan_yorumlar").insert([{ paylasim_id: id, uye_id: uye.id, icerik: metin, durum, ip: await istemciIp() }])
    .select("id, icerik, created_at, durum").single();
  if (error || !data) return NextResponse.json({ hata: "Yorum kaydedilemedi." }, { status: 500 });
  return NextResponse.json({ ok: true, yorum: { ...data, uye: { rumuz: uye.rumuz, cinsiyet: uye.cinsiyet } } });
}
