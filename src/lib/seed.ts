// =============================================================
// Seed dataset for the OMS prototype.
// Designed to feel real: multi-supplier, multi-mode, multi-origin,
// PO versioning, milestone history, exceptions, third-party shipments.
// =============================================================

import {
  Account,
  BookingRequest,
  BookingRule,
  CriticalPathTemplate,
  ExceptionRecord,
  Milestone,
  Notification,
  POLine,
  PurchaseOrder,
  TemplateMilestone,
  ThirdPartyShipment,
  TradeLineUplift,
  ProductMasterRecord,
} from "./types";

// -----------------------------------------------------------------
// Accounts
// -----------------------------------------------------------------
export const CLIENTS: Account[] = [
  {
    id: "CL-001",
    name: "Northbridge Publishing Group",
    type: "client",
    country: "United Kingdom",
    contact: "Eleanor Hartwell",
    email: "e.hartwell@northbridge.co.uk",
  },
];

export const SUPPLIERS: Account[] = [
  { id: "SUP-101", name: "Hangzhou Print Works", type: "supplier", country: "China", contact: "Wei Zhang", email: "wei.zhang@hzprint.cn" },
  { id: "SUP-102", name: "Mumbai Textile Co.", type: "supplier", country: "India", contact: "Anil Mehta", email: "anil@mumbaitextile.in" },
  { id: "SUP-103", name: "Saigon Apparel Mfg", type: "supplier", country: "Vietnam", contact: "Linh Tran", email: "linh.tran@saigonapparel.vn" },
  { id: "SUP-104", name: "Istanbul Leather Atelier", type: "supplier", country: "Turkey", contact: "Mehmet Aksoy", email: "mehmet@istanbulleather.tr" },
  { id: "SUP-105", name: "Casablanca Garments", type: "supplier", country: "Morocco", contact: "Yasmine El Khoury", email: "y.elkhoury@casagarments.ma" },
  { id: "SUP-106", name: "Bangalore Print Hub", type: "supplier", country: "India", contact: "Priya Iyer", email: "priya@bangaloreprint.in" },
];

export const AGENTS: Account[] = [
  { id: "AG-201", name: "Pearl River Logistics (Origin)", type: "agent", country: "China", contact: "Henry Chen", email: "h.chen@pearlriverlog.cn" },
  { id: "AG-202", name: "Asia Pacific Forwarders", type: "agent", country: "Vietnam", contact: "Mai Nguyen", email: "mai@apforwarders.vn" },
  { id: "AG-203", name: "Bosphorus Transit Co.", type: "agent", country: "Turkey", contact: "Cem Yıldız", email: "cem@bosphorus.tr" },
  { id: "AG-204", name: "Atlas Origin Services", type: "agent", country: "Morocco", contact: "Karim Benjelloun", email: "k.benjelloun@atlasorigin.ma" },
  { id: "AG-205", name: "Bombay Cargo Partners", type: "agent", country: "India", contact: "Rajesh Patel", email: "r.patel@bombaycargo.in" },
];

// -----------------------------------------------------------------
// Trade-line uplift matrix (default transit days, configurable per client)
// -----------------------------------------------------------------
export const TRADE_LINE_UPLIFTS: TradeLineUplift[] = [
  { origin: "China", destination: "United Kingdom", mode: "Sea", transitDays: 28 },
  { origin: "China", destination: "United Kingdom", mode: "Air", transitDays: 5 },
  { origin: "India", destination: "United Kingdom", mode: "Sea", transitDays: 25 },
  { origin: "India", destination: "United Kingdom", mode: "Air", transitDays: 4 },
  { origin: "Vietnam", destination: "United Kingdom", mode: "Sea", transitDays: 32 },
  { origin: "Turkey", destination: "United Kingdom", mode: "Road", transitDays: 8 },
  { origin: "Turkey", destination: "United Kingdom", mode: "Sea", transitDays: 14 },
  { origin: "Morocco", destination: "United Kingdom", mode: "Road", transitDays: 6 },
  { origin: "Morocco", destination: "United Kingdom", mode: "Sea", transitDays: 9 },
];

// -----------------------------------------------------------------
// Product Master (a sliver — enough to look credible)
// -----------------------------------------------------------------
export const PRODUCT_MASTER: ProductMasterRecord[] = [
  { code: "BK-CHILD-A4-HC-128", description: "Children's hardcover, A4, 128pp", hsCode: "4901.99", composition: "Paper, board, polyester thread", category: "Books" },
  { code: "BK-NOV-PB-320", description: "Novel paperback, B-format, 320pp", hsCode: "4901.99", composition: "Paper, glue", category: "Books" },
  { code: "BK-COOK-HC-256", description: "Cookery book, hardback, gloss laminate", hsCode: "4901.99", composition: "Paper, board, lamination", category: "Books" },
  { code: "BK-EDU-SB-96", description: "Educational softback workbook, 96pp", hsCode: "4901.91", composition: "Paper, glue", category: "Books" },
  { code: "BK-ART-HC-192", description: "Art book, large format hardcover", hsCode: "4901.99", composition: "Paper, board, fabric spine", category: "Books" },
  { code: "STN-NB-A5-LIN", description: "A5 lined notebook, soft cover", hsCode: "4820.10", composition: "Paper, card", category: "Stationery" },
  { code: "STN-NB-A5-DOT", description: "A5 dotted notebook, hardcover", hsCode: "4820.10", composition: "Paper, board", category: "Stationery" },
  { code: "STN-PEN-RB-BLK", description: "Rollerball pen set, black ink", hsCode: "9608.10", composition: "Plastic, ink, metal tip", category: "Stationery" },
  { code: "GFT-CARD-A5-XMS", description: "Christmas A5 greeting card, foiled", hsCode: "4909.00", composition: "Card, foil, envelope", category: "Gift" },
  { code: "GFT-CARD-A5-BDY", description: "Birthday A5 card, debossed", hsCode: "4909.00", composition: "Card, envelope", category: "Gift" },
];

// -----------------------------------------------------------------
// Booking Rules (per client)
// -----------------------------------------------------------------
export const BOOKING_RULES: BookingRule[] = [
  {
    id: "BR-001",
    clientId: "CL-001",
    name: "Sea cut-off — 7 days before cargo ready",
    type: "Cut-off Window",
    mode: "Sea",
    config: { daysBeforeCargoReady: 7 },
    active: true,
    description: "Sea bookings must be submitted at least 7 days before the required cargo ready date.",
  },
  {
    id: "BR-002",
    clientId: "CL-001",
    name: "Air cut-off — 2 days before cargo ready",
    type: "Cut-off Window",
    mode: "Air",
    config: { daysBeforeCargoReady: 2 },
    active: true,
    description: "Air bookings must be submitted at least 2 days before the required cargo ready date.",
  },
  {
    id: "BR-003",
    clientId: "CL-001",
    name: "Quantity tolerance — ±5% or 50 units",
    type: "Quantity Tolerance",
    config: { percentage: 5, absoluteUnits: 50 },
    active: true,
    description: "Booking quantity may vary by ±5% or up to 50 units, whichever is lower.",
  },
  {
    id: "BR-004",
    clientId: "CL-001",
    name: "Handover window — 48h before sailing",
    type: "Handover Window",
    mode: "Sea",
    config: { earliestHoursBeforeSail: 96, latestHoursBeforeSail: 48 },
    active: true,
    description: "Cargo must be handed over between 96 and 48 hours before vessel departure.",
  },
  {
    id: "BR-005",
    clientId: "CL-001",
    name: "Auto-cancel — cargo not ready 5 days after cut-off",
    type: "Cancellation Trigger",
    config: { daysAfterCutoff: 5 },
    active: true,
    description: "If cargo is not confirmed ready within 5 days after the booking cut-off, the booking is auto-cancelled and an exception is raised.",
  },
];

// -----------------------------------------------------------------
// Critical Path Template (default 7 milestones)
// -----------------------------------------------------------------
const DEFAULT_TEMPLATE_MILESTONES: TemplateMilestone[] = [
  { type: "OrderReceived",  label: "Order Received",     sequence: 1, anchor: "OrderCreate",     upliftDays: 0,  toleranceDays: 0, owner: "Forwarder" },
  { type: "OrderAccepted",  label: "Order Accepted",     sequence: 2, anchor: "OrderReceived",   upliftDays: 3,  toleranceDays: 1, owner: "Supplier" },
  { type: "CargoReady",     label: "Ready at Printer",   sequence: 3, anchor: "OrderAccepted",   upliftDays: 18, toleranceDays: 2, owner: "Supplier" },
  { type: "QualityControl", label: "Quality Inspection", sequence: 4, anchor: "CargoReady",      upliftDays: 1,  toleranceDays: 1, owner: "Agent"    },
  { type: "ExportCustoms",  label: "Export Customs",     sequence: 5, anchor: "QualityControl",  upliftDays: 2,  toleranceDays: 1, owner: "Agent"    },
  { type: "Pickup",         label: "Pickup",             sequence: 6, anchor: "ExportCustoms",   upliftDays: 1,  toleranceDays: 1, owner: "Agent"    },
  { type: "Departure",      label: "Order Departure",    sequence: 7, anchor: "Pickup",          upliftDays: 1,  toleranceDays: 1, owner: "Forwarder" },
  { type: "Arrival",        label: "Order Arrival",      sequence: 8, anchor: "Departure",       upliftDays: 28, toleranceDays: 3, owner: "Forwarder" },
  { type: "Delivery",       label: "Delivery Required",  sequence: 9, anchor: "Arrival",         upliftDays: 4,  toleranceDays: 1, owner: "Forwarder" },
];

export const CRITICAL_PATH_TEMPLATES: CriticalPathTemplate[] = [
  {
    id: "CPT-001",
    clientId: "CL-001",
    name: "China → UK · Sea (Default)",
    origin: "China",
    destination: "United Kingdom",
    mode: "Sea",
    milestones: DEFAULT_TEMPLATE_MILESTONES,
  },
  {
    id: "CPT-002",
    clientId: "CL-001",
    name: "India → UK · Sea",
    origin: "India",
    destination: "United Kingdom",
    mode: "Sea",
    milestones: DEFAULT_TEMPLATE_MILESTONES.map((m) =>
      m.type === "Arrival" ? { ...m, upliftDays: 25 } : m
    ),
  },
  {
    id: "CPT-003",
    clientId: "CL-001",
    name: "Turkey → UK · Road",
    origin: "Turkey",
    destination: "United Kingdom",
    mode: "Road",
    milestones: DEFAULT_TEMPLATE_MILESTONES.map((m) =>
      m.type === "Arrival" ? { ...m, upliftDays: 8 } : m
    ),
  },
  {
    id: "CPT-004",
    clientId: "CL-001",
    name: "China → UK · Air",
    origin: "China",
    destination: "United Kingdom",
    mode: "Air",
    milestones: DEFAULT_TEMPLATE_MILESTONES.map((m) =>
      m.type === "Arrival" ? { ...m, upliftDays: 5 } : m
    ),
  },
];

// -----------------------------------------------------------------
// Date helpers (deterministic for SSR consistency)
// -----------------------------------------------------------------
const TODAY = new Date("2026-05-21");
function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function shiftToday(days: number): string {
  return addDays(TODAY, days);
}

// -----------------------------------------------------------------
// PO factory — builds a PO + lines + milestones + exceptions
// -----------------------------------------------------------------
interface POSeedConfig {
  id: string;
  supplierId: string;
  agentId?: string;
  origin: string;
  originCountry: string;
  mode: PurchaseOrder["mode"];
  channel: PurchaseOrder["channel"];
  cargoOffsetFromToday: number;
  deliveryOffsetFromToday: number;
  status: PurchaseOrder["status"];
  lines: { code: string; size?: string; colour?: string; qty: number; price: number; matched?: boolean }[];
  exceptions?: { type: ExceptionRecord["type"]; severity: ExceptionRecord["severity"]; description: string; daysAgo: number; status?: ExceptionRecord["status"] }[];
  notes?: string;
  versions?: number;
  bookingMissing?: boolean;
}

function buildPO(cfg: POSeedConfig): {
  po: PurchaseOrder;
  milestones: Milestone[];
  exceptions: ExceptionRecord[];
  booking?: BookingRequest;
} {
  const lines: POLine[] = cfg.lines.map((l, idx) => {
    const totalUnits = l.qty;
    const booked =
      cfg.status === "Pending Acceptance" || cfg.status === "Draft"
        ? 0
        : cfg.status === "Accepted"
          ? Math.floor(totalUnits * 0.6)
          : totalUnits;
    const shipped =
      cfg.status === "In Transit" || cfg.status === "Delivered"
        ? totalUnits
        : 0;
    const matched = l.matched !== false;
    return {
      id: `${cfg.id}-L${String(idx + 1).padStart(2, "0")}`,
      productCode: l.code,
      description: PRODUCT_MASTER.find((p) => p.code === l.code)?.description ?? l.code,
      size: l.size,
      colour: l.colour,
      quantityOrdered: totalUnits,
      quantityBooked: booked,
      quantityShipped: shipped,
      unitPrice: l.price,
      currency: "GBP",
      status: !matched
        ? "Pending Match"
        : cfg.status === "Delivered"
          ? "Closed"
          : shipped > 0
            ? "Shipped"
            : booked > 0
              ? "Booked"
              : "Open",
      matched,
    };
  });

  const totalUnits = lines.reduce((sum, l) => sum + l.quantityOrdered, 0);
  const totalValue = lines.reduce((sum, l) => sum + l.quantityOrdered * l.unitPrice, 0);

  // Milestones — apply default 9-step template
  const cargoReadyDate = shiftToday(cfg.cargoOffsetFromToday);
  const deliveryDate = shiftToday(cfg.deliveryOffsetFromToday);
  const orderReceivedDate = addDays(new Date(cargoReadyDate), -21);

  const milestoneDates: Record<string, string> = {
    OrderReceived: orderReceivedDate,
    OrderAccepted: addDays(new Date(orderReceivedDate), 3),
    CargoReady: cargoReadyDate,
    QualityControl: addDays(new Date(cargoReadyDate), 1),
    ExportCustoms: addDays(new Date(cargoReadyDate), 3),
    Pickup: addDays(new Date(cargoReadyDate), 4),
    Departure: addDays(new Date(cargoReadyDate), 5),
    Arrival: addDays(new Date(deliveryDate), -4),
    Delivery: deliveryDate,
  };

  const today = TODAY.toISOString().slice(0, 10);

  const milestones: Milestone[] = DEFAULT_TEMPLATE_MILESTONES.map((tpl, idx) => {
    const expectedDate = milestoneDates[tpl.type];
    const isPast = expectedDate < today;
    const isFuture = expectedDate >= today;

    let actualDate: string | undefined;
    let status: Milestone["status"] = "Pending";

    if (cfg.status === "Delivered") {
      actualDate = expectedDate;
      status = "Confirmed";
    } else if (cfg.status === "Cancelled") {
      status = idx === 0 ? "Confirmed" : "Skipped";
      actualDate = idx === 0 ? expectedDate : undefined;
    } else if (cfg.status === "In Transit") {
      if (tpl.sequence <= 7) {
        actualDate = expectedDate;
        status = "Confirmed";
      }
    } else if (cfg.status === "Booked" || cfg.status === "Accepted") {
      if (tpl.sequence <= 4) {
        actualDate = expectedDate;
        status = "Confirmed";
      } else if (tpl.sequence === 5 && isPast) {
        status = "Late";
      }
    } else if (cfg.status === "Pending Acceptance") {
      if (tpl.sequence === 1) {
        actualDate = expectedDate;
        status = "Confirmed";
      }
    } else if (cfg.status === "Exception") {
      if (tpl.sequence <= 5) {
        actualDate = expectedDate;
        status = "Confirmed";
      } else if (tpl.sequence === 6) {
        status = "Missed";
      }
    }

    if (status === "Pending" && isPast) status = "Late";

    const history: Milestone["history"] = [
      { id: `${cfg.id}-${tpl.type}-h1`, at: orderReceivedDate + "T09:30:00Z", user: "system", action: "created", note: `Generated from template ${cfg.origin}→UK · ${cfg.mode}` },
    ];
    if (actualDate) {
      history.push({
        id: `${cfg.id}-${tpl.type}-h2`,
        at: actualDate + "T11:00:00Z",
        user: tpl.owner === "Supplier" ? "supplier user" : tpl.owner === "Agent" ? "agent user" : "ops user",
        action: "confirmed",
        note: "Milestone confirmed",
      });
    }

    return {
      id: `${cfg.id}-MS${String(idx + 1).padStart(2, "0")}`,
      poId: cfg.id,
      type: tpl.type,
      label: tpl.label,
      sequence: tpl.sequence,
      upliftDays: tpl.upliftDays,
      expectedDate,
      actualDate,
      toleranceDays: tpl.toleranceDays,
      owner: tpl.owner,
      status,
      history,
    };
  });

  // Exceptions
  const exceptions: ExceptionRecord[] =
    (cfg.exceptions ?? []).map((e, i) => ({
      id: `${cfg.id}-EX${i + 1}`,
      poId: cfg.id,
      type: e.type,
      severity: e.severity,
      raisedAt: shiftToday(-e.daysAgo) + "T08:15:00Z",
      description: e.description,
      ownerRole: "Forwarder",
      status: e.status ?? "Open",
      notes: ["System: " + e.description],
    }));

  // Versions
  const versionCount = cfg.versions ?? 1;
  const versions = Array.from({ length: versionCount }, (_, v) => ({
    version: v + 1,
    date: addDays(new Date(orderReceivedDate), v * 5),
    changedBy: v === 0 ? "Eleanor Hartwell (Client Admin)" : v === 1 ? "ERP Push (API)" : "Wei Zhang (Supplier)",
    changeSummary:
      v === 0 ? "PO created" : v === 1 ? "Quantity adjusted on line 1" : "Required date pushed by 5 days",
    channel: cfg.channel,
  }));

  // Booking
  let booking: BookingRequest | undefined;
  if (!cfg.bookingMissing && cfg.status !== "Pending Acceptance" && cfg.status !== "Draft" && cfg.status !== "Cancelled") {
    booking = {
      id: `BR-${cfg.id.slice(3)}`,
      poId: cfg.id,
      supplierId: cfg.supplierId,
      requestedDate: addDays(new Date(orderReceivedDate), 5),
      cargoReadyDate,
      mode: cfg.mode,
      units: totalUnits,
      status: "Confirmed",
      bookingReference: `BK-${cfg.id.slice(3)}-01`,
      decidedAt: addDays(new Date(orderReceivedDate), 5) + "T14:22:00Z",
    };
  }

  // Documents
  const documents = cfg.status === "Draft" || cfg.status === "Pending Acceptance"
    ? []
    : [
        { id: `${cfg.id}-D1`, name: "packing-list-v1.pdf", type: "Packing List" as const, uploadedBy: "Wei Zhang", uploadedAt: shiftToday(-9) + "T11:20:00Z", size: "412 KB" },
        { id: `${cfg.id}-D2`, name: "qc-report.pdf", type: "QC Report" as const, uploadedBy: "Henry Chen", uploadedAt: shiftToday(-7) + "T09:55:00Z", size: "1.2 MB" },
      ];

  const supplierName = SUPPLIERS.find((s) => s.id === cfg.supplierId)?.name ?? "";

  const po: PurchaseOrder = {
    id: cfg.id,
    version: versionCount,
    clientId: "CL-001",
    supplierId: cfg.supplierId,
    agentId: cfg.agentId,
    origin: cfg.origin,
    originCountry: cfg.originCountry,
    destination: "Felixstowe, UK",
    destinationCountry: "United Kingdom",
    mode: cfg.mode,
    channel: cfg.channel,
    cargoReadyDate,
    deliveryRequiredDate: deliveryDate,
    createdAt: orderReceivedDate,
    status: cfg.status,
    totalValue,
    currency: "GBP",
    totalUnits,
    lines,
    versions,
    documents,
    bookingId: booking?.id,
    shipmentId: cfg.status === "In Transit" || cfg.status === "Delivered" ? `SHP-${cfg.id.slice(3)}` : undefined,
    exceptionsOpen: exceptions.filter((e) => e.status === "Open").length,
    notes: cfg.notes ?? `Supplier: ${supplierName}. Standard ${cfg.mode.toLowerCase()} routing via ${cfg.origin}.`,
  };

  return { po, milestones, exceptions, booking };
}

// -----------------------------------------------------------------
// Build the dataset
// -----------------------------------------------------------------
const SEED_CONFIGS: POSeedConfig[] = [
  // — Active book of work —
  {
    id: "PO-83042", supplierId: "SUP-101", agentId: "AG-201", origin: "Hangzhou, CN", originCountry: "China",
    mode: "Sea", channel: "API", cargoOffsetFromToday: -1, deliveryOffsetFromToday: 39, status: "Booked", versions: 2,
    lines: [
      { code: "BK-CHILD-A4-HC-128", qty: 4800, price: 2.45 },
      { code: "BK-NOV-PB-320", size: "B-format", qty: 6200, price: 1.20 },
    ],
    exceptions: [
      { type: "Missed milestone", severity: "medium", description: "QC inspection scheduled date passed without confirmation.", daysAgo: 1 },
    ],
  },
  {
    id: "PO-83043", supplierId: "SUP-101", agentId: "AG-201", origin: "Hangzhou, CN", originCountry: "China",
    mode: "Sea", channel: "API", cargoOffsetFromToday: 4, deliveryOffsetFromToday: 38, status: "Accepted",
    lines: [{ code: "BK-COOK-HC-256", qty: 3000, price: 4.60 }],
  },
  {
    id: "PO-83045", supplierId: "SUP-101", agentId: "AG-201", origin: "Hangzhou, CN", originCountry: "China",
    mode: "Sea", channel: "API", cargoOffsetFromToday: -8, deliveryOffsetFromToday: 24, status: "In Transit",
    lines: [{ code: "BK-EDU-SB-96", qty: 12500, price: 0.85 }],
  },
  {
    id: "PO-83048", supplierId: "SUP-101", agentId: "AG-201", origin: "Hangzhou, CN", originCountry: "China",
    mode: "Air", channel: "Portal", cargoOffsetFromToday: 7, deliveryOffsetFromToday: 14, status: "Pending Acceptance",
    lines: [{ code: "BK-ART-HC-192", qty: 800, price: 8.20 }],
  },
  {
    id: "PO-83050", supplierId: "SUP-102", agentId: "AG-205", origin: "Mumbai, IN", originCountry: "India",
    mode: "Sea", channel: "CSV", cargoOffsetFromToday: 6, deliveryOffsetFromToday: 33, status: "Accepted",
    lines: [
      { code: "STN-NB-A5-LIN", qty: 5400, price: 0.92 },
      { code: "STN-NB-A5-DOT", qty: 3600, price: 1.35 },
    ],
  },
  {
    id: "PO-83051", supplierId: "SUP-102", agentId: "AG-205", origin: "Mumbai, IN", originCountry: "India",
    mode: "Sea", channel: "CSV", cargoOffsetFromToday: -4, deliveryOffsetFromToday: 22, status: "Booked",
    lines: [{ code: "STN-PEN-RB-BLK", qty: 22000, price: 0.42 }],
  },
  {
    id: "PO-83052", supplierId: "SUP-102", agentId: "AG-205", origin: "Mumbai, IN", originCountry: "India",
    mode: "Air", channel: "Portal", cargoOffsetFromToday: 1, deliveryOffsetFromToday: 8, status: "Booked",
    lines: [{ code: "GFT-CARD-A5-XMS", qty: 1500, price: 0.65 }],
    exceptions: [
      { type: "Booking rule breach", severity: "high", description: "Booking submitted 1 day after Air mode cut-off (rule BR-002).", daysAgo: 0 },
    ],
  },
  {
    id: "PO-83055", supplierId: "SUP-103", agentId: "AG-202", origin: "Ho Chi Minh, VN", originCountry: "Vietnam",
    mode: "Sea", channel: "XML", cargoOffsetFromToday: -2, deliveryOffsetFromToday: 30, status: "Booked",
    lines: [{ code: "BK-NOV-PB-320", qty: 7200, price: 1.15 }],
  },
  {
    id: "PO-83057", supplierId: "SUP-103", agentId: "AG-202", origin: "Ho Chi Minh, VN", originCountry: "Vietnam",
    mode: "Sea", channel: "XML", cargoOffsetFromToday: 9, deliveryOffsetFromToday: 41, status: "Pending Acceptance",
    lines: [
      { code: "BK-CHILD-A4-HC-128", qty: 5500, price: 2.55, matched: false },
      { code: "BK-COOK-HC-256", qty: 1200, price: 4.80 },
    ],
    notes: "Line 1 product code does not match Product Master — flagged for ops review.",
  },
  {
    id: "PO-83059", supplierId: "SUP-104", agentId: "AG-203", origin: "Istanbul, TR", originCountry: "Turkey",
    mode: "Road", channel: "Portal", cargoOffsetFromToday: -5, deliveryOffsetFromToday: 4, status: "In Transit",
    lines: [{ code: "STN-NB-A5-DOT", qty: 4200, price: 1.45 }],
  },
  {
    id: "PO-83060", supplierId: "SUP-104", agentId: "AG-203", origin: "Istanbul, TR", originCountry: "Turkey",
    mode: "Road", channel: "Portal", cargoOffsetFromToday: 11, deliveryOffsetFromToday: 21, status: "Accepted",
    lines: [{ code: "STN-NB-A5-LIN", qty: 3800, price: 1.05 }],
  },
  {
    id: "PO-83063", supplierId: "SUP-105", agentId: "AG-204", origin: "Casablanca, MA", originCountry: "Morocco",
    mode: "Road", channel: "API", cargoOffsetFromToday: 3, deliveryOffsetFromToday: 12, status: "Booked",
    lines: [{ code: "GFT-CARD-A5-BDY", qty: 8500, price: 0.55 }],
  },
  {
    id: "PO-83064", supplierId: "SUP-105", agentId: "AG-204", origin: "Casablanca, MA", originCountry: "Morocco",
    mode: "Sea", channel: "API", cargoOffsetFromToday: -3, deliveryOffsetFromToday: 8, status: "In Transit",
    lines: [{ code: "GFT-CARD-A5-XMS", qty: 9000, price: 0.58 }],
  },
  {
    id: "PO-83067", supplierId: "SUP-106", agentId: "AG-205", origin: "Bangalore, IN", originCountry: "India",
    mode: "Sea", channel: "CSV", cargoOffsetFromToday: 14, deliveryOffsetFromToday: 41, status: "Pending Acceptance",
    lines: [{ code: "BK-EDU-SB-96", qty: 18000, price: 0.78 }],
  },
  // — Historic / closed —
  {
    id: "PO-82990", supplierId: "SUP-101", agentId: "AG-201", origin: "Hangzhou, CN", originCountry: "China",
    mode: "Sea", channel: "API", cargoOffsetFromToday: -45, deliveryOffsetFromToday: -12, status: "Delivered",
    lines: [{ code: "BK-CHILD-A4-HC-128", qty: 3500, price: 2.40 }],
  },
  {
    id: "PO-82992", supplierId: "SUP-102", agentId: "AG-205", origin: "Mumbai, IN", originCountry: "India",
    mode: "Sea", channel: "CSV", cargoOffsetFromToday: -38, deliveryOffsetFromToday: -10, status: "Delivered",
    lines: [{ code: "STN-PEN-RB-BLK", qty: 18000, price: 0.41 }],
  },
  {
    id: "PO-82998", supplierId: "SUP-103", agentId: "AG-202", origin: "Ho Chi Minh, VN", originCountry: "Vietnam",
    mode: "Sea", channel: "XML", cargoOffsetFromToday: -50, deliveryOffsetFromToday: -15, status: "Delivered",
    lines: [{ code: "BK-NOV-PB-320", qty: 6000, price: 1.18 }],
  },
  // — Cancelled / exception heavy —
  {
    id: "PO-83020", supplierId: "SUP-104", agentId: "AG-203", origin: "Istanbul, TR", originCountry: "Turkey",
    mode: "Road", channel: "Portal", cargoOffsetFromToday: -10, deliveryOffsetFromToday: 1, status: "Exception",
    lines: [{ code: "STN-NB-A5-DOT", qty: 2200, price: 1.40 }],
    exceptions: [
      { type: "Missed milestone", severity: "high", description: "Pickup missed by 3 days — driver no-show twice.", daysAgo: 3 },
      { type: "Quantity shortfall", severity: "medium", description: "Booked qty 2,000 vs PO 2,200 — outside ±5% tolerance.", daysAgo: 2 },
    ],
  },
  {
    id: "PO-83025", supplierId: "SUP-101", agentId: "AG-201", origin: "Hangzhou, CN", originCountry: "China",
    mode: "Sea", channel: "API", cargoOffsetFromToday: -20, deliveryOffsetFromToday: -2, status: "Cancelled",
    lines: [{ code: "BK-COOK-HC-256", qty: 1800, price: 4.55 }],
    exceptions: [
      { type: "Cancellation trigger", severity: "high", description: "Auto-cancelled — cargo not ready 5 days after cut-off (rule BR-005).", daysAgo: 18, status: "Resolved" },
    ],
  },
  // — Forward-looking pipeline —
  {
    id: "PO-83070", supplierId: "SUP-101", agentId: "AG-201", origin: "Hangzhou, CN", originCountry: "China",
    mode: "Sea", channel: "API", cargoOffsetFromToday: 18, deliveryOffsetFromToday: 49, status: "Pending Acceptance",
    lines: [{ code: "BK-NOV-PB-320", qty: 9500, price: 1.22 }],
  },
  {
    id: "PO-83071", supplierId: "SUP-102", agentId: "AG-205", origin: "Mumbai, IN", originCountry: "India",
    mode: "Sea", channel: "CSV", cargoOffsetFromToday: 22, deliveryOffsetFromToday: 50, status: "Pending Acceptance",
    lines: [
      { code: "STN-NB-A5-LIN", qty: 4000, price: 0.94 },
      { code: "STN-NB-A5-DOT", qty: 2800, price: 1.36 },
    ],
  },
  {
    id: "PO-83072", supplierId: "SUP-105", agentId: "AG-204", origin: "Casablanca, MA", originCountry: "Morocco",
    mode: "Road", channel: "API", cargoOffsetFromToday: 28, deliveryOffsetFromToday: 38, status: "Draft",
    lines: [{ code: "GFT-CARD-A5-BDY", qty: 6500, price: 0.56 }],
  },
];

const built = SEED_CONFIGS.map(buildPO);

export const PURCHASE_ORDERS: PurchaseOrder[] = built.map((b) => b.po);
export const MILESTONES: Milestone[] = built.flatMap((b) => b.milestones);
export const EXCEPTIONS: ExceptionRecord[] = built.flatMap((b) => b.exceptions);
export const BOOKING_REQUESTS: BookingRequest[] = built
  .map((b) => b.booking)
  .filter((b): b is BookingRequest => Boolean(b));

// -----------------------------------------------------------------
// Third-party shipments (Control Tower)
// -----------------------------------------------------------------
export const THIRD_PARTY_SHIPMENTS: ThirdPartyShipment[] = [
  {
    id: "TPS-9001", carrier: "Maersk Line", scac: "MAEU", mbl: "MAEU-228731122",
    containers: ["MSKU7283912", "MSKU7283913"], pol: "Yantian, CN", pod: "Felixstowe, UK",
    etd: shiftToday(-12), eta: shiftToday(15), status: "In Transit",
    lastEvent: "Vessel passing Suez Canal", lastEventAt: shiftToday(-2) + "T17:30:00Z",
  },
  {
    id: "TPS-9002", carrier: "MSC", scac: "MSCU", mbl: "MEDU-441002288",
    containers: ["MSCU2218811"], pol: "Shanghai, CN", pod: "Southampton, UK",
    etd: shiftToday(-25), eta: shiftToday(-1), status: "Arrived",
    lastEvent: "Discharged at terminal", lastEventAt: shiftToday(-1) + "T08:10:00Z",
  },
  {
    id: "TPS-9003", carrier: "Hapag-Lloyd", scac: "HLCU", mbl: "HLCU-117283344",
    containers: ["HLBU7811223"], pol: "Mundra, IN", pod: "Felixstowe, UK",
    etd: shiftToday(-8), eta: shiftToday(18), status: "Delayed",
    lastEvent: "Vessel delayed off Salalah due to weather", lastEventAt: shiftToday(-1) + "T05:45:00Z",
  },
  {
    id: "TPS-9004", carrier: "DSV Air & Sea", scac: "DSVE", mbl: "DSV-AWB-882231",
    containers: ["AWB-882231"], pol: "Pudong, CN", pod: "London Heathrow, UK",
    etd: shiftToday(-1), eta: shiftToday(2), status: "On Schedule",
    lastEvent: "AWB received at PVG", lastEventAt: shiftToday(-1) + "T22:15:00Z",
  },
];

// -----------------------------------------------------------------
// Notifications
// -----------------------------------------------------------------
export const NOTIFICATIONS: Notification[] = [
  { id: "N1", at: shiftToday(0) + "T09:14:00Z", title: "Booking accepted", message: "PO-83052 — booking BK-83052-01 confirmed.", read: false, type: "success", link: "/orders/PO-83052" },
  { id: "N2", at: shiftToday(0) + "T08:45:00Z", title: "Exception raised", message: "PO-83042 — QC inspection missed expected date.", read: false, type: "warning", link: "/orders/PO-83042" },
  { id: "N3", at: shiftToday(-1) + "T16:20:00Z", title: "Unmatched product", message: "PO-83057 line BK-CHILD-A4-HC-128 not found in Product Master.", read: false, type: "warning", link: "/orders/PO-83057" },
  { id: "N4", at: shiftToday(-1) + "T11:02:00Z", title: "TMS handover complete", message: "PO-83045 — shipment SHP-83045 created in Neurored.", read: true, type: "info", link: "/orders/PO-83045" },
  { id: "N5", at: shiftToday(-2) + "T14:48:00Z", title: "Booking rejected", message: "PO-83052 — Air cut-off rule BR-002 breached.", read: true, type: "error", link: "/orders/PO-83052" },
  { id: "N6", at: shiftToday(-3) + "T10:30:00Z", title: "Auto-cancellation", message: "PO-83025 cancelled — cargo not ready 5 days after cut-off.", read: true, type: "error", link: "/orders/PO-83025" },
];

// -----------------------------------------------------------------
// Lookups
// -----------------------------------------------------------------
export function findPO(id: string): PurchaseOrder | undefined {
  return PURCHASE_ORDERS.find((p) => p.id === id);
}
export function findSupplier(id: string): Account | undefined {
  return SUPPLIERS.find((s) => s.id === id);
}
export function findAgent(id?: string): Account | undefined {
  return id ? AGENTS.find((a) => a.id === id) : undefined;
}
export function milestonesForPO(poId: string): Milestone[] {
  return MILESTONES.filter((m) => m.poId === poId).sort((a, b) => a.sequence - b.sequence);
}
export function exceptionsForPO(poId: string): ExceptionRecord[] {
  return EXCEPTIONS.filter((e) => e.poId === poId);
}
export function bookingForPO(poId: string): BookingRequest | undefined {
  return BOOKING_REQUESTS.find((b) => b.poId === poId);
}
