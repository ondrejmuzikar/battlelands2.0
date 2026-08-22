import Phaser from "phaser";
import {
  BODY_RADIUS,
  BOT_COLORS,
  BOT_SPEED,
  MAX_HP,
  PLAYER_SPEED,
  SKINS,
  WEAPONS,
  type SkinId,
  type WeaponId,
} from "../config";
import type { FighterData } from "../types";

export type Fighter = FighterData & {
  sprite: Phaser.Physics.Arcade.Sprite;
  ring: Phaser.GameObjects.Arc;
  chute?: Phaser.GameObjects.Image;
  shadow?: Phaser.GameObjects.Arc;
  reloadRing?: Phaser.GameObjects.Graphics;
};

export function createFighter(
  scene: Phaser.Scene,
  id: number,
  x: number,
  y: number,
  isPlayer: boolean,
  skin: SkinId = "sunny",
): Fighter {
  const sprite = scene.physics.add.sprite(x, y, "hero", 0);
  sprite.setDisplaySize(54, 54);
  sprite.setCircle(BODY_RADIUS, 32, 38);
  sprite.setCollideWorldBounds(true);
  sprite.setDepth(y);
  sprite.setDamping(true);
  sprite.setDrag(0);
  sprite.setMaxVelocity(isPlayer ? PLAYER_SPEED : BOT_SPEED);
  const color = isPlayer ? (SKINS.find((s) => s.id === skin)?.tint ?? 0xffe08a) : BOT_COLORS[id % BOT_COLORS.length]!;
  sprite.setTint(color);
  const ring = scene.add.circle(x, y + 18, 14, color, 0.0);
  ring.setStrokeStyle(3, color, 0.95);
  ring.setDepth(y - 1);
  const data: Fighter = {
    id,
    isPlayer,
    name: isPlayer ? "You" : `Bot ${id}`,
    color,
    skin,
    hp: MAX_HP,
    armor: 0,
    alive: true,
    weapon: "fists",
    ammo: 0,
    clip: 0,
    reloadT: 0,
    fireCd: 0,
    aim: 0,
    kills: 0,
    damageDealt: 0,
    aiState: "loot",
    aiTimer: 0,
    targetId: -1,
    invuln: 1.4,
    bushId: -1,
    healLeft: 0,
    healRate: 0,
    falling: false,
    fallT: 1,
    dropX: x,
    dropY: y,
    revealT: 0,
    looted: false,
    sprite,
    ring,
  };
  sprite.setData("fid", id);
  return data;
}

export function faceFromAim(f: Fighter) {
  const deg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Wrap(f.aim));
  let dir: "right" | "left" | "down" | "up" = "down";
  if (deg >= -45 && deg < 45) dir = "right";
  else if (deg >= 45 && deg < 135) dir = "down";
  else if (deg >= -135 && deg < -45) dir = "up";
  else dir = "left";
  const moving = f.sprite.body && f.sprite.body.velocity.length() > 18;
  const anim = moving ? `walk-${dir}` : undefined;
  if (anim) {
    if (f.sprite.anims.currentAnim?.key !== anim) f.sprite.play(anim, true);
  } else {
    f.sprite.anims.stop();
    f.sprite.setFrame({ down: 0, left: 4, right: 8, up: 12 }[dir]);
  }
}

export function syncFighterDepth(f: Fighter) {
  f.sprite.setDepth(f.sprite.y);
  f.ring.setPosition(f.sprite.x, f.sprite.y + 20);
  f.ring.setDepth(f.sprite.y - 1);
  if (f.chute) {
    f.chute.setPosition(f.sprite.x, f.sprite.y - 42);
    f.chute.setDepth(f.sprite.y + 60);
  }
  if (f.shadow) {
    f.shadow.setPosition(f.dropX, f.dropY + 18);
    f.shadow.setRadius(10 + f.fallT * 28);
    f.shadow.setVisible(f.falling);
  }
}

export function magOf(weapon: WeaponId) {
  return WEAPONS[weapon].mag;
}
