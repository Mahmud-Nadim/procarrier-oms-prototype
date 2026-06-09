"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Package, MapPin, Truck, Calendar, FileText, Activity,
  AlertTriangle, Compass, FileSpreadsheet, History, Boxes, MessageSquare,
  CheckCircle2, X, Download, Upload,
} from "lucide-react";
import {
  PURCHASE_ORDERS, milestonesForPO, exceptionsForPO, bookingForPO,
  SUPPLIERS, AGENTS,
} from "@/lib/seed";
import { PageHeader, POStatusPill, Pill, SeverityPill, BookingStatusPill, SectionHeading } from "@/components/ui";
import { Modal, ModalField } from "@/components/modal";
import { CriticalPathView } from "@/components/critical-path-view";
import { formatCurrency, formatDate, formatDateTime, formatNumber, relativeFromToday } from "@/lib/format";
import { useRole } from "@/lib/role-context";

import type { LucideIcon } from "lucide-react";
type Tab = "overview" | "lines" | "critical-path" | "exceptions" | "documents" | "activity";
const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: Package },
  { id: "lines", label: "PO Lines", icon: Boxes },
  { id: "critical-path", label: "Critical Path", icon: Compass },
  { id: "exceptions", label: "Exceptions", icon: AlertTriangle },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "activity", label: "Activity", icon: History },
];

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const po = PURCHASE_ORDERS.find((p) => p.id === id);
  if (!po) return notFound();
  const milestones = milestonesForPO(po.id);
  const exceptions = exceptionsForPO(po.id);
  const booking = bookingForPO(po.id);
  const supplier = SUPPLIERS.find((s) => s.id === po.supplierId);
  const agent = AGENTS.find((a) => a.id === po.agentId);
  const { role } = useRole();
  const [tab, setTab] = useState<Tab>("overview");
  const [readExc, setReadExc] = useState<Set<string>>(new Set());
  const [cancelOpen, setCancelOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      <Link href="/orders" className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted hover:text-midnight">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        size="sm"
        title={`Cancel ${po.id}?`}
        subtitle="Cancelling reconciles against any active booking and is recorded with full version history."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setCancelOpen(false)}>Keep PO</button>
            <button className="btn-primary bg-fuchsia" style={{ background: "#e83271" }} onClick={() => setCancelOpen(false)}><X size={16} /> Cancel PO</button>
          </>
        }
      >
        <div className="rounded-xl bg-[#fce9f0] p-3 text-[12px] text-[#7e133a]">
          {booking
            ? `This PO has booking ${booking.bookingReference ?? "(pending)"}. Cancelling will flag the booking for review to avoid dead freight.`
            : "No active booking — this PO can be cancelled cleanly."}
        </div>
        <div className="mt-3">
          <label className="label">Reason (recorded on the version history)</label>
          <select className="input mt-1"><option>Order withdrawn by client</option><option>Duplicate PO</option><option>Replaced by amendment</option><option>Supplier unable to fulfil</option></select>
        </div>
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload a document"
        subtitle="Packing lists, QC reports, certificates, and commercial invoices — relevant to this PO. Suppliers and agents can upload too."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setUploadOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => setUploadOpen(false)}><Upload size={16} /> Upload</button>
          </>
        }
      >
        <div className="rounded-2xl border border-dashed border-midnight-25 p-6 text-center text-[13px] text-ink-muted">
          Drag &amp; drop a PDF here, or click to browse.
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ModalField label="Document type">
            <select className="input"><option>Packing List</option><option>QC Report</option><option>Certificate</option><option>Commercial Invoice</option><option>Other</option></select>
          </ModalField>
          <ModalField label="Reference / name"><input className="input" placeholder="Packing list — PO lines 1–4" /></ModalField>
        </div>
      </Modal>

      <div className="horizon-panel rounded-3xl p-5 sm:p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-[28px] font-bold text-midnight sm:text-[32px]">{po.id}</h1>
              <POStatusPill status={po.status} />
              <Pill tone="muted">v{po.version}</Pill>
              <Pill tone="teal">{po.channel}</Pill>
              {po.exceptionsOpen > 0 && <Pill tone="fuchsia">{po.exceptionsOpen} open exception{po.exceptionsOpen > 1 ? "s" : ""}</Pill>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-ink-muted">
              <span className="flex items-center gap-1"><MapPin size={13} /> {po.origin} → {po.destination}</span>
              <span className="text-ink-subtle">·</span>
              <span className="flex items-center gap-1"><Truck size={13} /> {po.mode}</span>
              <span className="text-ink-subtle">·</span>
              <span className="flex items-center gap-1"><Calendar size={13} /> Cargo ready {formatDate(po.cargoReadyDate)}</span>
              <span className="text-ink-subtle">·</span>
              <span>Created {formatDate(po.createdAt)}</span>
            </div>
          </div>
          {(role === "client-admin" || role === "ops") && (
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost"><FileSpreadsheet size={16} /> Amend</button>
              <button className="btn-ghost text-fuchsia-shade" onClick={() => setCancelOpen(true)}><X size={16} /> Cancel</button>
              <button className="btn-primary"><Download size={16} /> Export</button>
            </div>
          )}
          {role === "supplier" && po.status === "Pending Acceptance" && (
            <button className="btn-primary"><CheckCircle2 size={16} /> Accept order</button>
          )}
        </div>

        {/* Sub-stats */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SubStat label="Total units" value={formatNumber(po.totalUnits)} accent="#322a6d" />
          <SubStat label="PO value" value={formatCurrency(po.totalValue)} accent="#4bbbba" />
          <SubStat label="Cargo ready" value={formatDate(po.cargoReadyDate)} subline={relativeFromToday(po.cargoReadyDate)} accent="#f4990b" />
          <SubStat label="Delivery required" value={formatDate(po.deliveryRequiredDate)} subline={relativeFromToday(po.deliveryRequiredDate)} accent="#e83271" />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto border-t border-midnight-10/50 pt-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition ${
                  tab === t.id ? "bg-gradient-to-r from-teal to-midnight text-white shadow-soft" : "text-ink-muted hover:bg-midnight-10/40"
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Parties */}
          <div className="horizon-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading title="Parties" />
            <div className="mt-4 space-y-4">
              <PartyRow role="Client" name="Northbridge Publishing Group" sub="London, UK" />
              <PartyRow role="Supplier" name={supplier?.name ?? ""} sub={`${supplier?.country} · ${supplier?.contact}`} />
              {agent && <PartyRow role="Origin agent" name={agent.name} sub={`${agent.country} · ${agent.contact}`} />}
              <PartyRow role="Forwarder" name="Pro Carrier Logistics" sub="London, UK" />
            </div>
          </div>

          {/* Booking + Notes */}
          <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2 space-y-5">
            <div>
              <SectionHeading title="Booking" />
              {booking ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <SubStat label="Booking ref" value={booking.bookingReference ?? "—"} accent="#322a6d" />
                  <SubStat label="Cargo ready" value={formatDate(booking.cargoReadyDate)} accent="#4bbbba" />
                  <SubStat label="Status" value={booking.status} accent="#66b556" />
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-orange/30 bg-[#fff5e0] p-4 text-[13px] text-[#7a5800]">
                  No booking submitted yet. {po.status === "Pending Acceptance" && "Supplier must accept the PO before submitting a booking request."}
                </div>
              )}
            </div>

            {exceptions.length > 0 && (
              <div>
                <SectionHeading title="Exceptions" subtitle="Mark as read or annotate from here" />
                <div className="mt-3 space-y-2.5">
                  {exceptions.map((e) => (
                    <div key={e.id} className="rounded-2xl border border-fuchsia-10 bg-fuchsia-10/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold uppercase tracking-wider text-fuchsia-shade">{e.type}</span>
                          <SeverityPill severity={e.severity} />
                          <Pill tone={e.status === "Open" ? "fuchsia" : e.status === "Acknowledged" ? "orange" : "green"}>{e.status}</Pill>
                        </div>
                        <button className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-shade hover:bg-fuchsia-10">
                          Mark as read
                        </button>
                      </div>
                      <div className="mt-2 text-[13px] text-ink">{e.description}</div>
                      <div className="mt-1.5 text-[11px] text-ink-muted">Raised {formatDateTime(e.raisedAt)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {po.notes && (
              <div>
                <SectionHeading title="Notes" />
                <div className="mt-3 rounded-2xl bg-midnight-10/40 p-3 text-[13px] text-ink">{po.notes}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "lines" && (
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Purchase order lines" subtitle="SKU-level data resolved against the Product Master" />
          <div className="mt-4 overflow-x-auto rounded-2xl border border-midnight-10/60">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Product code</th>
                  <th>Description</th>
                  <th className="hidden md:table-cell">Size / Colour</th>
                  <th>Ordered</th>
                  <th>Booked</th>
                  <th>Shipped</th>
                  <th className="hidden lg:table-cell">Unit price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {po.lines.map((l) => (
                  <tr key={l.id}>
                    <td className="font-semibold text-midnight">{l.id}</td>
                    <td>
                      <div className="text-[13px] font-semibold text-midnight">{l.productCode}</div>
                      {!l.matched && <Pill tone="orange">Unmatched · ops review</Pill>}
                    </td>
                    <td className="text-[13px] text-ink">{l.description}</td>
                    <td className="hidden md:table-cell text-[12px] text-ink-muted">{l.size ?? "—"}{l.colour ? ` · ${l.colour}` : ""}</td>
                    <td className="font-semibold">{formatNumber(l.quantityOrdered)}</td>
                    <td>{formatNumber(l.quantityBooked)}</td>
                    <td>{formatNumber(l.quantityShipped)}</td>
                    <td className="hidden lg:table-cell">{formatCurrency(l.unitPrice * l.quantityOrdered, l.currency)}</td>
                    <td><Pill tone={l.status === "Closed" ? "green" : l.status === "Pending Match" ? "orange" : l.status === "Shipped" ? "teal" : "midnight"}>{l.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "critical-path" && (
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading
            title="Critical path"
            subtitle="Anchor + uplift driven. Edit any milestone to rebuild the downstream chain."
            trailing={<Pill tone="teal">Trade lane: {po.originCountry} → UK · {po.mode}</Pill>}
          />
          <div className="mt-4">
            <CriticalPathView milestones={milestones} poId={po.id} canEdit={role !== "client-admin"} />
          </div>
        </div>
      )}

      {tab === "exceptions" && (
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading
            title="Exceptions"
            subtitle="Raised only when a change impacts the next milestone. Acknowledge with mark-as-read — chat is not available at PO level at launch."
            trailing={<Pill tone={exceptions.length ? "fuchsia" : "green"}>{exceptions.length} total</Pill>}
          />
          {exceptions.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-[#e8f5e0] p-4 text-[13px] font-medium text-[#356b2a]">No exceptions on this order — every milestone is within its buffer.</div>
          ) : (
            <div className="mt-4 space-y-3">
              {exceptions.map((e) => {
                const linked = milestones.find((m) => m.exceptionId === e.id);
                const read = readExc.has(e.id);
                return (
                  <div key={e.id} className="grid gap-3 rounded-2xl border border-midnight-10/60 bg-white/70 p-4 md:grid-cols-2">
                    {/* Left — what changed (timeline-style) */}
                    <div className="md:border-r md:border-midnight-10/50 md:pr-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">What changed</div>
                      {linked ? (
                        <div className="mt-1.5">
                          <div className="font-semibold text-midnight text-[13px]">{linked.label}</div>
                          <div className="mt-1 text-[12px] text-ink-muted">
                            Expected {formatDate(linked.expectedDate)}{linked.actualDate ? ` → actual ${formatDate(linked.actualDate)}` : ""}
                          </div>
                          <div className="mt-1"><Pill tone="muted">Owner: {linked.owner}</Pill></div>
                        </div>
                      ) : (
                        <div className="mt-1.5 text-[12px] text-ink-muted">Order-level exception</div>
                      )}
                    </div>
                    {/* Right — the exception */}
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold uppercase tracking-wider text-fuchsia-shade">{e.type}</span>
                          <SeverityPill severity={e.severity} />
                          <Pill tone={e.status === "Open" ? "fuchsia" : e.status === "Acknowledged" ? "orange" : "green"}>{e.status}</Pill>
                        </div>
                        {read ? (
                          <Pill tone="green">Read</Pill>
                        ) : (
                          <button onClick={() => setReadExc(new Set(readExc).add(e.id))} className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-shade hover:bg-fuchsia-10">
                            Mark as read
                          </button>
                        )}
                      </div>
                      <div className="mt-2 text-[13px] text-ink">{e.description}</div>
                      <div className="mt-1.5 text-[11px] text-ink-muted">Raised {formatDateTime(e.raisedAt)} · owner {e.ownerRole}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "documents" && (
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Documents" trailing={<button className="btn-primary" onClick={() => setUploadOpen(true)}><Upload size={14} /> Upload</button>} />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {po.documents.length === 0 && (
              <div className="rounded-2xl border border-dashed border-midnight-25 p-6 text-center text-[13px] text-ink-muted">
                No documents uploaded yet.
              </div>
            )}
            {po.documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-10 text-teal-shade">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-midnight text-[13px] truncate">{d.name}</div>
                  <div className="text-[11px] text-ink-muted">{d.type} · {d.size}</div>
                  <div className="text-[11px] text-ink-subtle">Uploaded by {d.uploadedBy} · {formatDate(d.uploadedAt.slice(0, 10))}</div>
                </div>
                <button className="rounded-xl border border-midnight-10 p-2 text-ink hover:bg-white"><Download size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="horizon-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading title="PO version history" subtitle="Every amend and cancel retained for reconciliation" />
            <div className="mt-4 space-y-3">
              {po.versions.map((v) => (
                <div key={v.version} className="flex gap-3 rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-midnight text-white font-bold text-[12px]">v{v.version}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-midnight text-[13px]">{v.changeSummary}</div>
                    <div className="mt-0.5 text-[11px] text-ink-muted">{v.changedBy} · via {v.channel}</div>
                    <div className="mt-0.5 text-[11px] text-ink-subtle">{formatDate(v.date)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="horizon-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading title="Milestone activity log" subtitle="All milestone events in one stream" />
            <div className="mt-4 space-y-3">
              {milestones.flatMap((m) => m.history.map((h) => ({ ...h, milestone: m.label })))
                .sort((a, b) => b.at.localeCompare(a.at))
                .slice(0, 12)
                .map((h) => (
                  <div key={h.id} className="flex gap-3 text-[12px]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-midnight">{h.milestone}</span>
                        <span className="text-[11px] text-ink-subtle">{new Date(h.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="text-ink-muted">{h.note}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SubStat({ label, value, subline, accent }: { label: string; value: string; subline?: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-[18px] font-bold text-midnight" style={{ color: accent }}>{value}</div>
      {subline && <div className="mt-0.5 text-[11px] text-ink-muted">{subline}</div>}
    </div>
  );
}

function PartyRow({ role, name, sub }: { role: string; name: string; sub: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{role}</div>
      <div className="mt-1 font-semibold text-midnight">{name}</div>
      <div className="text-[12px] text-ink-muted">{sub}</div>
    </div>
  );
}
