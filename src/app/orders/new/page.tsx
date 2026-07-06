"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Trash2, FileSpreadsheet, Globe, PencilLine, Info } from "lucide-react";
import { PageHeader, Pill, SectionHeading } from "@/components/ui";
import { SUPPLIERS, AGENTS } from "@/lib/seed";
import { POChannel } from "@/lib/types";
import { useState } from "react";

export default function NewPOPage() {
  const [channel, setChannel] = useState<POChannel>("Manual");
  const [lines, setLines] = useState([{ code: "", desc: "", qty: 0, price: 0 }]);

  return (
    <>
      <Link href="/orders" className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-muted hover:text-midnight">
        <ArrowLeft size={14} /> Back to orders
      </Link>

      <PageHeader title="New Purchase Order" subtitle="Manual portal entry — for smaller volumes or one-off corrections" />

      <div className="horizon-panel rounded-3xl p-5 sm:p-6 mb-6">
        <SectionHeading title="How this PO is created" subtitle="Launch supports three ingestion channels, all feeding the same internal order model. Each supports create, amend, and cancel — the API mirrors the shipment API. (EDI and Interchange XML are deferred to a later client-integration phase.)" />
        <div className="mt-4 grid gap-3 grid-cols-1 sm:grid-cols-3">
          {[
            { id: "Manual" as const, icon: PencilLine, label: "Manual entry", desc: "Portal entry — one-offs or corrections" },
            { id: "CSV" as const, icon: FileSpreadsheet, label: "Upload CSV", desc: "Pro Carrier-defined template" },
            { id: "API" as const, icon: Globe, label: "API", desc: "Create / amend / cancel — parity with shipment API" },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setChannel(c.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  channel === c.id ? "border-teal bg-teal-10/60" : "border-midnight-10 bg-white/70 hover:bg-white"
                }`}
              >
                <Icon size={20} className="text-teal-shade" />
                <div className="mt-2 font-semibold text-midnight">{c.label}</div>
                <div className="text-[11px] text-ink-muted">{c.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="horizon-panel rounded-3xl p-5 sm:p-6 mb-6">
        <SectionHeading title="Header" />
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Field label="PO number"><input className="input" placeholder="PO-83073" /></Field>
          <Field label="Supplier">
            <select className="input">
              {SUPPLIERS.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Origin agent">
            <select className="input">
              <option>—</option>
              {AGENTS.map((a) => <option key={a.id}>{a.name}</option>)}
            </select>
          </Field>
          <Field label="Origin"><input className="input" placeholder="Hangzhou, CN" /></Field>
          <Field label="Destination"><input className="input" placeholder="Felixstowe, UK" defaultValue="Felixstowe, UK" /></Field>
          <Field label="Transport mode">
            <select className="input">
              <option>Sea</option><option>Air</option><option>Road</option>
            </select>
          </Field>
          <Field label="Cargo ready date"><input type="date" className="input" /></Field>
          <Field label="Delivery required date"><input type="date" className="input" /></Field>
          <Field label="Currency">
            <select className="input"><option>GBP</option><option>USD</option><option>EUR</option></select>
          </Field>
        </div>
      </div>

      <div className="horizon-panel rounded-3xl p-5 sm:p-6 mb-6">
        <SectionHeading title="Lines" trailing={<button onClick={() => setLines([...lines, { code: "", desc: "", qty: 0, price: 0 }])} className="btn-ghost"><Plus size={14} /> Add line</button>} />
        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-teal-10/50 p-3 text-[12px] text-ink-muted">
          <Info size={15} className="mt-0.5 shrink-0 text-teal-shade" />
          <span>A new product code entered on a line is <span className="font-semibold text-midnight">auto-registered to the product master</span> the first time it&apos;s used — no pre-load required.</span>
        </div>
        <div className="mt-4 space-y-2.5">
          {lines.map((_, i) => (
            <div key={i} className="grid gap-2 rounded-2xl border border-midnight-10/60 bg-white/70 p-3 md:grid-cols-12">
              <input className="input md:col-span-3" placeholder="Product code" />
              <input className="input md:col-span-5" placeholder="Description" />
              <input className="input md:col-span-2" placeholder="Qty" type="number" />
              <input className="input md:col-span-1" placeholder="Price" type="number" />
              <button className="rounded-xl border border-midnight-10 p-2 text-fuchsia md:col-span-1" onClick={() => setLines(lines.filter((_, j) => j !== i))}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button className="btn-ghost">Save draft</button>
        <button className="btn-primary">Submit PO</button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
