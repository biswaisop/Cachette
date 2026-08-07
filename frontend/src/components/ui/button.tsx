import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-black text-white hover:bg-neutral-800",
  secondary: "bg-neutral-100 text-black hover:bg-neutral-200",
  outline: "border border-black/15 bg-transparent text-black hover:bg-black/5",
  ghost: "text-black hover:bg-black/5",
};

const sizeStyles = {
  sm: "h-9 px-4",
  md: "h-11 px-5",
  lg: "h-12 px-6",
};

export function Button({
  className,
  variant = "default",
  size = "md",
  asChild,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <span className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}>
        {props.children}
      </span>
    );
  }

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    />
  );
}