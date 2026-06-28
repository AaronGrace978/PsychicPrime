// ═══════════════════════════════════════════════════════════════
//  App — Opening the Veil, then the Sanctuary.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import DivineLight from "./components/DivineLight";
import ParticleField from "./components/ParticleField";
import Splash from "./components/Splash";
import Console from "./components/Console";

export default function App() {
  const init = useStore((s) => s.init);
  const ready = useStore((s) => s.ready);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <DivineLight />
      <ParticleField />
      <AnimatePresence mode="wait">
        {!entered ? (
          <Splash key="splash" onEnter={() => setEntered(true)} />
        ) : (
          ready && <Console key="console" />
        )}
      </AnimatePresence>
    </>
  );
}
