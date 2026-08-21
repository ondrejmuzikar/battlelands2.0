import { useEffect } from "react";
import { DropBanner } from "@/components/game/DropBanner";
import { EndScreen } from "@/components/game/EndScreen";
import { Hud } from "@/components/game/Hud";
import { MenuScreen } from "@/components/game/MenuScreen";
import { VirtualControls } from "@/components/game/VirtualControls";
import { PhaserCanvas } from "./PhaserCanvas";
import { useGameStore } from "./store";
import { resumeAudio, unlockAudio } from "./systems/audio";

export function GameApp() {
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    const onVis = () => {
      if (!document.hidden) resumeAudio();
    };
    document.addEventListener("visibilitychange", onVis);
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-ink">
      <PhaserCanvas />
      {phase === "menu" || phase === "booting" ? <MenuScreen /> : null}
      {phase === "drop" ? (
        <>
          <Hud />
          <DropBanner />
        </>
      ) : null}
      {phase === "playing" ? (
        <>
          <Hud />
          <VirtualControls />
        </>
      ) : null}
      {phase === "victory" || phase === "defeat" ? (
        <>
          <Hud />
          <EndScreen />
        </>
      ) : null}
    </main>
  );
}
