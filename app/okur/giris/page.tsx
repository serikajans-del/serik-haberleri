import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GirisFormu from "./GirisFormu";
import { aktifUye } from "@/lib/okur-sunucu/oturum";

export const metadata: Metadata = { title: "Giriş yap veya katıl", robots: { index: false }, alternates: { canonical: "/okur/giris" } };

export default async function GirisSayfasi({ searchParams }: { searchParams: Promise<{ sonra?: string; kayit?: string }> }) {
  const { sonra, kayit } = await searchParams;
  const hedef = sonra && sonra.startsWith("/") && !sonra.startsWith("//") ? sonra : "/okur";
  if (await aktifUye()) redirect(hedef);
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8 items-start">
      <div className="hidden md:block pt-6">
        <h1 className="text-4xl font-extrabold leading-tight">Serik Haberleri&apos;nde <span className="text-ana">hoş geldin.</span></h1>
        <p className="text-soluk mt-4 text-lg leading-relaxed">Rumuzunla katıl. Gerçek adın, telefonun ya da e-postan istenmez; ekranda yalnız rumuzun görünür.</p>
        <ul className="mt-8 grid gap-4">
          {[
            ["📣", "Şikâyet ve isteğini duyur", "Yol, su, çöp, gürültü… Fotoğrafla bildir, takip edilsin."],
            ["⭐", "İyi işletmeyi tavsiye et", "Memnun kaldığın esnafı Serikliler duysun."],
            ["🏆", "Ayın lideri ol", "Paylaşımların beğeni, yorum ve teşekkür aldıkça puanın artar."],
          ].map(([i, b, a]) => (
            <li key={b} className="flex gap-4">
              <span className="w-11 h-11 rounded-xl bg-white border border-cizgi grid place-items-center text-xl shrink-0">{i}</span>
              <span><b className="block">{b}</b><span className="text-sm text-soluk">{a}</span></span>
            </li>
          ))}
        </ul>
      </div>
      <GirisFormu hedef={hedef} ilkSekme={kayit ? "kayit" : "giris"} />
    </div>
  );
}
