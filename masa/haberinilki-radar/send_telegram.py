# -*- coding: utf-8 -*-
"""Atakan'ın Telegram botuna (yalnız kendi özel sohbeti) radar seçimi gönderir.
Kullanım: python -I send_telegram.py --caption-file CAP.html [--photo IMG.jpg] [--button-url URL]
Token: TELEGRAM_BOT_TOKEN ortam değişkeni; yoksa serik-haberleri/.env.local'dan okunur. Token ASLA yazdırılmaz.
Chat id: bu klasördeki telegram.json {"chat_id": ...}. Çıktı: OK <mesaj_id> ya da FAIL <neden>."""
import argparse, json, os, sys
import requests

KOK = os.path.dirname(os.path.abspath(__file__))


def token():
    t = os.environ.get("TELEGRAM_BOT_TOKEN")
    if t:
        return t.strip()
    env = os.path.join(KOK, "..", "..", ".env.local")
    try:
        with open(env, encoding="utf-8") as f:
            for satir in f:
                if satir.startswith("TELEGRAM_BOT_TOKEN="):
                    return satir.split("=", 1)[1].strip().strip('"')
    except OSError:
        pass
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--caption-file", required=True)
    ap.add_argument("--photo")
    ap.add_argument("--button-url")
    a = ap.parse_args()
    tok = token()
    if not tok:
        print("FAIL token yok")
        return 1
    try:
        with open(os.path.join(KOK, "telegram.json"), encoding="utf-8") as f:
            chat = json.load(f)["chat_id"]
    except (OSError, KeyError, ValueError):
        print("FAIL telegram.json chat_id yok")
        return 1
    with open(a.caption_file, encoding="utf-8") as f:
        cap = f.read()
    api = f"https://api.telegram.org/bot{tok}/"
    tus = json.dumps({"inline_keyboard": [[{"text": "X'te paylaş", "url": a.button_url}]]}) if a.button_url else None

    def istek(yontem, veri, dosya=None):
        try:
            r = requests.post(api + yontem, data=veri, files=dosya, timeout=60)
            j = r.json()
            return j.get("ok"), (j.get("result") or {}).get("message_id"), j.get("description")
        except Exception as e:  # mesajda token geçmesin: yalnız hata türü
            return False, None, type(e).__name__

    neden = None
    if a.photo and os.path.exists(a.photo):
        veri = {"chat_id": chat, "caption": cap[:1024], "parse_mode": "HTML"}
        if tus:
            veri["reply_markup"] = tus
        with open(a.photo, "rb") as ph:
            ok, mid, neden = istek("sendPhoto", veri, {"photo": ph})
        if ok:
            print(f"OK {mid} (foto)")
            return 0
    veri = {"chat_id": chat, "text": cap[:4000], "parse_mode": "HTML", "disable_web_page_preview": "true"}
    if tus:
        veri["reply_markup"] = tus
    ok, mid, neden2 = istek("sendMessage", veri)
    if ok:
        print(f"OK {mid} (metin{', foto başarısız: ' + str(neden) if neden else ''})")
        return 0
    print(f"FAIL {neden2}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
