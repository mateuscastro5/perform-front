import { cn } from "@/ui/lib/utils";
import logoFull from "@/ui/assets/ArtemisLogoFull.png";
import logoSymbol from "@/ui/assets/ArtemisSymbol.png";

interface ArtemisLogoProps {
  className?: string;
  /** Show the full wordmark logo; false = symbol only */
  withWordmark?: boolean;
  size?: number;
  /** Optional tagline below (only shown when withWordmark=true) */
  tagline?: string;
}

/**
 * Artemis logo — renders the brand PNG asset.
 * Uses `invert` + `mix-blend-screen` so the black-on-white PNG
 * appears as a white mark on any dark surface.
 */
export function ArtemisLogo({
  className,
  withWordmark = true,
  size = 36,
  tagline,
}: ArtemisLogoProps) {
  if (withWordmark) {
    // Full logo: PNG has ~35% padding top+bottom, so multiply to get the
    // mark itself at roughly `size` px tall.
    const imgHeight = Math.round(size * 2.2);
    return (
      <div className={cn("inline-flex flex-col", className)}>
        <img
          src={logoFull}
          alt="Artemis"
          style={{ height: imgHeight, width: "auto" }}
          className="invert mix-blend-screen select-none"
          draggable={false}
        />
        {tagline && (
          <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground">
            {tagline}
          </span>
        )}
      </div>
    );
  }

  // Symbol only
  return (
    <img
      src={logoSymbol}
      alt="Artemis"
      width={size}
      height={size}
      className={cn("invert mix-blend-screen select-none shrink-0", className)}
      draggable={false}
    />
  );
}

export default ArtemisLogo;
