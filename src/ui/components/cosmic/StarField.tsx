import { useEffect, useRef } from "react";

interface StarFieldProps {
  className?: string;
  density?: number;
  speed?: number;
  /** Disable parallax movement for low-power scenarios */
  staticField?: boolean;
}

/**
 * Animated canvas-based starfield. Stars twinkle and slowly drift, giving the
 * impression of a deep-space backdrop. Renders at devicePixelRatio for crisp
 * points and respects prefers-reduced-motion.
 */
export function StarField({ className, density = 1, speed = 1, staticField }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let stars: Array<{
      x: number;
      y: number;
      r: number;
      o: number;
      phase: number;
      speed: number;
      drift: number;
      hue: number;
    }> = [];

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isStatic = staticField || reduce;

    const seed = () => {
      const area = width * height;
      const baseCount = Math.round((area / 9000) * density);
      stars = Array.from({ length: baseCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.4 + 0.2,
        o: Math.random() * 0.8 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.6,
        drift: (Math.random() - 0.5) * 0.04,
        hue: Math.random() < 0.12 ? 258 : Math.random() < 0.18 ? 196 : 220,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    let raf = 0;
    let t0 = performance.now();

    const draw = (now: number) => {
      const dt = Math.min(now - t0, 80);
      t0 = now;
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        if (!isStatic) {
          s.phase += (dt / 1000) * s.speed * speed;
          s.x += s.drift * speed;
          if (s.x < -2) s.x = width + 2;
          if (s.x > width + 2) s.x = -2;
        }
        const tw = isStatic ? 1 : 0.55 + Math.sin(s.phase) * 0.45;
        const a = s.o * tw;
        const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        grad.addColorStop(0, `hsla(${s.hue}, 90%, 80%, ${a})`);
        grad.addColorStop(1, "hsla(220, 30%, 90%, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 3.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${s.hue}, 95%, 92%, ${Math.min(a * 1.2, 1)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    if (!isStatic) raf = requestAnimationFrame(draw);
    else draw(performance.now());

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [density, speed, staticField]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

export default StarField;
