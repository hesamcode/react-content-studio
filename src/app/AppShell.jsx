import { useEffect, useMemo, useState } from "react";
import { storageKeys } from "../lib/storage";

function getInitialTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  const persisted = window.localStorage.getItem(storageKeys.theme);

  if (persisted === "light" || persisted === "dark") {
    return persisted;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function navClasses(isActive) {
  return `rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
    isActive
      ? "bg-primary-500 text-white"
      : "border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)] hover:text-[var(--app-text)]"
  }`;
}

export default function AppShell({ route, children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const themeLabel = useMemo(() => (theme === "dark" ? "Light mode" : "Dark mode"), [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(storageKeys.theme, theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="mx-auto max-w-[1400px] px-3 pb-6 pt-4 sm:px-4 sm:pt-6">
        <header className="studio-surface mb-4 rounded-xl border p-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] opacity-70">Content Studio</p>
              <h1 className="text-lg font-semibold">Calm writing workspace</h1>
            </div>

            <div className="flex items-center gap-2">
              <a href="#/workspace" className={navClasses(route === "/workspace")} aria-label="Go to workspace">
                Workspace
              </a>
              <a href="#/about" className={navClasses(route === "/about")} aria-label="Go to about page">
                About
              </a>
              <button
                type="button"
                className="rounded-md border border-[var(--app-border)] bg-[var(--app-surface-muted)] px-3 py-1.5 text-sm font-medium text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-surface-subtle)] hover:text-[var(--app-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                onClick={() => setTheme((previous) => (previous === "dark" ? "light" : "dark"))}
                aria-label={themeLabel}
              >
                {themeLabel}
              </button>
            </div>
          </div>
        </header>

        <main className="min-w-0">{children}</main>

        <footer className="studio-text-muted mt-10 border-t studio-border pt-4 text-base">
          Built by{" "}
          <a
            href="https://hesamcode.github.io"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit HesamCode portfolio website"
            className="font-semibold text-primary-500 hover:underline"
          >
            HesamCode
          </a>
        </footer>
      </div>
    </div>
  );
}
