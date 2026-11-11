import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { aktifUye, istemciIp } from "@/lib/okur-sunucu/oturum";
import { kabaDilVar, kisiselVeriVar, sinirAsildi } from "@/lib/okur-sunucu/denetim";
import { fotoYukle } from "@/lib/okur-sunucu/gorsel";
import { yoneticiyeBildir } from "@/lib/okur-sunucu/bildirim";
import { KATEGORILER, MAHALLELER, SITE_URL, slugify } from "@/lib/okur";

// Yeni paylaşım. Güvenilir üyeninki doğrudan yayına girer; diğerleri moderatör onayına düşer.
export async function POST(req: NextRequest) {
  const uye = await aktifUye();
  if (!uye) return NextResponse.json({ hata: "Paylaşım yapmak için giriş yapmalısın." }, { status: 401 });

  const fd = await req.formData();
  const g = (k: string) => (fd.get(k) ?? "").toString().trim();
  const kategori = g("kategori");
  const baslik = g("baslik").replace(/\s+/g, " ");
  const icerik = g("icerik");
  const mahalle = MAHALLELER.includes(g("mahalle")) ? g("mahalle") : "";
  const tarih = /^\d{4}-\d{2}-\d{2}$/.test(g("olay_tarihi")) ? g("olay_tarihi") : null;
  const saat = /^\d{2}:\d{2}$/.test(g("olay_saati")) ? g("olay_saati") : "";

  if (!KATEGORILER.some((k) => k.slug === kategori)) return NextResponse.json({ hata: "Bir konu türü seç." }, { status: 400 });
  if (baslik.length < 8 || baslik.length > 110) return NextResponse.json({ hata: "Başlık 8-110 karakter olmalı." }, { status: 400 });
  if (icerik.length < 20 || icerik.length > 5000) return NextResponse.json({ hata: "Açıklama en az 20 karakter olmalı." }, { status: 400 });
  if (!mahalle) return NextResponse.json({ hata: "Mahalle seç." }, { status: 400 });
  if (await sinirAsildi("meydan_paylasimlar", "uye_id", uye.id, 60, 5)) {
    return NextResponse.json({ hata: "Bir saatte en fazla 5 paylaşım yapabilirsin." }, { status: 429 });
  }

  let slug = slugify(baslik) || "paylasim";
  const { data: ayni } = await db.from("meydan_paylasimlar").select("id").eq("slug", slug).maybeSingle();
  if (ayni) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const fotolar: string[] = [];
  for (const f of fd.getAll("fotolar").slice(0, 4)) {
    const url = await fotoYukle(f as File, `p-${uye.id}`);
    if (url) fotolar.push(url);
  }

  const metin = `${baslik} ${icerik} ${g("isletme_adi")} ${g("yer")}`;
  const supheli = kabaDilVar(metin) || kisiselVeriVar(metin);
  const yayinda = uye.guvenilir && !supheli;

  const { data, error } = await db.from("meydan_paylasimlar").insert([{
    slug, uye_id: uye.id, kategori, baslik, icerik, fotolar, mahalle,
    yer: g("yer").slice(0, 140), olay_tarihi: tarih, olay_saati: saat, isletme_adi: g("isletme_adi").slice(0, 100),
    durum: yayinda ? "yayinda" : "beklemede", yayin_at: yayinda ? new Date().toISOString() : null, ip: await istemciIp(),
  }]).select("slug").single();
  if (error || !data) return NextResponse.json({ hata: "Paylaşım kaydedilemedi, tekrar dene." }, { status: 500 });

  if (!yayinda) await yoneticiyeBildir("Okur Haberleri: onay bekleyen paylaşım", "Yeni bir paylaşım onay bekliyor.", `${SITE_URL}/admin/okur`);
  return NextResponse.json({ ok: true, slug: data.slug, yayinda });
}
