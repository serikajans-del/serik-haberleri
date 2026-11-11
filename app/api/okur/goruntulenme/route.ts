import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";

export async function POST(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}));
  if (Number.isInteger(id)) await db.rpc("meydan_goruntulenme", { pid: id });
  return NextResponse.json({ ok: true });
}
