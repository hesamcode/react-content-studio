import { forwardRef } from "react";

function cn(...values) {
  return values.filter(Boolean).join(" ");
}

const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 text-sm text-[var(--app-text)] placeholder:text-[var(--app-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        className,
      )}
      {...props}
    />
  );
});

export default Input;
