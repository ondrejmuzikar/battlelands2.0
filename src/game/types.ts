import type { WeaponId } from "./config";

export type Phase = "booting" | "menu" | "drop" | "playing" | "victory" | "defeat";

export type AiState = "loot" | "fight" | "zone" | "wander";

export type PickupKind = "pistol" | "shotgun" | "rifle" | "medkit" | "armor";

export type Blocker = {
  x: number;
  y: number;
  hw: number;
  hh: number;
};

export type FighterData = {
  id: number;
  isPlayer: boolean;
  name: string;
  color: number;
  hp: number;
  armor: number;
  alive: boolean;
  weapon: WeaponId;
  ammo: number;
  fireCd: number;
  aim: number;
  kills: number;
  aiState: AiState;
  aiTimer: number;
  targetId: number;
  invuln: number;
};

export type HudSnapshot = {
  hp: number;
  armor: number;
  ammo: number;
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
  zoneX: number;
  zoneY: number;
  zoneR: number;
  nextZoneR: number;
  loadout: PickupKind | "fists";
  fighters: Array<{ x: number; y: number; isPlayer: boolean; alive: boolean; color: number }>;
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
