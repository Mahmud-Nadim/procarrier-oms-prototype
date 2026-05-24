"use client";

import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./topbar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="ambient-bg min-h-screen">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="ambient-orb" style={{ top: "5rem", left: "-4rem", width: "18rem", height: "18rem", background: "radial-gradient(circle, rgba(75,187,186,0.34), rgba(75,187,186,0.06) 62%, transparent 72%)" }} />
        <div className="ambient-orb" style={{ top: "22%", right: "-7rem", width: "24rem", height: "24rem", background: "radial-gradient(circle, rgba(50,42,109,0.16), rgba(50,42,109,0.03) 66%, transparent 76%)" }} />
        <div className="ambient-orb" style={{ bottom: "-5rem", left: "18%", width: "20rem", height: "20rem", background: "radial-gradient(circle, rgba(232,50,113,0.16), rgba(232,50,113,0.03) 62%, transparent 75%)" }} />
      </div>

      <Sidebar />
      <div className="lg:ml-[270px]">
        <TopBar />
        <main className="mx-auto w-full max-w-[1600px] px-5 pb-12 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
