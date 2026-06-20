import { API_URL } from "@/utils/api";
import { Product } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  
  try {
    const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    const rawData = await res.json();
    const productList = rawData.data || rawData; // Support older or new schema seamlessly
    
    return productList.map((item: any) => {
      const defaultPrice = item.items?.[0]?.price || 0;
      const defaultStock = item.items?.[0]?.stock || 0;
      return {
        id: item.id,
        title: item.name,
        reviews: 0,
        price: parseFloat(defaultPrice),
        discountedPrice: parseFloat(defaultPrice),
        inventoryItemId: item.items?.[0]?.id ?? undefined,
        stock: parseInt(defaultStock, 10),
        imgs: {
          thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
          previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
        }
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
