# Pro Carrier Horizon — OMS Prototype

A fully working UI prototype of the Order Management System (Horizon 2.0 Phase 2), built to match the look and feel of the existing Horizon portal and aligned to the Executive Scope (April 2026) and the May 19 critical-path workflow walkthrough.

## What it covers

- **Four roles, one app** — switch between Client Admin, Supplier, Origin Agent, and Pro Carrier Ops via the top-right role switcher. Each role gets a tailored dashboard, scoped data, and a different navigation surface.
- **Realistic data** — 22 purchase orders across 6 suppliers, 5 origin agents, 5 trade lanes, with full milestone history, exception records, version history, third-party shipments, and booking rules.
- **Five ingestion channels** — API, EDI (EDIFACT/X12), CSV (Pro Carrier template), Interchange XML, and manual portal entry — all surfaced on the New PO screen.
- **Editable critical path** — open any PO, switch to the Critical Path tab, and edit a milestone date. The recalculation prompt mirrors the behaviour described in the May 19 call.
- **Order detail tabs** — Overview, PO Lines, Critical Path, Documents, Activity (PO version history + milestone log).
- **Exception engine view** — filter by status, mark as read, severity tagging, links back to the PO.
- **Booking rule engine** — bookings carry the real-time accept/reject decision, rule code, and reason; suppliers see exactly why a request was rejected.
- **TMS handover (Neurored)** — ops handover queue with queued/retrying/failed states + retry, bi-directional status sync, and order consolidation + splitting before handover.
- **Control Tower** — third-party shipment ingestion with OceanIO/TrackingMore-style enrichment, clearly tagged.
- **Ops admin surface** — booking rules, critical path templates per trade lane, TMS handover, and Auth0-lifecycle supplier/agent account management (Active / Invited / Pending).
- **Analytics** — order pipeline, mode mix, status distribution, supplier volume — all using realistic seed data.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --build --prod
```

The included `netlify.toml` wires up the `@netlify/plugin-nextjs` adapter automatically.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS v3 (brand palette mirrored from `horizon-portal/src/app/globals.css`)
- Recharts (analytics)
- lucide-react (icons)

## Notes for the client

The data is seeded — you can move milestones, recalculate the path, mark exceptions as read — and the changes are local to the session. The structure, scoping rules, and screen flow are all production-shaped.
