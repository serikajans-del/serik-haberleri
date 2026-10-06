# Dikey (9:16) kısa video: logosuz, altyazılı.
import json, subprocess, os
SRC = r"C:\Users\MONSTER\Desktop\DJI_20261006115823_0233_D.MP4"
W = "video/calisma"
# (başlangıç, bitiş, kırpma x) — kamera kaydığı için konuşmacıyı ortalayan x bölüme göre değişir
SEGS = [(61.7, 94.6, 1700), (1117.7, 1125.3, 2030), (1245.2, 1254.5, 2030)]
ESKI = [(34.7, 50.3), (61.7, 94.6), (95.8, 121.6), (462.7, 479.6), (601.7, 609.6), (663.7, 692.6),
        (827.7, 850.6), (854.7, 873.6), (1117.7, 1125.6), (1175.7, 1192.6), (1243.7, 1257.4)]
SIL = {1, 27, 34, 38, 48, 66, 67, 74, 78}
METIN = {17: "...üyelerimiz o kalitededir.", 65: "...ve bunu yapabilecek tek kurum, alternatifsiz bir şekilde CHP.",
         75: "Türkiye CHP'ye görev verecektir."}
ZAMAN = {65: (None, 178.0)}
def kaynak(t):
    off = 0.0
    for s, e in ESKI:
        if t < off + (e - s) + 1e-6: return s + (t - off)
        off += e - s
    return ESKI[-1][1]
def z(t): return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"

parts = []
for i, (s, e, x) in enumerate(SEGS):
    out = f"{W}/s{i:02d}.mp4"; d = e - s
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(s), "-t", str(d), "-i", SRC, "-map", "0:v:0", "-map", "0:a:0",
        "-vf", f"crop=1080:1920:{x}:150,fps=30,format=yuv420p", "-af", f"afade=t=in:d=0.08,afade=t=out:st={d-0.1:.2f}:d=0.1",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out], check=True)
    parts.append(out)
with open(f"{W}/short.txt", "w") as f:
    for i in range(len(SEGS)): f.write(f"file 's{i:02d}.mp4'\n")

rows = json.load(open(f"{W}/altyazi_ham.json", encoding="utf-8"))
out = []
for i, r in enumerate(rows):
    if i in SIL: continue
    s, e = r["s"], r["e"]
    if i in ZAMAN and ZAMAN[i][1]: e = ZAMAN[i][1]
    ks = kaynak(s); off = 0.0
    for a, b, _ in SEGS:
        if a - 0.05 <= ks <= b + 0.05:
            ns = off + max(ks, a) - a
            out.append((ns, min(ns + max(e - s, 0.9), off + (b - a) - 0.05), METIN.get(i, r["t"]))); break
        off += b - a
for k in range(len(out) - 1):
    s, e, t = out[k]; out[k] = (s, min(max(e, min(e + 0.6, out[k + 1][0] - 0.05)), out[k + 1][0] - 0.02), t)
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Alt,Arial,66,&H00FFFFFF,&H00FFFFFF,&H46000000,&H46000000,-1,0,0,0,100,100,0,0,3,14,0,2,90,90,430,162
Style: Isim,Arial,46,&H00FFFFFF,&H00FFFFFF,&H00271811,&H00271811,-1,0,0,0,100,100,0,0,3,14,0,8,90,90,230,162

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
BS = chr(92)
ass += f"Dialogue: 0,0:00:00.40,0:00:05.50,Isim,,0,0,0,,Ümit Uysal{BS}N{{{BS}fs34{BS}b0}}Muratpaşa Belediye Başkanı · CHP Serik buluşması" + chr(10)
for s, e, t in out: ass += f"Dialogue: 0,{z(s)},{z(e)},Alt,,0,0,0,,{t}\n"
open(f"{W}/short.ass", "w", encoding="utf-8").write(ass)
print("altyazı", len(out))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", "short.txt",
    "-vf", "subtitles=short.ass:fontsdir='C\\:/Windows/Fonts',fade=t=in:d=0.3,format=yuv420p",
    "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000",
    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
    "../umit-uysal-chp-serik-short.mp4"], check=True, cwd=W)
print("bitti", sum(b - a for a, b, _ in SEGS))
