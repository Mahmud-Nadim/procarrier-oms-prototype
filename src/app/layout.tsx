import "./globals.css";
import type { Metadata } from "next";
import { RoleProvider } from "@/lib/role-context";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "Pro Carrier Horizon — OMS Prototype",
  description: "Order Management System prototype for Pro Carrier Horizon 2.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RoleProvider>
          <Shell>{children}</Shell>
        </RoleProvider>
      </body>
    </html>
  );
}
