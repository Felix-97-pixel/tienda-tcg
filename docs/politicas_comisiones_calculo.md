# Política de Precios, Tarifas de Servicio y Modelo SaaS de TapTrade

**Razón Social:** TAPTRADE SpA  
**RUT:** 78.531.106-K  
**Fecha de Actualización:** 1 de Noviembre de 2026  
**Versión:** 2.0 (Modelo SaaS + Tarifa Unificada de Protección al Comprador)

---

## 1. Principios Fundamentales del Modelo de Negocio

TapTrade opera bajo un modelo híbrido de **Software como Servicio (SaaS)** para tiendas especializadas en Trading Card Games (TCG) y un **Marketplace Multi-Tienda con Custodia Segura** para compradores coleccionistas.

1. **Cero Comisión por Venta para las Tiendas (0% Take Rate):**
   * A diferencia de marketplaces tradicionales que descuentan entre un 8% y un 15% a las tiendas por cada venta, TapTrade **no cobra comisiones porcentuales sobre las ventas de las tiendas**.
   * La tienda define libremente sus precios en catálogo y recibe el **100% neto del valor de sus productos y el 100% de los envíos** cotizados.
2. **Monetización del Software (SaaS):**
   * TapTrade monetiza mediante el cobro de suscripciones fijas mensuales en Unidades de Fomento (UF) según la escala de inventario sincronizado de cada tienda.
3. **Tarifa Unificada de Servicio y Protección al Comprador (5.00%):**
   * Los costos operativos de las pasarelas bancarias y el servicio de garantía y custodia transitoria se financian a través de una **tarifa plana del 5.00%** que se añade transparentemente en el checkout al comprador final.

---

## 2. Tarifas SaaS para Tiendas Adheridas (Vendedores LGS)

| Plan SaaS | Cuota Base Mensual | Límite de Cartas | Comisión por Venta | Abono a Tienda |
| :--- | :--- | :--- | :--- | :--- |
| **Starter** (Pequeña Tienda) | 1.5 UF / mes | 1.500 singles | **0%** | 100% Productos + 100% Envíos |
| **Store** (Crecimiento) | 3.5 UF / mes | 7.500 singles | **0%** | 100% Productos + 100% Envíos |
| **Pro / Pioneras** (Early Adopter) | 10 UF / mes *(5 UF c/desc.)* | 20.000 singles | **0%** | 100% Productos + 100% Envíos |
| **Enterprise** | 15 UF / mes *(7.5 UF c/desc.)* | Ilimitado | **0%** | 100% Productos + 100% Envíos |

---

## 3. Tarifa de Servicio y Protección al Comprador (5.00%)

### 3.1. ¿Qué cubre la tarifa del 5.00%?
1. **Costos de Procesamiento Bancario:** Financia las comisiones cobradas por los adquirentes y pasarelas de pago reguladas en Chile (Transbank Webpay Plus y Mercado Pago).
2. **Garantía y Mediación TCG:** Asegura al comprador que las cartas recibidas cumplen estrictamente con la graduación de estado declarada (Near Mint, Lightly Played, etc.) y garantiza tolerancia cero ante falsificaciones.
3. **Custodia Transitoria de Fondos (Escrow):** Los fondos no se liberan inmediatamente a las tiendas de forma descontrolada; TapTrade custodia el pago hasta que el courier confirme el despacho del paquete o se verifique la entrega.
4. **Checkout Multi-Tienda Unificado:** Permite al comprador pagar en una sola transacción cartas provenientes de múltiples tiendas a lo largo de todo Chile.

### 3.2. Desglose Económico y Márgenes Operativos

La tarifa del **5.00%** cubre con holgura todas las tarifas de pasarelas de Chile:

| Medio de Pago | Tarifa Pasarela | Tarifa c/ IVA | Tarifa Comprador | Margen Neto TapTrade |
| :--- | :--- | :--- | :--- | :--- |
| **Webpay Plus Débito / Prepago** (Transbank) | 1.49% + IVA | 1.7731% | **5.00%** | **+3.23%** neto |
| **Webpay Plus Crédito** (Transbank) | 2.29% + IVA | 2.7251% | **5.00%** | **+2.27%** neto |
| **Mercado Pago** (Checkout Pro / Directo) | 3.19% + IVA | 3.7961% | **5.00%** | **+1.20%** neto |

**Ventajas clave de este modelo:**
* **Riesgo cero de absorción bancaria:** TapTrade nunca subsidia comisiones de adquirencia con su propio capital.
* **Margen positivo en cada venta:** TapTrade percibe entre +1.20% y +3.23% neto por orden como ingreso operacional complementario a las suscripciones SaaS.
* **Transparencia hacia la tienda:** La tienda no sufre deducciones sorpresa ni liquidaciones disminuidas.

---

## 4. Fórmulas de Cálculo Matemático

### Paso 1: Cálculo del Subtotal Base
El subtotal base comprende la suma de todos los productos al precio exacto publicado por cada tienda, más los costos consolidados de despacho courier cotizados en tiempo real:

$$\text{Monto Base} = \sum (\text{Precio Real Tienda} \times \text{Cantidad}) + \sum (\text{Costo Envío Courier})$$

### Paso 2: Cálculo de la Tarifa de Protección al Comprador
Se aplica la tasa unificada del 5.00% y se redondea al entero en pesos chilenos:

$$\text{Tarifa Servicio} = \text{ROUND}(\text{Monto Base} \times 0.05)$$

### Paso 3: Total Final a Pagar en Checkout
El comprador paga:

$$\text{Total Final} = \text{Monto Base} + \text{Tarifa Servicio}$$

---

## 5. Ejemplo Práctico de Liquidación y Cobro

Un comprador adquiere cartas en dos tiendas distintas de la plataforma:
* **Tienda A:** 2 cartas por un subtotal de **$15.000 CLP**. Envío Starken: **$3.500 CLP**. Total Tienda A: $18.500 CLP.
* **Tienda B:** 1 carta por un subtotal de **$20.000 CLP**. Envío Chilexpress: **$4.200 CLP**. Total Tienda B: $24.200 CLP.

### Cálculo:
1. **Monto Base:** $18.500 + $24.200 = **$42.700 CLP**.
2. **Tarifa Servicio y Protección (5.00%):** $42.700 \times 0.05 = **$2.135 CLP**.
3. **Total Cobrado al Comprador en Webpay:** **$44.835 CLP**.

### Distribución de Fondos:
* **Abono a Tienda A:** **$18.500 CLP** íntegros ($15.000 de productos + $3.500 de flete).
* **Abono a Tienda B:** **$24.200 CLP** íntegros ($20.000 de productos + $4.200 de flete).
* **Ingreso Bruto Tarifa TapTrade:** **$2.135 CLP**.
  * Si el comprador pagó con Webpay Débito: Transbank retiene ~$795 CLP. TapTrade gana **+$1.340 CLP líquidos**.
  * Si el comprador pagó con Webpay Crédito: Transbank retiene ~$1.222 CLP. TapTrade gana **+$913 CLP líquidos**.
  * Si el comprador pagó con Mercado Pago: MP retiene ~$1.702 CLP. TapTrade gana **+$433 CLP líquidos**.

---

## 6. Estructura Legal y Tributaria ante el Servicio de Impuestos Internos (SII)

### 6.1. Mandato de Recaudación por Cuenta de Terceros
Conforme a las directrices del Código de Comercio y la normativa del SII para plataformas de intermediación:
* TapTrade SpA recibe el dinero de las ventas en calidad de **Mandatario de Cobranza y Custodio Fiduciario**.
* Los fondos correspondientes a las tiendas ($42.700 en el ejemplo anterior) constituyen contablemente un **Pasivo Circulante (Fondos de Terceros en Custodia)** y no un ingreso propio de TapTrade.

### 6.2. Emisión de Documentos Tributarios Electrónicos (DTE)
1. **Boleta o Factura de Venta de Bienes:** Debe ser emitida exclusivamente por la **Tienda Adherida** al Comprador final por el valor de los productos y envíos ($18.500 por Tienda A, $24.200 por Tienda B).
2. **Boleta Electrónica de Servicios:** Emitida por **TapTrade SpA** al Comprador final por el valor de la tarifa del 5.00% ($2.135 CLP en el ejemplo), clasificada bajo el giro `631200` (Portales Web) o `620900`.
3. **Factura Electrónica de Suscripción:** Emitida mensualmente por **TapTrade SpA** a cada tienda por el cobro del plan SaaS correspondiente en UF.
4. **Liquidación de Fondos de Mandato:** Al momento de transferir el dinero a las tiendas, TapTrade emite un comprobante de liquidación de mandato con el detalle de las órdenes pagadas y entregadas.
