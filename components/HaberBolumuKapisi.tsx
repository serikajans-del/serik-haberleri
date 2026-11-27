"use client";
import { usePathname } from "next/navigation";

// Okur ve Ustam bölümlerinin kendi başlık/altlıkları var; haber sitesinin altlığı orada tekrar etmesin.
export const bolumBul = (yol: string | null) =>
  yol?.startsWith("/okur") ? "okur" : yol?.startsWith("/ustam") ? "ustam" : "haber";

export default function HaberBolumuKapisi({ children }: { children: React.ReactNode }) {
  return bolumBul(usePathname()) === "haber" ? <>{children}</> : null;
}
