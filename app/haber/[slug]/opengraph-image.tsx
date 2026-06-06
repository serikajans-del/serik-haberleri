import { ImageResponse } from "next/og";
import { getNewsBySlugFromDB } from "@/lib/db";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function OgImage({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsBySlugFromDB(slug).catch(() => null);

  const title = news?.title ?? "Serik Haberleri";
  const category = news?.category ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1a1a1a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Arka plan görseli (haber fotoğrafı) */}
        {news?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={news.image}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.2) 100%)",
          }}
        />

        {/* Sol kırmızı şerit */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: "#d90000",
          }}
        />

        {/* Üst logo */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 52,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              backgroundColor: "#d90000",
              color: "#fff",
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: "1px",
              padding: "5px 14px",
              borderRadius: 3,
            }}
          >
            SERİK HABERLERİ
          </div>
          {category && (
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                padding: "5px 14px",
                borderRadius: 3,
                letterSpacing: "0.5px",
              }}
            >
              {category.toUpperCase()}
            </div>
          )}
        </div>

        {/* Alt başlık */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "32px 52px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: title.length > 80 ? 34 : title.length > 50 ? 40 : 48,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            {title.length > 100 ? title.slice(0, 97) + "…" : title}
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.55)" }}>
            serikhaberleri.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
