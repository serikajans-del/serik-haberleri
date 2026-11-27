import Link from "next/link";

// Sitenin üç bölümü tek çatı altında: her sayfanın en üstünde aynı şerit.
// Kullanıcı hangi bölümde olduğunu görür, diğerine tek dokunuşla geçer.
export type Bolum = "haber" | "okur" | "ustam";

const BOLUMLER: { id: Bolum; ad: string; kisa: string; href: string; ikon: string }[] = [
  { id: "haber", ad: "Haberler", kisa: "Haberler", href: "/", ikon: "📰" },
  { id: "okur", ad: "Serikliler Anlatıyor", kisa: "Meydan", href: "/okur", ikon: "💬" },
  { id: "ustam", ad: "Usta Bul", kisa: "Usta Bul", href: "/ustam", ikon: "🛠️" },
];

export default function BolumSeridi({ aktif }: { aktif: Bolum }) {
  return (
    <nav aria-label="Site bölümleri" style={{ backgroundColor: "#111827" }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 grid grid-cols-3 sm:flex sm:gap-1">
        {BOLUMLER.map((b) => {
          const secili = b.id === aktif;
          return (
            <Link
              key={b.id}
              href={b.href}
              aria-current={secili ? "page" : undefined}
              className={`relative flex items-center justify-center gap-1.5 px-3 h-10 text-[13px] sm:text-sm font-bold transition-colors ${secili ? "text-white" : "text-white/60 hover:text-white"}`}
            >
              <span aria-hidden>{b.ikon}</span>
              <span className="sm:hidden">{b.kisa}</span>
              <span className="hidden sm:inline">{b.ad}</span>
              {secili && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t" style={{ backgroundColor: "#D90000" }} />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
