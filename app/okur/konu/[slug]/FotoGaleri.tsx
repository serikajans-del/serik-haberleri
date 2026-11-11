"use client";
import { useState } from "react";

export default function FotoGaleri({ fotolar, baslik }: { fotolar: string[]; baslik: string }) {
  const [i, setI] = useState(0);
  const [buyuk, setBuyuk] = useState(false);
  return (
    <div className="bg-murekkep">
      <button onClick={() => setBuyuk(true)} className="block w-full aspect-[16/10] relative" aria-label="Fotoğrafı büyüt">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotolar[i]} alt={`${baslik} – fotoğraf ${i + 1}`} className="absolute inset-0 w-full h-full object-contain" />
      </button>
      {fotolar.length > 1 && (
        <div className="flex gap-2 p-2 bg-black/80">
          {fotolar.map((f, n) => (
            <button key={f} onClick={() => setI(n)} className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${n === i ? "border-altin" : "border-transparent opacity-60"}`} aria-label={`Fotoğraf ${n + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {buyuk && (
        <div className="fixed inset-0 z-50 bg-black/95 grid place-items-center p-3" onClick={() => setBuyuk(false)} role="dialog" aria-modal>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fotolar[i]} alt={baslik} className="max-w-full max-h-full object-contain" />
          <span className="absolute top-4 right-5 text-white text-3xl" aria-hidden>×</span>
        </div>
      )}
    </div>
  );
}
