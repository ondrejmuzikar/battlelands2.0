# Boom Isle

Cartoon 2D battle royale prototype — 1 player vs 11 AI bots on a tropical island.

**Play:** drop on the map, loot weapons / medkits / armor, stay inside the shrinking zone, be the last one standing.

- Desktop: WASD or arrows to move, mouse to aim, click to fire
- Phone: left joystick to move, right button to shoot (auto-aims)

## Stack

Phaser 3 + React (TanStack Start) + Tailwind. Single-player + bots for now; multiplayer can come later.

```
src/game/
  boot.ts              Phaser game factory
  scenes/              boot → preload → arena loop
  entities/            fighter, bullet, pickup
  systems/             input, combat, AI, storm zone, audio
  world/               map layout + loot scatter
```
