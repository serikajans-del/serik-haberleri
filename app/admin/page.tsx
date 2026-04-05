"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      localStorage.setItem("admin_password", password);
      router.push("/admin/dashboard");
    } else {
      setError("Şifre yanlış!");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f0ece4" }}>
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "#cc0000" }}>
            SERİK HABERLERİ
          </h1>
          <p className="text-gray-500 text-sm mt-1">Yönetim Paneli</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-red-500"
              placeholder="Admin şifresi"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold py-2.5 rounded transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ backgroundColor: "#cc0000" }}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
