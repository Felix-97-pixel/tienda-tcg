/**
 * Enum that restricts the allowed transaction types for store credit operations.
 * Matches the string values stored in the `type` column of `StoreCreditTransaction`.
 */
export enum CreditTransactionType {
  /** Admin manually adds credit (e.g., tournament prize, goodwill). */
  MANUAL_ADD = 'MANUAL_ADD',

  /** Admin manually subtracts credit (e.g., correction). */
  MANUAL_SUBTRACT = 'MANUAL_SUBTRACT',

  /** Credit added via a trade-in (cards received from customer). */
  BUYLIST_TRADE = 'BUYLIST_TRADE',

  /** Credit spent on an in-store purchase. */
  STORE_PURCHASE = 'STORE_PURCHASE',

  /** Credit spent on an online order. */
  PURCHASE = 'PURCHASE',
}
