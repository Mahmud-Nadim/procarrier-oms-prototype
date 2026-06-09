"use client";

import { Plus, Compass, Anchor, Info, Tag } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { CRITICAL_PATH_TEMPLATES, TRADE_LINE_UPLIFTS } from "@/lib/seed";
import type { TemplateMilestone } from "@/lib/types";

function anchorLabel(milestones: TemplateMilestone[], anchor: TemplateMilestone["anchor"]) {
  if (anchor === "OrderCreate") return "order date";
  return milestones.find((x) => x.type === anchor)?.label ?? anchor;
}

// Cargo Ready and Delivery Required can be taken from the uploaded PO file or calculated (anchor + uplift).
const SELECTABLE_SOURCE = new Set(["CargoReady", "Delivery"]);

export default function TemplatesPage() {
  return (
    <>
      <PageHeader
        title="Critical Path Templates"
        subtitle="Configurable per client, origin, and transport mode. Anchor + uplift driven."
        trailing={<button className="btn-primary"><Plus size={16} /> New template</button>}
      />

      {/* Config model note — from the May 19 walkthrough */}
      <div className="horizon-panel mb-6 flex items-start gap-3 rounded-3xl p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-10 text-teal-shade"><Info size={18} /></div>
        <div className="text-[12px] text-ink-muted">
          Pro Carrier ships a <span className="font-semibold text-midnight">default template</span> of 7 standard milestones as the boilerplate for every client.
          Milestones are <span className="font-semibold text-midnight">renameable</span> (the label is customer-facing; the underlying type is fixed), but new milestone types aren&apos;t added at launch.
          Each rule is configured <span className="font-semibold text-midnight">per trade lane</span> (row-level, like Teams filters) — Pro Carrier sets sensible defaults, the customer edits the anchor and uplift to suit their business.
          <span className="font-semibold text-midnight"> Cargo Ready</span> and <span className="font-semibold text-midnight">Delivery Required</span> can be taken straight from the uploaded PO file or calculated from a previous milestone.
        </div>
      </div>

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
                <div key={m.type} className="rounded-lg border border-midnight-10/60 bg-white/70 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-10 text-[11px] font-bold text-teal-shade">{m.sequence}</span>
                    <span className="flex-1 text-[13px] font-semibold text-midnight">{m.label}</span>
                    <Pill tone="muted">{m.owner}</Pill>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 pl-9 text-[11px] text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <Anchor size={11} className="text-teal-shade" />
                      {m.anchor === "OrderCreate"
                        ? <>anchored on <span className="font-semibold text-ink">order date</span></>
                        : <>anchored on <span className="font-semibold text-ink">{anchorLabel(t.milestones, m.anchor)}</span> + <span className="font-mono font-semibold text-ink">{m.upliftDays}d</span></>}
                    </span>
                    <span className="text-ink-subtle">· ±{m.toleranceDays}d tol.</span>
                    {SELECTABLE_SOURCE.has(m.type) && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff5e0] px-2 py-0.5 text-[10px] font-semibold text-[#7a5800]">
                        <Tag size={10} /> from PO file · or calculated
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="horizon-panel rounded-3xl p-5">
        <SectionHeading title="Trade-lane uplift matrix" subtitle="Default transit days per route-to-market — the master data behind Departure → Arrival uplift" />
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
