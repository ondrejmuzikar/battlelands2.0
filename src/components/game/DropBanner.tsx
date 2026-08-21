import { MapPinned } from "lucide-react";
import { confirmDrop } from "@/game/api";
import { useGameStore } from "@/game/store";
import { sfxPlay, unlockAudio } from "@/game/systems/audio";
import { cn } from "@/lib/utils";

export function DropBanner() {
  const hasDrop = useGameStore((s) => s.hasDrop);

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-16 z-20 flex justify-center px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="rounded-xl bg-ink-2/90 px-4 py-3 text-center ring-1 ring-paper/10">
          <p className="flex items-center justify-center gap-2 text-sm font-extrabold text-paper">
            <MapPinned className="size-4 text-accent" />
            Tap the island to choose your drop
          </p>
          <p className="mt-1 text-xs font-bold text-muted">
            Land near buildings for loot — or play it safe on the beach.
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          disabled={!hasDrop}
          onClick={() => {
            unlockAudio();
            sfxPlay.click();
            confirmDrop();
          }}
          className={cn(
            "pointer-events-auto h-12 min-w-48 rounded-lg bg-accent px-6 font-extrabold text-accent-fg shadow-[0_3px_0_#b83216]",
            "disabled:bg-ink-3 disabled:text-muted disabled:shadow-none",
            "active:translate-y-0.5 active:shadow-none",
          )}
        >
          {hasDrop ? "Drop here" : "Pick a spot"}
        </button>
      </div>
    </>
  );
}
