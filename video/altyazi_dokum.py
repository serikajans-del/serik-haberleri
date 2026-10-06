import sys, json, os
from faster_whisper import WhisperModel
model = WhisperModel("medium", device="cpu", compute_type="int8", cpu_threads=os.cpu_count() or 8)
segs, _ = model.transcribe(sys.argv[1], language="tr", vad_filter=True, beam_size=2, word_timestamps=True)
rows = []
for s in segs:
    # Uzun cümleleri ~55 karakterlik altyazı satırlarına böl (kelime zamanlarıyla)
    cur, st = [], None
    for w in s.words:
        if st is None: st = w.start
        cur.append(w)
        text = "".join(x.word for x in cur).strip()
        if len(text) >= 55 or w.word.strip().endswith((".", "?", "!")) and len(text) >= 28:
            rows.append({"s": round(st, 2), "e": round(w.end, 2), "t": text}); cur, st = [], None
    if cur: rows.append({"s": round(st, 2), "e": round(cur[-1].end, 2), "t": "".join(x.word for x in cur).strip()})
json.dump(rows, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("satir", len(rows))
