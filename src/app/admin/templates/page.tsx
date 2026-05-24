"use client";

import { Plus, Compass } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { CRITICAL_PATH_TEMPLATES, TRADE_LINE_UPLIFTS } from "@/lib/seed";

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Critical Path Templates"
        subtitle="Configurable per client, origin, and transport mode. Anchor + uplift driven."
        trailing={<button className="btn-primary"><Plus size={16} /> New template</button>}
      />

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {CRITICAL_PATH_TEMPLATES.map((t) => (
          <div key={t.id} className="horizon-panel rounded-3xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-teal-shade" />
                  <h3 className="font-display text-[16px] font-bold text-midnight">{t.name}</h3>
                </div>
                <div className="mt-1 text-[12px] text-ink-muted">{t.origin} → {t.destination} · {t.mode}</div>
              </div>
              <Pill tone="teal">{t.milestones.length} milestones</Pill>
            </div>

            <div className="mt-4 space-y-1.5">
              {t.milestones.map((m) => (
                <div key={m.type} className="flex items-center gap-3 rounded-lg border border-midnight-10/60 bg-white/70 px-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-10 text-[11px] font-bold text-teal-shade">{m.sequence}</span>
                  <span className="flex-1 text-[13px] font-semibold text-midnight">{m.label}</span>
                  <span className="text-[11px] text-ink-muted font-mono">+{m.upliftDays}d</span>
                  <Pill tone="muted">{m.owner}</Pill>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="horizon-panel rounded-3xl p-5">
        <SectionHeading title="Trade-line uplift matrix" subtitle="Default transit days per route-to-market" />
        <div className="mt-4 overflow-hidden rounded-2xl border border-midnight-10/60">
          <table className="data-table">
            <thead>
              <tr>
                <th>Origin</th>
                <th>Destination</th>
                <th>Mode</th>
                <th>Transit days</th>
              </tr>
            </thead>
            <tbody>
              {TRADE_LINE_UPLIFTS.map((u, i) => (
                <tr key={i}>
                  <td className="font-semibold text-midnight">{u.origin}</td>
                  <td>{u.destination}</td>
                  <td><Pill tone={u.mode === "Sea" ? "midnight" : u.mode === "Air" ? "teal" : "fuchsia"}>{u.mode}</Pill></td>
                  <td className="font-mono font-semibold">{u.transitDays}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
