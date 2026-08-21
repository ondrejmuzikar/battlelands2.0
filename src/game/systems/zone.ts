import { WORLD, WORLD_CENTER, ZONE_PHASES } from "../config";

export type ZoneState = {
  x: number;
  y: number;
  r: number;
  fromR: number;
  toR: number;
  tx: number;
  ty: number;
  phase: number;
  timer: number;
  shrinking: boolean;
  dmg: number;
};

export function createZone(): ZoneState {
  const first = ZONE_PHASES[0];
  return {
    x: WORLD_CENTER,
    y: WORLD_CENTER,
    r: 1500,
    fromR: 1500,
    toR: first.radius,
    tx: WORLD_CENTER,
    ty: WORLD_CENTER,
    phase: 0,
    timer: first.wait,
    shrinking: false,
    dmg: first.dmg,
  };
}

export function updateZone(z: ZoneState, dt: number) {
  z.timer -= dt;
  if (z.shrinking) {
    const spec = ZONE_PHASES[Math.min(z.phase, ZONE_PHASES.length - 1)];
    const t = 1 - Math.max(0, z.timer) / spec.shrink;
    const k = Math.min(1, Math.max(0, t));
    z.r = z.fromR + (z.toR - z.fromR) * k;
    z.x += (z.tx - z.x) * Math.min(1, dt * 0.35);
    z.y += (z.ty - z.y) * Math.min(1, dt * 0.35);
    if (z.timer <= 0) {
      z.shrinking = false;
      z.r = z.toR;
      z.phase = Math.min(z.phase + 1, ZONE_PHASES.length - 1);
      const next = ZONE_PHASES[z.phase];
      z.timer = next.wait;
      z.dmg = next.dmg;
      z.fromR = z.r;
      z.toR = next.radius;
      const jitter = 140 - z.phase * 22;
      z.tx = clamp(z.x + (Math.random() * 2 - 1) * jitter, 480, WORLD - 480);
      z.ty = clamp(z.y + (Math.random() * 2 - 1) * jitter, 480, WORLD - 480);
    }
  } else if (z.timer <= 0) {
    z.shrinking = true;
    const spec = ZONE_PHASES[Math.min(z.phase, ZONE_PHASES.length - 1)];
    z.timer = spec.shrink;
    z.fromR = z.r;
    z.toR = spec.radius;
  }
}

export function inZone(z: ZoneState, x: number, y: number) {
  const dx = x - z.x;
  const dy = y - z.y;
  return dx * dx + dy * dy <= z.r * z.r;
}

export function zoneLabel(z: ZoneState) {
  if (z.shrinking) return `Shrinking ${Math.ceil(z.timer)}s`;
  return `Next close ${Math.ceil(z.timer)}s`;
}

export function drawZone(g: Phaser.GameObjects.Graphics, z: ZoneState) {
  g.clear();
  const outer = WORLD * 1.2;
  const steps = 72;
  g.fillStyle(0x1488aa, 0.22);
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2;
    const a1 = ((i + 1) / steps) * Math.PI * 2;
    const ix0 = z.x + Math.cos(a0) * z.r;
    const iy0 = z.y + Math.sin(a0) * z.r;
    const ix1 = z.x + Math.cos(a1) * z.r;
    const iy1 = z.y + Math.sin(a1) * z.r;
    const ox0 = z.x + Math.cos(a0) * outer;
    const oy0 = z.y + Math.sin(a0) * outer;
    const ox1 = z.x + Math.cos(a1) * outer;
    const oy1 = z.y + Math.sin(a1) * outer;
    g.fillTriangle(ix0, iy0, ox0, oy0, ox1, oy1);
    g.fillTriangle(ix0, iy0, ox1, oy1, ix1, iy1);
  }
  g.lineStyle(6, 0x7af0ea, 0.95);
  g.strokeCircle(z.x, z.y, z.r);
  g.lineStyle(2, 0xffffff, 0.35);
  g.strokeCircle(z.x, z.y, Math.max(20, z.toR));
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}
