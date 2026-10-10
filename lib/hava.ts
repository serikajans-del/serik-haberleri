// Hava durumu verisi — Open-Meteo (ücretsiz, API anahtarı gerektirmez). Veri 30 dakikada bir yenilenir.
// Sayfada gösterilen her değer buradan gelir; veri alınamazsa null döner ve sayfa "veri alınamadı" der (elle yazılmış tahmin yok).

export const WMO_CODES: Record<number, { desc: string; icon: string }> = {
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
  95: { desc: "Gök gürültülü sağanak", icon: "⛈️" },
  96: { desc: "Gök gürültülü sağanak, dolu", icon: "⛈️" },
  99: { desc: "Şiddetli fırtına, dolu", icon: "⛈️" },
};

export const kod = (c: number) => WMO_CODES[c] ?? { desc: "Bilgi yok", icon: "🌡️" };

const YENILE = { next: { revalidate: 1800 } };
const TZ = "timezone=Europe%2FIstanbul";

// Serik ilçesindeki yerleşimler (yaklaşık koordinatlar)
export const BOLGELER = [
  { name: "Serik Merkez", lat: 36.92, lon: 31.1 },
  { name: "Belek", lat: 36.86, lon: 31.06 },
  { name: "Kadriye", lat: 36.87, lon: 31.11 },
  { name: "Boğazkent", lat: 36.85, lon: 31.16 },
  { name: "Gebiz", lat: 37.11, lon: 30.96 },
];

export type Gun = { tarih: string; gunAdi: string; icon: string; desc: string; high: number; low: number; wind: number; yagisOlasiligi: number | null };
export type HavaDurumu = {
  simdi: { temp: number; icon: string; desc: string; wind: number; humidity: number };
  gunler: Gun[];
  bolgeler: { name: string; temp: number; icon: string }[];
  denizSuyu: number | null;
  guncelleme: string;
};

const gunAdi = (iso: string, i: number) =>
  i === 0 ? "Bugün" : i === 1 ? "Yarın" : new Date(iso + "T12:00:00+03:00").toLocaleDateString("tr-TR", { weekday: "long", timeZone: "Europe/Istanbul" });

export async function getHavaDurumu(): Promise<HavaDurumu | null> {
  try {
    const [tahminRes, bolgeRes, denizRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=36.92&longitude=31.10&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,wind_speed_10m_max,precipitation_probability_max&forecast_days=7&${TZ}`, YENILE),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${BOLGELER.map((b) => b.lat).join(",")}&longitude=${BOLGELER.map((b) => b.lon).join(",")}&current=temperature_2m,weathercode&${TZ}`, YENILE),
      fetch(`https://marine-api.open-meteo.com/v1/marine?latitude=36.84&longitude=31.06&current=sea_surface_temperature&${TZ}`, YENILE).catch(() => null),
    ]);
    if (!tahminRes.ok || !bolgeRes.ok) return null;
    const t = await tahminRes.json();
    const b = await bolgeRes.json();
    const d = denizRes && denizRes.ok ? await denizRes.json() : null;

    const gunler: Gun[] = t.daily.time.map((tarih: string, i: number) => ({
      tarih,
      gunAdi: gunAdi(tarih, i),
      ...kod(t.daily.weathercode[i]),
      high: Math.round(t.daily.temperature_2m_max[i]),
      low: Math.round(t.daily.temperature_2m_min[i]),
      wind: Math.round(t.daily.wind_speed_10m_max[i]),
      yagisOlasiligi: t.daily.precipitation_probability_max?.[i] ?? null,
    }));
    const liste = Array.isArray(b) ? b : [b];
    const deniz = d?.current?.sea_surface_temperature;
    return {
      simdi: {
        temp: Math.round(t.current.temperature_2m),
        ...kod(t.current.weathercode),
        wind: Math.round(t.current.wind_speed_10m),
        humidity: Math.round(t.current.relative_humidity_2m),
      },
      gunler,
      bolgeler: BOLGELER.map((yer, i) => ({ name: yer.name, temp: Math.round(liste[i].current.temperature_2m), icon: kod(liste[i].current.weathercode).icon })),
      denizSuyu: typeof deniz === "number" ? Math.round(deniz) : null,
      guncelleme: new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }),
    };
  } catch {
    return null;
  }
}
