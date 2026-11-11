import "server-only";

// Yöneticinin telefonuna anlık bildirim (ntfy.sh). Kişisel veri GÖNDERİLMEZ; ayrıntı yönetim panelinde.
export async function yoneticiyeBildir(baslik: string, mesaj: string, link?: string): Promise<void> {
  const konu = process.env.NTFY_KONU;
  if (!konu) return;
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(konu)}`, {
      method: "POST",
      body: mesaj,
      headers: {
        Title: `=?UTF-8?B?${Buffer.from(baslik).toString("base64")}?=`,
        Tags: "speech_balloon",
        ...(link ? { Click: link } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // bildirim gitmezse paylaşım yine kaydedilir
  }
}
