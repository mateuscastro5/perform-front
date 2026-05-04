import { cn } from "@/ui/lib/utils";

interface MoonOrbProps {
  className?: string;
  size?: number;
  /** Soft floating animation. */
  float?: boolean;
  /** Decorative orbital rings around the planet. */
  rings?: boolean;
  /**
   * Color palette of the orb. Stays inside the brand (violet → iris → rose),
   * so swapping variants never breaks the page's tonal harmony.
   */
  variant?: "violet" | "iris" | "rose" | "twilight";
  /** Decorative opacity wrapper — always keep low so the orb sits behind UI. */
  opacity?: number;
}

/**
 * A large, soft gradient sphere — the kind of "planet" you find on Comet,
 * Perplexity or Vercel landing pages. It is *purely decorative*: huge atmospheric
 * halo, layered radial gradients for depth, an inner highlight ring, and an
 * almost-imperceptible terminator. No craters. No literal moon iconography.
 *
 * Pair it with low opacity (0.4–0.7) and place it behind glass surfaces so it
 * shines through without competing with content.
 */
export function MoonOrb({
  className,
  size = 360,
  float = true,
  rings = false,
  variant = "violet",
  opacity = 0.85,
}: MoonOrbProps) {
  const palette = {
    violet: {
      core: "hsl(262 92% 88%)",
      mid: "hsl(262 80% 55%)",
      deep: "hsl(258 70% 18%)",
      atmosphere: "hsl(262 88% 68% / 0.55)",
      ring: "hsl(262 88% 68% / 0.25)",
    },
    iris: {
      core: "hsl(232 92% 90%)",
      mid: "hsl(232 78% 56%)",
      deep: "hsl(232 60% 14%)",
      atmosphere: "hsl(232 78% 64% / 0.55)",
      ring: "hsl(232 78% 64% / 0.25)",
    },
    rose: {
      core: "hsl(320 92% 92%)",
      mid: "hsl(320 76% 60%)",
      deep: "hsl(320 50% 16%)",
      atmosphere: "hsl(320 76% 70% / 0.5)",
      ring: "hsl(320 76% 70% / 0.25)",
    },
    twilight: {
      // multi-tone — emulates Perplexity / Comet hero orb
      core: "hsl(220 30% 96%)",
      mid: "hsl(262 70% 56%)",
      deep: "hsl(232 60% 12%)",
      atmosphere: "hsl(262 88% 68% / 0.45)",
      ring: "hsl(232 78% 64% / 0.22)",
    },
  }[variant];

  const sphereGradient = `
    radial-gradient(
      circle at 32% 28%,
      ${palette.core} 0%,
      ${palette.mid} 38%,
      ${palette.deep} 82%,
      hsl(232 50% 6%) 100%
    )
  `;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        float && "animate-artemis-float",
        className,
      )}
      style={{ width: size, height: size, opacity }}
      aria-hidden
    >
      {/* Outer atmospheric halo (largest, softest) */}
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          width: size * 1.7,
          height: size * 1.7,
          background: `radial-gradient(circle, ${palette.atmosphere}, transparent 65%)`,
        }}
      />

      {/* Mid halo for color depth */}
      <div
        className="absolute rounded-full blur-2xl"
        style={{
          width: size * 1.25,
          height: size * 1.25,
          background: `radial-gradient(circle, ${palette.atmosphere}, transparent 60%)`,
          opacity: 0.7,
        }}
      />

      {/* Optional orbital rings */}
      {rings && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: size * 1.45,
              height: size * 1.45,
              border: `1px solid ${palette.ring}`,
              transform: "rotateX(72deg) rotateZ(-12deg)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: size * 1.18,
              height: size * 1.18,
              border: `1px solid ${palette.ring}`,
              transform: "rotateX(72deg) rotateZ(18deg)",
              opacity: 0.6,
            }}
          />
        </>
      )}

      {/* The sphere itself */}
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          background: sphereGradient,
          boxShadow: `
            inset -${Math.round(size * 0.12)}px -${Math.round(size * 0.12)}px ${Math.round(size * 0.32)}px hsla(232,60%,2%,0.7),
            inset ${Math.round(size * 0.06)}px ${Math.round(size * 0.06)}px ${Math.round(size * 0.22)}px hsla(0,0%,100%,0.08),
            0 ${Math.round(size * 0.18)}px ${Math.round(size * 0.42)}px -${Math.round(size * 0.1)}px hsla(232,70%,2%,0.7)
          `,
        }}
      >
        {/* Inner highlight crescent — a subtle aurora arc */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 28% 22%, hsla(0,0%,100%,0.18), transparent 30%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Ultra-subtle inner ring near the limb (atmosphere edge) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow: `inset 0 0 ${Math.round(size * 0.06)}px hsla(0,0%,100%,0.06)`,
          }}
        />
      </div>
    </div>
  );
}

export default MoonOrb;
