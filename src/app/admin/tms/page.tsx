"use client";

import Link from "next/link";
import {
  Workflow, RefreshCw, CheckCircle2, AlertTriangle, Layers, Scissors, ArrowLeftRight,
} from "lucide-react";
import { PageHeader, SectionHeading, Pill, POStatusPill, StatsCard } from "@/components/ui";
import { PURCHASE_ORDERS, SUPPLIERS } from "@/lib/seed";
import { formatDate, formatNumber } from "@/lib/format";
import type { PurchaseOrder } from "@/lib/types";

type HandoverState = "Created" | "Queued" | "Retrying" | "Failed";

const STATE_TONE: Record<HandoverState, "green" | "teal" | "orange" | "fuchsia"> = {
  Created: "green",
  Queued: "teal",
  Retrying: "orange",
  Failed: "fuchsia",
};

function supplierName(id: string) {
  return SUPPLIERS.find((s) => s.id === id)?.name ?? id;
}

export default function TmsHandoverPage() {
  const created = PURCHASE_ORDERS.filter((p) => p.shipmentId);
  const queueCandidates = PURCHASE_ORDERS.filter(
    (p) => !p.shipmentId && (p.status === "Booked" || p.status === "Accepted")
  );

  // Deterministic synthetic handover states (no randomness — keeps the prototype stable across renders)
  const queue = queueCandidates.map((po, i) => {
    const state: HandoverState = i % 7 === 3 ? "Failed" : i % 5 === 2 ? "Retrying" : "Queued";
    const attempts = state === "Failed" ? 4 : state === "Retrying" ? 2 : 1;
    return { po, state, attempts };
  });
  const failed = queue.filter((q) => q.state === "Failed");
  const retrying = queue.filter((q) => q.state === "Retrying");

  // Consolidation candidates: 2+ queued POs sharing trade lane (origin country) + mode
  const laneGroups = new Map<string, PurchaseOrder[]>();
  for (const p of queueCandidates) {
    const key = `${p.originCountry}__${p.mode}`;
    laneGroups.set(key, [...(laneGroups.get(key) ?? []), p]);
  }
  const consolidations = [...laneGroups.entries()].filter(([, list]) => list.length >= 2);

  return (
    <>
      <PageHeader
        eyebrow="Neurored TMS"
        title="TMS Handover & Consolidation"
        subtitle="A booked PO creates an order (booking) in Neurored — minimal data, no SCAC/container yet. The order links via Snowflake and first appears as a pending shipment; when Neurored converts it to a shipment, the SCAC/container/ETD feed in and Gatehouse tracking begins. One PO can split into one or more shipments."
        trailing={<button className="btn-ghost"><RefreshCw size={16} /> Resync all</button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <StatsCard icon={<CheckCircle2 size={22} />} label="Shipments created in TMS" value={created.length} accent="#66b556" />
        <StatsCard icon={<Workflow size={22} />} label="Awaiting handover" value={queue.length} accent="#4bbbba" />
        <StatsCard icon={<AlertTriangle size={22} />} label="Failed — raised as exception" value={failed.length} accent="#e83271" subline="Retried automatically" />
        <StatsCard icon={<Layers size={22} />} label="Consolidation groups" value={consolidations.length} accent="#9681ba" />
      </div>

      {/* Resilience note */}
      <div className="horizon-panel mb-6 flex items-start gap-3 rounded-3xl p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-10 text-teal-shade"><ArrowLeftRight size={18} /></div>
        <div className="text-[12px] text-ink-muted">
          Handover is a <span className="font-semibold text-midnight">two-stage</span> flow. Booking a PO creates an <span className="font-semibold text-midnight">order</span> in Neurored using only booking-process data (no MBL, SCAC, container or ETD required at this point) and returns a shipment reference. The standard Snowflake↔Horizon visibility link then feeds the record back — it first shows as a <span className="font-semibold text-midnight">pending</span> shipment. When Pro Carrier later converts the order to a <span className="font-semibold text-midnight">shipment</span> in the TMS, the SCAC and container details arrive and Gatehouse tracking kicks off exactly as it does today. The pipeline runs <span className="font-semibold text-midnight">asynchronously</span>; API calls are <span className="font-semibold text-midnight">queued and retried</span>, failures surface as exceptions, and the link between booked orders and their shipment record is maintained in Snowflake so status syncs <span className="font-semibold text-midnight">bi-directionally</span>.
        </div>
      </div>

      {/* Handover queue */}
      <div className="horizon-panel mb-8 rounded-3xl p-5 sm:p-6">
        <SectionHeading
          title="Handover queue"
          subtitle="Confirmed orders queued for shipment creation in Neurored"
          trailing={<Pill tone="orange">{retrying.length + failed.length} need attention</Pill>}
        />
        <div className="mt-4 overflow-x-auto rounded-2xl border border-midnight-10/60">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO</th>
                <th>Supplier</th>
                <th>Trade lane</th>
                <th>Mode</th>
                <th>Units</th>
                <th>Cargo ready</th>
                <th>Handover state</th>
                <th>Attempts</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {queue.map(({ po, state, attempts }) => (
                <tr key={po.id}>
                  <td><Link href={`/orders/${po.id}`} className="font-semibold text-teal-shade">{po.id}</Link></td>
                  <td>{supplierName(po.supplierId)}</td>
                  <td>{po.originCountry} → UK</td>
                  <td>{po.mode}</td>
                  <td>{formatNumber(po.totalUnits)}</td>
                  <td>{formatDate(po.cargoReadyDate)}</td>
                  <td><Pill tone={STATE_TONE[state]}>{state}</Pill></td>
                  <td className="text-[12px] text-ink-muted">{attempts}×</td>
                  <td>
                    {state === "Failed" ? (
                      <button className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-fuchsia-shade hover:bg-fuchsia-10">
                        <RefreshCw size={11} className="inline mr-1" /> Retry now
                      </button>
                    ) : (
                      <span className="text-[11px] text-ink-subtle">Auto</span>
                    )}
                  </td>
                </tr>
              ))}
              {queue.length === 0 && (
                <tr><td colSpan={9} className="py-8 text-center text-ink-muted">Nothing in the handover queue.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bi-directional status sync */}
      <div className="horizon-panel mb-8 rounded-3xl p-5 sm:p-6">
        <SectionHeading
          title="Bi-directional status sync"
          subtitle="Shipments created in Neurored — operational status reflected back into the OMS"
          trailing={<Pill tone="green">Synced</Pill>}
        />
        <div className="mt-4 overflow-x-auto rounded-2xl border border-midnight-10/60">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>TMS shipment</th>
                <th>Supplier</th>
                <th>Mode</th>
                <th>OMS status</th>
                <th>Last sync</th>
              </tr>
            </thead>
            <tbody>
              {created.slice(0, 10).map((po) => (
                <tr key={po.id}>
                  <td><Link href={`/orders/${po.id}`} className="font-semibold text-teal-shade">{po.id}</Link></td>
                  <td className="font-mono text-[12px] font-semibold text-midnight">{po.shipmentId}</td>
                  <td>{supplierName(po.supplierId)}</td>
                  <td>{po.mode}</td>
                  <td><POStatusPill status={po.status} /></td>
                  <td className="text-[12px] text-ink-muted">{formatDate(po.cargoReadyDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consolidation & splitting */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Consolidation candidates" subtitle="Queued orders on the same lane/mode that can be combined into one shipment before TMS handover" trailing={<Layers size={18} className="text-plum" />} />
          <div className="mt-4 space-y-3">
            {consolidations.length === 0 && (
              <div className="rounded-2xl bg-[#e8f5e0] p-3 text-[12px] font-medium text-[#356b2a]">No consolidation opportunities in the current queue.</div>
            )}
            {consolidations.map(([key, list]) => {
              const [country, mode] = key.split("__");
              const units = list.reduce((s, p) => s + p.totalUnits, 0);
              return (
                <div key={key} className="rounded-2xl border border-midnight-10/60 bg-white/70 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-midnight">{country} → UK · {mode}</div>
                    <Pill tone="teal">{list.length} POs · {formatNumber(units)} units</Pill>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {list.map((p) => (
                      <Link key={p.id} href={`/orders/${p.id}`} className="rounded-lg bg-midnight-10 px-2 py-0.5 text-[11px] font-semibold text-midnight hover:bg-teal-10">{p.id}</Link>
                    ))}
                  </div>
                  <button className="btn-ghost mt-3 text-[12px]"><Layers size={14} /> Consolidate into one shipment</button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Order splitting" subtitle="One PO line split across multiple shipments — configurable per client" trailing={<Scissors size={18} className="text-fuchsia" />} />
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-midnight-10/60 bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-midnight">Example — partial cargo ready</div>
                <Pill tone="orange">Split</Pill>
              </div>
              <div className="mt-2 text-[12px] text-ink-muted">A PO line of 12,000 units is split because only part of the cargo is ready before the mode cut-off:</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-teal-10/50 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-shade">Shipment 1 — Air</div>
                  <div className="mt-1 text-[13px] font-semibold text-midnight">7,500 units</div>
                  <div className="text-[11px] text-ink-muted">Ready now · meets cut-off</div>
                </div>
                <div className="rounded-xl bg-midnight-10/60 p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-midnight">Shipment 2 — Sea</div>
                  <div className="mt-1 text-[13px] font-semibold text-midnight">4,500 units</div>
                  <div className="text-[11px] text-ink-muted">Follows on next sailing</div>
                </div>
              </div>
              <button className="btn-ghost mt-3 text-[12px]"><Scissors size={14} /> Configure split rule</button>
            </div>
            <div className="text-[11px] text-ink-subtle">Consolidation and splitting logic is applied before TMS handover and is configurable per client.</div>
          </div>
        </div>
      </div>
    </>
  );
}
