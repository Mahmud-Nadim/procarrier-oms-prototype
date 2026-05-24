"use client";

import Link from "next/link";
import { Compass, Calendar } from "lucide-react";
import { PageHeader, MilestoneStatusPill, Pill, SectionHeading } from "@/components/ui";
import { MILESTONES, PURCHASE_ORDERS, SUPPLIERS } from "@/lib/seed";
import { formatDate, relativeFromToday } from "@/lib/format";
import { useRole } from "@/lib/role-context";

export default function CriticalPathPage() {
  const { role, identity } = useRole();

  const scopedPOs = PURCHASE_ORDERS.filter((p) => {
    if (role === "supplier") return p.supplierId === identity.accountId;
    if (role === "agent") return p.agentId === identity.accountId;
    return true;
  });

  const upcomingMilestones = MILESTONES
    .filter((m) => scopedPOs.some((p) => p.id === m.poId))
    .filter((m) => m.status === "Pending" || m.status === "Late")
    .sort((a, b) => a.expectedDate.localeCompare(b.expectedDate))
    .slice(0, 25);

  return (
    <>
      <PageHeader
        title="Critical Path"
        subtitle="Upcoming milestones across all your active purchase orders"
      />

      <div className="horizon-panel rounded-3xl p-5 sm:p-6">
        <SectionHeading title="Upcoming milestones" subtitle={`${upcomingMilestones.length} in flight`} trailing={<Pill tone="teal">Sorted by expected date</Pill>} />
        <div className="mt-4 space-y-2.5">
          {upcomingMilestones.map((m) => {
            const po = PURCHASE_ORDERS.find((p) => p.id === m.poId);
            const supplier = SUPPLIERS.find((s) => s.id === po?.supplierId);
            return (
              <Link key={m.id} href={`/orders/${m.poId}`} className="block rounded-2xl border border-midnight-10/60 bg-white/70 p-4 transition hover:bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-10 text-teal-shade">
                      <Compass size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-midnight">{m.label}</span>
                        <Pill tone="muted">Step {m.sequence}</Pill>
                        <MilestoneStatusPill status={m.status} />
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-muted">{m.poId} · {supplier?.name} · Owner: {m.owner}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-[12px] text-ink-muted">
                      <Calendar size={12} /> Expected
                    </div>
                    <div className="font-semibold text-midnight">{formatDate(m.expectedDate)}</div>
                    <div className="text-[11px] text-ink-muted">{relativeFromToday(m.expectedDate)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
