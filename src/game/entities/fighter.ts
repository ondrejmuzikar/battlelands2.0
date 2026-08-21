import Phaser from "phaser";
import {
  BODY_RADIUS,
  BOT_COLORS,
  BOT_SPEED,
  MAX_HP,
  PLAYER_SPEED,
  WEAPONS,
  type WeaponId,
} from "../config";
import type { AiState, FighterData } from "../types";

export type Fighter = FighterData & {
  sprite: Phaser.Physics.Arcade.Sprite;
  ring: Phaser.GameObjects.Arc;
};

export function createFighter(
  scene: Phaser.Scene,
  id: number,
  x: number,
  y: number,
  isPlayer: boolean,
): Fighter {
  const sprite = scene.physics.add.sprite(x, y, "hero", 0);
  sprite.setDisplaySize(54, 54);
  sprite.setCircle(BODY_RADIUS, 32, 38);
  sprite.setCollideWorldBounds(true);
  sprite.setDepth(y);
  sprite.setDamping(true);
  sprite.setDrag(0);
  sprite.setMaxVelocity(isPlayer ? PLAYER_SPEED : BOT_SPEED);

  const color = isPlayer ? 0xffe08a : BOT_COLORS[id % BOT_COLORS.length]!;
  const ring = scene.add.circle(x, y + 18, 14, color, 0.0);
  ring.setStrokeStyle(3, color, 0.95);
  ring.setDepth(y - 1);

  const data: Fighter = {
    id,
    isPlayer,
    name: isPlayer ? "You" : `Bot ${id}`,
    color,
    hp: MAX_HP,
    armor: 0,
    alive: true,
    weapon: "fists",
    ammo: 0,
    fireCd: 0,
    aim: 0,
    kills: 0,
    aiState: "loot",
    aiTimer: 0,
    targetId: -1,
    invuln: 1.4,
    sprite,
    ring,
  };
  sprite.setData("fid", id);
  return data;
}

export function setFighterVelocity(f: Fighter, mx: number, my: number, speed: number) {
  f.sprite.setVelocity(mx * speed, my * speed);
}

export function faceFromAim(f: Fighter) {
  const a = f.aim;
  const deg = Phaser.Math.RadToDeg(Phaser.Math.Angle.Wrap(a));
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
    const idle = { down: 0, left: 4, right: 8, up: 12 }[dir];
    f.sprite.setFrame(idle);
  }
}

export function syncFighterDepth(f: Fighter) {
  f.sprite.setDepth(f.sprite.y);
  f.ring.setPosition(f.sprite.x, f.sprite.y + 20);
  f.ring.setDepth(f.sprite.y - 1);
}

export function magOf(weapon: WeaponId) {
  return WEAPONS[weapon].mag === Infinity ? 0 : WEAPONS[weapon].mag;
}
