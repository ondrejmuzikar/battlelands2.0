import { BODY_RADIUS } from "../config";

export type Actions = {
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  fire: boolean;
  hasAim: boolean;
};

const GAME_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Space",
]);

export const inputRaw = {
  keys: new Set<string>(),
  pointerWorld: { x: 0, y: 0 },
  pointerDown: false,
  hasPointer: false,
  virtualMove: { x: 0, y: 0 },
  virtualFire: false,
  touch: false,
  bound: false,
};

export function bindInput() {
  if (inputRaw.bound || typeof window === "undefined") return;
  inputRaw.bound = true;

  const down = (e: KeyboardEvent) => {
    inputRaw.keys.add(e.code);
    if (GAME_KEYS.has(e.code)) e.preventDefault();
  };
  const up = (e: KeyboardEvent) => {
    inputRaw.keys.delete(e.code);
  };
  const clear = () => inputRaw.keys.clear();

  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", clear);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clear();
  });
  window.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType === "touch") inputRaw.touch = true;
    },
    { passive: true },
  );
}

export function setVirtualMove(x: number, y: number) {
  inputRaw.virtualMove.x = x;
  inputRaw.virtualMove.y = y;
  if (x !== 0 || y !== 0) inputRaw.touch = true;
}

export function setVirtualFire(on: boolean) {
  inputRaw.virtualFire = on;
  if (on) inputRaw.touch = true;
}

export function sampleActions(): Actions {
  let mx = 0;
  let my = 0;
  if (inputRaw.keys.has("KeyW") || inputRaw.keys.has("ArrowUp")) my -= 1;
  if (inputRaw.keys.has("KeyS") || inputRaw.keys.has("ArrowDown")) my += 1;
  if (inputRaw.keys.has("KeyA") || inputRaw.keys.has("ArrowLeft")) mx -= 1;
  if (inputRaw.keys.has("KeyD") || inputRaw.keys.has("ArrowRight")) mx += 1;
  mx += inputRaw.virtualMove.x;
  my += inputRaw.virtualMove.y;

  const len = Math.hypot(mx, my);
  if (len > 1) {
    mx /= len;
    my /= len;
  } else if (len < 0.18) {
    mx = 0;
    my = 0;
  }

  const fire =
    inputRaw.virtualFire ||
    inputRaw.keys.has("Space") ||
    (inputRaw.pointerDown && !inputRaw.touch);

  return {
    moveX: mx,
    moveY: my,
    aimX: inputRaw.pointerWorld.x,
    aimY: inputRaw.pointerWorld.y,
    fire,
    hasAim: inputRaw.hasPointer && !inputRaw.touch,
  };
}

export function radialDeadzone(x: number, y: number, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export function keepOutOfBlockers(
  x: number,
  y: number,
  blockers: Array<{ x: number; y: number; hw: number; hh: number }>,
) {
  let nx = x;
  let ny = y;
  const pad = BODY_RADIUS + 2;
  for (const b of blockers) {
    const dx = nx - b.x;
    const dy = ny - b.y;
    const ox = b.hw + pad - Math.abs(dx);
    const oy = b.hh + pad - Math.abs(dy);
    if (ox > 0 && oy > 0) {
      if (ox < oy) nx += dx < 0 ? -ox : ox;
      else ny += dy < 0 ? -oy : oy;
    }
  }
  return { x: nx, y: ny };
}
