export interface Currency {
  id: number;
  code: string;
  name: string | null;
  symbol: string;
  exchangeRate: number;
  isDefault: boolean;
}
