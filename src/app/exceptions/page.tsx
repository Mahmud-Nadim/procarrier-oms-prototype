"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock } from "lucide-react";
import { PageHeader, SeverityPill, Pill } from "@/components/ui";
import { EXCEPTIONS, PURCHASE_ORDERS, SUPPLIERS } from "@/lib/seed";
import { ExceptionRecord, ExceptionAuditEntry, Role } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { useRole } from "@/lib/role-context";

type Party = "Pro Carrier Ops" | "Client";

// PC Ops and Client each resolve independently; supplier/agent are read-only.
function viewerParty(role: Role): Party | null {
  return role === "ops" ? "Pro Carrier Ops" : role === "client-admin" ? "Client" : null;
}

// Per-viewer resolution. Read-only viewers (supplier/agent) only see an
// exception as closed once BOTH parties have resolved it.
function resolvedFor(e: ExceptionRecord, party: Party | null): boolean {
  if (party === "Pro Carrier Ops") return Boolean(e.pcResolvedAt);
  if (party === "Client") return Boolean(e.clientResolvedAt);
  return Boolean(e.pcResolvedAt && e.clientResolvedAt);
}

export default function ExceptionsPage() {
  const { role, identity } = useRole();
  const party = viewerParty(role);
  const canResolve = party !== null;

  const [records, setRecords] = useState<ExceptionRecord[]>(() =>
    EXCEPTIONS.map((e) => ({ ...e, notes: [...e.notes], audit: [...e.audit] })),
  );
  const [filter, setFilter] = useState<"active" | "resolved" | "all">("active");
  const [openAudit, setOpenAudit] = useState<string | null>(null);

  const resolveForMe = (id: string) => {
    if (!party) return;
    const at = new Date().toISOString();
    setRecords((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const already = party === "Pro Carrier Ops" ? e.pcResolvedAt : e.clientResolvedAt;
        if (already) return e;
        const entry: ExceptionAuditEntry = {
          at,
          by: identity.name,
          party,
          action: "resolved",
          note: `Resolved for the ${party} view`,
        };
        return party === "Pro Carrier Ops"
          ? { ...e, pcResolvedAt: at, pcResolvedBy: identity.name, audit: [...e.audit, entry] }
          : { ...e, clientResolvedAt: at, clientResolvedBy: identity.name, audit: [...e.audit, entry] };
      }),
    );
  };

  const list = records.filter((e) => {
    if (filter === "all") return true;
    const resolved = resolvedFor(e, party);
    return filter === "resolved" ? resolved : !resolved;
  });

  const byType = (type: ExceptionRecord["type"]) => records.filter((e) => e.type === type).length;
  const activeCount = records.filter((e) => !resolvedFor(e, party)).length;
  const resolvedCount = records.length - activeCount;

  return (
    <>
      <PageHeader
        title="Exceptions"
        subtitle="Every exception is visible to both Pro Carrier Ops and the client. Each side resolves it for its own view; the audit trail records both."
        trailing={
          <Pill tone={party ? "teal" : "muted"}>
            {party ? `Viewing as ${party}` : "Read-only · visible on your POs"}
          </Pill>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExceptionTile label="Missed milestone" count={byType("Missed milestone")} accent="#f4990b" />
        <ExceptionTile label="Booking rejected" count={byType("Booking rejected")} accent="#e83271" />
        <ExceptionTile label="Quantity shortfall" count={byType("Quantity shortfall")} accent="#322a6d" />
        <ExceptionTile label="Cancellation trigger" count={byType("Cancellation trigger")} accent="#723a62" />
      </div>

      <div className="horizon-panel rounded-3xl p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {(["active", "resolved", "all"] as const).map((f) => {
            const n = f === "all" ? records.length : f === "resolved" ? resolvedCount : activeCount;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold capitalize transition ${
                  filter === f ? "bg-gradient-to-r from-fuchsia to-midnight text-white shadow-soft" : "border border-midnight-10 bg-white/70 text-ink"
                }`}
              >
                {f} ({n})
              </button>
            );
          })}
          <span className="ml-auto text-[11px] text-ink-muted">
            Status shown from the {party ?? "combined"} perspective
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((e) => {
          const po = PURCHASE_ORDERS.find((p) => p.id === e.poId);
          const supplier = SUPPLIERS.find((s) => s.id === po?.supplierId);
          const resolved = resolvedFor(e, party);
          const auditOpen = openAudit === e.id;
          return (
            <div key={e.id} className="horizon-panel rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${resolved ? "bg-[#e8f5e0] text-[#356b2a]" : "bg-fuchsia-10 text-fuchsia-shade"}`}>
                    {resolved ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/orders/${e.poId}`} className="font-display font-bold text-midnight hover:underline">{e.poId}</Link>
                      <span className="text-[11px] uppercase tracking-wider text-ink-muted font-semibold">{e.type}</span>
                      <SeverityPill severity={e.severity} />
                      <Pill tone={resolved ? "green" : "fuchsia"}>{resolved ? "Resolved" : "Active"}</Pill>
                    </div>
                    <div className="mt-1 text-[13px] text-ink">{e.description}</div>
                    <div className="mt-1.5 text-[11px] text-ink-muted">
                      Supplier: {supplier?.name} · raised {formatDateTime(e.raisedAt)}
                    </div>
                    {/* Dual-party resolution — each side sees who resolved on the other */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <PartyStatus label="Pro Carrier Ops" at={e.pcResolvedAt} by={e.pcResolvedBy} you={party === "Pro Carrier Ops"} />
                      <PartyStatus label="Client" at={e.clientResolvedAt} by={e.clientResolvedBy} you={party === "Client"} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {canResolve && (
                    resolved ? (
                      <Pill tone="green">Resolved for you</Pill>
                    ) : (
                      <button onClick={() => resolveForMe(e.id)} className="btn-primary">
                        <CheckCircle2 size={14} /> Resolve for {party}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setOpenAudit(auditOpen ? null : e.id)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted hover:text-midnight"
                  >
                    <ChevronDown size={12} className={`transition ${auditOpen ? "rotate-180" : ""}`} />
                    Audit trail ({e.audit.length})
                  </button>
                </div>
              </div>
              {auditOpen && <AuditTrail audit={e.audit} />}
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="horizon-panel rounded-3xl p-10 text-center text-ink-muted">
            <CheckCircle2 size={40} className="mx-auto text-green mb-3" />
            {filter === "active" ? "All caught up. No active exceptions from your perspective." : "No exceptions match this filter."}
          </div>
        )}
      </div>
    </>
  );
}

function PartyStatus({ label, at, by, you }: { label: string; at?: string; by?: string; you: boolean }) {
  const resolved = Boolean(at);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] ${
        resolved ? "bg-[#e8f5e0] text-[#356b2a]" : "bg-[#fce9f0] text-[#7e133a]"
      }`}
    >
      {resolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
      <span className="font-semibold">{label}:</span>
      {resolved ? (
        <span>resolved{by ? ` by ${you ? "you" : by}` : ""} · {formatDateTime(at)}</span>
      ) : (
        <span>open{you ? " — resolve to close your view" : ""}</span>
      )}
    </span>
  );
}

function AuditTrail({ audit }: { audit: ExceptionAuditEntry[] }) {
  return (
    <div className="mt-3 space-y-2 rounded-2xl bg-midnight-10/30 p-3">
      {audit.map((a, i) => {
        const dot =
          a.action === "resolved" ? "#66b556" :
          a.action === "reopened" ? "#f4990b" :
          a.action === "raised" ? "#e83271" : "#9894b6";
        return (
          <div key={i} className="flex items-start gap-2 text-[12px]">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-midnight capitalize">{a.action} · {a.party}</span>
                <span className="text-[11px] text-ink-muted">{formatDateTime(a.at)}</span>
              </div>
              {a.note && <div className="text-ink-muted">{a.note}</div>}
              <div className="text-[11px] text-ink-subtle">by {a.by}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExceptionTile({ label, count, accent }: { label: string; count: number; accent: string }) {
  return (
    <div className="horizon-panel rounded-3xl p-4" style={{ borderBottom: `3px solid ${accent}` }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-2 font-display text-[28px] font-bold" style={{ color: accent }}>{count}</div>
    </div>
  );
}
