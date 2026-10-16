import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
  id: number | string;
  productId?: string;
  inventoryItemId?: string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  stock?: number;
  condition?: string;
  language?: string;
  finish?: string;
  cardSet?: string;
  categoryName?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  [key: string]: any;
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const existingItem = state.items.find(
        (item) =>
          item.id === action.payload.id ||
          (action.payload.productId && item.productId === action.payload.productId)
      );

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + (action.payload.quantity || 1);
      } else {
        state.items.push({
          ...action.payload,
        });
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<number | string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;
export default wishlist.reducer;
