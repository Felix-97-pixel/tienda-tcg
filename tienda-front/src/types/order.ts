export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  buyOrder: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  totalAmount: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
  payment?: {
    status: string;
    authCode?: string;
  } | null;
}
