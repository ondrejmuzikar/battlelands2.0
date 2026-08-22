import Phaser from "phaser";
import {
  AIRDROP_TIMES,
  DROP_TIME,
  FALL_DURATION,
  FALL_STEER,
  PICKUP_RADIUS,
  PLAY_ZOOM,
  PLAY_ZOOM_SHORT,
  PLAYER_COUNT,
  PLAYER_SPEED,
  WATER_SPEED,
  WEAPONS,
  WORLD,
  WORLD_CENTER,
} from "../config";
import { createFighter, faceFromAim, magOf, syncFighterDepth, type Fighter } from "../entities/fighter";
import { Bullet } from "../entities/bullet";
import { isWeapon, pickupLabel, pulsePickup, spawnPickup, type Pickup } from "../entities/pickup";
import {
  applyDamage,
  canSee,
  fireAt,
  giveArmor,
  giveWeapon,
  pickupKindOfWeapon,
  startHeal,
  tickHeal,
  tickReload,
  type CombatFx,
} from "../systems/combat";
import { updateBot } from "../systems/ai";
import { bindInput, inputRaw, sampleActions } from "../systems/input";
import { createZone, drawZone, inZone, updateZone, zoneLabel, type ZoneState } from "../systems/zone";
import { buildMap } from "../world/mapBuilder";
import { ALL_BLOCKERS, BUSHES, bushIndexAt, hitsBlocker, isLand, mulberry32, randomLandPoint } from "../world/mapData";
import { scatterLoot } from "../world/loot";
import { destroyAirdrop, finishOpen, spawnAirdrop, tickOpen, updateAirdrop, type Airdrop } from "../entities/airdrop";
import { useGameStore } from "../store";
import { sfxPlay } from "../systems/audio";
import { registerArena } from "../api";
import type { HudSnapshot } from "../types";

function spawnAwayFrom(rand: () => number, px: number, py: number, minDist: number) {
  for (let i = 0; i < 90; i++) {
    const p = randomLandPoint(rand, ALL_BLOCKERS, 36);
    if (Math.hypot(p.x - px, p.y - py) >= minDist) return p;
  }
  return randomLandPoint(rand, ALL_BLOCKERS, 36);
}

export class ArenaScene extends Phaser.Scene {
  fighters: Fighter[] = [];
  player!: Fighter;
  pickups: Pickup[] = [];
  drops: Airdrop[] = [];
  bullets!: Phaser.Physics.Arcade.Group;
  staticGroup!: Phaser.Physics.Arcade.StaticGroup;
  actors!: Phaser.Physics.Arcade.Group;
  zoneGfx!: Phaser.GameObjects.Graphics;
  dropMarker!: Phaser.GameObjects.Arc;
  bushSprites: Phaser.GameObjects.Image[] = [];
  zone!: ZoneState;
  trauma = 0;
  hudAcc = 0;
  menuT = 0;
  ended = false;
  grace = 0;
  dropLock = 0;
  dropLeft = DROP_TIME;
  matchT = 0;
  lootProgress = 0;
  lootLabel = "";
  lastKiller = "";
  aimGfx!: Phaser.GameObjects.Graphics;
  nextDrop = 0;
  crateProgress = 0;
  follow?: Fighter;
  fx!: CombatFx;

  constructor() {
    super("arena");
  }

  init() {
    this.fighters = [];
    this.pickups = [];
    this.drops = [];
    this.trauma = 0;
    this.hudAcc = 0;
    this.menuT = 0;
    this.ended = false;
    this.grace = 0;
    this.dropLock = 0;
    this.matchT = 0;
    this.nextDrop = 0;
    this.crateProgress = 0;
    this.zone = createZone();
  }

  create() {
    bindInput();
    const map = buildMap(this);
    this.staticGroup = map.staticGroup;
    this.bushSprites = map.bushSprites;
    this.cameras.main.setBounds(0, 0, WORLD, WORLD);
    this.cameras.main.setRoundPixels(true);
    this.cameras.main.setLerp(0.22, 0.22);
    this.bullets = this.physics.add.group({ classType: Bullet, maxSize: 96, runChildUpdate: true });
    this.actors = this.physics.add.group();
    this.zoneGfx = this.add.graphics().setDepth(8);
    this.aimGfx = this.add.graphics().setDepth(40);
    this.dropMarker = this.add.circle(WORLD_CENTER, WORLD_CENTER, 16, 0xff5a36, 0.15);
    this.dropMarker.setStrokeStyle(3, 0xff5a36, 1);
    this.dropMarker.setVisible(false);
    this.dropMarker.setDepth(30);
    this.fx = {
      shake: (t) => { this.trauma = Math.min(1, this.trauma + t); },
      flash: (sprite) => {
        sprite.setTintFill(0xffffff);
        this.time.delayedCall(50, () => {
          const fid = sprite.getData("fid") as number;
          const f = this.fighters.find((x) => x.id === fid);
          sprite.clearTint();
          if (f) sprite.setTint(f.color);
        });
      },
      numbers: (x, y, text, color) => this.spawnFloat(x, y, text, color),
      impact: (x, y) => {
        const s = this.add.sprite(x, y, "impact", 0).setDepth(y + 80).setDisplaySize(42, 42);
        s.play("impact-burst");
        s.once("animationcomplete", () => s.destroy());
      },
    };
    this.physics.add.overlap(this.bullets, this.staticGroup, (b) => {
      const bullet = b as unknown as Bullet;
      if (bullet.active) { this.fx.impact(bullet.x, bullet.y); bullet.kill(); }
    });
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      inputRaw.pointerWorld.x = p.worldX; inputRaw.pointerWorld.y = p.worldY; inputRaw.hasPointer = true;
    });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      inputRaw.pointerWorld.x = p.worldX; inputRaw.pointerWorld.y = p.worldY;
      const phase = useGameStore.getState().phase;
      if (phase === "drop") { if (this.time.now < this.dropLock) return; this.placeDrop(p.worldX, p.worldY); return; }
      const ev = p.event as PointerEvent | undefined;
      if (ev?.pointerType === "touch" || inputRaw.touch) { inputRaw.touch = true; return; }
      inputRaw.pointerDown = true;
    });
    this.input.on("pointerup", () => { inputRaw.pointerDown = false; });
    this.scale.on("resize", () => this.layoutCamera());
    registerArena(this);
    useGameStore.getState().setReady(true);
    if (useGameStore.getState().phase === "booting") useGameStore.getState().setPhase("menu");
    this.events.once("shutdown", () => { this.fighters.length = 0; this.pickups.length = 0; registerArena(null); });
    this.exposeControls();
  }

  enterDrop() {
    this.clearMatchSprites();
    this.zone = createZone();
    this.ended = false;
    this.dropMarker.setVisible(true);
    this.dropMarker.setPosition(WORLD_CENTER, WORLD_CENTER);
    this.dropLock = this.time.now + 250;
    this.dropLeft = DROP_TIME;
    useGameStore.getState().setDrop(WORLD_CENTER, WORLD_CENTER);
    useGameStore.getState().setPhase("drop");
    this.layoutCamera();
  }
  confirmDrop() {
    const store = useGameStore.getState();
    this.startMatch(store.hasDrop ? store.dropX : WORLD_CENTER, store.hasDrop ? store.dropY : WORLD_CENTER);
  }
  startMatch(px: number, py: number) {
    this.clearMatchSprites();
    this.zone = createZone();
    this.ended = false;
    this.grace = 4.2;
    this.matchT = 0;
    this.nextDrop = 0;
    this.crateProgress = 0;
    this.dropMarker.setVisible(false);
    const rand = mulberry32((Date.now() & 0xffff) ^ 0x9e3779);
    const skin = useGameStore.getState().skin;
    this.player = createFighter(this, 0, px, py, true, skin);
    this.player.invuln = 2.6;
    this.armFall(this.player, px, py);
    this.fighters = [this.player];
    this.actors.add(this.player.sprite);
    this.physics.add.collider(this.player.sprite, this.staticGroup);
    for (let i = 1; i < PLAYER_COUNT; i++) {
      const p = spawnAwayFrom(rand, px, py, 340);
      const bot = createFighter(this, i, p.x, p.y, false);
      bot.invuln = 1.2;
      this.armFall(bot, p.x, p.y);
      this.fighters.push(bot);
      this.actors.add(bot.sprite);
      this.physics.add.collider(bot.sprite, this.staticGroup);
    }
    this.physics.add.overlap(this.bullets, this.actors, (b, s) => this.onBulletHit(b as unknown as Bullet, s as Phaser.Physics.Arcade.Sprite));
    this.pickups = scatterLoot(this, 11 + (Date.now() % 50));
    this.follow = this.player;
    this.cameras.main.startFollow(this.player.sprite, true, 0.22, 0.22);
    this.layoutCamera();
    useGameStore.getState().setPhase("falling");
    this.syncHud(1);
  }
  playAgain() { this.enterDrop(); }
  backToMenu() {
    this.clearMatchSprites();
    this.dropMarker.setVisible(false);
    this.cameras.main.stopFollow();
    useGameStore.getState().resetToMenu();
    this.layoutCamera();
  }
  private armFall(f: Fighter, x: number, y: number) {
    f.falling = true; f.fallT = 1; f.dropX = x; f.dropY = y;
    f.sprite.setPosition(x, y); f.sprite.setVelocity(0, 0); f.sprite.setScale(1.85);
    f.chute = this.add.image(x, y - 42, "parachute").setDisplaySize(58, 48).setDepth(y + 60);
  }
  private clearMatchSprites() {
    for (const f of this.fighters) { f.sprite.destroy(); f.ring.destroy(); f.chute?.destroy(); }
    this.fighters = [];
    for (const p of this.pickups) p.sprite.destroy();
    this.pickups = [];
    for (const d of this.drops) destroyAirdrop(d);
    this.drops = [];
    this.bullets.clear(true, true);
    this.actors?.clear(false);
    this.zoneGfx.clear();
    this.aimGfx?.clear();
  }
  private placeDrop(x: number, y: number) {
    if (!isLand(x, y) || hitsBlocker(x, y, ALL_BLOCKERS, 24)) return;
    this.dropMarker.setPosition(x, y);
    this.dropMarker.setVisible(true);
    useGameStore.getState().setDrop(x, y);
  }
  private onBulletHit(bullet: Bullet, sprite: Phaser.Physics.Arcade.Sprite) {
    if (!bullet.active) return;
    const fid = sprite.getData("fid") as number;
    const target = this.fighters.find((f) => f.id === fid);
    if (!target || !target.alive || target.id === bullet.ownerId || target.falling) return;
    const owner = this.fighters.find((f) => f.id === bullet.ownerId) ?? null;
    const nx = bullet.body?.velocity.x ?? 0;
    const ny = bullet.body?.velocity.y ?? 0;
    const mag = Math.hypot(nx, ny) || 1;
    applyDamage(target, bullet.dmg, owner, (nx / mag) * bullet.knock, (ny / mag) * bullet.knock, this.fx);
    if (!target.alive && owner) this.lastKiller = owner.name;
    this.fx.impact(bullet.x, bullet.y);
    bullet.kill();
  }
  update(_time: number, delta: number) {
    const dt = Math.min(delta, 100) / 1000;
    const phase = useGameStore.getState().phase;
    if (phase === "menu" || phase === "booting") {
      this.menuT += dt;
      const cam = this.cameras.main;
      cam.stopFollow();
      cam.centerOn(WORLD_CENTER + Math.cos(this.menuT * 0.18) * 220, WORLD_CENTER + Math.sin(this.menuT * 0.13) * 160);
      this.layoutCamera(0.42); this.applyShake(dt); return;
    }
    if (phase === "drop") {
      this.dropLeft = Math.max(0, this.dropLeft - dt);
      if (this.dropLeft <= 0) this.confirmDrop();
      this.layoutCamera(); this.applyShake(dt); this.syncHud(dt); return;
    }
    if (!this.player) return;
    if (phase === "falling") { this.updateFalling(dt); this.layoutCamera(); }
    else if (phase === "playing") {
      this.matchT += dt; updateZone(this.zone, dt); drawZone(this.zoneGfx, this.zone);
      this.updatePlayer(dt); this.updateBots(dt); this.updateStealth();
      this.collectPickups(dt); this.updateDrops(dt); this.dropDeathLoot(); this.applyZoneDamage(dt);
    } else if (this.follow?.alive) drawZone(this.zoneGfx, this.zone);
    for (const f of this.fighters) {
      if (!f.alive) continue;
      f.invuln = Math.max(0, f.invuln - dt);
      f.fireCd = Math.max(0, f.fireCd - dt);
      f.revealT = Math.max(0, f.revealT - dt);
      tickHeal(f, dt); tickReload(f, dt); faceFromAim(f); syncFighterDepth(f);
    }
    this.applyShake(dt); this.syncHud(dt);
    if (phase === "playing") this.checkEnd();
  }
  private updateFalling(dt: number) {
    let anyFalling = false;
    for (const f of this.fighters) {
      if (!f.falling) continue;
      anyFalling = true;
      f.fallT = Math.max(0, f.fallT - dt / FALL_DURATION);
      if (f.isPlayer) {
        const a = sampleActions();
        f.dropX = Phaser.Math.Clamp(f.dropX + a.moveX * FALL_STEER * dt, 160, WORLD - 160);
        f.dropY = Phaser.Math.Clamp(f.dropY + a.moveY * FALL_STEER * dt, 160, WORLD - 160);
        if (!isLand(f.dropX, f.dropY)) {
          const dx = f.dropX - WORLD_CENTER; const dy = f.dropY - WORLD_CENTER; const len = Math.hypot(dx, dy) || 1;
          f.dropX = WORLD_CENTER + (dx / len) * 1000; f.dropY = WORLD_CENTER + (dy / len) * 1000;
        }
        if (a.moveX || a.moveY) f.aim = Math.atan2(a.moveY, a.moveX);
      } else {
        f.dropX += Math.sin(f.id + this.matchT) * 18 * dt;
        f.dropY += Math.cos(f.id + this.matchT) * 18 * dt;
      }
      f.sprite.setPosition(f.dropX, f.dropY); f.sprite.setVelocity(0, 0); f.sprite.setScale(1 + f.fallT * 0.85);
      if (f.fallT <= 0) {
        f.falling = false; f.sprite.setScale(1); f.chute?.destroy(); f.chute = undefined;
        f.invuln = Math.max(f.invuln, 0.8); if (f.isPlayer) sfxPlay.land();
      }
    }
    if (!anyFalling) { useGameStore.getState().setPhase("playing"); this.layoutCamera(); }
  }
  private updatePlayer(_dt: number) {
    const p = this.player; if (!p.alive || p.falling) return;
    const a = sampleActions();
    const wet = !isLand(p.sprite.x, p.sprite.y);
    const spd = PLAYER_SPEED * (wet ? WATER_SPEED : 1);
    p.sprite.setVelocity(a.moveX * spd, a.moveY * spd);
    if (a.hasAim) {
      if (Math.hypot(a.aimDirX, a.aimDirY) > 0.18) p.aim = Math.atan2(a.aimDirY, a.aimDirX);
      else p.aim = Math.atan2(a.aimY - p.sprite.y, a.aimX - p.sprite.x);
    } else if (a.moveX !== 0 || a.moveY !== 0) p.aim = Math.atan2(a.moveY, a.moveX);
    this.drawAimCone(a.fire || Math.hypot(a.aimDirX, a.aimDirY) > 0.18);
    if (a.fire) fireAt(this.bullets, p, p.aim, this.fx);
  }
  private drawAimCone(on: boolean) {
    this.aimGfx.clear();
    if (!on || !this.player?.alive) return;
    const p = this.player; const range = Math.min(280, WEAPONS[p.weapon].range * 0.45);
    const x = p.sprite.x; const y = p.sprite.y; const ang = p.aim;
    this.aimGfx.fillStyle(0xff3b5c, 0.16);
    this.aimGfx.slice(x, y, range, ang - 0.18, ang + 0.18, false); this.aimGfx.fillPath();
    this.aimGfx.lineStyle(3, 0xff3b5c, 0.85);
    this.aimGfx.lineBetween(x, y, x + Math.cos(ang) * range, y + Math.sin(ang) * range);
  }
  private updateBots(dt: number) {
    if (this.grace > 0) this.grace -= dt;
    for (const bot of this.fighters) {
      if (bot.isPlayer) continue;
      const fire = this.grace > 0 ? () => undefined : (b: Fighter, angle: number) => fireAt(this.bullets, b, angle, this.fx);
      updateBot(bot, dt, this.fighters, this.pickups, this.zone, ALL_BLOCKERS, fire, this.drops);
    }
  }
  private updateStealth() {
    for (const f of this.fighters) { if (f.alive) f.bushId = bushIndexAt(f.sprite.x, f.sprite.y); }
    const pBush = this.player?.bushId ?? -1;
    for (const f of this.fighters) {
      if (!f.alive) continue;
      if (f.isPlayer) { f.sprite.setAlpha(f.bushId >= 0 ? 0.62 : 1); continue; }
      const hidden = f.bushId >= 0 && f.bushId !== pBush && f.revealT <= 0;
      f.sprite.setAlpha(hidden ? 0 : 1); f.ring.setVisible(!hidden);
    }
    for (let i = 0; i < BUSHES.length; i++) {
      const spr = this.bushSprites[i]; if (!spr) continue;
      const moving = this.fighters.some((f) => f.alive && f.bushId === i && (f.sprite.body?.velocity.length() ?? 0) > 20);
      spr.setScale(moving ? 1.06 : 1);
    }
  }
  private collectPickups(dt: number) {
    this.lootProgress = 0; this.lootLabel = "";
    for (const item of this.pickups) {
      if (!item.alive) continue;
      let holder: Fighter | null = null;
      for (const f of this.fighters) {
        if (!f.alive || f.falling) continue;
        if (Math.hypot(f.sprite.x - item.sprite.x, f.sprite.y - item.sprite.y) <= PICKUP_RADIUS) { holder = f; break; }
      }
      if (!holder) { item.progress = 0; continue; }
      const need = isWeapon(item.kind) ? WEAPONS[item.kind].pickup : item.kind === "medkit" ? 1.1 : 0.7;
      item.progress += dt / need;
      if (holder.isPlayer) { this.lootProgress = Math.min(1, item.progress); this.lootLabel = pickupLabel(item.kind); }
      if (item.progress < 1) continue;
      pulsePickup(this, item.sprite.x, item.sprite.y); sfxPlay.pickup();
      if (item.kind === "medkit") startHeal(holder, "medkit", this.fx);
      else if (item.kind === "bandage") startHeal(holder, "bandage", this.fx);
      else if (item.kind === "armor") giveArmor(holder, 50, this.fx);
      else if (isWeapon(item.kind)) {
        const res = giveWeapon(holder, item.kind, item.ammo);
        if (res !== "same" && res.prev !== "fists" && res.leftover > 0) {
          const kind = pickupKindOfWeapon(res.prev);
          if (kind) this.pickups.push(spawnPickup(this, kind, holder.sprite.x + 16, holder.sprite.y + 16, res.leftover));
        }
        this.fx.numbers(holder.sprite.x, holder.sprite.y - 24, WEAPONS[item.kind].name.toUpperCase(), "#f4f0e6");
      }
      item.alive = false; item.sprite.destroy();
    }
  }
  private dropDeathLoot() {
    for (const f of this.fighters) {
      if (f.alive || f.looted) continue;
      f.looted = true;
      const kind = pickupKindOfWeapon(f.weapon);
      if (kind) this.pickups.push(spawnPickup(this, kind, f.sprite.x, f.sprite.y, f.clip + f.ammo));
      if (f.armor > 8) this.pickups.push(spawnPickup(this, "armor", f.sprite.x + 16, f.sprite.y + 10));
    }
  }
  private updateDrops(dt: number) {
    if (this.nextDrop < AIRDROP_TIMES.length && this.matchT >= AIRDROP_TIMES[this.nextDrop]!) {
      const rand = mulberry32((Date.now() + this.nextDrop * 97) >>> 0);
      const p = randomLandPoint(rand, ALL_BLOCKERS, 50);
      this.drops.push(spawnAirdrop(this, p.x, p.y)); this.nextDrop += 1; sfxPlay.click();
    }
    this.crateProgress = 0;
    for (const drop of this.drops) {
      updateAirdrop(drop, dt);
      if (drop.state === "opened" || drop.state === "falling") continue;
      let opener: Fighter | null = null;
      for (const f of this.fighters) {
        if (!f.alive || f.falling) continue;
        if (Math.hypot(f.sprite.x - drop.x, f.sprite.y - drop.y) < 34) { opener = f; break; }
      }
      const p = tickOpen(drop, !!opener, dt);
      if (opener?.isPlayer) this.crateProgress = p;
      if (p >= 1) { this.pickups.push(...finishOpen(this, drop)); pulsePickup(this, drop.x, drop.y, 0xff8a3c); }
    }
  }
  private applyZoneDamage(dt: number) {
    for (const f of this.fighters) {
      if (!f.alive || f.falling) continue;
      if (!inZone(this.zone, f.sprite.x, f.sprite.y)) applyDamage(f, this.zone.dmg * dt, null, 0, 0, this.fx);
    }
  }
  private checkEnd() {
    if (this.ended) return;
    const alive = this.fighters.filter((f) => f.alive);
    if (!this.player.alive) {
      this.ended = true;
      useGameStore.getState().finish("defeat", alive.length + 1);
      this.cameras.main.stopFollow();
      const killer = alive[0];
      if (killer) { this.follow = killer; this.cameras.main.startFollow(killer.sprite, true, 0.08, 0.08); }
      return;
    }
    if (alive.length <= 1 && this.player.alive) {
      this.ended = true; sfxPlay.win(); this.fx.shake(0.6);
      useGameStore.getState().finish("victory", 1);
    }
  }
  layoutCamera(forcedZoom?: number) {
    const cam = this.cameras.main; const phase = useGameStore.getState().phase;
    const w = this.scale.width; const h = this.scale.height;
    if (forcedZoom !== undefined) { cam.setZoom(forcedZoom); return; }
    if (phase === "drop" || phase === "menu" || phase === "booting") {
      cam.setZoom(Math.min(w / WORLD, h / WORLD) * (phase === "drop" ? 0.96 : 0.5));
      cam.centerOn(WORLD_CENTER, WORLD_CENTER); cam.stopFollow(); return;
    }
    if (phase === "falling") { cam.setZoom(h < 700 ? 0.78 : 0.88); return; }
    cam.setZoom(h < 700 ? PLAY_ZOOM_SHORT : PLAY_ZOOM);
  }
  private applyShake(dt: number) {
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    const s = this.trauma * this.trauma; if (s <= 0.001) return;
    this.cameras.main.shake(40, 0.004 * s);
  }
  private spawnFloat(x: number, y: number, text: string, color: string) {
    const t = this.add.text(x, y, text, { fontFamily: "Nunito, sans-serif", fontSize: "16px", color, fontStyle: "800", stroke: "#101820", strokeThickness: 4 }).setOrigin(0.5).setDepth(400);
    this.tweens.add({ targets: t, y: y - 36, alpha: 0, duration: 520, ease: "Cubic.easeOut", onComplete: () => t.destroy() });
  }
  private syncHud(dt: number) {
    this.hudAcc += dt; if (this.hudAcc < 0.07) return; this.hudAcc = 0;
    const p = this.player; const alive = this.fighters.filter((f) => f.alive).length;
    useGameStore.getState().setHud({
      hp: Math.max(0, p?.hp ?? 100), armor: Math.max(0, p?.armor ?? 0), ammo: p?.ammo ?? 0, clip: p?.clip ?? 0,
      mag: p ? magOf(p.weapon) : 0, weapon: p ? WEAPONS[p.weapon].name : "Fists",
      alive: this.fighters.length ? alive : PLAYER_COUNT, total: PLAYER_COUNT, kills: p?.kills ?? 0,
      zoneIn: p ? inZone(this.zone, p.sprite.x, p.sprite.y) : true, zoneDmg: this.zone.dmg, zoneLabel: zoneLabel(this.zone),
      playerX: p?.sprite.x ?? WORLD_CENTER, playerY: p?.sprite.y ?? WORLD_CENTER, playerAim: p?.aim ?? 0,
      zoneX: this.zone.x, zoneY: this.zone.y, zoneR: this.zone.r, nextZoneR: this.zone.toR, loadout: p?.weapon ?? "fists",
      fighters: this.fighters.map((f) => ({ x: f.sprite.x, y: f.sprite.y, isPlayer: f.isPlayer, alive: f.alive, color: f.color, hidden: !!(p && !canSee(p, f) && !f.isPlayer) })),
      airdrops: this.drops.filter((d) => d.state !== "opened").map((d) => ({ x: d.crate.x, y: d.crate.y, state: d.state === "opening" ? "opening" : d.state === "falling" ? "falling" : "landed" })),
      crateProgress: this.crateProgress, lootProgress: this.lootProgress, lootLabel: this.lootLabel,
      healLeft: p?.healLeft ?? 0, inBush: (p?.bushId ?? -1) >= 0, fallT: p?.fallT ?? 1, reloadT: p?.reloadT ?? 0,
      dropLeft: this.dropLeft, damageDealt: p?.damageDealt ?? 0, survival: this.matchT, killer: this.lastKiller,
    });
  }
  private exposeControls() {
    window.__controlsTest = {
      getYaw: () => this.player?.aim ?? 0,
      getSpeed: () => this.player?.sprite.body?.velocity.length() ?? 0,
      getPos: () => ({ x: this.player?.sprite.x ?? 0, y: this.player?.sprite.y ?? 0 }),
      setKeys: (codes) => { inputRaw.keys.clear(); for (const c of codes) inputRaw.keys.add(c); },
    };
  }
}
