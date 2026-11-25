# Suluin açılış haritası (kullanıcı, 25 Kas: "önce haritada nerede olduğu görülür"): Sentinel-2 cloudless 2016 (EOX, CC BY 4.0) üç ölçek.
#   antalya (z8): il bütünü + kırmızı il sınırı (../yanartas/veri.js, OSM)   bati (z10): Kaş–Kumluca kıyısı   finike (z13): mağara çevresi
# Mağara: OSM node 12612328201 "Suluin Mağarası" (36.28206, 30.14971), D400 kenarı. Kullanım (suluin/ klasöründen): python hazirla.py
import math, os, subprocess, time
from PIL import Image
def px(lon, lat, z):
    n = 2 ** z * 256
    return (lon + 180) / 360 * n, (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
def indir(url, p):
    for _ in range(6):
        if os.path.exists(p) and os.path.getsize(p) > 60: return p
        subprocess.run(["curl", "-s", "-m", "60", "--retry", "3", "-A", "antalyabelgesel-harita/1.0", "-o", p, url]); time.sleep(.1)
    raise RuntimeError(url)
HARITA = {"antalya": (8, 27.6, 32.4, 34.0, 40.8), "bati": (10, 28.9, 35.2, 31.4, 37.1), "finike": (13, 30.0, 36.2, 30.3, 36.43)}
for ad, (Z, lo0, la0, lo1, la1) in HARITA.items():
    x0, y0 = px(lo0, la1, Z); x1, y1 = px(lo1, la0, Z)
    t = (int(x0 // 256), int(y0 // 256), int(x1 // 256), int(y1 // 256))
    im = Image.new("RGB", ((t[2] - t[0] + 1) * 256, (t[3] - t[1] + 1) * 256))
    for x in range(t[0], t[2] + 1):
        for y in range(t[1], t[3] + 1):
            p = indir(f"https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{Z}/{y}/{x}.jpg", f"harita/karo/{Z}_{x}_{y}.jpg")
            im.paste(Image.open(p).convert("RGB"), ((x - t[0]) * 256, (y - t[1]) * 256))
    im.save(f"harita/{ad}.jpg", quality=90); print(ad, im.size)
