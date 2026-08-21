import { Crown, RotateCcw } from "lucide-react";
import { backToMenu, playAgain } from "@/game/api";
import { useGameStore } from "@/game/store";
import { sfxPlay, unlockAudio } from "@/game/systems/audio";
import { cn } from "@/lib/utils";

export function EndScreen() {
  const phase = useGameStore((s) => s.phase);
  const place = useGameStore((s) => s.place);
  const hud = useGameStore((s) => s.hud);
  const win = phase === "victory";

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-ink/55 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:items-center">
      <div className="w-full max-w-md rounded-xl bg-ink-2 p-6 ring-1 ring-paper/12">
        <p className="text-xs font-extrabold tracking-[0.22em] text-muted uppercase">
          {win ? "Winner winner" : "Eliminated"}
        </p>
        <h2 className="font-display mt-1 flex items-center gap-2 text-4xl text-paper">
          {win ? (
            <>
              <Crown className="size-8 text-accent" />
              Victory
            </>
          ) : (
            <>Place #{place}</>
          )}
        </h2>
        <p className="mt-2 text-sm font-bold text-muted">
          {win
            ? "You were the last fighter standing on Boom Isle."
            : "The storm or a rival took you out. Drop in again."}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Kills" value={String(hud.kills)} />
          <Stat label="Alive when downed" value={String(hud.alive)} />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              sfxPlay.click();
              playAgain();
            }}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-lg bg-accent font-extrabold text-accent-fg shadow-[0_3px_0_#b83216]",
              "active:translate-y-0.5 active:shadow-none",
            )}
          >
            <RotateCcw className="size-4" />
            Drop again
          </button>
          <button
            type="button"
            onClick={() => {
              sfxPlay.click();
              backToMenu();
            }}
            className="h-12 rounded-lg bg-ink-3 font-extrabold text-paper ring-1 ring-paper/10"
          >
            Menu
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink px-3 py-2 ring-1 ring-paper/8">
      <p className="text-[10px] font-extrabold tracking-wider text-muted uppercase">{label}</p>
      <p className="font-display text-2xl tabular-nums text-paper">{value}</p>
    </div>
  );
}
