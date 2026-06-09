"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Compass,
  AlertTriangle,
  BarChart3,
  Settings,
  Users,
  FileSpreadsheet,
  ClipboardList,
  Globe,
  Boxes,
  Workflow,
} from "lucide-react";
import { useRole } from "@/lib/role-context";
import { Role } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
}

const NAV: NavItem[] = [
  { href: "/", label: "OMS Dashboard", icon: LayoutDashboard, roles: ["client-admin", "supplier", "agent", "ops"] },
  { href: "/orders", label: "Purchase Orders", icon: ShoppingCart, roles: ["client-admin", "supplier", "ops"] },
  { href: "/jobs", label: "My Jobs", icon: ClipboardList, roles: ["agent"] },
  { href: "/bookings", label: "Bookings", icon: Boxes, roles: ["client-admin", "supplier", "ops"] },
  { href: "/critical-path", label: "Critical Path", icon: Compass, roles: ["client-admin", "supplier", "agent", "ops"] },
  { href: "/exceptions", label: "Exceptions", icon: AlertTriangle, roles: ["client-admin", "ops"] },
  { href: "/control-tower", label: "Control Tower", icon: Globe, roles: ["client-admin", "ops"] },
  { href: "/shipments", label: "Shipments", icon: Truck, roles: ["client-admin", "ops"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["client-admin", "ops"] },
  { href: "/admin/tms", label: "TMS Handover", icon: Workflow, roles: ["ops"] },
  { href: "/admin/rules", label: "Booking Rules", icon: FileSpreadsheet, roles: ["ops"] },
  { href: "/admin/templates", label: "Critical Path Templates", icon: Compass, roles: ["ops"] },
  { href: "/admin/accounts", label: "Supplier & Agent Accounts", icon: Users, roles: ["ops"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["client-admin", "supplier", "agent", "ops"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useRole();
  const items = NAV.filter((n) => n.roles.includes(role));

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 z-40 h-screen w-[270px]"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88))",
        borderRight: "1px solid rgba(233,233,233,0.9)",
        boxShadow: "14px 0 34px rgba(50, 42, 109, 0.05)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white font-bold"
            style={{ background: "linear-gradient(135deg, #4bbbba 0%, #322a6d 120%)" }}
          >
            H
          </div>
          <div>
            <div className="font-display text-[15px] font-bold leading-none text-midnight">Pro Carrier</div>
            <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-teal">Horizon · OMS</div>
          </div>
        </div>
        <div className="h-px" style={{ background: "#E9E9E9" }} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 pt-5 pb-4 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-[18px] px-3.5 py-2.5 transition"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, #4bbbba 0%, #322a6d 120%)",
                          color: "#FFFFFF",
                          boxShadow: "0 8px 22px rgba(50,42,109,0.22)",
                        }
                      : { color: "#404040", backgroundColor: "rgba(255,255,255,0.55)" }
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="text-[14px] font-semibold tracking-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-midnight-10 p-4">
        <div className="rounded-xl bg-gradient-to-r from-teal-10 to-midnight-10 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-midnight">OMS Prototype</div>
          <div className="mt-0.5 text-[11px] text-ink-muted">Horizon 2.0 · Phase 2</div>
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
            <span className="text-[10px] font-medium text-green">Live preview</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
