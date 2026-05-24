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
export type MilestoneStatus =
  | "Pending"
  | "Confirmed"
  | "Late"
  | "At Risk"
  | "Missed"
  | "Skipped";

export type ExceptionType =
  | "Missed milestone"
  | "Booking rule breach"
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
  supplierId: string;
  agentId?: string;
  origin: string;        // city + country
  originCountry: string;
  destination: string;
  destinationCountry: string;
  mode: TransportMode;
  channel: "API" | "EDI" | "CSV" | "XML" | "Portal";
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
  channel: PurchaseOrder["channel"];
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
  requestedDate: string;
  cargoReadyDate: string;
  mode: TransportMode;
  units: number;
  status: BookingStatus;
  ruleCode?: string;
  ruleMessage?: string;
  bookingReference?: string;
  decidedAt?: string;
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
  type: ExceptionType;
  severity: ExceptionSeverity;
  raisedAt: string;
  description: string;
  ownerRole: "Supplier" | "Agent" | "Forwarder" | "Client";
  status: "Open" | "Acknowledged" | "Resolved";
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes: string[];
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
