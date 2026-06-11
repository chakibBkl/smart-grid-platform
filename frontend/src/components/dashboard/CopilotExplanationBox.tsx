"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function CopilotExplanationBox() {
  return (
    <section className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Decision Explanation</h2>
        <MessageCircle className="text-grid-500" size={19} />
      </div>
      <p className="mt-3 text-xs font-semibold text-[var(--text-secondary)]">Suggested question: Why is risk medium today?</p>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Risk is medium because demand is expected to rise between 18:00 and 21:00 while solar generation is forecasted to drop. The system recommends battery discharge during peak hours, but final dispatch remains under human operator control.
      </p>
      <Link href="/assistant" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Open Decision Explanation</Link>
    </section>
  );
}
