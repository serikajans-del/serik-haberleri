import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 });
}
