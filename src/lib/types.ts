// =============================================================
// OMS Domain Types
// Aligned with the executive scoping document data model.
// =============================================================

export type Role = "client-admin" | "supplier" | "agent" | "ops";

export type TransportMode = "Sea" | "Air" | "Road";
export type POStatus =
  | "Draft"
  | "Pending Acceptance"
  | "Accepted"
  | "Booked"
  | "In Transit"
  | "Delivered"
  | "Cancelled"
  | "Exception";

export type BookingStatus = "Pending" | "Confirmed" | "Rejected" | "Cancelled";

// PO ingestion channels. Per client (Jul 2026): EDI and Interchange XML are
// deferred until the first client integration; launch supports CSV upload,
// manual entry, and a create/amend/cancel API (parity with the shipment API).
export type POChannel = "API" | "CSV" | "Manual";
export type MilestoneStatus =
  | "Pending"
  | "Confirmed"
  | "Late"
  | "At Risk"
  | "Missed"
  | "Skipped";

export type ExceptionType =
  | "Missed milestone"
  | "Booking rejected"
  | "Quantity shortfall"
  | "Cancellation trigger";
export type ExceptionSeverity = "low" | "medium" | "high" | "critical";

export interface Account {
  id: string;
  name: string;
  type: "client" | "supplier" | "agent";
  country: string;
  contact: string;
  email: string;
}

export interface ProductMasterRecord {
  code: string;
  description: string;
  hsCode: string;
  composition: string;
  category: string;
}

export interface POLine {
  id: string;
  productCode: string;
  description: string;
  size?: string;
  colour?: string;
  quantityOrdered: number;
  quantityBooked: number;
  quantityShipped: number;
  unitPrice: number;
  currency: string;
  status: "Open" | "Booked" | "Shipped" | "Closed" | "Pending Match";
  matched: boolean;
}

export interface PurchaseOrder {
  id: string;            // PO-XXXXX
  version: number;
  clientId: string;
  supplierId: string; // exactly one supplier per PO — a PO is the buyer↔supplier contract
  // Origin agent is assigned by Pro Carrier from an origin-country → agent rule
  // (one agent per country, maintained in Horizon backend — no client-facing UI).
  // This field is visible to PC Ops only, never to client admins.
  agentId?: string;
  origin: string;        // city + country
  originCountry: string;
  destination: string;
  destinationCountry: string;
  mode: TransportMode;
  channel: POChannel;
  cargoReadyDate: string;
  deliveryRequiredDate: string;
  createdAt: string;
  status: POStatus;
  totalValue: number;
  currency: string;
  totalUnits: number;
  lines: POLine[];
  versions: POVersion[];
  documents: PODocument[];
  bookingId?: string;
  shipmentId?: string;
  exceptionsOpen: number;
  notes?: string;
}

export interface POVersion {
  version: number;
  date: string;
  changedBy: string;
  changeSummary: string;
  channel: POChannel;
}

export interface PODocument {
  id: string;
  name: string;
  type: "Packing List" | "QC Report" | "Certificate" | "Commercial Invoice" | "Other";
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

export interface BookingRequest {
  id: string;
  poId: string;
  supplierId: string;
  requestedByRole: "Supplier" | "Agent"; // agent may book on the supplier's behalf
  requestedDate: string;
  cargoReadyDate: string;
  mode: TransportMode;
  units: number; // booked quantity
  poQuantityOrdered: number; // original PO quantity — PC Ops sees ordered vs booked
  status: BookingStatus; // Pending = awaiting PC Ops approval
  // Launch flow: no rule automation. Every booking is manually approved or
  // rejected by a Pro Carrier Ops user; on rejection the supplier is notified.
  decidedByRole?: "Pro Carrier Ops";
  decidedBy?: string;
  decidedAt?: string;
  rejectionReason?: string;
  bookingReference?: string;
}

export interface Milestone {
  id: string;
  poId: string;
  type: MilestoneType;
  label: string; // Customer-facing label (renameable)
  sequence: number;
  anchorMilestoneId?: string;
  upliftDays: number;
  expectedDate: string;
  actualDate?: string;
  toleranceDays: number;
  owner: "Supplier" | "Agent" | "Forwarder" | "Client";
  status: MilestoneStatus;
  history: MilestoneHistoryEntry[];
  exceptionId?: string;
}

export type MilestoneType =
  | "OrderReceived"
  | "OrderAccepted"
  | "CargoReady"
  | "QualityControl"
  | "ExportCustoms"
  | "Pickup"
  | "Departure"
  | "Arrival"
  | "Delivery";

export interface MilestoneHistoryEntry {
  id: string;
  at: string;
  user: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  action: "created" | "updated" | "confirmed" | "exception" | "ack";
  note?: string;
}

export interface ExceptionRecord {
  id: string;
  poId: string;
  milestoneId?: string; // the milestone step this exception is flagged against
  type: ExceptionType;
  severity: ExceptionSeverity;
  status: "Open" | "Resolved";
  raisedAt: string;
  description: string;
  // Every exception is visible to BOTH parties (PC Ops and Client). Each party
  // resolves it independently for their own view; the audit trail records both.
  pcResolvedAt?: string;
  pcResolvedBy?: string;
  clientResolvedAt?: string;
  clientResolvedBy?: string;
  notes: string[];
  audit: ExceptionAuditEntry[];
}

export interface ExceptionAuditEntry {
  at: string;
  by: string;
  party: "Pro Carrier Ops" | "Client";
  action: "raised" | "resolved" | "reopened" | "note";
  note?: string;
}

export interface ThirdPartyShipment {
  id: string;
  carrier: string;
  scac: string;
  mbl: string;
  containers: string[];
  pol: string;
  pod: string;
  etd: string;
  eta: string;
  status: "On Schedule" | "Delayed" | "Arrived" | "In Transit";
  lastEvent: string;
  lastEventAt: string;
}

export interface BookingRule {
  id: string;
  clientId: string;
  name: string;
  type: "Quantity Tolerance" | "Cut-off Window" | "Handover Window" | "Cancellation Trigger";
  mode?: TransportMode;
  config: Record<string, string | number>;
  active: boolean;
  description: string;
}

export interface CriticalPathTemplate {
  id: string;
  clientId: string;
  name: string;
  origin: string;
  destination: string;
  mode: TransportMode;
  milestones: TemplateMilestone[];
}

export interface TemplateMilestone {
  type: MilestoneType;
  label: string;
  sequence: number;
  anchor: MilestoneType | "OrderCreate";
  upliftDays: number;
  toleranceDays: number;
  owner: Milestone["owner"];
}

export interface TradeLineUplift {
  origin: string;
  destination: string;
  mode: TransportMode;
  transitDays: number;
}

export interface Notification {
  id: string;
  at: string;
  title: string;
  message: string;
  read: boolean;
  type: "info" | "warning" | "success" | "error";
  link?: string;
}
