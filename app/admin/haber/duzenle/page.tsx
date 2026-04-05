"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/news";
import type { Haber } from "@/lib/supabase";
import { Suspense } from "react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function DuzenleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const password = typeof window !== "undefined" ? localStorage.getItem("admin_password") : "";

  const [form, setForm] = useState({
    title: "", slug: "", summary: "", content: "",
    category: "Gündem", category_slug: "gundem",
    image: "", author: "Serik Haberleri",
    published_at: "", featured: false, tags: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !password) { router.push("/admin"); return; }
    fetch(`/api/haberler/${id}`).then((r) => r.json()).then((haber: Haber) => {
      setForm({
        title: haber.title,
        slug: haber.slug,
        summary: haber.summary,
        content: haber.content,
        category: haber.category,
        category_slug: haber.category_slug,
        image: haber.image,
        author: haber.author,
        published_at: new Date(haber.published_at).toISOString().slice(0, 16),
        featured: haber.featured,
        tags: haber.tags?.join(", ") || "",
      });
      setLoading(false);
    });
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === "title") {
      setForm((f) => ({ ...f, title: value, slug: slugify(value) }));
    } else if (name === "category") {
      const cat = categories.find((c) => c.name === value);
      setForm((f) => ({ ...f, category: value, category_slug: cat?.slug || "" }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      published_at: new Date(form.published_at).toISOString(),
    };
    const res = await fetch(`/api/haberler/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password || "" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Hata oluştu");
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-500">Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Başlık *</label>
            <input name="title" value={form.title} onChange={handleChange} required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">URL (Slug)</label>
            <input name="slug" value={form.slug} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Özet *</label>
            <textarea name="summary" value={form.summary} onChange={handleChange} required rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
          </div>
        </div>
        <div className="bg-white rounded shadow-sm p-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">İçerik *</label>
          <textarea name="content" value={form.content} onChange={handleChange} required rows={10}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500 font-mono" />
        </div>
        <div className="bg-white rounded shadow-sm p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none">
              {categories.map((c) => <option key={c.slug} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Yazar</label>
            <input name="author" value={form.author} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Görsel URL</label>
            <input name="image" value={form.image} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Tarih/Saat</label>
            <input type="datetime-local" name="published_at" value={form.published_at} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Etiketler</label>
            <input name="tags" value={form.tags} onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" name="featured" id="featured" checked={form.featured} onChange={handleChange} className="w-4 h-4 accent-red-600" />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">Ana sayfada öne çıkar</label>
          </div>
        </div>
        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="text-white font-bold px-6 py-2.5 rounded hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#cc0000" }}>
            {saving ? "Kaydediliyor..." : "Güncelle"}
          </button>
          <Link href="/admin/dashboard" className="bg-gray-200 text-gray-700 font-bold px-6 py-2.5 rounded hover:bg-gray-300 transition-colors">
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function DuzenlePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0ece4" }}>
      <div style={{ backgroundColor: "#cc0000" }} className="px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-white font-black text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Haber Düzenle
          </h1>
          <Link href="/admin/dashboard" className="text-white text-sm hover:underline">← Geri</Link>
        </div>
      </div>
      <Suspense fallback={<div className="text-center py-20 text-gray-500">Yükleniyor...</div>}>
        <DuzenleForm />
      </Suspense>
    </div>
  );
}
