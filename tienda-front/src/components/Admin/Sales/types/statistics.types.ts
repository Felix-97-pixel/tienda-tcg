import { TopProduct } from "@/types/adminSale";

export interface RevenueStats {
  todayRevenue: number;
  thisMonth: number;
}

export interface OperationalStats {
  pendingFulfillment: number;
  lowStockItems?: any[]; // Podríamos tiparlo si supiéramos la forma de low stock items
}

export interface OrdersStats {
  paid: number;
  pending: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface AdminStatistics {
  orders: OrdersStats;
  revenue: RevenueStats;
  operational: OperationalStats;
  topProducts: TopProduct[];
  monthlyRevenues: MonthlyRevenue[];
}
