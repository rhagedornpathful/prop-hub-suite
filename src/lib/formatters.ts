import { format } from "date-fns";

export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return format(new Date(date), "MMM dd, h:mm a");
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Unknown";
}

export function formatAddress(address?: string | null, city?: string | null, state?: string | null): string {
  const parts = [address, [city, state].filter(Boolean).join(", ")].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown";
}
