import { NextResponse } from "next/server";

// TCMB XML'den döviz kurlarını çeker
async function fetchTCMB() {
  const res = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml", {
    next: { revalidate: 3600 }, // 1 saatte bir güncelle
    headers: { "User-Agent": "SerikHaberleri/1.0" },
  });
  if (!res.ok) throw new Error("TCMB fetch failed");
  return res.text();
}

function parseRate(xml: string, code: string): number | null {
  const regex = new RegExp(
    `CurrencyCode="${code}"[\\s\\S]*?<ForexSelling>([0-9.]+)<\\/ForexSelling>`,
    "i"
  );
  const match = xml.match(regex);
  return match ? parseFloat(match[1]) : null;
}

// Gram altın: EUR/USD çaprazı yok, Kapalıçarşı verisi için fallback
async function fetchGoldPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.gold-api.com/price/XAU",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    // Troy ons → gram: ÷ 31.1035
    const usdPerGram = data.price / 31.1035;
    return usdPerGram;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const xml = await fetchTCMB();
    const usd = parseRate(xml, "USD");
    const eur = parseRate(xml, "EUR");
    const gbp = parseRate(xml, "GBP");

    // Gram altın TL = USD/oz ÷ 31.1035 × USD kuru
    let goldTL: number | null = null;
    if (usd) {
      const goldUSD = await fetchGoldPrice();
      if (goldUSD) goldTL = goldUSD * usd;
    }

    const rates = [
      { code: "USD", name: "Dolar", symbol: "$", value: usd?.toFixed(2) ?? null },
      { code: "EUR", name: "Euro", symbol: "€", value: eur?.toFixed(2) ?? null },
      { code: "GBP", name: "Sterlin", symbol: "£", value: gbp?.toFixed(2) ?? null },
      { code: "GOLD", name: "Altın (gr)", symbol: "gr", value: goldTL ? goldTL.toFixed(0) : null },
    ].filter((r) => r.value !== null);

    return NextResponse.json({ rates, updatedAt: new Date().toISOString() });
  } catch {
    // Fallback değerler
    return NextResponse.json({
      rates: [
        { code: "USD", name: "Dolar", symbol: "$", value: "38.45" },
        { code: "EUR", name: "Euro", symbol: "€", value: "41.20" },
        { code: "GBP", name: "Sterlin", symbol: "£", value: "48.90" },
      ],
      updatedAt: null,
      fallback: true,
    });
  }
}
