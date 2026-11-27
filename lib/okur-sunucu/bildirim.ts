import "server-only";
import { kategoriBul } from "@/lib/okur";
import { onayLinki } from "@/lib/okur-sunucu/onay";

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

// Yeni paylaşım: telefonda "İncele / Onayla / Reddet" düğmeli bildirim.
// Paylaşımın metni ntfy'ye GİTMEZ (üçüncü taraf sunucu); yalnız tür, mahalle ve foto sayısı.
// "İncele" kendi sitemizdeki imzalı onay sayfasını açar; "Onayla/Reddet" uygulama açılmadan çalışır.
export async function onayBildirimi(p: { id: number; kategori: string; mahalle: string; foto: number; supheli: boolean }): Promise<void> {
  const konu = process.env.NTFY_KONU;
  if (!konu) return;
  const k = kategoriBul(p.kategori);
  const satir = [`${k?.ikon ?? ""} ${k?.ad ?? p.kategori} · ${p.mahalle}`.trim()];
  if (p.foto) satir.push(`📷 ${p.foto} fotoğraf`);
  if (p.supheli) satir.push("⚠️ Otomatik denetim: küfür ya da kişisel bilgi olabilir, önce incele.");
  try {
    await fetch("https://ntfy.sh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: konu,
        title: "Yeni okur paylaşımı onay bekliyor",
        message: satir.join("\n"),
        tags: [p.supheli ? "warning" : "speech_balloon"],
        priority: p.supheli ? 4 : 3,
        click: onayLinki(p.id, "gor"),
        actions: [
          { action: "view", label: "İncele", url: onayLinki(p.id, "gor") },
          { action: "http", label: "Onayla", url: onayLinki(p.id, "yayinda"), method: "POST", clear: true },
          { action: "http", label: "Reddet", url: onayLinki(p.id, "reddedildi"), method: "POST", clear: true },
        ],
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // bildirim gitmezse paylaşım yönetim panelinde bekler
  }
}
