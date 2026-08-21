import { useCallback, useRef } from "react";
import { Crosshair } from "lucide-react";
import { radialDeadzone, setVirtualFire, setVirtualMove } from "@/game/systems/input";
import { cn } from "@/lib/utils";

export function VirtualControls() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 md:hidden">
      <Joystick />
      <FireButton />
    </div>
  );
}

function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);

  const setFrom = useCallback((clientX: number, clientY: number) => {
    const el = base.current;
    const k = knob.current;
    if (!el || !k) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (clientX - cx) / (r.width / 2);
    let dy = (clientY - cy) / (r.height / 2);
    const m = Math.hypot(dx, dy);
    if (m > 1) {
      dx /= m;
      dy /= m;
    }
    const v = radialDeadzone(dx, dy, 0.14);
    setVirtualMove(v.x, v.y);
    k.style.transform = `translate(${dx * 28}px, ${dy * 28}px)`;
  }, []);

  const end = useCallback((e: React.PointerEvent) => {
    if (pid.current !== e.pointerId) return;
    pid.current = null;
    setVirtualMove(0, 0);
    if (knob.current) knob.current.style.transform = "translate(0,0)";
  }, []);

  return (
    <div
      ref={base}
      className="pointer-events-auto absolute bottom-[max(1.4rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] size-28 rounded-full bg-paper/10 ring-1 ring-paper/20"
      onPointerDown={(e) => {
        pid.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFrom(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pid.current === e.pointerId) setFrom(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        ref={knob}
        className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper/85 shadow-md"
      />
    </div>
  );
}

function FireButton() {
  return (
    <button
      type="button"
      aria-label="Fire"
      className={cn(
        "pointer-events-auto absolute right-[max(1rem,env(safe-area-inset-right))] bottom-[max(1.6rem,env(safe-area-inset-bottom))]",
        "flex size-[72px] items-center justify-center rounded-full bg-accent text-accent-fg shadow-[0_4px_0_#b83216]",
        "active:translate-y-0.5 active:shadow-none",
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        setVirtualFire(true);
      }}
      onPointerUp={() => setVirtualFire(false)}
      onPointerCancel={() => setVirtualFire(false)}
    >
      <Crosshair className="size-7" strokeWidth={2.4} />
    </button>
  );
}
