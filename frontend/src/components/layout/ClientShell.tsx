"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const bareRoutes = ["/", "/login"];

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // entry pages (login) render full-screen without the app chrome
  if (bareRoutes.includes(pathname)) {
    return (
      <ThemeProvider>
        <main className="h-screen overflow-y-auto">
          <div key={pathname} className="animate-fade-in min-h-full">
            {children}
          </div>
        </main>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="grid-bg flex-1 overflow-y-auto bg-[var(--bg-secondary)] p-4 md:p-6">
            <div key={pathname} className="animate-fade-up">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
