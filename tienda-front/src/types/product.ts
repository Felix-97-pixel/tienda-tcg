export type Product = {
  title: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  id: number | string;
  inventoryItemId?: string;
  category?: string;
  stock?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};
