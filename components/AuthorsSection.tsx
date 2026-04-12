"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const authors = [
  {
    name: "Mehmet Yılmaz",
    title: "Genel Yayın Yönetmeni",
    topic: "Yerel Siyaset & Gündem",
    image: "https://picsum.photos/seed/author1/120/120",
    href: "/yazar/mehmet-yilmaz",
  },
  {
    name: "Ayşe Kaya",
    title: "Haber Editörü",
    topic: "Ekonomi & Turizm",
    image: "https://picsum.photos/seed/author2/120/120",
    href: "/yazar/ayse-kaya",
  },
  {
    name: "Ali Demir",
    title: "Köşe Yazarı",
    topic: "Spor & Yaşam",
    image: "https://picsum.photos/seed/author3/120/120",
    href: "/yazar/ali-demir",
  },
  {
    name: "Fatma Şahin",
    title: "Muhabir",
    topic: "Sağlık & Eğitim",
    image: "https://picsum.photos/seed/author4/120/120",
    href: "/yazar/fatma-sahin",
  },
  {
    name: "Hasan Çelik",
    title: "Köşe Yazarı",
    topic: "Asayiş & Hukuk",
    image: "https://picsum.photos/seed/author5/120/120",
    href: "/yazar/hasan-celik",
  },
  {
    name: "Zeynep Arslan",
    title: "Muhabir",
    topic: "Kültür & Sanat",
    image: "https://picsum.photos/seed/author6/120/120",
    href: "/yazar/zeynep-arslan",
  },
];

export default function AuthorsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -220 : 220, behavior: "smooth" });
    }
  };

  return (
    <section className="py-4" style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0", borderRadius: "4px" }}>
      {/* Başlık */}
      <div className="section-heading px-4 mb-0" style={{ marginBottom: 0 }}>
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#d90000" }}>
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
          Yazarlarımız
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ border: "1px solid #ddd", backgroundColor: "#f9f9f9", color: "#666" }}
            aria-label="Sola kaydır"
          >
            ‹
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors"
            style={{ border: "1px solid #ddd", backgroundColor: "#f9f9f9", color: "#666" }}
            aria-label="Sağa kaydır"
          >
            ›
          </button>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pt-4 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {authors.map((author) => (
          <Link
            key={author.name}
            href={author.href}
            className="flex-shrink-0 flex flex-col items-center text-center group"
            style={{ width: "120px" }}
          >
            {/* Profil fotoğrafı */}
            <div
              className="relative overflow-hidden mb-2"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                border: "3px solid #e0e0e0",
                transition: "border-color 0.2s",
              }}
            >
              <Image
                src={author.image}
                alt={author.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="80px"
              />
            </div>

            {/* Ad */}
            <span
              className="text-xs font-bold leading-tight group-hover:text-red-600 transition-colors"
              style={{ color: "#1a1a1a" }}
            >
              {author.name}
            </span>

            {/* Ünvan */}
            <span className="text-xs mt-0.5 leading-tight" style={{ color: "#999" }}>
              {author.title}
            </span>

            {/* Konu etiketi */}
            <span
              className="mt-1.5 text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#fff5f5", color: "#d90000", border: "1px solid #ffcccc", fontSize: "10px" }}
            >
              {author.topic}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
