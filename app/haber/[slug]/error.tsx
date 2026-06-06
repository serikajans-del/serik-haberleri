"use client";

export default function HaberError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div style={{ color: "#cc0000" }} className="text-5xl font-black mb-4">Hata</div>
      <h2 className="text-xl font-bold mb-2">Haber yüklenemedi</h2>
      <p className="text-gray-500 mb-2 text-sm font-mono bg-gray-100 p-3 rounded text-left">{error.message}</p>
      {error.digest && <p className="text-xs text-gray-400 mb-4">digest: {error.digest}</p>}
      <button
        onClick={reset}
        style={{ backgroundColor: "#cc0000" }}
        className="text-white font-semibold px-6 py-3 rounded hover:opacity-90 transition-opacity"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
