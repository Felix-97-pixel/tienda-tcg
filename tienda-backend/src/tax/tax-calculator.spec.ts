import {
  grossFromNet,
  netFromGross,
  breakdownFromGross,
  breakdownFromNet,
  exemptBreakdown,
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
});

