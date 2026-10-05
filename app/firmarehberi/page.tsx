import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Serik Firma Rehberi",
  description: "Serik Firma Rehberi hazırlanıyor.",
  robots: { index: false, follow: true },
};

export default function FirmaRehberiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-black mb-3" style={{ color: "#111827" }}>Serik Firma Rehberi hazırlanıyor</h1>
      <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b7280" }}>
        Rehberde yalnızca bilgileri doğrulanmış yerel işletmelere yer vereceğiz.
        İşletmenizi eklemek için bizimle iletişime geçebilirsiniz.
      </p>
      <Link
        href="/iletisim"
        className="inline-flex items-center gap-2 text-white font-bold px-6 py-3 text-sm transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#d90000", borderRadius: "10px" }}
      >
        İletişime geç <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
