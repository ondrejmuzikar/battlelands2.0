export const WORLD = 2400;
export const WORLD_CENTER = WORLD / 2;
export const LAND_RADIUS = 1080;
export const PLAYER_COUNT = 12;
export const PLAYER_SPEED = 228;
export const BOT_SPEED = 196;
export const BODY_RADIUS = 16;
export const PICKUP_RADIUS = 22;
export const MAX_HP = 100;
export const MAX_ARMOR = 75;

export const WEAPONS = {
  fists: {
    id: "fists",
    name: "Fists",
    damage: 14,
    rate: 2.4,
    speed: 0,
    range: 46,
    spread: 0,
    pellets: 1,
    mag: Infinity,
    knockback: 90,
  },
  pistol: {
    id: "pistol",
    name: "Pistol",
    damage: 18,
    rate: 5.2,
    speed: 620,
    range: 500,
    spread: 0.05,
    pellets: 1,
    mag: 12,
    knockback: 40,
  },
  shotgun: {
    id: "shotgun",
    name: "Shotgun",
    damage: 9,
    rate: 1.15,
    speed: 520,
    range: 250,
    spread: 0.34,
    pellets: 5,
    mag: 6,
    knockback: 140,
  },
  rifle: {
    id: "rifle",
    name: "Rifle",
    damage: 26,
    rate: 2.35,
    speed: 780,
    range: 740,
    spread: 0.025,
    pellets: 1,
    mag: 20,
    knockback: 70,
  },
} as const;

export type WeaponId = keyof typeof WEAPONS;

export const BOT_COLORS = [
  0xff5a36, 0x3ec6ff, 0x3ddc97, 0xffc857, 0xff6b9d, 0x7ae1ff, 0xf4a261,
  0x90be6d, 0xe76f51, 0x4cc9f0, 0xb8f2e6,
];

export const ZONE_PHASES = [
  { wait: 16, shrink: 11, radius: 980, dmg: 5 },
  { wait: 13, shrink: 10, radius: 640, dmg: 9 },
  { wait: 11, shrink: 9, radius: 390, dmg: 15 },
  { wait: 9, shrink: 8, radius: 210, dmg: 24 },
  { wait: 8, shrink: 7, radius: 88, dmg: 36 },
] as const;
