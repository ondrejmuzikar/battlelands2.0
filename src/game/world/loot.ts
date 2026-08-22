import Phaser from "phaser";
import { BUILDINGS, mulberry32, randomLandPoint, ALL_BLOCKERS } from "./mapData";
import { spawnPickup, type Pickup } from "../entities/pickup";
import type { PickupKind } from "../types";

const KINDS: PickupKind[] = [
  "pistol",
  "pistol",
  "shotgun",
  "rifle",
  "medkit",
  "bandage",
  "bandage",
  "armor",
  "ammo-light",
  "ammo-light",
  "ammo-shell",
  "ammo-rifle",
  "ammo-rifle",
];

export function scatterLoot(scene: Phaser.Scene, seed = 7): Pickup[] {
  const rand = mulberry32(seed);
  const list: Pickup[] = [];

  for (const b of BUILDINGS) {
    const n = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = 70 + rand() * 90;
      const x = b.x + Math.cos(a) * r;
      const y = b.y + Math.sin(a) * r;
      const kind = KINDS[Math.floor(rand() * KINDS.length)]!;
      list.push(spawnPickup(scene, kind, x, y));
    }
  }

  for (let i = 0; i < 22; i++) {
    const p = randomLandPoint(rand, ALL_BLOCKERS, 40);
    const kind = KINDS[Math.floor(rand() * KINDS.length)]!;
    list.push(spawnPickup(scene, kind, p.x, p.y));
  }

  return list;
}

export const AIRDROP_LOOT: PickupKind[] = ["rifle", "armor", "medkit", "ammo-rifle", "shotgun"];
