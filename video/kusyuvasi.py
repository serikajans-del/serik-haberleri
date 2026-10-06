# "Kuş Yuvası: ölüm yolu" dikey kısa videosu: gerçek fotoğraflar (kaydırmalı), ElevenLabs seslendirme,
# kelime vurgulu altyazı, başlık/rakam yazıları, ses efektleri ve arka müzik.
import subprocess, json

W = "video/kusyuvasi"
BS = chr(92)
DUR = 42.6
DONUS = 24.5          # anlatımın "Bugün ise..." diye umuda döndüğü an


def run(a, **k):
    subprocess.run(a, check=True, **k)


kunye = {x["n"]: x for x in json.load(open(f"{W}/foto/kunye.json", encoding="utf-8"))}
# (foto no, başlangıç, bitiş, kaydırma başı, kaydırma sonu) — kaydırma 0=sol kenar, 1=sağ kenar
PLAN = [
    (3, 0.0, 2.7, 0.30, 0.55), (2, 2.7, 5.2, 0.30, 0.70), (0, 5.2, 9.4, 0.10, 0.45), (1, 9.4, 12.5, 0.65, 0.35),
    (2, 12.5, 15.2, 0.80, 0.45), (5, 15.2, 19.1, 0.20, 0.60), (4, 19.1, 21.9, 0.60, 0.30), (0, 21.9, 24.5, 0.55, 0.20),
    (10, 24.5, 28.4, 0.75, 0.40), (6, 28.4, 34.3, 0.15, 0.60), (8, 34.3, 38.6, 0.60, 0.25), (7, 38.6, DUR, 0.30, 0.60),
]
H = 2112
CW = 1188             # 9:16 pencere, 1.1 kat büyütülmüş görüntüde

parcalar = []
for i, (no, s, e, a, b) in enumerate(PLAN):
    d = e - s
    cikti = f"{W}/p{i:02d}.mp4"
    vf = (f"scale=-2:{H},crop={CW}:{H}:x='(in_w-{CW})*({a}+({b}-{a})*t/{d:.2f})':y=0,scale=1080:1920,fps=30,"
          "eq=contrast=1.08:saturation=1.15,vignette=PI/5,format=yuv420p")
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", f"{d:.2f}", "-i", f"{W}/foto/f{no:02d}.jpg", "-vf", vf,
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-an", cikti])
    parcalar.append(cikti)
with open(f"{W}/liste.txt", "w") as f:
    for i in range(len(PLAN)):
        f.write(f"file 'p{i:02d}.mp4'\n")


def buyuk(s):
    return s.replace("i", "İ").replace("ı", "I").upper()


def z(x):
    return f"0:{int(x // 60):02d}:{x % 60:05.2f}"


kel = json.load(open(f"{W}/kelimeler.json", encoding="utf-8"))
gruplar, cur = [], []
for i, w in enumerate(kel):
    son = kel[i + 1]["s"] if i + 1 < len(kel) else w["e"] + 0.5
    cur.append((w["k"], w["s"], son))
    temiz = w["k"].rstrip('"')
    uz = sum(len(x[0]) for x in cur) + len(cur) - 1
    sonraki = kel[i + 1]["k"] if i + 1 < len(kel) else None
    if sonraki is None or temiz.endswith((".", "?", "!", ",")) or len(cur) >= 3 or uz + len(sonraki) > 20:
        gruplar.append((cur, min(son, w["e"] + 0.9)))
        cur = []

SARI = "{" + BS + "c&H00E6FF&" + BS + "fscx108" + BS + "fscy108}"
BEYAZ = "{" + BS + "c&HFFFFFF&" + BS + "fscx100" + BS + "fscy100}"
POP = "{" + f"{BS}fad(70,120){BS}fscx60{BS}fscy60{BS}t(0,140,{BS}fscx108{BS}fscy108){BS}t(140,230,{BS}fscx100{BS}fscy100)" + "}"
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Alt,Arial Black,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&HB4000000,0,0,0,0,100,100,0,0,1,9,4,2,40,40,460,162
Style: Ust,Arial,44,&H00FFFFFF,&H00FFFFFF,&H001400D9,&H001400D9,-1,0,0,0,100,100,3,0,3,16,0,8,60,60,120,162
Style: Dev,Impact,170,&H0000E6FF,&H0000E6FF,&H00000000,&H96000000,0,0,0,0,100,100,2,0,1,10,6,8,40,40,215,162
Style: Rakam,Impact,150,&H0000E6FF,&H0000E6FF,&H00000000,&H96000000,0,0,0,0,100,100,2,0,1,10,6,5,40,40,0,162
Style: Kaynak,Arial,26,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,1,7,24,24,24,162

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ass += f"Dialogue: 1,{z(0.15)},{z(5.1)},Ust,,0,0,0,,{POP}ANTALYA'NIN \"ÖLÜM YOLU\"\n"
ass += f"Dialogue: 1,{z(0.45)},{z(5.1)},Dev,,0,0,0,,{POP}KUŞ YUVASI\n"
ass += f"Dialogue: 1,{z(10.5)},{z(12.4)},Rakam,,0,0,0,," + "{" + f"{BS}an5{BS}pos(540,640)" + "}" + POP + "2.000 METRE\n"
for metin, s, y in (("58 KM", 26.8, 560), ("21 TÜNEL", 30.0, 760), ("13'Ü TAMAM", 31.8, 960)):
    ass += f"Dialogue: 1,{z(s)},{z(34.2)},Rakam,,0,0,0,," + "{" + f"{BS}an5{BS}pos(540,{y})" + "}" + POP + metin + "\n"
for no, s, e, _, _ in PLAN:
    k = kunye[no]
    ass += f"Dialogue: 0,{z(s)},{z(e)},Kaynak,,0,0,0,,Foto: {k['yazar']} / Wikimedia Commons ({k['lisans']})\n"
for grup, gson in gruplar:
    for j, (k, t, son) in enumerate(grup):
        bit = min(son, gson) if j < len(grup) - 1 else gson
        metin = " ".join((SARI + buyuk(x[0]) + BEYAZ) if m == j else buyuk(x[0]) for m, x in enumerate(grup))
        ass += f"Dialogue: 2,{z(t)},{z(bit)},Alt,,0,0,0,,{metin}\n"
open(f"{W}/yazi.ass", "w", encoding="utf-8").write(ass)

olay = [[0.0, "whoosh"], [0.45, "pop"], [10.4, "pop"], [26.8, "pop"], [30.0, "pop"], [31.8, "ding"]]
olay += [[max(0, p[1] - 0.14), "whoosh"] for p in PLAN[1:]]
run(["python", "video/muzekart_ses.py", f"{W}/efekt.wav", str(DUR), json.dumps(olay)])
run(["python", "video/kusyuvasi_muzik.py", f"{W}/muzik.wav", str(DUR), str(DONUS)])

fc = (
    f"[0:v]subtitles={W}/yazi.ass:fontsdir='C{BS}:/Windows/Fonts',fade=t=in:d=0.3,fade=t=out:st={DUR - 0.5:.2f}:d=0.5,format=yuv420p[v];"
    "[1:a]aresample=48000,highpass=f=70,acompressor=threshold=-18dB:ratio=2.5:attack=5:release=150,volume=1.5,apad,asplit=2[ses][anahtar];"
    "[2:a]aresample=48000,volume=0.5[muz];[muz][anahtar]sidechaincompress=threshold=0.03:ratio=5:attack=20:release=350[muzk];"
    "[3:a]aresample=48000,volume=0.45,pan=stereo|c0=c0|c1=c0[efk];"
    f"[ses][muzk][efk]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,afade=t=out:st={DUR - 0.8:.2f}:d=0.8[a]"
)
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{W}/liste.txt", "-i", f"{W}/anlatim.mp3",
     "-i", f"{W}/muzik.wav", "-i", f"{W}/efekt.wav", "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-t", str(DUR),
     "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
     "video/kus-yuvasi-olum-yolu-short.mp4"])
print("bitti", len(gruplar), "altyazi grubu")
