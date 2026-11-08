# Informe Técnico-Tributario y Contable para Revisión de Contador Auditor (SII Chile)

**Empresa:** TapTrade SpA  
**Giro / Actividad:** Marketplace Multi-Vendor de Cartas Coleccionables (TCG) y Plataforma SaaS con Punto de Venta (POS)  
**Jurisdicción:** Chile (Servicio de Impuestos Internos — SII, DL N° 825 sobre IVA y DL N° 824 sobre Impuesto a la Renta)  
**Propósito del Documento:** Presentar al Contador Auditor la arquitectura financiera, contable y tributaria implementada en el software de TapTrade para validar los asientos contables, la cláusula de mandato mercantil, la emisión de Documentos Tributarios Electrónicos (DTE) y la declaración mensual del Formulario 29 (F29).

---

## 1. Resumen Ejecutivo del Modelo de Negocio

**TapTrade** opera bajo un modelo híbrido compuesto por dos líneas de negocio claramente delimitadas:

1. **Marketplace Online (Intermediación Comercial con Mandato de Recaudación):**
   - Tiendas físicas y jurídicas independientes (formalizadas ante el SII en Primera Categoría) publican su propio inventario de cartas coleccionables y productos sellados en el catálogo web de TapTrade.
   - **TapTrade nunca adquiere la propiedad de las cartas ni actúa como revendedor.** Las cartas pertenecen en todo momento a cada tienda hasta su venta al comprador final.
   - Cuando un comprador realiza un pedido en la web, TapTrade recauda el pago centralizadamente a través de pasarelas electrónicas (Webpay Plus de Transbank o MercadoPago) actuando bajo un **Mandato de Recaudación por Cuenta de Terceros**.
   - Una vez que la tienda despacha el producto y se confirma la entrega (`DELIVERED`), el sistema libera el saldo líquido a favor de la tienda para ser transferido vía TEF bancaria mediante un **Lote de Liquidación (`WithdrawalRequest`)**.

2. **Software como Servicio (SaaS) y Punto de Venta Físico (POS Mostrador):**
   - TapTrade provee a las tiendas un sistema de gestión de inventario, sincronización de precios y terminal Punto de Venta (POS) para sus ventas presenciales en mostrador.
   - Por las ventas presenciales en el local de la tienda (**POS Mostrador**), el dinero (efectivo, transferencia o máquina Transbank propia de la tienda) ingresa **100% directo a la tienda** sin pasar por las cuentas bancarias de TapTrade.
   - TapTrade cobra a las tiendas una **suscripción mensual fija en UF + IVA** según el plan contratado.

---

## 2. Justificación Tributaria: ¿Por qué Intermediación (Mandato) y NO que las Tiendas le Facturen las Cartas a TapTrade?

Durante el diseño financiero se evaluaron dos alternativas para liquidar el dinero recaudado a las tiendas:
- **Alternativa Descartada (Modelo Reventa / Compraventa):** Que la tienda le emita una Factura Electrónica a TapTrade por el valor de las cartas vendidas para liberar su pago.
- **Alternativa Implementada (Modelo Intermediación / Mandato de Recaudación):** Que el dinero recaudado por las cartas se contabilice como un **Pasivo Transitorio (Fondos Recaudados por Cuenta de Terceros)** y que cada parte facture únicamente lo que le corresponde por ley.

### Tabla Comparativa para el Contador Auditor

| Criterio Tributario / Contable | Alternativa Descartada: "La Tienda le factura a TapTrade para cobrar" (Reventa) | Alternativa Implementada: "Intermediación con Mandato de Recaudación" |
|---|---|---|
| **Naturaleza Jurídica ante el SII** | **Compra y Reventa.** Si la tienda le factura las cartas a TapTrade, contablemente TapTrade está comprando mercadería y revendiéndola al consumidor final. | **Mandato Mercantil / Intermediación.** La venta de la carta ocurre entre la Tienda y el Comprador. TapTrade solo presta el servicio tecnológico y de recaudación. |
| **Base Imponible de PPM (Art. 84 LIR — Cód. 563 F29)** | **Inflada artificialmente.** TapTrade pagaría PPM mensual sobre el **100% del valor de todas las cartas vendidas** en la plataforma, descapitalizando su caja aunque su margen sea solo del 3%. | **Exacta y real.** TapTrade paga PPM exclusivamente sobre sus **ingresos propios netos** (su comisión del 3% + suscripciones SaaS en UF). |
| **Riesgo de Descalce Temporal de IVA (DL 825) a Fin de Mes** | **Crítico.** Si un cliente compra el 28 de un mes (generando IVA Débito para TapTrade en ese mes), pero el pedido se entrega y la tienda emite su factura a TapTrade el día 4 del mes siguiente, TapTrade queda **sin IVA Crédito en el primer mes** y debe financiar ese 19% de su propio bolsillo ante el SII. | **Nulo.** El IVA de la carta y del despacho pertenece desde el día 1 a la tienda vendedora. TapTrade solo declara el IVA Débito de su propia comisión y planes SaaS. |
| **Tope de Ingresos Régimen Pro-Pyme (Art. 14 D N°3 LIR)** | **Riesgo de exclusión.** Computa el 100% del GMV (*Gross Merchandise Value*) de terceros como ingresos brutos de TapTrade. | **Protegido.** Solo computan como ingresos de TapTrade las comisiones efectivamente percibidas o devengadas y las mensualidades SaaS. |
| **Bloqueos Operativos por Situación Tributaria del Vendedor** | Si el SII restringe temporalmente los folios de una tienda o la tienda emite una factura fuera del plazo de 8 días de acuse de recibo, TapTrade queda con pagos retenidos y contabilidad descuadrada. | La liquidación de fondos de terceros se respalda con el **Estado de Liquidación (`WithdrawalRequest`)** de órdenes entregadas y el comprobante bancario TEF, sin depender de que la tienda facture su propia mercadería a TapTrade. |
| **Responsabilidad Legal ante SERNAC (Ley N° 19.496)** | TapTrade figura como vendedor directo del bien físico ante el consumidor final. | La tienda es la vendedora directa del producto; TapTrade actúa como operador de plataforma intermediaria. |

---

## 3. Estructura de Cobros y Flujo Numérico de una Orden Online

En el Marketplace Online, todos los precios publicados por las tiendas son **Precios Brutos en CLP (IVA 19% incluido)**, redondeados a la decena conforme a la Ley N° 20.956.

### Ejemplo Numérico de una Venta Online (`CheckoutPricingService`)
Supongamos que un comprador adquiere cartas de la **Tienda A** por **$100.000 CLP (Bruto)** con un despacho por **$3.690 CLP (Bruto)**, pagando mediante **Webpay Plus (Transbank)**:

| Concepto | Fórmula / Regla | Monto Neto (CLP) | IVA 19% (CLP) | Monto Bruto (CLP) | Destinatario Contable |
|---|---|---:|---:|---:|---|
| **1. Venta de Tienda (Productos + Envío)** | $100.000 + $3.690 | $87.134 | $16.556 | **$103.690** | **Fondos de Terceros (Tienda A)** |
| **2. Cargo por Servicio TapTrade al Comprador (3% Neto + IVA)** | 3% sobre $103.690 | $3.111 | $591 | **$3.702** | **Ingreso Propio TapTrade SpA** |
| **3. Comisión al Vendedor (Parametrizable: 0% por defecto)** | 0% (o % según acuerdo) | $0 | $0 | **$0** | **Ingreso Propio TapTrade SpA** |
| **4. Recargo Pasarela (Gross-up Webpay 2,29% + IVA)** | Cubre retención de Transbank | $2.521 | $479 | **$3.000** | **Retenido por Transbank S.A.** |
| **TOTAL COBRADO AL COMPRADOR (`amountToCharge`)** | (1) + (2) + (4) | — | — | **$110.392** | Recaudado en Pasarela |

---

## 4. Contabilización Propuesta y Asientos Tipo (Libro Diario / Mayor)

El software de TapTrade cuenta con un **Libro Mayor Financiero Inmutable (`WalletTransaction`)** que registra cada operación sin sobrescribir saldos históricos. A continuación se presentan los asientos contables propuestos para validación del Contador Auditor (usando el ejemplo anterior de **$110.392** cobrados en Webpay):

### Asiento 1: Recaudación de Venta Online Confirmada
Cuando el comprador paga **$110.392** en Webpay Plus:
- **Disponible por cobrar a Transbank:** $107.392 (Total cobrado $110.392 menos $3.000 retenidos por Transbank).
- **Pasivo por Fondos de Terceros (Tienda A):** $103.690.
- **Ingreso Propio Neto de TapTrade (Cargo por Servicio 3%):** $3.111.
- **IVA Débito Fiscal Propio de TapTrade:** $591.

| Cuenta Contable | Naturaleza | Debe (CLP) | Haber (CLP) |
|---|---|---:|---:|
| Cuentas por Cobrar Pasarela (Transbank / MercadoPago) | Activo Circulante | $107.392 | |
| Costo de Procesamiento Pasarela por Facturar (Provisión) | Gasto / Activo Transitorio | $3.000 | |
| **a** Fondos por Rendir a Tiendas (Mandato Terceros — Tienda A) | **Pasivo Circulante** | | **$103.690** |
| **a** Ingresos por Comisiones y Servicios de Plataforma | **Resultado Ganancia** | | **$3.111** |
| **a** IVA Débito Fiscal (Propio TapTrade) | **Pasivo Impuesto** | | **$591** |
| *Glosa: Registro de orden online #ORD-XXX recaudada por cuenta de Tienda A y comisión TapTrade.* | | **$110.392** | **$110.392** |

### Asiento 2: Recepción de Factura Mensual de Transbank / MercadoPago
A fin de mes, Transbank emite a TapTrade SpA su Factura Electrónica Afecta por las comisiones de procesamiento retenidas ($2.521 Neto + $479 IVA = $3.000 Bruto):

| Cuenta Contable | Naturaleza | Debe (CLP) | Haber (CLP) |
|---|---|---:|---:|
| Gasto Comisiones Bancarias y Pasarela de Pago | Resultado Pérdida | $2.521 | |
| IVA Crédito Fiscal (Factura Transbank / MercadoPago) | Activo Impuesto | $479 | |
| **a** Costo de Procesamiento Pasarela por Facturar (Provisión) | Activo Transitorio | | **$3.000** |
| *Glosa: Reconocimiento de Factura Electrónica de Transbank y uso de IVA Crédito Fiscal.* | | **$3.000** | **$3.000** |

### Asiento 3: Liquidación y Transferencia Bancaria a la Tienda (`WithdrawalRequest`)
Cuando la orden pasa a estado `DELIVERED` y se ejecuta la transferencia bancaria (TEF) del lote de liquidación a la cuenta corriente de la **Tienda A** por **$103.690**:

| Cuenta Contable | Naturaleza | Debe (CLP) | Haber (CLP) |
|---|---|---:|---:|
| Fondos por Rendir a Tiendas (Mandato Terceros — Tienda A) | Pasivo Circulante | $103.690 | |
| **a** Banco Cuenta Corriente TapTrade SpA | Activo Disponible | | **$103.690** |
| *Glosa: Pago de Liquidación #LIQ-XXX a Tienda A según cartola bancaria y detalle de sub-órdenes.* | | **$103.690** | **$103.690** |

---

## 5. Esquema de Emisión de Documentos Tributarios Electrónicos (DTE)

1. **De la Tienda Vendedora al Comprador Final:**
   - La tienda emite su propia **Boleta Electrónica (Cód. 39 o 41)** o **Factura Electrónica (Cód. 33)** al comprador por el valor bruto de sus productos más el despacho (**$103.690** en el ejemplo).
   - El panel de la tienda en TapTrade le entrega el desglose exacto de cada venta (`Neto: $87.134`, `IVA 19%: $16.556`, `Bruto: $103.690`) y un archivo CSV/Excel mensual para su contador.
2. **De TapTrade SpA al Comprador Final:**
   - TapTrade emite **Boleta Electrónica Afecta (Cód. 39)** por el cargo de intermediación/servicio cobrado al comprador.
3. **De TapTrade SpA a la Tienda Vendedora:**
   - TapTrade emite **Factura Electrónica Afecta (Cód. 33)** a la razón social de la tienda por:
     - Su **Suscripción Mensual del Plan SaaS en UF + IVA**.
     - La **Comisión al Vendedor retenida** (en caso de que la tienda tenga pactada una comisión porcentual descontada de sus ventas).
   - Esa factura constituye **Gasto Aceptado e IVA Crédito Fiscal** para la tienda en su propio F29.
4. **De Transbank / MercadoPago a TapTrade SpA:**
   - La pasarela emite mensualmente su **Factura Electrónica Afecta (Cód. 33)** a TapTrade SpA por las comisiones de procesamiento retenidas, la cual TapTrade utiliza como **IVA Crédito Fiscal** y gasto operacional.

---

## 6. Tratamiento del Punto de Venta Físico (POS Mostrador)

Las tiendas también utilizan el módulo **POS Mostrador (`/admin/pos`)** para registrar las ventas presenciales dentro de su local físico:
- **Flujo de Dinero:** El pago ocurre 100% en el mostrador de la tienda (Efectivo, Transferencia a la tienda o Máquina POS Transbank propia de la tienda). **Ningún peso de las ventas POS ingresa a la cuenta bancaria de TapTrade.**
- **Comisión de Transacción:** **0%** (TapTrade no cobra el 3% en ventas físicas de mostrador).
- **Aislamiento Contable:**
  - En el panel de **Contabilidad F29 del Superadministrador de TapTrade (`AccountingService`)**, todas las órdenes con origen `POS_IN_STORE` están **estrictamente excluidas** para no distorsionar la recaudación bancaria ni los impuestos de TapTrade.
  - En el panel de **Wallet y Reporte F29 de la Tienda (`/admin/wallet`)**, las ventas POS **sí se incluyen** identificadas como canal `POS_MOSTRADOR` con su cálculo de Neto (`Bruto / 1.19`) e IVA Débito (`19%`), para que el dueño de la tienda tenga consolidado todo el IVA que debe declarar en su propio F29 (Ventas Online + Ventas Mostrador).

---

## 7. Checklist de Preguntas y Validaciones para el Contador Auditor

Al reunirte con el Contador Auditor, entrégale este documento y pídele validar explícitamente los siguientes **6 puntos operativos**:

1. **Códigos de Actividad Económica (Giros SII) de TapTrade SpA:**
   - Confirmar los códigos de giro ante el SII para cubrir tanto la **edición/suscripción de software SaaS** (ej. *620100 / 620200 / 631100 - Portales Web y Procesamiento de Datos*) como el **servicio de intermediación/comisión en marketplace**.
2. **Validación de la Cláusula de Mandato Mercantil en los Términos y Condiciones:**
   - Revisar que el contrato digital de adhesión que aceptan las tiendas al registrarse establezca expresamente el **Mandato Mercantil de Recaudación** (Art. 233 y siguientes del Código de Comercio), dejando constancia de que TapTrade recauda en nombre y por cuenta de la tienda y que la tienda es la obligada a emitir la Boleta/Factura al comprador por la mercadería.
3. **Tratamiento del Recargo de Pasarela (`gatewayFee`) en la Boleta de TapTrade:**
   - Confirmar si en la Boleta Electrónica (Cód. 39) que TapTrade emite al comprador final por el servicio de plataforma se debe incluir la suma del **Cargo por Servicio (3% + IVA) + Recargo de Pasarela (`$3.702 + $3.000 = $6.702 Bruto`)**, de modo que el IVA Débito de esa boleta calce 1:1 contra el IVA Crédito de la factura que Transbank/MercadoPago le entrega a TapTrade a fin de mes.
4. **Cuentas del Plan de Cuentas y Respaldo de Auditoría para la Cuenta de Pasivo "Fondos por Rendir a Tiendas":**
   - Confirmar que el reporte de **Lotes de Liquidación (`WithdrawalRequest`)** que genera el sistema (el cual vincula cada transferencia bancaria TEF con el ID exacto de las órdenes entregadas, el RUT de la tienda y la fecha de pago) cumple con todos los requisitos de trazabilidad para respaldar las salidas de banco ante una eventual fiscalización del SII.
5. **Validación de Códigos del Formulario 29 (F29) de TapTrade SpA:**
   - Confirmar los casilleros exactos donde se declararán:
     - **Facturas emitidas por Planes SaaS y Comisiones a Tiendas** (Cód. 503 / 502).
     - **Boletas electrónicas emitidas por Cargo de Servicio al Comprador** (Cód. 110 / 111).
     - **Notas de Crédito emitidas por anulaciones de comisiones** (Cód. 509 / 510).
     - **IVA Crédito Fiscal de Facturas de Transbank / MercadoPago y proveedores** (Cód. 520).
     - **Base Imponible de PPM mensual** (Cód. 563 — calculada exclusivamente sobre los ingresos netos propios de TapTrade).
6. **Procedimiento para Devoluciones / Reembolsos (`REFUNDED`) en Cambio de Mes:**
   - Confirmar el protocolo operativo cuando una compra online pagada el día 29 de un mes se reembolsa el día 3 del mes siguiente (emisión de Nota de Crédito Electrónica Cód. 61 dentro del plazo legal para anular el IVA Débito de la comisión devuelta).

