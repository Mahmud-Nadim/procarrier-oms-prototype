"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Download, ClipboardCheck, CheckCircle2, XCircle, Clock, BellRing } from "lucide-react";
import { PageHeader, BookingStatusPill, Pill, SectionHeading } from "@/components/ui";
import { Modal, ModalField } from "@/components/modal";
import { BOOKING_REQUESTS, SUPPLIERS, PURCHASE_ORDERS } from "@/lib/seed";
import { formatDate, formatDateTime, formatNumber } from "@/lib/format";
import { useRole } from "@/lib/role-context";
import { BookingRequest, TransportMode } from "@/lib/types";

export default function BookingsPage() {
  const { role, identity } = useRole();
  const [requests, setRequests] = useState<BookingRequest[]>(BOOKING_REQUESTS);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss the notification toast.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const canRequest = role === "supplier" || role === "agent";

  // Scope the visible requests. Suppliers/agents see only their own; PC Ops and
  // client-admin see everything (client-admin read-only).
  const list = requests.filter((b) => {
    if (role === "supplier") return b.supplierId === identity.accountId;
    if (role === "agent") return PURCHASE_ORDERS.find((p) => p.id === b.poId)?.agentId === identity.accountId;
    return true;
  });

  const counts = {
    pending: list.filter((b) => b.status === "Pending").length,
    confirmed: list.filter((b) => b.status === "Confirmed").length,
    rejected: list.filter((b) => b.status === "Rejected").length,
  };

  // ---- Submit a new request (supplier / agent) ----------------------------
  const selectablePOs = PURCHASE_ORDERS.filter((p) => {
    if (role === "supplier") return p.supplierId === identity.accountId;
    if (role === "agent") return p.agentId === identity.accountId;
    return true;
  });

  const [submitOpen, setSubmitOpen] = useState(false);
  const [formPo, setFormPo] = useState("");
  const [formMode, setFormMode] = useState<TransportMode>("Sea");
  const [formUnits, setFormUnits] = useState("");
  const [formCargoReady, setFormCargoReady] = useState("");

  const selectedPO = PURCHASE_ORDERS.find((p) => p.id === formPo);

  const openSubmit = () => {
    const first = selectablePOs[0];
    setFormPo(first?.id ?? "");
    setFormMode(first?.mode ?? "Sea");
    setFormUnits(first ? String(first.totalUnits) : "");
    setFormCargoReady(first?.cargoReadyDate ?? "");
    setSubmitOpen(true);
  };

  const onPoChange = (id: string) => {
    setFormPo(id);
    const po = PURCHASE_ORDERS.find((p) => p.id === id);
    if (po) {
      setFormMode(po.mode);
      setFormUnits(String(po.totalUnits));
      setFormCargoReady(po.cargoReadyDate);
    }
  };

  const submitRequest = () => {
    if (!selectedPO) return;
    const newReq: BookingRequest = {
      id: `BR-${selectedPO.id.slice(3)}-${Math.floor(Math.random() * 900 + 100)}`,
      poId: selectedPO.id,
      supplierId: role === "supplier" ? identity.accountId : selectedPO.supplierId,
      requestedByRole: role === "agent" ? "Agent" : "Supplier",
      requestedDate: new Date().toISOString().slice(0, 10),
      cargoReadyDate: formCargoReady || selectedPO.cargoReadyDate,
      mode: formMode,
      units: Number(formUnits) || selectedPO.totalUnits,
      poQuantityOrdered: selectedPO.totalUnits,
      status: "Pending",
    };
    setRequests((prev) => [newReq, ...prev]);
    setSubmitOpen(false);
    setToast(`Booking request ${newReq.id} submitted — awaiting Pro Carrier Ops approval.`);
  };

  // ---- PC Ops decisions ---------------------------------------------------
  const approve = (b: BookingRequest) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === b.id
          ? {
              ...r,
              status: "Confirmed",
              decidedByRole: "Pro Carrier Ops",
              decidedBy: identity.name,
              decidedAt: new Date().toISOString(),
              rejectionReason: undefined,
              bookingReference: `BK-${r.poId.slice(3)}-01`,
            }
          : r,
      ),
    );
    setToast(`${b.id} approved — booking reference assigned and confirmed.`);
  };

  const [rejectTarget, setRejectTarget] = useState<BookingRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const openReject = (b: BookingRequest) => {
    setRejectReason("");
    setRejectTarget(b);
  };

  const confirmReject = () => {
    if (!rejectTarget) return;
    const target = rejectTarget;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === target.id
          ? {
              ...r,
              status: "Rejected",
              decidedByRole: "Pro Carrier Ops",
              decidedBy: identity.name,
              decidedAt: new Date().toISOString(),
              bookingReference: undefined,
              rejectionReason: rejectReason.trim() || "Rejected by Pro Carrier Ops.",
            }
          : r,
      ),
    );
    const supplierName = SUPPLIERS.find((s) => s.id === target.supplierId)?.name ?? "the supplier";
    setToast(`${target.id} rejected — notification sent to ${supplierName}.`);
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Booking requests raised by suppliers and origin agents, reviewed and manually approved by Pro Carrier Ops before confirmation."
        trailing={
          <div className="flex flex-wrap gap-2">
            {canRequest && (
              <button className="btn-primary" onClick={openSubmit}>
                <Plus size={16} /> Submit booking request
              </button>
            )}
            {(role === "client-admin" || role === "ops") && (
              <button className="btn-ghost">
                <Download size={16} /> Export CSV
              </button>
            )}
          </div>
        }
      />

      {/* Manual-approval summary — reviewed by Pro Carrier Ops */}
      <div className="horizon-panel mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-10 text-teal-shade">
            <ClipboardCheck size={20} />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-midnight">Manual approval by Pro Carrier Ops</div>
            <div className="text-[12px] text-ink-muted">
              Each request is reviewed by hand — approved to confirm and assign a reference, or rejected with a reason sent to the supplier.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="orange">{counts.pending} pending</Pill>
          <Pill tone="green">{counts.confirmed} confirmed</Pill>
          <Pill tone="fuchsia">{counts.rejected} rejected</Pill>
        </div>
      </div>

      <div className="mb-4">
        <SectionHeading
          title="Booking requests"
          subtitle={
            role === "ops"
              ? "Review pending requests — check ordered vs booked quantity, then approve or reject."
              : role === "client-admin"
                ? "Read-only view of all supplier and agent booking requests."
                : "Your submitted booking requests and their approval status."
          }
        />
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
                <th>Ordered</th>
                <th>Booked</th>
                <th>Status</th>
                <th>Decision</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-[13px] text-ink-subtle">
                    No booking requests yet.
                  </td>
                </tr>
              )}
              {list.map((b) => {
                const supplier = SUPPLIERS.find((s) => s.id === b.supplierId);
                const mismatch = b.units !== b.poQuantityOrdered;
                const delta = b.units - b.poQuantityOrdered;
                return (
                  <tr key={b.id}>
                    <td className="font-semibold text-midnight">{b.id}</td>
                    <td>
                      <Link href={`/orders/${b.poId}`} className="text-teal-shade font-semibold">
                        {b.poId}
                      </Link>
                    </td>
                    <td>{supplier?.name}</td>
                    <td>{b.mode}</td>
                    <td>{formatDate(b.cargoReadyDate)}</td>
                    <td className="tabular-nums">{formatNumber(b.poQuantityOrdered)}</td>
                    <td className="tabular-nums">
                      {mismatch ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="font-semibold text-fuchsia-shade">{formatNumber(b.units)}</span>
                          <Pill tone="fuchsia">
                            {delta > 0 ? "+" : "−"}
                            {formatNumber(Math.abs(delta))}
                          </Pill>
                        </span>
                      ) : (
                        formatNumber(b.units)
                      )}
                    </td>
                    <td>
                      <BookingStatusPill status={b.status} />
                    </td>
                    <td className="max-w-[280px]">
                      {b.status === "Pending" ? (
                        role === "ops" ? (
                          <div className="flex items-center gap-2">
                            <button
                              className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e0] px-2.5 py-1 text-[11px] font-semibold text-[#356b2a] hover:brightness-95"
                              onClick={() => approve(b)}
                            >
                              <CheckCircle2 size={13} /> Approve
                            </button>
                            <button
                              className="inline-flex items-center gap-1 rounded-full bg-fuchsia-10 px-2.5 py-1 text-[11px] font-semibold text-fuchsia-shade hover:brightness-95"
                              onClick={() => openReject(b)}
                            >
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted">
                            <Clock size={13} /> Awaiting Pro Carrier Ops
                          </span>
                        )
                      ) : b.status === "Rejected" ? (
                        <div>
                          <div className="text-[12px] font-semibold text-fuchsia-shade">Rejected</div>
                          {b.rejectionReason && <div className="text-[11px] text-ink-muted">{b.rejectionReason}</div>}
                          {b.decidedBy && (
                            <div className="text-[11px] text-ink-subtle">
                              {b.decidedBy} · {formatDateTime(b.decidedAt)}
                            </div>
                          )}
                        </div>
                      ) : b.decidedBy ? (
                        <div className="text-[12px]">
                          <div className="font-semibold text-midnight">{b.decidedBy}</div>
                          <div className="text-[11px] text-ink-subtle">
                            {b.decidedByRole} · {formatDateTime(b.decidedAt)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px] text-ink-subtle">—</span>
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

      {/* Submit booking request (supplier / agent) */}
      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="Submit a booking request"
        subtitle="Your request is raised as Pending and sent to Pro Carrier Ops for manual approval."
        size="lg"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setSubmitOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={submitRequest} disabled={!selectedPO}>
              <Plus size={16} /> Submit request
            </button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ModalField label="Purchase order">
            <select className="input" value={formPo} onChange={(e) => onPoChange(e.target.value)}>
              {selectablePOs.slice(0, 12).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </ModalField>
          <ModalField label="Transport mode">
            <select className="input" value={formMode} onChange={(e) => setFormMode(e.target.value as TransportMode)}>
              <option>Sea</option>
              <option>Air</option>
              <option>Road</option>
            </select>
          </ModalField>
          <ModalField label="Units to book">
            <input type="number" className="input" value={formUnits} onChange={(e) => setFormUnits(e.target.value)} placeholder="7,800" />
          </ModalField>
          <ModalField label="Cargo ready date">
            <input type="date" className="input" value={formCargoReady} onChange={(e) => setFormCargoReady(e.target.value)} />
          </ModalField>
        </div>
        {selectedPO && (
          <div className="mt-3 text-[12px] text-ink-muted">
            PO ordered quantity: <span className="font-semibold text-midnight">{formatNumber(selectedPO.totalUnits)}</span> units.
            {Number(formUnits) !== selectedPO.totalUnits && formUnits !== "" && (
              <span className="ml-1 font-semibold text-fuchsia-shade">
                Booked differs by {formatNumber(Math.abs(Number(formUnits) - selectedPO.totalUnits))} — Pro Carrier Ops will see this on review.
              </span>
            )}
          </div>
        )}
      </Modal>

      {/* Reject with reason (PC Ops) */}
      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject booking request"
        subtitle={
          rejectTarget
            ? `${rejectTarget.id} · ${rejectTarget.poId} — the supplier will be notified of this decision.`
            : undefined
        }
        size="sm"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-xl bg-fuchsia-shade px-3.5 py-2 text-[13px] font-semibold text-white hover:brightness-110"
              onClick={confirmReject}
            >
              <XCircle size={16} /> Reject &amp; notify supplier
            </button>
          </>
        }
      >
        <ModalField label="Reason for rejection">
          <textarea
            className="input min-h-[96px]"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Cargo ready date is after the required delivery window — please rebook earlier."
          />
        </ModalField>
      </Modal>

      {/* Notification toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] flex max-w-sm items-center gap-2.5 rounded-2xl border border-teal-10 bg-white px-4 py-3 text-[13px] font-medium text-midnight shadow-elevated">
          <BellRing size={18} className="shrink-0 text-teal-shade" />
          {toast}
        </div>
      )}
    </>
  );
}
