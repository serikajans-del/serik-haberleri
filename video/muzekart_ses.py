# Ses efektleri (numpy ile sentez): whoosh, pop, ding. Tek bir efekt kanalı WAV'ı üretir.
import numpy as np, wave, sys, json

SR = 44100
DUR = float(sys.argv[2])
olaylar = json.loads(sys.argv[3])  # [[zaman, "tur"], ...]
out = np.zeros(int(SR * DUR))


def add(sig, at):
    i = int(at * SR)
    j = min(len(out), i + len(sig))
    if i < len(out):
        out[i:j] += sig[: j - i]


def whoosh(d=0.32):
    x = np.arange(int(SR * d)) / SR
    nz = np.random.default_rng(5).standard_normal(len(x))
    # Kayan alçak geçiren: boğuktan parlağa doğru açılan hava sesi
    kalin = np.convolve(nz, np.ones(48) / 48, "same")
    ince = np.convolve(nz, np.ones(6) / 6, "same")
    karisim = np.linspace(0, 1, len(x)) ** 1.5
    env = np.sin(np.pi * x / d) ** 2
    return (kalin * (1 - karisim) * 3 + ince * karisim) * env * 1.6


def pop():
    x = np.arange(int(SR * 0.11)) / SR
    return np.sin(2 * np.pi * np.cumsum(520 * np.exp(-x * 30) + 180) / SR) * np.exp(-x * 38) * 0.9


def ding():
    x = np.arange(int(SR * 0.9)) / SR
    ton = np.sin(2 * np.pi * 1318.5 * x) + 0.6 * np.sin(2 * np.pi * 1975.5 * x) + 0.3 * np.sin(2 * np.pi * 2637 * x)
    return ton * np.exp(-x * 5.5) * 0.35


TUR = {"whoosh": whoosh, "pop": pop, "ding": ding}
for t, tur in olaylar:
    add(TUR[tur](), max(0, t))
out = np.tanh(out) * 0.9
w = wave.open(sys.argv[1], "wb")
w.setnchannels(1)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((out * 32767).astype(np.int16).tobytes())
w.close()
print("efekt", len(olaylar))
