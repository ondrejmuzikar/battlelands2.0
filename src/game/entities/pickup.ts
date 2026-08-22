import Phaser from "phaser";
import type { PickupKind } from "../types";
import { AMMO, WEAPONS, type WeaponId } from "../config";

export type Pickup = {
  kind: PickupKind;
  sprite: Phaser.Physics.Arcade.Image;
  alive: boolean;
};

const KEY: Record<PickupKind, string> = {
  pistol: "pistol",
  shotgun: "shotgun",
  rifle: "rifle",
  medkit: "medkit",
  bandage: "bandage",
  armor: "armor",
  "ammo-light": "ammo-light",
  "ammo-shell": "ammo-shell",
  "ammo-rifle": "ammo-rifle",
};

export function spawnPickup(scene: Phaser.Scene, kind: PickupKind, x: number, y: number): Pickup {
  const sprite = scene.physics.add.image(x, y, KEY[kind]);
  const size = kind.startsWith("ammo") ? 30 : kind === "bandage" ? 32 : 36;
  sprite.setDisplaySize(size, size);
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
  return kind === "pistol" || kind === "shotgun" || kind === "rifle";
}

export function pickupLabel(kind: PickupKind) {
  if (kind === "medkit") return "Medkit";
  if (kind === "bandage") return "Bandage";
  if (kind === "armor") return "Armor";
  if (kind === "ammo-light") return `${AMMO.light.name} ammo`;
  if (kind === "ammo-shell") return `${AMMO.shell.name} ammo`;
  if (kind === "ammo-rifle") return `${AMMO.rifle.name} ammo`;
  return WEAPONS[kind].name;
}
