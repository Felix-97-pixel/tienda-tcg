import { MP_COMMISSION } from "./constants";

export const calculateCommissions = (netPrice: number, taptradeRate: number = 0) => {
  if (!netPrice || netPrice <= 0) {
    return { gross: 0, taptrade: 0, mp: 0, totalCom: 0, storeNet: 0, taptradePure: 0, roundingAdjustment: 0 };
  }
  
  // SaaS Model: Con 0% de comisión, el precio bruto es exactamente el precio neto de la tienda
  if (!taptradeRate || taptradeRate <= 0) {
    return {
      gross: netPrice,
      taptrade: 0,
      taptradePure: 0,
      roundingAdjustment: 0,
      mp: 0,
      totalCom: 0,
      storeNet: netPrice,
    };
  }

  const totalComRate = taptradeRate + MP_COMMISSION;
  // Redondeo hacia arriba en pasos de 50 (ej: 1.969 -> 2.000)
  const gross = Math.ceil(netPrice / (1 - totalComRate) / 50) * 50;
  const mp = gross * MP_COMMISSION;
  const storeNet = netPrice;
  const taptradePure = gross * taptradeRate;
  const roundingAdjustment = gross - mp - storeNet - taptradePure;
  const taptrade = taptradePure + roundingAdjustment;
  
  return { gross, taptrade, taptradePure, roundingAdjustment, mp, totalCom: taptrade + mp, storeNet };
};
