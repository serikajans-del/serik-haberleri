# Kurul v2 (25 Kas 2026): dış sesten kelime aralıkları çıkarılır (yeniden TTS yok), zamanlar yeniden eşlenir.
# Çıkanlar: dalgıç adları (senarist/kurgu: süre; adlar açıklamada), "Jablonski'nin" (adlar gidince), "Bugün yalnız izinli araştırmacılar girebiliyor"
# (hap söylüyor; kurgu), "Dipte" (45 m dip değil; senarist). Her kesmede 0,32 sn nefes boşluğu, 12 ms çapraz geçiş.
# Kullanım (suluin/ klasöründen): python ses/kes.py  → ses/vo_v2.wav, ses/vo_v2_kelime.json, zaman.js (eski: zaman_v1.js)
import json, re, shutil, subprocess, os
K = json.load(open("ses/vo_kelime.json", encoding="utf-8"))
def ara(sozcuk, sonra=0):
    for i, w in enumerate(K):
        if w["a"] >= sonra and w["w"].strip(".,").lower().startswith(sozcuk.lower()): return i
    raise SystemExit("bulunamadı: " + sozcuk)
# (ilk kelime, son kelime): ilk.a'dan son+1.a'ya kadar silinir, yerine NEFES boşluk
ARALIK = [(ara("Todd"), ara("Jablonski", 27)), (ara("Jablonski", 36), ara("'nin", 36)), (ara("Bugün", 62), ara("girebiliyor")), (ara("Dipte"), ara("Dipte"))]
NEFES = .32
# bitişler ses zarfından ölçüldü (Whisper zamanı kayık; parça dökümüyle denendi): 'nin → 37,44, Dipte → 70,46
BITIS = {1: 37.44, 3: 70.46}
kes = [(K[i]["a"], BITIS.get(n, K[j + 1]["a"])) for n, (i, j) in enumerate(ARALIK)]
print("kesimler:", [(round(a, 2), round(b, 2), round(b - a - NEFES, 2)) for a, b in kes])
def esle(t):   # eski ses saniyesi → yeni
    d = 0
    for a, b in kes:
        if t >= b: d += (b - a) - NEFES
        elif t > a: return a - d + min(t - a, NEFES)
    return t - d
# ses: tutulan parçalar + boşluklar
parca, bas = [], 0.0
for a, b in kes: parca.append((bas, a)); bas = b
parca.append((bas, None))
gir, fc = [], ""
for n, (a, b) in enumerate(parca):
    fc += f"[0:a]atrim=start={a}" + (f":end={b}" if b else "") + f",asetpts=PTS-STARTPTS,afade=t=in:d=0.012" + (f",afade=t=out:st={b - a - .012:.3f}:d=0.012" if b else "") + f"[p{n}];"
    if b: fc += f"[p{n}]apad=pad_dur={NEFES}[q{n}];"
zincir = "".join(f"[q{n}]" if parca[n][1] else f"[p{n}]" for n in range(len(parca)))
fc += f"{zincir}concat=n={len(parca)}:v=0:a=1[o]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "ses/vo.wav", "-filter_complex", fc, "-map", "[o]", "ses/vo_v2.wav"], check=True)
sil = {k for i, j in ARALIK for k in range(i, j + 1)}
yeni = [{"w": w["w"], "a": round(esle(w["a"]), 3), "b": round(esle(w["b"]), 3)} for k, w in enumerate(K) if k not in sil]
json.dump(yeni, open("ses/vo_v2_kelime.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
# zaman.js: C video sn = ses + 0,2 ; son: son kelime + 0,3 gecikme + 0,8 kuyruk (kurgu v3: sessiz kuyruk kısalsın)
z = open("zaman.js", encoding="utf-8").read()
if not os.path.exists("zaman_v1.js"): shutil.copy("zaman.js", "zaman_v1.js")
z1 = open("zaman_v1.js", encoding="utf-8").read()
C = json.loads(re.search(r"window\.C = (\[.*?\]);", z1).group(1))
C2 = [None] + [round(esle(c - .2) + .2, 2) for c in C[1:19]] + [round(yeni[-1]["b"] + .3 + .8, 2)]
z2 = re.sub(r"window\.C = \[.*?\];", "window.C = " + json.dumps(C2) + ";", z1)
z2 = z2.replace("// cümle", "// v2 (kurul): ses/kes.py kesimlerinden sonra; vo_v2.wav. cümle", 1)
open("zaman.js", "w", encoding="utf-8").write(z2)
print("C v1:", C[1:]); print("C v2:", C2[1:])
