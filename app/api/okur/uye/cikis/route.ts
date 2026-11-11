import { NextResponse } from "next/server";
import { oturumKapat } from "@/lib/okur-sunucu/oturum";

export async function POST() {
  await oturumKapat();
  return NextResponse.json({ ok: true });
}
