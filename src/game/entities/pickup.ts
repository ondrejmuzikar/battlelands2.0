import Phaser from "phaser";
import type { PickupKind } from "../types";
import { WEAPONS, type WeaponId } from "../config";

export type Pickup = {
  kind: PickupKind;
  sprite: Phaser.Physics.Arcade.Image;
  alive: boolean;
};

export function spawnPickup(scene: Phaser.Scene, kind: PickupKind, x: number, y: number): Pickup {
  const key =
    kind === "medkit" ? "medkit" : kind === "armor" ? "armor" : kind;
  const sprite = scene.physics.add.image(x, y, key);
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
  return { kind, sprite, alive: true };
}

export function isWeapon(kind: PickupKind): kind is Exclude<PickupKind, "medkit" | "armor"> {
  return kind === "pistol" || kind === "shotgun" || kind === "rifle";
}

export function pickupLabel(kind: PickupKind) {
  if (kind === "medkit") return "Medkit";
  if (kind === "armor") return "Armor";
  return WEAPONS[kind].name;
}
