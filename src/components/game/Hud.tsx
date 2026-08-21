import type { ReactNode } from "react";
import { Shield, Skull, Users, Volume2, VolumeX } from "lucide-react";
import { MAX_ARMOR, MAX_HP } from "@/game/config";
import { useGameStore } from "@/game/store";
import { Minimap } from "./Minimap";
import { cn } from "@/lib/utils";

export function Hud() {
  const hud = useGameStore((s) => s.hud);
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const phase = useGameStore((s) => s.phase);
  const playing = phase === "playing";

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="flex items-start justify-between gap-3 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pl-[max(0.75rem,env(safe-area-inset-left))]">
        <div className="pointer-events-auto flex items-center gap-2">
          <Chip>
            <Users className="size-3.5 text-accent" />
            <span className="tabular-nums">{hud.alive}</span>
            <span className="text-muted">/{hud.total}</span>
          </Chip>
          <Chip>
            <Skull className="size-3.5 text-muted" />
            <span className="tabular-nums">{hud.kills}</span>
          </Chip>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <Chip className={hud.zoneIn ? "" : "text-danger"}>
            <span className="size-2 rounded-full bg-storm" />
            <span className="tabular-nums">{hud.zoneLabel}</span>
          </Chip>
          <button
            type="button"
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={toggleMute}
            className="flex size-11 items-center justify-center rounded-lg bg-ink-2/85 text-paper ring-1 ring-paper/10"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
        </div>
      </div>

      {playing ? (
        <div className="absolute top-16 right-[max(0.75rem,env(safe-area-inset-right))]">
          <Minimap />
        </div>
      ) : null}

      <div className="absolute right-0 bottom-0 left-0 flex items-end justify-between gap-3 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]">
        <div className="w-44 sm:w-56">
          <Bar
            value={hud.hp}
            max={MAX_HP}
            color="bg-health"
            label={`${Math.ceil(hud.hp)}`}
          />
          <div className="mt-1.5 flex items-center gap-1.5">
            <Shield className="size-3 text-armor" />
            <Bar
              value={hud.armor}
              max={MAX_ARMOR}
              color="bg-armor"
              label={`${Math.ceil(hud.armor)}`}
              slim
            />
          </div>
        </div>
        {playing ? (
          <div className="mb-14 rounded-lg bg-ink-2/85 px-3 py-2 text-right ring-1 ring-paper/10 sm:mb-0">
            <p className="text-[10px] font-extrabold tracking-wider text-muted uppercase">
              {hud.weapon}
            </p>
            <p className="font-display text-2xl leading-none tabular-nums text-paper">
              {hud.weapon === "Fists" ? "—" : `${hud.ammo}`}
              {hud.mag > 0 ? (
                <span className="text-sm text-muted">/{hud.mag}</span>
              ) : null}
            </p>
          </div>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

function Chip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 items-center gap-1.5 rounded-lg bg-ink-2/85 px-3 text-sm font-extrabold text-paper ring-1 ring-paper/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Bar({
  value,
  max,
  color,
  label,
  slim,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  slim?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-ink/70 ring-1 ring-paper/10",
        slim ? "h-2.5" : "h-4",
      )}
    >
      <div className={cn("h-full rounded-md", color)} style={{ width: `${pct}%` }} />
      {!slim ? (
        <span className="absolute inset-0 flex items-center justify-end pr-1.5 text-[10px] font-extrabold tabular-nums text-ink">
          {label}
        </span>
      ) : null}
    </div>
  );
}
