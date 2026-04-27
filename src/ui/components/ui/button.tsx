import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/ui/lib/utils";

/**
 * Artemis Button.
 * - default: aurora gradient pill, soft glow.
 * - primary: same as default but flatter for inline forms.
 * - secondary: glass surface w/ hairline border (lunar steel).
 * - ghost: transparent until hover, used inside dense panels.
 * - outline: hairline ring, used for tabular CTAs.
 * - cosmic: comet-cyan emphasis for secondary mission actions.
 */
const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-aurora-gradient text-primary-foreground shadow-[0_8px_30px_-8px_hsl(258_92%_70%/0.6)] hover:shadow-[0_12px_45px_-8px_hsl(258_92%_70%/0.8)] hover:-translate-y-[1px]",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_6px_22px_-8px_hsl(258_92%_70%/0.5)]",
        secondary:
          "border border-border/60 bg-card/40 text-foreground backdrop-blur-md hover:bg-card/70 hover:border-border",
        cosmic:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_6px_22px_-8px_hsl(196_96%_64%/0.6)]",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive shadow-[0_6px_22px_-8px_hsl(358_86%_64%/0.5)]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted/40 hover:border-border/80",
        ghost: "rounded-xl text-foreground hover:bg-muted/40",
        link: "rounded-md text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-12 px-7 text-[15px]",
        xl: "h-14 px-9 text-base",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const showShine = variant === "default" || variant === "cosmic" || variant === "primary";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {showShine && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-[120%] bg-[linear-gradient(120deg,transparent_30%,hsl(0_0%_100%/0.28)_50%,transparent_70%)] transition-transform duration-700 ease-out group-hover:translate-x-[120%]"
          />
        )}
        <span className="relative inline-flex items-center justify-center gap-2">{children}</span>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
