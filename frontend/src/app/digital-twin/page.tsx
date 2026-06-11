"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Box, ShieldAlert } from "lucide-react";
import { getAuthSession } from "@/lib/auth/session";
import { getStoredScope, setRegionalScope } from "@/lib/dashboard/scope";
import { demoRegionalEnergyData, type RegionalEnergyData } from "@/lib/dashboard/demoRegionalEnergyData";
import { RealityModeBadge } from "@/components/dashboard/reality/RealityModeBadge";

const RegionalDigitalTwin3D = dynamic(
  () => import("@/components/dashboard/digital-twin-3d/RegionalDigitalTwin3D"),
  {
    ssr: false,
    loading: () => <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm text-[var(--text-secondary)]">Loading regional digital twin...</section>,
  }
);

export default function DigitalTwinPage() {
  const [region, setRegion] = useState<RegionalEnergyData | null>(null);
  const [blocked, setBlocked] = useState("");

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      setBlocked("login");
      return;
    }
    if (session.scope !== "regional" || !session.regionId) {
      setBlocked("regional-only");
      return;
    }
    const selected = demoRegionalEnergyData.find((item) => item.id === session.regionId) || demoRegionalEnergyData.find((item) => item.id === getStoredScope().regionId) || null;
    if (selected) setRegionalScope(selected.id);
    setRegion(selected);
  }, []);

  if (blocked === "login") {
    return <Blocked title="Login required" message="Please login with a regional dashboard account to open the 3D Digital Twin." />;
  }

  if (blocked === "regional-only") {
    return <Blocked title="Regional access required" message="The 3D Digital Twin is available only inside independent regional dashboard sessions." />;
  }

  if (!region) {
    return <Blocked title="No region selected" message="No regional digital twin device data is available for this session." />;
  }

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Box className="text-grid-500" size={24} />
              <h1 className="text-2xl font-bold">{region.name} 3D Digital Twin</h1>
            </div>
            <p className="mt-2 max-w-4xl text-sm text-[var(--text-secondary)]">
              Interactive regional device view showing how simulated/pilot-ready device data flows to the AI node and becomes dashboard recommendations.
            </p>
          </div>
          <RealityModeBadge />
        </div>
      </header>
      <RegionalDigitalTwin3D regionId={region.id} regionName={region.name} />
    </div>
  );
}

function Blocked({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
      <div className="flex items-center gap-2">
        <ShieldAlert className="text-yellow-600" size={22} />
        <h1 className="text-2xl font-bold text-yellow-600">{title}</h1>
      </div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{message}</p>
      <Link href="/login" className="mt-4 inline-flex rounded-lg bg-grid-500 px-3 py-2 text-xs font-semibold text-white">Go to Login</Link>
    </section>
  );
}
