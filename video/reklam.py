# Dikey reklam videosu: hızlı kesimler, büyük yazılar, müzik ve fiyatlı kapanış kartı.
import subprocess, os
SRC = r"C:\Users\MONSTER\Desktop\DJI_20261006104531_0229_D.MP4"
W = "video/reklam"
BS = chr(92)
FULL = "scale=1080:1920"
ZB = "crop=1382:2458:70:250,scale=1080:1920"
ZC = "crop=1502:2670:60:200,scale=1080:1920"
# (ad, başlangıç, bitiş, görüntü filtresi, ses açık mı)
SEGS = [("a", 0.15, 4.85, FULL, True), ("b", 10.30, 14.05, ZB, True), ("d", 6.60, 8.60, FULL, False),
        ("c", 16.20, 18.90, FULL, True), ("e", 44.40, 50.40, FULL, True)]
KART = 4.5
def run(a, **k): subprocess.run(a, check=True, **k)
off = {}; t = 0.0
for ad, s, e, vf, ses in SEGS:
    off[ad] = t; d = e - s; t += d
    af = f"afade=t=in:d=0.06,afade=t=out:st={d-0.08:.2f}:d=0.08" + ("" if ses else ",volume=0")
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(s), "-t", str(d), "-i", SRC, "-map", "0:v:0", "-map", "0:a:0",
         "-vf", vf + ",fps=30,format=yuv420p", "-af", af, "-c:v", "libx264", "-preset", "veryfast", "-crf", "16",
         "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2", f"{W}/{ad}.mp4"])
off["f"] = t; TOPLAM = t + KART
# Kapanış kartı: damacanaların omuzda olduğu kare, karartılmış ve yavaşça yakınlaşan
run(["ffmpeg", "-v", "error", "-y", "-ss", "48.6", "-i", SRC, "-frames:v", "1", "-vf", "scale=1080:1920", f"{W}/kart.png"])
run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-t", str(KART), "-i", f"{W}/kart.png", "-f", "lavfi", "-t", str(KART), "-i", "anullsrc=r=48000:cl=stereo",
     "-vf", "scale=1296:2304,zoompan=z='1+0.0006*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,eq=brightness=-0.32:saturation=0.8,format=yuv420p",
     "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-c:a", "aac", "-b:a", "192k", "-shortest", f"{W}/f.mp4"])
with open(f"{W}/liste.txt", "w") as f:
    for ad in ["a", "b", "d", "c", "e", "f"]: f.write(f"file '{ad}.mp4'\n")

def z(x): return f"0:{int(x//60):02d}:{x%60:05.2f}"
POP = "{" + f"{BS}fad(60,90){BS}fscx55{BS}fscy55{BS}t(0,130,{BS}fscx110{BS}fscy110){BS}t(130,210,{BS}fscx100{BS}fscy100)" + "}"
def satir(s, e, stil, metin, ek=""): return f"Dialogue: 0,{z(s)},{z(e)},{stil},,0,0,0,,{POP}{ek}{metin}\n"
N = BS + "N"
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sari,Impact,150,&H0000E6FF,&H0000E6FF,&H00000000,&H96000000,0,0,0,0,100,100,2,0,1,9,5,8,50,50,250,162
Style: Beyaz,Impact,118,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,2,0,1,8,5,8,50,50,250,162
Style: Fiyat,Impact,330,&H0000E6FF,&H0000E6FF,&H00000000,&H96000000,0,0,0,0,100,100,0,0,1,12,7,5,40,40,0,162
Style: Marka,Arial,50,&H00FFFFFF,&H00FFFFFF,&H001400D9,&H001400D9,-1,0,0,0,100,100,1,0,3,16,0,2,60,60,400,162
Style: Tel,Arial,84,&H00FFFFFF,&H00FFFFFF,&H001400D9,&H001400D9,-1,0,0,0,100,100,1,0,3,22,0,2,60,60,470,162
Style: Kucuk,Impact,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,0,0,0,0,100,100,2,0,1,7,4,8,50,50,250,162

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
a, b, d, c, e, f = (off[k] for k in "abdcef")
ass += satir(a + 0.85, a + 2.75, "Sari", "SUDAN UCUZ!")
ass += satir(a + 2.85, a + 4.65, "Beyaz", "UCUZLUK BURADA")
ass += satir(b + 0.10, b + 3.70, "Beyaz", f"EVDE DAHA UCUZ{N}SU MU ARIYORSUN?")
ass += satir(d + 0.05, d + 1.95, "Beyaz", "19 LİTRE DAMACANA")
ass += satir(d + 0.30, d + 1.95, "Fiyat", "55 TL")
ass += satir(c + 0.10, c + 2.65, "Sari", f"KARSU'YA{N}BEKLERİZ!")
ass += satir(e + 0.25, e + 2.10, "Sari", "YALLAH!")
ass += satir(e + 2.25, e + 5.95, "Beyaz", f"AL, EVİNE GÖTÜR!")
# Alt marka bandı (ikinci sahneden kapanışa kadar)
ass += f"Dialogue: 0,{z(b)},{z(f)},Marka,,0,0,0,,KARSU GROSS  ·  0530 899 49 82\n"
# Kapanış kartı
ass += satir(f + 0.05, TOPLAM, "Beyaz", "KARSU GROSS", "{" + f"{BS}an8{BS}pos(540,300)" + "}")
ass += satir(f + 0.35, TOPLAM, "Kucuk", "19 LİTRE DAMACANA", "{" + f"{BS}an8{BS}pos(540,520)" + "}")
ass += satir(f + 0.60, TOPLAM, "Fiyat", "55 TL", "{" + f"{BS}an5{BS}pos(540,860)" + "}")
ass += satir(f + 0.95, TOPLAM, "Sari", "GEL-AL", "{" + f"{BS}an8{BS}pos(540,1060)" + "}")
ass += satir(f + 1.30, TOPLAM, "Tel", "0530 899 49 82")
open(f"{W}/yazi.ass", "w", encoding="utf-8").write(ass)

fc = ("[0:v]subtitles=yazi.ass:fontsdir='C" + BS + ":/Windows/Fonts',fade=t=in:d=0.15,fade=t=out:st=" + f"{TOPLAM-0.35:.2f}" + ":d=0.35,format=yuv420p[v];"
      "[0:a]highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,volume=2.2,asplit=2[ses][anahtar];"
      "[1:a]aresample=48000,volume=0.55[muz];"
      "[muz][anahtar]sidechaincompress=threshold=0.03:ratio=8:attack=15:release=260[muzk];"
      "[ses][muzk]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "liste.txt", "-i", "muzik.wav", "-filter_complex", fc,
     "-map", "[v]", "-map", "[a]", "-t", f"{TOPLAM:.2f}", "-c:v", "libx264", "-preset", "medium", "-crf", "19",
     "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "../karsu-gross-reklam.mp4"], cwd=W)
print("bitti", round(TOPLAM, 2), {k: round(v, 2) for k, v in off.items()})
