import { forwardRef } from "react";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

const variantStyles = {
  primary:
    "bg-primary-500 text-white shadow-sm hover:bg-primary-500/90 focus-visible:ring-accent-500",
  secondary:
    "border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] focus-visible:ring-accent-500",
  ghost:
    "bg-transparent text-[var(--app-text-muted)] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-text)] focus-visible:ring-accent-500",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400",
};

const sizeStyles = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

const Button = forwardRef(function Button(
  { className = "", variant = "primary", size = "md", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60",
        variantStyles[variant] ?? variantStyles.primary,
        sizeStyles[size] ?? sizeStyles.md,
        className,
      )}
      {...props}
    />
  );
});

export default Button;
