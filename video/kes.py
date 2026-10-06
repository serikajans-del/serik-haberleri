# Seçilen bölümleri kaynak videodan keser (1080p30, H.264). Sırayla geniş plan / yakın plan.
import subprocess, sys, os
SRC = r"C:\Users\MONSTER\Desktop\DJI_20261006115823_0233_D.MP4"
INTRO = r"C:\Users\MONSTER\Desktop\DJI_20261006115404_0230_D.MP4"
W = "video/calisma"
# (başlangıç sn, bitiş sn) — döküm zamanlarına yarım saniyelik pay eklendi
SEGS = [(35.3, 50.3), (61.7, 94.6), (95.8, 121.6), (463.85, 479.0), (601.7, 609.6), (664.9, 693.3),
        (829.3, 850.6), (854.7, 873.6), (1117.7, 1125.3), (1176.9, 1192.6), (1245.2, 1254.5)]
WIDE = "scale=1920:1080"
ZOOM = "crop=2560:1440:1024:440,scale=1920:1080"
def run(a): subprocess.run(a, check=True)
for i, (s, e) in enumerate(SEGS):
    vf = (ZOOM if i % 2 else WIDE) + ",fps=30,format=yuv420p"
    out = f"{W}/k{i:02d}.mp4"
    if os.path.exists(out): continue
    d = e - s
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(s), "-t", str(d), "-i", SRC, "-map", "0:v:0", "-map", "0:a:0",
         "-vf", vf, "-af", f"afade=t=in:d=0.08,afade=t=out:st={d-0.1:.2f}:d=0.1",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out])
    print("kesildi", out, round(d, 1), flush=True)
# Açılış: karşılama görüntüsü
if not os.path.exists(f"{W}/giris.mp4"):
    run(["ffmpeg", "-v", "error", "-y", "-ss", "11", "-t", "9", "-i", INTRO, "-map", "0:v:0", "-map", "0:a:0",
         "-vf", WIDE + ",fps=30,format=yuv420p", "-af", "volume=0.5,afade=t=in:d=0.5,afade=t=out:st=8.3:d=0.7",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", f"{W}/giris.mp4"])
    print("kesildi giris", flush=True)
with open(f"{W}/konusma.txt", "w") as f:
    for i in range(len(SEGS)): f.write(f"file 'k{i:02d}.mp4'\n")
run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{W}/konusma.txt", "-c", "copy", f"{W}/konusma.mp4"])
run(["ffmpeg", "-v", "error", "-y", "-i", f"{W}/konusma.mp4", "-vn", "-ac", "1", "-ar", "16000", f"{W}/konusma.wav"])
print("toplam", sum(e - s for s, e in SEGS), flush=True)
