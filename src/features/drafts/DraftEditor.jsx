import { useMemo } from "react";
import Button from "../../components/ui/Button";
import { countCharacters, countWords, markdownToHtml } from "../../lib/markdown";

export default function DraftEditor({ draft, showMobilePreview, onToggleMobilePreview, onChangeContent, onBlurContent }) {
  const wordCount = useMemo(() => countWords(draft.content), [draft.content]);
  const charCount = useMemo(() => countCharacters(draft.content), [draft.content]);
  const previewHtml = useMemo(() => markdownToHtml(draft.content), [draft.content]);

  return (
    <section className="studio-surface rounded-xl border p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-base font-semibold" title={draft.title}>
          {draft.title}
        </h2>

        <div className="flex items-center gap-2">
          <span className="studio-muted-surface studio-text-muted rounded-md border px-2 py-1 text-xs">
            {wordCount} words
          </span>
          <span className="studio-muted-surface studio-text-muted rounded-md border px-2 py-1 text-xs">
            {charCount} chars
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="lg:hidden"
            onClick={onToggleMobilePreview}
            aria-label={showMobilePreview ? "Edit markdown" : "Show preview"}
          >
            {showMobilePreview ? "Editor" : "Preview"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className={`${showMobilePreview ? "hidden" : "block"} lg:block`}>
          <label htmlFor="markdown-editor" className="mb-2 block text-xs font-semibold uppercase tracking-wide opacity-70">
            Markdown
          </label>
          <textarea
            id="markdown-editor"
            value={draft.content}
            onChange={(event) => onChangeContent(event.target.value)}
            onBlur={onBlurContent}
            className="h-[360px] w-full resize-y rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-3 text-sm leading-6 text-[var(--app-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            placeholder="Start writing your draft..."
            aria-label="Markdown editor"
          />
        </div>

        <div className={`${showMobilePreview ? "block" : "hidden"} lg:block`}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-70">Preview</p>
          <article
            className="studio-muted-surface h-[360px] overflow-y-auto rounded-lg border p-3 text-sm"
            aria-label="Markdown preview"
          >
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </article>
        </div>
      </div>
    </section>
  );
}
