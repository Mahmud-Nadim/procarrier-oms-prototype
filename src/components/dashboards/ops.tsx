"use client";

import Link from "next/link";
import {
  ShoppingCart, Users, AlertTriangle, FileSpreadsheet, ArrowRight, Globe, Activity, Truck,
} from "lucide-react";
import { PageHeader, StatsCard, POStatusPill, SeverityPill, SectionHeading, Pill } from "@/components/ui";
import { PURCHASE_ORDERS, EXCEPTIONS, SUPPLIERS, AGENTS, BOOKING_RULES, BOOKING_REQUESTS } from "@/lib/seed";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";

export function OpsDashboard() {
  const open = PURCHASE_ORDERS.filter((p) => !["Delivered", "Cancelled"].includes(p.status));
  const openExc = EXCEPTIONS.filter((e) => e.status === "Open");
  const unmatched = PURCHASE_ORDERS.flatMap((p) =>
    p.lines.filter((l) => !l.matched).map((l) => ({ poId: p.id, line: l }))
  );

  const channelBreakdown = ["API", "EDI", "CSV", "XML", "Portal"].map((c) => ({
    channel: c,
    count: PURCHASE_ORDERS.filter((p) => p.channel === c).length,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Pro Carrier Operations"
        title="Operations Console"
        subtitle="Full visibility across all client OMS data — booking rules, exceptions, ingestion health, and account management."
        trailing={
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/rules" className="btn-primary"><FileSpreadsheet size={16} /> Manage rules</Link>
            <Link href="/admin/accounts" className="btn-ghost"><Users size={16} /> Accounts</Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={<ShoppingCart size={22} />} label="Open POs across portfolio" value={open.length} accent="#322a6d" subline={`${formatCurrency(open.reduce((s, p) => s + p.totalValue, 0))} value`} />
        <StatsCard icon={<AlertTriangle size={22} />} label="Open exceptions" value={openExc.length} accent="#e83271" subline={`${openExc.filter((e) => e.severity === "high").length} high severity`} />
        <StatsCard icon={<Activity size={22} />} label="Unmatched product lines" value={unmatched.length} accent="#f4990b" subline="Awaiting Product Master review" />
        <StatsCard icon={<Truck size={22} />} label="Bookings confirmed (30d)" value={BOOKING_REQUESTS.filter((b) => b.status === "Confirmed").length} accent="#4bbbba" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Ingestion health */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Ingestion channels" subtitle="POs received in the last 30 days" />
          <div className="mt-4 space-y-2.5">
            {channelBreakdown.map((c) => (
              <div key={c.channel} className="flex items-center gap-3">
                <div className="w-16 text-[12px] font-semibold uppercase tracking-wider text-midnight">{c.channel}</div>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-midnight-10">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(8, (c.count / Math.max(1, PURCHASE_ORDERS.length)) * 100)}%`,
                      background: "linear-gradient(90deg, #4bbbba, #322a6d)",
                    }}
                  />
                </div>
                <div className="w-8 text-right text-[13px] font-bold text-midnight">{c.count}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-fuchsia-10/40 p-3 text-[12px] text-fuchsia-shade">
            <span className="font-bold">EDI: dropped from launch.</span> Architecture stub retained for future client trigger.
          </div>
        </div>

        {/* Top exceptions */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading
            title="Open exceptions"
            subtitle="Annotate, assign follow-ups, and resolve"
            trailing={<Link href="/exceptions" className="inline-flex items-center gap-1 text-[13px] font-semibold text-fuchsia hover:underline">All exceptions <ArrowRight size={14} /></Link>}
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-midnight-10/60">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th className="hidden md:table-cell">Raised</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {openExc.map((e) => (
                  <tr key={e.id}>
                    <td><Link href={`/orders/${e.poId}`} className="font-semibold text-teal-shade">{e.poId}</Link></td>
                    <td className="text-[13px] text-ink">{e.type}</td>
                    <td><SeverityPill severity={e.severity} /></td>
                    <td className="hidden md:table-cell text-[12px] text-ink-muted">{formatDate(e.raisedAt.slice(0, 10))}</td>
                    <td className="text-[13px] text-ink">{e.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Account management + Active rules */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Supplier & Agent accounts" subtitle="Centrally managed by Pro Carrier ops" trailing={<Link href="/admin/accounts" className="text-[13px] font-semibold text-teal-shade hover:underline">Manage</Link>} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-midnight-10/60 bg-white/70 p-4">
              <div className="text-[12px] font-bold uppercase tracking-wider text-teal-shade">Suppliers</div>
              <div className="mt-1 font-display text-[28px] font-bold text-midnight">{SUPPLIERS.length}</div>
              <div className="mt-2 space-y-1 text-[12px] text-ink-muted">
                {SUPPLIERS.slice(0, 4).map((s) => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span>{s.name}</span>
                    <span className="text-ink-subtle">{s.country}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-midnight-10/60 bg-white/70 p-4">
              <div className="text-[12px] font-bold uppercase tracking-wider text-plum">Origin agents</div>
              <div className="mt-1 font-display text-[28px] font-bold text-midnight">{AGENTS.length}</div>
              <div className="mt-2 space-y-1 text-[12px] text-ink-muted">
                {AGENTS.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <span>{a.name}</span>
                    <span className="text-ink-subtle">{a.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Active booking rules" subtitle="Northbridge Publishing Group" trailing={<Link href="/admin/rules" className="text-[13px] font-semibold text-teal-shade hover:underline">Configure</Link>} />
          <div className="mt-4 space-y-2.5">
            {BOOKING_RULES.map((r) => (
              <div key={r.id} className="rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-midnight text-[13px]">{r.name}</div>
                    <div className="mt-0.5 text-[11px] text-ink-muted">{r.description}</div>
                  </div>
                  <Pill tone={r.active ? "green" : "muted"}>{r.active ? "Active" : "Inactive"}</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
