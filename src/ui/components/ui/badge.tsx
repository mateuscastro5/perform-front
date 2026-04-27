import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/ui/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/35 bg-primary/15 text-primary-foreground/90 [color:hsl(var(--primary))]",
        secondary:
          "border-border/60 bg-muted/50 text-muted-foreground hover:bg-muted/70",
        destructive:
          "border-destructive/35 bg-destructive/15 text-destructive",
        outline: "text-foreground border-border/60 bg-transparent",
        success:
          "border-success/35 bg-success/15 text-success",
        warning:
          "border-warning/40 bg-warning/15 text-warning",
        cosmic:
          "border-secondary/35 bg-secondary/15 text-secondary",
        aurora:
          "border-transparent bg-aurora-gradient text-primary-foreground shadow-[0_4px_18px_-6px_hsl(258_92%_70%/0.55)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
