"use client";

import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { PURCHASE_ORDERS, EXCEPTIONS, SUPPLIERS } from "@/lib/seed";
import { formatCurrency, formatNumber } from "@/lib/format";

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
  const totalUnits = PURCHASE_ORDERS.reduce((s, p) => s + p.totalUnits, 0);

  return (
    <>
      <PageHeader
        title="OMS Analytics"
        subtitle="Order pipeline, exception trends, and supplier performance over time"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <KPI label="Total POs (12mo)" value={String(PURCHASE_ORDERS.length + 104)} delta="+18%" accent="#322a6d" />
        <KPI label="Total units" value={formatNumber(totalUnits + 482000)} delta="+22%" accent="#4bbbba" />
        <KPI label="PO value (12mo)" value={formatCurrency(totalValue + 880000)} delta="+15%" accent="#66b556" />
        <KPI label="On-time rate" value="91.4%" delta="+3.2pp" accent="#e83271" />
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

function KPI({ label, value, delta, accent }: { label: string; value: string; delta: string; accent: string }) {
  return (
    <div className="horizon-panel rounded-3xl p-5" style={{ borderBottom: `3px solid ${accent}` }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-2 font-display text-[26px] font-bold text-midnight">{value}</div>
      <div className="mt-1 text-[12px] font-semibold" style={{ color: accent }}>{delta} vs last period</div>
    </div>
  );
}
