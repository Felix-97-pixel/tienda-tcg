# Política de Precios y Comisiones de Taptrade

Este documento detalla la estructura matemática y lógica utilizada por Taptrade para el cálculo de comisiones, fijación de precios visibles al público y liquidación a los vendedores (tiendas).

## 1. Principios Fundamentales
1. **Transparencia para el Vendedor:** El vendedor (tienda) define el monto exacto y neto que desea recibir por su producto (denominado **Monto Neto Solicitado**). Taptrade garantiza que el vendedor recibirá exactamente ese monto por cada venta exitosa.
2. **Precios Amigables (Redondeo):** Para mantener una experiencia de usuario estandarizada, el precio final visible al comprador siempre se redondeará hacia arriba al múltiplo de $50 CLP más cercano.
3. **Absorción de Diferencias:** Cualquier diferencia (sobrante) generada por el redondeo será absorbida por la plataforma (Taptrade) y no afectará el monto neto prometido al vendedor.

## 2. Variables de Comisión
- **Comisión de Pasarela de Pagos (MercadoPago):** 3.8% fijo sobre el Precio Final.
- **Comisión de Plataforma (Taptrade):** Porcentaje variable dependiente del plan de suscripción activo de la tienda al momento de publicar el producto (ej. 3.0%, 5.0%, etc.).
- **Tasa de Comisión Total:** Suma de la Comisión de Pasarela + Comisión de Plataforma.

## 3. Fórmulas de Cálculo Matemático

Para garantizar que el vendedor reciba su monto neto intacto tras descontar los porcentajes, Taptrade utiliza una fórmula de "Gross-Up" (Cálculo de Precio Bruto) y un redondeo posterior.

### Paso 1: Cálculo del Precio Base Teórico
Se calcula el precio necesario antes de redondear para cubrir las comisiones:
```text
Precio Teórico = Monto Neto Solicitado / (1 - Tasa de Comisión Total)
```

### Paso 2: Cálculo del Precio Visible (Precio Final al Cliente)
El Precio Teórico se redondea hacia arriba al múltiplo de $50 más cercano:
```text
Precio Visible = CEIL(Precio Teórico / 50) * 50
```
*(Nota: `CEIL` indica redondear siempre hacia el entero superior).*

### Paso 3: Desglose y Distribución de Fondos
Una vez realizada la venta al **Precio Visible**, los fondos se distribuyen de la siguiente manera:
1. **Comisión MercadoPago:** `Precio Visible * 3.8%`
2. **Liquidación a la Tienda:** El 100% del `Monto Neto Solicitado` originalmente.
3. **Comisión Pura Taptrade:** `Precio Visible * Porcentaje Plan Tienda`
4. **Ajuste de Redondeo:** El capital restante que se generó al inflar el Precio Teórico a múltiplos de $50. `(Precio Visible - Comisión MercadoPago - Comisión Pura Taptrade - Liquidación a la Tienda)`

*El ingreso total de Taptrade corresponde a la Comisión Pura + el Ajuste de Redondeo.*

---

## 4. Ejemplo Práctico

Una tienda desea recibir **$1.800 CLP libres** por una carta. Su plan de tienda tiene una comisión del **3.0%**.

**Cálculo Inicial:**
- Monto Neto: $1.800
- Tasa Total: 3.0% (Taptrade) + 3.8% (MP) = 6.8% (0.068)
- Precio Teórico: $1.800 / (1 - 0.068) = $1.931,33 CLP
- **Precio Visible:** Se redondea $1.931,33 al múltiplo de 50 superior = **$1.950 CLP**

**Venta Realizada a $1.950 CLP:**
- **MercadoPago cobra (3.8%):** $74,10 CLP
- **Taptrade cobra (3.0%):** $58,50 CLP
- **Ajuste de Redondeo a $50:** $17,40 CLP
- **La Tienda Recibe:** $1.950 - $74,10 - $58,50 - $17,40 = **$1.800 CLP exactos**.

Esta metodología asegura una contabilidad predecible para todas las partes involucradas.
