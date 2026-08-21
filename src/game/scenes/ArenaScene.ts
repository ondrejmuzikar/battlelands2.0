import Phaser from "phaser";
import {
  PLAYER_COUNT,
  PLAYER_SPEED,
  WEAPONS,
  WORLD,
  WORLD_CENTER,
} from "../config";
import { createFighter, faceFromAim, magOf, syncFighterDepth, type Fighter } from "../entities/fighter";
import { Bullet } from "../entities/bullet";
import { isWeapon, type Pickup } from "../entities/pickup";
import { applyDamage, fireAt, giveArmor, giveWeapon, heal, type CombatFx } from "../systems/combat";
import { updateBot } from "../systems/ai";
import { bindInput, inputRaw, sampleActions } from "../systems/input";
import { createZone, drawZone, inZone, updateZone, zoneLabel, type ZoneState } from "../systems/zone";
import { buildMap } from "../world/mapBuilder";
import { ALL_BLOCKERS, hitsBlocker, isLand, mulberry32, randomLandPoint } from "../world/mapData";
import { scatterLoot } from "../world/loot";
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
  bullets!: Phaser.Physics.Arcade.Group;
  staticGroup!: Phaser.Physics.Arcade.StaticGroup;
  actors!: Phaser.Physics.Arcade.Group;
  zoneGfx!: Phaser.GameObjects.Graphics;
  dropMarker!: Phaser.GameObjects.Arc;
  zone!: ZoneState;
  trauma = 0;
  hudAcc = 0;
  menuT = 0;
  ended = false;
  grace = 0;
  follow?: Fighter;
  fx!: CombatFx;

  constructor() {
    super("arena");
  }

  init() {
    this.fighters = [];
    this.pickups = [];
    this.trauma = 0;
    this.hudAcc = 0;
    this.menuT = 0;
    this.ended = false;
    this.grace = 0;
    this.zone = createZone();
  }

  create() {
    bindInput();
    const map = buildMap(this);
    this.staticGroup = map.staticGroup;
    this.cameras.main.setBounds(0, 0, WORLD, WORLD);
    this.cameras.main.setRoundPixels(true);

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 96,
      runChildUpdate: true,
    });
    this.actors = this.physics.add.group();

    this.zoneGfx = this.add.graphics().setDepth(8);
    this.dropMarker = this.add.circle(WORLD_CENTER, WORLD_CENTER, 16, 0xff5a36, 0.15);
    this.dropMarker.setStrokeStyle(3, 0xff5a36, 1);
    this.dropMarker.setVisible(false);
    this.dropMarker.setDepth(30);

    this.fx = {
      shake: (t) => {
        this.trauma = Math.min(1, this.trauma + t);
      },
      flash: (sprite) => {
        sprite.setTintFill(0xffffff);
        this.time.delayedCall(50, () => sprite.clearTint());
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
      if (bullet.active) {
        this.fx.impact(bullet.x, bullet.y);
        bullet.kill();
      }
    });

    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      inputRaw.pointerWorld.x = p.worldX;
      inputRaw.pointerWorld.y = p.worldY;
      inputRaw.hasPointer = true;
    });
    this.input.on("pointerdown", (p: Phaser.Input.Pointer) => {
      inputRaw.pointerWorld.x = p.worldX;
      inputRaw.pointerWorld.y = p.worldY;
      const phase = useGameStore.getState().phase;
      if (phase === "drop") {
        this.placeDrop(p.worldX, p.worldY);
        return;
      }
      const ev = p.event as PointerEvent | undefined;
      if (ev?.pointerType === "touch" || inputRaw.touch) {
        inputRaw.touch = true;
        return;
      }
      inputRaw.pointerDown = true;
    });
    this.input.on("pointerup", () => {
      inputRaw.pointerDown = false;
    });

    this.scale.on("resize", () => this.layoutCamera());

    registerArena(this);
    useGameStore.getState().setReady(true);
    if (useGameStore.getState().phase === "booting") {
      useGameStore.getState().setPhase("menu");
    }

    this.events.once("shutdown", () => {
      this.fighters.length = 0;
      this.pickups.length = 0;
      registerArena(null);
    });

    this.exposeControls();
  }

  enterDrop() {
    this.clearMatchSprites();
    this.zone = createZone();
    this.ended = false;
    this.dropMarker.setVisible(true);
    this.dropMarker.setPosition(WORLD_CENTER, WORLD_CENTER);
    useGameStore.getState().setDrop(WORLD_CENTER, WORLD_CENTER);
    useGameStore.getState().setPhase("drop");
    this.layoutCamera();
  }

  confirmDrop() {
    const store = useGameStore.getState();
    const x = store.hasDrop ? store.dropX : WORLD_CENTER;
    const y = store.hasDrop ? store.dropY : WORLD_CENTER;
    this.startMatch(x, y);
  }

  startMatch(px: number, py: number) {
    this.clearMatchSprites();
    this.zone = createZone();
    this.ended = false;
    this.grace = 4.2;
    this.dropMarker.setVisible(false);
    sfxPlay.land();

    const rand = mulberry32((Date.now() & 0xffff) ^ 0x9e3779);
    this.player = createFighter(this, 0, px, py, true);
    this.player.invuln = 2.6;
    this.fighters = [this.player];
    this.actors.add(this.player.sprite);
    this.physics.add.collider(this.player.sprite, this.staticGroup);

    for (let i = 1; i < PLAYER_COUNT; i++) {
      const p = spawnAwayFrom(rand, px, py, 340);
      const bot = createFighter(this, i, p.x, p.y, false);
      bot.invuln = 1.2;
      this.fighters.push(bot);
      this.actors.add(bot.sprite);
      this.physics.add.collider(bot.sprite, this.staticGroup);
    }

    this.physics.add.overlap(this.bullets, this.actors, (b, s) =>
      this.onBulletHit(b as unknown as Bullet, s as Phaser.Physics.Arcade.Sprite),
    );

    this.pickups = scatterLoot(this, 11 + (Date.now() % 50));
    this.follow = this.player;
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);
    this.layoutCamera();
    useGameStore.getState().setPhase("playing");
    this.syncHud(1);
  }

  playAgain() {
    this.enterDrop();
  }

  backToMenu() {
    this.clearMatchSprites();
    this.dropMarker.setVisible(false);
    this.cameras.main.stopFollow();
    useGameStore.getState().resetToMenu();
    this.layoutCamera();
  }

  private clearMatchSprites() {
    for (const f of this.fighters) {
      f.sprite.destroy();
      f.ring.destroy();
    }
    this.fighters = [];
    for (const p of this.pickups) {
      p.sprite.destroy();
    }
    this.pickups = [];
    this.bullets.clear(true, true);
    this.actors?.clear(false);
    this.zoneGfx.clear();
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
    if (!target || !target.alive || target.id === bullet.ownerId) return;
    const owner = this.fighters.find((f) => f.id === bullet.ownerId) ?? null;
    const nx = bullet.body?.velocity.x ?? 0;
    const ny = bullet.body?.velocity.y ?? 0;
    const mag = Math.hypot(nx, ny) || 1;
    applyDamage(target, bullet.dmg, owner, (nx / mag) * bullet.knock, (ny / mag) * bullet.knock, this.fx);
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
      cam.centerOn(
        WORLD_CENTER + Math.cos(this.menuT * 0.18) * 220,
        WORLD_CENTER + Math.sin(this.menuT * 0.13) * 160,
      );
      this.layoutCamera(0.42);
      this.applyShake(dt);
      return;
    }

    if (phase === "drop") {
      this.layoutCamera();
      this.applyShake(dt);
      return;
    }

    if (!this.player) return;

    if (phase === "playing") {
      updateZone(this.zone, dt);
      drawZone(this.zoneGfx, this.zone);
      this.updatePlayer(dt);
      this.updateBots(dt);
      this.collectPickups();
      this.applyZoneDamage(dt);
    } else if (this.follow?.alive) {
      drawZone(this.zoneGfx, this.zone);
    }

    for (const f of this.fighters) {
      if (!f.alive) continue;
      f.invuln = Math.max(0, f.invuln - dt);
      f.fireCd = Math.max(0, f.fireCd - dt);
      faceFromAim(f);
      syncFighterDepth(f);
    }

    this.applyShake(dt);
    this.syncHud(dt);
    if (phase === "playing") this.checkEnd();
  }

  private updatePlayer(_dt: number) {
    const p = this.player;
    if (!p.alive) return;
    const a = sampleActions();
    p.sprite.setVelocity(a.moveX * PLAYER_SPEED, a.moveY * PLAYER_SPEED);

    if (a.hasAim) {
      p.aim = Math.atan2(a.aimY - p.sprite.y, a.aimX - p.sprite.x);
    } else if (a.moveX !== 0 || a.moveY !== 0) {
      p.aim = Math.atan2(a.moveY, a.moveX);
    }

    if (inputRaw.touch && a.fire) {
      const enemy = this.nearestEnemy(p, 640);
      if (enemy) p.aim = Math.atan2(enemy.sprite.y - p.sprite.y, enemy.sprite.x - p.sprite.x);
    }

    if (a.fire) fireAt(this.bullets, p, p.aim, this.fx);
  }

  private updateBots(dt: number) {
    if (this.grace > 0) this.grace -= dt;
    for (const bot of this.fighters) {
      if (bot.isPlayer) continue;
      const fire =
        this.grace > 0
          ? () => undefined
          : (b: Fighter, angle: number) => fireAt(this.bullets, b, angle, this.fx);
      updateBot(bot, dt, this.fighters, this.pickups, this.zone, ALL_BLOCKERS, fire);
    }
  }

  private collectPickups() {
    for (const item of this.pickups) {
      if (!item.alive) continue;
      for (const f of this.fighters) {
        if (!f.alive) continue;
        const dx = f.sprite.x - item.sprite.x;
        const dy = f.sprite.y - item.sprite.y;
        if (dx * dx + dy * dy > 28 * 28) continue;
        item.alive = false;
        item.sprite.destroy();
        sfxPlay.pickup();
        if (item.kind === "medkit") heal(f, 40, this.fx);
        else if (item.kind === "armor") giveArmor(f, 50, this.fx);
        else if (isWeapon(item.kind)) giveWeapon(f, item.kind, this.fx);
        break;
      }
    }
  }

  private applyZoneDamage(dt: number) {
    for (const f of this.fighters) {
      if (!f.alive) continue;
      if (!inZone(this.zone, f.sprite.x, f.sprite.y)) {
        applyDamage(f, this.zone.dmg * dt, null, 0, 0, this.fx);
      }
    }
  }

  private nearestEnemy(self: Fighter, max: number) {
    let best: Fighter | null = null;
    let bestD = max * max;
    for (const f of this.fighters) {
      if (f.id === self.id || !f.alive) continue;
      const dx = f.sprite.x - self.sprite.x;
      const dy = f.sprite.y - self.sprite.y;
      const d = dx * dx + dy * dy;
      if (d < bestD) {
        bestD = d;
        best = f;
      }
    }
    return best;
  }

  private checkEnd() {
    if (this.ended) return;
    const alive = this.fighters.filter((f) => f.alive);
    if (!this.player.alive) {
      this.ended = true;
      const place = alive.length + 1;
      this.cameras.main.stopFollow();
      const killer = alive[0];
      if (killer) {
        this.follow = killer;
        this.cameras.main.startFollow(killer.sprite, true, 0.08, 0.08);
      }
      useGameStore.getState().finish("defeat", place);
      return;
    }
    if (alive.length <= 1 && this.player.alive) {
      this.ended = true;
      sfxPlay.win();
      this.fx.shake(0.6);
      useGameStore.getState().finish("victory", 1);
    }
  }

  layoutCamera(forcedZoom?: number) {
    const cam = this.cameras.main;
    const phase = useGameStore.getState().phase;
    const w = this.scale.width;
    const h = this.scale.height;
    if (forcedZoom !== undefined) {
      cam.setZoom(forcedZoom);
      return;
    }
    if (phase === "drop" || phase === "menu" || phase === "booting") {
      const z = Math.min(w / WORLD, h / WORLD) * (phase === "drop" ? 0.96 : 0.5);
      cam.setZoom(z);
      cam.centerOn(WORLD_CENTER, WORLD_CENTER);
      cam.stopFollow();
      return;
    }
    const z = h < 700 ? 0.92 : 1.05;
    cam.setZoom(z);
  }

  private applyShake(dt: number) {
    this.trauma = Math.max(0, this.trauma - dt * 1.6);
    const s = this.trauma * this.trauma;
    if (s <= 0.001) return;
    this.cameras.main.shake(40, 0.004 * s);
  }

  private spawnFloat(x: number, y: number, text: string, color: string) {
    const t = this.add
      .text(x, y, text, {
        fontFamily: "Nunito, sans-serif",
        fontSize: "16px",
        color,
        fontStyle: "800",
        stroke: "#101820",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(400);
    this.tweens.add({
      targets: t,
      y: y - 36,
      alpha: 0,
      duration: 520,
      ease: "Cubic.easeOut",
      onComplete: () => t.destroy(),
    });
  }

  private syncHud(dt: number) {
    this.hudAcc += dt;
    if (this.hudAcc < 0.07) return;
    this.hudAcc = 0;
    if (!this.player) return;
    const p = this.player;
    const alive = this.fighters.filter((f) => f.alive).length;
    const snap: HudSnapshot = {
      hp: Math.max(0, p.hp),
      armor: Math.max(0, p.armor),
      ammo: p.ammo,
      mag: magOf(p.weapon),
      weapon: WEAPONS[p.weapon].name,
      alive,
      total: PLAYER_COUNT,
      kills: p.kills,
      zoneIn: inZone(this.zone, p.sprite.x, p.sprite.y),
      zoneDmg: this.zone.dmg,
      zoneLabel: zoneLabel(this.zone),
      playerX: p.sprite.x,
      playerY: p.sprite.y,
      zoneX: this.zone.x,
      zoneY: this.zone.y,
      zoneR: this.zone.r,
      nextZoneR: this.zone.toR,
      loadout: p.weapon === "fists" ? "fists" : p.weapon,
      fighters: this.fighters.map((f) => ({
        x: f.sprite.x,
        y: f.sprite.y,
        isPlayer: f.isPlayer,
        alive: f.alive,
        color: f.color,
      })),
    };
    useGameStore.getState().setHud(snap);
  }

  private exposeControls() {
    window.__controlsTest = {
      getYaw: () => this.player?.aim ?? 0,
      getSpeed: () => this.player?.sprite.body?.velocity.length() ?? 0,
      getPos: () => ({
        x: this.player?.sprite.x ?? 0,
        y: this.player?.sprite.y ?? 0,
      }),
      setKeys: (codes) => {
        inputRaw.keys.clear();
        for (const c of codes) inputRaw.keys.add(c);
      },
    };
  }
}

