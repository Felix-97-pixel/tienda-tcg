export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  isTcg?: boolean;
  productCount?: number;
}
