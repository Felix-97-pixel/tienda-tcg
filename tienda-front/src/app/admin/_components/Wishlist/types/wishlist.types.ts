export interface WishlistProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  wishlistCount: number;
  category: { name: string };
  cardDetail?: {
    expansion: string;
    rarity: string;
  };
  inStock?: boolean;
  stockCount?: number;
  isOnBuylist?: boolean;
  marketPrice?: number;
  storePrice?: number;
}

export type WishlistFilterType = 'ALL' | 'INSTOCK' | 'OUTOFSTOCK';
