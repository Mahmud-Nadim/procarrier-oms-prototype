"use client";

import { useState } from "react";
import {
  Check, AlertTriangle, Clock, Calendar, User, RotateCcw, Edit3, X,
  ChevronDown, MessageSquare,
} from "lucide-react";
import { Milestone, MilestoneStatus } from "@/lib/types";
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

export function CriticalPathView({ milestones, poId, canEdit = true }: Props) {
  const [editState, setEditState] = useState<EditState | null>(null);
  const [showRecalcPrompt, setShowRecalcPrompt] = useState(false);
  const [recalcBaseId, setRecalcBaseId] = useState<string | null>(null);
  const [acknowledgedExceptions, setAcknowledgedExceptions] = useState<Set<string>>(new Set());
  const [openHistory, setOpenHistory] = useState<string | null>(null);

  const handleConfirm = (id: string) => {
    // Demo: tick to confirm
    setShowRecalcPrompt(false);
  };

  const handleEditOpen = (m: Milestone) => {
    setEditState({ id: m.id, newDate: m.expectedDate, reason: REASONS[0] });
  };

  const handleSave = () => {
    if (!editState) return;
    setRecalcBaseId(editState.id);
    setShowRecalcPrompt(true);
    setEditState(null);
  };

  return (
    <div>
      {showRecalcPrompt && (
        <div className="mb-4 horizon-panel-elevated rounded-2xl p-4 animate-fade-up" style={{ borderLeft: "4px solid #4bbbba" }}>
          <div className="flex items-start gap-3">
            <RotateCcw size={20} className="text-teal-shade mt-0.5" />
            <div className="flex-1">
              <div className="font-display font-bold text-midnight">Recalculate critical path?</div>
              <div className="mt-1 text-[13px] text-ink-muted">
                You moved a milestone. We can rebuild the downstream chain from the new date using the same anchor + uplift logic.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => setShowRecalcPrompt(false)} className="btn-primary">Yes, recalculate</button>
                <button onClick={() => setShowRecalcPrompt(false)} className="btn-ghost">Not now</button>
              </div>
            </div>
            <button onClick={() => setShowRecalcPrompt(false)} className="text-ink-muted"><X size={18} /></button>
          </div>
        </div>
      )}

      <div className="relative">
        {/* Vertical rail */}
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-teal/40 via-midnight/30 to-fuchsia/30 sm:left-[23px]" />

        <ul className="space-y-3">
          {milestones.map((m, idx) => {
            const isEditing = editState?.id === m.id;
            const isExpanded = openHistory === m.id;
            const ringColor =
              m.status === "Confirmed" ? "#66b556" :
              m.status === "Late" ? "#f4990b" :
              m.status === "Missed" ? "#e83271" :
              m.status === "Skipped" ? "#9894b6" : "#4bbbba";

            return (
              <li key={m.id} className="relative pl-[50px] sm:pl-[60px]">
                {/* Node */}
                <span
                  className="absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] bg-white sm:left-2 z-10"
                  style={{ borderColor: ringColor }}
                >
                  {m.status === "Confirmed" ? <Check size={16} style={{ color: ringColor }} strokeWidth={3} />
                    : m.status === "Late" || m.status === "Missed" ? <AlertTriangle size={16} style={{ color: ringColor }} />
                    : <Clock size={16} style={{ color: ringColor }} />}
                </span>

                <div className="rounded-2xl border border-midnight-10/60 bg-white/85 p-4 transition hover:border-midnight-25">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">Step {m.sequence}</span>
                        <span className="font-display font-bold text-midnight text-[15px]">{m.label}</span>
                        <MilestoneStatusPill status={m.status} />
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
                          <div className="text-ink-subtle">Owner · uplift</div>
                          <div className="mt-0.5 flex items-center gap-1 text-ink">
                            <User size={11} /> <span className="font-semibold">{m.owner}</span>
                          </div>
                          <div className="text-[11px] text-ink-muted">+{m.upliftDays}d · ±{m.toleranceDays}d tolerance</div>
                        </div>
                      </div>
                    </div>

                    {canEdit && m.status !== "Confirmed" && m.status !== "Skipped" && (
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => handleConfirm(m.id)}
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
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button onClick={handleSave} className="btn-primary">Save change</button>
                        <button onClick={() => setEditState(null)} className="btn-ghost">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* History toggle */}
                  <div className="mt-3 flex items-center justify-between border-t border-midnight-10/50 pt-2">
                    <button
                      onClick={() => setOpenHistory(isExpanded ? null : m.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted hover:text-midnight"
                    >
                      <ChevronDown size={12} className={`transition ${isExpanded ? "rotate-180" : ""}`} />
                      Activity log ({m.history.length})
                    </button>
                    {m.exceptionId && (
                      <Pill tone="fuchsia">Exception linked</Pill>
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
