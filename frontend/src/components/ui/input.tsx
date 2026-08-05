import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-2xl border border-black/12 bg-white px-4 text-sm text-black shadow-sm outline-none transition-all placeholder:text-neutral-400 focus:border-black/30 focus:ring-2 focus:ring-black/10",
        className,
      )}
      {...props}
    />
  );
}