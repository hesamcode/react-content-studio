export default function Tabs({ tabs, value, onChange, className = "" }) {
  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Draft side panel sections"
        className="inline-flex rounded-lg bg-[var(--app-surface-muted)] p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.value === value;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              id={`tab-${tab.value}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.value}`}
              onClick={() => onChange(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                isActive
                  ? "bg-[var(--app-surface)] text-[var(--app-text)] shadow-sm"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
