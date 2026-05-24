"use client";

import Link from "next/link";
import { ClipboardList, AlertTriangle, FileUp, ArrowRight, Truck, MapPin } from "lucide-react";
import { PageHeader, StatsCard, POStatusPill, Pill, SectionHeading, MilestoneStatusPill } from "@/components/ui";
import { PURCHASE_ORDERS, MILESTONES, EXCEPTIONS, AGENTS } from "@/lib/seed";
import { useRole } from "@/lib/role-context";
import { formatDate, formatNumber, relativeFromToday } from "@/lib/format";

export function AgentDashboard() {
  const { identity } = useRole();
  const agent = AGENTS.find((a) => a.id === identity.accountId)!;

  // Agents see all POs assigned to them across multiple clients
  const myPOs = PURCHASE_ORDERS.filter((p) => p.agentId === agent.id);
  const active = myPOs.filter((p) => !["Delivered", "Cancelled", "Draft"].includes(p.status));
  const pendingMilestones = MILESTONES
    .filter((m) => myPOs.some((p) => p.id === m.poId))
    .filter((m) => m.owner === "Agent" && (m.status === "Pending" || m.status === "Late"))
    .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));
  const myExceptions = EXCEPTIONS.filter((e) => myPOs.some((p) => p.id === e.poId) && e.status === "Open");

  return (
    <>
      <PageHeader
        eyebrow={agent.name}
        title="Origin Agent Workspace"
        subtitle="All assigned jobs across your client portfolio. Update milestones, upload documents, resolve exceptions."
        trailing={
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary"><FileUp size={16} /> Bulk milestone CSV</button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={<ClipboardList size={22} />} label="Active jobs" value={active.length} accent="#322a6d" subline={`${myPOs.filter((p) => p.originCountry === agent.country).length} from ${agent.country}`} />
        <StatsCard icon={<MapPin size={22} />} label="Milestones owed" value={pendingMilestones.length} accent="#4bbbba" />
        <StatsCard icon={<Truck size={22} />} label="In transit" value={myPOs.filter((p) => p.status === "In Transit").length} accent="#66b556" />
        <StatsCard icon={<AlertTriangle size={22} />} label="Open exceptions" value={myExceptions.length} accent="#e83271" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading
            title="Assigned jobs"
            subtitle="All shipments where you are the origin agent"
            trailing={<Link href="/jobs" className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-shade hover:underline">View all <ArrowRight size={14} /></Link>}
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-midnight-10/60">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO</th>
                  <th>Origin</th>
                  <th className="hidden md:table-cell">Cargo ready</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {active.map((po) => (
                  <tr key={po.id}>
                    <td>
                      <Link href={`/orders/${po.id}`}>
                        <div className="font-semibold text-midnight">{po.id}</div>
                        <div className="text-[11px] text-ink-muted">{formatNumber(po.totalUnits)} units</div>
                      </Link>
                    </td>
                    <td>
                      <div className="text-[13px] text-ink">{po.origin}</div>
                      <div className="text-[11px] text-ink-muted">{po.originCountry}</div>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="text-[13px] text-ink">{formatDate(po.cargoReadyDate)}</div>
                      <div className="text-[11px] text-ink-muted">{relativeFromToday(po.cargoReadyDate)}</div>
                    </td>
                    <td>{po.mode}</td>
                    <td><POStatusPill status={po.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Milestones owed by you" />
          <div className="mt-4 space-y-2.5">
            {pendingMilestones.slice(0, 8).map((m) => (
              <Link key={m.id} href={`/orders/${m.poId}#milestones`} className="block rounded-2xl border border-midnight-10/60 bg-white/70 p-3 transition hover:bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-midnight text-[13px]">{m.label}</div>
                  <MilestoneStatusPill status={m.status} />
                </div>
                <div className="mt-1 text-[11px] text-ink-muted">{m.poId} · expected {formatDate(m.expectedDate)} ({relativeFromToday(m.expectedDate)})</div>
              </Link>
            ))}
            {pendingMilestones.length === 0 && (
              <div className="rounded-2xl bg-[#e8f5e0] p-3 text-[12px] font-medium text-[#356b2a]">All milestones up to date.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
