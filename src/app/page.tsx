"use client";

import { useRole } from "@/lib/role-context";
import { ClientAdminDashboard } from "@/components/dashboards/client-admin";
import { SupplierDashboard } from "@/components/dashboards/supplier";
import { AgentDashboard } from "@/components/dashboards/agent";
import { OpsDashboard } from "@/components/dashboards/ops";

export default function HomePage() {
  const { role } = useRole();
  if (role === "supplier") return <SupplierDashboard />;
  if (role === "agent") return <AgentDashboard />;
  if (role === "ops") return <OpsDashboard />;
  return <ClientAdminDashboard />;
}
