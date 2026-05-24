"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ShoppingCart, FileSpreadsheet, FileCode2, ChevronRight } from "lucide-react";
import { PageHeader, POStatusPill, Pill, SectionHeading } from "@/components/ui";
import { PURCHASE_ORDERS, SUPPLIERS } from "@/lib/seed";
import { POStatus, TransportMode } from "@/lib/types";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { useRole } from "@/lib/role-context";

const STATUS_FILTERS: { label: string; value: POStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending Acceptance", value: "Pending Acceptance" },
  { label: "Accepted", value: "Accepted" },
  { label: "Booked", value: "Booked" },
  { label: "In Transit", value: "In Transit" },
  { label: "Delivered", value: "Delivered" },
  { label: "Exception", value: "Exception" },
];
const MODE_FILTERS: ("all" | TransportMode)[] = ["all", "Sea", "Air", "Road"];

export default function OrdersPage() {
  const { role, identity } = useRole();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<POStatus | "all">("all");
  const [mode, setMode] = useState<"all" | TransportMode>("all");

  const scoped = useMemo(() => {
    let list = PURCHASE_ORDERS;
    if (role === "supplier") list = list.filter((p) => p.supplierId === identity.accountId);
    if (role === "agent") list = list.filter((p) => p.agentId === identity.accountId);
    return list;
  }, [role, identity]);

  const filtered = useMemo(() => {
    return scoped.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (mode !== "all" && p.mode !== mode) return false;
      if (q) {
        const lower = q.toLowerCase();
        const supplier = SUPPLIERS.find((s) => s.id === p.supplierId);
        return (
          p.id.toLowerCase().includes(lower) ||
          supplier?.name.toLowerCase().includes(lower) ||
          p.origin.toLowerCase().includes(lower)
        );
      }
      return true;
    });
  }, [scoped, q, status, mode]);

  return (
    <>
      <PageHeader
        title="Purchase Orders"
        subtitle={`${filtered.length} of ${scoped.length} orders ${role === "supplier" ? "assigned to you" : role === "agent" ? "where you are origin agent" : ""}`}
        trailing={
          role === "client-admin" || role === "ops" ? (
            <div className="flex flex-wrap gap-2">
              <Link href="/orders/new" className="btn-primary"><ShoppingCart size={16} /> New PO</Link>
              <button className="btn-ghost"><FileSpreadsheet size={16} /> Upload CSV</button>
              <button className="btn-ghost"><FileCode2 size={16} /> Upload XML</button>
            </div>
          ) : null
        }
      />

      {/* Filters */}
      <div className="horizon-panel rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative max-w-md flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search PO, supplier, origin…"
              className="w-full rounded-2xl border border-midnight-10 bg-white/70 py-2.5 pl-10 pr-4 text-sm focus:border-teal focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                  status === f.value
                    ? "bg-gradient-to-r from-teal to-midnight text-white shadow-soft"
                    : "border border-midnight-10 bg-white/70 text-ink hover:bg-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Mode:</span>
          {MODE_FILTERS.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                mode === m ? "bg-midnight text-white" : "border border-midnight-10 bg-white/70 text-ink"
              }`}
            >
              {m === "all" ? "All" : m}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 horizon-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>PO</th>
                <th>Supplier</th>
                <th className="hidden md:table-cell">Trade lane</th>
                <th>Cargo ready</th>
                <th className="hidden lg:table-cell">Delivery req.</th>
                <th>Units</th>
                <th className="hidden xl:table-cell">Value</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((po) => {
                const supplier = SUPPLIERS.find((s) => s.id === po.supplierId);
                return (
                  <tr key={po.id} onClick={() => (window.location.href = `/orders/${po.id}`)}>
                    <td>
                      <div className="font-semibold text-midnight">{po.id}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Pill tone="muted">v{po.version}</Pill>
                        <Pill tone="teal">{po.channel}</Pill>
                        {po.exceptionsOpen > 0 && <Pill tone="fuchsia">{po.exceptionsOpen} exc.</Pill>}
                      </div>
                    </td>
                    <td>
                      <div className="text-[13px] font-medium text-ink">{supplier?.name}</div>
                      <div className="text-[11px] text-ink-muted">{supplier?.country}</div>
                    </td>
                    <td className="hidden md:table-cell">
                      <div className="text-[13px] text-ink">{po.originCountry} → UK</div>
                      <div className="text-[11px] text-ink-muted">{po.mode}</div>
                    </td>
                    <td className="text-[13px]">{formatDate(po.cargoReadyDate)}</td>
                    <td className="hidden lg:table-cell text-[13px]">{formatDate(po.deliveryRequiredDate)}</td>
                    <td className="text-[13px] font-semibold">{formatNumber(po.totalUnits)}</td>
                    <td className="hidden xl:table-cell text-[13px]">{formatCurrency(po.totalValue)}</td>
                    <td><POStatusPill status={po.status} /></td>
                    <td><ChevronRight size={16} className="text-ink-muted" /></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-ink-muted py-10">No purchase orders match these filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[rgba(50,42,109,0.08)] bg-[#fafafb] px-4 py-3">
          <span className="text-[12px] text-ink-muted">
            Showing <span className="font-semibold text-midnight">{filtered.length}</span> of {scoped.length} orders
          </span>
          <div className="flex items-center gap-2 text-[12px] text-ink-muted">
            <span className="font-semibold text-midnight">{formatNumber(filtered.reduce((s, p) => s + p.totalUnits, 0))}</span> total units ·
            <span className="font-semibold text-midnight">{formatCurrency(filtered.reduce((s, p) => s + p.totalValue, 0))}</span> value
          </div>
        </div>
      </div>
    </>
  );
}
