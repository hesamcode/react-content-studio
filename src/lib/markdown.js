const URL_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseInline(markdownLine) {
  let safe = escapeHtml(markdownLine);

  safe = safe.replace(URL_PATTERN, '<a class="text-accent-500 underline" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  safe = safe.replace(/`([^`]+)`/g, '<code class="rounded bg-black/10 px-1 py-0.5 text-sm">$1</code>');
  safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return safe;
}

export function markdownToHtml(markdown = "") {
  if (!markdown.trim()) {
    return '<p class="text-sm opacity-70">Nothing to preview yet.</p>';
  }

  const lines = markdown.split("\n");
  const chunks = [];
  let listOpen = false;

  function closeList() {
    if (!listOpen) {
      return;
    }

    chunks.push("</ul>");
    listOpen = false;
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (/^[-*]\s+/.test(trimmed)) {
      if (!listOpen) {
        chunks.push('<ul class="mb-3 list-inside list-disc space-y-1">');
        listOpen = true;
      }

      chunks.push(`<li>${parseInline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      return;
    }

    closeList();

    if (!trimmed) {
      chunks.push('<div class="h-3" aria-hidden="true"></div>');
      return;
    }

    if (/^###\s+/.test(trimmed)) {
      chunks.push(`<h3 class="mb-2 text-lg font-semibold">${parseInline(trimmed.replace(/^###\s+/, ""))}</h3>`);
      return;
    }

    if (/^##\s+/.test(trimmed)) {
      chunks.push(`<h2 class="mb-2 text-xl font-semibold">${parseInline(trimmed.replace(/^##\s+/, ""))}</h2>`);
      return;
    }

    if (/^#\s+/.test(trimmed)) {
      chunks.push(`<h1 class="mb-3 text-2xl font-semibold">${parseInline(trimmed.replace(/^#\s+/, ""))}</h1>`);
      return;
    }

    chunks.push(`<p class="mb-2 leading-7 break-words">${parseInline(trimmed)}</p>`);
  });

  closeList();
  return chunks.join("");
}

export function countWords(markdown = "") {
  const words = markdown
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words.length;
}

export function countCharacters(markdown = "") {
  return markdown.length;
}
