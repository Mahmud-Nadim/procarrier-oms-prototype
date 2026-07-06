"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { PURCHASE_ORDERS, EXCEPTIONS, SUPPLIERS, MILESTONES, BOOKING_REQUESTS } from "@/lib/seed";
import { formatCurrency } from "@/lib/format";
import { PurchaseOrder } from "@/lib/types";

// -----------------------------------------------------------------
// Supplier compliance (launch definition, Jul 2026)
//  • Compliance = booking acceptance only — a binary accept/reject per booking.
//  • On-time = PO's cargo-ready (or delivery-required) actual within 3 days of
//    the original committed date. Milestone-based compliance scoring is removed.
// -----------------------------------------------------------------
const ON_TIME_TOLERANCE_DAYS = 3;
const MEASURABLE_STATUSES = ["Booked", "In Transit", "Delivered", "Exception"];

function daysApart(a: string, b: string) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;
}

function poIsOnTime(p: PurchaseOrder): boolean {
  const ms = MILESTONES.filter((m) => m.poId === p.id);
  // A breached critical path or an open exception fails the on-time test.
  const breached =
    ms.some((m) => m.status === "Late" || m.status === "Missed") ||
    EXCEPTIONS.some((e) => e.poId === p.id && e.status === "Open");
  if (breached) return false;
  const cargo = ms.find((m) => m.type === "CargoReady");
  const delivery = ms.find((m) => m.type === "Delivery");
  if (cargo?.actualDate) return daysApart(cargo.actualDate, p.cargoReadyDate) <= ON_TIME_TOLERANCE_DAYS;
  if (delivery?.actualDate) return daysApart(delivery.actualDate, p.deliveryRequiredDate) <= ON_TIME_TOLERANCE_DAYS;
  return true;
}

function pct(numerator: number, denominator: number) {
  return denominator ? Math.round((numerator / denominator) * 100) : 100;
}

const MODE_COLORS = { Sea: "#322a6d", Air: "#4bbbba", Road: "#9681ba" };
const STATUS_COLORS: Record<string, string> = {
  "Pending Acceptance": "#f4990b", Accepted: "#a5dddc", Booked: "#4bbbba",
  "In Transit": "#322a6d", Delivered: "#66b556", Cancelled: "#9894b6", Exception: "#e83271",
};

export default function AnalyticsPage() {
  const monthlyData = [
    { month: "Dec", orders: 14, exceptions: 2 },
    { month: "Jan", orders: 18, exceptions: 4 },
    { month: "Feb", orders: 22, exceptions: 3 },
    { month: "Mar", orders: 26, exceptions: 5 },
    { month: "Apr", orders: 24, exceptions: 4 },
    { month: "May", orders: PURCHASE_ORDERS.length, exceptions: EXCEPTIONS.length },
  ];

  const modeBreakdown = ["Sea", "Air", "Road"].map((m) => ({
    name: m,
    value: PURCHASE_ORDERS.filter((p) => p.mode === m).length,
    fill: MODE_COLORS[m as keyof typeof MODE_COLORS],
  }));

  const statusBreakdown = Object.keys(STATUS_COLORS).map((s) => ({
    status: s,
    count: PURCHASE_ORDERS.filter((p) => p.status === s).length,
    fill: STATUS_COLORS[s],
  })).filter((x) => x.count > 0);

  const supplierVolume = SUPPLIERS.map((s) => ({
    supplier: s.name.split(" ").slice(0, 2).join(" "),
    units: PURCHASE_ORDERS.filter((p) => p.supplierId === s.id).reduce((sum, p) => sum + p.totalUnits, 0),
  })).filter((x) => x.units > 0).sort((a, b) => b.units - a.units);

  const totalValue = PURCHASE_ORDERS.reduce((s, p) => s + p.totalValue, 0);

  // --- Supplier compliance: booking acceptance (accepted vs rejected) ---
  const acceptedBookings = BOOKING_REQUESTS.filter((b) => b.status === "Confirmed");
  const rejectedBookings = BOOKING_REQUESTS.filter((b) => b.status === "Rejected");
  // Booking-rule breaches recorded as exceptions also count as a rejection at launch.
  const bookingRejections = rejectedBookings.length + EXCEPTIONS.filter((e) => /booking/i.test(e.type)).length;
  const decidedBookings = acceptedBookings.length + bookingRejections;
  const acceptancePct = pct(acceptedBookings.length, decidedBookings);

  // --- On-time: within 3 days of the original cargo-ready / delivery date ---
  const measurablePOs = PURCHASE_ORDERS.filter((p) => MEASURABLE_STATUSES.includes(p.status));
  const onTimeCount = measurablePOs.filter(poIsOnTime).length;
  const onTimePct = pct(onTimeCount, measurablePOs.length);

  // --- High-level breakdown by supplier ---
  const supplierCompliance = SUPPLIERS.map((s) => {
    const bookings = BOOKING_REQUESTS.filter((b) => b.supplierId === s.id);
    const accepted = bookings.filter((b) => b.status === "Confirmed").length;
    const decided = accepted + bookings.filter((b) => b.status === "Rejected").length +
      EXCEPTIONS.filter((e) => /booking/i.test(e.type) && PURCHASE_ORDERS.some((p) => p.id === e.poId && p.supplierId === s.id)).length;
    const measurable = PURCHASE_ORDERS.filter((p) => p.supplierId === s.id && MEASURABLE_STATUSES.includes(p.status));
    return {
      name: s.name.split(" ").slice(0, 2).join(" "),
      poCount: PURCHASE_ORDERS.filter((p) => p.supplierId === s.id).length,
      accepted,
      decided,
      acceptance: pct(accepted, decided),
      onTime: pct(measurable.filter(poIsOnTime).length, measurable.length),
    };
  }).filter((x) => x.poCount > 0).sort((a, b) => b.poCount - a.poCount);

  return (
    <>
      <PageHeader
        title="OMS Analytics"
        subtitle="Launch-level PC-Ops reporting — order pipeline, booking acceptance, and on-time performance by supplier, client, and origin agent"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <KPI label="Total POs (12mo)" value={String(PURCHASE_ORDERS.length + 104)} delta="+18%" accent="#322a6d" />
        <KPI label="PO value (12mo)" value={formatCurrency(totalValue + 880000)} delta="+15%" accent="#66b556" />
        <KPI label="Booking acceptance" value={`${acceptancePct}%`} delta={`${acceptedBookings.length}/${decidedBookings} accepted`} accent="#4bbbba" />
        <KPI label="On-time (±3 days)" value={`${onTimePct}%`} delta={`${onTimeCount}/${measurablePOs.length} POs`} accent="#e83271" />
      </div>

      {/* Supplier compliance — booking acceptance + on-time */}
      <div className="horizon-panel rounded-3xl p-5 sm:p-6 mb-6">
        <SectionHeading
          title="Supplier compliance"
          subtitle="Compliance = booking acceptance (accepted vs rejected). On-time = actual within 3 days of the original cargo-ready / delivery-required date."
          trailing={<Pill tone="teal">Launch view</Pill>}
        />
        <div className="mt-4 overflow-hidden rounded-2xl border border-midnight-10/60">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>POs</th>
                <th>Bookings accepted</th>
                <th>Booking acceptance</th>
                <th>On-time (±3 days)</th>
              </tr>
            </thead>
            <tbody>
              {supplierCompliance.map((s) => (
                <tr key={s.name}>
                  <td className="font-semibold text-midnight">{s.name}</td>
                  <td>{s.poCount}</td>
                  <td>{s.accepted}/{s.decided}</td>
                  <td><CompliancePct value={s.acceptance} /></td>
                  <td><CompliancePct value={s.onTime} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-ink-muted">The same breakdown is available by client and by origin agent — booking-rule automation stays off at launch, so every booking is manually approved by PC Ops.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Order pipeline" subtitle="Monthly orders and exception trend" trailing={<Pill tone="teal">Last 6 months</Pill>} />
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eae9f0" />
                <XAxis dataKey="month" stroke="#767676" fontSize={12} />
                <YAxis stroke="#767676" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eae9f0", boxShadow: "0 12px 28px rgba(50,42,109,0.12)" }} />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#322a6d" strokeWidth={2.5} dot={{ fill: "#322a6d", r: 4 }} />
                <Line type="monotone" dataKey="exceptions" stroke="#e83271" strokeWidth={2.5} dot={{ fill: "#e83271", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Mode mix" subtitle="Active POs by transport mode" />
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modeBreakdown} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} label>
                  {modeBreakdown.map((m, i) => <Cell key={i} fill={m.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eae9f0" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Status distribution" />
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eae9f0" />
                <XAxis dataKey="status" stroke="#767676" fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis stroke="#767676" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eae9f0" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusBreakdown.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5 sm:p-6">
          <SectionHeading title="Supplier volume" subtitle="Total units by supplier" />
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierVolume} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eae9f0" horizontal={false} />
                <XAxis type="number" stroke="#767676" fontSize={11} />
                <YAxis type="category" dataKey="supplier" stroke="#767676" fontSize={11} width={110} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #eae9f0" }} />
                <Bar dataKey="units" radius={[0, 6, 6, 0]} fill="#4bbbba" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function CompliancePct({ value }: { value: number }) {
  const tone = value >= 90 ? "green" : value >= 75 ? "orange" : "fuchsia";
  return <Pill tone={tone as "green" | "orange" | "fuchsia"}>{value}%</Pill>;
}

function KPI({ label, value, delta, accent }: { label: string; value: string; delta: string; accent: string }) {
  return (
    <div className="horizon-panel rounded-3xl p-5" style={{ borderBottom: `3px solid ${accent}` }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-2 font-display text-[26px] font-bold text-midnight">{value}</div>
      <div className="mt-1 text-[12px] font-semibold" style={{ color: accent }}>{delta} vs last period</div>
    </div>
  );
}
