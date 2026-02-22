import { useEffect, useRef } from "react";
import Button from "./Button";

function getFocusableElements(container) {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')].filter(
    (element) => !element.hasAttribute("disabled"),
  );
}

export default function Drawer({ isOpen, title, onClose, children }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    previouslyFocused.current = document.activeElement;
    const panel = panelRef.current;

    const frameId = window.requestAnimationFrame(() => {
      const focusable = getFocusableElements(panel);
      (focusable[0] ?? panel)?.focus();
    });

    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusableElements(panel);

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
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="studio-overlay fixed inset-0 z-40 lg:hidden"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="studio-surface h-full w-[92vw] max-w-[340px] overflow-y-auto border-r p-4 shadow-xl"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close drafts drawer">
            Close
          </Button>
        </div>

        {children}
      </aside>
    </div>
  );
}
