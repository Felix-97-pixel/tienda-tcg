export enum Permission {
  // Billetera & Retiros (Holding)
  WALLET_READ = 'WALLET_READ',
  WALLET_WITHDRAW = 'WALLET_WITHDRAW',

  // Gestión de Personal & Accesos
  TEAM_LOCAL_MANAGE = 'TEAM_LOCAL_MANAGE',
  TEAM_CORPORATE_MANAGE = 'TEAM_CORPORATE_MANAGE',

  // Punto de Venta & Caja Local
  POS_ACCESS = 'POS_ACCESS',
  CASH_SHIFT_MANAGE = 'CASH_SHIFT_MANAGE',
  STORE_CREDIT_REDEEM = 'STORE_CREDIT_REDEEM',

  // Catálogo, Precios & Inventario
  CATALOG_READ = 'CATALOG_READ',
  LOCAL_STOCK_MANAGE = 'LOCAL_STOCK_MANAGE',
  GLOBAL_PRICE_SYNC = 'GLOBAL_PRICE_SYNC',

  // Pedidos & Despachos
  ORDERS_DISPATCH = 'ORDERS_DISPATCH',
  ORDERS_MANAGE_ALL = 'ORDERS_MANAGE_ALL',

  // Configuración de Tiendas & Holding
  LOCAL_STORE_SETTINGS = 'LOCAL_STORE_SETTINGS',
  HOLDING_SETTINGS = 'HOLDING_SETTINGS',

  // Contabilidad y Reportes Financieros (Superadmin / Contador)
  ACCOUNTING_READ = 'ACCOUNTING_READ',
}

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  SUPERADMIN: Object.values(Permission),
  COMPANY_OWNER: Object.values(Permission),
  COMPANY_ADMIN: [
    Permission.WALLET_READ,
    Permission.WALLET_WITHDRAW,
    Permission.ORDERS_MANAGE_ALL,
    Permission.CATALOG_READ,
    Permission.POS_ACCESS,
  ],
  BRANCH_MANAGER: [
    Permission.POS_ACCESS,
    Permission.CASH_SHIFT_MANAGE,
    Permission.STORE_CREDIT_REDEEM,
    Permission.CATALOG_READ,
    Permission.LOCAL_STOCK_MANAGE,
    Permission.GLOBAL_PRICE_SYNC,
    Permission.ORDERS_DISPATCH,
    Permission.TEAM_LOCAL_MANAGE,
    Permission.LOCAL_STORE_SETTINGS,
  ],
  CASHIER: [
    Permission.POS_ACCESS,
    Permission.CASH_SHIFT_MANAGE,
    Permission.STORE_CREDIT_REDEEM,
    Permission.CATALOG_READ,
    Permission.ORDERS_DISPATCH,
  ],
};

