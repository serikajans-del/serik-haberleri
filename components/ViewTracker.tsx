"use client";
import { useEffect } from "react";

export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    // Sayfa yüklenince view'ı artır (1 kez)
    fetch(`/api/views?slug=${encodeURIComponent(slug)}`, { method: "POST" }).catch(() => {});
  }, [slug]);

  return null;
}
