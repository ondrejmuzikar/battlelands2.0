import { useEffect, useRef } from "react";
import { WORLD } from "@/game/config";
import { useGameStore } from "@/game/store";

const SIZE = 128;

export function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const islandRef = useRef<HTMLImageElement | null>(null);
  const hud = useGameStore((s) => s.hud);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/map/island.png";
    img.onload = () => {
      islandRef.current = img;
    };
  }, []);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = SIZE * dpr;
    c.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.beginPath();
    ctx.roundRect(0, 0, SIZE, SIZE, 14);
    ctx.clip();
    if (islandRef.current) ctx.drawImage(islandRef.current, 0, 0, SIZE, SIZE);
    else {
      ctx.fillStyle = "#2aa05a";
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    const sx = SIZE / WORLD;
    ctx.strokeStyle = "rgba(30,200,200,0.95)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hud.zoneX * sx, hud.zoneY * sx, hud.zoneR * sx, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(hud.zoneX * sx, hud.zoneY * sx, Math.max(4, hud.nextZoneR * sx), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (const drop of hud.airdrops) {
      ctx.fillStyle = drop.state === "falling" ? "#fb923c" : "#f97316";
      ctx.beginPath();
      ctx.arc(drop.x * sx, drop.y * sx, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const f of hud.fighters) {
      if (!f.alive || f.hidden) continue;
      ctx.fillStyle = f.isPlayer ? "#ffe08a" : "#ff5a36";
      ctx.beginPath();
      ctx.arc(f.x * sx, f.y * sx, f.isPlayer ? 3.6 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [hud]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="size-[128px] rounded-xl bg-ink-2/80 shadow-[0_4px_0_#101820] ring-2 ring-paper/20"
    />
  );
}
