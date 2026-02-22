import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function formatUpdated(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Recently";
  }
}

export default function DraftList({
  drafts,
  activeDraftId,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  tags,
  onSelectDraft,
  onCreateDraft,
  onRequestDelete,
  searchInputRef,
  loading,
}) {
  return (
    <section className="studio-surface rounded-xl border p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Drafts</h2>
        <Button size="sm" onClick={onCreateDraft} aria-label="Create new draft">
          New
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search drafts"
          aria-label="Search drafts"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
              selectedTag === "all"
                ? "bg-primary-500 text-white"
                : "border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"
            }`}
            onClick={() => onSelectTag("all")}
            aria-label="Filter by all tags"
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 ${
                selectedTag === tag
                  ? "bg-primary-500 text-white"
                  : "border border-[var(--app-border)] bg-[var(--app-surface-muted)] text-[var(--app-text-muted)]"
              }`}
              onClick={() => onSelectTag(tag)}
              aria-label={`Filter by ${tag}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-2" aria-label="Loading drafts">
          <div className="h-16 animate-pulse rounded-lg bg-[var(--app-surface-muted)]" />
          <div className="h-16 animate-pulse rounded-lg bg-[var(--app-surface-muted)]" />
          <div className="h-16 animate-pulse rounded-lg bg-[var(--app-surface-muted)]" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="studio-text-muted mt-4 rounded-lg border border-dashed studio-border p-3 text-sm">
          No drafts match your filters.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {drafts.map((draft) => {
            const isActive = draft.id === activeDraftId;

            return (
              <li key={draft.id} className="min-w-0">
                <div
                  className={`rounded-lg border p-2 ${
                    isActive
                      ? "border-primary-500 bg-primary-500/10"
                      : "studio-muted-surface"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => onSelectDraft(draft.id)}
                    aria-label={`Open draft ${draft.title}`}
                  >
                    <p className="truncate text-sm font-semibold">{draft.title}</p>
                    <p className="mt-1 text-xs opacity-80">Updated {formatUpdated(draft.updatedAt)}</p>
                  </button>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="truncate text-xs opacity-70">
                      {draft.tags.length ? draft.tags.map((tag) => `#${tag}`).join(" ") : "No tags"}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => onRequestDelete(draft.id)}
                      aria-label={`Delete draft ${draft.title}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
