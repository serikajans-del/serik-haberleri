import { NextResponse } from "next/server";

import { WMO_CODES } from "@/lib/hava";

// Open-Meteo — ücretsiz, API key gerektirmez. Serik koordinatları: lat=36.92, lon=31.10
export async function GET() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=36.92&longitude=31.10&current=temperature_2m,weathercode&timezone=Europe%2FIstanbul",
      { next: { revalidate: 1800 } } // 30 dakikada bir güncelle
    );
    if (!res.ok) throw new Error("Open-Meteo fetch failed");
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    const code = data.current.weathercode as number;
    const weather = WMO_CODES[code] ?? { desc: "Hava bilgisi yok", icon: "🌡️" };

    return NextResponse.json({ temp, desc: weather.desc, icon: weather.icon });
  } catch {
    return NextResponse.json({ temp: null, desc: null, icon: null }, { status: 500 });
  }
}
