"use client";

import { Plus, Mail, Send } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { SUPPLIERS, AGENTS, PURCHASE_ORDERS } from "@/lib/seed";

export default function AccountsPage() {
  return (
    <>
      <PageHeader
        title="Supplier & Agent Accounts"
        subtitle="Auth0-backed, scoped per assignment. Centrally managed by Pro Carrier ops."
        trailing={<button className="btn-primary"><Plus size={16} /> Invite account</button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="horizon-panel rounded-3xl p-5">
          <SectionHeading title="Supplier accounts" trailing={<Pill tone="teal">{SUPPLIERS.length}</Pill>} />
          <div className="mt-4 space-y-2.5">
            {SUPPLIERS.map((s) => {
              const polCount = PURCHASE_ORDERS.filter((p) => p.supplierId === s.id).length;
              return (
                <div key={s.id} className="flex items-center justify-between rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
                  <div>
                    <div className="font-semibold text-midnight">{s.name}</div>
                    <div className="text-[12px] text-ink-muted">{s.contact} · {s.country}</div>
                    <div className="mt-1 text-[11px] text-ink-subtle">{s.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Pill tone="midnight">{polCount} POs assigned</Pill>
                    <button className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-shade hover:bg-teal-10">
                      <Send size={11} className="inline mr-1" /> Resend invite
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="horizon-panel rounded-3xl p-5">
          <SectionHeading title="Origin agent accounts" trailing={<Pill tone="fuchsia">{AGENTS.length}</Pill>} />
          <div className="mt-4 space-y-2.5">
            {AGENTS.map((a) => {
              const jobCount = PURCHASE_ORDERS.filter((p) => p.agentId === a.id).length;
              return (
                <div key={a.id} className="flex items-center justify-between rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
                  <div>
                    <div className="font-semibold text-midnight">{a.name}</div>
                    <div className="text-[12px] text-ink-muted">{a.contact} · {a.country}</div>
                    <div className="mt-1 text-[11px] text-ink-subtle">{a.email}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Pill tone="midnight">{jobCount} jobs</Pill>
                    <button className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-teal-shade hover:bg-teal-10">
                      <Send size={11} className="inline mr-1" /> Resend invite
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
