import Link from "next/link";

// Telefonda uygulama hissi: altta sabit gezinme çubuğu, ortada büyük "Paylaş" düğmesi
const ikon = {
  ev: <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />,
  ara: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  kupa: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></>,
  kisi: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
};

function Oge({ href, ad, i }: { href: string; ad: string; i: keyof typeof ikon }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-slate-500 hover:text-ana py-1.5">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ikon[i]}</svg>
      {ad}
    </Link>
  );
}

export default function MobilMenu() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-cizgi pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 items-end px-2">
        <Oge href="/okur" ad="Akış" i="ev" />
        <Oge href="/okur/ara" ad="Ara" i="ara" />
        <Link href="/okur/paylas" className="flex flex-col items-center -mt-5" aria-label="Paylaş">
          <span className="w-14 h-14 rounded-2xl bg-ana text-white grid place-items-center shadow-lg shadow-ana/30">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <span className="text-[11px] font-bold text-ana mt-0.5">Paylaş</span>
        </Link>
        <Oge href="/okur/liderler" ad="Liderler" i="kupa" />
        <Oge href="/okur/hesabim" ad="Hesabım" i="kisi" />
      </div>
    </nav>
  );
}
