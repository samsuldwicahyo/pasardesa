import type { UserRole } from "@prisma/client";

export const DASHBOARD_HOME: Record<UserRole, string> = {
  SUPER_ADMIN: "/dashboard/super-admin/tenants",
  BUMDES_ADMIN: "/dashboard/tenant",
  SELLER: "/dashboard/seller",
};

export function getDashboardHome(role: UserRole) {
  return DASHBOARD_HOME[role];
}

export function canReviewTenantOrder(role: UserRole) {
  return role === "SUPER_ADMIN" || role === "BUMDES_ADMIN" || role === "SELLER";
}

export function isTenantRole(role: UserRole) {
  return role === "BUMDES_ADMIN" || role === "SELLER";
}
