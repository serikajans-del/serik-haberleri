"use client";
import { useEffect } from "react";

// Görüntülenme sayacı tarayıcıdan bir kez artırılır (ön yükleme ve botlar saymaz)
export default function Goruntulenme({ id }: { id: number }) {
  useEffect(() => {
    const anahtar = `g-${id}`;
    if (sessionStorage.getItem(anahtar)) return;
    sessionStorage.setItem(anahtar, "1");
    fetch("/api/okur/goruntulenme", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }), keepalive: true });
  }, [id]);
  return null;
}
