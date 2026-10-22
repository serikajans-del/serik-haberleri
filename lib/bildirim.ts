// Yöneticinin telefonuna anlık bildirim (ntfy.sh — ücretsiz, anahtar gerektirmez).
// Telefona "ntfy" uygulaması kurulur ve NTFY_KONU değişkenindeki konuya abone olunur.
// Konu adı tahmin edilemez olmalı; bilen herkes bildirimleri okuyabilir.

export async function yoneticiyeBildir(baslik: string, mesaj: string, link?: string): Promise<void> {
  const konu = process.env.NTFY_KONU;
  if (!konu) { console.warn("NTFY_KONU tanımlı değil, bildirim gönderilmedi:", baslik); return; }
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(konu)}`, {
      method: "POST",
      body: mesaj,
      headers: {
        // HTTP başlıkları ASCII olmalı; Türkçe başlık RFC 2047 ile kodlanır
        Title: `=?UTF-8?B?${Buffer.from(baslik).toString("base64")}?=`,
        Priority: "high",
        Tags: "moneybag",
        ...(link ? { Click: link } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("bildirim gönderilemedi:", e);
  }
}
