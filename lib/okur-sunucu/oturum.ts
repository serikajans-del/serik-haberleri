import "server-only";
import { cookies, headers } from "next/headers";
import { randomBytes, scrypt as _scrypt, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "./db";

const scrypt = promisify(_scrypt) as (s: string, salt: Buffer, n: number) => Promise<Buffer>;
export const CEREZ = "okur_oturum";
const SURE_GUN = 60;

export type Uye = { id: number; rumuz: string; cinsiyet: string; mahalle: string; guvenilir: boolean; engelli: boolean; created_at: string };

export async function sifreOzetle(sifre: string): Promise<string> {
  const tuz = randomBytes(16);
  const ozet = await scrypt(sifre, tuz, 64);
  return `scrypt$${tuz.toString("hex")}$${ozet.toString("hex")}`;
}

export async function sifreDogru(sifre: string, kayit: string): Promise<boolean> {
  const [tur, tuzHex, ozetHex] = kayit.split("$");
  if (tur !== "scrypt" || !tuzHex || !ozetHex) return false;
  const beklenen = Buffer.from(ozetHex, "hex");
  const ozet = await scrypt(sifre, Buffer.from(tuzHex, "hex"), beklenen.length);
  return ozet.length === beklenen.length && timingSafeEqual(ozet, beklenen);
}

const tokenOzet = (t: string) => createHash("sha256").update(t).digest("hex");

export async function istemciIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim().slice(0, 64);
}

// Yalnız Route Handler / Server Function içinde çağrılır (çerez yazar)
export async function oturumAc(uyeId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const bitis = new Date(Date.now() + SURE_GUN * 86400 * 1000);
  await db.from("meydan_oturumlar").insert([{ token_hash: tokenOzet(token), uye_id: uyeId, ip: await istemciIp(), bitis: bitis.toISOString() }]);
  (await cookies()).set(CEREZ, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: bitis,
  });
}

export async function oturumKapat(): Promise<void> {
  const c = await cookies();
  const token = c.get(CEREZ)?.value;
  if (token) await db.from("meydan_oturumlar").delete().eq("token_hash", tokenOzet(token));
  c.delete(CEREZ);
}

// Oturumdaki üyeyi döndürür (yoksa null). Sayfalarda ve API'de kullanılır.
export async function aktifUye(): Promise<Uye | null> {
  const token = (await cookies()).get(CEREZ)?.value;
  if (!token) return null;
  const { data } = await db.from("meydan_oturumlar")
    .select("bitis, uye:meydan_uyeler(id, rumuz, cinsiyet, mahalle, guvenilir, engelli, created_at)")
    .eq("token_hash", tokenOzet(token)).maybeSingle();
  if (!data || new Date(data.bitis) < new Date()) return null;
  const uye = (Array.isArray(data.uye) ? data.uye[0] : data.uye) as Uye | undefined;
  if (!uye || uye.engelli) return null;
  return uye;
}
