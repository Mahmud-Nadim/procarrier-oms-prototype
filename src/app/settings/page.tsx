"use client";

import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { useRole, ROLE_LABELS } from "@/lib/role-context";

export default function SettingsPage() {
  const { role, identity } = useRole();

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile and notification preferences" />

      <div className="horizon-panel rounded-3xl p-6 mb-6">
        <SectionHeading title="Profile" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Name" value={identity.name} />
          <Field label="Account" value={identity.accountName} />
          <Field label="Account ID" value={identity.accountId} />
          <Field label="Role" value={ROLE_LABELS[role]} />
        </div>
      </div>

      <div className="horizon-panel rounded-3xl p-6">
        <SectionHeading title="Notification preferences" />
        <div className="mt-4 space-y-3">
          {[
            { label: "PO accepted by supplier", state: true },
            { label: "Booking confirmation / rejection", state: true },
            { label: "Milestone marked late", state: true },
            { label: "New exception raised", state: true },
            { label: "Daily digest (08:00)", state: false },
          ].map((p) => (
            <div key={p.label} className="flex items-center justify-between rounded-2xl border border-midnight-10/60 bg-white/70 p-3">
              <span className="font-medium text-ink">{p.label}</span>
              <Pill tone={p.state ? "green" : "muted"}>{p.state ? "On" : "Off"}</Pill>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">{label}</div>
      <div className="mt-1 font-semibold text-midnight">{value}</div>
    </div>
  );
}
