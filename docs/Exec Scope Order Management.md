Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

## **Pro Carrier Horizon 2.0** 

## Order Management System (OMS) 

## _Executive Scoping_ 

|**Field**|Detail|
|---|---|
|||
|||
|**Document Purpose**|Executive scoping for sizing and prioritisation|
|**Product Area**|Order Management System|
|**Strategic Phase**|Horizon 2.0 — Phase 2|
|**Prerequisite**|Document Digitisation & SKU Extraction (Phase 1)|
|||
|**Status**|Draft — Pending Review|
|||
|**Last Updated**|April 2026|
|||



## **Executive Summary** 

The Order Management System (OMS) introduces upstream supply chain control into Horizon 2.0, operating as the system of record for Purchase Orders, supplier bookings, and pre-shipment milestones. Where the existing portal gives clients visibility of shipments in transit, the OMS gives them control of the process that creates those shipments — from PO creation through booking confirmation, origin-side milestone updates, and handover to the TMS for execution. 

The OMS is designed for enterprise freight clients with complex vendor networks: multiple suppliers, multiple origins, and high volumes of SKU-level orders that need to be tracked, validated, and converted into freight bookings against consistent rules. It enforces client-defined booking logic automatically, gives suppliers and origin agents structured access to update milestones, and surfaces non-compliance and exceptions before they become operational problems. 

A Control Tower view extends the OMS beyond Pro Carrier-managed shipments to provide a unified, singlesource view of a client's entire supply chain — including movements handled by other forwarders. This positions Pro Carrier as the central orchestrator of client logistics rather than simply a freight executor. 

_Strategic context: the OMS is Phase 2 of the Horizon roadmap. It has a hard dependency on the Document Digitisation & SKU Extraction initiative (Phase 1), which builds the product master that OMS PO lines resolve against. Phase 2 should not be scoped for delivery until Product Data Phase A is complete and the product master is in production._ 

## **Problem Statement** 

Pro Carrier's current forwarding workflow begins at booking confirmation — the upstream process of purchase order management, supplier coordination, and pre-shipment compliance sits outside the platform, fragmented across email, spreadsheets, and client ERP systems. This creates several structural problems: 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

- PO amendments and cancellations are communicated manually and are difficult to reconcile against active bookings — creating risk of dead freight and incorrect shipments. 

- Supplier bookings are submitted informally and validated inconsistently, making it difficult to enforce client-defined rules around quantity tolerances, cut-off dates, and handover windows. 

- Origin-side milestone updates — cargo ready, customs clearance, loading — rely on email and phone, with no structured capture or audit trail. 

- Non-compliance and missed handovers are detected reactively, often too late to avoid operational and financial consequences. 

- Clients with multiple forwarders have no unified view of their supply chain — Pro Carrier-managed shipments sit in one system, third-party movements in another. 

The OMS addresses all of these at the point where they originate: upstream, before the shipment is created. 

## **Objectives** 

1. Establish Horizon as the single upstream system of record for PO-driven logistics — from order creation through to TMS handover. 

2. Consume and reconcile live client PO feeds via API, EDI, CSV upload, and portal entry, including amendments and cancellations with full version history. 

3. Enforce client-specific booking rules automatically — quantity tolerances, mode-specific cut-off dates, and handover windows — with real-time feedback to suppliers. 

4. Give suppliers and origin agents structured, scoped portal access to submit booking requests and update pre-shipment milestones. 

5. Surface non-compliance, missed milestones, and booking exceptions proactively — before they become operational failures. 

6. Provide a unified Control Tower view consolidating Pro Carrier and third-party forwarder shipments in a single client-facing interface. 

7. Integrate validated orders and shipments into Neurored (TMS) for execution via API. 

## **Scope** 

## **In Scope** 

PO feed ingestion via API and EDI PO capture via CSV upload (Pro Carrier-defined template) PO capture via portal manual entry Interchange XML format for client ERP mapping PO create, amend, cancel with full version history SKU-level PO lines linked to product master Vendor-segregated PO visibility for supplier accounts Booking requests submitted by suppliers against POs Configurable booking rule engine per client 

## **Out of Scope (Future)** 

Inventory management Demand forecasting or AI optimisation Financial invoicing or rate engines (consumed from TMS) White-label supplier portal branding Carbon accounting per order (Phase 3) Supplier performance scoring / predictive alerts (Phase 4) Draft Bill of Lading workflows Multi-forwarder EDI network connectivity Automated customs filing 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

Quantity tolerance validation (units and percentage) Mode-specific booking cut-off date enforcement Real-time booking acceptance / rejection feedback Configurable critical path templates per client/mode/origin Automatic milestone generation on order and booking events Supplier and agent milestone updates via portal and bulk upload Expected vs actual milestone tracking with tolerance flags Non-compliance detection and exception reporting System-driven booking cancellation based on client rules Order splitting and consolidation logic Neurored TMS integration for shipment creation Control Tower view — 3rd-party shipment ingestion and tagging Vessel/container/flight tracking enrichment for 3rdparty moves Document attachment (packing lists, QC reports, certificates) Supplier and agent user roles with scoped portal access OMS dashboard — dedicated top-level module in Horizon Operational dashboards — orders, milestones, exceptions Supplier compliance and performance reporting CSV / Excel data export 

## **User Roles & Access** 

The OMS introduces two new external-facing user types into the Horizon platform: Supplier and Agent. These roles sit alongside the existing Client Admin, Client User, Pro Carrier Admin, and System User roles but are scoped entirely differently — they access the platform as external parties rather than as members of a client organisation. 

## **5.1 Supplier Accounts** 

A Supplier account is created and managed by the Pro Carrier operations team, linked to one or more client accounts. A supplier user can see all PO lines and bookings where they are recorded as the supplier on the job. They cannot see POs belonging to other suppliers on the same client account. 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

Suppliers interact with the platform to submit booking requests against open POs, upload origin-side documents (packing lists, QC reports, certificates), and update pre-shipment milestones such as cargo ready date and customs clearance. They receive real-time feedback when bookings are accepted or rejected by the rule engine. 

## **5.2 Agent Accounts** 

An Agent account represents an origin freight agent. Agent users can see all shipments and milestones where they are recorded as the origin agent on the job. Their access is read/write for milestone updates and document uploads, and read-only for shipment and PO data. 

Agent access is scoped by job assignment, not by client. A single agent organisation may work across multiple Pro Carrier clients and will see all relevant jobs in a single view. 

## **5.3 Capability Matrix** 

||||||
|---|---|---|---|---|
|**Capability**|**Client**|**Supplier**|**Agent**|**PC Ops**|
|Create / import POs|**Yes**|-|-|**Yes**|
|View own PO lines|**Yes**|**Yes**|-|**Yes**|
|Submit booking requests against POs|-|**Yes**|-|-|
|View booking status & history|**Yes**|**Yes**|-|**Yes**|
|Update pre-shipment milestones|-|**Yes**|**Yes**|**Yes**|
|View milestone critical path|**Yes**|**Yes**|**Yes**|**Yes**|
|Upload documents (packing lists, QC,<br>certs)|-|**Yes**|**Yes**|**Yes**|
|Configure booking rules|-|-|-|**Yes**|
|View non-compliance & exception<br>reports|**Yes**|-|-|**Yes**|
|Access Control Tower (3rd-party<br>shipments)|**Yes**|-|-|**Yes**|
|View supplier performance reports|**Yes**|-|-|**Yes**|
|Export data (CSV / Excel)|**Yes**|-|-|**Yes**|



_Access model note: both Supplier and Agent accounts are created and managed centrally by the Pro Carrier operations team, not by clients directly. This ensures Pro Carrier retains control over external access and can enforce appropriate data segregation between clients. Authentication uses the same Auth0 flow as existing portal users._ 

## **Functional Requirements** 

## **6.1 PO Feed Ingestion & Order Creation** 

The OMS accepts purchase orders through four channels, all of which feed the same internal order data model: 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

- API — event-driven or configurable polling endpoint. Clients push PO create, amend, and cancel transactions from their ERP or order management system. Pro Carrier will publish an API specification and support client integration. 

- EDI — standard EDI formats (EDIFACT / X12) for clients with existing EDI infrastructure. Configurable per client. 

- CSV upload — clients upload POs using a Pro Carrier-defined CSV template. Validation is applied at upload time. A template and field specification is published and maintained by Pro Carrier. 

- Interchange XML — Pro Carrier will define and publish an XML interchange format for clients who prefer to map from their ERP via file transfer rather than API. Configurable per client. 

- Portal manual entry — Client Admins and Pro Carrier operations users can create or amend POs directly within the portal for smaller volumes or one-off corrections. 

All ingestion channels support PO create, amend, and cancel transactions. Every version of a PO is retained with a full audit history — the current version is the live record, but all prior versions are accessible for reconciliation and dispute resolution. 

PO lines are structured at header level (PO number, supplier, destination, mode, required date) and SKU level (product code, description, quantity by style/colour/size). SKU-level product codes are resolved against the client's product master — a dependency on the Document Digitisation & SKU Extraction initiative. Where a product code on an incoming PO does not match an existing product master record, the line is flagged for ops review rather than rejected outright. 

## **6.2 Booking Rule Engine** 

Each client has a configurable set of booking rules maintained by the Pro Carrier operations team. When a supplier submits a booking request against a PO, the rule engine validates it automatically and returns an acceptance or rejection with a reason code in real time. 

Configurable rule dimensions include: 

- Quantity tolerance — bookings are accepted within a defined tolerance of the PO quantity, expressed as absolute units and/or a percentage threshold. Bookings outside tolerance are rejected with the shortfall or excess flagged. 

- Transport mode cut-off — each transport mode (sea, air, road) has a configurable cut-off window relative to the required cargo ready date. Bookings submitted after the cut-off are rejected. 

- Handover window — mode-specific windows within which cargo must be handed over. Bookings outside the window are flagged. 

When a booking is accepted, it is assigned a status of Confirmed and a booking reference is generated. When rejected, the supplier receives an immediate notification with the specific rule that was breached and the corrective action required. 

## **6.3 Critical Path & Milestone Management** 

Each order is assigned a critical path on creation, based on a configurable template selected by client, origin country, and transport mode. The critical path defines the sequence of milestones that must be completed before the shipment can be created, with expected dates and tolerance thresholds for each. 

Milestones are assigned to an owner — supplier, origin agent, or Pro Carrier — who is responsible for updating them. The system tracks expected vs actual dates and flags milestones that are late, approaching their tolerance threshold, or missed entirely. 

Standard pre-shipment milestone types include: 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

- Cargo Ready Date confirmed by supplier 

- Quality Control inspection completed 

- Export customs declaration lodged 

- Cargo collected / loaded 

- Documents dispatched (commercial invoice, packing list, certificates) 

- Origin agent handover confirmed 

Milestone updates can be submitted via the portal (individually or in bulk), via CSV upload, or via API for clients or agents with automated systems. 

## **6.4 Non-Compliance & Exception Handling** 

The system continuously monitors active orders for compliance breaches and surfaces them as exceptions. Exception types include: 

- Missed milestone — a milestone has passed its expected date without an update. 

- Booking rule breach — a booking request was rejected; the PO remains open and unbooked past its cutoff. 

- Quantity shortfall — shipped quantity falls below PO quantity outside the agreed tolerance. 

- Cancellation trigger — a client rule requires automatic booking cancellation when a defined condition is met (e.g. cargo not ready within N days of cut-off). 

Exceptions are surfaced in the OMS dashboard and trigger notifications to the relevant parties. The Pro Carrier operations team can annotate exceptions, assign follow-up actions, and mark them as resolved. Exception data feeds the supplier performance reporting module. 

## **6.5 Order Consolidation & TMS Integration** 

Once an order is validated and all required milestones are confirmed, the OMS converts it into a shipment and creates the corresponding job in Neurored (TMS) via API integration. The integration covers: 

- Shipment creation in Neurored with full PO and SKU-level line data. 

- Assignment of container, vessel, or flight booking reference. 

- Passing of document references (commercial invoice, packing list) to the TMS job. 

- Bi-directional status sync — shipment status updates from Neurored are reflected in the OMS view. 

The OMS also handles order splitting (one PO line split across multiple shipments) and consolidation (multiple PO lines combined into a single shipment) before TMS handover, with the consolidation logic configurable per client. 

## **6.6 Control Tower — Third-Party Shipment Visibility** 

For shipments handled by forwarders other than Pro Carrier, clients can input limited shipment details into the Control Tower module. This enables a unified view of the client's entire supply chain within Horizon. 

Third-party shipments are entered via portal upload or API, providing: 

- Carrier name and SCAC code 

- Master Bill of Lading number 

- Container number(s) or flight/voyage reference 

- Port of loading and discharge 

- ETD and ETA 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

Once entered, Pro Carrier's existing GateHouse OceanIO (sea) and TrackingMore (air) tracking APIs enrich the record with live vessel positions, container events, and milestone updates automatically — using the same infrastructure that powers native shipment tracking. 

Third-party shipments appear within the My Shipments module alongside Pro Carrier-managed shipments, clearly tagged as Third-Party. They are visible in the live tracking map, shipment list, and timeline views. The distinction is always visible to the client — there is no blending of data sources. 

_Control Tower value: by providing a single view that includes third-party movements, Pro Carrier becomes the operational hub of the client's supply chain visibility — not just one of several forwarders. This increases switching cost and creates a natural commercial conversation around consolidating freight with Pro Carrier._ 

## **6.7 OMS Dashboard — Front-End Experience** 

The OMS is surfaced as a dedicated top-level module in the Horizon client portal — the OMS Dashboard — sitting alongside My Shipments, Haulage Calendar, Accounting, Analytics, Collaboration, and the Product Dashboard. 

The OMS Dashboard is designed around three distinct user contexts, each with a different primary view: 

## **Client Admin View** 

The primary view for client-side users. Surfaces order pipeline status, outstanding POs, exception flags, and supplier compliance at a glance. Provides access to the full PO list, critical path tracking across all open orders, and the Control Tower. Client Admins can create POs manually, configure team visibility, and access reporting. 

## **Supplier View** 

A purpose-built view for supplier accounts. Shows only POs where the supplier is the assigned vendor. Presents open booking slots, pending milestone updates, and any rule-rejection notifications. The interface is optimised for mobile-friendly access given the operational context in which suppliers work. Suppliers can submit booking requests, upload documents, and update milestones from a single, focused screen. 

## **Agent View** 

A purpose-built view for origin agent accounts. Shows all active shipments where the agent is assigned as origin agent. Presents outstanding milestone updates, document upload tasks, and any exception flags relevant to their jobs. Designed for desktop use in an operational context. 

## **Pro Carrier Operations View** 

Accessible via the Admin Panel. Provides full visibility across all client OMS data. Operations users manage booking rule configuration, resolve exceptions, handle manual PO corrections, manage supplier and agent accounts, and monitor the overall health of the order pipeline across the client portfolio. 

## **7. Product Master Dependency** 

The OMS has a direct and non-trivial dependency on the Product Master built by the Document Digitisation & SKU Extraction initiative. This dependency affects the core data model and the viability of SKU-level PO matching. 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

- PO lines reference products by product code. For the OMS to resolve a PO line to a canonical product record — enabling consistent tracking, reporting, and landed cost association — the product master must exist and be populated before POs are ingested. 

- The product master provides the canonical HS code, description, and composition for each product, which the OMS uses for export documentation validation and milestone template assignment. 

- Where a product code on an incoming PO does not match an existing product master record, the line is flagged for ops review. This flag rate is expected to be high at launch and should reduce as the product master matures — making early adoption of Document Digitisation directly beneficial to OMS data quality. 

_Sequencing requirement: OMS Phase A should not enter development until Document Digitisation Phase A is live in production and the product master contains data for at least the client(s) targeted for OMS early access. This is a firm dependency, not a soft preference._ 

## **Non-Functional Requirements** 

- Scalability: 50,000+ orders per month, 200,000+ milestone events per month. 

- Latency: external updates (supplier/agent milestone submissions) reflected in the platform within 15 seconds. 

- Security: role-based access with strict data segregation. Supplier accounts see only their own POs. Agent accounts see only their own jobs. No cross-client data visible under any circumstances. Full audit trail for all PO versions, booking events, milestone updates, and rule decisions. 

- Availability: 99.9% uptime. OMS ingestion pipeline operates asynchronously and does not block portal access if downstream systems are unavailable. 

- TMS integration resilience: Neurored API calls are queued and retried on failure. Shipment creation failures are surfaced as exceptions in the ops view, not silently dropped. 

- UX: desktop-optimised for Client Admin and Agent views; mobile-friendly for Supplier views given operational context. 

- GDPR: PO and order data subject to the same retention and deletion policies as shipment data. Supplier and agent account data managed in line with third-party data handling requirements. 

## **Data Model Overview** 

The following entities are introduced by the OMS. All link to the existing shipment and product master data models. 

## **PurchaseOrder** 

Header-level PO record. One record per PO version. Fields include PO number, client account, supplier account, destination, required date, transport mode, status, and version number. Links to PO lines and to the resulting shipment(s) once created. 

## **POLine** 

SKU-level line within a PO. One record per product/size/colour combination. Fields include product code (linked to ProductMasterRecord), description, quantity ordered, quantity booked, quantity shipped, and line status. Carries the booking rule validation state. 

## **BookingRequest** 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

A supplier's request to book freight against one or more PO lines. Records the requested quantity, mode, ETD, and the outcome of rule engine validation (accepted/rejected, rule code, timestamp). Links to the relevant POLines and to the resulting shipment record once confirmed. 

## **CriticalPathTemplate** 

A reusable milestone template configured per client, origin, and transport mode. Defines the ordered sequence of milestone types, expected lead times, and tolerance thresholds. Applied to orders on creation. 

## **OrderMilestone** 

A single milestone on an order's critical path. One record per milestone per order. Fields include milestone type, assigned owner (supplier/agent/forwarder), expected date, actual date, status, and any exception flags. Full update history retained. 

## **ExceptionRecord** 

A flagged compliance or operational issue on an order. Types include missed milestone, booking rule breach, quantity shortfall, and cancellation trigger. Records the exception type, severity, assigned owner, resolution status, and audit notes. 

## **ThirdPartyShipment** 

A shipment handled by a forwarder other than Pro Carrier, entered by the client via the Control Tower. Holds carrier, MBL, container/flight reference, POL, POD, ETD, ETA, and tracking enrichment data (populated asynchronously from OceanIO / TrackingMore). Links to the client account and is displayed in My Shipments with a third-party tag. 

## **SupplierAccount / AgentAccount** 

New user account types in the platform. Managed by Pro Carrier ops. SupplierAccount links to one or more client accounts with a list of PO assignments. AgentAccount links to one or more job assignments. Both use Auth0 authentication via the same invitation flow as existing portal users. 

## **Success Metrics** 

- 80% of pre-shipment milestones updated directly by external parties (suppliers/agents) within 12 months of launch. 

- 50% reduction in milestone-related manual emails within 6 months. 

- 90%+ of booking requests processed automatically by the rule engine (accepted or rejected without ops intervention) within 3 months. 

- 95% milestone accuracy rate compared to TMS operational events within 12 months. 

- Control Tower adoption: 60%+ of eligible clients entering third-party shipment data within 12 months. 

- Annualised incremental value of GBP 0.9m+ from PO management retention and freight recapture within 18 months. 

## **Phasing & Rollout** 

_Dependency reminder: Phase A of the OMS requires Document Digitisation Phase A to be live in production. Do not begin OMS Phase A development until the product master is operational._ 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

## **Phase A — Core OMS & Ingestion** 

- PO feed ingestion via API, EDI, CSV upload (Pro Carrier template), and interchange XML format. 

- Portal manual PO entry for Client Admins and ops users. 

- PO versioning and full amendment / cancellation history. 

- SKU-level PO lines linked to product master (with unmatched product flag for ops review). 

- Supplier and agent account types — creation, Auth0 onboarding, scoped access model. 

- Supplier view — open POs, booking request submission, basic milestone updates. 

- Neurored TMS integration — shipment creation from confirmed orders. 

- OMS Dashboard — initial client admin view (PO pipeline, open orders, basic exception list). 

## **Phase B — Rule Engine, Critical Path & Compliance** 

- Configurable booking rule engine per client (quantity tolerance, cut-off dates, handover windows). 

- Real-time booking acceptance / rejection with rule code feedback to suppliers. 

- Configurable critical path templates per client, origin, and mode. 

- Automatic milestone generation on order creation and booking confirmation. 

- Expected vs actual milestone tracking with tolerance flags. 

- Non-compliance detection — missed milestones, booking breaches, cancellation triggers. 

- Exception dashboard and notifications for ops team and client admins. 

- Agent view — milestone update interface, document upload, job assignment view. 

- Bulk milestone upload via CSV for suppliers and agents. 

## **Phase C — Control Tower & Reporting** 

- Third-party shipment ingestion via portal and API. 

- OceanIO / TrackingMore enrichment for third-party shipments. 

- Third-party tagging in My Shipments — map, list, and timeline views. 

- Order consolidation and splitting logic before TMS handover. 

- Supplier compliance and performance reporting dashboard. 

- Full CSV / Excel export across all OMS data. 

- OMS analytics — order pipeline, exception trends, supplier performance over time. 

## **Open Questions & Dependencies** 

|**Question / Dependency**|Notes|
|---|---|
|**Product master readiness**|OMS Phase A cannot begin until Document Digitisation Phase A is live.<br>Confirm timeline alignment between the two workstreams before OMS scoping<br>begins.|
|||
|**Neurored API capability**|Confirm Neurored supports inbound shipment creation via API and bi-<br>directional status sync. API documentation and sandbox access required<br>before Phase A technical design.|
|**EDI format priority**|Which EDI standard (EDIFACT or X12) should be prioritised? Could be driven<br>by the first enterprise client targeted for OMS onboarding.|
|||
|**CSV template ownership**|Pro Carrier to define and maintain the PO CSV import template. Who is the<br>internal owner for template design and versioning?|
|||



Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

Pro Carrier Horizon 2.0  |  Executive Scoping **|  INTERNAL** 

|**Supplier/agent onboarding**<br>**volume**|Estimated number of supplier and agent accounts at launch? Affects Auth0<br>provisioning and ops team capacity for onboarding.|
|---|---|
|||
|**Rule engine configuration**<br>**ownership**|Who within Pro Carrier configures client booking rules? This is an ops function<br>— confirm whether a self-service UI is needed or whether rule setup is always<br>done by Pro Carrier ops.|
|**Control Tower data entry**|Should third-party shipment data entry be available to Client Admins, or<br>restricted to Pro Carrier ops only at launch? Affects portal UI scope for Phase<br>C.|
|||
|||
|**Unmatched product handling**|What is the ops SLA for reviewing unmatched product codes on incoming PO<br>lines? This affects how long a PO line remains in pending state before it can<br>progress to booking.|
|||



_End of Document — Pro Carrier Horizon 2.0 | Order Management System | Draft April 2026_ 

Pro Carrier Horizon 2.0 — ConfidentialDraft  |  April 2026 

