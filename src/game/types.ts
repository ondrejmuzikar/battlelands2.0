import type { SkinId, WeaponId } from "./config";

export type Phase = "booting" | "menu" | "drop" | "falling" | "playing" | "victory" | "defeat";
export type HomeTab = "play" | "shop" | "pass" | "locker" | "quests" | "settings";
export type MatchMode = "solo" | "duo" | "squad";
export type AiState = "loot" | "fight" | "zone" | "wander" | "crate";

export type PickupKind =
  | "pistol"
  | "shotgun"
  | "ar"
  | "sniper"
  | "smg"
  | "bazooka"
  | "minigun"
  | "medkit"
  | "bandage"
  | "armor";

export type Blocker = { x: number; y: number; hw: number; hh: number };
export type BushSpec = { x: number; y: number; r: number };
export type AirdropHud = { x: number; y: number; state: "falling" | "landed" | "opening" };

export type FighterData = {
  id: number;
  isPlayer: boolean;
  name: string;
  color: number;
  skin: SkinId;
  hp: number;
  armor: number;
  alive: boolean;
  weapon: WeaponId;
  ammo: number;
  clip: number;
  reloadT: number;
  fireCd: number;
  aim: number;
  kills: number;
  damageDealt: number;
  aiState: AiState;
  aiTimer: number;
  targetId: number;
  invuln: number;
  bushId: number;
  healLeft: number;
  healRate: number;
  falling: boolean;
  fallT: number;
  dropX: number;
  dropY: number;
  revealT: number;
  looted: boolean;
};

export type HudSnapshot = {
  hp: number;
  armor: number;
  ammo: number;
  clip: number;
  mag: number;
  weapon: string;
  alive: number;
  total: number;
  kills: number;
  zoneIn: boolean;
  zoneDmg: number;
  zoneLabel: string;
  playerX: number;
  playerY: number;
  playerAim: number;
  zoneX: number;
  zoneY: number;
  zoneR: number;
  nextZoneR: number;
  loadout: WeaponId;
  fighters: Array<{ x: number; y: number; isPlayer: boolean; alive: boolean; color: number; hidden: boolean }>;
  airdrops: AirdropHud[];
  crateProgress: number;
  lootProgress: number;
  lootLabel: string;
  healLeft: number;
  inBush: boolean;
  fallT: number;
  reloadT: number;
  dropLeft: number;
  damageDealt: number;
  survival: number;
  killer: string;
};

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getPos: () => { x: number; y: number };
  setKeys: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}
