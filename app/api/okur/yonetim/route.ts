import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/okur-sunucu/db";
import { isAdmin } from "@/lib/okur-sunucu/denetim";

const UYE_ALAN = "(id, rumuz, cinsiyet, guvenilir, engelli, kayit_ip, created_at)";
// Üyeler beğeni/yorum/bildirim tabloları üzerinden de bağlı: hangi ilişkinin kullanılacağı açıkça yazılır
const UYE = `uye:meydan_uyeler!meydan_paylasimlar_uye_id_fkey${UYE_ALAN}`;
const YORUM_UYE = `uye:meydan_uyeler!meydan_yorumlar_uye_id_fkey${UYE_ALAN}`;

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ hata: "Yetkisiz" }, { status: 401 });
  const [bekleyen, yayinda, yorumlar, bildirimler, uyeler] = await Promise.all([
    db.from("meydan_paylasimlar").select(`*, ${UYE}`).eq("durum", "beklemede").order("created_at", { ascending: true }).limit(200),
    db.from("meydan_paylasimlar").select(`*, ${UYE}`).in("durum", ["yayinda", "reddedildi", "kaldirildi"]).order("created_at", { ascending: false }).limit(150),
    db.from("meydan_yorumlar").select(`*, ${YORUM_UYE}, paylasim:meydan_paylasimlar!meydan_yorumlar_paylasim_id_fkey(slug, baslik)`).order("created_at", { ascending: false }).limit(150),
    db.from("meydan_bildirimler").select("*, paylasim:meydan_paylasimlar(slug, baslik, durum), yorum:meydan_yorumlar(icerik, durum)").eq("durum", "yeni").order("created_at", { ascending: false }).limit(200),
    db.from("meydan_uyeler").select("id, rumuz, cinsiyet, mahalle, guvenilir, engelli, kayit_ip, created_at").order("created_at", { ascending: false }).limit(300),
  ]);
  return NextResponse.json({
    bekleyen: bekleyen.data ?? [], yayinda: yayinda.data ?? [], yorumlar: yorumlar.data ?? [], bildirimler: bildirimler.data ?? [], uyeler: uyeler.data ?? [],
    hata: [bekleyen, yayinda, yorumlar, bildirimler, uyeler].map((x) => x.error?.message).find(Boolean) ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ hata: "Yetkisiz" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const id = Number(b.id);

  if (b.tur === "paylasim") {
    const alan: Record<string, unknown> = {};
    if (["beklemede", "yayinda", "reddedildi", "kaldirildi"].includes(b.durum)) alan.durum = b.durum;
    if (["acik", "iletildi", "cozuldu"].includes(b.cozum)) alan.cozum = b.cozum;
    if (typeof b.red_nedeni === "string") alan.red_nedeni = b.red_nedeni.slice(0, 300);
    if (b.durum === "yayinda") {
      const { data: p } = await db.from("meydan_paylasimlar").select("yayin_at, uye_id").eq("id", id).single();
      if (p && !p.yayin_at) alan.yayin_at = new Date().toISOString();
      await db.from("meydan_paylasimlar").update(alan).eq("id", id);
      // 3 paylaşımı onaylanan üye güvenilir olur: sonraki paylaşımları onaysız yayına girer
      if (p) {
        const { count } = await db.from("meydan_paylasimlar").select("*", { count: "exact", head: true }).eq("uye_id", p.uye_id).eq("durum", "yayinda");
        if ((count ?? 0) >= 3) await db.from("meydan_uyeler").update({ guvenilir: true }).eq("id", p.uye_id).eq("engelli", false);
      }
    } else {
      await db.from("meydan_paylasimlar").update(alan).eq("id", id);
    }
    if (b.durum) await db.from("meydan_bildirimler").update({ durum: "incelendi" }).eq("paylasim_id", id);
    return NextResponse.json({ ok: true });
  }

  if (b.tur === "yorum" && ["yayinda", "beklemede", "kaldirildi"].includes(b.durum)) {
    await db.from("meydan_yorumlar").update({ durum: b.durum }).eq("id", id);
    await db.from("meydan_bildirimler").update({ durum: "incelendi" }).eq("yorum_id", id);
    return NextResponse.json({ ok: true });
  }

  if (b.tur === "uye") {
    const alan: Record<string, unknown> = {};
    if (typeof b.guvenilir === "boolean") alan.guvenilir = b.guvenilir;
    if (typeof b.engelli === "boolean") alan.engelli = b.engelli;
    await db.from("meydan_uyeler").update(alan).eq("id", id);
    if (b.engelli === true) await db.from("meydan_oturumlar").delete().eq("uye_id", id);
    return NextResponse.json({ ok: true });
  }

  if (b.tur === "bildirim") {
    await db.from("meydan_bildirimler").update({ durum: "incelendi" }).eq("id", id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
}
