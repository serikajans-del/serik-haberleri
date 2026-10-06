// serikmerkez.com (WordPress) REST yardımcıları. Kimlik bilgileri .env.local'dan okunur.
const B = process.env.WORDPRESS_URL.replace(/\/$/, "");
const AUTH = "Basic " + Buffer.from(`${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`).toString("base64");
export async function wp(path, opt = {}) {
  const r = await fetch(`${B}/wp-json${path}`, { ...opt, headers: { Authorization: AUTH, ...(opt.headers || {}) } });
  const t = await r.text();
  let j; try { j = JSON.parse(t); } catch { j = t; }
  if (!r.ok) throw new Error(`${r.status} ${path}: ${typeof j === "string" ? j.slice(0, 200) : j.message}`);
  return j;
}
export const SITE = B;
