import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "serikpostasi.com" },
      { protocol: "https", hostname: "www.serikpostasi.com" },
      { protocol: "https", hostname: "iha.com.tr" },
      { protocol: "https", hostname: "www.iha.com.tr" },
      { protocol: "https", hostname: "cdn.iha.com.tr" },
      { protocol: "https", hostname: "sondakika.com" },
      { protocol: "https", hostname: "www.sondakika.com" },
      { protocol: "https", hostname: "img.sondakika.com" },
      { protocol: "https", hostname: "**.sondakika.com" },
      { protocol: "https", hostname: "**.iha.com.tr" },
    ],
  },
};

export default nextConfig;
