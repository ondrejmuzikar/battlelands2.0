export const WORLD = 2400;
export const WORLD_CENTER = WORLD / 2;
export const LAND_RADIUS = 1080;
export const PLAYER_COUNT = 12;
export const PLAYER_SPEED = 228;
export const BOT_SPEED = 196;
export const BODY_RADIUS = 16;
export const PICKUP_RADIUS = 38;
export const MAX_HP = 100;
export const MAX_ARMOR = 75;
export const PLAY_ZOOM = 1.42;
export const PLAY_ZOOM_SHORT = 1.24;
export const FALL_DURATION = 4.0;
export const FALL_STEER = 210;
export const BUSH_RADIUS = 38;
export const AIRDROP_OPEN = 2.8;
export const AIRDROP_FALL = 6.2;
export const AIRDROP_TIMES = [48, 92] as const;
export const DROP_TIME = 5;
export const WATER_SPEED = 0.55;

export const SKINS = [
  { id: "sunny", name: "Sunny", tint: 0xffe08a, rarity: "common" },
  { id: "coral", name: "Coral", tint: 0xff6b6b, rarity: "rare" },
  { id: "mint", name: "Mint", tint: 0x4ade80, rarity: "rare" },
  { id: "sky", name: "Sky", tint: 0x38bdf8, rarity: "epic" },
  { id: "grape", name: "Grape", tint: 0xc084fc, rarity: "epic" },
  { id: "mango", name: "Mango", tint: 0xfbbf24, rarity: "legendary" },
] as const;

export type SkinId = (typeof SKINS)[number]["id"];
export type Rarity = (typeof SKINS)[number]["rarity"];

export const RARITY_COLOR: Record<Rarity, string> = {
  common: "#94a3b8",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export const HEALS = {
  bandage: { amount: 30, duration: 2.4, label: "Bandage", pickup: 0.7 },
  medkit: { amount: 60, duration: 3.6, label: "Medkit", pickup: 1.1 },
} as const;

export const WEAPONS = {
  fists: { id: "fists", name: "Fists", damage: 14, rate: 2.4, speed: 0, range: 46, spread: 0, pellets: 1, mag: 0, starter: 0, knockback: 90, reload: 0, pickup: 0.4, aoe: 0 },
  pistol: { id: "pistol", name: "Pistol", damage: 16, rate: 5.4, speed: 640, range: 430, spread: 0.05, pellets: 1, mag: 12, starter: 24, knockback: 36, reload: 1.15, pickup: 0.6, aoe: 0 },
  smg: { id: "smg", name: "SMG", damage: 11, rate: 11.5, speed: 620, range: 340, spread: 0.11, pellets: 1, mag: 28, starter: 56, knockback: 28, reload: 1.25, pickup: 0.7, aoe: 0 },
  shotgun: { id: "shotgun", name: "Shotgun", damage: 10, rate: 1.12, speed: 520, range: 230, spread: 0.36, pellets: 5, mag: 6, starter: 12, knockback: 150, reload: 1.45, pickup: 0.75, aoe: 0 },
  ar: { id: "ar", name: "Assault", damage: 18, rate: 7.2, speed: 760, range: 620, spread: 0.055, pellets: 1, mag: 24, starter: 48, knockback: 48, reload: 1.7, pickup: 0.85, aoe: 0 },
  sniper: { id: "sniper", name: "Sniper", damage: 64, rate: 0.72, speed: 980, range: 980, spread: 0.008, pellets: 1, mag: 4, starter: 8, knockback: 80, reload: 2.35, pickup: 1.05, aoe: 0 },
  bazooka: { id: "bazooka", name: "Bazooka", damage: 58, rate: 0.55, speed: 300, range: 560, spread: 0.02, pellets: 1, mag: 2, starter: 4, knockback: 220, reload: 2.4, pickup: 1.35, aoe: 78 },
  minigun: { id: "minigun", name: "Minigun", damage: 8, rate: 16, speed: 700, range: 520, spread: 0.13, pellets: 1, mag: 80, starter: 80, knockback: 24, reload: 2.5, pickup: 1.45, aoe: 0 },
} as const;

export type WeaponId = keyof typeof WEAPONS;

export const BOT_COLORS = [0xff5a36, 0x3ec6ff, 0x3ddc97, 0xffc857, 0xff6b9d, 0x7ae1ff, 0xf4a261, 0x90be6d, 0xe76f51, 0x4cc9f0, 0xb8f2e6];

export const ZONE_PHASES = [
  { wait: 36, shrink: 14, radius: 920, dmg: 6 },
  { wait: 16, shrink: 12, radius: 560, dmg: 12 },
  { wait: 12, shrink: 10, radius: 300, dmg: 20 },
  { wait: 10, shrink: 8, radius: 110, dmg: 34 },
] as const;

export const POIS = [
  { name: "Boom Harbor", x: 560, y: 700 },
  { name: "Palm Hideout", x: 980, y: 540 },
  { name: "Coral Mansion", x: 1880, y: 760 },
  { name: "Tide Market", x: 430, y: 1260 },
  { name: "Shell Yard", x: 1320, y: 1280 },
  { name: "Gas Grotto", x: 1760, y: 1180 },
  { name: "Cinder Docks", x: 620, y: 1740 },
  { name: "Wreck Point", x: 1560, y: 1760 },
] as const;
