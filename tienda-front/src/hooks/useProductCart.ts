import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";

export const useProductCart = (item: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useAppSelector((state: any) => state.cartReducer.items);
  
  const cartItem = cartItems.find((ci: any) => ci.id === item?.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const availableStock = item?.stock !== undefined && item?.stock !== null ? item.stock - quantityInCart : 999;
  const isMaxStockReached = item?.stock !== undefined && item?.stock !== null ? quantityInCart >= item.stock : false;

  const handleAddToCart = (quantityToAdd = 1) => {
    if (!item) return;
    if (item.stock === 0 || quantityInCart + quantityToAdd > (item.stock ?? 999)) return;
    
    dispatch(
      addItemToCart({
        ...item,
        quantity: quantityToAdd,
      })
    );
  };

  return { handleAddToCart, quantityInCart, isMaxStockReached, availableStock };
};
