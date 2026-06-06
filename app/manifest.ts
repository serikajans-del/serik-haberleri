import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Serik Haberleri",
    short_name: "Serik Haber",
    description: "Antalya Serik ilçesinden güncel haberler, son dakika gelişmeleri",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d90000",
    lang: "tr",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    categories: ["news"],
  };
}
