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
    this.load.spritesheet("hero", "/assets/characters/hero.png", {
      frameWidth: 96,
      frameHeight: 96,
    });
    this.load.spritesheet("bullet", "/assets/fx/bullet.png", {
      frameWidth: 128,
      frameHeight: 128,
    });
    this.load.spritesheet("impact", "/assets/fx/impact.png", {
      frameWidth: 128,
      frameHeight: 128,
    });

    this.load.on("progress", (v: number) => {
      useGameStore.getState().setProgress(v);
    });
  }

  create() {
    this.anims.create({
      key: "walk-down",
      frames: this.anims.generateFrameNumbers("hero", { start: 0, end: 3 }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-left",
      frames: this.anims.generateFrameNumbers("hero", { start: 4, end: 7 }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-right",
      frames: this.anims.generateFrameNumbers("hero", { start: 8, end: 11 }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: "walk-up",
      frames: this.anims.generateFrameNumbers("hero", { start: 12, end: 15 }),
      frameRate: 9,
      repeat: -1,
    });
    this.anims.create({
      key: "bullet-spin",
      frames: this.anims.generateFrameNumbers("bullet", { start: 0, end: 3 }),
      frameRate: 14,
      repeat: -1,
    });
    this.anims.create({
      key: "impact-burst",
      frames: this.anims.generateFrameNumbers("impact", { start: 0, end: 3 }),
      frameRate: 18,
      repeat: 0,
    });

    this.scene.start("arena");
  }
}
