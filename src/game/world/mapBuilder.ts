import Phaser from "phaser";
import { WORLD } from "../config";
import { BUILDINGS, CRATES, PALMS } from "./mapData";

export function buildMap(scene: Phaser.Scene) {
  const island = scene.add.image(WORLD / 2, WORLD / 2, "island");
  island.setDisplaySize(WORLD, WORLD);
  island.setDepth(0);

  const staticGroup = scene.physics.add.staticGroup();

  for (const b of BUILDINGS) {
    const spr = scene.add.image(b.x, b.y, b.key);
    spr.setDisplaySize(b.displayW, b.displayH);
    spr.setDepth(b.y + 20);
    const body = scene.add.rectangle(b.x, b.y + 8, b.hw * 2, b.hh * 2, 0x000000, 0);
    scene.physics.add.existing(body, true);
    staticGroup.add(body);
  }

  for (const p of PALMS) {
    const spr = scene.add.image(p.x, p.y, "palm");
    spr.setDisplaySize(92, 108);
    spr.setDepth(p.y + 30);
  }

  for (const c of CRATES) {
    const spr = scene.add.image(c.x, c.y, c.key);
    spr.setDisplaySize(c.key === "tent" ? 70 : 48, c.key === "tent" ? 62 : 48);
    spr.setDepth(c.y + 8);
    const body = scene.add.rectangle(c.x, c.y + 4, 32, 28, 0x000000, 0);
    scene.physics.add.existing(body, true);
    staticGroup.add(body);
  }

  scene.physics.world.setBounds(80, 80, WORLD - 160, WORLD - 160);

  return { island, staticGroup };
}
