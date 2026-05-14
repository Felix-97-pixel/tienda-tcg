export interface InventoryItem {
  id: string;
  price: number;
  stock: number;
  condition: string;
  isFoil: boolean;
  languageId?: string;
  conditionId?: string;
  language?: { name: string };
  condition_rel?: { name: string }; // Dependiendo de cómo venga del backend
}

export interface Category {
  id: string;
  name: string;
  isTcg: boolean;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId?: string;
  imageUrl?: string;
  description?: string;
  category?: Category;
  brand?: Brand;
  cardDetail?: {
    expansion: string;
    rarity: string;
  };
  items: InventoryItem[];
  wishlistCount?: number;
}

export interface ProductCreateInput {
  name: string;
  categoryId: string;
  brandId: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
}
