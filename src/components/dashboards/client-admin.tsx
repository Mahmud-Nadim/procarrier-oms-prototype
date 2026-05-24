"use client";

import Link from "next/link";
import {
  ShoppingCart, AlertTriangle, Truck, Users, ArrowRight,
  TrendingUp, Globe, FileSpreadsheet, Activity, ChevronRight,
} from "lucide-react";
import { PageHeader, StatsCard, POStatusPill, Pill, SectionHeading, SeverityPill } from "@/components/ui";
import { PURCHASE_ORDERS, EXCEPTIONS, SUPPLIERS, NOTIFICATIONS, THIRD_PARTY_SHIPMENTS, CLIENTS } from "@/lib/seed";
import { formatCurrency, formatDate, formatNumber, relativeFromToday } from "@/lib/format";

export function ClientAdminDashboard() {
  const client = CLIENTS[0];

  const openPOs = PURCHASE_ORDERS.filter((p) => !["Delivered", "Cancelled"].includes(p.status));
  const inTransit = PURCHASE_ORDERS.filter((p) => p.status === "In Transit");
  const openExceptions = EXCEPTIONS.filter((e) => e.status === "Open");
  const pendingAcceptance = PURCHASE_ORDERS.filter((p) => p.status === "Pending Acceptance");
  const totalValueOpen = openPOs.reduce((sum, p) => sum + p.totalValue, 0);
  const totalUnitsOpen = openPOs.reduce((sum, p) => sum + p.totalUnits, 0);

  const recentPOs = [...PURCHASE_ORDERS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const supplierStats = SUPPLIERS.map((s) => {
    const sPOs = PURCHASE_ORDERS.filter((p) => p.supplierId === s.id);
    const sExceptions = EXCEPTIONS.filter((e) => sPOs.some((p) => p.id === e.poId) && e.status === "Open");
    const onTime = sPOs.filter((p) => p.exceptionsOpen === 0 && !["Pending Acceptance", "Draft", "Cancelled"].includes(p.status)).length;
    const total = sPOs.filter((p) => !["Pending Acceptance", "Draft", "Cancelled"].includes(p.status)).length;
    return {
      ...s,
      activePOs: sPOs.filter((p) => !["Delivered", "Cancelled"].includes(p.status)).length,
      openExceptions: sExceptions.length,
      compliance: total > 0 ? Math.round((onTime / total) * 100) : 100,
    };
  }).sort((a, b) => b.activePOs - a.activePOs);

  return (
    <>
      <PageHeader
        eyebrow={client.name}
        title="OMS Dashboard"
        subtitle="Order pipeline status, exception flags, and supplier compliance at a glance."
        trailing={
          <div className="flex flex-wrap gap-2">
            <Link href="/orders/new" className="btn-primary">
              <ShoppingCart size={16} /> New Purchase Order
            </Link>
            <button className="btn-ghost">
              <FileSpreadsheet size={16} /> Upload CSV
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard icon={<ShoppingCart size={22} />} label="Open Purchase Orders" value={openPOs.length} accent="#322a6d" subline={`${formatNumber(totalUnitsOpen)} units · ${formatCurrency(totalValueOpen)}`} />
        <StatsCard icon={<Truck size={22} />} label="In transit" value={inTransit.length} accent="#4bbbba" subline="Across 4 trade lanes" />
        <StatsCard icon={<AlertTriangle size={22} />} label="Open exceptions" value={openExceptions.length} accent="#e83271" subline={`${openExceptions.filter(e => e.severity === "high" || e.severity === "critical").length} high severity`} />
        <StatsCard icon={<Activity size={22} />} label="Awaiting acceptance" value={pendingAcceptance.length} accent="#f4990b" subline="Supplier action required" />
      </div>

      {/* Two-column main */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent POs */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading
            title="Recent purchase orders"
            subtitle="Latest activity across all suppliers and trade lanes"
            trailing={
              <Link href="/orders" className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-shade hover:underline">
                View all <ArrowRight size={14} />
              </Link>
            }
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-midnight-10/60">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PO</th>
                  <th>Supplier</th>
                  <th>Trade lane</th>
                  <th className="hidden md:table-cell">Cargo ready</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentPOs.map((po) => {
                  const supplier = SUPPLIERS.find((s) => s.id === po.supplierId);
                  return (
                    <tr key={po.id}>
                      <td>
                        <Link href={`/orders/${po.id}`} className="block">
                          <div className="font-semibold text-midnight">{po.id}</div>
                          <div className="text-[11px] text-ink-muted">{formatNumber(po.totalUnits)} units · {formatCurrency(po.totalValue)}</div>
                        </Link>
                      </td>
                      <td>
                        <div className="text-[13px] font-medium text-ink">{supplier?.name}</div>
                        <div className="text-[11px] text-ink-muted">{supplier?.country}</div>
                      </td>
                      <td>
                        <div className="text-[13px] text-ink">{po.originCountry} → UK</div>
                        <div className="text-[11px] text-ink-muted">{po.mode} · {po.channel}</div>
                      </td>
                      <td className="hidden md:table-cell">
                        <div className="text-[13px] text-ink">{formatDate(po.cargoReadyDate)}</div>
                        <div className="text-[11px] text-ink-muted">{relativeFromToday(po.cargoReadyDate)}</div>
                      </td>
                      <td><POStatusPill status={po.status} /></td>
                      <td>
                        <Link href={`/orders/${po.id}`} className="text-ink-muted hover:text-midnight">
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exception side panel */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading
            title="Active exceptions"
            subtitle="Surface before they become operational problems"
            trailing={<Link href="/exceptions" className="text-[13px] font-semibold text-fuchsia hover:underline">All</Link>}
          />
          <div className="mt-4 space-y-3">
            {openExceptions.slice(0, 5).map((e) => (
              <Link key={e.id} href={`/orders/${e.poId}`} className="block rounded-2xl border border-fuchsia-10 bg-fuchsia-10/40 p-3 transition hover:bg-fuchsia-10/70">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-fuchsia-shade">
                      {e.poId}
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-fuchsia-shade/80">{e.type}</div>
                    <div className="mt-1.5 text-[13px] text-ink line-clamp-2">{e.description}</div>
                  </div>
                  <SeverityPill severity={e.severity} />
                </div>
              </Link>
            ))}
            {openExceptions.length === 0 && (
              <div className="rounded-2xl bg-[#e8f5e0] p-4 text-[13px] font-medium text-[#356b2a]">All clear — no open exceptions.</div>
            )}
          </div>
        </div>
      </div>

      {/* Supplier compliance + Control Tower */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6 lg:col-span-2">
          <SectionHeading title="Supplier compliance" subtitle="On-time milestone delivery rolling 12 months" trailing={<Pill tone="teal">Last 90 days</Pill>} />
          <div className="mt-4 overflow-hidden rounded-2xl border border-midnight-10/60">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Country</th>
                  <th>Active POs</th>
                  <th>Open exceptions</th>
                  <th>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {supplierStats.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="font-semibold text-midnight">{s.name}</div>
                      <div className="text-[11px] text-ink-muted">{s.contact}</div>
                    </td>
                    <td className="text-[13px] text-ink">{s.country}</td>
                    <td><span className="font-bold text-midnight">{s.activePOs}</span></td>
                    <td>
                      {s.openExceptions === 0 ? (
                        <Pill tone="green">None</Pill>
                      ) : (
                        <Pill tone="fuchsia">{s.openExceptions}</Pill>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 max-w-[120px] overflow-hidden rounded-full bg-midnight-10">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.compliance}%`,
                              background: s.compliance >= 90 ? "#66b556" : s.compliance >= 75 ? "#f4990b" : "#e83271",
                            }}
                          />
                        </div>
                        <span className="text-[13px] font-semibold text-midnight">{s.compliance}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Control Tower preview */}
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading
            title="Control Tower"
            subtitle="Including 3rd-party forwarder shipments"
            trailing={<Link href="/control-tower" className="text-[13px] font-semibold text-teal-shade hover:underline">Open</Link>}
          />
          <div className="mt-4 space-y-3">
            {THIRD_PARTY_SHIPMENTS.slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-2xl border border-midnight-10/70 bg-white/60 p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-midnight">{s.carrier}</div>
                  <span className="rounded-full bg-lilac-10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-plum">3rd-party</span>
                </div>
                <div className="mt-1 text-[12px] text-ink-muted">MBL {s.mbl}</div>
                <div className="mt-2 flex items-center gap-2 text-[12px]">
                  <Globe size={12} className="text-teal" />
                  <span className="text-ink">{s.pol} → {s.pod}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-muted">
                  <span>ETD {formatDate(s.etd)}</span>
                  <span>ETA {formatDate(s.eta)}</span>
                </div>
                <div className="mt-2 text-[11px] font-semibold" style={{ color: s.status === "Delayed" ? "#e83271" : s.status === "On Schedule" ? "#356b2a" : "#322a6d" }}>
                  {s.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
      <div className="mt-8 horizon-panel rounded-3xl p-5 sm:p-6">
        <SectionHeading title="Recent activity" subtitle="Notifications across PO ingestion, bookings, and exceptions" />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {NOTIFICATIONS.map((n) => {
            const dot = n.type === "success" ? "#66b556" : n.type === "warning" ? "#f4990b" : n.type === "error" ? "#e83271" : "#4bbbba";
            return (
              <div key={n.id} className="flex items-start gap-3 rounded-2xl border border-midnight-10/60 bg-white/70 p-3.5">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: dot }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-midnight text-[13px]">{n.title}</span>
                    <span className="text-[10px] text-ink-subtle">{new Date(n.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="mt-0.5 text-[12px] text-ink-muted">{n.message}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
