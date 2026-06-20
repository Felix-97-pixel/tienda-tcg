export interface ChartDataItem {
  date?: string;
  amount?: number;
  status?: string;
  count?: number;
  name?: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface OrderData {
  createdAt: string;
  totalAmount: number;
}

export interface VendorOrderData {
  status: string;
}

export interface ProductPreference {
  cardDetail?: {
    expansion: string;
  };
}

export interface InventoryItemPreference {
  language?: {
    name: string;
  };
}

export interface SalesReportData {
  inventory: {
    totalValue: number;
    deadStockCount: number;
  };
  financial: {
    transactions: any[];
    orders: OrderData[];
    vendorOrders: VendorOrderData[];
  };
  preferences: {
    products: ProductPreference[];
    inventoryItems: InventoryItemPreference[];
  };
}
