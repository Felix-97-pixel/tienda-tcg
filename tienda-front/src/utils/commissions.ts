import { MP_COMMISSION } from "./constants";

export const calculateCommissions = (netPrice: number, taptradeRate: number) => {
  const totalComRate = taptradeRate + MP_COMMISSION;
  if (!netPrice || netPrice <= 0) return { gross: 0, taptrade: 0, mp: 0, totalCom: 0 };
  
  // Redondeo hacia arriba en pasos de 50 (ej: 1.969 -> 2.000)
  const gross = Math.ceil(netPrice / (1 - totalComRate) / 50) * 50;
  
  // MercadoPago cobra su comisión sobre el precio bruto final
  const mp = gross * MP_COMMISSION;
  
  // La tienda recibe exactamente lo que pidió.
  const storeNet = netPrice;
  // Comisión pura de Taptrade según su tarifa
  const taptradePure = gross * taptradeRate;
  // Lo sobrante debido al redondeo de 50
  const roundingAdjustment = gross - mp - storeNet - taptradePure;
  // Lo que Taptrade se queda en total
  const taptrade = taptradePure + roundingAdjustment;
  
  return { gross, taptrade, taptradePure, roundingAdjustment, mp, totalCom: taptrade + mp, storeNet };
};
