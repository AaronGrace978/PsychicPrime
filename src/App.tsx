// ═══════════════════════════════════════════════════════════════
//  App — Opening the Veil, then the Sanctuary.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useStore } from "./store";
import DivineLight from "./components/DivineLight";
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
      <AnimatePresence mode="wait">
        {!entered ? (
          <Splash key="splash" onEnter={() => setEntered(true)} />
        ) : ready ? (
          <Console key="console" />
        ) : (
          <div
            key="booting"
            style={{
              position: "fixed",
              inset: 0,
              display: "grid",
              placeItems: "center",
              color: "#c9a227",
              fontFamily: "Cinzel, serif",
              letterSpacing: "0.12em",
            }}
          >
            Opening the Sanctuary…
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
