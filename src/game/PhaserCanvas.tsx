import { useEffect, useRef } from "react";
import type Phaser from "phaser";

export function PhaserCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let game: Phaser.Game | null = null;

    void import("./boot").then(({ createGame }) => {
      if (cancelled || !ref.current) return;
      game = createGame(ref.current);
      gameRef.current = game;
    });

    return () => {
      cancelled = true;
      game?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={ref}
      id="game-root"
      className="absolute inset-0 h-full w-full touch-none"
    />
  );
}
