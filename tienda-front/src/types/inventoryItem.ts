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
