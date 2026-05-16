import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useToast } from "@/hooks/useToast";

export const useProductCart = (item: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();
  const cartItems = useAppSelector((state: any) => state.cartReducer.items);

  const cartItem = cartItems.find((ci: any) => ci.id === item?.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const availableStock = item?.stock !== undefined && item?.stock !== null ? item.stock - quantityInCart : 999;
  const isMaxStockReached = item?.stock !== undefined && item?.stock !== null ? quantityInCart >= item.stock : false;

  const handleAddToCart = (quantityToAdd = 1) => {
    if (!item) return;

    if (item.stock === 0) {
      showToast("Este producto no tiene stock disponible", "error");
      return;
    }

    if (quantityInCart + quantityToAdd > (item.stock ?? 999)) {
      showToast("Has alcanzado el máximo de stock disponible", "warning");
      return;
    }

    const cartItem = {
      id: item.id,
      title: item.title || item.name,
      price: item.price || 0,
      discountedPrice: item.discountedPrice || 0,
      quantity: quantityToAdd,
      imgs: item.imgs || {
        thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
        previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
      },
      stock: item.stock || 999,
      inventoryItemId: item.inventoryItemId || (item.items?.[0]?.id),
    };

    dispatch(addItemToCart(cartItem));

    showToast(`"${cartItem.title}" agregado al carro`, "success");
  };

  return { handleAddToCart, quantityInCart, isMaxStockReached, availableStock };
};
