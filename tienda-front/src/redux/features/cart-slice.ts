import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
};

type CartItem = {
  id: number | string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  stock?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs, stock } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      
      const actualStock = stock !== undefined ? stock : 999;

      if (existingItem) {
        if (existingItem.quantity + quantity <= actualStock) {
          existingItem.quantity += quantity;
        } else {
          existingItem.quantity = actualStock;
        }
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity: quantity > actualStock ? actualStock : quantity,
          discountedPrice,
          stock: actualStock,
          imgs,
        });
      }
    },
    removeItemFromCart: (state, action: PayloadAction<number | string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number | string; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        const actualStock = existingItem.stock !== undefined ? existingItem.stock : 999;
        if (quantity <= actualStock) {
          existingItem.quantity = quantity;
        } else {
          existingItem.quantity = actualStock;
        }
      }
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  const total = items.reduce((acc, item) => {
    return acc + item.discountedPrice * item.quantity;
  }, 0);
  return parseFloat(total.toFixed(2));
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
