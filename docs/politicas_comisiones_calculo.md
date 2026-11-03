# Política de Precios, Tarifas de Servicio y Tratamiento Tributario (SII) - TapTrade

**Razón Social:** TAPTRADE SpA  
**RUT:** 78.531.106-K  
**Fecha de Actualización:** 3 de Noviembre de 2026  
**Versión:** 2.2 (Desglose Transparente: Comisión TapTrade 3% + IVA y Costo Pasarela de Pago)

---

## 1. Principios Fundamentales del Modelo de Negocio

TapTrade opera bajo un modelo híbrido de **Software como Servicio (SaaS)** para tiendas especializadas en Trading Card Games (TCG) y un **Marketplace Multi-Tienda con Custodia Segura (Escrow)** para compradores coleccionistas.

1. **Cero Comisión por Venta para las Tiendas (0% Take Rate):**
   * A diferencia de marketplaces tradicionales que descuentan entre un 8% y un 15% a las tiendas por cada venta, TapTrade **no cobra comisiones porcentuales sobre las ventas de las tiendas**.
   * La tienda define libremente sus precios en catálogo (los cuales se consideran **brutos con IVA incluido** para consumidores B2C conforme a la normativa del SII) y recibe el **100% neto del valor de sus productos y el 100% de los envíos** cotizados.
2. **Monetización del Software (SaaS):**
   * TapTrade monetiza mediante el cobro de suscripciones fijas mensuales en Unidades de Fomento (UF) según la escala de inventario sincronizado de cada tienda.
3. **Desglose Transparente de Tarifas al Comprador en Checkout:**
   * En el checkout se desglosan de forma **100% transparente y separada**:
     1. **Comisión de Plataforma TapTrade (3.00% Neto + IVA 19%):** Servicio de intermediación tecnológica, custodia transitoria y protección al comprador.
     2. **Costo de Pasarela de Pago:** Tarifa de procesamiento bancario (Transbank Webpay Plus peor caso crédito 2.29% + IVA o Mercado Pago 3.19% + IVA).
   * Mediante un cálculo de *gross-up* sobre la pasarela, ni la tienda ni TapTrade absorben mermas financieras: la tienda recibe el 100% de su venta, y TapTrade recibe íntegro su 3% neto + IVA.

---

## 2. Tarifas SaaS para Tiendas Adheridas (Vendedores LGS)

| Plan SaaS | Cuota Base Mensual | Límite de Cartas | Comisión por Venta | Abono a Tienda |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** (Pequeña Tienda) | 1.5 UF / mes | 1.500 singles | **0%** | 100% Productos + 100% Envíos |
| **Store** (Crecimiento) | 3.5 UF / mes | 7.500 singles | **0%** | 100% Productos + 100% Envíos |
| **Pro / Pioneras** (Early Adopter) | 10 UF / mes *(5 UF c/desc.)* | 20.000 singles | **0%** | 100% Productos + 100% Envíos |
| **Enterprise** | 15 UF / mes *(7.5 UF c/desc.)* | Ilimitado | **0%** | 100% Productos + 100% Envíos |

---

## 3. Desglose Transparente Pagado por el Comprador

### 3.1. Conceptos Desglosados en Checkout
1. **Comisión de Plataforma TapTrade (3.00% Neto + IVA 19%):**
   * Financia la custodia transitoria de fondos en depósito fiduciario (escrow), la validación de inventario en tiempo real, el soporte al cliente y la infraestructura técnica del checkout unificado.
   * Se calcula sobre la base imponible total (productos + despacho).
2. **Costo de Pasarela de Pagos (Webpay Plus Transbank / Mercado Pago):**
   * Tarifa bancaria oficial de recaudación y procesamiento seguro.
   * Tasa Transbank Crédito peor caso: **2.29% + IVA** ($2.29 \times 1.19 = 2.7251\%$).
   * Tasa Mercado Pago: **3.19% + IVA** ($3.19 \times 1.19 = 3.7961\%$).
3. **Fórmula de Absorción Financiera (Gross-Up):**  
   Dado que las pasarelas retienen su comisión sobre el **monto total transado en el terminal**, el total a recaudar se calcula para garantizar que el remanente cubra con exactitud el abono a la tienda y la comisión de TapTrade:
   $$\text{TotalCobrado} = \left\lceil \frac{\text{BaseTienda} + \text{ComisiónBrutaTapTrade}}{1 - \text{TasaPasarela}} \right\rceil$$
   $$\text{CostoPasarela} = \text{TotalCobrado} - (\text{BaseTienda} + \text{ComisiónBrutaTapTrade})$$

---

## 4. Algoritmo Exacto en Backend (`CheckoutPricingService`)

```typescript
// 1. Monto base consolidado (Productos con IVA incluido + Envíos con IVA incluido)
const baseTotal = productsTotal + shippingTotal;

// 2. Comisión propia de TapTrade (3% neto + IVA 19%)
const serviceFeeNet = Math.round(baseTotal * 0.03);
const serviceFeeVat = Math.round(serviceFeeNet * 0.19);
const serviceFeeGross = serviceFeeNet + serviceFeeVat;

// 3. Tasa de pasarela con IVA (Webpay crédito peor caso 2.29% + IVA = 2.7251%)
const gatewayGrossRate = 0.0229 * 1.19; // 0.027251

// 4. Monto total recaudado en terminal de pago
const amountToCharge = Math.round((baseTotal + serviceFeeGross) / (1 - gatewayGrossRate));

// 5. Costo financiero de la pasarela pagado transparentemente por el comprador
const gatewayFee = amountToCharge - (baseTotal + serviceFeeGross);

// Invariante contable estricta:
// amountToCharge === baseTotal + serviceFeeGross + gatewayFee
```

---

## 5. Ejemplo Práctico de Liquidación y Cobro

### Ejemplo A: Carrito de $3.960 CLP ($270 productos + $3.690 despacho Starken)
* **Subtotal Productos:** $270 CLP.
* **Total Envíos Consolidados:** $3.690 CLP.
* **Monto Base:** $3.960 CLP.
* **Comisión TapTrade (3% + IVA):**
  * Neto: $\text{round}(3.960 \times 0.03) = \mathbf{\$119\text{ CLP}}$.
  * IVA Débito (19%): $\text{round}(119 \times 0.19) = \mathbf{\$23\text{ CLP}}$.
  * Total Comisión TapTrade (Boleta de servicios): $\mathbf{\$142\text{ CLP}}$.
* **Costo Pasarela Webpay Plus (2.29% + IVA):**
  * $\text{Total} = \text{round}\left(\frac{3.960 + 142}{1 - 0.027251}\right) = \text{round}(4.102 / 0.972749) = \mathbf{\$4.217\text{ CLP}}$.
  * $\text{Costo Pasarela} = 4.217 - 4.102 = \mathbf{\$115\text{ CLP}}$.
* **Total Final a Pagar:** **$4.217 CLP**.

#### Cuadratura de Fondos:
* **Abono Tienda:** **$3.960 CLP** (100% íntegro).
* **Ingreso Propio TapTrade:** **$142 CLP** ($119 neto utilidad + $23 IVA débito fiscal F29).
* **Descuento Transbank en Terminal:** $4.217 \times 0.027251 = \mathbf{\$115\text{ CLP}}$ ($97 neto costo financiero + $18 IVA crédito fiscal).
* **F29 al Fisco:** Débito $23 - Crédito $18 = **$5 al SII**. Margen neto TapTrade: **$119 CLP** (exactamente 3% de la venta).

---

## 6. Estructura Legal y Tributaria ante el Servicio de Impuestos Internos (SII)

### 6.1. Mandato Mercantil de Recaudación (DL 825)
* TapTrade **no es revendedora** de los productos de las tiendas. Actúa exclusivamente como **mandataria de cobro y recaudación por cuenta de terceros**.
* Los dineros ingresados a la cuenta bancaria de TapTrade por concepto de productos y despachos constituyen un **pasivo de custodia transitoria** (fondos ajenos) y no forman parte de los ingresos brutos ni de la base imponible del IVA de TapTrade.

### 6.2. Emisión de Documentos Tributarios Electrónicos (DTEs)
1. **La Tienda Vendedora** es la única obligada tributaria ante el SII a emitir la **Boleta Electrónica de Ventas y Servicios** o **Factura Electrónica** al comprador final por el 100% de los productos y envíos transados.
2. **TapTrade SpA** emite la respectiva **Boleta o Factura Electrónica de Servicios** al comprador por el monto correspondiente a la comisión de servicio e intermediación ($142 CLP en el ejemplo).
3. **Liquidación de Mandato:** Al momento de liberar los fondos a la tienda tras el despacho, TapTrade genera un comprobante de liquidación mercantil donde se acredita la rendición de cuentas del mandato.
