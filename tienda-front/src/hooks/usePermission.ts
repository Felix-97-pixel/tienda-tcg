"use client";
import { useAppSelector } from "@/redux/store";

export type Permission =
  | "WALLET_READ"
  | "WALLET_WITHDRAW"
  | "TEAM_LOCAL_MANAGE"
  | "TEAM_CORPORATE_MANAGE"
  | "POS_ACCESS"
  | "CASH_SHIFT_MANAGE"
  | "STORE_CREDIT_REDEEM"
  | "CATALOG_READ"
  | "LOCAL_STOCK_MANAGE"
  | "GLOBAL_PRICE_SYNC"
  | "ORDERS_DISPATCH"
  | "ORDERS_MANAGE_ALL"
  | "LOCAL_STORE_SETTINGS"
  | "HOLDING_SETTINGS";

/**
 * Hook para evaluar de forma declarativa si el usuario activo posee un permiso específico.
 */
export function usePermission(permission: Permission): boolean {
  const { user } = useAppSelector((state) => state.adminAuthReducer);
  if (!user) return false;
  if (user.role === "SUPERADMIN" || user.sessionType === "SUPERADMIN") return true;
  return user.permissions?.includes(permission) ?? false;
}

/**
 * Evalúa si el usuario posee al menos uno de los permisos provistos (OR).
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { user } = useAppSelector((state) => state.adminAuthReducer);
  if (!user) return false;
  if (user.role === "SUPERADMIN" || user.sessionType === "SUPERADMIN") return true;
  return permissions.some((p) => user.permissions?.includes(p));
}

/**
 * Evalúa si el usuario posee todos los permisos provistos (AND).
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { user } = useAppSelector((state) => state.adminAuthReducer);
  if (!user) return false;
  if (user.role === "SUPERADMIN" || user.sessionType === "SUPERADMIN") return true;
  return permissions.every((p) => user.permissions?.includes(p));
}

