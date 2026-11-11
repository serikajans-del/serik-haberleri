import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Okur Kuralları", description: "Serik Haberleri'nde paylaşım kuralları, moderasyon ve içerik kaldırma başvurusu.", alternates: { canonical: "/okur/kurallar" } };

const KURALLAR: [string, string][] = [
  ["Saygılı ol", "Hakaret, küfür, tehdit, aşağılama ve nefret söylemi içeren paylaşım ve yorumlar kaldırılır; tekrarında hesap kapatılır."],
  ["Kanıtsız suçlama yapma", "Bir kişiyi ya da işletmeyi suç işlemekle itham etme. Yaşadığını olduğu gibi anlat; yorum ve tahmini “bence” diye belirt. İftira hukuken suçtur."],
  ["Kişisel bilgi paylaşma", "Telefon numarası, ev adresi, kimlik/plaka bilgisi ve başkalarının yüzünün göründüğü fotoğraflar yayınlanmaz. Kendi iletişim bilgini de yazma."],
  ["Doğruyu yaz", "Gördüğünü, yerini ve zamanını doğru yaz. Duyduğun bir bilgiyse kaynağını belirt. Bilerek yanlış bilgi yayan hesap kapatılır."],
  ["Reklam yapma", "İşletme tavsiyesi samimi bir deneyim olmalı. İşletme sahiplerinin kendini öne çıkaran paylaşımları ve spam kaldırılır."],
  ["Tek hesap kullan", "Puan kazanmak için birden çok hesap açmak, karşılıklı beğeni grupları kurmak hiledir; ilgili hesapların puanı silinir."],
];

export default function KurallarSayfasi() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">Okur Kuralları</h1>
      <p className="text-soluk mt-2 leading-relaxed">Okur Haberleri, Seriklilerin birbirine yardım ettiği ortak bir alan. Burayı güvenli ve işe yarar tutmak için şu kurallar geçerli:</p>
      <ol className="grid gap-3 mt-6">
        {KURALLAR.map(([b, a], i) => (
          <li key={b} className="kart p-5 flex gap-4">
            <span className="w-8 h-8 rounded-full bg-ana text-white font-bold grid place-items-center shrink-0">{i + 1}</span>
            <span><b className="block">{b}</b><span className="text-sm text-slate-600 leading-relaxed">{a}</span></span>
          </li>
        ))}
      </ol>

      <section className="kart p-6 mt-8">
        <h2 className="text-xl font-extrabold">Moderasyon nasıl işliyor?</h2>
        <ul className="list-disc pl-5 mt-3 grid gap-2 text-sm text-slate-700 leading-relaxed">
          <li>Yeni üyelerin ilk paylaşımları moderatör onayından sonra yayına girer. Üç paylaşımı onaylanan üyenin paylaşımları doğrudan yayınlanır.</li>
          <li>Küfür veya kişisel bilgi içerdiği otomatik olarak fark edilen paylaşım ve yorumlar onaya düşer.</li>
          <li>Üç farklı kişi tarafından bildirilen içerik inceleme bitene kadar yayından kaldırılır.</li>
          <li>Paylaşımlar kullanıcılara aittir; Serik Haberleri bunları önceden denetleme yükümlülüğü olmayan yer sağlayıcı olarak yayınlar (5651 sayılı Kanun).</li>
        </ul>
      </section>

      <section id="kaldirma" className="kart p-6 mt-5 scroll-mt-24">
        <h2 className="text-xl font-extrabold">İçerik kaldırma başvurusu</h2>
        <p className="text-sm text-slate-700 mt-3 leading-relaxed">
          Bir paylaşım kişilik haklarını ihlal ediyorsa her içeriğin altındaki <b>“Bildir”</b> düğmesini kullanabilirsin; üye olman gerekmez.
          Hak sahibi olarak resmî başvuru yapmak için içeriğin bağlantısını ve gerekçeni <a href="https://www.serikhaberleri.com/iletisim" className="text-ana font-semibold underline">iletişim sayfası</a> üzerinden ilet.
          Hukuka aykırı içerikler en geç 24 saat içinde incelenir.
        </p>
      </section>
      <p className="text-sm text-soluk mt-6">Kişisel verilerin nasıl işlendiğini <Link href="/okur/aydinlatma" className="text-ana underline">Aydınlatma Metni</Link>&apos;nde okuyabilirsin.</p>
    </div>
  );
}
