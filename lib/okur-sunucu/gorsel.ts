import "server-only";
import sharp from "sharp";
import { db } from "./db";

// Fotoğraf: en fazla 1600 px, WebP. sharp varsayılanda EXIF/GPS bilgisini atar (konum sızmaz); yön bilgisi önce uygulanır.
export async function fotoYukle(dosya: File, onEk: string): Promise<string> {
  if (!dosya || typeof dosya === "string" || dosya.size === 0 || dosya.size > 10 * 1024 * 1024) return "";
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(dosya.type)) return "";
  let cikti: Buffer;
  try {
    cikti = await sharp(Buffer.from(await dosya.arrayBuffer()))
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return "";
  }
  const yol = `${onEk}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { error } = await db.storage.from("meydan-gorseller").upload(yol, cikti, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) return "";
  return db.storage.from("meydan-gorseller").getPublicUrl(yol).data.publicUrl;
}
