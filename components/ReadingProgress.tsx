"use client";
import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setWidth(Math.min(100, Math.round(pct)));
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      id="reading-progress"
      style={{ width: `${width}%` }}
      aria-hidden="true"
    />
  );
}
