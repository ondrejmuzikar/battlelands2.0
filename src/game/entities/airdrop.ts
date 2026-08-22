import Phaser from "phaser";
import { AIRDROP_OPEN } from "../config";
import { spawnPickup, type Pickup } from "./pickup";
import { AIRDROP_LOOT } from "../world/loot";

export type Airdrop = {
  x: number;
  y: number;
  state: "falling" | "landed" | "opening" | "opened";
  t: number;
  crate: Phaser.GameObjects.Image;
  chute: Phaser.GameObjects.Image;
  smoke: Phaser.GameObjects.Image;
  ring: Phaser.GameObjects.Graphics;
  openT: number;
};

export function spawnAirdrop(scene: Phaser.Scene, x: number, y: number): Airdrop {
  const chute = scene.add.image(x, y - 640, "parachute").setDisplaySize(72, 58).setDepth(y + 90);
  const crate = scene.add.image(x, y - 590, "dropcrate").setDisplaySize(48, 44).setDepth(y + 88);
  const smoke = scene.add.image(x, y - 700, "smoke").setDisplaySize(36, 160).setAlpha(0.75).setDepth(y + 86);
  const ring = scene.add.graphics().setDepth(y + 100);
  return { x, y, state: "falling", t: 0, crate, chute, smoke, ring, openT: 0 };
}

export function updateAirdrop(drop: Airdrop, dt: number) {
  if (drop.state === "falling") {
    drop.t += dt / 4.4;
    const k = Math.min(1, drop.t);
    const cy = drop.y - 590 + 590 * k;
    drop.crate.setPosition(drop.x + Math.sin(drop.t * 6) * 10, cy);
    drop.chute.setPosition(drop.x + Math.sin(drop.t * 6) * 10, cy - 48);
    drop.smoke.setPosition(drop.x, cy - 110);
    drop.smoke.setDisplaySize(36, 80 + (1 - k) * 120);
    drop.smoke.setAlpha(0.55 + Math.sin(drop.t * 8) * 0.15);
    if (k >= 1) {
      drop.state = "landed";
      drop.chute.setVisible(false);
      drop.smoke.setVisible(false);
      drop.crate.setPosition(drop.x, drop.y);
    }
  }
}

export function tickOpen(drop: Airdrop, standing: boolean, dt: number) {
  if (drop.state === "opened" || drop.state === "falling") return 0;
  if (!standing) {
    drop.openT = 0;
    drop.state = "landed";
    drop.ring.clear();
    return 0;
  }
  drop.state = "opening";
  drop.openT += dt;
  const p = Math.min(1, drop.openT / AIRDROP_OPEN);
  drawProgress(drop.ring, drop.x, drop.y, p);
  return p;
}

export function finishOpen(scene: Phaser.Scene, drop: Airdrop): Pickup[] {
  drop.state = "opened";
  drop.ring.clear();
  drop.crate.setVisible(false);
  const out: Pickup[] = [];
  AIRDROP_LOOT.forEach((kind, i) => {
    const a = (i / AIRDROP_LOOT.length) * Math.PI * 2;
    out.push(spawnPickup(scene, kind, drop.x + Math.cos(a) * 36, drop.y + Math.sin(a) * 36));
  });
  return out;
}

function drawProgress(g: Phaser.GameObjects.Graphics, x: number, y: number, p: number) {
  g.clear();
  g.lineStyle(5, 0x101820, 0.45);
  g.strokeCircle(x, y - 28, 22);
  g.lineStyle(5, 0xffe08a, 1);
  g.beginPath();
  g.arc(x, y - 28, 22, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2, false);
  g.strokePath();
}

export function destroyAirdrop(drop: Airdrop) {
  drop.crate.destroy();
  drop.chute.destroy();
  drop.smoke.destroy();
  drop.ring.destroy();
}
