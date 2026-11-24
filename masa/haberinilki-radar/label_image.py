# -*- coding: utf-8 -*-
"""Görseli 16:9'a kırpar (1600x900) ve sol alta "Temsili görsel" etiketi basar.
Kullanım: python -I label_image.py GIRDI CIKTI.jpg"""
import sys
from PIL import Image, ImageDraw, ImageFont

FONTLAR = ["C:/Windows/Fonts/segoeuib.ttf", "C:/Windows/Fonts/arialbd.ttf", "DejaVuSans-Bold.ttf"]


def font(boy):
    for f in FONTLAR:
        try:
            return ImageFont.truetype(f, boy)
        except OSError:
            pass
    return ImageFont.load_default()


def main(gir, cik):
    im = Image.open(gir).convert("RGB")
    g, y = im.size
    hedef = 16 / 9
    if g / y > hedef:
        yg = int(y * hedef)
        im = im.crop(((g - yg) // 2, 0, (g - yg) // 2 + yg, y))
    else:
        yy = int(g / hedef)
        im = im.crop((0, (y - yy) // 2, g, (y - yy) // 2 + yy))
    im = im.resize((1600, 900), Image.LANCZOS)

    katman = Image.new("RGBA", im.size, (0, 0, 0, 0))
    c = ImageDraw.Draw(katman)
    f = font(30)
    yazi = "Temsili görsel"
    x0, y0, x1, y1 = c.textbbox((0, 0), yazi, font=f)
    pad_x, pad_y, kenar = 18, 10, 28
    w, h = x1 - x0 + 2 * pad_x, y1 - y0 + 2 * pad_y
    kx, ky = kenar, 900 - kenar - h
    c.rounded_rectangle((kx, ky, kx + w, ky + h), radius=10, fill=(0, 0, 0, 165))
    c.text((kx + pad_x - x0, ky + pad_y - y0), yazi, font=f, fill=(255, 255, 255, 240))
    Image.alpha_composite(im.convert("RGBA"), katman).convert("RGB").save(cik, "JPEG", quality=90)
    print(cik)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
