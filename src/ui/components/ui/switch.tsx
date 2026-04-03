import * as React from "react";

import { cn } from "@/ui/lib/utils";

type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onChange, disabled, ...props }, ref) => (
    <label
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-input",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </label>
  ),
);

Switch.displayName = "Switch";

export { Switch };
