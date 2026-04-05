import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Haber kaynakları çok çeşitli olduğundan tüm HTTPS domainlerine izin veriyoruz
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
