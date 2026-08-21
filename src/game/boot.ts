import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { ArenaScene } from "./scenes/ArenaScene";

export function createGame(parent: HTMLElement) {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: "#1a8fc4",
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: parent.clientWidth || 1280,
      height: parent.clientHeight || 720,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    render: {
      antialias: true,
      roundPixels: true,
      powerPreference: "high-performance",
    },
    audio: { noAudio: true },
    scene: [BootScene, PreloadScene, ArenaScene],
  });
}
