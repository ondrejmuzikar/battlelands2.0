import Phaser from "phaser";
import { useGameStore } from "../store";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("preload");
  }

  preload() {
    this.load.image("island", "/assets/map/island.png");
    this.load.image("shack", "/assets/props/shack.png");
    this.load.image("warehouse", "/assets/props/warehouse.png");
    this.load.image("tower", "/assets/props/tower.png");
    this.load.image("palm", "/assets/props/palm.png");
    this.load.image("crate", "/assets/props/crate.png");
    this.load.image("barrel", "/assets/props/barrel.png");
    this.load.image("rock", "/assets/props/rock.png");
    this.load.image("bush", "/assets/props/bush.png");
    this.load.image("tent", "/assets/props/tent.png");
    this.load.image("pistol", "/assets/weapons/pistol.png");
    this.load.image("shotgun", "/assets/weapons/shotgun.png");
    this.load.image("rifle", "/assets/weapons/rifle.png");
    this.load.image("medkit", "/assets/weapons/medkit.png");
    this.load.image("armor", "/assets/weapons/armor.png");
    this.load.spritesheet("hero", "/assets/characters/hero.png", { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet("bullet", "/assets/fx/bullet.png", { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet("impact", "/assets/fx/impact.png", { frameWidth: 128, frameHeight: 128 });
    this.load.on("progress", (v: number) => useGameStore.getState().setProgress(v));
  }

  create() {
    bakeIcon(this, "bandage", 0xf87171);
    bakeGun(this, "smg", 0xfbbf24);
    bakeGun(this, "sniper", 0x38bdf8);
    bakeGun(this, "bazooka", 0xfb7185);
    bakeGun(this, "minigun", 0xf59e0b);
    bakeChute(this);
    bakeCrate(this);
    bakeSmoke(this);

    this.anims.create({ key: "walk-down", frames: this.anims.generateFrameNumbers("hero", { start: 0, end: 3 }), frameRate: 9, repeat: -1 });
    this.anims.create({ key: "walk-left", frames: this.anims.generateFrameNumbers("hero", { start: 4, end: 7 }), frameRate: 9, repeat: -1 });
    this.anims.create({ key: "walk-right", frames: this.anims.generateFrameNumbers("hero", { start: 8, end: 11 }), frameRate: 9, repeat: -1 });
    this.anims.create({ key: "walk-up", frames: this.anims.generateFrameNumbers("hero", { start: 12, end: 15 }), frameRate: 9, repeat: -1 });
    this.anims.create({ key: "bullet-spin", frames: this.anims.generateFrameNumbers("bullet", { start: 0, end: 3 }), frameRate: 14, repeat: -1 });
    this.anims.create({ key: "impact-burst", frames: this.anims.generateFrameNumbers("impact", { start: 0, end: 3 }), frameRate: 18, repeat: 0 });
    this.scene.start("arena");
  }
}

function bakeIcon(scene: Phaser.Scene, key: string, fill: number) {
  const g = scene.add.graphics();
  g.fillStyle(0x101820, 1);
  g.fillRoundedRect(2, 2, 44, 44, 10);
  g.fillStyle(fill, 1);
  g.fillRoundedRect(6, 6, 36, 36, 8);
  g.generateTexture(key, 48, 48);
  g.destroy();
}

function bakeGun(scene: Phaser.Scene, key: string, color: number) {
  const g = scene.add.graphics();
  g.fillStyle(0x101820, 1);
  g.fillRoundedRect(4, 16, 40, 16, 5);
  g.fillStyle(color, 1);
  g.fillRoundedRect(7, 19, 34, 10, 3);
  g.fillStyle(0xfff7ed, 1);
  g.fillRect(36, 20, 8, 4);
  g.generateTexture(key, 48, 48);
  g.destroy();
}

function bakeChute(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xff5a36, 1);
  g.slice(32, 28, 26, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340), false);
  g.fillPath();
  g.lineStyle(3, 0xf4f0e6, 1);
  g.lineBetween(16, 28, 32, 52);
  g.lineBetween(48, 28, 32, 52);
  g.generateTexture("parachute", 64, 64);
  g.destroy();
}

function bakeCrate(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xc9782a, 1);
  g.fillRoundedRect(8, 10, 48, 42, 6);
  g.lineStyle(4, 0x7a3f12, 1);
  g.strokeRoundedRect(8, 10, 48, 42, 6);
  g.lineBetween(8, 31, 56, 31);
  g.lineBetween(32, 10, 32, 52);
  g.fillStyle(0xffe08a, 1);
  g.fillCircle(32, 31, 6);
  g.generateTexture("dropcrate", 64, 64);
  g.destroy();
}

function bakeSmoke(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.fillStyle(0xf97316, 0.85);
  g.fillEllipse(24, 10, 18, 16);
  g.fillStyle(0xfb923c, 0.55);
  g.fillEllipse(24, 28, 14, 22);
  g.fillStyle(0xfdba74, 0.35);
  g.fillEllipse(24, 48, 10, 18);
  g.generateTexture("smoke", 48, 64);
  g.destroy();
}
