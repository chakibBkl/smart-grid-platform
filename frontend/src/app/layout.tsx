import "./globals.css";
import type { Metadata } from "next";
import { ClientShell } from "@/components/layout/ClientShell";

export const metadata: Metadata = {
  title: "NEURO GRID",
  description: "AI-powered Smart Grid Decision-Support Platform by NV TEAM",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="light"){document.documentElement.classList.remove("dark")}else{document.documentElement.classList.add("dark")}}catch(e){document.documentElement.classList.add("dark")}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
