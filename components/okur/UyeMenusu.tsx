"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function UyeMenusu({ rumuz }: { rumuz: string }) {
  const [acik, setAcik] = useState(false);
  const kutu = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const kapat = (e: MouseEvent) => { if (!kutu.current?.contains(e.target as Node)) setAcik(false); };
    document.addEventListener("click", kapat);
    return () => document.removeEventListener("click", kapat);
  }, []);

  async function cikis() {
    await fetch("/api/okur/uye/cikis", { method: "POST" });
    setAcik(false);
    router.refresh();
  }

  return (
    <div ref={kutu} className="relative">
      <button onClick={() => setAcik((a) => !a)} className="flex items-center gap-2 rounded-full border border-cizgi bg-white pl-1 pr-3 py-1 hover:bg-zemin" aria-expanded={acik}>
        <span className="w-8 h-8 rounded-full bg-ana text-white grid place-items-center font-bold text-sm">{rumuz.slice(0, 1).toLocaleUpperCase("tr-TR")}</span>
        <span className="text-sm font-semibold max-w-28 truncate hidden sm:block">{rumuz}</span>
      </button>
      {acik && (
        <div className="absolute right-0 mt-2 w-52 kart p-1.5 shadow-xl belir">
          <Link href={`/okur/uye/${encodeURIComponent(rumuz)}`} onClick={() => setAcik(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-zemin">Profilim ve puanım</Link>
          <Link href="/okur/paylas" onClick={() => setAcik(false)} className="block px-3 py-2 rounded-lg text-sm hover:bg-zemin">Yeni paylaşım</Link>
          <button onClick={cikis} className="w-full text-left px-3 py-2 rounded-lg text-sm text-mercan hover:bg-red-50">Çıkış yap</button>
        </div>
      )}
    </div>
  );
}
