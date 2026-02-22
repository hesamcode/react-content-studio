import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import Drawer from "../../components/ui/Drawer";
import Modal from "../../components/ui/Modal";
import Tabs from "../../components/ui/Tabs";
import Toast from "../../components/ui/Toast";
import { debounce } from "../../lib/debounce";
import { createId } from "../../lib/ids";
import {
  createDraft,
  loadStudioState,
  saveStudioState,
  withDraftSnapshot,
} from "../../lib/storage";
import {
  copyDraftToClipboard,
  exportDraftAsMarkdown,
  exportDraftAsText,
} from "../export/exportUtils";
import DraftEditor from "./DraftEditor";
import DraftHistory from "./DraftHistory";
import DraftList from "./DraftList";
import DraftMetadata from "./DraftMetadata";

const SIDE_PANEL_TABS = [
  { value: "metadata", label: "Metadata" },
  { value: "history", label: "History" },
];

function updateDraftById(drafts, draftId, updater) {
  return drafts.map((draft) => (draft.id === draftId ? updater(draft) : draft));
}

function nextActiveId(drafts, currentId, removedId) {
  if (currentId !== removedId) {
    return currentId;
  }

  return drafts[0]?.id ?? null;
}

function WorkspaceSkeleton() {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
      <div className="h-64 animate-pulse rounded-xl bg-[var(--app-surface-muted)]" />
      <div className="h-96 animate-pulse rounded-xl bg-[var(--app-surface-muted)]" />
      <div className="h-72 animate-pulse rounded-xl bg-[var(--app-surface-muted)]" />
    </div>
  );
}

export default function WorkspacePage() {
  const [studioState, setStudioState] = useState(() => loadStudioState());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState("metadata");
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const studioRef = useRef(studioState);
  const searchInputRef = useRef(null);
  const timersRef = useRef(new Map());
  const deleteConfirmRef = useRef(null);
  const autosaveRef = useRef(null);

  useEffect(() => {
    studioRef.current = studioState;
  }, [studioState]);

  useEffect(() => {
    const timerId = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(timerId);
  }, []);

  const dismissToast = useCallback((toastId) => {
    const timerId = timersRef.current.get(toastId);

    if (timerId) {
      window.clearTimeout(timerId);
      timersRef.current.delete(toastId);
    }

    setToasts((previous) => previous.filter((toast) => toast.id !== toastId));
  }, []);

  const pushToast = useCallback(
    (message, type = "success") => {
      const toastId = createId("toast");
      setToasts((previous) => [...previous, { id: toastId, message, type }]);

      const timerId = window.setTimeout(() => {
        dismissToast(toastId);
      }, 2800);

      timersRef.current.set(toastId, timerId);
    },
    [dismissToast],
  );

  useEffect(
    () => () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    },
    [],
  );

  const persistState = useCallback((nextState) => {
    studioRef.current = nextState;
    setStudioState(nextState);
    saveStudioState(nextState);
  }, []);

  const applyTransient = useCallback((updater) => {
    setStudioState((previous) => {
      const nextState = updater(previous);
      studioRef.current = nextState;
      return nextState;
    });
  }, []);

  const applyAndPersist = useCallback((updater, snapshotDraftId = null) => {
    setStudioState((previous) => {
      const updatedState = updater(previous);
      const nextState = snapshotDraftId ? withDraftSnapshot(updatedState, snapshotDraftId) : updatedState;
      studioRef.current = nextState;
      saveStudioState(nextState);
      return nextState;
    });
  }, []);

  useEffect(() => {
    const debouncedAutosave = debounce((draftId) => {
      const withSnapshot = withDraftSnapshot(studioRef.current, draftId);

      if (withSnapshot !== studioRef.current) {
        persistState(withSnapshot);
        return;
      }

      saveStudioState(studioRef.current);
    }, 700);

    autosaveRef.current = debouncedAutosave;

    return () => {
      debouncedAutosave.cancel();

      if (autosaveRef.current === debouncedAutosave) {
        autosaveRef.current = null;
      }
    };
  }, [persistState]);

  const queueAutosave = useCallback((draftId) => {
    autosaveRef.current?.(draftId);
  }, []);

  const flushDraftAutosave = useCallback((draftId) => {
    if (!draftId) {
      return;
    }

    autosaveRef.current?.flush(draftId);
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set();

    studioState.drafts.forEach((draft) => {
      draft.tags.forEach((tag) => tagSet.add(tag));
    });

    return [...tagSet].sort((a, b) => a.localeCompare(b));
  }, [studioState.drafts]);

  const visibleDrafts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return [...studioState.drafts]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .filter((draft) => {
        if (selectedTag !== "all" && !draft.tags.includes(selectedTag)) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return (
          draft.title.toLowerCase().includes(normalizedSearch) ||
          draft.content.toLowerCase().includes(normalizedSearch) ||
          draft.tags.some((tag) => tag.includes(normalizedSearch))
        );
      });
  }, [searchQuery, selectedTag, studioState.drafts]);

  const activeDraft = useMemo(
    () => studioState.drafts.find((draft) => draft.id === studioState.activeDraftId) ?? null,
    [studioState.activeDraftId, studioState.drafts],
  );

  const handleCreateDraft = useCallback(() => {
    flushDraftAutosave(studioRef.current.activeDraftId);

    const newDraft = createDraft();

    applyAndPersist(
      (previous) => ({
        ...previous,
        drafts: [newDraft, ...previous.drafts],
        activeDraftId: newDraft.id,
      }),
      newDraft.id,
    );

    setActivePanelTab("metadata");
    setShowMobilePreview(false);
    setMobileDrawerOpen(false);
    pushToast("New draft created.");
  }, [applyAndPersist, flushDraftAutosave, pushToast]);

  const handleSelectDraft = useCallback(
    (draftId) => {
      flushDraftAutosave(studioRef.current.activeDraftId);

      applyAndPersist((previous) => ({
        ...previous,
        activeDraftId: draftId,
      }));

      setShowMobilePreview(false);
      setMobileDrawerOpen(false);
    },
    [applyAndPersist, flushDraftAutosave],
  );

  const handleRenameDraft = useCallback(
    (title) => {
      const draftId = studioRef.current.activeDraftId;

      if (!draftId) {
        return;
      }

      applyAndPersist(
        (previous) => ({
          ...previous,
          drafts: updateDraftById(previous.drafts, draftId, (draft) => ({
            ...draft,
            title,
            updatedAt: new Date().toISOString(),
          })),
        }),
        draftId,
      );

      pushToast("Draft renamed.");
    },
    [applyAndPersist, pushToast],
  );

  const handleUpdateTags = useCallback(
    (tags) => {
      const draftId = studioRef.current.activeDraftId;

      if (!draftId) {
        return;
      }

      applyAndPersist(
        (previous) => ({
          ...previous,
          drafts: updateDraftById(previous.drafts, draftId, (draft) => ({
            ...draft,
            tags,
            updatedAt: new Date().toISOString(),
          })),
        }),
        draftId,
      );

      pushToast("Tags updated.");
    },
    [applyAndPersist, pushToast],
  );

  const handleChangeContent = useCallback(
    (content) => {
      const draftId = studioRef.current.activeDraftId;

      if (!draftId) {
        return;
      }

      applyTransient((previous) => ({
        ...previous,
        drafts: updateDraftById(previous.drafts, draftId, (draft) => ({
          ...draft,
          content,
          updatedAt: new Date().toISOString(),
        })),
      }));

      queueAutosave(draftId);
    },
    [applyTransient, queueAutosave],
  );

  const flushAutosave = useCallback(() => {
    flushDraftAutosave(studioRef.current.activeDraftId);
  }, [flushDraftAutosave]);

  const handleRestoreSnapshot = useCallback(
    (snapshot) => {
      const draftId = studioRef.current.activeDraftId;

      if (!draftId) {
        return;
      }

      applyAndPersist(
        (previous) => ({
          ...previous,
          drafts: updateDraftById(previous.drafts, draftId, (draft) => ({
            ...draft,
            title: snapshot.title,
            content: snapshot.content,
            tags: [...snapshot.tags],
            updatedAt: new Date().toISOString(),
          })),
        }),
        draftId,
      );

      setActivePanelTab("history");
      pushToast("Snapshot restored.");
    },
    [applyAndPersist, pushToast],
  );

  const handleRequestDelete = useCallback((draftId) => {
    setPendingDeleteId(draftId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    const deletedDraftId = pendingDeleteId;

    if (!deletedDraftId) {
      return;
    }

    flushDraftAutosave(studioRef.current.activeDraftId);

    applyAndPersist((previous) => {
      const remainingDrafts = previous.drafts.filter((draft) => draft.id !== deletedDraftId);

      return {
        ...previous,
        drafts: remainingDrafts,
        activeDraftId: nextActiveId(remainingDrafts, previous.activeDraftId, deletedDraftId),
      };
    });

    setPendingDeleteId(null);
    setShowMobilePreview(false);
    pushToast("Draft deleted.");
  }, [applyAndPersist, flushDraftAutosave, pendingDeleteId, pushToast]);

  const handleExportMarkdown = useCallback(() => {
    if (!activeDraft) {
      return;
    }

    exportDraftAsMarkdown(activeDraft);
    pushToast("Markdown file downloaded.");
  }, [activeDraft, pushToast]);

  const handleExportText = useCallback(() => {
    if (!activeDraft) {
      return;
    }

    exportDraftAsText(activeDraft);
    pushToast("Text file downloaded.");
  }, [activeDraft, pushToast]);

  const handleCopy = useCallback(
    async (format) => {
      if (!activeDraft) {
        return;
      }

      try {
        await copyDraftToClipboard(activeDraft, format);
        pushToast(format === "text" ? "Text copied to clipboard." : "Markdown copied to clipboard.");
      } catch {
        pushToast("Clipboard access failed in this browser.", "error");
      }
    },
    [activeDraft, pushToast],
  );

  useEffect(() => {
    function onKeyDown(event) {
      const key = event.key.toLowerCase();
      const withMod = event.metaKey || event.ctrlKey;

      if (!withMod) {
        return;
      }

      if (key === "n") {
        event.preventDefault();
        handleCreateDraft();
        return;
      }

      if (key === "k") {
        event.preventDefault();

        if (window.matchMedia("(max-width: 1023px)").matches) {
          setMobileDrawerOpen(true);
        }

        window.setTimeout(() => {
          searchInputRef.current?.focus();
        }, 0);

        return;
      }

      if (event.shiftKey && key === "p") {
        event.preventDefault();
        setShowMobilePreview((previous) => !previous);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleCreateDraft]);

  useEffect(() => {
    if (!pendingDeleteId) {
      return;
    }

    window.setTimeout(() => {
      deleteConfirmRef.current?.focus();
    }, 0);
  }, [pendingDeleteId]);

  const sidePanel = activeDraft ? (
    <div className="studio-surface rounded-xl border p-3">
      <Tabs tabs={SIDE_PANEL_TABS} value={activePanelTab} onChange={setActivePanelTab} />
      <div className="mt-3">
        {activePanelTab === "metadata" ? (
          <DraftMetadata
            key={activeDraft.id}
            draft={activeDraft}
            onRenameDraft={handleRenameDraft}
            onUpdateTags={handleUpdateTags}
            onRequestDelete={() => handleRequestDelete(activeDraft.id)}
            onExportMarkdown={handleExportMarkdown}
            onExportText={handleExportText}
            onCopyMarkdown={() => handleCopy("markdown")}
            onCopyText={() => handleCopy("text")}
          />
        ) : (
          <DraftHistory draft={activeDraft} onRestoreSnapshot={handleRestoreSnapshot} />
        )}
      </div>
    </div>
  ) : null;

  if (loading) {
    return <WorkspaceSkeleton />;
  }

  return (
    <div className="relative min-w-0">
      <Toast toasts={toasts} onDismiss={dismissToast} />

      <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
        <Button variant="secondary" size="sm" onClick={() => setMobileDrawerOpen(true)} aria-label="Open drafts drawer">
          Drafts
        </Button>
        <p className="min-w-0 truncate text-sm font-medium opacity-80">{activeDraft?.title ?? "No draft selected"}</p>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="hidden min-w-0 lg:block">
          <DraftList
            drafts={visibleDrafts}
            activeDraftId={studioState.activeDraftId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            tags={allTags}
            onSelectDraft={handleSelectDraft}
            onCreateDraft={handleCreateDraft}
            onRequestDelete={handleRequestDelete}
            searchInputRef={searchInputRef}
            loading={false}
          />
        </aside>

        <main className="min-w-0">
          {activeDraft ? (
            <DraftEditor
              draft={activeDraft}
              showMobilePreview={showMobilePreview}
              onToggleMobilePreview={() => setShowMobilePreview((previous) => !previous)}
              onChangeContent={handleChangeContent}
              onBlurContent={flushAutosave}
            />
          ) : (
            <section className="studio-surface rounded-xl border border-dashed p-6 text-center">
              <p className="text-sm opacity-80">No drafts yet. Create your first draft to start writing.</p>
              <Button className="mt-4" onClick={handleCreateDraft} aria-label="Create first draft">
                Create draft
              </Button>
            </section>
          )}

          {activeDraft ? <div className="mt-4 lg:hidden">{sidePanel}</div> : null}
        </main>

        <aside className="hidden min-w-0 lg:block">{sidePanel}</aside>
      </div>

      <Drawer isOpen={mobileDrawerOpen} title="Drafts" onClose={() => setMobileDrawerOpen(false)}>
        <DraftList
          drafts={visibleDrafts}
          activeDraftId={studioState.activeDraftId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          tags={allTags}
          onSelectDraft={handleSelectDraft}
          onCreateDraft={handleCreateDraft}
          onRequestDelete={handleRequestDelete}
          searchInputRef={searchInputRef}
          loading={false}
        />
      </Drawer>

      <Modal
        isOpen={Boolean(pendingDeleteId)}
        title="Delete draft"
        onClose={() => setPendingDeleteId(null)}
        initialFocusRef={deleteConfirmRef}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingDeleteId(null)} aria-label="Cancel delete draft">
              Cancel
            </Button>
            <Button
              ref={deleteConfirmRef}
              variant="danger"
              onClick={handleConfirmDelete}
              aria-label="Confirm delete draft"
            >
              Delete
            </Button>
          </>
        }
      >
        This action permanently removes the selected draft and its snapshots.
      </Modal>

      <section className="studio-surface studio-text-muted mt-4 rounded-xl border p-3 text-xs">
        <p>Shortcuts: Ctrl/Cmd + N (new draft), Ctrl/Cmd + K (focus search), Ctrl/Cmd + Shift + P (toggle preview).</p>
      </section>
    </div>
  );
}
