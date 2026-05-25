export interface RecentOrder {
  id: string;
  buyOrder: string;
  name: string;
  email: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalUnits: number;
  timesOrdered: number;
}
