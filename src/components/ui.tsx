"use client";

import { ReactNode } from "react";
import clsx from "clsx";
import { POStatus, MilestoneStatus, ExceptionSeverity, BookingStatus } from "@/lib/types";

// -----------------------------------------------------------------
// Stats Card
// -----------------------------------------------------------------
export function StatsCard({
  icon, label, value, accent, subline,
}: { icon: ReactNode; label: string; value: string | number; accent: string; subline?: string }) {
  return (
    <div
      className="horizon-panel flex min-h-[130px] items-center gap-4 rounded-3xl p-5 sm:p-6 transition-all duration-200 hover:shadow-elevated group"
      style={{ borderBottom: `3px solid ${accent}` }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
        style={{
          background: `linear-gradient(135deg, ${accent}18, rgba(255,255,255,0.92))`,
          color: accent,
          boxShadow: `0 12px 24px ${accent}1a`,
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] font-medium text-ink-muted">{label}</div>
        <div className="mt-1.5 font-display text-[28px] font-bold leading-none text-midnight">{value}</div>
        {subline && <div className="mt-2 text-[11px] text-ink-muted">{subline}</div>}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------
// Status pills
// -----------------------------------------------------------------
const PO_STATUS_STYLES: Record<POStatus, { bg: string; fg: string; dot: string }> = {
  Draft: { bg: "#eae9f0", fg: "#322a6d", dot: "#9894b6" },
  "Pending Acceptance": { bg: "#fff5e0", fg: "#7a5800", dot: "#f4990b" },
  Accepted: { bg: "#edf8f8", fg: "#235e5e", dot: "#4bbbba" },
  Booked: { bg: "#d2eeee", fg: "#235e5e", dot: "#4bbbba" },
  "In Transit": { bg: "#eae9f0", fg: "#322a6d", dot: "#322a6d" },
  Delivered: { bg: "#e8f5e0", fg: "#356b2a", dot: "#66b556" },
  Cancelled: { bg: "#f0eaee", fg: "#603a62", dot: "#723a62" },
  Exception: { bg: "#fce9f0", fg: "#7e133a", dot: "#e83271" },
};

export function POStatusPill({ status }: { status: POStatus }) {
  const s = PO_STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

const MILESTONE_STATUS_STYLES: Record<MilestoneStatus, { bg: string; fg: string }> = {
  Pending: { bg: "#eae9f0", fg: "#322a6d" },
  Confirmed: { bg: "#e8f5e0", fg: "#356b2a" },
  Late: { bg: "#fff5e0", fg: "#7a5800" },
  "At Risk": { bg: "#fff5e0", fg: "#7a5800" },
  Missed: { bg: "#fce9f0", fg: "#7e133a" },
  Skipped: { bg: "#eae9f0", fg: "#767676" },
};
export function MilestoneStatusPill({ status }: { status: MilestoneStatus }) {
  const s = MILESTONE_STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: s.bg, color: s.fg }}>
      {status}
    </span>
  );
}

const SEVERITY_STYLES: Record<ExceptionSeverity, { bg: string; fg: string }> = {
  low: { bg: "#edf8f8", fg: "#235e5e" },
  medium: { bg: "#fff5e0", fg: "#7a5800" },
  high: { bg: "#fce9f0", fg: "#7e133a" },
  critical: { bg: "#7e133a", fg: "#ffffff" },
};
export function SeverityPill({ severity }: { severity: ExceptionSeverity }) {
  const s = SEVERITY_STYLES[severity];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider" style={{ background: s.bg, color: s.fg }}>
      {severity}
    </span>
  );
}

const BOOKING_STATUS_STYLES: Record<BookingStatus, { bg: string; fg: string }> = {
  Pending: { bg: "#fff5e0", fg: "#7a5800" },
  Confirmed: { bg: "#e8f5e0", fg: "#356b2a" },
  Rejected: { bg: "#fce9f0", fg: "#7e133a" },
  Cancelled: { bg: "#f0eaee", fg: "#603a62" },
};
export function BookingStatusPill({ status }: { status: BookingStatus }) {
  const s = BOOKING_STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: s.bg, color: s.fg }}>
      {status}
    </span>
  );
}

// -----------------------------------------------------------------
// Section heading
// -----------------------------------------------------------------
export function SectionHeading({
  title,
  subtitle,
  trailing,
}: { title: string; subtitle?: string; trailing?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-display text-[22px] font-bold leading-tight text-midnight sm:text-[26px]">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  );
}

export function PageHeader({
  title, subtitle, eyebrow, trailing,
}: { title: string; subtitle?: string; eyebrow?: string; trailing?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-shade">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-[28px] font-bold leading-tight text-midnight sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[14px] text-ink-muted">{subtitle}</p>}
      </div>
      {trailing}
    </div>
  );
}

export function TableWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("overflow-hidden rounded-2xl border border-[rgba(50,42,109,0.08)] bg-white", className)}>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "midnight" }: { children: ReactNode; tone?: "midnight" | "teal" | "fuchsia" | "orange" | "green" | "muted" }) {
  const styles = {
    midnight: "bg-midnight-10 text-midnight",
    teal: "bg-teal-10 text-teal-shade",
    fuchsia: "bg-fuchsia-10 text-fuchsia-shade",
    orange: "bg-[#fff5e0] text-[#7a5800]",
    green: "bg-[#e8f5e0] text-[#356b2a]",
    muted: "bg-midnight-10 text-ink-muted",
  };
  return <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold", styles[tone])}>{children}</span>;
}
