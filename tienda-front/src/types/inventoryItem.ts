export interface InventoryItem {
  id: string;
  price: number;
  stock: number;
  condition: string | { name: string; displayName?: string | null };
  finishId?: string;
  languageId?: string;
  conditionId?: string;
  language?: { name: string };
  condition_rel?: { name: string; displayName?: string | null };
  finish?: { name: string };
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  store?: {
    id: string;
    name: string;
  };
}
