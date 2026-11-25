# Dış ses dökümü: kelime zamanları (faster-whisper) -> ses/<ad>_kelime.json
import json, sys
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
for yol in sys.argv[1:]:
    seg, info = m.transcribe(yol, language="tr", word_timestamps=True, beam_size=5)
    kel = [{"w": w.word.strip(), "a": round(w.start, 2), "b": round(w.end, 2)} for s in seg for w in s.words]
    json.dump(kel, open(yol.rsplit(".", 1)[0] + "_kelime.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    print(yol, round(info.duration, 2)); print(" ".join(f"{k['w']}({k['a']})" for k in kel))
