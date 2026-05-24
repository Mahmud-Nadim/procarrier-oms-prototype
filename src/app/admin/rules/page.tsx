"use client";

import { Plus, Edit3, Power } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { BOOKING_RULES } from "@/lib/seed";

export default function RulesPage() {
  return (
    <>
      <PageHeader
        title="Booking Rules"
        subtitle="Configurable per client. Maintained by the Pro Carrier operations team."
        trailing={<button className="btn-primary"><Plus size={16} /> New rule</button>}
      />

      <div className="space-y-3">
        {BOOKING_RULES.map((r) => (
          <div key={r.id} className="horizon-panel rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[16px] font-bold text-midnight">{r.name}</h3>
                  <Pill tone="teal">{r.type}</Pill>
                  {r.mode && <Pill tone="midnight">{r.mode}</Pill>}
                  <Pill tone={r.active ? "green" : "muted"}>{r.active ? "Active" : "Inactive"}</Pill>
                </div>
                <div className="mt-2 text-[13px] text-ink-muted">{r.description}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(r.config).map(([k, v]) => (
                    <span key={k} className="rounded-lg bg-midnight-10/60 px-2.5 py-1 text-[11px] font-mono text-midnight">
                      {k}: <span className="font-bold">{v}</span>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn-ghost"><Edit3 size={14} /> Edit</button>
                <button className="btn-ghost"><Power size={14} /> Toggle</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
