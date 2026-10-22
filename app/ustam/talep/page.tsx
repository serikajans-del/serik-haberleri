import type { Metadata } from "next";
import { kategoriBul } from "@/lib/ustam";
import TalepFormu from "./TalepFormu";

export const metadata: Metadata = {
  title: "Ücretsiz Teklif Al | Serik Ustam",
  description: "İhtiyacınızı birkaç adımda anlatın, Serik'teki uygun ustalardan ücretsiz teklif alın.",
  alternates: { canonical: "https://www.serikhaberleri.com/ustam/talep" },
};

export default async function TalepSayfasi({ searchParams }: { searchParams: Promise<{ kategori?: string; bolge?: string; usta?: string }> }) {
  const { kategori = "", bolge = "", usta = "" } = await searchParams;
  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="sr-only">Ücretsiz teklif al</h1>
      <TalepFormu ilkKategori={kategoriBul(kategori) ? kategori : ""} ilkBolge={bolge} usta={usta} />
    </main>
  );
}
