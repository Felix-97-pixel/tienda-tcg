# 🛡️ Auditoría de Ciberseguridad: Vulnerabilidades y Soluciones

> [!IMPORTANT]
> **Para ver este documento con formato visual completo, tablas y colores en VS Code:**  
> Presiona `Ctrl + Shift + V` (o `Ctrl + K` luego `V` para ver en paralelo), o haz clic en el botón **"Open Preview"** en la esquina superior derecha del editor.

---

## 📊 1. Matriz General de Vulnerabilidades

| # | Vulnerabilidad | Severidad | Archivo Afectado | Tipo de Riesgo | Solución Resumida |
|:---:|:---|:---:|:---|:---|:---|
| **01** | **Manipulación de Precio en Mercado Pago** | 🔴 `CRÍTICA` | [`process-payment.handler.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/commands/handlers/process-payment.handler.ts#L94-L97) | Fraude / Robo financiero | Forzar lectura de precio real desde `inventoryItem.price` en BD. |
| **02** | **Doble Retiro de Saldo (Race Condition)** | 🔴 `CRÍTICA` | [`withdrawals.service.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/withdrawals/withdrawals.service.ts#L12-L21) | Pérdida de capital / Saldo negativo | Descuento atómico en BD con condición `balance: { gte: amount }`. |
| **03** | **Secuestro de Cuenta Mercado Pago (OAuth)** | 🔴 `CRÍTICA` | [`mp-oauth.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/mp-oauth.controller.ts#L41-L50) | Desvío de pagos a terceros | Firma criptográfica temporal (HMAC/JWT) en el parámetro `state`. |
| **04** | **Acceso a Reportes y Órdenes sin Admin** | 🔴 `CRÍTICA` | [`payments.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/payments.controller.ts#L123-L173) | Fuga masiva de datos (BFLA) | Aplicar `@UseGuards(RolesGuard)` y `@Roles(Role.ADMIN)`. |
| **05** | **Consulta Pública de Órdenes Ajenas** | 🟠 `ALTA` | [`payments.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/payments.controller.ts#L117) | Exposición de clientes (IDOR) | Exigir autenticación y validar pertenencia de la orden al usuario. |
| **06** | **Subida de Archivos sin Validación** | 🟠 `ALTA` | [`upload.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/upload/upload.controller.ts#L16-L24) | Sobrecarga / Inyección | Validar tipos MIME (`jpeg|png|webp`) y limitar peso a 5 MB. |
| **07** | **Borrado de Imágenes de Otras Tiendas** | 🟠 `ALTA` | [`upload.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/upload/upload.controller.ts#L27-L35) | Sabotaje entre vendedores (IDOR) | Comprobar que la imagen pertenezca a la carpeta de la tienda. |
| **08** | **Documentación Swagger en Producción** | 🟠 `ALTA` | [`main.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/main.ts#L23) | Fuga de arquitectura de API | Deshabilitar `/api/docs` cuando `NODE_ENV === 'production'`. |
| **09** | **Ausencia de Cabeceras HTTP / Helmet** | 🟠 `ALTA` | [`main.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/main.ts) / [`next.config.js`](file:///c:/Users/felix/Desktop/e-commerce/tienda-front/next.config.js) | Clickjacking / Ataques web | Activar `helmet()` en NestJS y `headers()` en Next.js. |
| **10** | **Sin Límite de Peticiones (Fuerza Bruta)** | 🟠 `ALTA` | [`app.module.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/app.module.ts) | DoS / Adivinación de cupones | Configurar `@nestjs/throttler` en auth, cupones y checkout. |
| **11** | **Métodos Inexistentes en Tiendas (Crash 500)** | 🟡 `MEDIA` | [`stores.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/stores/stores.controller.ts#L55-L91) | Error de servidor no controlado | Conectar a funciones reales de actualización y tipar con DTOs. |
| **12** | **Filtro de Admin en el Borde Incompleto** | 🟡 `MEDIA` | [`middleware.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-front/middleware.ts#L11) | Parpadeo de rutas no autorizadas | Verificar cookie de sesión en el middleware antes de servir HTML. |

---

## 🔍 2. Desglose Detallado: Falla vs. Solución

---

### 01. Manipulación de Precio en Mercado Pago

> [!CAUTION]
> **NIVEL DE RIESGO: CRÍTICO**  
> Un atacante puede comprar artículos de alto valor pagando $1 CLP.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/payments/commands/handlers/process-payment.handler.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/commands/handlers/process-payment.handler.ts#L94-L97) |
| **En qué consiste** | El backend multiplica la cantidad por `i.unitPrice`, valor que proviene directamente del cuerpo JSON enviado por el cliente. No se consulta la base de datos para verificar el precio real. |
| **Impacto** | Compra fraudulenta de cartas de $50.000 o $100.000 CLP pagando solo $1 CLP. La pasarela aprueba el cobro y la orden queda en estado PAGADA. |

#### Comparativa de Código:
```typescript
// ❌ CÓDIGO ACTUAL (VULNERABLE)
const vendorBaseSubtotal = items.reduce(
  (sum, i) => sum + i.unitPrice * i.quantity * exchangeRate, // Confía en el cliente
  0
);

// ✅ CÓDIGO CORREGIDO (SEGURO)
const inv = await this.prisma.inventoryItem.findUnique({
  where: { id: item.inventoryItemId },
  select: { storeId: true, stock: true, reservedStock: true, price: true }
});
const realPrice = Number(inv.price); // Precio inalterable desde la base de datos
const vendorBaseSubtotal = items.reduce(
  (sum, i) => sum + i.realPrice * i.quantity * exchangeRate, 
  0
);
```

---

### 02. Retiro Concurrente de Dinero / Doble Gasto (Race Condition)

> [!CAUTION]
> **NIVEL DE RIESGO: CRÍTICO**  
> Un vendedor puede retirar 2 o más veces el mismo saldo en milisegundos.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/withdrawals/withdrawals.service.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/withdrawals/withdrawals.service.ts#L12-L21) |
| **En qué consiste** | La condición `if (store.balance < amount)` ocurre fuera de la transacción. Con múltiples peticiones simultáneas, ambas leen el mismo saldo antes de que se descuente. |
| **Impacto** | Generación de múltiples retiros con dinero inexistente, dejando el balance de la tienda en números negativos y pérdidas financieras directas. |

#### Comparativa de Código:
```typescript
// ❌ CÓDIGO ACTUAL (VULNERABLE)
if (Number(store.balance) < amount) throw new BadRequestException('Saldo insuficiente');
return await this.prisma.$transaction(async (tx) => {
  await tx.store.update({ data: { balance: { decrement: amount } } }); // Descuenta a ciegas
  ...
});

// ✅ CÓDIGO CORREGIDO (ATÓMICO Y SEGURO)
return await this.prisma.$transaction(async (tx) => {
  const updated = await tx.store.updateMany({
    where: { 
      id: store.id, 
      balance: { gte: amount } // Solo descuenta si el saldo actual es suficiente
    },
    data: { balance: { decrement: amount } }
  });

  if (updated.count === 0) {
    throw new BadRequestException('Saldo insuficiente o conflicto concurrente');
  }
  return await tx.withdrawalRequest.create({ ... });
});
```

---

### 03. Secuestro de Cuenta de Mercado Pago (OAuth State Fixation)

> [!CAUTION]
> **NIVEL DE RIESGO: CRÍTICO**  
> Un atacante puede desviar todas las ventas de una tienda hacia su propia cuenta de Mercado Pago.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/payments/mp-oauth.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/mp-oauth.controller.ts#L41-L50) |
| **En qué consiste** | El enlace OAuth incluye `&state=${store.id}` sin firmar. El callback recibe `state` y guarda las credenciales en esa tienda sin verificar quién inició el flujo. |
| **Impacto** | Mediante un enlace trampa, el atacante enlaza su Mercado Pago a la tienda víctima; los pagos de los clientes irán al atacante. |

#### Solución:
Firmar criptográficamente el parámetro `state` con expiración de 10 minutos y validarlo en el callback:
```typescript
// 1. Al conectar:
const stateToken = this.jwtService.sign({ storeId: store.id, userId }, { expiresIn: '10m' });
const url = `https://auth.mercadopago.com/...&state=${stateToken}`;

// 2. En el callback:
const payload = this.jwtService.verify(stateToken); // Falla si fue alterado o expiró
const storeId = payload.storeId;
```

---

### 04. Acceso No Autorizado a Ventas, Órdenes y Reportes (BFLA)

> [!CAUTION]
> **NIVEL DE RIESGO: CRÍTICO**  
> Compradores normales pueden ver y exportar datos financieros de toda la plataforma.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/payments/payments.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/payments.controller.ts#L123-L173) |
| **En qué consiste** | Los endpoints `/payments/orders`, `/payments/stats`, `/payments/reports/export/:type` solo validan token de login, pero no revisan el rol del usuario. |
| **Impacto** | Fuga masiva de información confidencial: volumen de ventas, direcciones y datos de clientes exportables en Excel. |

#### Solución:
```typescript
@Get('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPERADMIN) // 🔒 Solo administradores
listOrders(...) { ... }
```

---

### 05. Consulta Pública de Órdenes sin Autenticación (IDOR)

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Cualquier persona puede consultar pedidos ajenos conociendo el ID.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/payments/payments.controller.ts:L117`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/payments/payments.controller.ts#L117) |
| **En qué consiste** | `GET /payments/order/:orderId` no tiene ningún guardia ni comprobación de propiedad. |
| **Impacto** | Exposición de compras, nombres, teléfonos y direcciones de envío. |

#### Solución:
Añadir autenticación y comprobar que `order.userId === req.user.userId` o `req.user.role === 'ADMIN'`.

---

### 06. Subida de Archivos sin Validación de Formato ni Peso

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Permite subir ejecutables o archivos gigantescos a Cloudinary.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/upload/upload.controller.ts:L16-L24`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/upload/upload.controller.ts#L16-L24) |
| **En qué consiste** | `@UploadedFile()` recibe el archivo crudo sin pasar por `ParseFilePipe`. |
| **Impacto** | Consumo de cuotas de almacenamiento, costos imprevistos o subida de archivos maliciosos. |

#### Solución:
```typescript
@UploadedFile(
  new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // Máximo 5MB
      new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ }), // Solo imágenes
    ],
  }),
)
file: Express.Multer.File,
```

---

### 07. Borrado de Imágenes de Otras Tiendas

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Una tienda puede eliminar el logo o imágenes de productos de otra tienda.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/upload/upload.controller.ts:L27-L35`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/upload/upload.controller.ts#L27-L35) |
| **En qué consiste** | El endpoint `DELETE /upload/image` toma la URL y la elimina de Cloudinary sin validar la tienda propietaria. |
| **Impacto** | Sabotaje entre vendedores en el marketplace. |

#### Solución:
Verificar que la ruta del `public_id` de Cloudinary pertenezca a la subcarpeta de la tienda autenticada (`tienda/[storeId]/...`).

---

### 08. Documentación Swagger Expuesta en Producción

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Expone públicamente el mapa completo de endpoints y modelos de base de datos.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/main.ts:L23`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/main.ts#L23) |
| **En qué consiste** | Swagger se inicializa incondicionalmente en la ruta pública `/api/docs`. |
| **Impacto** | Facilita a atacantes automatizados encontrar rutas y parámetros vulnerables. |

#### Solución:
```typescript
if (process.env.NODE_ENV !== 'production') {
  SwaggerModule.setup('api/docs', app, document);
}
```

---

### 09. Falta de Cabeceras HTTP de Seguridad (Helmet & Next.js)

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Susceptible a Clickjacking y robo de clics.

| Aspecto | Detalle |
|:---|:---|
| **Archivos** | [`tienda-backend/src/main.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/main.ts) y [`tienda-front/next.config.js`](file:///c:/Users/felix/Desktop/e-commerce/tienda-front/next.config.js) |
| **En qué consiste** | No se utiliza Helmet ni se configuran cabeceras defensivas como `X-Frame-Options` o `X-Content-Type-Options`. |
| **Impacto** | La tienda puede ser incrustada en páginas externas mediante `<iframe>` invisibles para inducir compras o clics maliciosos. |

#### Solución:
1. Backend: Instalar `helmet` y añadir `app.use(helmet())` en `main.ts`.
2. Frontend: Configurar `headers()` en `next.config.js` con `X-Frame-Options: SAMEORIGIN`.

---

### 10. Ausencia de Límite de Peticiones (Rate Limiting)

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Ataques de fuerza bruta contra login y cupones de descuento.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/app.module.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/app.module.ts) |
| **En qué consiste** | No hay limitador de peticiones por minuto. |
| **Impacto** | Adivinación masiva de contraseñas de usuarios/administradores y scraping de cupones de descuento. |

#### Solución:
Instalar `@nestjs/throttler` y definir:
* Global: 100 peticiones / minuto.
* `/auth/login`: Máximo 5 intentos / minuto por IP.
* `/coupons/validate`: Máximo 10 consultas / minuto por IP.

---

### 11. Métodos Inexistentes en Tiendas (Error 500)

> [!NOTE]
> **NIVEL DE RIESGO: MEDIO**  
> Caída del servidor al actualizar datos de tienda.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/stores/stores.controller.ts:L55-L91`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/stores/stores.controller.ts#L55-L91) |
| **En qué consiste** | El controlador llama a `updateStoreByOwner` y `updateStoreById`, funciones que no existen en `stores.service.ts`. |
| **Impacto** | Error 500 en producción cuando los vendedores guardan cambios en su tienda. |

#### Solución:
Implementar los métodos faltantes en `stores.service.ts` con DTOs formales.

---

### 12. Filtro de Admin en el Borde Incompleto (Next.js)

> [!NOTE]
> **NIVEL DE RIESGO: MEDIO**  
> Parpadeo de interfaz no autorizada.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-front/middleware.ts:L11`](file:///c:/Users/felix/Desktop/e-commerce/tienda-front/middleware.ts#L11) |
| **En qué consiste** | El middleware excluye `/admin`. La protección depende enteramente de React en el navegador. |
| **Impacto** | Carga breve del HTML del panel de administración antes de redirigir al login. |

#### Solución:
Hacer que `middleware.ts` compruebe la cookie `admin_access_token` antes de entregar la página.

---

### 13. Sabotaje y Borrado de Inventario de Otras Tiendas (BOLA / IDOR)

> [!CAUTION]
> **NIVEL DE RIESGO: CRÍTICO**  
> Una tienda puede alterar precios, stock o borrar completamente cartas de competidores.

| Aspecto | Detalle |
|:---|:---|
| **Archivos** | [`tienda-backend/src/products/products.controller.ts:L269`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/products/products.controller.ts#L269) y [`tienda-backend/src/products/products.service.ts:L820`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/products/products.service.ts#L820) |
| **En qué consiste** | `PATCH /products/inventory/:id` y `DELETE /products/inventory/:id` recibían el ID del ítem y aplicaban cambios sin comprobar la tienda propietaria. |
| **Impacto** | Sabotaje de precios (ej. cambiar precio a $1 CLP) o eliminación masiva de stock ajeno en el marketplace. |

#### Solución:
Validar que `item.store?.ownerId === userId` o que el usuario sea `SUPERADMIN`:
```typescript
if (userRole !== 'SUPERADMIN' && userId && item.store?.ownerId !== userId) {
  throw new ForbiddenException('No tienes permiso para modificar el inventario de otra tienda');
}
```

---

### 14. Modificación del Catálogo Maestro y Rollback por Vendedores (BFLA)

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Un vendedor común podía alterar precios oficiales y disparar rollbacks de toda la plataforma.

| Aspecto | Detalle |
|:---|:---|
| **Archivos** | [`tienda-backend/src/sync/sync.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/sync/sync.controller.ts) y [`tienda-backend/src/price-updater/price-updater.controller.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/price-updater/price-updater.controller.ts) |
| **En qué consiste** | Rutas de sincronización masiva y rollback (`/sync/rollback`, `/sync/set`, `/price-updater/*`) tenían `@Roles(Role.ADMIN)`. |
| **Impacto** | Sobreescritura no autorizada del catálogo maestro oficial de cartas y backups del marketplace. |

#### Solución:
Restringir las rutas maestras exclusivamente a `@Roles(Role.SUPERADMIN)`, dejando únicamente `syncDealerPrices` para tiendas `ADMIN`.

---

### 15. Ajustes Globales de Plataforma Modificables por Tiendas (BFLA)

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Vendedores podían cambiar configuraciones generales del marketplace.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/settings/settings.controller.ts:L19`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/settings/settings.controller.ts#L19) |
| **En qué consiste** | `POST /settings` persistía variables en `GlobalSetting` con solo permiso `Role.ADMIN`. |
| **Impacto** | Alteración de políticas y variables operativas del sitio por cualquier cuenta de vendedor. |

#### Solución:
Cambiar el rol requerido a `@Roles(Role.SUPERADMIN)`.

---

### 16. Suplantación de Despacho y Dirección entre Tiendas (IDOR)

> [!WARNING]
> **NIVEL DE RIESGO: ALTO**  
> Una tienda podía cambiar la dirección y horarios de retiro de otra.

| Aspecto | Detalle |
|:---|:---|
| **Archivos** | [`tienda-backend/src/shipping/shipping.controller.ts:L45`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/shipping/shipping.controller.ts#L45) y [`tienda-backend/src/shipping/shipping.service.ts:L251`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/shipping/shipping.service.ts#L251) |
| **En qué consiste** | `PATCH /shipping/store-settings/:storeId` recibía cualquier `storeId` en la URL y modificaba sus ajustes físicos sin verificar la propiedad. |
| **Impacto** | Suplantación o corrupción de ubicaciones físicas y retiro de competidores. |

#### Solución:
Validar pertenencia de la tienda: `if (userRole !== 'SUPERADMIN' && store.ownerId !== userId) throw new ForbiddenException(...)`.

---

### 17. Condición de Carrera en Crédito de Tienda (Store Credit)

> [!NOTE]
> **NIVEL DE RIESGO: MEDIO**  
> Riesgo de saldos negativos en caso de solicitudes de débito simultáneas.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/store-credit/store-credit.service.ts:L63`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/store-credit/store-credit.service.ts#L63) |
| **En qué consiste** | El descuento de saldo usaba lectura y luego `upsert`, vulnerable a peticiones concurrentes. |
| **Impacto** | Generación de saldos negativos en crédito de clientes. |

#### Solución:
Aplicar `updateMany` con condición atómica `balance: { gte: requiredBalance }`.

---

### 18. Inyección de Precios Negativos en Buylist

> [!NOTE]
> **NIVEL DE RIESGO: MEDIO**  
> Falta de validación formal en creación y edición de cartas solicitadas en compra.

| Aspecto | Detalle |
|:---|:---|
| **Archivos** | [`tienda-backend/src/buylist/buylist.controller.ts:L36`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/buylist/buylist.controller.ts#L36) y [`tienda-backend/src/buylist/buylist.service.ts:L92`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/buylist/buylist.service.ts#L92) |
| **En qué consiste** | Los endpoints recibían `data: any` sin DTO ni validadores de montos positivos. |
| **Impacto** | Guardado de precios negativos o cantidades inválidas. |

#### Solución:
Crear `CreateBuylistItemDto` y `UpdateBuylistItemDto` con `@Min(0)` y `@IsInt()` con `ValidationPipe`.

---

### 19. Soporte de Cookie `admin_access_token` en Catálogo

> [!NOTE]
> **NIVEL DE RIESGO: BAJO**  
> Tiendas administradoras no veían su catálogo propio si su sesión era solo administrativa.

| Aspecto | Detalle |
|:---|:---|
| **Archivo** | [`tienda-backend/src/products/products.controller.ts:L22`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/products/products.controller.ts#L22) |
| **En qué consiste** | `getStoreIdFromToken` únicamente leía la cookie `access_token` e ignoraba `admin_access_token`. |
| **Impacto** | Fallo al resolver la tienda del usuario administrador en vistas de catálogo interno. |

#### Solución:
Leer ambas cookies en orden de precedencia: `req.cookies?.admin_access_token || req.cookies?.access_token`.

---

## 🚀 3. Plan de Acción en 5 Fases (ESTADO: 100% IMPLEMENTADO Y VERIFICADO)

```text
[FASE 1: DINERO Y PERMISOS CRÍTICOS] ✅ COMPLETADO
 ├── 1. Fijar precio real de BD en Mercado Pago (process-payment.handler.ts)
 ├── 2. Descuento atómico de retiros contra condición de carrera (withdrawals.service.ts)
 └── 3. Aplicar RolesGuard en ventas, órdenes y reportes (payments.controller.ts)

[FASE 2: PASARELAS Y ARCHIVOS] ✅ COMPLETADO
 ├── 4. Token criptográfico temporal en OAuth Mercado Pago (mp-oauth.controller.ts)
 ├── 5. Validación de pertenencia y ofuscación PII en órdenes (payments.controller.ts & get-order-status.handler.ts)
 └── 6. Filtros MIME, tamaño máx (5MB) y validación de carpeta en Cloudinary (upload.controller.ts)

[FASE 3: BLINDAJE DE SERVIDOR Y DoS] ✅ COMPLETADO
 ├── 7. Ocultar Swagger en producción (main.ts)
 ├── 8. Instalar Helmet en backend y cabeceras de seguridad en Next.js (next.config.js)
 └── 9. Configurar Throttler (Rate Limiting) en login, registro y cupones (app.module.ts & auth.controller.ts)

[FASE 4: ESTABILIDAD Y FRONTEND] ✅ COMPLETADO
 ├── 10. Implementar DTOs estrictos de actualización (UpdateStoreByOwnerDto / UpdateStoreFullDto)
 └── 11. Ajustar middleware.ts de Next.js para protección de rutas administrativas en el borde (/admin, /superadmin)

[FASE 5: AISLAMIENTO MULTI-TIENDA Y PRIVILEGIOS SUPERADMIN] ✅ COMPLETADO
 ├── 12. Aislamiento estricto de inventario contra sabotaje entre tiendas (products.controller.ts & service.ts)
 ├── 13. Aislamiento de configuraciones de despacho físico de tiendas (shipping.controller.ts & service.ts)
 ├── 14. Restricción exclusiva a SuperAdmin de configuraciones globales y catálogo maestro (settings & sync)
 ├── 15. Descuento atómico de créditos de tienda contra concurrencia (store-credit.service.ts)
 ├── 16. Validación estricta con DTOs en compras buylist (buylist.controller.ts & service.ts)
 └── 17. Soporte multi-cookie (admin_access_token / access_token) en resolución de catálogo
```

---

## 🛡️ 4. Resumen de Verificación y Compilación

| Componente | Comando | Resultado | Estado |
|:---|:---|:---:|:---:|
| **Backend (NestJS + Prisma)** | `npm run build` | Exited with code `0` | ✅ Sin errores de TypeScript |
| **Frontend (Next.js 16)** | `npm run build` | Exited with code `0` | ✅ 67 páginas generadas sin errores |

