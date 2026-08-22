import Phaser from "phaser";
import { BODY_RADIUS, HEALS, MAX_ARMOR, MAX_HP, WEAPONS, type WeaponId } from "../config";
import type { Fighter } from "../entities/fighter";
import { ammoOf } from "../entities/fighter";
import { Bullet } from "../entities/bullet";
import { sfxPlay } from "./audio";
import type { PickupKind } from "../types";

export type CombatFx = {
  shake: (trauma: number) => void;
  flash: (sprite: Phaser.GameObjects.Sprite) => void;
  numbers: (x: number, y: number, text: string, color: string) => void;
  impact: (x: number, y: number) => void;
};

export function fireAt(
  bullets: Phaser.Physics.Arcade.Group,
  fighter: Fighter,
  angle: number,
  fx: CombatFx,
) {
  if (!fighter.alive || fighter.fireCd > 0 || fighter.falling) return;
  const w = WEAPONS[fighter.weapon];
  if (w.id !== "fists" && ammoOf(fighter) <= 0) return;

  fighter.fireCd = 1 / w.rate;
  if (w.ammo) fighter.ammoPool[w.ammo] = Math.max(0, fighter.ammoPool[w.ammo] - 1);

  const ox = fighter.sprite.x + Math.cos(angle) * 22;
  const oy = fighter.sprite.y + Math.sin(angle) * 22;
  sfxPlay.shoot(w.id);
  if (fighter.isPlayer) fx.shake(w.id === "shotgun" ? 0.28 : 0.12);

  if (w.id === "fists") {
    meleeHit(fighter, angle, w.damage, w.knockback, fx);
    return;
  }

  for (let i = 0; i < w.pellets; i++) {
    const spread = (Math.random() * 2 - 1) * w.spread;
    const a = angle + spread;
    const b = bullets.get(ox, oy, "bullet", 0) as Bullet | null;
    if (!b) continue;
    const life = (w.range / w.speed) * 1000;
    b.fire(ox, oy, Math.cos(a) * w.speed, Math.sin(a) * w.speed, w.damage, fighter.id, life, w.knockback);
    b.play("bullet-spin", true);
  }
}

function meleeHit(fighter: Fighter, angle: number, dmg: number, knock: number, fx: CombatFx) {
  const list = (fighter.sprite.scene as unknown as { fighters: Fighter[] }).fighters;
  if (!list) return;
  const tx = fighter.sprite.x + Math.cos(angle) * 36;
  const ty = fighter.sprite.y + Math.sin(angle) * 36;
  for (const other of list) {
    if (!other.alive || other.id === fighter.id) continue;
    const dx = other.sprite.x - tx;
    const dy = other.sprite.y - ty;
    if (dx * dx + dy * dy < 40 * 40) {
      applyDamage(other, dmg, fighter, Math.cos(angle) * knock, Math.sin(angle) * knock, fx);
    }
  }
}

export function applyDamage(
  target: Fighter,
  dmg: number,
  attacker: Fighter | null,
  kx: number,
  ky: number,
  fx: CombatFx,
) {
  if (!target.alive || target.invuln > 0) return;
  target.healLeft = 0;
  target.healRate = 0;
  let left = dmg;
  if (target.armor > 0) {
    const soak = Math.min(target.armor, left * 0.7);
    target.armor -= soak;
    left -= soak;
  }
  target.hp -= left;
  const body = target.sprite.body as Phaser.Physics.Arcade.Body | null;
  if (body) body.setVelocity(body.velocity.x + kx, body.velocity.y + ky);
  fx.flash(target.sprite);
  fx.numbers(target.sprite.x, target.sprite.y - 28, `-${Math.round(dmg)}`, "#ff6b7a");
  fx.impact(target.sprite.x, target.sprite.y);
  sfxPlay.hit();
  if (target.isPlayer) fx.shake(0.34);

  if (target.hp <= 0) {
    target.hp = 0;
    killFighter(target, attacker, fx);
  }
}

export function killFighter(target: Fighter, attacker: Fighter | null, fx: CombatFx) {
  if (!target.alive) return;
  target.alive = false;
  target.hp = 0;
  if (attacker && attacker.alive) attacker.kills += 1;
  sfxPlay.death();
  fx.numbers(target.sprite.x, target.sprite.y - 10, "DOWN", "#f4f0e6");
  target.sprite.setVelocity(0, 0);
  target.sprite.scene.tweens.add({
    targets: [target.sprite, target.ring],
    alpha: 0,
    scale: 0.4,
    duration: 280,
    onComplete: () => {
      target.sprite.disableBody(true, true);
      target.ring.setVisible(false);
    },
  });
}

export function startHeal(target: Fighter, kind: "bandage" | "medkit", fx: CombatFx) {
  const spec = HEALS[kind];
  target.healLeft = spec.amount;
  target.healRate = spec.amount / spec.duration;
  fx.numbers(target.sprite.x, target.sprite.y - 24, spec.label.toUpperCase(), "#3ddc97");
}

export function tickHeal(target: Fighter, dt: number) {
  if (target.healLeft <= 0 || !target.alive) return;
  const step = Math.min(target.healLeft, target.healRate * dt);
  target.hp = Math.min(MAX_HP, target.hp + step);
  target.healLeft -= step;
  if (target.healLeft <= 0) {
    target.healLeft = 0;
    target.healRate = 0;
  }
}

export function giveArmor(target: Fighter, amount: number, fx: CombatFx) {
  target.armor = Math.min(MAX_ARMOR, target.armor + amount);
  fx.numbers(target.sprite.x, target.sprite.y - 24, "ARMOR", "#3ec6ff");
}

export function giveWeapon(target: Fighter, weapon: WeaponId, fx: CombatFx) {
  const w = WEAPONS[weapon];
  target.weapon = weapon;
  if (w.ammo) target.ammoPool[w.ammo] += w.starter;
  fx.numbers(target.sprite.x, target.sprite.y - 24, w.name.toUpperCase(), "#f4f0e6");
}

export function giveAmmo(target: Fighter, kind: PickupKind, fx: CombatFx) {
  if (kind === "ammo-light") {
    target.ammoPool.light += 18;
    fx.numbers(target.sprite.x, target.sprite.y - 24, "+LIGHT", "#fbbf24");
  } else if (kind === "ammo-shell") {
    target.ammoPool.shell += 8;
    fx.numbers(target.sprite.x, target.sprite.y - 24, "+SHELLS", "#fb7185");
  } else if (kind === "ammo-rifle") {
    target.ammoPool.rifle += 16;
    fx.numbers(target.sprite.x, target.sprite.y - 24, "+RIFLE", "#34d399");
  }
}

export function hasLineOfSight(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  blockers: Array<{ x: number; y: number; hw: number; hh: number }>,
) {
  const steps = 10;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    for (const b of blockers) {
      if (Math.abs(x - b.x) < b.hw + BODY_RADIUS * 0.4 && Math.abs(y - b.y) < b.hh + BODY_RADIUS * 0.4) {
        return false;
      }
    }
  }
  return true;
}

export function canSee(viewer: Fighter, target: Fighter) {
  if (target.bushId < 0) return true;
  return viewer.bushId === target.bushId;
}
