"use client";

import Link from "next/link";
import {
  ShoppingCart, AlertTriangle, ArrowRight, ChevronRight, FileUp,
  Boxes, Calendar, CheckCircle2, FilePlus2, Users,
} from "lucide-react";
import { PageHeader, StatsCard, POStatusPill, Pill, SectionHeading, MilestoneStatusPill, BookingStatusPill } from "@/components/ui";
import { PURCHASE_ORDERS, MILESTONES, EXCEPTIONS, BOOKING_REQUESTS, AGENTS } from "@/lib/seed";
import { useRole } from "@/lib/role-context";
import { formatCurrency, formatDate, formatNumber, relativeFromToday } from "@/lib/format";

export function AgentDashboard() {
  const { identity } = useRole();
  const agent = AGENTS.find((a) => a.id === identity.accountId)!;

  // The origin agent is a proxy for the supplier and shares the same workspace:
  // it can create POs, view PO lines, submit bookings, and update the open
  // (unassigned) critical-path milestones. Scoped to jobs assigned to this agent.
  const myPOs = PURCHASE_ORDERS.filter((p) => p.agentId === agent.id);
  const open = myPOs.filter((p) => !["Delivered", "Cancelled"].includes(p.status));
  const pendingAcceptance = myPOs.filter((p) => p.status === "Pending Acceptance");
  // Milestones are OPEN — not tied to a party — so we surface every outstanding
  // step on the agent's POs, whether nominally owned by supplier or agent.
  const openMilestones = MILESTONES
    .filter((m) => myPOs.some((p) => p.id === m.poId))
    .filter((m) => m.status === "Pending" || m.status === "Late")
    .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));
  const myExceptions = EXCEPTIONS.filter((e) => myPOs.some((p) => p.id === e.poId) && e.status === "Open");

  const recentBookings = BOOKING_REQUESTS
    .filter((b) => myPOs.some((p) => p.id === b.poId))
    .slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow={agent.name}
        title="Origin Agent Workspace"
        subtitle="Acting on the supplier's behalf: create POs, submit booking requests, and keep the critical path up to date across your client portfolio."
        trailing={
          <div className="flex flex-wrap gap-2">
            <Link href="/orders/new" className="btn-primary">
              <FilePlus2 size={16} /> Create PO
            </Link>
            <Link href="/orders" className="btn-ghost">
              <Boxes size={16} /> Submit booking request
            </Link>
            <button className="btn-ghost"><FileUp size={16} /> Bulk milestone CSV</button>
          </div>
        }
      />

      {/* Shared-workspace note */}
      <div className="horizon-panel mb-5 flex items-start gap-3 rounded-3xl p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-10 text-teal-shade"><Users size={18} /></div>
        <div className="text-[12px] text-ink-muted">
          <span className="font-semibold text-midnight">Supplier and Origin Agent share the same workspace</span> — the agent acts on the supplier&apos;s behalf with identical capabilities (create PO, view PO lines, submit bookings, update the critical path). Milestones are <span className="font-semibold text-midnight">open</span>: either the supplier or the agent can update them.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={<ShoppingCart size={22} />} label="Open POs (your jobs)" value={open.length} accent="#322a6d" subline={`${myPOs.filter((p) => p.originCountry === agent.country).length} from ${agent.country}`} />
        <StatsCard icon={<Calendar size={22} />} label="Awaiting acceptance" value={pendingAcceptance.length} accent="#f4990b" subline="Confirm within 3 days" />
        <StatsCard icon={<CheckCircle2 size={22} />} label="Open milestones" value={openMilestones.length} accent="#4bbbba" />
        <StatsCard icon={<AlertTriangle size={22} />} label="Open exceptions" value={myExceptions.length} accent="#e83271" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Assigned POs + lines */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading
            title="Assigned POs"
            subtitle="Jobs where you are the origin agent — open a PO to view lines and submit a booking"
            trailing={<Link href="/orders" className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-shade hover:underline">All POs <ArrowRight size={14} /></Link>}
          />
          <div className="mt-4 space-y-3">
            {open.map((po) => (
              <Link key={po.id} href={`/orders/${po.id}`} className="block rounded-2xl border border-midnight-10/60 bg-white/70 p-4 transition hover:bg-white">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[16px] font-bold text-midnight">{po.id}</span>
                      <POStatusPill status={po.status} />
                    </div>
                    <div className="mt-1 text-[13px] text-ink">{formatNumber(po.totalUnits)} units · {formatCurrency(po.totalValue)}</div>
                    <div className="mt-0.5 text-[12px] text-ink-muted">{po.lines.length} line{po.lines.length > 1 ? "s" : ""} · {po.origin} · Cargo ready {formatDate(po.cargoReadyDate)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {po.status === "Pending Acceptance" ? <Pill tone="orange">Action required</Pill> : <Pill tone="teal">{po.mode}</Pill>}
                    <span className="text-[12px] font-semibold text-teal-shade">View lines &amp; book →</span>
                  </div>
                </div>
              </Link>
            ))}
            {open.length === 0 && (
              <div className="rounded-2xl bg-[#e8f5e0] p-4 text-[13px] font-medium text-[#356b2a]">No open jobs assigned to you.</div>
            )}
          </div>
        </div>

        {/* Open critical-path milestones */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading
            title="Open critical-path milestones"
            subtitle="Either party may confirm — tick to update"
          />
          <div className="mt-4 space-y-2.5">
            {openMilestones.slice(0, 8).map((m) => (
              <Link key={m.id} href={`/orders/${m.poId}#milestones`} className="block rounded-2xl border border-midnight-10/60 bg-white/70 p-3 transition hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-midnight text-[13px]">{m.label}</div>
                  <MilestoneStatusPill status={m.status} />
                </div>
                <div className="mt-1 text-[11px] text-ink-muted">{m.poId} · expected {formatDate(m.expectedDate)} ({relativeFromToday(m.expectedDate)})</div>
              </Link>
            ))}
            {openMilestones.length === 0 && (
              <div className="rounded-2xl bg-[#e8f5e0] p-3 text-[12px] font-medium text-[#356b2a]">All milestones up to date.</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent bookings + exception inbox */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading
            title="Recent bookings"
            subtitle="Submitted on the supplier's behalf against your assigned POs"
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
