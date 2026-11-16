import type { Metadata } from "next";
import { SalesDashboard } from "@/components/sales/SalesDashboard";

export const metadata: Metadata = {
  title: "Sales Dashboard — RoofCraft",
  description: "Assign roofing leads to sales reps and track call outcomes without overlap.",
};

export default function SalesPage() {
  return <SalesDashboard />;
}
