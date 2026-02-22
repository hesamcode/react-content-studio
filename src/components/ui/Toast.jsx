import Button from "./Button";

function toastStyles(type) {
  if (type === "error") {
    return "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/60 dark:text-rose-100";
  }

  return "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-100";
}

export default function Toast({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-[min(92vw,360px)] flex-col gap-2 sm:right-4 sm:top-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-3 py-2 shadow-lg ${toastStyles(toast.type)}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium break-words">{toast.message}</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              Dismiss
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
