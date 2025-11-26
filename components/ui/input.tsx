import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-chrono-border-subtle bg-transparent px-3 py-1 text-sm text-chrono-fg-primary placeholder:text-chrono-fg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chrono-accent",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
