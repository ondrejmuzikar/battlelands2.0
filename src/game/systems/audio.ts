import { useGameStore } from "../store";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC({ latencyHint: "interactive" });
  master = ctx.createGain();
  sfx = ctx.createGain();
  sfx.gain.value = 0.7;
  master.gain.value = 0.85;
  sfx.connect(master);
  master.connect(ctx.destination);
  return ctx;
}

export function unlockAudio() {
  const c = ensure();
  if (c.state === "suspended") void c.resume();
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function beep(freq: number, dur: number, type: OscillatorType, gain = 0.12, slide = 0) {
  if (useGameStore.getState().muted) return;
  const c = ensure();
  if (c.state !== "running") return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), c.currentTime + dur);
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(g);
  g.connect(sfx!);
  osc.start();
  osc.stop(c.currentTime + dur + 0.02);
  osc.onended = () => {
    osc.disconnect();
    g.disconnect();
  };
}

export const sfxPlay = {
  shoot(kind: string) {
    const rate = 1 + (Math.random() * 0.16 - 0.08);
    if (kind === "shotgun") {
      beep(140 * rate, 0.12, "square", 0.16, -80);
      beep(90 * rate, 0.16, "sawtooth", 0.08, -40);
    } else if (kind === "rifle") {
      beep(520 * rate, 0.07, "square", 0.1, -180);
    } else if (kind === "pistol") {
      beep(380 * rate, 0.05, "square", 0.09, -120);
    } else {
      beep(180 * rate, 0.08, "triangle", 0.08, -60);
    }
  },
  hit() {
    beep(220 + Math.random() * 40, 0.07, "square", 0.1, -100);
  },
  pickup() {
    beep(660, 0.08, "sine", 0.08, 220);
  },
  death() {
    beep(180, 0.22, "sawtooth", 0.14, -140);
  },
  win() {
    beep(523, 0.12, "sine", 0.1, 0);
    setTimeout(() => beep(659, 0.12, "sine", 0.1, 0), 90);
    setTimeout(() => beep(784, 0.22, "sine", 0.12, 0), 180);
  },
  land() {
    beep(140, 0.12, "triangle", 0.1, -40);
  },
  click() {
    beep(440, 0.04, "sine", 0.05, 0);
  },
};
