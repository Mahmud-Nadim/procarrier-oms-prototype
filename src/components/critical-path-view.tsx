"use client";

import { useState } from "react";
import {
  Check, AlertTriangle, Clock, User, RotateCcw, Edit3, X,
  ChevronDown, Tag, ArrowDownToLine, Info, Eye, Anchor,
} from "lucide-react";
import { Milestone, MilestoneType } from "@/lib/types";
import { MilestoneStatusPill, Pill } from "@/components/ui";
import { formatDate, relativeFromToday } from "@/lib/format";

interface Props {
  milestones: Milestone[];
  poId: string;
  /** Allow edit and recalc actions (false for read-only client view). */
  canEdit?: boolean;
}

interface EditState {
  id: string;
  newDate: string;
  reason: string;
}

const REASONS = [
  "Production delay",
  "QC findings — rework required",
  "Customs hold",
  "Carrier delay",
  "Vessel delay",
  "Packaging delay",
  "Documentation delay",
  "Other",
];

/**
 * Canonical milestone names. The customer-facing `label` is renameable
 * (e.g. a publisher sees "Ready at Printer") but the underlying type is fixed —
 * exactly as described in the May 19 critical-path walkthrough.
 */
const CANONICAL: Record<MilestoneType, string> = {
  OrderReceived: "Order Received",
  OrderAccepted: "Order Accepted",
  CargoReady: "Cargo Ready",
  QualityControl: "Quality Control",
  ExportCustoms: "Export Customs",
  Pickup: "Pickup",
  Departure: "Order Departure · first ETD",
  Arrival: "Order Arrival · last ETA",
  Delivery: "Delivery Required",
};

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

export function CriticalPathView({ milestones, poId, canEdit = true }: Props) {
  const [editState, setEditState] = useState<EditState | null>(null);
  const [recalcBaseId, setRecalcBaseId] = useState<string | null>(null);
  const [recalcDoneFrom, setRecalcDoneFrom] = useState<string | null>(null);
  const [localConfirmed, setLocalConfirmed] = useState<Set<string>>(new Set());
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  const ordered = [...milestones].sort((a, b) => a.sequence - b.sequence);
  const baseMilestone = ordered.find((m) => m.id === recalcBaseId) ?? null;
  const downstream = baseMilestone
    ? ordered.filter((m) => m.sequence > baseMilestone.sequence)
    : [];

  const effectiveStatus = (m: Milestone) =>
    localConfirmed.has(m.id) ? "Confirmed" : m.status;

  const handleConfirm = (m: Milestone) => {
    // Backfill: confirming a milestone marks everything upstream of it as confirmed too.
    const next = new Set(localConfirmed);
    ordered.filter((x) => x.sequence <= m.sequence).forEach((x) => next.add(x.id));
    setLocalConfirmed(next);
  };

  const handleEditOpen = (m: Milestone) => {
    setRecalcDoneFrom(null);
    setEditState({ id: m.id, newDate: m.expectedDate, reason: REASONS[0] });
  };

  const handleSave = () => {
    if (!editState) return;
    setRecalcBaseId(editState.id);
    setRecalcDoneFrom(null);
    setEditState(null);
  };

  return (
    <div>
      {/* How the critical path behaves — encodes the May 19 walkthrough rules */}
      <div className="mb-4 rounded-2xl border border-midnight-10/70 bg-white/70 p-3.5">
        <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-midnight">
          <Info size={13} className="text-teal-shade" /> How this critical path works
        </div>
        <ul className="mt-2 grid gap-1.5 text-[12px] text-ink-muted sm:grid-cols-2">
          <li className="flex gap-1.5"><Anchor size={13} className="mt-0.5 shrink-0 text-teal-shade" /> Each milestone = an <span className="font-semibold text-ink">anchor</span> date + an <span className="font-semibold text-ink">uplift</span> (e.g. Arrival = Departure + transit days).</li>
          <li className="flex gap-1.5"><RotateCcw size={13} className="mt-0.5 shrink-0 text-teal-shade" /> Move a date → give a reason → recalculate rebuilds <span className="font-semibold text-ink">downstream only</span>, from the moved milestone.</li>
          <li className="flex gap-1.5"><AlertTriangle size={13} className="mt-0.5 shrink-0 text-fuchsia" /> An exception is raised <span className="font-semibold text-ink">only when the change impacts the next milestone</span> — slack inside the buffer is just a delay.</li>
          <li className="flex gap-1.5"><ArrowDownToLine size={13} className="mt-0.5 shrink-0 text-teal-shade" /> Confirming a milestone <span className="font-semibold text-ink">backfills everything upstream</span> automatically.</li>
        </ul>
      </div>

      {/* Recalculate prompt — names the moved milestone and what shifts downstream */}
      {recalcBaseId && baseMilestone && (
        <div className="mb-4 horizon-panel-elevated rounded-2xl p-4 animate-fade-up" style={{ borderLeft: "4px solid #4bbbba" }}>
          <div className="flex items-start gap-3">
            <RotateCcw size={20} className="text-teal-shade mt-0.5" />
            <div className="flex-1">
              <div className="font-display font-bold text-midnight">
                Recalculate critical path from “{baseMilestone.label}” down?
              </div>
              <div className="mt-1 text-[13px] text-ink-muted">
                The same anchor + uplift logic used to build the original path is re-applied from the milestone you moved. Everything upstream stays as-is.
              </div>
              {downstream.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {downstream.map((d) => (
                    <Pill key={d.id} tone="teal">{d.label}</Pill>
                  ))}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => { setRecalcDoneFrom(baseMilestone.label); setRecalcBaseId(null); }}
                  className="btn-primary"
                >
                  Yes, recalculate
                </button>
                <button onClick={() => setRecalcBaseId(null)} className="btn-ghost">Not now</button>
              </div>
            </div>
            <button onClick={() => setRecalcBaseId(null)} className="text-ink-muted"><X size={18} /></button>
          </div>
        </div>
      )}

      {recalcDoneFrom && (
        <div className="mb-4 rounded-2xl border border-[#66b556]/40 bg-[#e8f5e0] p-3 text-[13px] font-medium text-[#356b2a]">
          Downstream milestones rebuilt from “{recalcDoneFrom}” using the configured anchor + uplift logic.
        </div>
      )}

      <div className="relative">
        {/* Vertical rail */}
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal/40 via-midnight/30 to-fuchsia/30 sm:left-[23px]" />

        <ul className="space-y-3">
          {ordered.map((m, idx) => {
            const status = effectiveStatus(m);
            const isEditing = editState?.id === m.id;
            const isExpanded = openHistory === m.id;
            const prev = idx > 0 ? ordered[idx - 1] : null;
            const next = idx < ordered.length - 1 ? ordered[idx + 1] : null;

            // Buffer (slack) to the next milestone and the realised delay on this one.
            const bufferDays = next ? daysBetween(m.expectedDate, next.expectedDate) : null;
            const variance = m.actualDate ? daysBetween(m.expectedDate, m.actualDate) : 0;
            const impactsNext = variance > 0 && bufferDays !== null && variance > bufferDays;

            const ringColor =
              status === "Confirmed" ? "#66b556" :
              status === "Late" ? "#f4990b" :
              status === "Missed" ? "#e83271" :
              status === "Skipped" ? "#9894b6" : "#4bbbba";

            return (
              <li key={m.id} className="relative pl-[50px] sm:pl-[60px]">
                {/* Node */}
                <span
                  className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] bg-white sm:left-2 z-10"
                  style={{ borderColor: ringColor }}
                >
                  {status === "Confirmed" ? <Check size={16} style={{ color: ringColor }} strokeWidth={3} />
                    : status === "Late" || status === "Missed" ? <AlertTriangle size={16} style={{ color: ringColor }} />
                    : <Clock size={16} style={{ color: ringColor }} />}
                </span>

                <div className="rounded-2xl border border-midnight-10/60 bg-white/85 p-4 transition hover:border-midnight-25">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Step {m.sequence}</span>
                        <span className="font-display font-bold text-midnight text-[15px]">{m.label}</span>
                        <MilestoneStatusPill status={status} />
                        {m.label !== CANONICAL[m.type] && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-subtle" title="Customer-facing label over a fixed milestone type">
                            <Tag size={10} /> {CANONICAL[m.type]}
                          </span>
                        )}
                      </div>

                      {/* Anchor + uplift derivation */}
                      <div className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-midnight-10/40 px-2 py-0.5 text-[11px] text-ink-muted">
                        <Anchor size={11} className="text-teal-shade" />
                        {prev
                          ? <>Anchored on <span className="font-semibold text-ink">{prev.label}</span> + <span className="font-mono font-semibold text-ink">{m.upliftDays}d</span></>
                          : <>Anchored on <span className="font-semibold text-ink">order date</span></>}
                      </div>

                      <div className="mt-2 grid gap-3 sm:grid-cols-3 text-[12px]">
                        <div>
                          <div className="text-ink-subtle">Expected</div>
                          <div className="mt-0.5 font-semibold text-ink">{formatDate(m.expectedDate)}</div>
                          <div className="text-[11px] text-ink-muted">{relativeFromToday(m.expectedDate)}</div>
                        </div>
                        <div>
                          <div className="text-ink-subtle">Actual</div>
                          <div className="mt-0.5 font-semibold text-ink">{m.actualDate ? formatDate(m.actualDate) : "—"}</div>
                          {m.actualDate && m.actualDate !== m.expectedDate && (
                            <div className="text-[11px] text-fuchsia">Variance from plan</div>
                          )}
                        </div>
                        <div>
                          <div className="text-ink-subtle">Owner · buffer to next</div>
                          <div className="mt-0.5 flex items-center gap-1 text-ink">
                            <User size={11} /> <span className="font-semibold">{m.owner}</span>
                          </div>
                          <div className="text-[11px] text-ink-muted">
                            {bufferDays !== null ? `${bufferDays}d buffer · ±${m.toleranceDays}d tol.` : `final milestone · ±${m.toleranceDays}d tol.`}
                          </div>
                        </div>
                      </div>

                      {/* Delay / impact indicator — exception only when the NEXT milestone is impacted */}
                      {variance > 0 ? (
                        impactsNext ? (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#fce9f0] px-2.5 py-1 text-[11px] font-semibold text-[#7e133a]">
                            <AlertTriangle size={12} /> {variance}-day delay · impacts {next?.label ?? "delivery"} → exception
                          </div>
                        ) : (
                          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#fff5e0] px-2.5 py-1 text-[11px] font-semibold text-[#7a5800]">
                            <Clock size={12} /> {variance}-day delay · absorbed by buffer{bufferDays !== null ? ` (${bufferDays}d)` : ""}
                          </div>
                        )
                      ) : (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#e8f5e0] px-2.5 py-1 text-[11px] font-semibold text-[#356b2a]">
                          <Check size={12} /> On plan · 0-day delay
                        </div>
                      )}
                    </div>

                    {canEdit && status !== "Confirmed" && status !== "Skipped" && (
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleConfirm(m)}
                          title="Confirm this milestone — upstream milestones backfill automatically"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal to-midnight px-3 py-1.5 text-[12px] font-semibold text-white shadow-soft transition hover:shadow-elevated"
                        >
                          <Check size={13} /> Confirm
                        </button>
                        <button
                          onClick={() => handleEditOpen(m)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-midnight-25 bg-white/70 px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-white"
                        >
                          <Edit3 size={12} /> Edit date
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Edit panel */}
                  {isEditing && editState && (
                    <div className="mt-4 rounded-xl border border-teal-25 bg-teal-10/40 p-3 animate-scale-in">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="label">New expected date</label>
                          <input
                            type="date"
                            value={editState.newDate}
                            onChange={(e) => setEditState({ ...editState, newDate: e.target.value })}
                            className="input mt-1"
                          />
                        </div>
                        <div>
                          <label className="label">Reason for change</label>
                          <select
                            value={editState.reason}
                            onChange={(e) => setEditState({ ...editState, reason: e.target.value })}
                            className="input mt-1"
                          >
                            {REASONS.map((r) => <option key={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="mt-2 text-[11px] text-ink-muted">
                        A reason is required whenever a moved date could push a downstream milestone or the delivery-required date.
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={handleSave} className="btn-primary">Save change</button>
                        <button onClick={() => setEditState(null)} className="btn-ghost">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Footer: activity log + exception (mark as read, no chat at PO level) */}
                  <div className="mt-3 flex items-center justify-between border-t border-midnight-10/50 pt-2">
                    <button
                      onClick={() => setOpenHistory(isExpanded ? null : m.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted hover:text-midnight"
                    >
                      <ChevronDown size={12} className={`transition ${isExpanded ? "rotate-180" : ""}`} />
                      Activity log ({m.history.length})
                    </button>
                    {m.exceptionId && (
                      acknowledged.has(m.id) ? (
                        <Pill tone="green">Exception read</Pill>
                      ) : (
                        <button
                          onClick={() => setAcknowledged(new Set(acknowledged).add(m.id))}
                          className="inline-flex items-center gap-1 rounded-full bg-fuchsia-10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fuchsia-shade hover:bg-fuchsia-10/70"
                          title="Acknowledge the exception (chat is not available at PO level at launch)"
                        >
                          <Eye size={11} /> Mark exception as read
                        </button>
                      )
                    )}
                  </div>
                  {isExpanded && (
                    <div className="mt-3 space-y-2 rounded-xl bg-midnight-10/30 p-3">
                      {m.history.map((h) => (
                        <div key={h.id} className="flex items-start gap-2 text-[12px]">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-midnight">{h.action}</span>
                              <span className="text-[11px] text-ink-muted">{new Date(h.at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="text-ink-muted">{h.note}</div>
                            <div className="text-[11px] text-ink-subtle">by {h.user}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
