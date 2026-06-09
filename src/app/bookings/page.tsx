"use client";

import Link from "next/link";
import { useState } from "react";
import { Boxes, Plus, Download, Zap, CheckCircle2, XCircle } from "lucide-react";
import { PageHeader, BookingStatusPill, Pill, SectionHeading } from "@/components/ui";
import { Modal, ModalField } from "@/components/modal";
import { BOOKING_REQUESTS, SUPPLIERS, PURCHASE_ORDERS } from "@/lib/seed";
import { formatDate, formatNumber } from "@/lib/format";
import { useRole } from "@/lib/role-context";

type RuleResult = { accepted: boolean; code: string; message: string; reference?: string };

export default function BookingsPage() {
  const { role, identity } = useRole();
  let list = BOOKING_REQUESTS;
  if (role === "supplier") list = list.filter((b) => b.supplierId === identity.accountId);

  const autoDecided = list.filter((b) => b.status === "Confirmed" || b.status === "Rejected").length;
  const autoRate = list.length ? Math.round((autoDecided / list.length) * 100) : 0;

  const [submitOpen, setSubmitOpen] = useState(false);
  const [result, setResult] = useState<RuleResult | null>(null);

  const openSubmit = () => { setResult(null); setSubmitOpen(true); };
  const accept = () => setResult({ accepted: true, code: "QTY-OK · CUTOFF-OK · HANDOVER-OK", message: "Within quantity tolerance, before mode cut-off, inside the handover window.", reference: "BR-83102" });
  const reject = () => setResult({ accepted: false, code: "QTY-TOL-001", message: "Requested 8,400 units exceeds the PO quantity tolerance (+5% → 8,190 max). Reduce the quantity and resubmit." });

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Booking requests submitted by suppliers, validated automatically by the client rule engine in real time."
        trailing={
          <div className="flex flex-wrap gap-2">
            {role === "supplier" && <button className="btn-primary" onClick={openSubmit}><Plus size={16} /> Submit booking</button>}
            {(role === "client-admin" || role === "ops") && <button className="btn-ghost"><Download size={16} /> Export CSV</button>}
          </div>
        }
      />

      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit a booking request"
        subtitle="The client rule engine validates quantity tolerance, mode cut-off, and the handover window the moment you submit."
        size="lg"
        footer={
          result ? (
            <>
              {!result.accepted && <button className="btn-ghost" onClick={() => setResult(null)}>Amend &amp; retry</button>}
              <button className="btn-primary" onClick={() => setSubmitOpen(false)}>Done</button>
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={() => setSubmitOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={accept}><Zap size={16} /> Validate &amp; submit</button>
            </>
          )
        }
      >
        {!result ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <ModalField label="Purchase order">
                <select className="input">
                  {PURCHASE_ORDERS.filter((p) => role !== "supplier" || p.supplierId === identity.accountId).slice(0, 8).map((p) => (
                    <option key={p.id}>{p.id}</option>
                  ))}
                </select>
              </ModalField>
              <ModalField label="Transport mode">
                <select className="input"><option>Sea</option><option>Air</option><option>Road</option></select>
              </ModalField>
              <ModalField label="Units to book"><input type="number" className="input" placeholder="7,800" /></ModalField>
              <ModalField label="Cargo ready date"><input type="date" className="input" /></ModalField>
              <ModalField label="Requested ETD"><input type="date" className="input" /></ModalField>
            </div>
            <button onClick={reject} className="mt-3 text-[12px] font-semibold text-fuchsia-shade hover:underline">
              Demo: try an out-of-tolerance quantity →
            </button>
          </>
        ) : result.accepted ? (
          <div className="rounded-2xl border border-[#66b556]/40 bg-[#e8f5e0] p-4">
            <div className="flex items-center gap-2 text-[#356b2a]"><CheckCircle2 size={20} /> <span className="font-display text-[16px] font-bold">Booking confirmed</span></div>
            <div className="mt-2 text-[13px] text-ink">Rule check passed — <span className="font-mono font-semibold">{result.code}</span>.</div>
            <div className="mt-1 text-[12px] text-ink-muted">{result.message}</div>
            <div className="mt-3"><Pill tone="green">Reference {result.reference}</Pill></div>
          </div>
        ) : (
          <div className="rounded-2xl border border-fuchsia-10 bg-fuchsia-10/40 p-4">
            <div className="flex items-center gap-2 text-fuchsia-shade"><XCircle size={20} /> <span className="font-display text-[16px] font-bold">Booking rejected</span></div>
            <div className="mt-2 text-[13px] text-ink">Rule breached — <span className="font-mono font-semibold">{result.code}</span>.</div>
            <div className="mt-1 text-[12px] text-ink-muted">{result.message}</div>
            <div className="mt-3 text-[12px] font-semibold text-fuchsia-shade">Corrective action: reduce the booked quantity to within tolerance and resubmit.</div>
          </div>
        )}
      </Modal>

      {/* Rule-engine summary — real-time accept / reject */}
      <div className="horizon-panel mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-10 text-teal-shade"><Zap size={20} /></div>
          <div>
            <div className="text-[13px] font-semibold text-midnight">Rule engine — automatic decisions</div>
            <div className="text-[12px] text-ink-muted">Quantity tolerance · mode cut-off · handover window — evaluated on submission, reason code returned instantly.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="green">{list.filter((b) => b.status === "Confirmed").length} accepted</Pill>
          <Pill tone="fuchsia">{list.filter((b) => b.status === "Rejected").length} rejected</Pill>
          <Pill tone="teal">{autoRate}% auto-processed</Pill>
        </div>
      </div>

      <div className="horizon-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking</th>
                <th>PO</th>
                <th>Supplier</th>
                <th>Mode</th>
                <th>Cargo ready</th>
                <th>Units</th>
                <th>Status</th>
                <th>Rule decision</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => {
                const supplier = SUPPLIERS.find((s) => s.id === b.supplierId);
                return (
                  <tr key={b.id}>
                    <td className="font-semibold text-midnight">{b.id}</td>
                    <td><Link href={`/orders/${b.poId}`} className="text-teal-shade font-semibold">{b.poId}</Link></td>
                    <td>{supplier?.name}</td>
                    <td>{b.mode}</td>
                    <td>{formatDate(b.cargoReadyDate)}</td>
                    <td>{formatNumber(b.units)}</td>
                    <td><BookingStatusPill status={b.status} /></td>
                    <td className="max-w-[260px]">
                      {b.ruleCode ? (
                        <div>
                          <span className="font-mono text-[11px] font-semibold text-midnight">{b.ruleCode}</span>
                          {b.ruleMessage && <div className="text-[11px] text-ink-muted">{b.ruleMessage}</div>}
                        </div>
                      ) : (
                        <span className="text-[12px] text-ink-subtle">Awaiting validation</span>
                      )}
                    </td>
                    <td className="font-mono text-[12px]">{b.bookingReference ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
