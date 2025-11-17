import {
  normalizeUserType as normalizeUserTypeShared,
  requiresCompanyName as requiresCompanyNameShared,
  type AnyUserType,
  type UserType,
} from "@shared/user";

const USER_TYPE_LABELS: Record<UserType, string> = {
  BEDRIJF: "Bedrijf",
  ZZP: "ZZP'er",
  BUREAU: "Bureau",
  SOLLICITANT: "Werkzoekende",
};

const USER_TYPE_ICONS: Record<UserType, string> = {
  BEDRIJF: "fas fa-building",
  ZZP: "fas fa-user",
  BUREAU: "fas fa-users",
  SOLLICITANT: "fas fa-user-check",
};

const normalizeUserTypeValue = (userType: string | AnyUserType | null | undefined) =>
  normalizeUserTypeShared(userType ?? null);

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export function getUserTypeLabel(userType: string | AnyUserType | null | undefined): string {
  const normalized = normalizeUserTypeValue(userType);
  return normalized ? USER_TYPE_LABELS[normalized] : String(userType ?? "");
}

export function getUserTypeIcon(userType: string | AnyUserType | null | undefined): string {
  const normalized = normalizeUserTypeValue(userType);
  return normalized ? USER_TYPE_ICONS[normalized] : "fas fa-user";
}

export function formatDate(date: Date | string | null): string {
  if (!date) {return "Onbekend";}

  const normalizedDate = typeof date === "string" ? new Date(date) : date;
  return normalizedDate.toLocaleDateString("nl-NL", {
    year: "numeric",
    month: "long",
  });
}

export const requiresCompanyName = (userType: string | AnyUserType | null | undefined) => {
  const normalized = normalizeUserTypeShared(userType ?? null);
  return normalized ? requiresCompanyNameShared(normalized) : false;
};

export { normalizeUserTypeValue as normalizeUserType, USER_TYPE_LABELS };
