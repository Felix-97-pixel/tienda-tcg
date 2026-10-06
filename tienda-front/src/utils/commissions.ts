import { MP_COMMISSION } from "./constants";

export const calculateCommissions = (netPrice: number, taptradeRate: number) => {
  const totalComRate = taptradeRate + MP_COMMISSION;
  if (!netPrice || netPrice <= 0) return { gross: 0, taptrade: 0, mp: 0, totalCom: 0 };
  
  // Redondeo hacia arriba en pasos de 50 (ej: 1.969 -> 2.000, 1.937 -> 1.950)
  const gross = Math.ceil(netPrice / (1 - totalComRate) / 50) * 50;
  const taptrade = gross * taptradeRate;
  const mp = gross * MP_COMMISSION;
  
  return { gross, taptrade, mp, totalCom: taptrade + mp };
};
