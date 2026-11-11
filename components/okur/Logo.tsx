// Okur Haberleri işareti: konuşma balonu içinde konum iğnesi (okurun yerinden haber vermesi)
export function Isaret({ boyut = 34 }: { boyut?: number }) {
  return (
    <svg width={boyut} height={boyut} viewBox="0 0 40 40" aria-hidden>
      <rect width="40" height="40" rx="12" fill="#D90000" />
      <path d="M10 13.5A4.5 4.5 0 0 1 14.5 9h11A4.5 4.5 0 0 1 30 13.5v8a4.5 4.5 0 0 1-4.5 4.5H19l-5.2 4.2c-.6.5-1.5 0-1.5-.7V26A4.5 4.5 0 0 1 10 21.5v-8Z" fill="#fff" />
      <path d="M20 12.2a4.3 4.3 0 0 0-4.3 4.3c0 3 4.3 7 4.3 7s4.3-4 4.3-7a4.3 4.3 0 0 0-4.3-4.3Z" fill="#D90000" />
      <circle cx="20" cy="16.5" r="1.6" fill="#fff" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <Isaret />
      <span className="leading-none">
        <span className="baslik block text-[1.1rem] font-extrabold tracking-tight">Okur <span className="text-ana">Haberleri</span></span>
        <span className="block text-[10.5px] text-soluk font-medium mt-0.5">Serik&apos;te olup biten, Seriklilerden</span>
      </span>
    </span>
  );
}
