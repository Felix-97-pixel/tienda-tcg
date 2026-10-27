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
  slug?: string;
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

const CART_STORAGE_KEY = "taptrade_cart_v1";

const getInitialCartState = (): InitialState => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          items: Array.isArray(parsed.items) ? parsed.items : [],
          appliedCoupons: Array.isArray(parsed.appliedCoupons) ? parsed.appliedCoupons : [],
        };
      }
    } catch (e) {
      console.warn("Error cargando carrito desde localStorage:", e);
    }
  }
  return {
    items: [],
    appliedCoupons: [],
  };
};

const saveCartToStorage = (state: InitialState) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          items: state.items,
          appliedCoupons: state.appliedCoupons,
        })
      );
    } catch (e) {
      console.warn("Error guardando carrito en localStorage:", e);
    }
  }
};

const initialState: InitialState = getInitialCartState();

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
          slug: action.payload.slug,
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
      saveCartToStorage(state);
    },
    removeItemFromCart: (state, action: PayloadAction<number | string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      saveCartToStorage(state);
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
      saveCartToStorage(state);
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
      state.appliedCoupons = [];
      saveCartToStorage(state);
    },
    applyCoupon: (state, action: PayloadAction<AppliedCoupon>) => {
      // Evitar agregar el mismo cupón dos veces
      state.appliedCoupons = state.appliedCoupons.filter(c => c.code !== action.payload.code);
      state.appliedCoupons.push(action.payload);
      saveCartToStorage(state);
    },
    removeCoupon: (state, action: PayloadAction<string>) => {
      state.appliedCoupons = state.appliedCoupons.filter(c => c.code !== action.payload);
      saveCartToStorage(state);
    },
    clearCoupons: (state) => {
      state.appliedCoupons = [];
      saveCartToStorage(state);
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
