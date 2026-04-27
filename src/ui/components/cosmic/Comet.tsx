import { cn } from "@/ui/lib/utils";

interface CometProps {
  className?: string;
  /** Animation duration in seconds. */
  duration?: number;
  /** 0 = top-left, 1 = bottom-right. */
  angle?: number;
  /** Top offset in % to vary height. */
  top?: string;
  delay?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * A comet streak that travels diagonally across its container. The trail uses
 * the aurora gradient with a bright head. Use 1–3 of these per scene to keep
 * motion subtle.
 */
export function Comet({
  className,
  duration = 9,
  angle = 18,
  top = "20%",
  delay = "0s",
  size = "md",
}: CometProps) {
  const sizes = {
    sm: { w: 140, h: 1.2 },
    md: { w: 220, h: 1.6 },
    lg: { w: 340, h: 2.2 },
  } as const;
  const { w, h } = sizes[size];

  return (
    <span
      className={cn("pointer-events-none absolute left-0 animate-artemis-comet", className)}
      aria-hidden
      style={{
        top,
        width: w,
        height: h,
        transform: `rotate(${angle}deg)`,
        animationDuration: `${duration}s`,
        animationDelay: delay,
      }}
    >
      <span
        className="block h-full w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(196 96% 78% / 0.85), hsl(258 92% 78% / 0.7) 70%, hsl(0 0% 100%) 100%)",
          filter: "drop-shadow(0 0 10px hsl(258 92% 75% / 0.7)) drop-shadow(0 0 4px hsl(196 96% 70% / 0.6))",
        }}
      />
      <span
        className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white"
        style={{ boxShadow: "0 0 12px 4px hsl(196 96% 75% / 0.9), 0 0 28px 8px hsl(258 92% 70% / 0.65)" }}
      />
    </span>
  );
}

export default Comet;
