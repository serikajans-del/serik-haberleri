import "server-only";
import type { NextRequest } from "next/server";
import { db } from "./db";

// Kaba dil süzgeci: eşleşen içerik yayına girmez, onaya düşer (kesin karar moderatörde).
const KOKLER = [
  "amk", "aq", "orospu", "oruspu", "piç", "pic", "siktir", "sikerim", "sikeyim", "sikik", "yarrak", "yarak", "amcık", "amcik",
  "götveren", "gotveren", "ibne", "pezevenk", "kahpe", "şerefsiz", "serefsiz", "gavat", "kaltak", "yavşak", "yavsak", "dallama", "ananı", "anani",
];
const kucuk = (s: string) => s.toLocaleLowerCase("tr-TR");

export function kabaDilVar(metin: string): boolean {
  const kelimeler = kucuk(metin).split(/[^a-zçğıöşü0-9]+/i);
  return kelimeler.some((k) => KOKLER.some((kok) => k === kok || (kok.length > 4 && k.startsWith(kok))));
}

// Telefon numarası veya e-posta içeren metin kişisel veri olabilir: onaya düşer
export function kisiselVeriVar(metin: string): boolean {
  return /(\+?90|0)?\s*5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/.test(metin) || /[\w.+-]+@[\w-]+\.[\w.]+/.test(metin);
}

export function isAdmin(req: NextRequest): boolean {
  const beklenen = (process.env.ADMIN_PASSWORD ?? "").trim();
  return beklenen.length > 0 && (req.headers.get("x-admin-password") ?? "").trim() === beklenen;
}

// Basit hız sınırı: aynı üyenin son X dakikadaki kayıt sayısı
export async function sinirAsildi(tablo: string, alan: string, deger: string | number, dakika: number, en_fazla: number): Promise<boolean> {
  const { count } = await db.from(tablo).select("*", { count: "exact", head: true })
    .eq(alan, deger).gte("created_at", new Date(Date.now() - dakika * 60000).toISOString());
  return (count ?? 0) >= en_fazla;
}
