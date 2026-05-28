import { motion } from "framer-motion";

interface JourneyMilestoneProps {
  /** Variant decides the silhouette: small orbit, ringed planet, twin star, nebula. */
  variant?: "orbit" | "ringed" | "binary" | "nebula";
  /** Roll-in side. */
  side?: "left" | "right";
  className?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Decorative SVG ornament inserted between article sections to reinforce
 * the "scroll = journey" feeling. Each variant is a different celestial
 * object; pick the one whose meaning fits the surrounding section
 * (orbit for philosophy/method, ringed for data, binary for team
 * health, nebula for AI). Reveal-on-scroll: slides in from the chosen
 * side as it enters the viewport, then stays.
 */
export function JourneyMilestone({
  variant = "orbit",
  side = "right",
  className,
}: JourneyMilestoneProps) {
  const xInit = side === "left" ? -32 : 32;
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, x: xInit }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 1, ease: EASE }}
      className={className}
    >
      <svg
        viewBox="0 0 240 240"
        width="240"
        height="240"
        className="select-none"
      >
        <defs>
          <radialGradient id="jm-planet" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="hsl(258 92% 78%)" />
            <stop offset="60%" stopColor="hsl(258 70% 45%)" />
            <stop offset="100%" stopColor="hsl(232 60% 18%)" />
          </radialGradient>
          <radialGradient id="jm-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(262 95% 75%)" stopOpacity="0.45" />
            <stop offset="70%" stopColor="hsl(262 95% 65%)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="jm-nebula" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(320 90% 75%)" stopOpacity="0.55" />
            <stop offset="40%" stopColor="hsl(262 88% 68%)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(232 78% 60%)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="jm-ring" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(262 95% 80%)" stopOpacity="0.1" />
            <stop offset="50%" stopColor="hsl(262 95% 85%)" stopOpacity="0.65" />
            <stop offset="100%" stopColor="hsl(320 95% 80%)" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Soft halo behind every variant */}
        <circle cx="120" cy="120" r="110" fill="url(#jm-glow)" />

        {variant === "orbit" && (
          <>
            <ellipse
              cx="120"
              cy="120"
              rx="92"
              ry="34"
              fill="none"
              stroke="url(#jm-ring)"
              strokeWidth="0.9"
              transform="rotate(-22 120 120)"
            />
            <ellipse
              cx="120"
              cy="120"
              rx="62"
              ry="22"
              fill="none"
              stroke="hsl(232 78% 78% / 0.35)"
              strokeWidth="0.6"
              transform="rotate(28 120 120)"
            />
            <circle cx="120" cy="120" r="22" fill="url(#jm-planet)" />
            <motion.circle
              cx="212"
              cy="120"
              r="3.5"
              fill="hsl(258 95% 90%)"
              animate={{ rotate: 360 }}
              transition={{ duration: 24, ease: "linear", repeat: Infinity }}
              style={{ transformOrigin: "120px 120px" }}
            />
          </>
        )}

        {variant === "ringed" && (
          <>
            <circle cx="120" cy="120" r="36" fill="url(#jm-planet)" />
            <ellipse
              cx="120"
              cy="120"
              rx="86"
              ry="14"
              fill="none"
              stroke="url(#jm-ring)"
              strokeWidth="1.2"
              transform="rotate(-12 120 120)"
            />
            <ellipse
              cx="120"
              cy="120"
              rx="72"
              ry="11"
              fill="none"
              stroke="hsl(320 88% 80% / 0.4)"
              strokeWidth="0.6"
              transform="rotate(-12 120 120)"
            />
          </>
        )}

        {variant === "binary" && (
          <>
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 38, ease: "linear", repeat: Infinity }}
              style={{ transformOrigin: "120px 120px" }}
            >
              <circle cx="78" cy="120" r="18" fill="url(#jm-planet)" />
              <circle cx="162" cy="120" r="14" fill="hsl(320 80% 70%)" opacity="0.85" />
              <line
                x1="78"
                y1="120"
                x2="162"
                y2="120"
                stroke="hsl(320 95% 80% / 0.18)"
                strokeWidth="0.6"
                strokeDasharray="3 4"
              />
            </motion.g>
            <circle cx="120" cy="120" r="2.5" fill="hsl(258 95% 92%)" />
          </>
        )}

        {variant === "nebula" && (
          <>
            <circle cx="120" cy="120" r="96" fill="url(#jm-nebula)" />
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 80, ease: "linear", repeat: Infinity }}
              style={{ transformOrigin: "120px 120px" }}
            >
              {Array.from({ length: 14 }).map((_, i) => {
                const a = (i / 14) * Math.PI * 2;
                const rad = 60 + (i % 3) * 8;
                const x = 120 + Math.cos(a) * rad;
                const y = 120 + Math.sin(a) * rad;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={0.8 + (i % 3) * 0.4}
                    fill="hsl(258 95% 92%)"
                    opacity={0.5 + (i % 3) * 0.15}
                  />
                );
              })}
            </motion.g>
            <circle cx="120" cy="120" r="6" fill="hsl(258 95% 92%)" />
          </>
        )}
      </svg>
    </motion.div>
  );
}

export default JourneyMilestone;
