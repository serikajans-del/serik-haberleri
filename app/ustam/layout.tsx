import Link from "next/link";
import { RENK } from "@/lib/ustam";

// SERİK USTAM alt markası: sitenin genel başlığının altında kendi lacivert şeridi ve menüsü.
export default function UstamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: RENK.zemin }} className="min-h-screen">
      <div style={{ backgroundColor: RENK.lacivert }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/ustam" className="flex items-center gap-2" aria-label="Serik Ustam ana sayfa">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white" style={{ backgroundColor: RENK.turkuaz }}>S</span>
            <span className="font-black text-white tracking-tight text-lg">SERİK <span style={{ color: RENK.turuncu }}>USTAM</span></span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/ustam/paketler" className="hidden sm:inline text-white/80 hover:text-white px-2">Paketler</Link>
            <Link href="/ustam/usta-ol" className="font-bold px-3 py-1.5 rounded-lg border border-white/30 text-white hover:bg-white/10">Usta Ol</Link>
            <Link href="/ustam/talep" className="font-bold px-3 py-1.5 rounded-lg text-white" style={{ backgroundColor: RENK.turuncu }}>Teklif Al</Link>
          </nav>
        </div>
      </div>
      {children}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-gray-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <span><b style={{ color: RENK.lacivert }}>SERİK USTAM</b> · Serik&apos;in Ustası, Bir Tık Uzağında! · Bir Serik Haberleri hizmetidir.</span>
          <span className="flex gap-3">
            <Link href="/kvkk" className="hover:underline">KVKK</Link>
            <Link href="/gizlilik-politikasi" className="hover:underline">Gizlilik</Link>
            <Link href="/iletisim" className="hover:underline">İletişim</Link>
          </span>
        </div>
      </div>
    </div>
  );
}
