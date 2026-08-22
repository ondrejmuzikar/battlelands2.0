import { create } from "zustand";
import type { HudSnapshot, Phase } from "./types";
import { MAX_HP, PLAYER_COUNT, WORLD_CENTER, type SkinId } from "./config";

const emptyHud: HudSnapshot = {
  hp: MAX_HP,
  armor: 0,
  ammo: 0,
  mag: 0,
  ammoType: null,
  ammoPool: { light: 0, shell: 0, rifle: 0 },
  weapon: "Fists",
  alive: PLAYER_COUNT,
  total: PLAYER_COUNT,
  kills: 0,
  zoneIn: true,
  zoneDmg: 0,
  zoneLabel: "Safe",
  playerX: WORLD_CENTER,
  playerY: WORLD_CENTER,
  zoneX: WORLD_CENTER,
  zoneY: WORLD_CENTER,
  zoneR: 1500,
  nextZoneR: 980,
  loadout: "fists",
  fighters: [],
  airdrops: [],
  crateProgress: 0,
  healLeft: 0,
  inBush: false,
  fallT: 1,
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
  hud: HudSnapshot;
  setPhase: (phase: Phase) => void;
  setReady: (ready: boolean) => void;
  setProgress: (progress: number) => void;
  toggleMute: () => void;
  setDrop: (x: number, y: number) => void;
  clearDrop: () => void;
  setSkin: (skin: SkinId) => void;
  setHud: (hud: HudSnapshot) => void;
  finish: (phase: "victory" | "defeat", place: number) => void;
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
  hud: emptyHud,
  setPhase: (phase) => set({ phase }),
  setReady: (ready) => set({ ready }),
  setProgress: (progress) => set({ progress }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setDrop: (x, y) => set({ dropX: x, dropY: y, hasDrop: true }),
  clearDrop: () => set({ hasDrop: false }),
  setSkin: (skin) => set({ skin }),
  setHud: (hud) => set({ hud }),
  finish: (phase, place) => set({ phase, place }),
  resetToMenu: () =>
    set({
      phase: "menu",
      hasDrop: false,
      place: 1,
      hud: emptyHud,
    }),
}));
