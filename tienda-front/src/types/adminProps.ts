import React from "react";
import { Brand } from "./brand";
import { AdminCategory } from "./adminCategory";
import { Order } from "./order";
import { RecentOrder, TopProduct } from "./adminSale";
import { Product } from "./product";

export interface BrandTableProps {
  brands: Brand[];
  loading: boolean;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
}

export interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  onSuccess: () => void;
}

export interface CategoryTableProps {
  categories: AdminCategory[];
  loading: boolean;
  onEdit: (cat: AdminCategory) => void;
  onDelete: (cat: AdminCategory) => void;
}

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: AdminCategory | null;
  onSuccess: () => void;
}

export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
}

export interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  statusClasses: Record<string, string>;
  statusLabel: (status: string) => string;
  onViewDetails: (order: Order) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string, name: string }[];
  onSuccess: () => void;
}

export interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string, name: string }[];
  brands: { id: string, name: string }[];
  onSuccess: () => void;
}

export interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    productId: string;
    categoryId: string;
    brandId: string;
    imageUrl: string;
    productName: string;
    itemId: string;
    price: number;
    stock: number;
  } | null;
  categories: { id: string, name: string }[];
  brands: { id: string, name: string }[];
  onSuccess: () => void;
}

export interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedExpansion: string;
  onExpansionChange: (val: string) => void;
  categories: { id: string, name: string }[];
  expansions: { name: string, products: number }[];
}

export interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product, item: any) => void;
  onInventory: (product: Product) => void;
  onDelete: (product: Product) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export interface RecentOrdersListProps {
  orders: RecentOrder[];
}

export interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export interface TopProductsListProps {
  products: TopProduct[];
}
