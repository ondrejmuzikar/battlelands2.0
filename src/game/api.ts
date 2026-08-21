import type { ArenaScene } from "./scenes/ArenaScene";

let arena: ArenaScene | null = null;

export function registerArena(scene: ArenaScene | null) {
  arena = scene;
}

export function startDrop() {
  arena?.enterDrop();
}

export function confirmDrop() {
  arena?.confirmDrop();
}

export function playAgain() {
  arena?.playAgain();
}

export function backToMenu() {
  arena?.backToMenu();
}

export function getArena() {
  return arena;
}
