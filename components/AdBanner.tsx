import Link from "next/link";

type AdSize = "leaderboard" | "rectangle" | "halfpage" | "small" | "mobile";

const AD_SIZES: Record<AdSize, { label: string; minH: string; className: string }> = {
  leaderboard: { label: "728×90 — Reklam Alanı",   minH: "72px",  className: "w-full" },
  rectangle:   { label: "300×250 — Reklam Alanı",   minH: "160px", className: "w-full" },
  halfpage:    { label: "300×600 — Reklam Alanı",   minH: "300px", className: "w-full" },
  small:       { label: "468×60 — Reklam Alanı",    minH: "56px",  className: "w-full" },
  mobile:      { label: "320×100 — Reklam Alanı",   minH: "80px",  className: "w-full" },
};

export default function AdBanner({
  size = "leaderboard",
  className = "",
}: {
  size?: AdSize;
  className?: string;
}) {
  const { label, minH } = AD_SIZES[size];

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded ${className}`}
      style={{
        backgroundColor: "#fafafa",
        border: "1px dashed #ddd",
        minHeight: minH,
      }}
    >
      <span
        className="absolute top-1 left-2 text-xs uppercase tracking-widest"
        style={{ color: "#ccc", fontSize: "10px" }}
      >
        Reklam
      </span>
      <p
        className="text-xs font-medium uppercase tracking-widest"
        style={{ color: "#d0d0d0" }}
      >
        {label}
      </p>
      <Link
        href="/reklam"
        className="text-xs mt-1 transition-colors hover:text-red-700"
        style={{ color: "#d90000" }}
      >
        Reklam vermek için tıklayın →
      </Link>
    </div>
  );
}
