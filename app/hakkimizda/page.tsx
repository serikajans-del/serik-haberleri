import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Serik Haberleri hakkında bilgi edinin. Biz kimiz, ne yapıyoruz?",
};

export default function HakkimizdaPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Hakkımızda</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4 text-gray-700 leading-relaxed">
        <p>
          <strong>Serik Haberleri</strong>, Antalya&apos;nın Serik ilçesinden güncel haberleri, son dakika gelişmelerini ve yerel haberleri okuyucularına en hızlı ve doğru şekilde ulaştırmayı hedefleyen bağımsız bir haber portalıdır.
        </p>
        <p>
          Serik, Side, Boğazkent ve çevre mahallelerdeki gelişmeleri yakından takip ederek ilçe sakinlerine kapsamlı bir haber hizmeti sunuyoruz.
        </p>
        <p>
          Haberlerimizde tarafsızlık, doğruluk ve şeffaflık ilkelerini benimsiyoruz. Okuyucularımızın güvenini kazanmak ve korumak en temel önceliğimizdir.
        </p>
        <h2 className="text-xl font-bold mt-6 mb-2">Misyonumuz</h2>
        <p>
          Serik ilçesi ve çevresindeki gelişmeleri anında, doğru ve tarafsız bir şekilde kamuoyuyla paylaşmak.
        </p>
        <h2 className="text-xl font-bold mt-6 mb-2">Vizyonumuz</h2>
        <p>
          Serik&apos;in en güvenilir ve en çok okunan dijital haber kaynağı olmak.
        </p>
      </div>
    </div>
  );
}
