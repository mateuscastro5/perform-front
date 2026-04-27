import { cn } from "@/ui/lib/utils";

interface ArtemisLogoProps {
  className?: string;
  /** Show the wordmark next to the symbol. */
  withWordmark?: boolean;
  size?: number;
  /** Optional mission label below the wordmark. */
  tagline?: string;
}

/**
 * The Artemis mark — a crescent-cradled "A" inside an orbital ring.
 * Pure SVG so it scales crisp at any size and inherits currentColor where useful.
 */
export function ArtemisLogo({
  className,
  withWordmark = true,
  size = 36,
  tagline,
}: ArtemisLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="shrink-0"
        aria-hidden
      >
        <defs>
          <linearGradient id="artemis-aurora" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(262 88% 70%)" />
            <stop offset="50%" stopColor="hsl(232 78% 64%)" />
            <stop offset="100%" stopColor="hsl(320 76% 70%)" />
          </linearGradient>
          <linearGradient id="artemis-moon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(220 22% 96%)" />
            <stop offset="100%" stopColor="hsl(262 28% 60%)" />
          </linearGradient>
          <radialGradient id="artemis-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(262 88% 68% / 0.55)" />
            <stop offset="70%" stopColor="hsl(262 88% 68% / 0)" />
          </radialGradient>
        </defs>

        {/* Glow halo */}
        <circle cx="32" cy="32" r="30" fill="url(#artemis-glow)" />

        {/* Orbital ring (tilted ellipse) */}
        <ellipse
          cx="32"
          cy="32"
          rx="28"
          ry="11"
          fill="none"
          stroke="url(#artemis-aurora)"
          strokeWidth="1.4"
          opacity="0.85"
          transform="rotate(-22 32 32)"
        />

        {/* Crescent moon backing */}
        <path
          d="M44 32a14 14 0 1 1-9.5-13.3 11 11 0 0 0 9.5 13.3z"
          fill="url(#artemis-moon)"
          opacity="0.95"
        />

        {/* The A — strokes */}
        <path
          d="M22 44 L32 18 L42 44"
          stroke="hsl(232 36% 5%)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M26 36 L38 36"
          stroke="hsl(232 36% 5%)"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Satellite dot on the orbital ring */}
        <circle cx="56" cy="20.5" r="2.2" fill="hsl(232 92% 84%)" />
        <circle cx="56" cy="20.5" r="4" fill="hsl(232 78% 64% / 0.4)" />
      </svg>

      {withWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-[18px] font-semibold tracking-[-0.01em] text-foreground">
            Artemis
          </span>
          {tagline && (
            <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground">
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default ArtemisLogo;
