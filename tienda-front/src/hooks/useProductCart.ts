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

    dispatch(
      addItemToCart({
        ...item,
        quantity: quantityToAdd,
      })
    );

    showToast(`"${item.title}" agregado al carro`, "success");
  };

  return { handleAddToCart, quantityInCart, isMaxStockReached, availableStock };
};
