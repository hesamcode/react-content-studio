export default function AboutPage() {
  return (
    <section className="studio-surface rounded-xl border p-4">
      <h2 className="text-xl font-semibold">About Content Studio</h2>
      <p className="studio-text-muted mt-3 text-sm leading-7">
        Content Studio is a focused drafting environment for writing, organizing tags, tracking version snapshots, and exporting finished content.
      </p>
      <p className="studio-text-muted mt-4 text-base">
        Built by{" "}
        <a
          href="https://hesamkhorshidi.github.io"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Hesam Khorshidi portfolio website"
          className="font-semibold text-primary-500 hover:underline"
        >
          Hesam Khorshidi
        </a>
      </p>
    </section>
  );
}
