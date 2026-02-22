import Button from "../../components/ui/Button";

function formatTime(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Unknown";
  }
}

export default function DraftHistory({ draft, onRestoreSnapshot }) {
  const historyEntries = [...draft.history].reverse();

  return (
    <section id="panel-history" role="tabpanel" aria-labelledby="tab-history">
      {historyEntries.length === 0 ? (
        <div className="studio-text-muted rounded-lg border border-dashed studio-border p-3 text-sm">
          No snapshots available yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {historyEntries.map((snapshot) => (
            <li key={snapshot.id} className="studio-muted-surface rounded-lg border p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium opacity-70">{formatTime(snapshot.timestamp)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onRestoreSnapshot(snapshot)}
                  aria-label={`Restore snapshot from ${formatTime(snapshot.timestamp)}`}
                >
                  Restore
                </Button>
              </div>
              <p className="truncate text-sm font-semibold">{snapshot.title}</p>
              <p className="mt-1 max-h-10 overflow-hidden text-xs opacity-80">{snapshot.content || "(empty snapshot)"}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
