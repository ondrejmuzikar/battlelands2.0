import type { ReactNode } from "react";
import { Crosshair, MapPinned, Skull, Users } from "lucide-react";
import { useGameStore } from "@/game/store";
import { startDrop } from "@/game/api";
import { sfxPlay, unlockAudio } from "@/game/systems/audio";
import { cn } from "@/lib/utils";

export function MenuScreen() {
  const ready = useGameStore((s) => s.ready);
  const progress = useGameStore((s) => s.progress);

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-end bg-ink/55 px-5 pb-20 pt-[max(2rem,env(safe-area-inset-top))] sm:justify-center sm:pb-16">
      <div className="mb-auto mt-8 text-center sm:mb-10 sm:mt-0">
        <p className="text-xs font-extrabold tracking-[0.28em] text-storm uppercase">
          Cartoon Royale
        </p>
        <h1 className="font-display mt-2 text-6xl leading-none text-paper drop-shadow-[0_4px_0_#101820] sm:text-7xl">
          BOOM
          <span className="block text-accent">ISLE</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm font-bold text-muted">
          Drop in. Loot up. Last one standing.
        </p>
      </div>

      <div className="mb-6 grid w-full max-w-md grid-cols-3 gap-2 text-center">
        <Hint icon={<MapPinned className="size-4" />} label="Pick a drop" />
        <Hint icon={<Crosshair className="size-4" />} label="Loot & shoot" />
        <Hint icon={<Skull className="size-4" />} label="Outlast 11 bots" />
      </div>

      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          unlockAudio();
          sfxPlay.click();
          startDrop();
        }}
        className={cn(
          "h-14 w-full max-w-md rounded-xl bg-accent text-lg font-extrabold text-accent-fg shadow-[0_4px_0_#b83216]",
          "transition-transform duration-150 ease-out",
          "hover:brightness-110 active:translate-y-0.5 active:shadow-none",
          "disabled:opacity-50 disabled:shadow-none",
        )}
      >
        {ready ? "Play match" : `Loading ${Math.round(progress * 100)}%`}
      </button>

      <p className="mt-4 flex items-center gap-2 text-xs font-bold text-muted">
        <Users className="size-3.5" />
        12 fighters · WASD + mouse · joystick on phone
      </p>
    </div>
  );
}

function Hint({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="rounded-lg bg-ink-2/80 px-2 py-3 ring-1 ring-paper/10">
      <div className="mx-auto mb-1 flex size-7 items-center justify-center rounded-md bg-ink-3 text-paper">
        {icon}
      </div>
      <p className="text-[11px] font-extrabold text-paper">{label}</p>
    </div>
  );
}
