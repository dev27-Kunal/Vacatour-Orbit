/**
 * Job-related utility functions for employment types, status, and formatting
 * Extracted from my-jobs.tsx to follow CLAUDE C-4 (functions ≤20 lines)
 */

/**
 * Get human-readable employment type label
 */
export function getEmploymentTypeLabel(type: string): string {
  switch (type) {
    case "VAST": return "Vast dienstverband";
    case "INTERIM": return "Interim";
    case "UITZENDEN": return "Uitzendwerk";
    default: return type;
  }
}

/**
 * Get badge variant for employment type
 */
export function getEmploymentTypeBadgeVariant(type: string): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "VAST": return "default";
    case "INTERIM": return "secondary";
    case "UITZENDEN": return "outline";
    default: return "default";
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string): string {
  switch (status) {
    case "OPEN": return "Open";
    case "PAUSED": return "Gepauzeerd";
    case "CLOSED": return "Gesloten";
    default: return status;
  }
}

/**
 * Get badge variant for job status
 */
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "OPEN": return "default";
    case "PAUSED": return "secondary";
    case "CLOSED": return "destructive";
    default: return "outline";
  }
}

/**
 * Format salary display with proper localization
 */
export function formatSalary(salary: number | null, hourlyRate: number | null): string {
  if (salary) {
    return `€${salary.toLocaleString()} per jaar`;
  }
  if (hourlyRate) {
    return `€${hourlyRate} per uur`;
  }
  return "Op aanvraag";
}

/**
 * Format date for display in Dutch locale
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}