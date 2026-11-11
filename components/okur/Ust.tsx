import Link from "next/link";
import Logo from "./Logo";
import UyeMenusu from "./UyeMenusu";
import { aktifUye } from "@/lib/okur-sunucu/oturum";

const MENU = [
  { ad: "Akış", href: "/okur" },
  { ad: "Şikâyetler", href: "/okur/kategori/sikayet" },
  { ad: "Yol ve Altyapı", href: "/okur/kategori/yol-altyapi" },
  { ad: "Tavsiyeler", href: "/okur/kategori/tavsiye" },
  { ad: "Arıyorum", href: "/okur/kategori/ariyorum" },
  { ad: "Ayın Liderleri", href: "/okur/liderler" },
];

export default async function Ust() {
  const uye = await aktifUye();
  return (
    <div className="relative z-30 bg-white border-b border-cizgi">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/okur" aria-label="Okur Haberleri ana sayfa" className="shrink-0"><Logo /></Link>

        <form action="/okur/ara" className="hidden md:flex flex-1 max-w-md mx-auto">
          <label className="relative w-full">
            <span className="sr-only">Okur paylaşımlarında ara</span>
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soluk" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input name="q" placeholder="Serik'te ne arıyorsun? (örn. veteriner, su kesintisi)" className="w-full rounded-full bg-zemin border border-transparent focus:border-ana focus:bg-white outline-none pl-10 pr-4 py-2.5 text-sm transition" />
          </label>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/okur/paylas" className="hidden md:inline-flex dugme-ana !py-2.5 !px-4 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
            Paylaş
          </Link>
          {uye ? <UyeMenusu rumuz={uye.rumuz} /> : (
            <Link href="/okur/giris" className="dugme-ikincil !py-2.5 !px-4 text-sm">Giriş yap</Link>
          )}
        </div>
      </div>
      <nav className="hidden md:block border-t border-cizgi/70">
        <div className="max-w-6xl mx-auto px-4 flex gap-1 overflow-x-auto kaydir-gizli">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-ana whitespace-nowrap">{m.ad}</Link>
          ))}
          <Link href="/okur/kurallar" className="ml-auto px-3 py-2.5 text-sm font-semibold text-slate-500 hover:text-ana whitespace-nowrap">Okur Kuralları</Link>
        </div>
      </nav>
    </div>
  );
}
