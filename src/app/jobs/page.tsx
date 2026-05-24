"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader, POStatusPill, Pill } from "@/components/ui";
import { PURCHASE_ORDERS, SUPPLIERS } from "@/lib/seed";
import { useRole } from "@/lib/role-context";
import { formatDate, formatNumber, relativeFromToday } from "@/lib/format";

export default function JobsPage() {
  const { identity } = useRole();
  const list = PURCHASE_ORDERS.filter((p) => p.agentId === identity.accountId);

  return (
    <>
      <PageHeader
        title="My Jobs"
        subtitle={`${list.length} jobs across multiple Pro Carrier clients where you are the assigned origin agent`}
      />

      <div className="horizon-panel rounded-3xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>PO</th>
              <th>Supplier</th>
              <th>Origin</th>
              <th>Cargo ready</th>
              <th>Mode</th>
              <th>Units</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((po) => {
              const supplier = SUPPLIERS.find((s) => s.id === po.supplierId);
              return (
                <tr key={po.id} onClick={() => (window.location.href = `/orders/${po.id}`)}>
                  <td className="font-semibold text-midnight">{po.id}</td>
                  <td>
                    <div className="text-[13px] font-medium">{supplier?.name}</div>
                    <div className="text-[11px] text-ink-muted">{supplier?.country}</div>
                  </td>
                  <td>{po.origin}</td>
                  <td>
                    <div className="text-[13px]">{formatDate(po.cargoReadyDate)}</div>
                    <div className="text-[11px] text-ink-muted">{relativeFromToday(po.cargoReadyDate)}</div>
                  </td>
                  <td>{po.mode}</td>
                  <td>{formatNumber(po.totalUnits)}</td>
                  <td><POStatusPill status={po.status} /></td>
                  <td><ChevronRight size={16} className="text-ink-muted" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
