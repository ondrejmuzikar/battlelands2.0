import { BOT_SPEED, WEAPONS } from "../config";
import type { Fighter } from "../entities/fighter";
import type { Pickup } from "../entities/pickup";
import { isWeapon } from "../entities/pickup";
import { hasLineOfSight } from "./combat";
import { inZone, type ZoneState } from "./zone";
import type { Blocker } from "../types";

export function updateBot(
  bot: Fighter,
  dt: number,
  fighters: Fighter[],
  pickups: Pickup[],
  zone: ZoneState,
  blockers: Blocker[],
  fire: (bot: Fighter, angle: number) => void,
) {
  if (!bot.alive) return;
  bot.aiTimer -= dt;

  const x = bot.sprite.x;
  const y = bot.sprite.y;
  const safe = inZone(zone, x, y);
  const nearEdge = Math.hypot(x - zone.x, y - zone.y) > zone.r * 0.78;

  if (!safe || (zone.shrinking && nearEdge)) {
    bot.aiState = "zone";
  } else if (bot.aiTimer <= 0) {
    const armed = bot.weapon !== "fists" && bot.ammo > 0;
    const threat = nearestEnemy(bot, fighters, 520);
    if (!armed) bot.aiState = "loot";
    else if (threat) bot.aiState = "fight";
    else if (bot.hp < 45 && pickups.some((p) => p.alive && p.kind === "medkit")) bot.aiState = "loot";
    else bot.aiState = Math.random() < 0.7 ? "wander" : "fight";
    bot.aiTimer = 0.35 + Math.random() * 0.5;
  }

  let tx = zone.x;
  let ty = zone.y;

  if (bot.aiState === "loot") {
    const item = nearestPickup(bot, pickups);
    if (item) {
      tx = item.sprite.x;
      ty = item.sprite.y;
    }
  } else if (bot.aiState === "fight") {
    const enemy = nearestEnemy(bot, fighters, 900) ?? nearestEnemy(bot, fighters, 2400);
    if (enemy) {
      bot.targetId = enemy.id;
      const dx = enemy.sprite.x - x;
      const dy = enemy.sprite.y - y;
      const dist = Math.hypot(dx, dy) || 1;
      const range = WEAPONS[bot.weapon].range * 0.72;
      if (dist > range) {
        tx = enemy.sprite.x;
        ty = enemy.sprite.y;
      } else {
        // strafe / keep distance
        tx = x + -dy / dist * 80;
        ty = y + dx / dist * 80;
      }
      const angle = Math.atan2(dy, dx);
      bot.aim = angle;
      const los = hasLineOfSight(x, y, enemy.sprite.x, enemy.sprite.y, blockers);
      if (los && dist < WEAPONS[bot.weapon].range * 0.92) {
        fire(bot, angle);
      }
    }
  } else if (bot.aiState === "wander") {
    tx = x + Math.cos(bot.aim) * 140;
    ty = y + Math.sin(bot.aim) * 140;
    if (bot.aiTimer < 0.05) bot.aim += (Math.random() * 2 - 1) * 1.2;
  }

  // separation
  let sx = 0;
  let sy = 0;
  for (const o of fighters) {
    if (o.id === bot.id || !o.alive) continue;
    const dx = x - o.sprite.x;
    const dy = y - o.sprite.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < 48 * 48 && d2 > 1) {
      sx += dx / d2 * 80;
      sy += dy / d2 * 80;
    }
  }

  let mx = tx - x + sx * 40;
  let my = ty - y + sy * 40;
  const len = Math.hypot(mx, my);
  if (len > 1) {
    mx /= len;
    my /= len;
  } else {
    mx = 0;
    my = 0;
  }

  const speed = BOT_SPEED * (bot.aiState === "zone" ? 1.08 : 0.96);
  bot.sprite.setVelocity(mx * speed, my * speed);
  if (bot.aiState !== "fight") bot.aim = Math.atan2(my, mx || 0.001);
}

function nearestEnemy(bot: Fighter, fighters: Fighter[], maxDist: number) {
  let best: Fighter | null = null;
  let bestD = maxDist * maxDist;
  for (const f of fighters) {
    if (f.id === bot.id || !f.alive) continue;
    const dx = f.sprite.x - bot.sprite.x;
    const dy = f.sprite.y - bot.sprite.y;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = f;
    }
  }
  return best;
}

function nearestPickup(bot: Fighter, pickups: Pickup[]) {
  let best: Pickup | null = null;
  let bestD = Infinity;
  const wantHeal = bot.hp < 55;
  const wantGun = bot.weapon === "fists" || bot.ammo <= 2;
  for (const p of pickups) {
    if (!p.alive) continue;
    if (wantGun && !isWeapon(p.kind) && p.kind !== "medkit") continue;
    if (!wantGun && wantHeal && p.kind !== "medkit" && p.kind !== "armor") continue;
    const dx = p.sprite.x - bot.sprite.x;
    const dy = p.sprite.y - bot.sprite.y;
    const d = dx * dx + dy * dy;
    let score = d;
    if (wantGun && isWeapon(p.kind)) score *= 0.45;
    if (wantHeal && p.kind === "medkit") score *= 0.4;
    if (score < bestD) {
      bestD = score;
      best = p;
    }
  }
  return best;
}
