import * as React from "react";
import { cn } from "@/ui/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "elevated";
  glow?: "none" | "aurora" | "comet" | "lunar";
  asChild?: boolean;
}

/**
 * Translucent panel used as the base for nearly every surface in Artemis.
 * Layered: background blur + subtle inner highlight + hairline border.
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, variant = "default", glow = "none", children, ...rest }, ref) => {
    const base = "relative rounded-2xl";

    const variantClass = {
      default:
        "border border-border/55 bg-card/40 backdrop-blur-2xl shadow-orbit",
      soft: "border border-border/40 bg-card/25 backdrop-blur-xl",
      elevated:
        "border border-border/60 bg-gradient-to-b from-card/70 to-card/30 backdrop-blur-2xl shadow-orbit",
    }[variant];

    const glowClass = {
      none: "",
      aurora: "shadow-[0_0_60px_-10px_hsl(258_92%_70%/0.35)]",
      comet: "shadow-[0_0_60px_-10px_hsl(196_96%_64%/0.35)]",
      lunar: "shadow-[0_0_80px_-10px_hsl(41_92%_64%/0.25)]",
    }[glow];

    return (
      <div ref={ref} className={cn(base, variantClass, glowClass, className)} {...rest}>
        {/* Top inner highlight to suggest curved glass */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
        {children}
      </div>
    );
  },
);

GlassPanel.displayName = "GlassPanel";

export default GlassPanel;
