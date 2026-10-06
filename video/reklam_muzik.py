# Telifsiz arka plan müziği üretir (numpy ile sentez): 124 BPM, enerjik, sonunda vuruşlu kapanış.
import numpy as np, wave, sys
SR = 44100; BPM = 124; beat = 60 / BPM
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 24.0
DROP = float(sys.argv[3]) if len(sys.argv) > 3 else 19.15   # kapanış kartının başladığı an
n = int(SR * DUR); t = np.arange(n) / SR
out = np.zeros(n)
def add(sig, at):
    i = int(at * SR)
    if i >= n: return
    j = min(n, i + len(sig)); out[i:j] += sig[: j - i]
def kick():
    d = 0.32; x = np.arange(int(SR * d)) / SR
    f = 150 * np.exp(-x * 28) + 48
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 9) * 1.0
def clap():
    d = 0.18; x = np.arange(int(SR * d)) / SR
    rng = np.random.default_rng(1); nz = rng.standard_normal(len(x))
    nz = np.convolve(nz, np.ones(3) / 3, "same") - np.convolve(nz, np.ones(40) / 40, "same")
    return nz * np.exp(-x * 26) * 0.42
def hat(open_=False):
    d = 0.16 if open_ else 0.05; x = np.arange(int(SR * d)) / SR
    rng = np.random.default_rng(2); nz = rng.standard_normal(len(x))
    nz = nz - np.convolve(nz, np.ones(8) / 8, "same")
    return nz * np.exp(-x * (18 if open_ else 70)) * 0.16
def bass(freq, d):
    x = np.arange(int(SR * d)) / SR
    s = np.sin(2 * np.pi * freq * x) + 0.35 * np.sin(2 * np.pi * 2 * freq * x) + 0.15 * np.sign(np.sin(2 * np.pi * freq * x))
    return s * np.minimum(1, x * 200) * np.exp(-x * 5) * 0.42
def stab(freqs, d=0.22):
    x = np.arange(int(SR * d)) / SR; s = np.zeros(len(x))
    for f in freqs:
        s += np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + np.sin(2 * np.pi * f * x)
    return s / len(freqs) * np.exp(-x * 14) * 0.2
# La minör: Am - F - C - G (her akor 1 ölçü)
ROOTS = [55.0, 43.65, 65.41, 49.0]
CH = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]
bars = int(DUR / (4 * beat)) + 1
for b in range(bars):
    t0 = b * 4 * beat; r = ROOTS[b % 4]; c = CH[b % 4]
    giris = t0 < 2 * beat          # ilk yarım ölçü sade başlasın
    for k in range(4):
        tb = t0 + k * beat
        if tb >= DROP - 0.05 and tb < DROP + 0.02: pass
        add(kick(), tb)
        if k in (1, 3): add(clap(), tb)
        add(hat(), tb + beat / 2); add(hat(), tb + beat / 4 * 3) if k % 2 else None
        if k == 3: add(hat(True), tb + beat / 2)
    for k, mul in enumerate([1, 1, 2, 1, 1.5, 1, 2, 1]):   # sekizlik bas yürüyüşü
        add(bass(r * mul, beat / 2 * 0.95), t0 + k * beat / 2)
    for k in (0.5, 1.5, 2.25, 3.5):                         # senkoplu akor vuruşları
        add(stab(c), t0 + k * beat)
# Kapanış kartına yükselen süpürme + vuruş
ris = np.arange(int(SR * 1.6)) / SR
rng = np.random.default_rng(3); nz = rng.standard_normal(len(ris))
nz = nz - np.convolve(nz, np.ones(30) / 30, "same")
add(nz * (ris / 1.6) ** 2.5 * 0.35, DROP - 1.6)
bx = np.arange(int(SR * 1.4)) / SR
add(np.sin(2 * np.pi * np.cumsum(90 * np.exp(-bx * 6) + 38) / SR) * np.exp(-bx * 3) * 1.3, DROP)
# Bitişte kısılma, hafif sıkıştırma
out *= np.clip((DUR - t) / 0.8, 0, 1) * np.clip(t / 0.05, 0, 1)
out = np.tanh(out * 1.4) * 0.85
st = np.stack([out, np.roll(out, 9)], 1)   # hafif stereo genişlik
w = wave.open(sys.argv[1], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((st * 32767).astype(np.int16).tobytes()); w.close()
print("müzik", DUR, "sn")
