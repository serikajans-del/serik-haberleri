import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Serik Haberleri",
  description: "Serik Haberleri gizlilik politikası. Kişisel verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi.",
};

export default function GizlilikPolitikasiPage() {
  return (
    <>
      <div className="seo-page-hero">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-xs text-red-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Gizlilik Politikası</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">Gizlilik Politikası</h1>
          <p className="text-red-100 text-sm">Son güncelleme: Nisan 2024</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div
          className="rounded-lg p-6 md:p-8 space-y-6 text-sm leading-relaxed"
          style={{ backgroundColor: "#1d1d1d", border: "1px solid #2e2e2e", color: "#ccc" }}
        >

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>1. Genel Bilgi</h2>
            <p>
              Serik Haberleri (<strong className="text-white">serikhaberleri.com</strong>) olarak ziyaretçilerimizin gizliliğine önem veriyoruz. Bu Gizlilik Politikası, sitemizi ziyaret ettiğinizde hangi bilgilerin toplandığını, bu bilgilerin nasıl kullanıldığını ve korunduğunu açıklamaktadır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>2. Toplanan Bilgiler</h2>
            <p>Sitemizi ziyaret ettiğinizde aşağıdaki bilgiler otomatik olarak toplanabilir:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2" style={{ color: "#bbb" }}>
              <li>IP adresi ve tarayıcı bilgileri</li>
              <li>Ziyaret edilen sayfalar ve geçirilen süre</li>
              <li>Yönlendiren site bilgisi (referrer)</li>
              <li>Cihaz türü ve işletim sistemi</li>
            </ul>
            <p>
              İletişim formları aracılığıyla ad, soyad ve e-posta gibi kişisel bilgiler yalnızca siz paylaştığınızda toplanır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>3. Çerezler (Cookies)</h2>
            <p>
              Sitemiz, kullanıcı deneyimini geliştirmek amacıyla çerezler kullanmaktadır. Çerezler; oturum yönetimi, tercih kaydetme ve anonim ziyaretçi istatistikleri için kullanılır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda sitenin bazı özellikleri düzgün çalışmayabilir.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>4. Google Hizmetleri</h2>
            <p>Sitemizde aşağıdaki Google hizmetleri kullanılmaktadır:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2" style={{ color: "#bbb" }}>
              <li><strong className="text-white">Google Analytics:</strong> Ziyaretçi istatistiklerini anonim olarak toplar.</li>
              <li><strong className="text-white">Google AdSense:</strong> Kişiselleştirilmiş reklam gösterimi için çerez kullanabilir.</li>
              <li><strong className="text-white">Google Search Console:</strong> Site performansı izleme amacıyla kullanılır.</li>
            </ul>
            <p>
              Google&apos;ın gizlilik politikası hakkında daha fazla bilgi için{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#d90000" }}>
                policies.google.com/privacy
              </a>{" "}
              adresini ziyaret edebilirsiniz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>5. Üçüncü Taraf Bağlantılar</h2>
            <p>
              Sitemizde üçüncü taraf web sitelerine bağlantılar bulunabilir. Bu sitelerin gizlilik politikalarından sorumlu değiliz. Bağlantıyı takip etmeden önce ilgili sitenin gizlilik politikasını incelemenizi öneririz.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>6. Veri Güvenliği</h2>
            <p>
              Topladığımız kişisel verilerin güvenliğini sağlamak için teknik ve idari tedbirler almaktayız. Verileriniz, yetkisiz erişime, değiştirmeye, ifşa etmeye veya imhaya karşı korunmaktadır.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>7. Haklarınız</h2>
            <p>Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc list-inside space-y-1.5 ml-2" style={{ color: "#bbb" }}>
              <li>Verilerinize erişim talep etme</li>
              <li>Yanlış verilerin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Veri işlemeye itiraz etme</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>8. İletişim</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız için:{" "}
              <a href="mailto:info@serikhaberleri.com" style={{ color: "#d90000" }}>
                info@serikhaberleri.com
              </a>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-white font-black text-base border-l-4 pl-3" style={{ borderColor: "#d90000" }}>9. Politika Değişiklikleri</h2>
            <p>
              Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda sitemizde duyuru yapılacaktır. Bu sayfayı düzenli olarak kontrol etmenizi öneririz.
            </p>
          </section>

        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/kvkk" className="text-sm font-bold px-4 py-2 rounded transition-opacity hover:opacity-80 text-white" style={{ backgroundColor: "#d90000" }}>
            KVKK Aydınlatma Metni →
          </Link>
          <Link href="/iletisim" className="text-sm font-bold px-4 py-2 rounded transition-colors" style={{ backgroundColor: "#2a2a2a", color: "#ccc" }}>
            İletişim
          </Link>
        </div>
      </div>
    </>
  );
}
