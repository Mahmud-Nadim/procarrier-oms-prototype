"use client";

import { useState } from "react";
import { Plus, Send, ShieldCheck, Mail } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { Modal, ModalField } from "@/components/modal";
import { SUPPLIERS, AGENTS, PURCHASE_ORDERS } from "@/lib/seed";

type Onboarding = "Active" | "Invited" | "Pending";

const LAST_ACTIVE = ["2h ago", "yesterday", "3 days ago", "today", "5 days ago", "1 week ago"];

function onboardingFor(assignments: number, index: number): Onboarding {
  if (assignments > 0) return "Active";
  return index % 2 === 0 ? "Invited" : "Pending";
}

function OnboardingPill({ state }: { state: Onboarding }) {
  const tone = state === "Active" ? "green" : state === "Invited" ? "orange" : "muted";
  return <Pill tone={tone as "green" | "orange" | "muted"}>{state}</Pill>;
}

export default function AccountsPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <>
      <PageHeader
        title="Supplier & Agent Accounts"
        subtitle="Auth0-backed, scoped per assignment. Created and managed centrally by Pro Carrier ops — never by clients directly."
        trailing={<button className="btn-primary" onClick={() => setInviteOpen(true)}><Plus size={16} /> Invite account</button>}
      />

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite an external account"
        subtitle="Suppliers and agents are onboarded via the same Auth0 invitation flow as portal users, with scoped access."
        footer={
          <>
            <button className="btn-ghost" onClick={() => setInviteOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={() => setInviteOpen(false)}><Mail size={16} /> Send invitation</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ModalField label="Account type">
            <select className="input"><option>Supplier</option><option>Origin agent</option></select>
          </ModalField>
          <ModalField label="Organisation name"><input className="input" placeholder="Hangzhou Print Works" /></ModalField>
          <ModalField label="Primary contact"><input className="input" placeholder="Wei Zhang" /></ModalField>
          <ModalField label="Email (Auth0 login)"><input type="email" className="input" placeholder="wei@hzprint.cn" /></ModalField>
          <ModalField label="Country"><input className="input" placeholder="China" /></ModalField>
          <ModalField label="Link to client account(s)">
            <select className="input"><option>Northbridge Publishing Group</option></select>
          </ModalField>
        </div>
        <div className="mt-4 rounded-xl bg-midnight-10/40 p-3 text-[12px] text-ink-muted">
          A <span className="font-semibold text-midnight">Supplier</span> will see only POs where they are the recorded vendor; an <span className="font-semibold text-midnight">Agent</span> only jobs where they are the origin agent. No cross-client data is ever exposed.
        </div>
      </Modal>

      {/* Access model note */}
      <div className="horizon-panel mb-5 flex items-start gap-3 rounded-3xl p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-midnight-10 text-midnight"><ShieldCheck size={18} /></div>
        <div className="text-[12px] text-ink-muted">
          External accounts authenticate via the same Auth0 invitation flow as portal users. <span className="font-semibold text-midnight">Suppliers</span> see only POs where they are the recorded vendor; <span className="font-semibold text-midnight">agents</span> see only jobs where they are the origin agent. No cross-client data is ever visible. Onboarding state reflects the Auth0 invitation lifecycle.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="horizon-panel rounded-3xl p-5">
          <SectionHeading title="Supplier accounts" subtitle="Linked to one or more client accounts" trailing={<Pill tone="teal">{SUPPLIERS.length}</Pill>} />
          <div className="mt-4 space-y-2.5">
            {SUPPLIERS.map((s, i) => {
              const polCount = PURCHASE_ORDERS.filter((p) => p.supplierId === s.id).length;
              const state = onboardingFor(polCount, i);
              return (
                <div key={s.id} className="flex items-center justify-between rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-midnight">{s.name}</span>
                      <OnboardingPill state={state} />
                    </div>
                    <div className="text-[12px] text-ink-muted">{s.contact} · {s.country}</div>
                    <div className="mt-1 text-[11px] text-ink-subtle">{s.email} · {state === "Active" ? `active ${LAST_ACTIVE[i % LAST_ACTIVE.length]}` : "no sign-in yet"}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Pill tone="midnight">{polCount} POs assigned</Pill>
                    <button className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-shade hover:bg-teal-10">
                      <Send size={11} className="inline mr-1" /> {state === "Active" ? "Manage access" : "Resend invite"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5">
          <SectionHeading title="Origin agent accounts" subtitle="Scoped by job assignment — may span multiple clients" trailing={<Pill tone="fuchsia">{AGENTS.length}</Pill>} />
          <div className="mt-4 space-y-2.5">
            {AGENTS.map((a, i) => {
              const jobCount = PURCHASE_ORDERS.filter((p) => p.agentId === a.id).length;
              const state = onboardingFor(jobCount, i);
              return (
                <div key={a.id} className="flex items-center justify-between rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-midnight">{a.name}</span>
                      <OnboardingPill state={state} />
                    </div>
                    <div className="text-[12px] text-ink-muted">{a.contact} · {a.country}</div>
                    <div className="mt-1 text-[11px] text-ink-subtle">{a.email} · {state === "Active" ? `active ${LAST_ACTIVE[i % LAST_ACTIVE.length]}` : "no sign-in yet"}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Pill tone="midnight">{jobCount} jobs</Pill>
                    <button className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-shade hover:bg-teal-10">
                      <Send size={11} className="inline mr-1" /> {state === "Active" ? "Manage access" : "Resend invite"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
