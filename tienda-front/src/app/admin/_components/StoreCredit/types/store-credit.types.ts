// ─── Domain Types ───────────────────────────────────────────────────────────

/** Represents a user's store credit balance as returned by GET /store-credit */
export interface StoreCredit {
  id: string;
  storeId: string;
  userId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  user?: StoreCreditUser;
}

/** Minimal user info embedded in store credit responses. */
export interface StoreCreditUser {
  id: string;
  name: string | null;
  email: string;
}

/** A single transaction in the store credit history. */
export interface StoreCreditTransaction {
  id: string;
  storeId: string;
  userId: string;
  amount: number;
  type: CreditTransactionType;
  reference: string | null;
  itemsData: TransactionItemData[] | null;
  createdAt: string;
}

// ─── Enums (mirrors backend) ────────────────────────────────────────────────

export enum CreditTransactionType {
  MANUAL_ADD = 'MANUAL_ADD',
  MANUAL_SUBTRACT = 'MANUAL_SUBTRACT',
  BUYLIST_TRADE = 'BUYLIST_TRADE',
  STORE_PURCHASE = 'STORE_PURCHASE',
  PURCHASE = 'PURCHASE',
}

// ─── Item Data (snapshot stored in JSON column) ─────────────────────────────

/** Shape of each item stored in `itemsData` on a transaction. */
export interface TransactionItemData {
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    setName?: string;
  };
  quantity: number;
  price: number;
  condition?: string;
  language?: string;
  finish?: string;
}

// ─── Form State Types ───────────────────────────────────────────────────────

/** A card/product added to the trade-in list in the modal form. */
export interface TradeInCard {
  product: TradeInProduct;
  quantity: number;
  price: number;
  condition: string;
  language: string;
  finish: string;
}

/** Minimal product info needed for the trade-in card display. */
export interface TradeInProduct {
  id: string;
  name: string;
  imageUrl?: string;
  setName?: string;
}

/** Metadata option (condition, language, finish) from the API. */
export interface MetaOption {
  id: string;
  name: string;
}

/** The type selector values for the modal. */
export type AdjustmentType = 'MANUAL_ADD' | 'MANUAL_SUBTRACT';
