import Phaser from "phaser";
import { WORLD } from "../config";
import { BUILDINGS, BUSHES, CRATES, PALMS, PATCHES, ROADS } from "./mapData";

export function buildMap(scene: Phaser.Scene) {
  const island = scene.add.image(WORLD / 2, WORLD / 2, "island");
  island.setDisplaySize(WORLD, WORLD);
  island.setDepth(0);

  const ground = scene.add.graphics().setDepth(1);
  for (const p of PATCHES) {
    ground.fillStyle(p.color, p.alpha);
    ground.fillEllipse(p.x, p.y, p.w, p.h);
  }

  const roads = scene.add.graphics().setDepth(2);
  for (const path of ROADS) {
    roads.lineStyle(28, 0xc4a46a, 0.85);
    roads.beginPath();
    roads.moveTo(path[0]!.x, path[0]!.y);
    for (let i = 1; i < path.length; i++) roads.lineTo(path[i]!.x, path[i]!.y);
    roads.strokePath();
    roads.lineStyle(6, 0xe8d7a8, 0.55);
    roads.beginPath();
    roads.moveTo(path[0]!.x, path[0]!.y);
    for (let i = 1; i < path.length; i++) roads.lineTo(path[i]!.x, path[i]!.y);
    roads.strokePath();
  }

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

  const bushSprites: Phaser.GameObjects.Image[] = [];
  for (const b of BUSHES) {
    const spr = scene.add.image(b.x, b.y, "bush");
    spr.setDisplaySize(b.r * 2.15, b.r * 1.85);
    spr.setDepth(b.y + 24);
    bushSprites.push(spr);
  }

  scene.physics.world.setBounds(80, 80, WORLD - 160, WORLD - 160);
  return { island, staticGroup, bushSprites };
}
