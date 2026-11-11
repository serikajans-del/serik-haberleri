import Link from "next/link";
import Logo from "./Logo";
import { KATEGORILER, MAHALLELER, mahalleSlug } from "@/lib/okur";

export default function Alt() {
  return (
    <section aria-label="Okur Haberleri bağlantıları" className="mt-16 bg-white border-t border-cizgi">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo />
          <p className="text-sm text-soluk mt-4 leading-relaxed">Serik Haberleri&apos;nin okur bölümü. Şikâyetini, isteğini, tavsiyeni ve şehirde gördüğünü paylaş; Serikliler birbirine yardım etsin.</p>
        </div>
        <div>
          <h3 className="text-sm font-bold mb-3">Konular</h3>
          <ul className="grid gap-1.5 text-sm text-soluk">
            {KATEGORILER.map((k) => <li key={k.slug}><Link href={`/okur/kategori/${k.slug}`} className="hover:text-ana">{k.ad}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold mb-3">Mahalleler</h3>
          <ul className="grid grid-cols-2 gap-1.5 text-sm text-soluk">
            {MAHALLELER.filter((m) => m !== "Diğer").map((m) => <li key={m}><Link href={`/okur/mahalle/${mahalleSlug(m)}`} className="hover:text-ana">{m}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold mb-3">Okur Haberleri</h3>
          <ul className="grid gap-1.5 text-sm text-soluk">
            <li><Link href="/okur/liderler" className="hover:text-ana">Ayın Liderleri</Link></li>
            <li><Link href="/okur/kurallar" className="hover:text-ana">Okur Kuralları</Link></li>
            <li><Link href="/okur/aydinlatma" className="hover:text-ana">Aydınlatma Metni (KVKK)</Link></li>
            <li><Link href="/okur/kurallar#kaldirma" className="hover:text-ana">İçerik Kaldırma Başvurusu</Link></li>
            <li><Link href="/" className="hover:text-ana">Serik Haberleri ana sayfa</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cizgi">
        <p className="max-w-6xl mx-auto px-4 py-5 text-xs text-soluk">
          Okur Haberleri bölümündeki paylaşımlar kullanıcılara aittir; içerikler yayın öncesi ve sonrası denetlenir.
        </p>
      </div>
    </section>
  );
}
