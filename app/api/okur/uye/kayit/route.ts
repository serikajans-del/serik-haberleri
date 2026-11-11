import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { istemciIp, oturumAc, sifreOzetle } from "@/lib/okur-sunucu/oturum";
import { kabaDilVar, sinirAsildi } from "@/lib/okur-sunucu/denetim";
import { CINSIYET, MAHALLELER, rumuzGecerli } from "@/lib/okur";

const YASAK_RUMUZ = ["admin", "yonetici", "yönetici", "moderator", "serikmeydan", "serikhaberleri", "belediye", "valilik", "kaymakamlik"];

export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => ({}));
  const rumuz = String(b.rumuz ?? "").trim();
  const sifre = String(b.sifre ?? "");
  const cinsiyet = Object.keys(CINSIYET).includes(b.cinsiyet) ? b.cinsiyet : "belirtilmedi";
  const mahalle = MAHALLELER.includes(b.mahalle) ? b.mahalle : "";
  if (b.web) return NextResponse.json({ ok: true }); // bot tuzağı

  if (!rumuzGecerli(rumuz)) return NextResponse.json({ hata: "Rumuz 3-20 karakter olmalı; harf, rakam, nokta ve alt çizgi kullanılabilir." }, { status: 400 });
  const kucuk = rumuz.toLocaleLowerCase("tr-TR");
  if (kabaDilVar(rumuz) || YASAK_RUMUZ.some((y) => kucuk.includes(y))) return NextResponse.json({ hata: "Bu rumuz kullanılamaz, başka bir rumuz seç." }, { status: 400 });
  if (sifre.length < 8) return NextResponse.json({ hata: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  if (b.kvkk !== true) return NextResponse.json({ hata: "Kuralları ve aydınlatma metnini onaylaman gerekiyor." }, { status: 400 });

  const ip = await istemciIp();
  if (ip && await sinirAsildi("meydan_uyeler", "kayit_ip", ip, 24 * 60, 3)) {
    return NextResponse.json({ hata: "Bu bağlantıdan bugün çok fazla hesap açıldı. Yarın tekrar dene." }, { status: 429 });
  }

  const { data: var_mi } = await db.from("meydan_uyeler").select("id").eq("rumuz_kucuk", kucuk).maybeSingle();
  if (var_mi) return NextResponse.json({ hata: "Bu rumuz alınmış, başka bir rumuz dene." }, { status: 409 });

  const { data, error } = await db.from("meydan_uyeler").insert([{
    rumuz, rumuz_kucuk: kucuk, sifre_hash: await sifreOzetle(sifre), cinsiyet, mahalle, kayit_ip: ip,
  }]).select("id").single();
  if (error || !data) return NextResponse.json({ hata: "Kayıt yapılamadı, lütfen tekrar dene." }, { status: 500 });

  await oturumAc(data.id);
  return NextResponse.json({ ok: true });
}
