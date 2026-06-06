import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Serik Haberleri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#d90000",
          position: "relative",
        }}
      >
        {/* Arka plan desen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, #b00000 0%, #d90000 50%, #ff2020 100%)",
          }}
        />

        {/* Beyaz şerit */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: "#ffffff",
          }}
        />

        {/* İçerik */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 90,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            SERİK HABERLERİ
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ width: 80, height: 2, backgroundColor: "rgba(255,255,255,0.5)" }} />
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.85)",
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              Serik&apos;in Haber Portalı
            </div>
            <div style={{ width: 80, height: 2, backgroundColor: "rgba(255,255,255,0.5)" }} />
          </div>

          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              marginTop: 8,
            }}
          >
            serikhaberleri.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
