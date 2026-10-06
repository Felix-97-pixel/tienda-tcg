import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

type InitialState = {
  items: CartItem[];
  appliedCoupons: AppliedCoupon[];
};

type CartItem = {
  id: number | string;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  inventoryItemId?: string;
  stock?: number;
  storeId?: string;
  storeName?: string;
  productId?: string;
  language?: string;
  condition?: string;
  finish?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  categoryId?: string;
  gameId?: string;
};

export type AppliedCoupon = {
  id: string;
  code: string;
  storeId: string;
  discountPercent: number;
  scope: string;
  categories: { id: string }[];
  games: { id: string }[];
  applicableItemIds?: string[];
};

const initialState: InitialState = {
  items: [],
  appliedCoupons: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, title, price, quantity, discountedPrice, imgs, stock, productId, language, condition, finish } =
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
          productId,
          title,
          price,
          quantity: quantity > actualStock ? actualStock : quantity,
          discountedPrice,
          inventoryItemId: action.payload.inventoryItemId,
          stock: actualStock,
          storeId: action.payload.storeId,
          storeName: action.payload.storeName,
          language,
          condition,
          finish,
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
    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      // Evitar agregar el mismo cupón dos veces
      state.appliedCoupons = state.appliedCoupons.filter(c => c.code !== action.payload.code);
      state.appliedCoupons.push(action.payload);
    },
    removeCoupon: (state, action: PayloadAction<string>) => {
      state.appliedCoupons = state.appliedCoupons.filter(c => c.code !== action.payload);
    },
    clearCoupons: (state) => {
      state.appliedCoupons = [];
    }
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;
export const selectAppliedCoupons = (state: RootState) => state.cartReducer.appliedCoupons;

export const selectCartItemsWithDiscounts = createSelector(
  [selectCartItems, selectAppliedCoupons],
  (items, coupons) => {
    return items.map(item => {
      let finalPrice = item.discountedPrice;
      let appliedCoupon = null;

      if (item.storeId) {
        const storeCoupons = coupons.filter(c => c.storeId === item.storeId);
        let bestCoupon = null;
        let maxDiscount = 0;

        for (const coupon of storeCoupons) {
          let applies = false;
          if (coupon.applicableItemIds) {
            // Lista calculada por el backend (fuente de verdad)
            applies = coupon.applicableItemIds.includes(String(item.inventoryItemId || item.id));
          } else {
            if (coupon.scope === 'STORE_WIDE') applies = true;
            if (coupon.scope === 'CATEGORY_SPECIFIC' && item.categoryId && coupon.categories.some(c => c.id === item.categoryId)) applies = true;
            if (coupon.scope === 'GAME_SPECIFIC' && item.gameId && coupon.games.some(g => g.id === item.gameId)) applies = true;
          }

          if (applies && coupon.discountPercent > maxDiscount) {
            maxDiscount = coupon.discountPercent;
            bestCoupon = coupon;
          }
        }

        if (bestCoupon) {
          finalPrice = item.discountedPrice * (1 - (bestCoupon.discountPercent / 100));
          appliedCoupon = bestCoupon;
        }
      }

      return {
        ...item,
        originalPrice: item.discountedPrice,
        finalPrice: parseFloat(finalPrice.toFixed(2)),
        discountAmount: parseFloat((item.discountedPrice - finalPrice).toFixed(2)),
        appliedCouponCode: appliedCoupon?.code,
      };
    });
  }
);

export const selectTotalPrice = createSelector([selectCartItemsWithDiscounts], (items) => {
  const total = items.reduce((acc, item) => {
    return acc + item.finalPrice * item.quantity;
  }, 0);
  return parseFloat(total.toFixed(2));
});

export const selectTotalDiscount = createSelector([selectCartItemsWithDiscounts], (items) => {
  const totalDiscount = items.reduce((acc, item) => {
    return acc + item.discountAmount * item.quantity;
  }, 0);
  return parseFloat(totalDiscount.toFixed(2));
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  applyCoupon,
  removeCoupon,
  clearCoupons,
} = cart.actions;
export default cart.reducer;
