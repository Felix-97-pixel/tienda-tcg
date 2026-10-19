export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

export interface VendorOrderData {
  id: string;
  storeId?: string;
  shippingCost?: string | number;
  subtotal?: string | number;
  status: string;
  deliveryStatus?: string | null; // "PENDING_DISPATCH" | "DISPATCHED" | "DELIVERED"
  shippingCourier?: string | null; // "STARKEN" | "CHILEXPRESS" | "CORREOS_CHILE" | "BLUE_EXPRESS" | "RETIRO_TIENDA"
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  dispatchedAt?: string | null;
  store: { id: string; name: string };
  items: OrderItem[];
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
  notes?: string;
  vendorOrders: VendorOrderData[];
  payment?: {
    status: string;
    authCode?: string;
    cardLast4?: string;
  } | null;
}

