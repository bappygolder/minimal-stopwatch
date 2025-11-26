import * as React from "react";
import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-chrono-border-subtle bg-chrono-bg-card/70 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
