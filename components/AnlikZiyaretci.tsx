"use client";
import { useEffect, useState, useRef } from "react";

function olusturSid() {
  const key = "sh_sid";
  let sid = "";
  try { sid = sessionStorage.getItem(key) || ""; } catch {}
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { sessionStorage.setItem(key, sid); } catch {}
  }
  return sid;
}

export default function AnlikZiyaretci() {
  const [aktif, setAktif] = useState<number | null>(null);
  const sid = useRef<string>("");

  useEffect(() => {
    sid.current = olusturSid();

    async function ping() {
      try {
        const res = await fetch("/api/ziyaretci", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sid: sid.current }),
        });
        const d = await res.json();
        if (typeof d.aktif === "number") setAktif(d.aktif);
      } catch {}
    }

    ping();
    const interval = setInterval(ping, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (aktif === null) return null;

  return (
    <span className="hidden md:flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#22c55e" }} />
        <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#22c55e" }} />
      </span>
      <span style={{ color: "#555" }}>
        <span style={{ color: "#22c55e", fontWeight: 700 }}>{aktif}</span> çevrimiçi
      </span>
    </span>
  );
}
