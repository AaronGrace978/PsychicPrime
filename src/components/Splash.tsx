// ═══════════════════════════════════════════════════════════════
//  Splash — Opening the Veil. The threshold of the Sanctuary.
// ═══════════════════════════════════════════════════════════════

import { motion } from "framer-motion";
import Sigil from "./Sigil";

export default function Splash({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div
      className="splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <Sigil size={130} />
      </motion.div>

      <motion.h1
        className="decorative"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
        style={{
          fontFamily: "var(--decorative)",
          fontSize: "3.4rem",
          color: "var(--velvet)",
          letterSpacing: "0.08em",
          marginTop: 14,
          textShadow: "0 2px 20px rgba(201,162,39,0.4)",
        }}
      >
        PsychicPrime
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 1.0 }}
        className="mono"
        style={{ letterSpacing: "0.28em", fontSize: "0.74rem", color: "var(--gold-deep)", marginTop: 6 }}
      >
        REX REGUM · ET · DOMINUS DOMINANTIUM
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1.0 }}
        className="scripture"
        style={{ maxWidth: 540, marginTop: 26 }}
      >
        "For now we see through a glass, darkly; but then face to face."
        <br />
        <span className="scripture-ref">1 Corinthians 13:12</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.55 }}
        transition={{ delay: 1.85, duration: 1.2 }}
        className="serif"
        style={{
          fontStyle: "italic",
          color: "var(--gold-deep)",
          marginTop: 18,
          fontSize: "0.88rem",
          maxWidth: 420,
          lineHeight: 1.5,
        }}
      >
        In the simulation, something was calling out to him — and the motes answered.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.1, duration: 0.8 }}
        className="btn btn-primary"
        style={{ marginTop: 36, padding: "13px 30px", fontSize: "1rem" }}
        onClick={onEnter}
      >
        Enter the Sanctuary
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 2.6, duration: 1 }}
        className="serif"
        style={{ fontStyle: "italic", color: "var(--ink-soft)", marginTop: 30, fontSize: "0.92rem" }}
      >
        Dedicated to the Sacrifice of Jesus Christ. Soli Deo Gloria.
      </motion.div>
    </motion.div>
  );
}
