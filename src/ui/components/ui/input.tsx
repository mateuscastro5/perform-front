import * as React from "react";

import { cn } from "@/ui/lib/utils";

/**
 * Artemis Input — translucent glass surface, hairline border that turns
 * aurora-violet on focus, with a soft inner glow.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border/55 bg-card/35 px-4 py-2 text-sm text-foreground backdrop-blur-md ring-offset-background transition-all duration-300",
          "placeholder:text-muted-foreground/70",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "hover:bg-card/55 hover:border-border/80",
          "focus-visible:outline-none focus-visible:border-primary/70 focus-visible:bg-card/55 focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:shadow-[0_0_0_3px_hsl(258_92%_70%/0.12),0_0_22px_-2px_hsl(258_92%_70%/0.45)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
