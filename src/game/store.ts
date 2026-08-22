import { create } from "zustand";
import type { HomeTab, HudSnapshot, MatchMode, Phase } from "./types";
import { MAX_HP, PLAYER_COUNT, WORLD_CENTER, type SkinId } from "./config";

export const emptyHud: HudSnapshot = {
  hp: MAX_HP,
  armor: 0,
  ammo: 0,
  clip: 0,
  mag: 0,
  weapon: "Fists",
  alive: PLAYER_COUNT,
  total: PLAYER_COUNT,
  kills: 0,
  zoneIn: true,
  zoneDmg: 0,
  zoneLabel: "Safe",
  playerX: WORLD_CENTER,
  playerY: WORLD_CENTER,
  playerAim: 0,
  zoneX: WORLD_CENTER,
  zoneY: WORLD_CENTER,
  zoneR: 1500,
  nextZoneR: 920,
  loadout: "fists",
  fighters: [],
  airdrops: [],
  crateProgress: 0,
  lootProgress: 0,
  lootLabel: "",
  healLeft: 0,
  inBush: false,
  fallT: 1,
  reloadT: 0,
  dropLeft: 5,
  damageDealt: 0,
  survival: 0,
  killer: "",
};

type GameStore = {
  phase: Phase;
  ready: boolean;
  progress: number;
  muted: boolean;
  dropX: number;
  dropY: number;
  hasDrop: boolean;
  place: number;
  skin: SkinId;
  mode: MatchMode;
  homeTab: HomeTab;
  coins: number;
  bucks: number;
  trophies: number;
  xp: number;
  level: number;
  playerName: string;
  hud: HudSnapshot;
  setPhase: (phase: Phase) => void;
  setReady: (ready: boolean) => void;
  setProgress: (progress: number) => void;
  toggleMute: () => void;
  setDrop: (x: number, y: number) => void;
  clearDrop: () => void;
  setSkin: (skin: SkinId) => void;
  setMode: (mode: MatchMode) => void;
  setHomeTab: (tab: HomeTab) => void;
  setHud: (hud: HudSnapshot) => void;
  finish: (phase: "victory" | "defeat", place: number) => void;
  grantRewards: (coins: number, trophies: number, xp: number) => void;
  resetToMenu: () => void;
};

export const useGameStore = create<GameStore>((set) => ({
  phase: "booting",
  ready: false,
  progress: 0,
  muted: false,
  dropX: WORLD_CENTER,
  dropY: WORLD_CENTER,
  hasDrop: false,
  place: 1,
  skin: "sunny",
  mode: "solo",
  homeTab: "play",
  coins: 1240,
  bucks: 80,
  trophies: 312,
  xp: 420,
  level: 14,
  playerName: "Islander",
  hud: emptyHud,
  setPhase: (phase) => set({ phase }),
  setReady: (ready) => set({ ready }),
  setProgress: (progress) => set({ progress }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setDrop: (x, y) => set({ dropX: x, dropY: y, hasDrop: true }),
  clearDrop: () => set({ hasDrop: false }),
  setSkin: (skin) => set({ skin }),
  setMode: (mode) => set({ mode }),
  setHomeTab: (homeTab) => set({ homeTab }),
  setHud: (hud) => set({ hud }),
  finish: (phase, place) => set({ phase, place }),
  grantRewards: (coins, trophies, xp) =>
    set((s) => ({
      coins: s.coins + coins,
      trophies: Math.max(0, s.trophies + trophies),
      xp: s.xp + xp,
      level: s.level + (s.xp + xp > 1000 ? 1 : 0),
    })),
  resetToMenu: () =>
    set({
      phase: "menu",
      hasDrop: false,
      place: 1,
      homeTab: "play",
      hud: emptyHud,
    }),
}));
