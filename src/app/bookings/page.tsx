"use client";

import Link from "next/link";
import { Boxes, Plus } from "lucide-react";
import { PageHeader, BookingStatusPill, Pill, SectionHeading } from "@/components/ui";
import { BOOKING_REQUESTS, SUPPLIERS, PURCHASE_ORDERS } from "@/lib/seed";
import { formatDate, formatNumber } from "@/lib/format";
import { useRole } from "@/lib/role-context";

export default function BookingsPage() {
  const { role, identity } = useRole();
  let list = BOOKING_REQUESTS;
  if (role === "supplier") list = list.filter((b) => b.supplierId === identity.accountId);

  return (
    <>
      <PageHeader
        title="Bookings"
        subtitle="Booking requests submitted by suppliers, evaluated against client rule engine"
        trailing={role === "supplier" ? <button className="btn-primary"><Plus size={16} /> Submit booking</button> : null}
      />

      <div className="horizon-panel rounded-3xl overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>PO</th>
              <th>Supplier</th>
              <th>Mode</th>
              <th>Cargo ready</th>
              <th>Units</th>
              <th>Status</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => {
              const po = PURCHASE_ORDERS.find((p) => p.id === b.poId);
              const supplier = SUPPLIERS.find((s) => s.id === b.supplierId);
              return (
                <tr key={b.id}>
                  <td className="font-semibold text-midnight">{b.id}</td>
                  <td><Link href={`/orders/${b.poId}`} className="text-teal-shade font-semibold">{b.poId}</Link></td>
                  <td>{supplier?.name}</td>
                  <td>{b.mode}</td>
                  <td>{formatDate(b.cargoReadyDate)}</td>
                  <td>{formatNumber(b.units)}</td>
                  <td><BookingStatusPill status={b.status} /></td>
                  <td className="font-mono text-[12px]">{b.bookingReference ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
