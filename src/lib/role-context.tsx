"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Role } from "./types";

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  // Per-role identity for scoping
  identity: {
    name: string;
    accountId: string;
    accountName: string;
    initials: string;
  };
}

const ROLE_IDENTITIES: Record<Role, RoleContextValue["identity"]> = {
  "client-admin": {
    name: "Eleanor Hartwell",
    accountId: "CL-001",
    accountName: "Northbridge Publishing Group",
    initials: "EH",
  },
  supplier: {
    name: "Wei Zhang",
    accountId: "SUP-101",
    accountName: "Hangzhou Print Works",
    initials: "WZ",
  },
  agent: {
    name: "Henry Chen",
    accountId: "AG-201",
    accountName: "Pearl River Logistics",
    initials: "HC",
  },
  ops: {
    name: "James Coombs",
    accountId: "PC-OPS",
    accountName: "Pro Carrier Operations",
    initials: "JC",
  },
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("client-admin");
  return (
    <RoleContext.Provider value={{ role, setRole, identity: ROLE_IDENTITIES[role] }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}

export const ROLE_LABELS: Record<Role, string> = {
  "client-admin": "Client Admin",
  supplier: "Supplier",
  agent: "Origin Agent",
  ops: "Pro Carrier Ops",
};
