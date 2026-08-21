import { LAND_RADIUS, WORLD, WORLD_CENTER } from "../config";
import type { Blocker } from "../types";

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
  { x: 360, y: 480 },
  { x: 420, y: 980 },
  { x: 380, y: 1580 },
  { x: 720, y: 380 },
  { x: 1240, y: 360 },
  { x: 1680, y: 400 },
  { x: 2060, y: 520 },
  { x: 2100, y: 980 },
  { x: 2080, y: 1420 },
  { x: 1900, y: 1960 },
  { x: 1320, y: 2060 },
  { x: 780, y: 2040 },
  { x: 340, y: 1900 },
  { x: 980, y: 860 },
  { x: 1460, y: 920 },
  { x: 700, y: 1480 },
];

export const CRATES: Array<{ x: number; y: number; key: "crate" | "barrel" | "rock" | "tent" }> = [
  { x: 620, y: 800, key: "crate" },
  { x: 720, y: 640, key: "barrel" },
  { x: 1080, y: 640, key: "crate" },
  { x: 1400, y: 720, key: "barrel" },
  { x: 1780, y: 860, key: "rock" },
  { x: 540, y: 1360, key: "crate" },
  { x: 980, y: 1220, key: "tent" },
  { x: 1220, y: 1400, key: "barrel" },
  { x: 1680, y: 1320, key: "crate" },
  { x: 740, y: 1820, key: "rock" },
  { x: 1180, y: 1800, key: "crate" },
  { x: 1700, y: 1660, key: "barrel" },
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

export function randomLandPoint(
  rand: () => number,
  blockers: Blocker[],
  pad = 28,
): { x: number; y: number } {
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

export const ALL_BLOCKERS: Blocker[] = [
  ...BUILDINGS.map((b) => ({ x: b.x, y: b.y, hw: b.hw, hh: b.hh })),
  ...CRATES.map((c) => ({ x: c.x, y: c.y, hw: 18, hh: 16 })),
];

export { WORLD };
