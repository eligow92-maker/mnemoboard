import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "border border-border bg-surface text-text-primary hover:bg-background",
  ghost: "text-text-primary hover:bg-background",
  danger: "bg-error text-white hover:opacity-90",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

// Każdy przycisk ma co najmniej 44 px wysokości (cel dotykowy).
export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-4 font-medium disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
