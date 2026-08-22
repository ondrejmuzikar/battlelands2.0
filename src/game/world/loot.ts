import Phaser from "phaser";
import { BUILDINGS, mulberry32, randomLandPoint, ALL_BLOCKERS } from "./mapData";
import { spawnPickup, type Pickup } from "../entities/pickup";
import type { PickupKind } from "../types";

const KINDS: PickupKind[] = [
  "pistol", "pistol", "smg", "smg", "shotgun", "ar", "sniper", "medkit", "bandage", "bandage", "armor",
];

export function scatterLoot(scene: Phaser.Scene, seed = 7): Pickup[] {
  const rand = mulberry32(seed);
  const list: Pickup[] = [];
  for (const b of BUILDINGS) {
    const n = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const r = 70 + rand() * 90;
      list.push(spawnPickup(scene, KINDS[Math.floor(rand() * KINDS.length)]!, b.x + Math.cos(a) * r, b.y + Math.sin(a) * r));
    }
  }
  for (let i = 0; i < 18; i++) {
    const p = randomLandPoint(rand, ALL_BLOCKERS, 40);
    list.push(spawnPickup(scene, KINDS[Math.floor(rand() * KINDS.length)]!, p.x, p.y));
  }
  return list;
}

export const AIRDROP_LOOT: PickupKind[] = ["minigun", "bazooka", "armor", "medkit"];
export const CHEST_LOOT: PickupKind[] = ["ar", "shotgun", "smg", "sniper", "armor", "medkit"];
