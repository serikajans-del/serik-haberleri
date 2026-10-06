import { NextRequest, NextResponse } from "next/server";
import { isAdminPassword } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (isAdminPassword(password)) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Şifre yanlış" }, { status: 401 });
}
