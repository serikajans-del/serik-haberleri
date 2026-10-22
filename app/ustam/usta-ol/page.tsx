import type { Metadata } from "next";
import { RENK } from "@/lib/ustam";
import BasvuruFormu from "./BasvuruFormu";

export const metadata: Metadata = {
  title: "Usta Olarak Katıl | Serik Ustam",
  description: "Serik, Belek, Kadriye ve Boğazkent'te hizmet veren ustalar: ücretsiz profil oluşturun, bölgenizdeki iş taleplerinden haberdar olun.",
  alternates: { canonical: "https://www.serikhaberleri.com/ustam/usta-ol" },
};

export default async function UstaOlSayfasi({ searchParams }: { searchParams: Promise<{ paket?: string }> }) {
  const { paket = "" } = await searchParams;
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black mb-2" style={{ color: RENK.lacivert }}>Usta Olarak Katıl</h1>
      <p className="text-gray-600 mb-6">Formu doldurun, profiliniz hemen yayına girsin ve bölgenizdeki talepler size iletilsin. Temel profil ücretsizdir.</p>
      <BasvuruFormu ilkPaket={paket} />
    </main>
  );
}
