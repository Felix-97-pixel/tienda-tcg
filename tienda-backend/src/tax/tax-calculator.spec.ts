import {
  grossFromNet,
  netFromGross,
  breakdownFromGross,
  breakdownFromNet,
  exemptBreakdown,
  roundToCLP,
  resolveExchangeRateFromLists,
  calculateProductPriceCLP,
  DEFAULT_VAT_RATE,
} from './tax-calculator';

describe('TaxCalculator (Normativa Tributaria Chilena SII)', () => {
  describe('grossFromNet', () => {
    it('debe calcular correctamente el valor bruto a partir de $10.000 neto (19% IVA)', () => {
      expect(grossFromNet(10000)).toBe(11900);
    });

    it('debe redondear al entero CLP más cercano', () => {
      // 1001 * 1.19 = 1191.19 -> 1191
      expect(grossFromNet(1001)).toBe(1191);
      // 1005 * 1.19 = 1195.95 -> 1196
      expect(grossFromNet(1005)).toBe(1196);
    });

    it('debe rechazar montos no enteros o negativos', () => {
      expect(() => grossFromNet(10.5)).toThrow();
      expect(() => grossFromNet(-100)).toThrow();
    });
  });

  describe('netFromGross', () => {
    it('debe calcular $10.000 neto a partir de $11.900 bruto', () => {
      expect(netFromGross(11900)).toBe(10000);
    });

    it('debe calcular $8.403 neto a partir de $10.000 bruto', () => {
      // 10000 / 1.19 = 8403.361... -> 8403
      expect(netFromGross(10000)).toBe(8403);
    });

    it('debe calcular $420 neto a partir de $500 bruto (tarifa 5%)', () => {
      // 500 / 1.19 = 420.168... -> 420
      expect(netFromGross(500)).toBe(420);
    });
  });

  describe('breakdownFromGross (Boletas Electrónicas)', () => {
    it('debe cuadrar exactamente: Neto + IVA === Bruto para $11.900', () => {
      const breakdown = breakdownFromGross(11900);
      expect(breakdown).toEqual({
        net: 10000,
        vat: 1900,
        gross: 11900,
        rate: DEFAULT_VAT_RATE,
      });
      expect(breakdown.net + breakdown.vat).toBe(breakdown.gross);
    });

    it('debe cuadrar exactamente: Neto + IVA === Bruto para $10.000 (redondeo hacia abajo)', () => {
      const breakdown = breakdownFromGross(10000);
      expect(breakdown).toEqual({
        net: 8403,
        vat: 1597,
        gross: 10000,
        rate: DEFAULT_VAT_RATE,
      });
      expect(breakdown.net + breakdown.vat).toBe(breakdown.gross);
    });

    it('debe cuadrar exactamente para montos pequeños de $1 peso', () => {
      const breakdown = breakdownFromGross(1);
      expect(breakdown).toEqual({
        net: 1,
        vat: 0,
        gross: 1,
        rate: DEFAULT_VAT_RATE,
      });
      expect(breakdown.net + breakdown.vat).toBe(breakdown.gross);
    });

    it('debe cuadrar para $0', () => {
      const breakdown = breakdownFromGross(0);
      expect(breakdown).toEqual({
        net: 0,
        vat: 0,
        gross: 0,
        rate: DEFAULT_VAT_RATE,
      });
    });
  });

  describe('breakdownFromNet (Facturas Electrónicas)', () => {
    it('debe calcular IVA y Total a partir de $10.000 neto', () => {
      const breakdown = breakdownFromNet(10000);
      expect(breakdown).toEqual({
        net: 10000,
        vat: 1900,
        gross: 11900,
        rate: DEFAULT_VAT_RATE,
      });
    });
  });

  describe('exemptBreakdown', () => {
    it('debe tratar todo como neto y 0 IVA', () => {
      const breakdown = exemptBreakdown(5000);
      expect(breakdown).toEqual({
        net: 5000,
        vat: 0,
        gross: 5000,
        rate: 0,
      });
    });
  });

  describe('roundToCLP y calculateProductPriceCLP (Ley de Redondeo Nº 20.956 - Unificación Tienda / Inventario / POS)', () => {
    it('debe redondear a la decena más cercana eliminando monedas de $1 y $5 pesos ($11.687 -> $11.690)', () => {
      expect(roundToCLP(11687)).toBe(11690);
      expect(roundToCLP(11684)).toBe(11680);
      expect(roundToCLP(11685)).toBe(11690);
      expect(roundToCLP(0)).toBe(0);
      expect(roundToCLP(-50)).toBe(0);
    });

    it('debe calcular $11.690 CLP y desglose exacto ($9.824 Neto + $1.866 IVA) para carta de 8.99 USD a tasa $1.300 CLP', () => {
      const finalPriceCLP = calculateProductPriceCLP(8.99, true, 1300);
      expect(finalPriceCLP).toBe(11690);

      const breakdown = breakdownFromGross(finalPriceCLP);
      expect(breakdown).toEqual({
        net: 9824,
        vat: 1866,
        gross: 11690,
        rate: DEFAULT_VAT_RATE,
      });
    });

    it('debe resolver jerarquía de tasa de cambio (Tienda -> Global -> Fallback 1000)', () => {
      const storeRates = [{ gameId: 'mtg', rate: 1300 }];
      const globalRates = [
        { gameId: 'mtg', rate: 950 },
        { gameId: 'pkmn', rate: 1100 },
      ];

      expect(resolveExchangeRateFromLists('mtg', storeRates, globalRates)).toBe(1300);
      expect(resolveExchangeRateFromLists('pkmn', storeRates, globalRates)).toBe(1100);
      expect(resolveExchangeRateFromLists('ygo', storeRates, globalRates)).toBe(1000);
      expect(resolveExchangeRateFromLists(null, storeRates, globalRates)).toBe(1000);
    });
  });
});

