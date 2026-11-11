# Política de Precios, Tarifas de Servicio y Tratamiento Tributario (SII) - TapTrade

**Razón Social:** TAPTRADE SpA  
**RUT:** 78.531.106-K  
**Fecha de Actualización:** 11 de Noviembre de 2026  
**Versión:** 3.0 (Modelo de Comisión al Vendedor con Opción de Traslado +3% y Redondeo a la Decena)

---

## 1. Principios Fundamentales del Modelo de Negocio

TapTrade opera como un **Marketplace Especializado en Trading Card Games (TCG) con Custodia Transitoria (Escrow)** y herramientas de gestión SaaS para comercios y coleccionistas.

1. **Comisión de Plataforma (Take Rate de 3.00% Neto + IVA 19%):**
   * Por cada venta completada, TapTrade aplica una comisión de intermediación tecnológica del **3.00% neto más IVA (19%)**.
   * Esta comisión es de cargo de la tienda vendedora y se deduce directamente de la liquidación de fondos (*payout*) en el libro mayor de custodia (*escrow ledger*).
   * TapTrade emite a la tienda la **Factura de Comisión** correspondiente, permitiendo a la tienda utilizar ese IVA como **Crédito Fiscal** ante el SII.

2. **Transparencia Total en el Checkout (0% Recargo Sorpresa al Comprador):**
   * El comprador final en el Checkout paga exclusivamente:
     $$\text{Total a Pagar} = \text{Subtotal Productos (IVA incluido)} + \text{Total Despacho (IVA incluido)}$$
   * Se eliminan por completo las líneas adicionales de sobrecargo de comisión o tarifas bancarias separadas en la boleta del comprador, garantizando una experiencia de compra limpia, moderna y alineada al estándar de la industria.

3. **Interruptor de Estrategia de Comisión para la Tienda:**
   Cada tienda dispone de un interruptor tanto en la **gestión de inventario**, en la **subida masiva de productos (CSV)** y en la **sincronización de precios de mercado (TCGPlayer / Scryfall)**:
   * **Opción A ("Trasladar Comisión al Comprador" - Switch ACTIVADO):**
     La tienda traslada el 3% al precio de venta para que el comprador final asuma el costo de la plataforma. El precio de catálogo se incrementa en +3% y se aplica la **Ley del Redondeo a la Decena (`Math.ceil`)**.
   * **Opción B ("Absorber Comisión en Tienda" - Switch DESACTIVADO):**
     La tienda mantiene el precio exacto de mercado o su precio base. El 3% + IVA se deduce íntegramente de su liquidación de pago.

---

## 2. Matemática del Redondeo y Distribución de Fondos (Ley Nº 20.956)

En Chile rige la **Ley del Redondeo (Ley Nº 20.956)** que eliminó las monedas de $1 y $5 pesos. Todo precio comercial al consumidor final se redondea a la **decena más cercana (múltiplo de $10)**.

### Caso Práctico 1: Tienda con Interruptor ACTIVADO (Traslado de Comisión)
- **Precio Base Tienda:** $100 CLP (o su conversión desde USD).
- **Recargo de Comisión (3%):** $\$100 \times 1.03 = \$103\text{ CLP}$.
- **Redondeo hacia arriba a la Decena:** $\text{Math.ceil}(103 / 10) \times 10 = \mathbf{\$110\text{ CLP}}$.
- **PVP Publicado al Público:** **$110 CLP** (con IVA 19% incluido).

#### ¿Cómo se reparten los $110 CLP cuando el cliente compra?
1. **Comisión TapTrade SpA (3% neto + IVA):**
   - Comisión neta (3%): $\text{Math.round}(110 \times 0.03) = \mathbf{\$3\text{ CLP}}$.
   - IVA Débito Fiscal TapTrade (19%): $\text{Math.round}(3 \times 0.19) = \mathbf{\$1\text{ CLP}}$.
   - **Total Comisión Retenida por TapTrade:** $\$3 + \$1 = \mathbf{\$4\text{ CLP}}$.
   *(TapTrade factura a la tienda $4 CLP con $1 de Crédito Fiscal).*
2. **Abono Líquido a la Tienda (Payout):**
   $$\text{Abono a Tienda} = \text{PVP } (\$110) - \text{Comisión TapTrade } (\$4) = \mathbf{\$106\text{ CLP}}$$
   *(La tienda quería $100 y gracias al redondeo recibe $106 limpios, superando su margen base).*
3. **Tratamiento de IVA de la Venta para la Tienda:**
   - Venta neta tienda: $\text{Math.round}(110 / 1.19) = \mathbf{\$92\text{ CLP}}$.
   - Débito Fiscal IVA F29 de la tienda: $\$110 - \$92 = \mathbf{\$18\text{ CLP}}$.
   - Crédito Fiscal de la factura TapTrade: $\mathbf{\$1\text{ CLP}}$.
   - IVA neto a pagar por la tienda al SII: $\$18 - \$1 = \mathbf{\$17\text{ CLP}}$.

---

### Caso Práctico 2: Tienda con Interruptor DESACTIVADO (Absorción de Comisión)
- **Precio Base Tienda:** $100 CLP.
- **PVP Publicado al Público:** **$100 CLP** (redondeado).
- **Comisión TapTrade Retenida:** $4 CLP ($3 neto + $1 IVA).
- **Abono Líquido a la Tienda (Payout):** $\$100 - \$4 = \mathbf{\$96\text{ CLP}}$.

---

## 3. Matriz de Puntos de Control en el Software

| Módulo | Componente | Comportamiento del Interruptor |
| :--- | :--- | :--- |
| **Gestión de Inventario** | `InventoryModal.tsx` | Permite alternar entre PVP con recargo +3% o absorción, mostrando en vivo: PVP, IVA F29, Comisión TapTrade y Líquido a Transferir. |
| **Subida Masiva CSV** | `BulkUploadModal.tsx` | Permite subir lotes de cartas aplicando automáticamente el +3% con redondeo a decena a los precios importados. |
| **Sincronización de Precios** | `/admin/price-sync` | Permite sincronizar contra TCGPlayer / Scryfall aplicando el factor +3% y redondeo a la decena en vivo. |
| **Checkout del Comprador** | `checkout/_components/index.tsx` | Total = Subtotal Productos + Despacho. 0% comisiones sorpresas cobradas al comprador. |
| **Motor de Pagos Backend** | `CheckoutPricingService` | Cotiza `amountToCharge = productsTotal + shippingTotal`. Registra en `vendorOrder.sellerCommissionGross` la comisión retenida a cada tienda. |
