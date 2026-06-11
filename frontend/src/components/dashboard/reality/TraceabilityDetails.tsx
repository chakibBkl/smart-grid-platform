import { demoRegionalProvenance, formatConfidence, type DataProvenance } from "@/lib/reality/dataProvenance";
import { getMetricDefinition, type MetricKey } from "@/lib/reality/dataDictionary";

export function TraceabilityDetails({ metric, provenance = demoRegionalProvenance, assumptions }: { metric: MetricKey; provenance?: DataProvenance; assumptions?: string }) {
  const definition = getMetricDefinition(metric);
  return (
    <details className="mt-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-3 text-xs">
      <summary className="cursor-pointer font-semibold text-grid-500">How calculated?</summary>
      <div className="mt-3 grid gap-2 text-[var(--text-secondary)] md:grid-cols-2">
        <p><strong className="text-[var(--text-primary)]">Metric:</strong> {definition.label}</p>
        <p><strong className="text-[var(--text-primary)]">Unit:</strong> {definition.unit}</p>
        <p><strong className="text-[var(--text-primary)]">Mode:</strong> {provenance.sourceMode}</p>
        <p><strong className="text-[var(--text-primary)]">Source:</strong> {definition.source}</p>
        <p><strong className="text-[var(--text-primary)]">Updated:</strong> {new Date(provenance.lastUpdated).toLocaleString()}</p>
        <p><strong className="text-[var(--text-primary)]">Confidence:</strong> {formatConfidence(provenance)}</p>
        <p className="md:col-span-2"><strong className="text-[var(--text-primary)]">Rule:</strong> {definition.calculation}</p>
        <p className="md:col-span-2"><strong className="text-[var(--text-primary)]">Assumption:</strong> {assumptions || provenance.notes}</p>
      </div>
    </details>
  );
}
