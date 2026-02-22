import { useEffect, useId, useRef } from "react";
import Button from "./Button";

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hasAttribute("disabled"),
  );
}

export default function Modal({ isOpen, title, onClose, children, footer, initialFocusRef }) {
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previouslyFocused.current = document.activeElement;
    const dialog = dialogRef.current;

    const setFocus = () => {
      const focusable = getFocusableElements(dialog);
      const fallback = focusable[0] ?? dialog;
      (initialFocusRef?.current ?? fallback)?.focus();
    };

    const frameId = window.requestAnimationFrame(setFocus);

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(dialog);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frameId);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [initialFocusRef, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="studio-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="studio-surface w-full max-w-md rounded-xl border p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close dialog">
            Close
          </Button>
        </div>

        <div className="studio-text-muted text-sm">{children}</div>

        {footer ? <div className="mt-4 flex items-center justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}
