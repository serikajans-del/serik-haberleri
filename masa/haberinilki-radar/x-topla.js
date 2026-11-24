// @haberinilki radar — X arama sayfasından aday toplayıcı (Claude in Chrome javascript_tool ile).
// Her sayfa açılışında bu dosyanın TAMAMINI çalıştır, ardından:
//   await HIR.topla("watchlist")   -> görünen gönderileri 4 kez kaydırarak toplar, localStorage'a ekler; kısa özet döner
//   await HIR.durum()              -> gönderi sayfasında (x.com/u/status/id) ana gönderiyi yeniden ölçer
//   HIR.takipci()                  -> profil sayfasında {handle, followers}
//   HIR.indir()                    -> biriken adayları İndirilenler'e hir-aday-<zaman>.json olarak indirir ve temizler
//   @antalyahaberci_bot radarı: her çağrıdan önce window.HIR_ON = "radar-x" (ayrı birikim, dosya radar-x-<zaman>.json)
//   HIR.sifirla()                  -> turun başında birikimi temizle
window.HIR = (() => {
  // İki radar aynı Chrome'u kullanır: birikim anahtarı radara göre ayrılır. antalyahaberci radarı her çağrıdan önce window.HIR_ON = "radar-x" der.
  const ON = () => (window.HIR_ON === "radar-x" ? "radar-x" : "hir-aday");
  const ANAH = () => "hir_birikim_" + ON();
  const say = (s) => {
    if (!s) return 0;
    s = String(s).trim().replace(/\s/g, "");
    const m = s.match(/^([\d.,]+)(B|K|Mn|M|Bn)?$/i);
    if (!m) return parseInt(s.replace(/\D/g, "")) || 0;
    let n = m[1];
    const kat = { b: 1e3, k: 1e3, mn: 1e6, m: 1e6, bn: 1e9 }[(m[2] || "").toLowerCase()] || 1;
    if (kat > 1) n = parseFloat(n.replace(",", "."));
    else n = parseInt(n.replace(/[.,]/g, ""));
    return Math.round(n * kat);
  };
  const metrik = (art) => {
    const o = { replies: 0, reposts: 0, likes: 0, quotes: 0, bookmarks: 0, views: null };
    const g = [...art.querySelectorAll('[role="group"][aria-label]')].pop();
    const lab = g ? g.getAttribute("aria-label") : "";
    for (const parca of lab.split(",")) {
      const n = parseInt(parca.replace(/\D/g, "")) || 0, p = parca.toLowerCase();
      if (/yanıt|repl/.test(p)) o.replies = n;
      else if (/yeniden|repost|retweet/.test(p)) o.reposts = n;
      else if (/alıntı|quote/.test(p)) o.quotes = n;
      else if (/beğen|like/.test(p)) o.likes = n;
      else if (/yer işaret|bookmark/.test(p)) o.bookmarks = n;
      else if (/görüntül|view/.test(p)) o.views = n;
    }
    if (!lab) {
      const t = (id) => say(art.querySelector(`[data-testid="${id}"]`)?.innerText);
      o.replies = t("reply"); o.reposts = t("retweet"); o.likes = t("like");
    }
    return o;
  };
  const oku = () => JSON.parse(localStorage.getItem(ANAH()) || "[]");
  const yaz = (v) => localStorage.setItem(ANAH(), JSON.stringify(v));
  const bekle = (ms) => new Promise((r) => setTimeout(r, ms));

  function gorunen(kaynak) {
    const cikti = [];
    for (const art of document.querySelectorAll('article[data-testid="tweet"]')) {
      const sc = art.querySelector('[data-testid="socialContext"]')?.innerText || "";
      if (/yeniden gönderdi|reposted|sabitlen|pinned/i.test(sc)) continue;
      if ([...art.querySelectorAll("span")].some((s) => /^(Reklam|Ad|Promoted|Tanıtılan)$/.test(s.innerText))) continue;
      const tm = art.querySelector("a[href*='/status/'] time");
      if (!tm) continue;
      const href = tm.closest("a").getAttribute("href").split("?")[0];
      const m = href.match(/^\/([^/]+)\/status\/(\d+)/);
      if (!m) continue;
      const ad = art.querySelector('[data-testid="User-Name"]')?.innerText.split("\n")[0] || "";
      cikti.push({
        id: m[2], url: "https://x.com/" + m[1] + "/status/" + m[2], author: m[1], name: ad,
        created_at: tm.getAttribute("datetime"),
        text: (art.querySelector('[data-testid="tweetText"]')?.innerText || "").slice(0, 400),
        media: !!art.querySelector('[data-testid="tweetPhoto"], video'),
        quote_of: art.querySelectorAll("time").length > 1,
        kaynak, ...metrik(art),
      });
    }
    return cikti;
  }

  async function topla(kaynak = "?", tur = 4) {
    await bekle(1500);
    const hepsi = oku(), bu = new Map();
    for (let i = 0; i <= tur; i++) {
      for (const a of gorunen(kaynak)) bu.set(a.id, a);
      if (i < tur) { window.scrollBy(0, window.innerHeight * 1.6); await bekle(1400); }
    }
    yaz(hepsi.concat([...bu.values()]));
    const hata = document.body.innerText.match(/Bir sorun oluştu|Something went wrong|Sonuç yok|No results/);
    return `${kaynak}: ${bu.size} gönderi (birikim ${hepsi.length + bu.size})${hata ? " — sayfa: " + hata[0] : ""}`;
  }

  async function durum() { // gönderi sayfasında yalnız ana gönderiyi yeniden ölçer (momentum)
    await bekle(2000);
    const id = (location.pathname.match(/status\/(\d+)/) || [])[1];
    const a = gorunen("momentum").find((x) => x.id === id);
    if (a) yaz(oku().concat([a]));
    return a ? `momentum: @${a.author} ❤${a.likes} 🔁${a.reposts} 💬${a.replies}` : "momentum: gönderi okunamadı (silinmiş olabilir)";
  }

  function takipci() {
    const a = document.querySelector('a[href$="/verified_followers"], a[href$="/followers"]');
    const handle = location.pathname.split("/")[1];
    const metin = a ? ((a.innerText.match(/^[\d.,]+\s?(Mn|Bn|B|K|M)?/) || [null])[0]) : null;
    return { handle, followers: metin ? say(metin) : null, ham: metin,
             yok: /Bu hesap mevcut değil|This account doesn’t exist|askıya alındı|suspended/i.test(document.body.innerText) };
  }

  function indir(on = ON()) {
    const v = oku();
    const b = new Blob([JSON.stringify({ toplandi: new Date().toISOString(), adaylar: v })], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = on + "-" + Date.now() + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    localStorage.removeItem(ANAH());
    return `${v.length} aday indirildi`;
  }

  return { topla, durum, takipci, indir, sifirla: () => (localStorage.removeItem(ANAH()), "temiz"), _gorunen: gorunen };
})();
"HIR hazır";
