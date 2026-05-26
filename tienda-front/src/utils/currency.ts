import { CurrencyState } from "@/redux/features/currency-slice";

export const formatPrice = (priceInUSD: number, currency: CurrencyState): string => {
  if (!priceInUSD && priceInUSD !== 0) return "";
  
  const convertedPrice = priceInUSD * currency.exchangeRate;
  
  // Si la moneda es CLP, normalmente se muestra sin decimales.
  // Para USD u otras, se muestran 2 decimales.
  const isCLP = currency.code === 'CLP';
  
  const formattedNumber = convertedPrice.toLocaleString('es-CL', {
    minimumFractionDigits: isCLP ? 0 : 2,
    maximumFractionDigits: isCLP ? 0 : 2,
  });

  return `${currency.symbol}${formattedNumber} ${currency.code}`;
};

export const calculateConvertedPrice = (priceInUSD: number, currency: CurrencyState): number => {
  const convertedPrice = priceInUSD * currency.exchangeRate;
  const isCLP = currency.code === 'CLP';
  return isCLP ? Math.round(convertedPrice) : Number(convertedPrice.toFixed(2));
};
