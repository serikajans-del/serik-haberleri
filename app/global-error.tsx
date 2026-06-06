"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ maxWidth: 600, margin: "80px auto", padding: 24, fontFamily: "monospace" }}>
          <h1 style={{ color: "#cc0000", fontSize: 24 }}>Global Hata</h1>
          <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 4, fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {error?.message || "Bilinmeyen hata"}
            {"\n\n"}
            {error?.stack || ""}
          </pre>
          {error?.digest && <p style={{ color: "#999", fontSize: 12 }}>digest: {error.digest}</p>}
          <button onClick={reset} style={{ background: "#cc0000", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 4, cursor: "pointer", marginTop: 16 }}>
            Yeniden Dene
          </button>
        </div>
      </body>
    </html>
  );
}
