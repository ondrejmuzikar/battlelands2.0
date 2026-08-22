import { BUSH_RADIUS, LAND_RADIUS, WORLD, WORLD_CENTER } from "../config";
import type { Blocker, BushSpec } from "../types";

export type BuildingSpec = {
  key: "shack" | "warehouse" | "tower";
  x: number;
  y: number;
  displayW: number;
  displayH: number;
  hw: number;
  hh: number;
};

export const BUILDINGS: BuildingSpec[] = [
  { key: "warehouse", x: 560, y: 700, displayW: 210, displayH: 150, hw: 86, hh: 52 },
  { key: "shack", x: 980, y: 540, displayW: 150, displayH: 122, hw: 58, hh: 44 },
  { key: "shack", x: 1500, y: 620, displayW: 150, displayH: 122, hw: 58, hh: 44 },
  { key: "tower", x: 1880, y: 760, displayW: 118, displayH: 160, hw: 38, hh: 48 },
  { key: "warehouse", x: 430, y: 1260, displayW: 210, displayH: 150, hw: 86, hh: 52 },
  { key: "shack", x: 860, y: 1140, displayW: 150, displayH: 122, hw: 58, hh: 44 },
  { key: "warehouse", x: 1320, y: 1280, displayW: 210, displayH: 150, hw: 86, hh: 52 },
  { key: "shack", x: 1760, y: 1180, displayW: 150, displayH: 122, hw: 58, hh: 44 },
  { key: "tower", x: 620, y: 1740, displayW: 118, displayH: 160, hw: 38, hh: 48 },
  { key: "shack", x: 1080, y: 1680, displayW: 150, displayH: 122, hw: 58, hh: 44 },
  { key: "warehouse", x: 1560, y: 1760, displayW: 210, displayH: 150, hw: 86, hh: 52 },
  { key: "shack", x: 1960, y: 1540, displayW: 150, displayH: 122, hw: 58, hh: 44 },
];

export const PALMS: Array<{ x: number; y: number }> = [
  { x: 360, y: 480 }, { x: 420, y: 980 }, { x: 380, y: 1580 }, { x: 720, y: 380 },
  { x: 1240, y: 360 }, { x: 1680, y: 400 }, { x: 2060, y: 520 }, { x: 2100, y: 980 },
  { x: 2080, y: 1420 }, { x: 1900, y: 1960 }, { x: 1320, y: 2060 }, { x: 780, y: 2040 },
  { x: 340, y: 1900 }, { x: 980, y: 860 }, { x: 1460, y: 920 }, { x: 700, y: 1480 },
  { x: 520, y: 520 }, { x: 1840, y: 480 }, { x: 1640, y: 2040 }, { x: 470, y: 1720 },
];

export const CRATES: Array<{ x: number; y: number; key: "crate" | "barrel" | "rock" | "tent" }> = [
  { x: 620, y: 800, key: "crate" }, { x: 720, y: 640, key: "barrel" },
  { x: 1080, y: 640, key: "crate" }, { x: 1400, y: 720, key: "barrel" },
  { x: 1780, y: 860, key: "rock" }, { x: 540, y: 1360, key: "crate" },
  { x: 980, y: 1220, key: "tent" }, { x: 1220, y: 1400, key: "barrel" },
  { x: 1680, y: 1320, key: "crate" }, { x: 740, y: 1820, key: "rock" },
  { x: 1180, y: 1800, key: "crate" }, { x: 1700, y: 1660, key: "barrel" },
  { x: 430, y: 900, key: "rock" }, { x: 2020, y: 1100, key: "rock" },
  { x: 900, y: 1980, key: "tent" }, { x: 1480, y: 480, key: "crate" },
];

export const BUSHES: BushSpec[] = [
  { x: 480, y: 820, r: BUSH_RADIUS }, { x: 640, y: 980, r: BUSH_RADIUS },
  { x: 790, y: 760, r: BUSH_RADIUS }, { x: 1120, y: 740, r: BUSH_RADIUS },
  { x: 1280, y: 980, r: BUSH_RADIUS }, { x: 1580, y: 780, r: BUSH_RADIUS },
  { x: 1740, y: 1020, r: BUSH_RADIUS }, { x: 1960, y: 920, r: BUSH_RADIUS },
  { x: 360, y: 1180, r: BUSH_RADIUS }, { x: 700, y: 1280, r: BUSH_RADIUS },
  { x: 980, y: 1360, r: BUSH_RADIUS }, { x: 1180, y: 1160, r: BUSH_RADIUS },
  { x: 1460, y: 1460, r: BUSH_RADIUS }, { x: 1680, y: 1140, r: BUSH_RADIUS },
  { x: 1900, y: 1340, r: BUSH_RADIUS }, { x: 520, y: 1560, r: BUSH_RADIUS },
  { x: 820, y: 1620, r: BUSH_RADIUS }, { x: 1240, y: 1580, r: BUSH_RADIUS },
  { x: 1420, y: 1880, r: BUSH_RADIUS }, { x: 1760, y: 1880, r: BUSH_RADIUS },
  { x: 1980, y: 1680, r: BUSH_RADIUS }, { x: 640, y: 1980, r: BUSH_RADIUS },
  { x: 1040, y: 1960, r: BUSH_RADIUS }, { x: 880, y: 980, r: BUSH_RADIUS },
  { x: 1540, y: 1040, r: BUSH_RADIUS }, { x: 1100, y: 480, r: BUSH_RADIUS },
];

export const ROADS: Array<Array<{ x: number; y: number }>> = [
  [{ x: 360, y: 1200 }, { x: 560, y: 1180 }, { x: 860, y: 1160 }, { x: 1320, y: 1260 }, { x: 1760, y: 1200 }, { x: 2060, y: 1320 }],
  [{ x: 1200, y: 360 }, { x: 1180, y: 620 }, { x: 1240, y: 980 }, { x: 1320, y: 1320 }, { x: 1280, y: 1680 }, { x: 1200, y: 2060 }],
  [{ x: 520, y: 680 }, { x: 720, y: 860 }, { x: 980, y: 1080 }, { x: 1280, y: 1480 }, { x: 1560, y: 1760 }],
];

export const PATCHES: Array<{ x: number; y: number; w: number; h: number; color: number; alpha: number }> = [
  { x: 700, y: 700, w: 280, h: 180, color: 0xc9b27a, alpha: 0.28 },
  { x: 1600, y: 640, w: 260, h: 160, color: 0xd7c48a, alpha: 0.26 },
  { x: 520, y: 1500, w: 240, h: 170, color: 0x6fbf62, alpha: 0.22 },
  { x: 1500, y: 1600, w: 300, h: 200, color: 0x5aa85a, alpha: 0.2 },
  { x: 1100, y: 1100, w: 220, h: 160, color: 0xb89860, alpha: 0.22 },
  { x: 1900, y: 1100, w: 180, h: 220, color: 0xd2b57a, alpha: 0.24 },
  { x: 400, y: 1000, w: 200, h: 140, color: 0x7dcc6e, alpha: 0.2 },
];

export function isLand(x: number, y: number) {
  const dx = x - WORLD_CENTER;
  const dy = y - WORLD_CENTER;
  return dx * dx + dy * dy < LAND_RADIUS * LAND_RADIUS;
}

export function hitsBlocker(x: number, y: number, blockers: Blocker[], pad = 18) {
  for (const b of blockers) {
    if (Math.abs(x - b.x) < b.hw + pad && Math.abs(y - b.y) < b.hh + pad) return true;
  }
  return false;
}

export function randomLandPoint(rand: () => number, blockers: Blocker[], pad = 28): { x: number; y: number } {
  for (let i = 0; i < 80; i++) {
    const a = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * (LAND_RADIUS - 80);
    const x = WORLD_CENTER + Math.cos(a) * r;
    const y = WORLD_CENTER + Math.sin(a) * r;
    if (isLand(x, y) && !hitsBlocker(x, y, blockers, pad)) return { x, y };
  }
  return { x: WORLD_CENTER, y: WORLD_CENTER };
}

export function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function bushIndexAt(x: number, y: number, bushes: BushSpec[] = BUSHES) {
  for (let i = 0; i < bushes.length; i++) {
    const b = bushes[i]!;
    const dx = x - b.x;
    const dy = y - b.y;
    if (dx * dx + dy * dy <= b.r * b.r) return i;
  }
  return -1;
}

export const ALL_BLOCKERS: Blocker[] = [
  ...BUILDINGS.map((b) => ({ x: b.x, y: b.y, hw: b.hw, hh: b.hh })),
  ...CRATES.map((c) => ({ x: c.x, y: c.y, hw: 18, hh: 16 })),
];

export { WORLD };
