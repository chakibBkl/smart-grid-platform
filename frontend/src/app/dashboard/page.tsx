"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredScope } from "@/lib/dashboard/scope";
import { getAuthSession } from "@/lib/auth/session";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    const { scope, regionId } = getStoredScope();
    if (scope === "national") router.replace("/dashboard/national");
    else if (scope === "regional" && regionId) router.replace(`/dashboard/regions/${regionId}`);
    else router.replace("/select-region");
  }, [router]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-sm text-[var(--text-secondary)]">
      Loading dashboard scope...
    </div>
  );
}
