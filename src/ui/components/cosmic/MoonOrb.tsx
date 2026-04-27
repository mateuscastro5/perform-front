import { cn } from "@/ui/lib/utils";

interface MoonOrbProps {
  className?: string;
  size?: number;
  /** Floating animation toggle. */
  float?: boolean;
  /** Show orbital rings around the moon. */
  rings?: boolean;
  /** Color phase: lunar (silver/violet aurora) or eclipse (deeper indigo). */
  phase?: "lunar" | "eclipse" | "aurora";
}

/**
 * 3D-feeling moon with terminator shading, soft glow, and optional orbital rings.
 * Pure CSS — no images. Used as the centerpiece of the Login screen and as
 * decoration on Mission Control sections.
 */
export function MoonOrb({ className, size = 320, float = true, rings = true, phase = "lunar" }: MoonOrbProps) {
  const innerGradient =
    phase === "eclipse"
      ? "radial-gradient(circle at 32% 28%, hsl(258 60% 70%) 0%, hsl(258 50% 30%) 35%, hsl(232 40% 8%) 80%)"
      : phase === "aurora"
        ? "radial-gradient(circle at 32% 28%, hsl(196 92% 88%) 0%, hsl(258 80% 60%) 35%, hsl(280 60% 18%) 85%)"
        : "radial-gradient(circle at 35% 30%, hsl(220 22% 96%) 0%, hsl(220 14% 78%) 32%, hsl(232 22% 36%) 70%, hsl(232 38% 10%) 96%)";

  const haloColor =
    phase === "eclipse"
      ? "hsl(258 92% 70% / 0.35)"
      : phase === "aurora"
        ? "hsl(196 96% 64% / 0.45)"
        : "hsl(41 92% 70% / 0.30)";

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", float && "animate-artemis-float", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* outer halo glow */}
      <div
        className="absolute inset-[-25%] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${haloColor}, transparent 65%)` }}
      />

      {/* orbital rings */}
      {rings && (
        <>
          <div
            className="absolute rounded-full border border-white/10 animate-artemis-orbit"
            style={{ width: size * 1.55, height: size * 1.55, transform: "rotateX(74deg)" }}
          />
          <div
            className="absolute rounded-full border border-white/8"
            style={{ width: size * 1.3, height: size * 1.3, transform: "rotateX(74deg) rotateZ(28deg)" }}
          />
          {/* Tiny satellite */}
          <div
            className="absolute animate-artemis-orbit"
            style={{ width: size * 1.55, height: size * 1.55, transform: "rotateX(74deg)" }}
          >
            <div
              className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-aurora-cyan shadow-[0_0_18px_4px_hsl(196_96%_64%_/_0.7)]"
            />
          </div>
        </>
      )}

      {/* The moon itself */}
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: innerGradient,
          boxShadow:
            "inset -28px -28px 80px hsla(232,40%,4%,0.85), inset 18px 18px 60px hsla(220,40%,98%,0.18), 0 30px 80px -20px hsla(232,80%,2%,0.85)",
        }}
      >
        {/* Subtle craters */}
        <span
          className="absolute rounded-full"
          style={{
            top: "18%",
            left: "26%",
            width: size * 0.08,
            height: size * 0.08,
            background:
              "radial-gradient(circle, hsla(232,30%,12%,0.4), transparent 70%)",
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            top: "52%",
            left: "60%",
            width: size * 0.12,
            height: size * 0.12,
            background:
              "radial-gradient(circle, hsla(232,30%,12%,0.35), transparent 70%)",
          }}
        />
        <span
          className="absolute rounded-full"
          style={{
            top: "70%",
            left: "32%",
            width: size * 0.05,
            height: size * 0.05,
            background:
              "radial-gradient(circle, hsla(232,30%,12%,0.45), transparent 70%)",
          }}
        />
      </div>
    </div>
  );
}

export default MoonOrb;
