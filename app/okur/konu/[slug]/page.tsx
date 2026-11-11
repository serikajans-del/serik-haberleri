import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CozumCipi, IKON, KategoriCipi } from "@/components/okur/PaylasimKarti";
import PaylasimKarti from "@/components/okur/PaylasimKarti";
import Rumuz from "@/components/okur/Rumuz";
import Etkilesim from "./Etkilesim";
import YorumAlani from "./YorumAlani";
import Bildir from "./Bildir";
import FotoGaleri from "./FotoGaleri";
import Paylastir from "./Paylastir";
import Goruntulenme from "./Goruntulenme";
import { EDITOR_RUMUZ, SIKAYET_TURU, SITE_URL, gunYaz, kategoriBul, mahalleSlug, ozet, tarihYaz } from "@/lib/okur";
import { dizinlenebilir, etkilesimDurumu, paylasimGetir, paylasimlar, yorumlar } from "@/lib/okur-sunucu/veri";
import { aktifUye } from "@/lib/okur-sunucu/oturum";

export const dynamic = "force-dynamic";
const getir = cache(paylasimGetir);

// Metindeki http(s) bağlantılarını tıklanabilir yapar; site dışı bağlantılar nofollow ugc
function baglantili(metin: string) {
  return metin.split(/(https?:\/\/[^\s<>"]+)/g).map((parca, i) => {
    if (!/^https?:\/\//.test(parca)) return parca;
    const url = parca.replace(/[.,;:!?)]+$/, "");
    const kalan = parca.slice(url.length);
    const ic = /^https:\/\/(www\.)?serikhaberleri\.com\//.test(url);
    return (
      <span key={i}>
        <a href={url} className="text-ana font-semibold underline break-all" {...(ic ? {} : { target: "_blank", rel: "nofollow ugc noopener" })}>{url.replace(/^https?:\/\/(www\.)?/, "")}</a>{kalan}
      </span>
    );
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getir((await params).slug);
  if (!p || p.durum !== "yayinda") return { title: "Paylaşım", robots: { index: false } };
  const k = kategoriBul(p.kategori);
  const baslik = `${p.baslik} | Serik ${p.mahalle}`;
  return {
    title: baslik, description: ozet(p.icerik, 158),
    alternates: { canonical: `/okur/konu/${p.slug}` },
    robots: dizinlenebilir(p) ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { type: "article", title: p.baslik, description: ozet(p.icerik, 158), url: `${SITE_URL}/okur/konu/${p.slug}`, images: p.fotolar.slice(0, 1),
      publishedTime: p.yayin_at ?? p.created_at, section: k?.ad },
  };
}

export default async function KonuSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getir((await params).slug);
  if (!p) notFound();
  const uye = await aktifUye();
  const sahibi = uye?.id === p.uye_id;
  if (p.durum !== "yayinda" && !sahibi) notFound();

  const k = kategoriBul(p.kategori)!;
  const [yorumListesi, durum, benzer] = await Promise.all([
    yorumlar(p.id), etkilesimDurumu(p.id, uye?.id),
    paylasimlar({ kategori: p.kategori, limit: 5 }),
  ]);
  const url = `${SITE_URL}/okur/konu/${p.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": p.kategori === "ariyorum" ? "QAPage" : "DiscussionForumPosting",
        ...(p.kategori === "ariyorum" ? {
          mainEntity: { "@type": "Question", name: p.baslik, text: p.icerik, answerCount: yorumListesi.length, datePublished: p.yayin_at ?? p.created_at,
            author: { "@type": "Person", name: p.uye?.rumuz, url: `${SITE_URL}/okur/uye/${encodeURIComponent(p.uye?.rumuz ?? "")}` },
            ...(yorumListesi.length ? { suggestedAnswer: yorumListesi.slice(0, 10).map((y) => ({ "@type": "Answer", text: y.icerik, datePublished: y.created_at, url: `${url}#yorum-${y.id}`,
              author: { "@type": "Person", name: y.uye?.rumuz } })) } : {}) },
        } : {
          headline: p.baslik, text: p.icerik, url, datePublished: p.yayin_at ?? p.created_at, image: p.fotolar,
          author: { "@type": "Person", name: p.uye?.rumuz, url: `${SITE_URL}/okur/uye/${encodeURIComponent(p.uye?.rumuz ?? "")}` },
          locationCreated: { "@type": "Place", name: `${p.mahalle}${p.yer ? ", " + p.yer : ""}, Serik, Antalya` },
          interactionStatistic: [
            { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: p.begeni_sayisi },
            { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: p.yorum_sayisi },
          ],
          comment: yorumListesi.slice(0, 20).map((y) => ({ "@type": "Comment", text: y.icerik, datePublished: y.created_at, author: { "@type": "Person", name: y.uye?.rumuz } })),
        }),
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Okur Haberleri", item: `${SITE_URL}/okur` },
        { "@type": "ListItem", position: 2, name: k.ad, item: `${SITE_URL}/okur/kategori/${k.slug}` },
        { "@type": "ListItem", position: 3, name: p.baslik, item: url },
      ] },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_330px] gap-6 items-start">
      {p.durum === "yayinda" && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {p.durum === "yayinda" && <Goruntulenme id={p.id} />}
      <div className="min-w-0">
        <nav className="text-xs text-soluk mb-3" aria-label="Konum">
          <Link href="/okur" className="hover:text-ana">Okur Haberleri</Link> / <Link href={`/okur/kategori/${k.slug}`} className="hover:text-ana">{k.ad}</Link>
        </nav>

        {p.durum !== "yayinda" && (
          <div className="rounded-2xl bg-altin-acik border border-altin/30 px-4 py-3 text-sm mb-4">
            {p.durum === "beklemede" ? "⏳ Paylaşımın moderatör onayı bekliyor. Onaylanınca herkes görebilecek." : `Bu paylaşım yayında değil.${p.red_nedeni ? " Neden: " + p.red_nedeni : ""}`}
          </div>
        )}

        <article className="kart overflow-hidden">
          {p.fotolar.length > 0 && <FotoGaleri fotolar={p.fotolar} baslik={p.baslik} />}
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <KategoriCipi slug={p.kategori} />
              {SIKAYET_TURU.includes(p.kategori) && <CozumCipi cozum={p.cozum} />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{p.baslik}</h1>
            {p.isletme_adi && <p className="mt-2 font-bold text-ana text-lg">⭐ {p.isletme_adi}</p>}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-slate-600">
              {p.uye && <Rumuz rumuz={p.uye.rumuz} cinsiyet={p.uye.cinsiyet} boyut={30} />}
              <time dateTime={p.yayin_at ?? p.created_at} className="text-soluk">{tarihYaz(p.yayin_at ?? p.created_at, true)}</time>
              {p.goruntulenme > 0 && <span className="text-soluk">· {p.goruntulenme.toLocaleString("tr-TR")} görüntülenme</span>}
            </div>

            <dl className="grid sm:grid-cols-2 gap-2.5 mt-5">
              <div className="flex items-center gap-2.5 rounded-xl bg-zemin px-3.5 py-2.5 text-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D90000" strokeWidth="2">{IKON.konum}</svg>
                <dt className="sr-only">Yer</dt>
                <dd><Link href={`/okur/mahalle/${mahalleSlug(p.mahalle)}`} className="font-semibold hover:underline">{p.mahalle}</Link>{p.yer ? `, ${p.yer}` : ""}</dd>
              </div>
              {p.olay_tarihi && (
                <div className="flex items-center gap-2.5 rounded-xl bg-zemin px-3.5 py-2.5 text-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D90000" strokeWidth="2">{IKON.saat}</svg>
                  <dt className="sr-only">Gün ve saat</dt>
                  <dd className="font-semibold">{gunYaz(p.olay_tarihi)}{p.olay_saati ? `, saat ${p.olay_saati}` : ""}</dd>
                </div>
              )}
            </dl>

            <div className="metin-icerik text-[1.02rem] text-slate-800 mt-5">{baglantili(p.icerik)}</div>
            <p className="text-xs text-soluk mt-5 rounded-xl bg-zemin px-3.5 py-2.5">
              {p.uye?.rumuz === EDITOR_RUMUZ
                ? <>ℹ️ Bu paylaşım <b>Serik Haberleri editörü</b> tarafından yapılmıştır. Yorumlar okurlara aittir.</>
                : <>ℹ️ Bu bir <b>okur paylaşımıdır</b>; içerik paylaşan kişiye aittir ve Serik Haberleri editörlerince doğrulanmamıştır. Hatalı veya hak ihlali içeriyorsa “Bildir” ile haber ver.</>}
            </p>

            {p.durum === "yayinda" && (
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-cizgi">
                <Etkilesim id={p.id} begeni={p.begeni_sayisi} faydali={p.faydali_sayisi} begendi={durum.begendi} faydaliMi={durum.faydali} girisli={!!uye} kendi={sahibi} />
                <span className="ml-auto flex items-center gap-1">
                  <Paylastir url={url} baslik={p.baslik} />
                  <Bildir paylasimId={p.id} />
                </span>
              </div>
            )}
          </div>
        </article>

        {p.durum === "yayinda" && (
          <YorumAlani id={p.id} ilk={yorumListesi} girisli={!!uye} slug={p.slug} soru={p.kategori === "ariyorum"} />
        )}
      </div>

      <aside className="grid gap-5 lg:sticky lg:top-32">
        <div className="kart p-5">
          <h2 className="font-extrabold">Sen de paylaş</h2>
          <p className="text-sm text-soluk mt-1">{k.ipucu}</p>
          <Link href={`/okur/paylas?kategori=${k.slug}`} className="dugme-ana w-full mt-4">+ {k.kisa} paylaş</Link>
        </div>
        {benzer.filter((b) => b.id !== p.id).length > 0 && (
          <div>
            <h2 className="font-extrabold mb-3">Benzer paylaşımlar</h2>
            <div className="grid gap-3">{benzer.filter((b) => b.id !== p.id).slice(0, 3).map((b) => <PaylasimKarti key={b.id} p={{ ...b, fotolar: [] }} />)}</div>
          </div>
        )}
      </aside>
    </div>
  );
}
