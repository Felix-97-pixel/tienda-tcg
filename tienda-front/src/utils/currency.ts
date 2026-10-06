import { CurrencyState } from "@/redux/features/currency-slice";

export const formatPrice = (price: number, currency?: CurrencyState): string => {
  if (!price && price !== 0) return "";
  
  const formattedNumber = price.toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `$${formattedNumber} CLP`;
};

export const calculateConvertedPrice = (price: number, currency?: CurrencyState): number => {
  return Math.round(price);
};
