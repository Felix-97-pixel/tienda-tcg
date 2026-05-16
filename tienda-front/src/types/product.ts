export interface InventoryItem {
  id: string;
  price: number;
  stock: number;
  condition: string;
  finishId?: string;
  languageId?: string;
  conditionId?: string;
  language?: { name: string };
  condition_rel?: { name: string };
  finish?: { name: string };
}

export interface Category {
  id: string;
  name: string;
  isTcg: boolean;
  slug?: string;
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
    game?: string;
    expansion: string;
    rarity: string;
    collectorNum?: string | number;
    attributes?: string[];
  };
  items: InventoryItem[];
  wishlistCount?: number;

  // Campos de compatibilidad con la UI (mapeados en el frontend)
  title?: string;
  price?: number;
  discountedPrice?: number;
  stock?: number;
  reviews?: number;
  inventoryItemId?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
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
