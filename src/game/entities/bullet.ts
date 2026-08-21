import Phaser from "phaser";

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  dmg = 0;
  ownerId = -1;
  life = 0;
  knock = 0;

  fire(
    x: number,
    y: number,
    vx: number,
    vy: number,
    dmg: number,
    ownerId: number,
    life: number,
    knock: number,
  ) {
    this.enableBody(true, x, y, true, true);
    this.setVelocity(vx, vy);
    this.setRotation(Math.atan2(vy, vx));
    this.setDepth(y + 40);
    this.setDisplaySize(22, 22);
    this.dmg = dmg;
    this.ownerId = ownerId;
    this.life = life;
    this.knock = knock;
    this.setCircle(8, 56, 56);
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.active) return;
    this.life -= delta;
    this.setDepth(this.y + 40);
    if (this.life <= 0) this.kill();
    if (this.x < 0 || this.y < 0 || this.x > 2400 || this.y > 2400) this.kill();
  }

  kill() {
    this.disableBody(true, true);
  }
}
