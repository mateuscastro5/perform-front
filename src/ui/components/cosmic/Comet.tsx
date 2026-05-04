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
            "linear-gradient(90deg, transparent, hsl(232 80% 80% / 0.7), hsl(262 90% 80% / 0.85) 70%, hsl(0 0% 100%) 100%)",
          filter: "drop-shadow(0 0 10px hsl(262 88% 78% / 0.6)) drop-shadow(0 0 4px hsl(232 78% 70% / 0.5))",
        }}
      />
      <span
        className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white"
        style={{ boxShadow: "0 0 12px 4px hsl(262 90% 80% / 0.85), 0 0 28px 8px hsl(232 78% 64% / 0.55)" }}
      />
    </span>
  );
}

export default Comet;
