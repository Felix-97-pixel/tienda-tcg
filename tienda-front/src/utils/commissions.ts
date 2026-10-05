import { MP_COMMISSION } from "./constants";

export const calculateCommissions = (netPrice: number, taptradeRate: number) => {
  const totalComRate = taptradeRate + MP_COMMISSION;
  if (!netPrice || netPrice <= 0) return { gross: 0, taptrade: 0, mp: 0, totalCom: 0 };
  
  const gross = netPrice / (1 - totalComRate);
  const taptrade = gross * taptradeRate;
  const mp = gross * MP_COMMISSION;
  
  return { gross, taptrade, mp, totalCom: taptrade + mp };
};
