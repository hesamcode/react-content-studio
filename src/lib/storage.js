import { createId } from "./ids";

const STORAGE_KEY = "content-studio:state";
const STORAGE_VERSION = 1;

function nowIso() {
  return new Date().toISOString();
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  const uniqueTags = new Set();

  tags.forEach((tag) => {
    if (typeof tag !== "string") {
      return;
    }

    const normalized = tag.trim().toLowerCase();

    if (normalized) {
      uniqueTags.add(normalized);
    }
  });

  return [...uniqueTags];
}

export function createSnapshotFromDraft(draft) {
  return {
    id: createId("snap"),
    timestamp: nowIso(),
    title: draft.title,
    content: draft.content,
    tags: [...draft.tags],
  };
}

function snapshotsEqual(a, b) {
  if (!a || !b) {
    return false;
  }

  return a.title === b.title && a.content === b.content && JSON.stringify(a.tags) === JSON.stringify(b.tags);
}

export function createDraft({ title = "Untitled draft", content = "", tags = [] } = {}) {
  const timestamp = nowIso();

  const draft = {
    id: createId("draft"),
    title,
    content,
    tags: normalizeTags(tags),
    createdAt: timestamp,
    updatedAt: timestamp,
    history: [],
  };

  draft.history = [createSnapshotFromDraft(draft)];
  return draft;
}

export function createDemoDrafts() {
  return [
    createDraft({
      title: "Launch article outline",
      tags: ["planning", "launch"],
      content:
        "# Launch article\n\n## Objective\nShip a calm writing experience for the team.\n\n- Capture draft ideas\n- Review versions\n- Export content quickly",
    }),
    createDraft({
      title: "Weekly product update",
      tags: ["update", "team"],
      content:
        "# Weekly update\n\n**Wins**\n- Completed mobile navigation drawer\n\n**Next**\n- Polish keyboard shortcuts\n- Add release notes",
    }),
  ];
}

function normalizeSnapshot(rawSnapshot, fallbackDraft) {
  if (!rawSnapshot || typeof rawSnapshot !== "object") {
    return createSnapshotFromDraft(fallbackDraft);
  }

  return {
    id: typeof rawSnapshot.id === "string" ? rawSnapshot.id : createId("snap"),
    timestamp: typeof rawSnapshot.timestamp === "string" ? rawSnapshot.timestamp : nowIso(),
    title: typeof rawSnapshot.title === "string" ? rawSnapshot.title : fallbackDraft.title,
    content: typeof rawSnapshot.content === "string" ? rawSnapshot.content : fallbackDraft.content,
    tags: normalizeTags(rawSnapshot.tags),
  };
}

function normalizeDraft(rawDraft) {
  const fallback = createDraft();

  if (!rawDraft || typeof rawDraft !== "object") {
    return fallback;
  }

  const normalized = {
    id: typeof rawDraft.id === "string" ? rawDraft.id : fallback.id,
    title: typeof rawDraft.title === "string" && rawDraft.title.trim() ? rawDraft.title.trim() : "Untitled draft",
    content: typeof rawDraft.content === "string" ? rawDraft.content : "",
    tags: normalizeTags(rawDraft.tags),
    createdAt: typeof rawDraft.createdAt === "string" ? rawDraft.createdAt : nowIso(),
    updatedAt: typeof rawDraft.updatedAt === "string" ? rawDraft.updatedAt : nowIso(),
    history: [],
  };

  if (Array.isArray(rawDraft.history) && rawDraft.history.length > 0) {
    normalized.history = rawDraft.history
      .slice(-10)
      .map((snapshot) => normalizeSnapshot(snapshot, normalized));
  } else {
    normalized.history = [createSnapshotFromDraft(normalized)];
  }

  return normalized;
}

function migrate(rawState) {
  if (!rawState || typeof rawState !== "object") {
    return null;
  }

  const drafts = Array.isArray(rawState.drafts) ? rawState.drafts.map(normalizeDraft) : [];

  if (drafts.length === 0) {
    return null;
  }

  const activeDraftId =
    typeof rawState.activeDraftId === "string" && drafts.some((draft) => draft.id === rawState.activeDraftId)
      ? rawState.activeDraftId
      : drafts[0].id;

  return {
    version: STORAGE_VERSION,
    drafts,
    activeDraftId,
    seededAt: typeof rawState.seededAt === "string" ? rawState.seededAt : nowIso(),
  };
}

export function loadStudioState() {
  if (typeof window === "undefined") {
    return {
      version: STORAGE_VERSION,
      drafts: createDemoDrafts(),
      activeDraftId: null,
      seededAt: nowIso(),
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const seededDrafts = createDemoDrafts();
      const seededState = {
        version: STORAGE_VERSION,
        drafts: seededDrafts,
        activeDraftId: seededDrafts[0]?.id ?? null,
        seededAt: nowIso(),
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seededState));
      return seededState;
    }

    const parsed = JSON.parse(raw);

    if (parsed.version !== STORAGE_VERSION) {
      const migrated = migrate(parsed);

      if (migrated) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }

    const migrated = migrate(parsed);

    if (migrated) {
      return migrated;
    }
  } catch {
    // Ignore malformed data and reseed below.
  }

  const fallbackDrafts = createDemoDrafts();
  const fallback = {
    version: STORAGE_VERSION,
    drafts: fallbackDrafts,
    activeDraftId: fallbackDrafts[0]?.id ?? null,
    seededAt: nowIso(),
  };

  saveStudioState(fallback);
  return fallback;
}

export function saveStudioState(state) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const normalizedDrafts = Array.isArray(state.drafts) ? state.drafts.map(normalizeDraft) : [];
    const persistable = {
      version: STORAGE_VERSION,
      drafts: normalizedDrafts,
      activeDraftId:
        typeof state.activeDraftId === "string" && normalizedDrafts.some((draft) => draft.id === state.activeDraftId)
          ? state.activeDraftId
          : normalizedDrafts[0]?.id ?? null,
      seededAt: typeof state.seededAt === "string" ? state.seededAt : nowIso(),
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // Ignore storage quota failures.
  }
}

export function withDraftSnapshot(state, draftId) {
  const draft = state.drafts.find((item) => item.id === draftId);

  if (!draft) {
    return state;
  }

  const snapshot = createSnapshotFromDraft(draft);
  const lastSnapshot = draft.history[draft.history.length - 1];

  if (snapshotsEqual(snapshot, lastSnapshot)) {
    return state;
  }

  const nextDraft = {
    ...draft,
    history: [...draft.history, snapshot].slice(-10),
  };

  return {
    ...state,
    drafts: state.drafts.map((item) => (item.id === draftId ? nextDraft : item)),
  };
}

export const storageKeys = {
  state: STORAGE_KEY,
  version: STORAGE_VERSION,
  theme: "content-studio:theme",
};
