# Política de Precios, Tarifas de Servicio y Tratamiento Tributario (SII) - TapTrade

**Razón Social:** TAPTRADE SpA  
**RUT:** 78.531.106-K  
**Fecha de Actualización:** 3 de Noviembre de 2026  
**Versión:** 2.1 (Modelo Mandato Mercantil + Tarifa 3.00% + IVA con Gross-Up Financiero)

---

## 1. Principios Fundamentales del Modelo de Negocio

TapTrade opera bajo un modelo híbrido de **Software como Servicio (SaaS)** para tiendas especializadas en Trading Card Games (TCG) y un **Marketplace Multi-Tienda con Custodia Segura (Escrow)** para compradores coleccionistas.

1. **Cero Comisión por Venta para las Tiendas (0% Take Rate):**
   * A diferencia de marketplaces tradicionales que descuentan entre un 8% y un 15% a las tiendas por cada venta, TapTrade **no cobra comisiones porcentuales sobre las ventas de las tiendas**.
   * La tienda define libremente sus precios en catálogo (los cuales se consideran **brutos con IVA incluido** para consumidores B2C conforme a la normativa del SII) y recibe el **100% neto del valor de sus productos y el 100% de los envíos** cotizados.
2. **Monetización del Software (SaaS):**
   * TapTrade monetiza mediante el cobro de suscripciones fijas mensuales en Unidades de Fomento (UF) según la escala de inventario sincronizado de cada tienda.
3. **Tarifa de Servicio y Pasarela de Pago al Comprador (3.00% + IVA con Gross-Up):**
   * Los costos operativos de las pasarelas bancarias autorizadas (Transbank Webpay Plus y Mercado Pago) y el servicio de garantía y custodia transitoria se financian a través de una **tarifa transparente cobrada al comprador** en el checkout.
   * La plataforma percibe un **3.00% neto más IVA (19%)** sobre el valor consolidado de la compra (productos + despachos), incorporando un factor de *gross-up* para que el cobro financiero de la pasarela de pagos no reduzca el ingreso tributario de la plataforma ni afecte el saldo de las tiendas.

---

## 2. Tarifas SaaS para Tiendas Adheridas (Vendedores LGS)

| Plan SaaS | Cuota Base Mensual | Límite de Cartas | Comisión por Venta | Abono a Tienda |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** (Pequeña Tienda) | 1.5 UF / mes | 1.500 singles | **0%** | 100% Productos + 100% Envíos |
| **Store** (Crecimiento) | 3.5 UF / mes | 7.500 singles | **0%** | 100% Productos + 100% Envíos |
| **Pro / Pioneras** (Early Adopter) | 10 UF / mes *(5 UF c/desc.)* | 20.000 singles | **0%** | 100% Productos + 100% Envíos |
| **Enterprise** | 15 UF / mes *(7.5 UF c/desc.)* | Ilimitado | **0%** | 100% Productos + 100% Envíos |

---

## 3. Tarifa de Servicio y Pasarela Pagada por el Comprador

### 3.1. ¿Qué cubre la tarifa cobrada al comprador?
1. **Comisión de Plataforma TapTrade (3.00% Neto + IVA 19%):** Financia la custodia transitoria de fondos en depósito fiduciario (escrow), la validación de inventario en tiempo real, el soporte al cliente y la infraestructura técnica del checkout unificado.
2. **Costos de Procesamiento Bancario (Transbank Webpay Plus):**
   * Tarifa Débito Transbank: **1.49% + IVA** ($1.49 \times 1.19 = 1.7731\%$).
   * Tarifa Crédito Transbank: **2.29% + IVA** ($2.29 \times 1.19 = 2.7251\%$).
3. **Fórmula de Gross-up Financiero:**  
   Dado que Transbank aplica su comisión porcentual sobre el **monto total cobrado en la pasarela** (que ya incluye la tarifa de servicio), si no se aplicara gross-up la plataforma absorbería un déficit.
   Para evitarlo, la tarifa cobrada se calcula bajo el peor escenario de crédito (2.29% + IVA) mediante la fórmula:
   $$\text{TarifaBruta} = \left\lceil \frac{\text{Base} \times (0.03 \times 1.19)}{1 - (0.0229 \times 1.19)} \right\rceil \approx \text{Base} \times 3.6687\%$$

### 3.2. Tabla de Rendimiento Económico Real

| Medio de Pago | Tarifa Pasarela c/ IVA | Tarifa Cobrada al Comprador | Comisión Bruta TapTrade (3% + IVA) | Margen Neto TapTrade |
| :--- | :--- | :--- | :--- | :--- |
| **Webpay Débito** | 1.7731% | ~3.67% | 3.57% | **+1.90%** neto + IVA recuperable |
| **Webpay Crédito** | 2.7251% | ~3.67% | 3.57% | **+0.94%** neto (equilibrio exacto) |

---

## 4. Algoritmo Exacto de Cálculo en Backend (`CheckoutPricingService`)

```typescript
// 1. Monto base consolidado (Productos con IVA incluido + Envíos con IVA incluido)
const baseAmount = productsTotal + shippingTotal;

// 2. Comisión neta de plataforma TapTrade (3%)
const serviceFeeNet = Math.round(baseAmount * 0.03);

// 3. IVA débito fiscal propio de TapTrade (19%)
const serviceFeeVat = Math.round(serviceFeeNet * 0.19);

// 4. Tarifa bruta cobrada al comprador con gross-up de Transbank peor caso (Crédito 2.29% + IVA)
const transbankRateGross = 0.0229 * 1.19; // 0.027251
const serviceFeeGross = Math.round((baseAmount * (0.03 * 1.19)) / (1 - transbankRateGross));

// 5. Total final enviado a la pasarela Webpay Plus / Mercado Pago
const finalTotal = baseAmount + serviceFeeGross;

// 6. Abono íntegro a la tienda vendedora (0% de descuento)
const storePayout = baseAmount; // 100% de productos + 100% de despachos
```

---

## 5. Ejemplo Práctico de Liquidación y Cobro

Un comprador adquiere cartas en dos tiendas distintas de la plataforma:
* **Tienda A:** Subtotal productos **$15.000 CLP**. Envío Starken **$3.500 CLP**. Total Tienda A: **$18.500 CLP**.
* **Tienda B:** Subtotal productos **$20.000 CLP**. Envío Chilexpress **$4.200 CLP**. Total Tienda B: **$24.200 CLP**.

### 1. Cálculo del Total de la Orden:
* **Monto Base:** $\$18.500 + \$24.200 = \mathbf{\$42.700\text{ CLP}}$.
* **Comisión Neta TapTrade (3%):** $\$42.700 \times 0.03 = \mathbf{\$1.281\text{ CLP}}$.
* **IVA Débito Fiscal TapTrade (19%):** $\$1.281 \times 0.19 = \mathbf{\$243\text{ CLP}}$.
* **Tarifa Bruta de Servicio Checkout (con gross-up):**
  $$\text{TarifaBruta} = \frac{42.700 \times 0.0357}{1 - 0.027251} = \frac{1.524,39}{0.972749} \approx \mathbf{\$1.567\text{ CLP}}$$
* **Total Cobrado al Comprador en Webpay:**
  $$\$42.700 + \$1.567 = \mathbf{\$44.267\text{ CLP}}$$

### 2. Distribución de Fondos y Cumplimiento Tributario (SII):
* **Abono a Tienda A:** **$18.500 CLP** íntegros ($15.000 productos + $3.500 flete).
* **Abono a Tienda B:** **$24.200 CLP** íntegros ($20.000 productos + $4.200 flete).
* **Ingreso Propio TapTrade:**
  * Base Neta Imponible: **$1.281 CLP**.
  * IVA Débito Fiscal a declarar en Formulario F29 (Código 538): **$243 CLP**.
* **Costo de Pasarela Transbank Estimado:**
  * Si el comprador paga con Crédito ($44.267 \times 2.7251\%$): Transbank cobra ~$1.206 CLP (incluye $193 CLP de IVA crédito fiscal recuperable para TapTrade).
  * Margen operacional neto de TapTrade garantizado sin déficit.

---

## 6. Estructura Legal y Tributaria ante el Servicio de Impuestos Internos (SII)

### 6.1. Mandato Mercantil de Recaudación (DL 825)
* TapTrade **no es revendedora** de los productos de las tiendas. Actúa exclusivamente como **mandataria de cobro y recaudación por cuenta de terceros**.
* Los dineros ingresados a la cuenta bancaria de TapTrade por concepto de productos y despachos constituyen un **pasivo de custodia transitoria** (fondos ajenos) y no forman parte de los ingresos brutos ni de la base imponible del IVA de TapTrade.

### 6.2. Emisión de Documentos Tributarios Electrónicos (DTEs)
1. **La Tienda Vendedora** es la única obligada tributaria ante el SII a emitir la **Boleta Electrónica de Ventas y Servicios** o **Factura Electrónica** al comprador final por el 100% de los productos y envíos transados.
2. **TapTrade SpA** emite la respectiva **Boleta o Factura Electrónica de Servicios** al comprador por el monto correspondiente a la comisión de servicio e intermediación ($1.567 CLP en el ejemplo).
3. **Liquidación de Mandato:** Al momento de liberar los fondos a la tienda tras el despacho, TapTrade genera un comprobante de liquidación mercantil donde se acredita la rendición de cuentas del mandato.
