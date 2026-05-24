"use client";

import { Bell, Search, ChevronDown, Eye } from "lucide-react";
import { useRole, ROLE_LABELS } from "@/lib/role-context";
import { Role } from "@/lib/types";
import { useState } from "react";
import { NOTIFICATIONS } from "@/lib/seed";

const ROLES: { value: Role; description: string }[] = [
  { value: "client-admin", description: "Northbridge Publishing — full PO pipeline visibility" },
  { value: "supplier", description: "Hangzhou Print Works — mobile-first booking + milestones" },
  { value: "agent", description: "Pearl River Logistics — origin milestones + documents" },
  { value: "ops", description: "Pro Carrier Operations — full admin surface" },
];

export function TopBar() {
  const { role, setRole, identity } = useRole();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-5 py-3.5 sm:px-6 lg:px-8"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))",
        borderBottom: "1px solid rgba(233,233,233,0.9)",
        backdropFilter: "blur(14px)",
      }}
    >
      <div className="hidden flex-1 md:flex md:max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
          <input
            placeholder="Search PO, supplier, milestone…"
            className="w-full rounded-2xl border border-midnight-10 bg-white/70 py-2.5 pl-10 pr-4 text-sm placeholder:text-ink-subtle focus:border-teal focus:outline-none"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {/* Role switcher */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 rounded-2xl border border-teal-25 bg-teal-10 px-3.5 py-2 text-sm font-semibold text-teal-shade transition hover:bg-teal-25/40"
          >
            <Eye size={16} />
            <span className="hidden sm:inline">Viewing as</span>
            <span className="font-bold">{ROLE_LABELS[role]}</span>
            <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
          </button>
          {open && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-2xl border border-midnight-10 bg-white p-2 shadow-strong animate-scale-in"
              style={{ transformOrigin: "top right" }}
            >
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                Switch role view
              </div>
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => { setRole(r.value); setOpen(false); }}
                  className={`group w-full rounded-xl px-3 py-2.5 text-left transition ${
                    role === r.value ? "bg-gradient-to-r from-teal/10 to-midnight/5" : "hover:bg-midnight-10/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-midnight">{ROLE_LABELS[r.value]}</span>
                    {role === r.value && (
                      <span className="rounded-full bg-teal px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-muted">{r.description}</div>
                </button>
              ))}
              <div className="mt-2 rounded-xl bg-fuchsia-10/60 px-3 py-2 text-[11px] text-fuchsia-shade">
                Prototype only — switching roles changes what the same data looks like across the platform.
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-midnight-10 bg-white/80 text-midnight transition hover:bg-white"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-96 rounded-2xl border border-midnight-10 bg-white p-2 shadow-strong animate-scale-in" style={{ transformOrigin: "top right" }}>
              <div className="flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <span>Notifications</span>
                <span>{unread} unread</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {NOTIFICATIONS.map((n) => {
                  const dot =
                    n.type === "success" ? "bg-green" :
                    n.type === "warning" ? "bg-orange" :
                    n.type === "error" ? "bg-fuchsia" : "bg-teal";
                  return (
                    <div key={n.id} className="rounded-xl px-3 py-2.5 hover:bg-midnight-10/40">
                      <div className="flex items-start gap-2.5">
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-midnight text-[13px]">{n.title}</span>
                            {!n.read && <span className="text-[10px] font-bold uppercase text-fuchsia">New</span>}
                          </div>
                          <div className="mt-0.5 text-[12px] text-ink-muted">{n.message}</div>
                          <div className="mt-1 text-[11px] text-ink-subtle">{new Date(n.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Identity */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-midnight-10 bg-white/80 py-1 pl-1 pr-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg, #322a6d, #4bbbba)" }}
          >
            {identity.initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-[12px] font-semibold leading-none text-midnight">{identity.name}</div>
            <div className="mt-1 text-[11px] text-ink-muted">{identity.accountName}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
