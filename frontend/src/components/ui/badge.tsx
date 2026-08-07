import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-neutral-700",
        className,
      )}
      {...props}
    />
  );
}