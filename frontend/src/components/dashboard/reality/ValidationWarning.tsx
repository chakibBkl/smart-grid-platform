export function ValidationWarning({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null;
  return (
    <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
      <h2 className="text-sm font-semibold text-yellow-600">Demo Data Validation Warning</h2>
      <div className="mt-2 max-h-32 overflow-auto text-xs text-[var(--text-secondary)]">
        {warnings.slice(0, 6).map((warning) => <p key={warning}>{warning}</p>)}
      </div>
    </section>
  );
}
