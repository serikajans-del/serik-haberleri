import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.serikhaberleri.com";

export const metadata: Metadata = {
  title: "Şikayet & İhbar Formu — Serik'ten Bildir",
  description:
    "Serik'te yaşanan sorunları, ihbarları ve şikayetlerinizi fotoğraflarıyla birlikte bildirin. Serik Haberleri editörleri inceleyecektir.",
  keywords: [
    "Serik şikayet",
    "Serik ihbar",
    "Serik sorun bildir",
    "Antalya Serik şikayet",
    "Serik haber ihbar",
  ],
  openGraph: {
    title: "Şikayet & İhbar Formu | Serik Haberleri",
    description: "Serik'te yaşanan sorunları bildirin. Fotoğraflı şikayet ve ihbar formu.",
    url: `${SITE_URL}/sikayet`,
  },
  alternates: { canonical: `${SITE_URL}/sikayet` },
};

export default function SikayetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
