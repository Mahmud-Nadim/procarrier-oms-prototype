"use client";

import { Globe, Plus, Anchor, Plane, Package, MapPin } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { THIRD_PARTY_SHIPMENTS, PURCHASE_ORDERS } from "@/lib/seed";
import { formatDate } from "@/lib/format";

export default function ControlTowerPage() {
  const proCarrierShipments = PURCHASE_ORDERS.filter((p) => p.shipmentId).slice(0, 6);

  return (
    <>
      <PageHeader
        eyebrow="Single-source supply chain visibility"
        title="Control Tower"
        subtitle="Pro Carrier shipments alongside third-party forwarder movements — clearly tagged, never blended."
        trailing={
          <button className="btn-primary"><Plus size={16} /> Add 3rd-party shipment</button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <ControlTile icon={<Anchor size={22} />} label="Pro Carrier — sea" value={proCarrierShipments.filter((p) => p.mode === "Sea").length} accent="#322a6d" />
        <ControlTile icon={<Plane size={22} />} label="Pro Carrier — air" value={proCarrierShipments.filter((p) => p.mode === "Air").length} accent="#4bbbba" />
        <ControlTile icon={<Globe size={22} />} label="3rd-party shipments" value={THIRD_PARTY_SHIPMENTS.length} accent="#9681ba" />
        <ControlTile icon={<Package size={22} />} label="Containers tracked" value={THIRD_PARTY_SHIPMENTS.reduce((s, t) => s + t.containers.length, 0)} accent="#f4990b" />
      </div>

      <div className="horizon-panel rounded-3xl p-5 sm:p-6">
        <SectionHeading title="Third-party shipments" subtitle="Auto-enriched via OceanIO and TrackingMore" trailing={<Pill tone="teal">Live tracking</Pill>} />
        <div className="mt-4 overflow-x-auto rounded-2xl border border-midnight-10/60">
          <table className="data-table">
            <thead>
              <tr>
                <th>Shipment</th>
                <th>Carrier</th>
                <th>MBL</th>
                <th>Container(s)</th>
                <th>POL → POD</th>
                <th>ETD</th>
                <th>ETA</th>
                <th>Status</th>
                <th>Last event</th>
              </tr>
            </thead>
            <tbody>
              {THIRD_PARTY_SHIPMENTS.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="font-semibold text-midnight">{s.id}</div>
                    <Pill tone="muted">3rd-party</Pill>
                  </td>
                  <td>
                    <div className="text-[13px] font-semibold text-ink">{s.carrier}</div>
                    <div className="text-[11px] text-ink-muted">SCAC {s.scac}</div>
                  </td>
                  <td className="font-mono text-[12px]">{s.mbl}</td>
                  <td className="font-mono text-[11px] text-ink-muted">{s.containers.join(", ")}</td>
                  <td>
                    <div className="text-[13px] text-ink">{s.pol}</div>
                    <div className="text-[11px] text-ink-muted">→ {s.pod}</div>
                  </td>
                  <td className="text-[13px]">{formatDate(s.etd)}</td>
                  <td className="text-[13px]">{formatDate(s.eta)}</td>
                  <td>
                    <Pill tone={s.status === "Delayed" ? "fuchsia" : s.status === "On Schedule" ? "green" : s.status === "Arrived" ? "teal" : "midnight"}>
                      {s.status}
                    </Pill>
                  </td>
                  <td className="text-[12px] text-ink-muted max-w-xs">{s.lastEvent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ControlTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div className="horizon-panel rounded-3xl p-5" style={{ borderBottom: `3px solid ${accent}` }}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${accent}1f`, color: accent }}>
          {icon}
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</div>
          <div className="font-display text-[24px] font-bold text-midnight">{value}</div>
        </div>
      </div>
    </div>
  );
}
