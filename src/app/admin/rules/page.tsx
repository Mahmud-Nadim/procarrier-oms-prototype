"use client";

import { Plus, Edit3, Power, Lock, Clock } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { BOOKING_RULES } from "@/lib/seed";

export default function RulesPage() {
  return (
    <>
      <PageHeader
        title="Booking Rules"
        subtitle="Automated booking validation, configurable per client. Maintained by the Pro Carrier operations team."
        trailing={
          <button
            disabled
            className="btn-primary cursor-not-allowed opacity-50"
            title="Rule engine is deferred to Phase 2"
          >
            <Plus size={16} /> New rule
          </button>
        }
      />

      {/* Phase 2 deferred banner */}
      <div className="mb-6 flex items-start gap-3 rounded-3xl border border-[#f4990b]/40 bg-[#fff5e0] p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#7a5800]"><Lock size={18} /></div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px] font-bold text-[#7a5800]">Phase 2 — deferred</span>
            <Pill tone="orange">Not active at launch</Pill>
          </div>
          <p className="mt-1 text-[12px] text-[#7a5800]/90">
            Booking-rule automation is postponed to a later phase. At launch every booking is
            reviewed and approved manually by Pro Carrier Ops — no rule evaluation runs. The rule
            definitions below are kept as a future concept and are read-only until the engine is enabled.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <SectionHeading
          title="Planned rule library"
          subtitle="Preview only — these will drive automated validation once Phase 2 is enabled."
          trailing={<Pill tone="muted"><Clock size={11} className="mr-1 inline" /> Coming later</Pill>}
        />
      </div>

      <div className="space-y-3">
        {BOOKING_RULES.map((r) => (
          <div key={r.id} className="horizon-panel rounded-3xl p-5 opacity-75">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-[16px] font-bold text-midnight">{r.name}</h3>
                  <Pill tone="teal">{r.type}</Pill>
                  {r.mode && <Pill tone="midnight">{r.mode}</Pill>}
                  <Pill tone="muted">Phase 2</Pill>
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
                <button disabled className="btn-ghost cursor-not-allowed opacity-40" title="Available in Phase 2"><Edit3 size={14} /> Edit</button>
                <button disabled className="btn-ghost cursor-not-allowed opacity-40" title="Available in Phase 2"><Power size={14} /> Toggle</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
