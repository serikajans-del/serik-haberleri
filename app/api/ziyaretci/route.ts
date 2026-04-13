/**
 * Anlık ziyaretçi sayacı
 * Heartbeat (ping) bazlı: client her 30 saniyede ping atar,
 * 90 saniyedir ping atmayan session'lar aktif sayılmaz.
 */

// Vercel'de her instance ayrı memory tutar ama tek instance yeterli
const sessions = new Map<string, number>(); // sessionId → lastSeen timestamp

const TIMEOUT_MS = 90_000; // 90 saniye gelmezse çevrimdışı say

function temizle() {
  const simdi = Date.now();
  for (const [id, ts] of sessions) {
    if (simdi - ts > TIMEOUT_MS) sessions.delete(id);
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sessionId = body.sid as string;
  if (!sessionId || sessionId.length > 64) {
    return Response.json({ error: "geçersiz sid" }, { status: 400 });
  }
  temizle();
  sessions.set(sessionId, Date.now());
  return Response.json({ aktif: sessions.size });
}

export async function GET() {
  temizle();
  return Response.json({ aktif: sessions.size });
}
