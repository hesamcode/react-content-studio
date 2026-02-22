import { useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function normalizeTitle(value) {
  const trimmed = value.trim();
  return trimmed || "Untitled draft";
}

function parseTags(value) {
  return [...new Set(value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

function formatTime(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Unknown";
  }
}

export default function DraftMetadata({
  draft,
  onRenameDraft,
  onUpdateTags,
  onRequestDelete,
  onExportMarkdown,
  onExportText,
  onCopyMarkdown,
  onCopyText,
}) {
  const [titleInput, setTitleInput] = useState(draft.title);
  const [tagsInput, setTagsInput] = useState(draft.tags.join(", "));

  const commitTitle = () => {
    const normalized = normalizeTitle(titleInput);

    if (normalized !== draft.title) {
      onRenameDraft(normalized);
    }

    setTitleInput(normalized);
  };

  const commitTags = () => {
    const nextTags = parseTags(tagsInput);

    if (JSON.stringify(nextTags) !== JSON.stringify(draft.tags)) {
      onUpdateTags(nextTags);
    }

    setTagsInput(nextTags.join(", "));
  };

  return (
    <section id="panel-metadata" role="tabpanel" aria-labelledby="tab-metadata" className="space-y-3">
      <div>
        <label htmlFor="draft-title" className="mb-1 block text-xs font-semibold uppercase tracking-wide opacity-70">
          Draft title
        </label>
        <Input
          id="draft-title"
          value={titleInput}
          onChange={(event) => setTitleInput(event.target.value)}
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitTitle();
              event.currentTarget.blur();
            }
          }}
          aria-label="Draft title"
        />
      </div>

      <div>
        <label htmlFor="draft-tags" className="mb-1 block text-xs font-semibold uppercase tracking-wide opacity-70">
          Tags (comma separated)
        </label>
        <Input
          id="draft-tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          onBlur={commitTags}
          aria-label="Draft tags"
        />
      </div>

      <div className="studio-muted-surface studio-text-muted rounded-lg border p-3 text-xs">
        <p>Created: {formatTime(draft.createdAt)}</p>
        <p className="mt-1">Last edited: {formatTime(draft.updatedAt)}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={onExportMarkdown} aria-label="Download markdown">
          Download .md
        </Button>
        <Button variant="secondary" size="sm" onClick={onExportText} aria-label="Download text">
          Download .txt
        </Button>
        <Button variant="ghost" size="sm" onClick={onCopyMarkdown} aria-label="Copy markdown">
          Copy .md
        </Button>
        <Button variant="ghost" size="sm" onClick={onCopyText} aria-label="Copy text">
          Copy .txt
        </Button>
      </div>

      <Button
        variant="danger"
        size="sm"
        className="w-full"
        onClick={onRequestDelete}
        aria-label={`Delete draft ${draft.title}`}
      >
        Delete draft
      </Button>
    </section>
  );
}
