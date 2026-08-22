# Boom Isle

Cartoon 2D battle royale prototype — 1 player vs 11 AI bots on a tropical island.

**Play:** pick a fighter, choose a drop, parachute in (steer a little), loot weapons / ammo / bandages, hide in bushes, grab airdrops, stay inside the shrinking zone, be the last one standing.

- Desktop: WASD or arrows to move, mouse to aim, click to fire
- Phone: left joystick to move, right button to shoot (auto-aims)

## Mechanics

- Zoomed follow camera + full-island minimap (player, zone, airdrop)
- Instant ground loot on step; airdrop crates take a few seconds to open
- Separate ammo types (light / shells / rifle)
- Bandages and medkits heal over time; armor soaks damage
- Bushes hide you from anyone who is not in the same bush

## Stack

Phaser 3 + React (TanStack Start) + Tailwind. Single-player + bots for now; multiplayer can come later.
