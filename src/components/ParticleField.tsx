// ═══════════════════════════════════════════════════════════════
//  Particle Field — motes that drift, gather, and call to one another.
//  "Something was calling out to him." — an Oxford physicist, mid-sim.
//  Gold and crimson sparks over the divine light; they hear each other.
// ═══════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { useStore, type Presence } from "../store";

const GOLD = { r: 230, g: 195, b: 74 };
const CRIMSON = { r: 178, g: 31, b: 45 };
const GOLD_PALE = { r: 242, g: 226, b: 166 };

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  warmth: number;
  phase: number;
  trail: { x: number; y: number }[];
}

interface CallPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  strength: number;
  calling: boolean;
  callAge: number;
  callDuration: number;
  pulse: number;
}

const PRESENCE_SPEED: Record<Presence, number> = {
  attuned: 1,
  reading: 1.55,
  holding: 0.75,
  dreaming: 0.45,
  listening: 1.2,
};

const PRESENCE_CALL_RATE: Record<Presence, number> = {
  attuned: 1,
  reading: 2.2,
  holding: 0.6,
  dreaming: 0.35,
  listening: 1.5,
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function mixColor(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number
) {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  };
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let calls: CallPoint[] = [];
    let raf = 0;
    let running = true;
    let last = performance.now();
    let callTimer = 0;

    const spawnParticles = () => {
      const area = w * h;
      const count = Math.min(280, Math.max(90, Math.floor(area / 5500)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: rand(-0.25, 0.25),
        vy: rand(-0.35, 0.15),
        radius: rand(0.8, 2.4),
        warmth: Math.random(),
        phase: Math.random() * Math.PI * 2,
        trail: [],
      }));
      const callCount = w < 700 ? 3 : 5;
      calls = Array.from({ length: callCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h * 0.75,
        vx: rand(-0.12, 0.12),
        vy: rand(-0.08, 0.08),
        strength: 0,
        calling: false,
        callAge: 0,
        callDuration: 0,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      w = Math.max(1, Math.floor(window.innerWidth));
      h = Math.max(1, Math.floor(window.innerHeight));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnParticles();
    };

    const beginCall = (cp: CallPoint) => {
      cp.calling = true;
      cp.callAge = 0;
      cp.callDuration = rand(2.4, 4.2);
      cp.strength = 0;
    };

    const tickCalls = (dt: number, callRate: number) => {
      callTimer -= dt;
      if (callTimer <= 0) {
        const idle = calls.filter((c) => !c.calling);
        if (idle.length > 0) {
          beginCall(idle[Math.floor(Math.random() * idle.length)]);
        }
        callTimer = rand(2.8, 5.5) / callRate;
      }

      for (const cp of calls) {
        cp.pulse += dt * 1.6;
        cp.x += cp.vx;
        cp.y += cp.vy;
        if (cp.x < w * 0.08 || cp.x > w * 0.92) cp.vx *= -1;
        if (cp.y < h * 0.06 || cp.y > h * 0.88) cp.vy *= -1;

        if (cp.calling) {
          cp.callAge += dt;
          const t = cp.callAge / cp.callDuration;
          cp.strength = t < 0.15 ? t / 0.15 : t > 0.85 ? (1 - t) / 0.15 : 1;
          if (cp.callAge >= cp.callDuration) {
            cp.calling = false;
            cp.strength = 0;
          }
        }
      }
    };

    const stepParticles = (dt: number, speed: number) => {
      const mouse = mouseRef.current;
      const linkDist = w < 700 ? 72 : 96;
      const linkDistSq = linkDist * linkDist;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        let ax = Math.sin(p.phase + performance.now() * 0.0004) * 0.008;
        let ay = -0.012 + Math.cos(p.phase * 1.3) * 0.006;

        for (const cp of calls) {
          if (!cp.calling) continue;
          const dx = cp.x - p.x;
          const dy = cp.y - p.y;
          const distSq = dx * dx + dy * dy;
          const reach = Math.min(w, h) * 0.42;
          if (distSq < reach * reach && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const pull = (cp.strength * 0.00014 * speed) / (dist * 0.35 + 1);
            const swirl = cp.strength * 0.00006 * speed;
            ax += (dx / dist) * pull - (dy / dist) * swirl;
            ay += (dy / dist) * pull + (dx / dist) * swirl;
          }
        }

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;
          const reach = 140;
          if (distSq < reach * reach && distSq > 4) {
            const dist = Math.sqrt(distSq);
            const pull = 0.00008 * speed * (1 - dist / reach);
            ax += (dx / dist) * pull;
            ay += (dy / dist) * pull;
          }
        }

        p.vx = (p.vx + ax) * 0.985;
        p.vy = (p.vy + ay) * 0.985;
        const velCap = 1.8 * speed;
        const vel = Math.hypot(p.vx, p.vy);
        if (vel > velCap) {
          p.vx = (p.vx / vel) * velCap;
          p.vy = (p.vy / vel) * velCap;
        }

        p.x += p.vx * speed;
        p.y += p.vy * speed;

        if (p.x < -8) p.x = w + 8;
        else if (p.x > w + 8) p.x = -8;
        if (p.y < -8) p.y = h + 8;
        else if (p.y > h + 8) p.y = -8;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 6) p.trail.shift();
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq > linkDistSq) continue;
          const alpha = (1 - Math.sqrt(distSq) / linkDist) * 0.14;
          ctx.strokeStyle = `rgba(201, 162, 39, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const cp of calls) {
        if (!cp.calling) continue;
        const rings = 3;
        for (let r = 0; r < rings; r++) {
          const phase = (cp.callAge * 0.55 + r * 0.33) % 1;
          const radius = phase * Math.min(w, h) * 0.18;
          const alpha = (1 - phase) * cp.strength * 0.22;
          ctx.strokeStyle = `rgba(230, 195, 74, ${alpha})`;
          ctx.lineWidth = 1.2 - r * 0.25;
          ctx.beginPath();
          ctx.arc(cp.x, cp.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        const core = cp.strength * (0.35 + 0.15 * Math.sin(cp.pulse * 3));
        const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, 28);
        grad.addColorStop(0, `rgba(255, 236, 170, ${core})`);
        grad.addColorStop(0.4, `rgba(230, 195, 74, ${core * 0.5})`);
        grad.addColorStop(1, "rgba(201, 162, 39, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const twinkle = 0.55 + 0.45 * Math.sin(p.phase + performance.now() * 0.0025);
        const base = mixColor(GOLD, CRIMSON, p.warmth * 0.65);
        const hot = mixColor(base, GOLD_PALE, twinkle * 0.4);
        const alpha = 0.35 + twinkle * 0.45;

        if (p.trail.length > 2) {
          ctx.strokeStyle = `rgba(${base.r}, ${base.g}, ${base.b}, ${alpha * 0.15})`;
          ctx.lineWidth = p.radius * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.stroke();
        }

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
        glow.addColorStop(0, `rgba(${hot.r}, ${hot.g}, ${hot.b}, ${alpha})`);
        glow.addColorStop(0.35, `rgba(${base.r}, ${base.g}, ${base.b}, ${alpha * 0.35})`);
        glow.addColorStop(1, `rgba(${base.r}, ${base.g}, ${base.b}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 248, 220, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const render = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const presence = useStore.getState().presence;
      const speed = PRESENCE_SPEED[presence];
      const callRate = PRESENCE_CALL_RATE[presence];
      tickCalls(dt, callRate);
      stepParticles(dt, speed);
      raf = requestAnimationFrame(render);
    };

    resize();
    requestAnimationFrame(() => {
      resize();
      raf = requestAnimationFrame(render);
    });

    const onResize = () => resize();
    const onVis = () => {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };
    const onLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}
