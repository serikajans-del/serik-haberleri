# Altyazıyı yeni kesimlere göre zamanlar ve son haber videosunu oluşturur.
import json, subprocess, os
W = "video/calisma"
GIRIS = 9.0
ESKI = [(34.7, 50.3), (61.7, 94.6), (95.8, 121.6), (462.7, 479.6), (601.7, 609.6), (663.7, 692.6),
        (827.7, 850.6), (854.7, 873.6), (1117.7, 1125.6), (1175.7, 1192.6), (1243.7, 1257.4)]
YENI = [(35.3, 50.3), (61.7, 94.6), (95.8, 121.6), (463.85, 479.0), (601.7, 609.6), (664.9, 693.3),
        (829.3, 850.6), (854.7, 873.6), (1117.7, 1125.3), (1176.9, 1192.6), (1245.2, 1254.5)]
SIL = {1, 27, 34, 38, 48, 66, 67, 74, 78}
METIN = {0: "Hepiniz hoş geldiniz, sefalar getirdiniz.", 17: "...üyelerimiz o kalitededir.",
         22: "...çınarın gölgesini...", 40: "...Türkiye, topyekûn...",
         47: "Yine 10 yıla kadar turizm, kitle turizmi olmaktan çıkacak.",
         61: "İşgalden kurtulmak, açlıktan kurtulmak, cehaletten kurtulmak.",
         65: "...ve bunu yapabilecek tek kurum, alternatifsiz bir şekilde CHP.",
         69: "...toplum, kurumlar CHP'ye görev verecektir.", 75: "Türkiye CHP'ye görev verecektir."}
ZAMAN = {0: (0.9, None), 47: (None, 128.9), 65: (None, 178.0)}

def kaynak(t):
    off = 0.0
    for s, e in ESKI:
        if t < off + (e - s) + 1e-6: return s + (t - off)
        off += e - s
    return ESKI[-1][1]
def yeni(src):
    off = GIRIS
    for s, e in YENI:
        if s - 0.05 <= src <= e + 0.05: return off + min(max(src, s), e) - s
        off += e - s
    return None
def z(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

rows = json.load(open(f"{W}/altyazi_ham.json", encoding="utf-8"))
out = []
for i, r in enumerate(rows):
    if i in SIL: continue
    s, e = r["s"], r["e"]
    if i in ZAMAN:
        a, b = ZAMAN[i]; s = a if a is not None else s; e = b if b is not None else e
    ks = kaynak(s)
    ns = yeni(ks)
    if ns is None: print("atlandi", i); continue
    # Bitişi, satırın başladığı bölümün sonuyla sınırla
    bolum_sonu = next(GIRIS + sum(b - a for a, b in YENI[:j + 1]) for j, (a, b) in enumerate(YENI) if a - 0.05 <= ks <= b + 0.05)
    ne = min(ns + max(e - s, 0.9), bolum_sonu - 0.05)
    out.append((ns, ne, METIN.get(i, r["t"])))
# Bir satır, sonraki başlayana kadar ekranda kalsın (en çok 0.6 sn uzat), üst üste binmesin
for k in range(len(out) - 1):
    s, e, t = out[k]; out[k] = (s, min(max(e, min(e + 0.6, out[k + 1][0] - 0.05)), out[k + 1][0] - 0.02), t)
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Alt,Arial,46,&H00FFFFFF,&H00FFFFFF,&H46000000,&H46000000,-1,0,0,0,100,100,0,0,3,12,0,2,160,160,44,162

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
for s, e, t in out: ass += f"Dialogue: 0,{z(s)},{z(e)},Alt,,0,0,0,,{t}\n"
open(f"{W}/altyazi.ass", "w", encoding="utf-8").write(ass)
print("altyazı satırı", len(out))

konusma = sum(e - s for s, e in YENI)
ana = GIRIS + konusma
fc = (
    "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v0][a0];"
    "[v0][2:v]overlay=0:0[v1];"
    "[v1][3:v]overlay=0:0:enable='between(t,0.6,8.6)'[v2];"
    f"[v2][4:v]overlay=0:0:enable='between(t,{GIRIS+0.6},{GIRIS+6.6})'[v3];"
    "[v3]subtitles=altyazi.ass:fontsdir='C\\:/Windows/Fonts',fade=t=in:d=0.4,format=yuv420p[v4];"
    "[a0]loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a1];"
    "[5:v]scale=1920:1080,fps=30,format=yuv420p,fade=t=in:d=0.4,fade=t=out:st=3.4:d=0.6[kv];"
    "[v4][a1][kv][6:a]concat=n=2:v=1:a=1[v][a]"
)
cmd = ["ffmpeg", "-v", "error", "-y", "-i", "giris.mp4", "-i", "konusma.mp4", "-i", "logo.png", "-i", "bant.png", "-i", "isim.png",
       "-loop", "1", "-t", "4", "-i", "kapanis.png", "-f", "lavfi", "-t", "4", "-i", "anullsrc=r=48000:cl=stereo",
       "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "medium", "-crf", "20",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "../umit-uysal-chp-serik-haber.mp4"]
subprocess.run(cmd, check=True, cwd=W)
print("bitti, süre ~", round(ana + 4, 1))
