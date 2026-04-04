import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div style={{ color: "#cc0000" }} className="text-8xl font-black mb-4">404</div>
      <h1 className="text-2xl font-bold mb-2">Sayfa Bulunamadı</h1>
      <p className="text-gray-500 mb-6">Aradığınız sayfa mevcut değil ya da taşınmış olabilir.</p>
      <Link
        href="/"
        style={{ backgroundColor: "#cc0000" }}
        className="inline-block text-white font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity"
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
