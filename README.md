# Content Studio

A calm, mobile-first writing tool built with Vite, React, and Tailwind CSS v4.

## Features

- Draft management: create, rename, delete
- Tags, tag filtering, and full-text draft search
- Markdown editor with live preview
- Mobile preview toggle and desktop split editor/preview
- Autosave with debounce to versioned `localStorage`
- Version history (last 10 snapshots per draft) with restore
- Export as `.md` and `.txt`
- Copy markdown/text to clipboard
- Toast feedback, empty states, and loading skeletons
- Dark/light mode persisted in `localStorage`
- Keyboard shortcuts:
  - `Ctrl/Cmd + N`: new draft
  - `Ctrl/Cmd + K`: focus search
  - `Ctrl/Cmd + Shift + P`: toggle preview

## Project Structure

```txt
src/
  app/
    AppShell.jsx
    router.jsx
  components/
    ui/
      Button.jsx
      Input.jsx
      Modal.jsx
      Toast.jsx
      Drawer.jsx
      Tabs.jsx
  features/
    drafts/
      DraftList.jsx
      DraftEditor.jsx
      DraftMetadata.jsx
      DraftHistory.jsx
      WorkspacePage.jsx
    export/
      exportUtils.js
  lib/
    storage.js
    debounce.js
    markdown.js
    ids.js
  main.jsx
  index.css
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages Notes

- Routing uses hash-based navigation in `src/app/router.jsx` (`#/workspace`, `#/about`) so static hosting works without rewrite rules.
- Vite base path is set in `vite.config.js`:
  - `base: "/react-content-studio/"`
- If your repository name changes, update `base` to match the new repo path.
- All storage is client-side `localStorage`; there is no backend/SSR.
- No `process.env` usage; Vite env should use `import.meta.env.VITE_*` when needed.
- Avoid absolute asset paths so the app works under a subpath.

## Accessibility Notes

- Focus-visible styling is enabled globally and on interactive controls.
- Controls include `aria-label` attributes where needed.
- Drawer and modal dialogs support:
  - Focus trap
  - `Escape` close
  - Returning focus to the previously focused element

## QA Checklist

- [ ] `npm run build` succeeds
- [ ] App opens to `#/workspace`
- [ ] Draft create/rename/delete persists across refresh
- [ ] Tag filtering and search work together
- [ ] Autosave updates draft and snapshot history
- [ ] Snapshot restore updates content/title/tags
- [ ] Export `.md` and `.txt` downloads work
- [ ] Clipboard copy works (or shows error toast when blocked)
- [ ] Mobile (360px): no horizontal scrolling, drawer works, preview toggle works
- [ ] Desktop: split editor + preview layout
- [ ] Dark/light toggle persists and footer remains visible

Author
HesamCode
Portfolio: https://hesamcode.github.io
