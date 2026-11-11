import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Ust from "@/components/okur/Ust";
import Alt from "@/components/okur/Alt";
import MobilMenu from "@/components/okur/MobilMenu";

// OKUR HABERLERİ: Serikliler şikâyet, istek, tavsiye ve şehirde gördüklerini paylaşır.
// Okur içeriği haber site haritasına (news-sitemap) girmez; yalnız normal site haritasına, yeterli içerikli olanlar girer.
const baslik = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-baslik", weight: ["600", "700", "800"] });
const govde = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-govde" });

export const metadata: Metadata = {
  title: { default: "Okur Haberleri: Serikliler anlatıyor", template: "%s | Okur Haberleri · Serik Haberleri" },
  description: "Serik Haberleri okur bölümü: Seriklilerin paylaştığı şikâyet, istek, işletme tavsiyesi, yol durumu, kayıp ilanı ve etkinlikler.",
  alternates: { canonical: "/okur" },
};

export default function OkurLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`okur ${baslik.variable} ${govde.variable} pb-20 md:pb-0`}>
      <Ust />
      {children}
      <Alt />
      <MobilMenu />
    </div>
  );
}
