import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Serik Haberleri",
  description: "Serik Haberleri KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında kişisel veri işleme aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <>
      <div className="seo-page-hero">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-xs text-red-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">KVKK Aydınlatma Metni</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">KVKK Aydınlatma Metni</h1>
          <p className="text-red-100 text-sm">6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div
          className="rounded-lg p-6 md:p-8 space-y-6 text-sm leading-relaxed"
          style={{ backgroundColor: "#1d1d1d", border: "1px solid #2e2e2e", color: "#ccc" }}
        >

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>1. Veri Sorumlusu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca kişisel verileriniz; veri sorumlusu sıfatıyla <strong className="text-white">Serik Haberleri</strong> tarafından aşağıda açıklanan kapsamda işlenecektir.
            </p>
            <div className="rounded p-4 space-y-1" style={{ backgroundColor: "#252525" }}>
              <p><span style={{ color: "#888" }}>Ticaret Unvanı:</span> <span className="text-white">Serik Haberleri</span></p>
              <p><span style={{ color: "#888" }}>Adres:</span> <span className="text-white">Serik, Antalya</span></p>
              <p><span style={{ color: "#888" }}>E-posta:</span> <a href="mailto:info@serikhaberleri.com" style={{ color: "#d90000" }}>info@serikhaberleri.com</a></p>
              <p><span style={{ color: "#888" }}>Web:</span> <span className="text-white">www.serikhaberleri.com</span></p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>2. İşlenen Kişisel Veriler</h2>
            <p>Sitemizi kullandığınızda aşağıdaki kişisel veriler işlenebilir:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2" style={{ color: "#bbb" }}>
              <li>Kimlik bilgileri (ad, soyad — yalnızca iletişim formunda)</li>
              <li>İletişim bilgileri (e-posta adresi — yalnızca iletişim formunda)</li>
              <li>İşlem güvenliği bilgileri (IP adresi, oturum bilgileri)</li>
              <li>Kullanım verileri (ziyaret edilen sayfalar, tıklama davranışları)</li>
              <li>Teknik bilgiler (tarayıcı türü, cihaz bilgisi)</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>3. Kişisel Verilerin İşlenme Amaçları</h2>
            <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2" style={{ color: "#bbb" }}>
              <li>Web sitesi hizmetlerinin sunulması ve geliştirilmesi</li>
              <li>Kullanıcı deneyiminin iyileştirilmesi</li>
              <li>İletişim taleplerinizin yanıtlanması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Site güvenliğinin sağlanması</li>
              <li>İstatistiksel analizlerin yapılması</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>4. Kişisel Verilerin Aktarılması</h2>
            <p>
              Kişisel verileriniz; yasal zorunluluklar çerçevesinde yetkili kamu kurum ve kuruluşlarıyla, açık rızanız olması halinde iş ortaklarımızla paylaşılabilir. Google Analytics ve Google AdSense gibi hizmetlerin kullanımı kapsamında ilgili şirketlerle teknik veri paylaşımı yapılmaktadır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
            <p>
              Kişisel verileriniz; otomatik yollarla (çerezler, sunucu kayıtları) ve siz tarafından paylaşılan bilgiler aracılığıyla toplanmaktadır. İşlemenin hukuki dayanakları:
            </p>
            <ul className="list-disc list-inside space-y-1.5 ml-2" style={{ color: "#bbb" }}>
              <li>KVKK Madde 5/2-a: Kanunlarda açıkça öngörülmesi</li>
              <li>KVKK Madde 5/2-c: Sözleşmenin kurulması veya ifası</li>
              <li>KVKK Madde 5/2-ç: Veri sorumlusunun hukuki yükümlülüğü</li>
              <li>KVKK Madde 5/2-f: Meşru menfaat</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>6. KVKK Kapsamındaki Haklarınız</h2>
            <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2" style={{ color: "#bbb" }}>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>Amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>Otomatik sistemler vasıtasıyla aleyhinize sonuç doğuran kararlara itiraz etme</li>
              <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>7. Başvuru Yöntemi</h2>
            <p>
              KVKK kapsamındaki haklarınızı kullanmak için aşağıdaki kanallar aracılığıyla bize ulaşabilirsiniz:
            </p>
            <div className="rounded p-4 space-y-2" style={{ backgroundColor: "#252525" }}>
              <p><span style={{ color: "#888" }}>E-posta:</span>{" "}
                <a href="mailto:kvkk@serikhaberleri.com" style={{ color: "#d90000" }}>kvkk@serikhaberleri.com</a>
              </p>
              <p><span style={{ color: "#888" }}>Konu:</span> <span className="text-white">KVKK Başvurusu</span></p>
            </div>
            <p>
              Başvurularınız, talebin niteliğine göre en kısa sürede ve her hâlükârda <strong className="text-white">30 gün</strong> içinde sonuçlandırılacaktır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>8. Saklama Süreleri</h2>
            <p>
              Kişisel verileriniz, işlenme amacının ortadan kalkmasıyla birlikte veya ilgili mevzuatta öngörülen saklama sürelerinin dolmasıyla birlikte silinmekte, yok edilmekte veya anonim hale getirilmektedir.
            </p>
          </section>

        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/gizlilik-politikasi" className="text-sm font-bold px-4 py-2 rounded transition-opacity hover:opacity-80 text-white" style={{ backgroundColor: "#d90000" }}>
            Gizlilik Politikası →
          </Link>
          <Link href="/iletisim" className="text-sm font-bold px-4 py-2 rounded transition-colors" style={{ backgroundColor: "#2a2a2a", color: "#ccc" }}>
            İletişim
          </Link>
        </div>
      </div>
    </>
  );
}
