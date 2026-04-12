"use client";
import { useState } from "react";

interface Props {
  baslik: string;
  ozet: string;
  kategori: string;
  haberUrl: string;
}

export default function TweetButonu({ baslik, ozet, kategori, haberUrl }: Props) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [tweet, setTweet] = useState<string | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  async function tweetOlustur() {
    setYukleniyor(true);
    setTweet(null);
    try {
      const res = await fetch("/api/tweet-uret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baslik, ozet, kategori }),
      });
      const data = await res.json();
      setTweet(data.tweet || "");
    } catch {
      setTweet(`🔴 ${baslik.slice(0, 100)}\n\n#Gündem #Türkiye #SonDakika`);
    } finally {
      setYukleniyor(false);
    }
  }

  function kopyala() {
    if (!tweet) return;
    const tamMetin = tweet + "\n\n" + haberUrl;
    navigator.clipboard.writeText(tamMetin).then(() => {
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    });
  }

  function twitterAc() {
    if (!tweet) return;
    const tamMetin = tweet + "\n\n" + haberUrl;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tamMetin)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  }

  return (
    <div className="mt-2">
      {/* Tweet Oluştur butonu */}
      {!tweet && (
        <button
          onClick={tweetOlustur}
          disabled={yukleniyor}
          className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded transition-all"
          style={{
            backgroundColor: yukleniyor ? "#1a1a1a" : "#000",
            color: yukleniyor ? "#666" : "#fff",
            border: "1px solid #333",
          }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          {yukleniyor ? "Oluşturuluyor..." : "Tweet'e Dönüştür"}
        </button>
      )}

      {/* Tweet önizleme */}
      {tweet && (
        <div
          className="rounded-lg p-3 mt-2"
          style={{ backgroundColor: "#0d0d0d", border: "1px solid #1e2a3a" }}
        >
          {/* Tweet metni */}
          <div className="flex items-start gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-black"
              style={{ backgroundColor: "#d90000", color: "#fff" }}
            >
              S
            </div>
            <div>
              <div className="text-xs font-bold text-white">Serik Haberleri</div>
              <div className="text-xs" style={{ color: "#8899a6" }}>@serikhaberleri</div>
            </div>
          </div>

          <p className="text-sm whitespace-pre-wrap mb-3" style={{ color: "#e7e9ea", lineHeight: 1.6 }}>
            {tweet}
          </p>

          <p className="text-xs mb-3" style={{ color: "#1d9bf0" }}>
            {haberUrl.replace("https://", "")}
          </p>

          <div className="text-xs" style={{ color: "#536471", borderTop: "1px solid #1e2a3a", paddingTop: "8px", marginBottom: "10px" }}>
            {tweet.length + haberUrl.length + 2} / 280 karakter
          </div>

          {/* Butonlar */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={twitterAc}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#000", color: "#fff", border: "1px solid #333" }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              X'te Paylaş
            </button>

            <button
              onClick={kopyala}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full transition-all"
              style={{
                backgroundColor: kopyalandi ? "#1a3a1a" : "#1a1a1a",
                color: kopyalandi ? "#4ade80" : "#ccc",
                border: `1px solid ${kopyalandi ? "#2a5a2a" : "#333"}`,
              }}
            >
              {kopyalandi ? "✓ Kopyalandı" : "📋 Kopyala"}
            </button>

            <button
              onClick={() => { setTweet(null); tweetOlustur(); }}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-full transition-colors"
              style={{ color: "#666", border: "1px solid #222" }}
            >
              🔄 Yeniden Yaz
            </button>

            <button
              onClick={() => setTweet(null)}
              className="text-xs px-3 py-2 rounded-full transition-colors"
              style={{ color: "#444", border: "1px solid #1a1a1a" }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
