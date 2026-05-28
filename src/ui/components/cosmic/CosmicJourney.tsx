import { useEffect, useRef, type RefObject } from "react";
import { useReducedMotion, useScroll } from "framer-motion";

interface CosmicJourneyProps {
  /** Element whose scroll progress drives the animation (usually the page wrapper). */
  targetRef: RefObject<HTMLElement | null>;
  className?: string;
}

interface Star {
  x: number;          // 0..1 (relative)
  y: number;          // 0..1
  r: number;          // base radius
  hue: number;
  twinkle: number;    // 0..1 starting phase
  drift: number;      // px/s horizontal
  depth: number;      // 0 (slow/distant) .. 1 (fast/near)
}

interface Edge {
  a: number;
  b: number;
  /** Scroll progress at which the line starts fading in (0..1). */
  appearAt: number;
  /** Length in progress over which the line goes from 0 → 1 alpha. */
  fadeDuration: number;
  maxAlpha: number;
}

interface Comet {
  /** Scroll progress at which the comet begins crossing the screen. */
  triggerAt: number;
  /** How long (in progress units) the comet stays visible. */
  duration: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  hue: number;
}

const COMETS: Comet[] = [
  { triggerAt: 0.16, duration: 0.08, startX: -0.05, startY: 0.15, endX: 0.42, endY: 0.7, hue: 262 },
  { triggerAt: 0.42, duration: 0.09, startX: 1.05, startY: 0.18, endX: 0.55, endY: 0.78, hue: 320 },
  { triggerAt: 0.72, duration: 0.1, startX: -0.05, startY: 0.4, endX: 0.65, endY: 0.85, hue: 232 },
];

/**
 * Full-page canvas backdrop that turns the long-scroll method article into
 * an actual journey. Stars are seeded once and rendered in three depth
 * layers (slow, mid, near) so scrolling produces real parallax. Pairs of
 * nearby stars form constellations whose connecting lines fade in as the
 * reader passes specific scroll milestones — by the bottom of the page
 * every constellation is fully drawn. Three comets streak across at
 * preset scroll positions to mark major transitions.
 *
 * Respects prefers-reduced-motion: in that case stars are seeded once,
 * drawn statically, and scroll-linked progress is replaced by a fixed
 * 60% so constellations stay legible without movement.
 */
export function CosmicJourney({ targetRef, className }: CosmicJourneyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });
  const progressRef = useRef(prefersReduced ? 0.6 : 0);

  useEffect(() => {
    if (prefersReduced) {
      progressRef.current = 0.6;
      return;
    }
    const unsubscribe = scrollYProgress.on("change", (v) => {
      progressRef.current = v;
    });
    return () => unsubscribe();
  }, [scrollYProgress, prefersReduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let edges: Edge[] = [];

    const seed = () => {
      // Density: ~1 star every 14k px². Three depth bands.
      const area = width * height;
      const count = Math.max(40, Math.round(area / 14000));
      stars = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random(),
          y: Math.random(),
          r: 0.3 + depth * 1.4,
          hue: Math.random() < 0.1 ? 262 : Math.random() < 0.18 ? 320 : 220,
          twinkle: Math.random() * Math.PI * 2,
          drift: (Math.random() - 0.5) * 0.015,
          depth,
        };
      });

      // Connect nearby stars to form constellations. Threshold is the
      // distance below which two stars become candidates. Cap each star's
      // outgoing edges so a single hub doesn't fan out into a cobweb.
      const maxConn = 2;
      const outgoing = new Array<number>(stars.length).fill(0);
      const threshold = 0.085;
      const candidates: Edge[] = [];
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          if (outgoing[i] >= maxConn || outgoing[j] >= maxConn) continue;
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.hypot(dx, dy);
          if (d >= threshold) continue;
          // Closer pairs are stronger candidates and brighter once drawn.
          const strength = 1 - d / threshold;
          if (Math.random() > strength * 0.55) continue;
          candidates.push({
            a: i,
            b: j,
            appearAt: Math.random() * 0.9,
            fadeDuration: 0.08 + Math.random() * 0.12,
            maxAlpha: 0.18 + strength * 0.22,
          });
          outgoing[i]++;
          outgoing[j]++;
        }
      }
      edges = candidates;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stars.length === 0) seed();
    };

    let raf = 0;
    let lastT = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(now - lastT, 80);
      lastT = now;
      const progress = progressRef.current;

      ctx.clearRect(0, 0, width, height);

      // Parallax: distant stars sink slowly, near stars sink faster. The
      // visual effect is "moving downward" through the field.
      const baseShiftY = progress * height * 0.45;

      // Constellation edges first so stars sit on top.
      ctx.lineCap = "round";
      for (const e of edges) {
        const t = (progress - e.appearAt) / e.fadeDuration;
        if (t <= 0) continue;
        const k = t >= 1 ? 1 : t;
        const a = stars[e.a];
        const b = stars[e.b];
        const ax = a.x * width;
        const ay = a.y * height - baseShiftY * (0.25 + a.depth * 0.6);
        const bx = b.x * width;
        const by = b.y * height - baseShiftY * (0.25 + b.depth * 0.6);

        const grad = ctx.createLinearGradient(ax, ay, bx, by);
        grad.addColorStop(0, `hsla(262, 92%, 75%, ${e.maxAlpha * k})`);
        grad.addColorStop(1, `hsla(320, 92%, 75%, ${e.maxAlpha * k * 0.7})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // Stars with twinkle + parallax drift.
      for (const s of stars) {
        if (!prefersReduced) {
          s.twinkle += (dt / 1000) * (0.6 + s.depth * 1.4);
          s.x += s.drift * (dt / 1000);
          if (s.x < -0.02) s.x = 1.02;
          if (s.x > 1.02) s.x = -0.02;
        }
        const tw = prefersReduced ? 0.85 : 0.55 + Math.sin(s.twinkle) * 0.45;
        const sx = s.x * width;
        const sy = s.y * height - baseShiftY * (0.25 + s.depth * 0.6);
        // Wrap vertically so the field never empties as you scroll.
        const yy = ((sy % height) + height) % height;

        const halo = ctx.createRadialGradient(sx, yy, 0, sx, yy, s.r * 5);
        halo.addColorStop(0, `hsla(${s.hue}, 90%, 80%, ${0.55 * tw})`);
        halo.addColorStop(1, `hsla(${s.hue}, 90%, 80%, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(sx, yy, s.r * 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${s.hue}, 95%, 92%, ${Math.min(tw * 0.95, 1)})`;
        ctx.beginPath();
        ctx.arc(sx, yy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Comets — at most one or two visible at a time. They draw a tapered
      // tail by sampling a few positions back along the trajectory.
      for (const c of COMETS) {
        const t = (progress - c.triggerAt) / c.duration;
        if (t <= 0 || t >= 1) continue;
        const ease = t * (2 - t); // ease-out quad
        const headX = (c.startX + (c.endX - c.startX) * ease) * width;
        const headY = (c.startY + (c.endY - c.startY) * ease) * height;
        const dx = (c.endX - c.startX) * width;
        const dy = (c.endY - c.startY) * height;
        const len = Math.hypot(dx, dy);
        const nx = dx / len;
        const ny = dy / len;

        const tailLen = 120;
        const tailX = headX - nx * tailLen;
        const tailY = headY - ny * tailLen;

        const fade = Math.sin(Math.PI * t); // fade in then out
        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
        grad.addColorStop(0, `hsla(${c.hue}, 95%, 75%, 0)`);
        grad.addColorStop(1, `hsla(${c.hue}, 95%, 85%, ${0.65 * fade})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(headX, headY);
        ctx.stroke();

        // Head bloom
        const headGrad = ctx.createRadialGradient(headX, headY, 0, headX, headY, 18);
        headGrad.addColorStop(0, `hsla(${c.hue}, 100%, 92%, ${0.9 * fade})`);
        headGrad.addColorStop(1, `hsla(${c.hue}, 100%, 80%, 0)`);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(headX, headY, 18, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [prefersReduced]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

export default CosmicJourney;
