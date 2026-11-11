import { redirect } from "next/navigation";
import { aktifUye } from "@/lib/okur-sunucu/oturum";

export default async function Hesabim() {
  const uye = await aktifUye();
  redirect(uye ? `/okur/uye/${encodeURIComponent(uye.rumuz)}` : "/okur/giris?sonra=/okur/hesabim");
}
