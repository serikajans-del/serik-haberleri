import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Yayın İlkeleri | Serik Haberleri",
  description: "Serik Haberleri yayın ilkeleri, editoryal standartlar ve gazetecilik değerleri.",
};

export default function YayinIlkeleriPage() {
  const principles = [
    {
      title: "Doğruluk ve Güvenilirlik",
      icon: "✅",
      content:
        "Yayımladığımız her haberin en az iki bağımsız kaynakla doğrulanması ilkemizdir. Hata yaptığımızda bunu şeffaf biçimde düzeltiriz ve okuyucularımızı bilgilendiririz.",
    },
    {
      title: "Tarafsızlık ve Bağımsızlık",
      icon: "⚖️",
      content:
        "Serik Haberleri herhangi bir siyasi parti, ticari kuruluş veya çıkar grubundan bağımsız olarak yayın yapmaktadır. Haberlerimizde her görüşe dengeli biçimde yer vermeye özen gösteririz.",
    },
    {
      title: "Özel Hayatın Korunması",
      icon: "🔒",
      content:
        "Kamu yararı gerektirmedikçe bireylerin özel hayatına müdahale etmeyiz. Çocukların kimliğini gizli tutar, mağdurların rızası olmadan görüntü yayımlamayız.",
    },
    {
      title: "Şiddet ve Nefret Dili",
      icon: "🚫",
      content:
        "Şiddeti özendiren, ırk, din, cinsiyet veya etnik kökene dayalı ayrımcılık içeren içerik yayımlamayız. Nefret söylemi hiçbir koşulda kabul edilmez.",
    },
    {
      title: "Kaynak Gizliliği",
      icon: "🤫",
      content:
        "Haber kaynaklarının gizliliğini korumak basın özgürlüğünün temelidir. Kaynak gizliliği talep ettiğinde bu talebe koşulsuz uyarız.",
    },
    {
      title: "Reklam ve Editoryal Ayrımı",
      icon: "📋",
      content:
        "Reklam ve sponsorlu içerikler açıkça etiketlenir ve editoryal kararlardan bağımsız tutulur. Reklam verenler haber içeriklerimizi etkileyemez.",
    },
    {
      title: "Hata Düzeltme",
      icon: "✏️",
      content:
        "Yayımladığımız bir haberde hata tespit edildiğinde, haber silinmez; görünür biçimde düzeltme notu eklenir. Okuyucularımız hata bildirimlerini bize iletebilir.",
    },
    {
      title: "Telif ve İçerik Hakları",
      icon: "©️",
      content:
        "Kaynak göstermeksizin başka yayın organlarının içeriklerini kopyalamayız. Kullandığımız görseller telif hakkı çerçevesinde edinilir ve kaynaklandırılır.",
    },
  ];

  return (
    <>
      <div className="seo-page-hero">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-xs text-red-200 mb-3 flex items-center gap-1">
            <Link href="/" className="hover:text-white">Ana Sayfa</Link>
            <span>›</span>
            <span className="text-white">Yayın İlkeleri</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-black mb-2">📰 Yayın İlkelerimiz</h1>
          <p className="text-red-100 text-sm">
            Serik Haberleri, Türkiye Gazeteciler Cemiyeti&apos;nin meslek ilkeleri ve basın ahlak esasları çerçevesinde yayın yapmaktadır.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-sm text-amber-800">
          <strong>Son Güncelleme:</strong> 1 Ocak 2026 — Bu ilkeler Serik Haberleri Yayın Kurulu tarafından onaylanmıştır.
        </div>

        <div className="space-y-5">
          {principles.map((p) => (
            <div key={p.title} className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="flex items-center gap-2 font-bold text-lg mb-2 text-gray-900">
                <span className="text-2xl">{p.icon}</span>
                {p.title}
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed">{p.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-lg mb-3">Şikayet ve Düzeltme Bildirimi</h2>
          <p className="text-sm text-gray-600 mb-4">
            Yayınladığımız bir haberle ilgili şikayetiniz veya düzeltme talebiniz varsa, 48 saat içinde yanıt vermeyi taahhüt ediyoruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:editor@serikhaberleri.com"
              className="inline-flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#cc0000" }}
            >
              ✉️ editor@serikhaberleri.com
            </a>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              İletişim Formu →
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}
