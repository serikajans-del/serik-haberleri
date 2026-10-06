# Belgesel havasında telifsiz arka plan müziği (numpy ile sentez): koyu açılış, DONUS anından sonra aydınlanan akorlar.
import numpy as np, wave, sys

SR = 44100
DUR = float(sys.argv[2])
DONUS = float(sys.argv[3])
SADE = len(sys.argv) > 4 and sys.argv[4] == "sade"   # yalnızca ped: nabız ve gümleme yok
n = int(SR * DUR)
t = np.arange(n) / SR
out = np.zeros(n)


def add(sig, at, gain=1.0):
    i = int(at * SR)
    if i >= n:
        return
    j = min(n, i + len(sig))
    out[i:j] += sig[: j - i] * gain


def pad(freqs, d):
    x = np.arange(int(SR * d)) / SR
    s = np.zeros(len(x))
    for f in freqs:
        for det in (-0.35, 0.0, 0.35):          # hafif akortsuz üç katman = geniş ped
            s += np.sin(2 * np.pi * (f + det) * x) + 0.3 * np.sin(2 * np.pi * 2 * (f + det) * x)
    env = np.minimum(1, x / 1.2) * np.minimum(1, (d - x) / 1.2)
    return s / (len(freqs) * 3) * env


def vurus():
    x = np.arange(int(SR * 0.5)) / SR
    return np.sin(2 * np.pi * np.cumsum(70 * np.exp(-x * 18) + 42) / SR) * np.exp(-x * 7)


def gum():
    x = np.arange(int(SR * 2.2)) / SR
    return np.sin(2 * np.pi * np.cumsum(60 * np.exp(-x * 4) + 32) / SR) * np.exp(-x * 1.8)


KOYU = [[110, 130.81, 164.81], [87.31, 130.81, 174.61], [98, 123.47, 146.83], [110, 130.81, 164.81]]      # Am F G(m) Am
ACIK = [[130.81, 164.81, 196], [98, 146.83, 196], [110, 130.81, 164.81], [87.31, 130.81, 174.61]]          # C G Am F
olcu = 4.4
k = 0
z = 0.0
while z < DUR:
    akor = (KOYU if z < DONUS - 0.1 else ACIK)[k % 4]
    add(pad(akor, olcu + 1.2), z, 0.5)
    add(pad([akor[0] / 2], olcu + 1.2), z, 0.55)                    # bas dron
    if z >= DONUS - 0.1:
        add(pad([akor[2] * 2], olcu + 1.2), z, 0.18)                # üstte parlaklık
    z += olcu
    k += 1
kalp = 60 / 68
for i in range(0 if SADE else int(DUR / kalp)):                                     # yavaş nabız
    add(vurus(), i * kalp, 0.55 if i * kalp < DONUS else 0.4)
    if i % 2 == 1:
        add(vurus(), i * kalp + kalp * 0.28, 0.28)
if not SADE:
    add(gum(), 0.05, 1.0)
    add(gum(), DONUS, 0.9)
out *= np.clip((DUR - t) / 2.5, 0, 1) * np.clip(t / 1.5, 0, 1)
out = np.tanh(out * 1.3) * 0.8
st = np.stack([out, np.roll(out, 14)], 1)
w = wave.open(sys.argv[1], "wb")
w.setnchannels(2)
w.setsampwidth(2)
w.setframerate(SR)
w.writeframes((st * 32767).astype(np.int16).tobytes())
w.close()
print("muzik", DUR)
