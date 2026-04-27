import { cn } from "@/ui/lib/utils";

interface AuroraProps {
  className?: string;
  /** Color emphasis. */
  variant?: "default" | "violet" | "iris" | "rose";
  intensity?: "soft" | "medium" | "intense";
}

/**
 * Slowly drifting gradient orbs that paint the deep-space backdrop. Pure CSS,
 * GPU-friendly. Stays inside the brand palette (violet → iris → rose).
 */
export function Aurora({ className, variant = "default", intensity = "medium" }: AuroraProps) {
  const orbA =
    variant === "iris"
      ? "hsl(232 78% 64% / "
      : variant === "rose"
        ? "hsl(320 76% 70% / "
        : "hsl(262 88% 68% / ";
  const orbB = variant === "iris" ? "hsl(262 88% 68% / " : "hsl(232 78% 64% / ";
  const orbC = "hsl(320 76% 70% / ";

  const opacityA = intensity === "soft" ? "0.10)" : intensity === "intense" ? "0.32)" : "0.18)";
  const opacityB = intensity === "soft" ? "0.08)" : intensity === "intense" ? "0.26)" : "0.14)";
  const opacityC = intensity === "soft" ? "0.06)" : intensity === "intense" ? "0.20)" : "0.10)";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute -top-[30%] -left-[15%] h-[70vh] w-[70vh] rounded-full blur-3xl animate-artemis-drift"
        style={{ background: `radial-gradient(circle, ${orbA}${opacityA}, transparent 70%)` }}
      />
      <div
        className="absolute top-[15%] -right-[15%] h-[75vh] w-[75vh] rounded-full blur-3xl animate-artemis-drift"
        style={{
          background: `radial-gradient(circle, ${orbB}${opacityB}, transparent 70%)`,
          animationDelay: "-6s",
        }}
      />
      <div
        className="absolute -bottom-[25%] left-[25%] h-[60vh] w-[60vh] rounded-full blur-3xl animate-artemis-drift"
        style={{
          background: `radial-gradient(circle, ${orbC}${opacityC}, transparent 70%)`,
          animationDelay: "-12s",
        }}
      />
    </div>
  );
}

export default Aurora;
