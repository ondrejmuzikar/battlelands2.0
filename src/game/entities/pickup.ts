import Phaser from "phaser";
import type { PickupKind } from "../types";
import { WEAPONS, type WeaponId } from "../config";

export type Pickup = {
  kind: PickupKind;
  sprite: Phaser.Physics.Arcade.Image;
  alive: boolean;
  ammo?: number;
  progress: number;
};

const KEY: Record<PickupKind, string> = {
  pistol: "pistol",
  shotgun: "shotgun",
  ar: "rifle",
  sniper: "sniper",
  smg: "smg",
  bazooka: "bazooka",
  minigun: "minigun",
  medkit: "medkit",
  bandage: "bandage",
  armor: "armor",
};

export function spawnPickup(scene: Phaser.Scene, kind: PickupKind, x: number, y: number, ammo?: number): Pickup {
  const sprite = scene.physics.add.image(x, y, KEY[kind]);
  sprite.setDisplaySize(36, 36);
  sprite.setDepth(y);
  const body = sprite.body as Phaser.Physics.Arcade.Body;
  body.setAllowGravity(false);
  body.setImmovable(true);
  sprite.setData("kind", kind);
  scene.tweens.add({
    targets: sprite,
    y: y - 5,
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return { kind, sprite, alive: true, ammo, progress: 0 };
}

export function pulsePickup(scene: Phaser.Scene, x: number, y: number, color = 0xfff3c4) {
  const ring = scene.add.circle(x, y, 10, color, 0.35).setDepth(y + 40);
  scene.tweens.add({
    targets: ring,
    scale: 2.4,
    alpha: 0,
    duration: 220,
    onComplete: () => ring.destroy(),
  });
}

export function isWeapon(kind: PickupKind): kind is Extract<PickupKind, WeaponId> {
  return (
    kind === "pistol" ||
    kind === "shotgun" ||
    kind === "ar" ||
    kind === "sniper" ||
    kind === "smg" ||
    kind === "bazooka" ||
    kind === "minigun"
  );
}

export function pickupLabel(kind: PickupKind) {
  if (kind === "medkit") return "Medkit";
  if (kind === "bandage") return "Bandage";
  if (kind === "armor") return "Shield";
  return WEAPONS[kind].name;
}
