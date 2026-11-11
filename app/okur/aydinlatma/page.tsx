import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aydınlatma Metni (KVKK)", alternates: { canonical: "/okur/aydinlatma" } };

const BOLUMLER: [string, string][] = [
  ["Veri sorumlusu", "Okur Haberleri bölümü Serik Haberleri (serikhaberleri.com) tarafından işletilir. İletişim bilgileri serikhaberleri.com/iletisim sayfasındadır."],
  ["Hangi verileri işliyoruz?", "Rumuzun, şifrenin geri döndürülemez özeti (şifrenin kendisi saklanmaz), isteğe bağlı cinsiyet ve mahalle bilgin, paylaşım ve yorumların, yüklediğin fotoğraflar ve bu işlemleri yaptığın IP adresi ile tarih-saat bilgisi. Gerçek adın, telefonun ve e-postan istenmez."],
  ["Hangi amaçla?", "Üyelik ve oturumun yürütülmesi, paylaşımların yayınlanması, kurallara aykırı içeriğin denetlenmesi, sahte hesap ve hilenin önlenmesi, ayın liderleri puanının hesaplanması ve 5651 sayılı Kanun kapsamındaki yükümlülüklerin yerine getirilmesi."],
  ["Hukuki sebep", "Üyelik sözleşmesinin kurulması ve ifası, hukuki yükümlülüklerimizin yerine getirilmesi ve meşru menfaatimiz (KVKK m.5/2-c, ç, f)."],
  ["Kimlerle paylaşılır?", "Verilerin yalnızca barındırma hizmeti aldığımız altyapı sağlayıcılarında (Supabase, Vercel) saklanır; yasal talep hâlinde yetkili kamu kurumlarıyla paylaşılır. Reklam veya pazarlama amacıyla kimseyle paylaşılmaz."],
  ["Fotoğraflar", "Yüklenen fotoğraflardaki konum ve cihaz bilgileri (EXIF) otomatik olarak silinir. Başkasının yüzünün veya araç plakasının göründüğü fotoğraflar yayınlanmaz."],
  ["Saklama süresi", "Hesabın açık kaldığı sürece; erişim kayıtları (IP ve zaman) mevzuatın öngördüğü süre boyunca saklanır, sonra silinir."],
  ["Hakların", "KVKK m.11 uyarınca verilerinin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme haklarına sahipsin. Hesabını ve paylaşımlarını sildirmek için iletişim sayfasından rumuzunla başvurabilirsin."],
];

export default function Kvkk() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">Aydınlatma Metni</h1>
      <p className="text-soluk mt-2">6698 sayılı Kişisel Verilerin Korunması Kanunu uyarınca</p>
      <div className="grid gap-3 mt-6">
        {BOLUMLER.map(([b, a]) => (
          <section key={b} className="kart p-5"><h2 className="font-extrabold">{b}</h2><p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{a}</p></section>
        ))}
      </div>
    </div>
  );
}
