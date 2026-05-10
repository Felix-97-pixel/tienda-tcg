export type Condition = {
  id: string;
  name: string;
};

export type Language = {
  id: string;
  name: string;
  code: string;
};

export type InventoryItem = {
  id: string;
  price: number;
  stock: number;
  isFoil: boolean;
  conditionId: string;
  languageId: string;
  condition: Condition;
  language: Language;
};

export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number | string;
  inventoryItemId?: string;
  category?: {
    id: string;
    name: string;
    isTcg: boolean;
  };
  stock?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  items?: InventoryItem[];
};
