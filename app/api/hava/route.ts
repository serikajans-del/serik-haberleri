import { NextResponse } from "next/server";

// Open-Meteo — ücretsiz, API key gerektirmez
// Serik koordinatları: lat=36.92, lon=31.10
const WMO_CODES: Record<number, { desc: string; icon: string }> = {
  0:  { desc: "Açık", icon: "☀️" },
  1:  { desc: "Az bulutlu", icon: "🌤️" },
  2:  { desc: "Parçalı bulutlu", icon: "⛅" },
  3:  { desc: "Bulutlu", icon: "☁️" },
  45: { desc: "Sisli", icon: "🌫️" },
  48: { desc: "Dondurucu sis", icon: "🌫️" },
  51: { desc: "Hafif çisenti", icon: "🌦️" },
  53: { desc: "Çisenti", icon: "🌦️" },
  55: { desc: "Yoğun çisenti", icon: "🌧️" },
  61: { desc: "Hafif yağmur", icon: "🌦️" },
  63: { desc: "Yağmur", icon: "🌧️" },
  65: { desc: "Şiddetli yağmur", icon: "🌧️" },
  71: { desc: "Hafif kar", icon: "🌨️" },
  73: { desc: "Kar", icon: "❄️" },
  75: { desc: "Yoğun kar", icon: "❄️" },
  80: { desc: "Sağanak", icon: "🌦️" },
  81: { desc: "Sağanak", icon: "🌧️" },
  82: { desc: "Şiddetli sağanak", icon: "⛈️" },
  95: { desc: "Fırtınalı", icon: "⛈️" },
  96: { desc: "Fırtına + dolu", icon: "⛈️" },
  99: { desc: "Şiddetli fırtına", icon: "⛈️" },
};

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
