import { cn } from "@/ui/lib/utils";

interface AuroraProps {
  className?: string;
  /** Aurora color emphasis. */
  variant?: "default" | "violet" | "cyan" | "gold";
  intensity?: "soft" | "medium" | "intense";
}

/**
 * Slowly drifting gradient orbs that paint the deep-space backdrop with
 * mission-control aurora light. Pure CSS, GPU friendly.
 */
export function Aurora({ className, variant = "default", intensity = "medium" }: AuroraProps) {
  const orbA =
    variant === "cyan"
      ? "hsl(196 96% 64% / "
      : variant === "gold"
        ? "hsl(41 92% 64% / "
        : "hsl(258 92% 70% / ";
  const orbB = variant === "cyan" ? "hsl(258 92% 70% / " : "hsl(196 96% 64% / ";
  const orbC = "hsl(330 90% 70% / ";

  const opacityA = intensity === "soft" ? "0.18)" : intensity === "intense" ? "0.55)" : "0.32)";
  const opacityB = intensity === "soft" ? "0.14)" : intensity === "intense" ? "0.42)" : "0.26)";
  const opacityC = intensity === "soft" ? "0.10)" : intensity === "intense" ? "0.32)" : "0.18)";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute -top-[25%] -left-[10%] h-[55vh] w-[55vh] rounded-full blur-3xl animate-artemis-drift"
        style={{ background: `radial-gradient(circle, ${orbA}${opacityA}, transparent 70%)` }}
      />
      <div
        className="absolute top-[20%] -right-[12%] h-[60vh] w-[60vh] rounded-full blur-3xl animate-artemis-drift"
        style={{
          background: `radial-gradient(circle, ${orbB}${opacityB}, transparent 70%)`,
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute -bottom-[20%] left-[20%] h-[50vh] w-[50vh] rounded-full blur-3xl animate-artemis-drift"
        style={{
          background: `radial-gradient(circle, ${orbC}${opacityC}, transparent 70%)`,
          animationDelay: "-12s",
        }}
      />
    </div>
  );
}

export default Aurora;
