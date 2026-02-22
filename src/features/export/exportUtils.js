function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-_\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "draft";
}

export function markdownToPlainText(markdown = "") {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1 ($2)")
    .replace(/^[-*]\s+/gm, "• ")
    .trim();
}

function triggerDownload(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener noreferrer";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportDraftAsMarkdown(draft) {
  const filename = `${sanitizeFilename(draft.title)}.md`;
  triggerDownload(filename, draft.content);
}

export function exportDraftAsText(draft) {
  const filename = `${sanitizeFilename(draft.title)}.txt`;
  triggerDownload(filename, markdownToPlainText(draft.content));
}

export async function copyDraftToClipboard(draft, format = "markdown") {
  const content = format === "text" ? markdownToPlainText(draft.content) : draft.content;

  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard is not available in this browser.");
  }

  await navigator.clipboard.writeText(content);
}
