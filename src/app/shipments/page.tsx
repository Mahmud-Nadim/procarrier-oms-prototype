"use client";

import Link from "next/link";
import { Truck, ChevronRight } from "lucide-react";
import { PageHeader, POStatusPill, Pill, SectionHeading } from "@/components/ui";
import { PURCHASE_ORDERS, SUPPLIERS } from "@/lib/seed";
import { formatDate } from "@/lib/format";

export default function ShipmentsPage() {
  const shipments = PURCHASE_ORDERS.filter((p) => p.shipmentId);

  return (
    <>
      <PageHeader
        title="Shipments"
        subtitle="POs that have been handed over to Neurored TMS"
      />

      <div className="horizon-panel rounded-3xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shipment</th>
              <th>PO</th>
              <th>Supplier</th>
              <th>Trade lane</th>
              <th>Mode</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((p) => {
              const supplier = SUPPLIERS.find((s) => s.id === p.supplierId);
              return (
                <tr key={p.id} onClick={() => (window.location.href = `/orders/${p.id}`)}>
                  <td className="font-mono text-[12px] font-semibold text-midnight">{p.shipmentId}</td>
                  <td><span className="font-semibold text-teal-shade">{p.id}</span></td>
                  <td>{supplier?.name}</td>
                  <td>{p.originCountry} → UK</td>
                  <td>{p.mode}</td>
                  <td>{formatDate(p.cargoReadyDate)}</td>
                  <td>{formatDate(p.deliveryRequiredDate)}</td>
                  <td><POStatusPill status={p.status} /></td>
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
