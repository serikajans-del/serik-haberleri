import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  try {
    const { baslik, ozet, kategori } = await req.json();
    if (!baslik) return NextResponse.json({ error: "Başlık gerekli" }, { status: 400 });

    // Claude yoksa basit format kullan
    if (!anthropic) {
      const basitTweet = formatBasitTweet(baslik, ozet, kategori);
      return NextResponse.json({ tweet: basitTweet });
    }

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `Aşağıdaki Türkçe haberi viral olacak, dikkat çekici bir tweet'e dönüştür.

HABER BAŞLIĞI: ${baslik}
ÖZET: ${ozet || ""}
KATEGORİ: ${kategori || "Gündem"}

KURALLAR:
- Maksimum 240 karakter (link için 40 karakter bırak)
- Emoji kullan (2-3 tane, konuya uygun)
- Merak uyandırsın, tıklatmak istesin
- İlk cümle çarpıcı olsun
- 2-3 ilgili Türkçe hashtag ekle (# ile)
- Sadece tweet metnini yaz, başka hiçbir şey ekleme`,
      }],
    });

    const tweet = response.content[0].text.trim();
    return NextResponse.json({ tweet });

  } catch (err: unknown) {
    // Claude kredisi bitmişse basit format
    const body = await req.json().catch(() => ({})) as { baslik?: string; ozet?: string; kategori?: string };
    const basitTweet = formatBasitTweet(body.baslik || "", body.ozet || "", body.kategori || "");
    return NextResponse.json({ tweet: basitTweet, fallback: true });
  }
}

function formatBasitTweet(baslik: string, ozet: string, kategori: string): string {
  const emojiler: Record<string, string> = {
    gundem: "🔴", antalya: "🌊", asayis: "🚨", ekonomi: "💰",
    spor: "⚽", saglik: "🏥", egitim: "📚", yasam: "🌿", turizm: "✈️",
  };
  const emoji = emojiler[kategori] || "📰";
  const etiket = `#${kategori.charAt(0).toUpperCase() + kategori.slice(1)} #Türkiye #SonDakika`;
  const metin = ozet && ozet.length > 20 ? ozet.slice(0, 120) : baslik.slice(0, 120);
  return `${emoji} ${metin}\n\n${etiket}`;
}
