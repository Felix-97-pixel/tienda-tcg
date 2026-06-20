/**
 * Describes the shape of a single item attached to a store credit transaction.
 * This is the structure stored in the `itemsData` JSON column.
 *
 * We store a snapshot of the product data at transaction time so the record
 * remains valid even if the product is later deleted or modified.
 */
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
