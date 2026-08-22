import { useCallback, useEffect, useRef, useState } from "react";
import { radialDeadzone, setVirtualAim, setVirtualMove } from "@/game/systems/input";

export function VirtualControls() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const check = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const small = window.innerWidth < 980;
      setShow(coarse || small || "ontouchstart" in window);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <Stick side="left" />
      <Stick side="right" />
    </div>
  );
}

function Stick({ side }: { side: "left" | "right" }) {
  const pad = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);

  const apply = useCallback((clientX: number, clientY: number) => {
    const el = pad.current;
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
    const v = radialDeadzone(dx, dy, 0.12);
    if (side === "left") setVirtualMove(v.x, v.y);
    else setVirtualAim(v.x, v.y, m > 0.16);
    k.style.transform = `translate(${dx * 30}px, ${dy * 30}px)`;
  }, [side]);

  const end = useCallback(() => {
    pid.current = null;
    if (side === "left") setVirtualMove(0, 0);
    else setVirtualAim(0, 0, false);
    if (knob.current) knob.current.style.transform = "translate(0,0)";
  }, [side]);

  useEffect(() => {
    const el = pad.current;
    if (!el) return;
    const start = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (e instanceof PointerEvent) {
        pid.current = e.pointerId;
        try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
        apply(e.clientX, e.clientY);
      } else if (e instanceof TouchEvent && e.touches[0]) {
        apply(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const move = (e: Event) => {
      e.preventDefault();
      if (e instanceof PointerEvent) {
        if (pid.current !== null && e.pointerId !== pid.current) return;
        apply(e.clientX, e.clientY);
      } else if (e instanceof TouchEvent && e.touches[0]) {
        apply(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    el.addEventListener("pointerdown", start);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("touchstart", start, { passive: false });
    el.addEventListener("touchmove", move, { passive: false });
    el.addEventListener("touchend", end);
    el.addEventListener("touchcancel", end);
    return () => {
      el.removeEventListener("pointerdown", start);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", end);
      el.removeEventListener("pointercancel", end);
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
      el.removeEventListener("touchend", end);
      el.removeEventListener("touchcancel", end);
    };
  }, [apply, end]);

  const pos = side === "left"
    ? "left-[max(0.4rem,env(safe-area-inset-left))]"
    : "right-[max(0.4rem,env(safe-area-inset-right))]";

  return (
    <div className={`pointer-events-auto absolute bottom-[max(0.6rem,env(safe-area-inset-bottom))] ${pos} h-[42vw] max-h-52 min-h-36 w-[42vw] max-w-52 min-w-36`}>
      <div
        ref={pad}
        className={`absolute bottom-3 ${side === "left" ? "left-3" : "right-3"} size-[7.25rem] rounded-full bg-paper/12 ring-2 ${side === "right" ? "ring-danger/50" : "ring-paper/25"}`}
        style={{ touchAction: "none" }}
      >
        <div
          ref={knob}
          className={`absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md ${side === "right" ? "bg-danger/90" : "bg-paper/90"}`}
        />
      </div>
    </div>
  );
}
