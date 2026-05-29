import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addYears, addMonths, isBefore, differenceInDays } from "date-fns";
import type { Equipment, EquipmentType } from "@/types/database";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeExpirationDate(equipment: Equipment & { equipment_types: EquipmentType }): Date | null {
  const type = equipment.equipment_types;
  const dates: Date[] = [];

  if (type.max_lifetime_years && equipment.manufacture_date) {
    dates.push(addYears(new Date(equipment.manufacture_date), type.max_lifetime_years));
  }
  if (type.max_use_lifetime_years && equipment.first_use_date) {
    dates.push(addYears(new Date(equipment.first_use_date), type.max_use_lifetime_years));
  }

  if (dates.length === 0) return null;
  return dates.reduce((earliest, d) => isBefore(d, earliest) ? d : earliest);
}

export function computeNextInspectionDate(lastInspectionDate: Date, intervalMonths: number): Date {
  return addMonths(lastInspectionDate, intervalMonths);
}

export function getEquipmentStatusColor(status: string): string {
  switch (status) {
    case "ok": return "text-green-600 bg-green-50 border-green-200";
    case "inspect_soon": return "text-orange-600 bg-orange-50 border-orange-200";
    case "to_replace": return "text-red-600 bg-red-50 border-red-200";
    case "retired": return "text-gray-500 bg-gray-100 border-gray-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getEquipmentStatusLabel(status: string): string {
  switch (status) {
    case "ok": return "OK";
    case "inspect_soon": return "À inspecter";
    case "to_replace": return "À remplacer";
    case "retired": return "Hors service";
    default: return status;
  }
}

export function getDaysUntilExpiration(expirationDate: Date): number {
  return differenceInDays(expirationDate, new Date());
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("fr-FR").format(new Date(dateStr));
}
