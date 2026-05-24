"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";
import { PageHeader, SeverityPill, Pill, SectionHeading } from "@/components/ui";
import { EXCEPTIONS, PURCHASE_ORDERS, SUPPLIERS } from "@/lib/seed";
import { ExceptionRecord } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export default function ExceptionsPage() {
  const [filter, setFilter] = useState<"all" | "open" | "acknowledged" | "resolved">("open");

  const list = EXCEPTIONS.filter((e) => {
    if (filter === "all") return true;
    if (filter === "open") return e.status === "Open";
    if (filter === "acknowledged") return e.status === "Acknowledged";
    return e.status === "Resolved";
  });

  const byType = (type: ExceptionRecord["type"]) => list.filter((e) => e.type === type).length;

  return (
    <>
      <PageHeader
        title="Exceptions"
        subtitle="Non-compliance, missed milestones, and rule breaches surfaced by the OMS"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExceptionTile label="Missed milestone" count={byType("Missed milestone")} accent="#f4990b" />
        <ExceptionTile label="Booking rule breach" count={byType("Booking rule breach")} accent="#e83271" />
        <ExceptionTile label="Quantity shortfall" count={byType("Quantity shortfall")} accent="#322a6d" />
        <ExceptionTile label="Cancellation trigger" count={byType("Cancellation trigger")} accent="#723a62" />
      </div>

      <div className="horizon-panel rounded-3xl p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap gap-2">
          {(["open", "acknowledged", "resolved", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize transition ${
                filter === f ? "bg-gradient-to-r from-fuchsia to-midnight text-white shadow-soft" : "border border-midnight-10 bg-white/70 text-ink"
              }`}
            >
              {f} ({EXCEPTIONS.filter(e => f === "all" ? true : e.status.toLowerCase() === f).length})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {list.map((e) => {
          const po = PURCHASE_ORDERS.find((p) => p.id === e.poId);
          const supplier = SUPPLIERS.find((s) => s.id === po?.supplierId);
          return (
            <div key={e.id} className="horizon-panel rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-10 text-fuchsia-shade">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/orders/${e.poId}`} className="font-display font-bold text-midnight hover:underline">{e.poId}</Link>
                      <span className="text-[11px] uppercase tracking-wider text-ink-muted font-semibold">{e.type}</span>
                      <SeverityPill severity={e.severity} />
                      <Pill tone={e.status === "Open" ? "fuchsia" : e.status === "Acknowledged" ? "orange" : "green"}>{e.status}</Pill>
                    </div>
                    <div className="mt-1 text-[13px] text-ink">{e.description}</div>
                    <div className="mt-1.5 text-[11px] text-ink-muted">
                      Supplier: {supplier?.name} · raised {formatDateTime(e.raisedAt)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-ghost"><MessageSquare size={14} /> Add note</button>
                  {e.status === "Open" && <button className="btn-primary"><CheckCircle2 size={14} /> Mark resolved</button>}
                </div>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="horizon-panel rounded-3xl p-10 text-center text-ink-muted">
            <CheckCircle2 size={40} className="mx-auto text-green mb-3" />
            All caught up. No exceptions match this filter.
          </div>
        )}
      </div>
    </>
  );
}

function ExceptionTile({ label, count, accent }: { label: string; count: number; accent: string }) {
  return (
    <div className="horizon-panel rounded-3xl p-4" style={{ borderBottom: `3px solid ${accent}` }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-2 font-display text-[28px] font-bold" style={{ color: accent }}>{count}</div>
    </div>
  );
}
