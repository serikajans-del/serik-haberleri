import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim",
  description: "Serik Haberleri ile iletişime geçin.",
};

export default function IletisimPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">İletişim</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div>
          <h2 className="font-bold text-lg mb-2">İletişim Bilgileri</h2>
          <ul className="space-y-2 text-gray-700">
            <li><strong>E-posta:</strong> info@serikhaberleri.com</li>
            <li><strong>Adres:</strong> Serik, Antalya</li>
            <li><strong>Reklam:</strong> reklam@serikhaberleri.com</li>
          </ul>
        </div>
        <div>
          <h2 className="font-bold text-lg mb-4">Bize Yazın</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
              <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
              <input type="email" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
              <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mesajınız</label>
              <textarea rows={5} className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: "#cc0000" }}
              className="w-full text-white font-semibold py-2.5 rounded hover:opacity-90 transition-opacity"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
