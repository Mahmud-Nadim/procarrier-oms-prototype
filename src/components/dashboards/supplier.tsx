"use client";

import Link from "next/link";
import {
  ShoppingCart, AlertTriangle, ArrowRight, ChevronRight, FileUp,
  Boxes, Calendar, MessageCircle, CheckCircle2,
} from "lucide-react";
import { PageHeader, StatsCard, POStatusPill, Pill, SectionHeading, MilestoneStatusPill, BookingStatusPill } from "@/components/ui";
import { PURCHASE_ORDERS, MILESTONES, EXCEPTIONS, SUPPLIERS, BOOKING_REQUESTS } from "@/lib/seed";
import { useRole } from "@/lib/role-context";
import { formatCurrency, formatDate, formatNumber, relativeFromToday } from "@/lib/format";

export function SupplierDashboard() {
  const { identity } = useRole();
  const supplier = SUPPLIERS.find((s) => s.id === identity.accountId)!;

  const myPOs = PURCHASE_ORDERS.filter((p) => p.supplierId === supplier.id);
  const open = myPOs.filter((p) => !["Delivered", "Cancelled"].includes(p.status));
  const pendingAcceptance = myPOs.filter((p) => p.status === "Pending Acceptance");
  const pendingMilestones = MILESTONES
    .filter((m) => myPOs.some((p) => p.id === m.poId))
    .filter((m) => m.owner === "Supplier" && (m.status === "Pending" || m.status === "Late"))
    .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));
  const myExceptions = EXCEPTIONS.filter((e) => myPOs.some((p) => p.id === e.poId) && e.status === "Open");

  const recentBookings = BOOKING_REQUESTS
    .filter((b) => b.supplierId === supplier.id)
    .slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow={supplier.name}
        title="Supplier Workspace"
        subtitle="Submit booking requests against open POs, upload documents, and confirm milestones."
        trailing={
          <div className="flex flex-wrap gap-2">
            <Link href="/orders" className="btn-primary">
              <Boxes size={16} /> Submit booking request
            </Link>
            <button className="btn-ghost">
              <FileUp size={16} /> Upload document
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={<ShoppingCart size={22} />} label="Open POs assigned to you" value={open.length} accent="#322a6d" />
        <StatsCard icon={<Calendar size={22} />} label="Awaiting your acceptance" value={pendingAcceptance.length} accent="#f4990b" subline="Confirm within 3 days" />
        <StatsCard icon={<CheckCircle2 size={22} />} label="Milestones owed by you" value={pendingMilestones.length} accent="#4bbbba" />
        <StatsCard icon={<AlertTriangle size={22} />} label="Open exceptions" value={myExceptions.length} accent="#e83271" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Pending acceptance */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading
            title="Awaiting your acceptance"
            subtitle="POs received that need confirmation within the SLA"
            trailing={<Link href="/orders" className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-shade hover:underline">All my POs <ArrowRight size={14} /></Link>}
          />
          <div className="mt-4 space-y-3">
            {pendingAcceptance.map((po) => (
              <Link key={po.id} href={`/orders/${po.id}`} className="block rounded-2xl border border-midnight-10/60 bg-white/70 p-4 transition hover:bg-white">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[16px] font-bold text-midnight">{po.id}</span>
                      <POStatusPill status={po.status} />
                    </div>
                    <div className="mt-1 text-[13px] text-ink">{po.totalUnits.toLocaleString()} units · {formatCurrency(po.totalValue)}</div>
                    <div className="mt-0.5 text-[12px] text-ink-muted">{po.lines.length} line{po.lines.length > 1 ? "s" : ""} · Cargo ready {formatDate(po.cargoReadyDate)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Pill tone="orange">Action required</Pill>
                    <button className="btn-primary py-1.5 px-4 text-[12px]">Accept order</button>
                  </div>
                </div>
              </Link>
            ))}
            {pendingAcceptance.length === 0 && (
              <div className="rounded-2xl bg-[#e8f5e0] p-4 text-[13px] font-medium text-[#356b2a]">All caught up — no POs awaiting acceptance.</div>
            )}
          </div>
        </div>

        {/* Milestones owed */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading
            title="Milestones owed by you"
            subtitle="Tick to confirm — backfills upstream automatically"
          />
          <div className="mt-4 space-y-2.5">
            {pendingMilestones.slice(0, 6).map((m) => (
              <Link key={m.id} href={`/orders/${m.poId}#milestones`} className="block rounded-2xl border border-midnight-10/60 bg-white/70 p-3 transition hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-midnight text-[13px]">{m.label}</div>
                  <MilestoneStatusPill status={m.status} />
                </div>
                <div className="mt-1 text-[11px] text-ink-muted">{m.poId} · expected {formatDate(m.expectedDate)} ({relativeFromToday(m.expectedDate)})</div>
              </Link>
            ))}
            {pendingMilestones.length === 0 && (
              <div className="rounded-2xl bg-[#e8f5e0] p-3 text-[12px] font-medium text-[#356b2a]">No outstanding milestones.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent bookings + exception inbox */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading
            title="Recent bookings"
            subtitle="Submitted by you against your assigned POs"
            trailing={<Link href="/bookings" className="text-[13px] font-semibold text-teal-shade hover:underline">View all</Link>}
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-midnight-10/60">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking</th>
                  <th>PO</th>
                  <th>Mode</th>
                  <th className="hidden md:table-cell">Cargo ready</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td><span className="font-semibold text-midnight">{b.id}</span></td>
                    <td><Link href={`/orders/${b.poId}`} className="text-teal-shade font-semibold">{b.poId}</Link></td>
                    <td>{b.mode}</td>
                    <td className="hidden md:table-cell">{formatDate(b.cargoReadyDate)}</td>
                    <td>{formatNumber(b.units)}</td>
                    <td><BookingStatusPill status={b.status} /></td>
                    <td><ChevronRight size={16} className="text-ink-muted" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Exception inbox" subtitle="Mark as read to acknowledge" />
          <div className="mt-4 space-y-3">
            {myExceptions.length === 0 ? (
              <div className="rounded-2xl bg-[#e8f5e0] p-3 text-[12px] font-medium text-[#356b2a]">No open exceptions.</div>
            ) : (
              myExceptions.map((e) => (
                <div key={e.id} className="rounded-2xl border border-fuchsia-10 bg-fuchsia-10/40 p-3">
                  <div className="flex items-center justify-between">
                    <Link href={`/orders/${e.poId}`} className="font-semibold text-fuchsia-shade text-[12px]">{e.poId}</Link>
                    <button className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-shade hover:bg-fuchsia-10">
                      Mark as read
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-fuchsia-shade/80">{e.type}</div>
                  <div className="mt-1.5 text-[12px] text-ink">{e.description}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
