import type { AmmoId, SkinId, WeaponId } from "./config";

export type Phase = "booting" | "menu" | "drop" | "falling" | "playing" | "victory" | "defeat";

export type AiState = "loot" | "fight" | "zone" | "wander" | "crate";

export type PickupKind =
  | "pistol"
  | "shotgun"
  | "rifle"
  | "medkit"
  | "bandage"
  | "armor"
  | "ammo-light"
  | "ammo-shell"
  | "ammo-rifle";

export type Blocker = {
  x: number;
  y: number;
  hw: number;
  hh: number;
};

export type BushSpec = {
  x: number;
  y: number;
  r: number;
};

export type AirdropHud = {
  x: number;
  y: number;
  state: "falling" | "landed" | "opening";
};

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
  ammoPool: Record<AmmoId, number>;
  fireCd: number;
  aim: number;
  kills: number;
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
};

export type HudSnapshot = {
  hp: number;
  armor: number;
  ammo: number;
  mag: number;
  ammoType: AmmoId | null;
  ammoPool: Record<AmmoId, number>;
  weapon: string;
  alive: number;
  total: number;
  kills: number;
  zoneIn: boolean;
  zoneDmg: number;
  zoneLabel: string;
  playerX: number;
  playerY: number;
  zoneX: number;
  zoneY: number;
  zoneR: number;
  nextZoneR: number;
  loadout: WeaponId;
  fighters: Array<{
    x: number;
    y: number;
    isPlayer: boolean;
    alive: boolean;
    color: number;
    hidden: boolean;
  }>;
  airdrops: AirdropHud[];
  crateProgress: number;
  healLeft: number;
  inBush: boolean;
  fallT: number;
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
