import type { NextRequest } from "next/server";

// Ortam değişkeni sonunda satır sonu/boşlukla kaydedilmiş olabilir; karşılaştırmadan önce kırpılır.
export function adminPassword(): string {
  return (process.env.ADMIN_PASSWORD ?? "").trim();
}

export function isAdminPassword(value: string | null | undefined): boolean {
  const expected = adminPassword();
  return expected.length > 0 && (value ?? "").trim() === expected;
}

export function isAdminRequest(req: NextRequest): boolean {
  return isAdminPassword(req.headers.get("x-admin-password"));
}
