# Diccionario de Datos del Proyecto TapTrade (Database Data Dictionary)

> **Versión:** 1.0.0  
> **Motor de Base de Datos:** PostgreSQL con ORM Prisma (`prisma/schema.prisma`)  
> **Propósito:** Catálogo exhaustivo de tablas, modelos, campos, relaciones y reglas de negocio para evitar duplicidad de campos o inconsistencias en la arquitectura de datos.

---

## 📌 Regla de Oro: Single Source of Truth (Fuente Única de Verdad)
Antes de proponer o agregar un nuevo campo o modelo a la base de datos:
1. **Revisar este documento:** Comprobar si ya existe una entidad o campo que resuelva la misma necesidad.
2. **Prohibido duplicar estados:** No declarar flags en dos tablas distintas para representar el mismo concepto (ej. no almacenar el estado del retiro en tienda en `Store` y simultáneamente en `ShippingProvider`).
3. **Atributo propio vs Servicio externo:**
   * Atributos propios de la entidad (dirección física, horarios, retiro propio) pertenecen a la tabla raíz (`Store`, `User`).
   * Servicios externos tarifados (Chilexpress, Starken) pertenecen a tablas de integración (`ShippingProvider`).

---

## Índice de Módulos y Modelos

1. [Catálogo de Juegos y TCG](#1-catálogo-de-juegos-y-tcg)
   * `Game`, `Category`, `Brand`, `Expansion`, `Finish`, `Language`, `Condition`, `CardDetail`
2. [Productos e Inventario](#2-productos-e-inventario)
   * `Product`, `InventoryItem`, `StockReservation`, `MarketPrice`, `MarketPriceHistory`
3. [Tiendas y Vendedores (Multi-Tenant Marketplace)](#3-tiendas-y-vendedores)
   * `Store`, `StoreSetting`, `SyncBackup`
4. [Suscripciones y Monetización SaaS](#4-suscripciones-y-monetización-saas)
   * `Feature`, `SubscriptionPlan`
5. [Logística, Envíos y Territorio (Chile)](#5-logística-envíos-y-territorio)
   * `LogisticZone`, `Region`, `Commune`, `ShippingProvider`, `ShippingLabel`
6. [Usuarios, Autenticación y Direcciones](#6-usuarios-autenticación-y-direcciones)
   * `User`, `Address`, `WishlistItem`
7. [Órdenes, Pagos y Transacciones](#7-órdenes-pagos-y-transacciones)
   * `Order`, `VendorOrder`, `OrderItem`, `Payment`
8. [Billetera y Finanzas de Tiendas](#8-billetera-y-finanzas-de-tiendas)
   * `WalletTransaction`, `WithdrawalRequest`
9. [Sistema Buylist y Crédito en Tienda](#9-sistema-buylist-y-crédito-en-tienda)
   * `BuyListItem`, `StoreCredit`, `StoreCreditTransaction`
10. [Devaluaciones y Tasas de Cambio](#10-devaluaciones-y-tasas-de-cambio)
    * `Currency`, `GlobalGameExchangeRate`, `StoreGameExchangeRate`, `StoreConditionDevaluation`, `StoreLanguageDevaluation`
11. [Promociones y Marketing](#11-promociones-y-marketing)
    * `Coupon`, `GlobalSetting`
12. [Punto de Venta (POS) y Turnos de Caja](#12-punto-de-venta-pos-y-turnos-de-caja)
    * `CashShift`

---

## 1. Catálogo de Juegos y TCG

### `Game`
Representa los juegos de cartas coleccionables soportados en el marketplace (Magic: The Gathering, Pokémon, Yu-Gi-Oh!, One Piece, etc.).
* `id` (`String`, UUID, PK): Identificador único.
* `name` (`String`, Unique): Nombre legible del juego (ej: "Magic: The Gathering").
* `slug` (`String`, Unique): Identificador URL amigable (ej: "magic").
* `logoUrl` (`String?`): URL del logotipo oficial del juego.
* `isActive` (`Boolean`, default: `true`): Habilitado en la plataforma.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `cardDetails`, `expansions`, `finishes`, `stores`, `storeExchangeRates`, `globalExchangeRates`, `coupons`, `conditionDevaluations`, `languageDevaluations`.

### `Category`
Categorías principales de catálogo (Singles TCG, Cajas Selladas, Accesorios, etc.).
* `id` (`String`, UUID, PK)
* `name` (`String`, Unique): Nombre de la categoría.
* `slug` (`String`, Unique): Slug SEO.
* `imageUrl` (`String?`): Imagen representativa.
* `isTcg` (`Boolean`, default: `false`): Determina si los ítems de esta categoría utilizan cubicaje y lógica TCG.
* **Relaciones:** `products`, `coupons`.

### `Brand`
Fabricantes o marcas comerciales (Wizards of the Coast, Nintendo, Bushiroad, Dragon Shield, etc.).
* `id` (`String`, UUID, PK)
* `name` (`String`, Unique)
* `imageUrl` (`String?`)
* **Relaciones:** `products`.

### `Expansion`
Ediciones o colecciones de cartas asociadas a un juego.
* `id` (`String`, UUID, PK)
* `externalId` (`String?`): Código oficial (ej: "DMU", "SV01", Scryfall Set Code).
* `name` (`String`): Nombre de la expansión (ej: "Dominaria United").
* `releaseDate` (`DateTime?`): Fecha oficial de lanzamiento.
* `imageUrl` (`String?`): Icono de la colección.
* `gameId` (`String`, FK -> `Game`): Juego al que pertenece.
* **Índices:** `@@unique([externalId, gameId])`.
* **Relaciones:** `gameRel`, `cardDetails`.

### `Finish`
Acabados o tratamientos de las cartas (Regular, Foil, Non-Foil, Holo, Etched, etc.).
* `id` (`String`, UUID, PK)
* `name` (`String`): Nombre del acabado (ej: "Foil").
* `aliases` (`String[]`): Variantes de nombres para sync automática.
* `gameId` (`String`, FK -> `Game`): Juego al que aplica.
* **Índices:** `@@unique([name, gameId])`.
* **Relaciones:** `gameRel`, `items`, `marketPrices`.

### `Language`
Idiomas en los que se imprimen las cartas (Inglés, Español, Japonés, etc.).
* `id` (`String`, UUID, PK)
* `name` (`String`, Unique): Nombre (ej: "English", "Spanish").
* `code` (`String`, Unique): Código ISO (ej: "en", "es", "ja").
* **Relaciones:** `items`, `buyListItems`, `languageDevaluations`.

### `Condition`
Estados de conservación de cartas coleccionables bajo estándar internacional TCG.
* `id` (`String`, UUID, PK)
* `name` (`String`, Unique): Código interno ("near_mint", "lightly_played", "moderately_played", "heavily_played", "damaged").
* `displayName` (`String?`): Nombre comercial para compradores ("Near Mint (NM)", "Lightly Played (LP)").
* **Relaciones:** `items`, `devaluations`, `buyListItems`.

### `CardDetail`
Metadatos técnicos y específicos de una carta coleccionable. Relación 1:1 con `Product`.
* `id` (`String`, UUID, PK)
* `productId` (`String`, Unique, FK -> `Product`): Producto al que pertenece.
* `gameId` (`String`, FK -> `Game`): Juego asociado.
* `expansionId` (`String?`, FK -> `Expansion`): Expansión asociada.
* `expansion` (`String`): Nombre en texto plano para compatibilidad.
* `rarity` (`String`): Rareza (Common, Uncommon, Rare, Mythic, Secret Rare).
* `collectorNum` (`String`): Número de coleccionista en el set (ej: "045/280").
* `attributes` (`String[]`): Palabras clave (Color, Costo de Maná, Tipo de Carta).
* **Relaciones:** `product`, `expansionRel`, `gameRel`.

---

## 2. Productos e Inventario

### `Product`
Entidad canónica de producto o carta en el catálogo unificado del marketplace.
* `id` (`String`, UUID, PK)
* `name` (`String`): Título público del producto (ej: "Ezreal - Dashing (Alternate Art)").
* `slug` (`String?`, Unique): Ruta URL.
* `externalId` (`String?`, Unique): ID externo (Scryfall, API oficial, etc.).
* `description` (`String?`): Descripción detallada.
* `imageUrl` (`String?`): Arte principal.
* `categoryId` (`String`, FK -> `Category`): Categoría a la que pertenece.
* `brandId` (`String?`, FK -> `Brand`): Marca asociada.
* `storeId` (`String?`, FK -> `Store`): **NULL para cartas maestras compartidas del marketplace**. Si tiene `storeId`, es un producto custom exclusivo de dicha tienda.
* `weightGram`, `widthCm`, `heightCm`, `lengthCm` (`Float?`): Dimensiones físicas para cubicaje de paquetería no TCG.
* `barcode` (`String?`): Código de barras internacional (EAN-13, UPC) para escaneo rápido con pistola láser de productos sellados y accesorios.
* `sku` (`String?`): Código interno de referencia asignado por la tienda.
* `isDeleted` (`Boolean`, default: `false`) / `deletedAt` (`DateTime?`): Soft delete.
* `createdAt` / `updatedAt` (`DateTime`).
* **Índices:** `@@index([barcode])`, `@@index([name])`, `@@index([categoryId])`, `@@index([storeId])`.
* **Relaciones:** `category`, `brand`, `store`, `cardDetail`, `items`, `marketPrices`, `wishlistedBy`, `buyListItems`.

### `InventoryItem`
Ejemplar físico específico que una tienda pone a la venta en el marketplace con su precio, condición, idioma y acabado.
* `id` (`String`, UUID, PK)
* `storeId` (`String?`, FK -> `Store`): Tienda dueña del stock.
* `productId` (`String`, FK -> `Product`): Carta o producto del catálogo maestro.
* `conditionId` (`String`, FK -> `Condition`): Estado de conservación (NM, LP, etc.).
* `languageId` (`String`, FK -> `Language`): Idioma de la carta.
* `finishId` (`String?`, FK -> `Finish`): Acabado (Normal, Foil, etc.).
* `price` (`Decimal(10,2)`): Precio de venta unitario en moneda local de la tienda (CLP).
* `stock` (`Int`, default: 0): Unidades disponibles para la venta.
* `reservedStock` (`Int`, default: 0): Unidades temporalmente bloqueadas durante un checkout en proceso.
* `isPublished` (`Boolean`, default: `true`): Visibilidad en catálogo público.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `store`, `product`, `condition`, `language`, `finish`, `reservations`.

### `StockReservation`
Reserva temporal de stock mientras el usuario está en la pasarela de pago (Transbank/Mercado Pago) para evitar sobreventas (Over-selling).
* `id` (`String`, UUID, PK)
* `inventoryItemId` (`String`, FK -> `InventoryItem`)
* `orderId` (`String`, FK -> `Order`)
* `quantity` (`Int`): Cantidad de copias reservadas.
* `expiresAt` (`DateTime`): Momento en que expira la reserva si no se confirma el pago (ej: +15 minutos).
* `createdAt` (`DateTime`, default: `now()`).
* **Relaciones:** `inventoryItem`, `order`.

### `MarketPrice` / `MarketPriceHistory`
Precios de referencia de mercado global y trazabilidad histórica de precios para cartas y acabados.
* `MarketPrice`: `id`, `productId`, `finishId`, `price`, `updatedAt`.
* `MarketPriceHistory`: `id`, `marketPriceId`, `price`, `createdAt`.

---

## 3. Tiendas y Vendedores (Multi-Tenant Marketplace)

### `Company`
Entidad jurídica matriz (Empresa) que agrupa una o más sucursales físicas (`Store`). Es la entidad contratante del plan SaaS.
* `id` (`String`, UUID, PK)
* `name` (`String`): Razón Social o nombre legal de la empresa.
* `rut` (`String?`): Identificador tributario (RUT de la empresa).
* `ownerId` (`String`, FK -> `User`): Usuario administrador principal o representante legal.
* `balance` (`Decimal(10,2)`, default: 0): Billetera unificada de liquidaciones por ventas de todas las sucursales.
* `extraBranchesCount` (`Int`, default: 0): Cantidad de sucursales adicionales contratadas fuera de la casa matriz.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `company`, `owner`, `stores`.

### `Store`
Entidad central que representa a una tienda física o virtual vendedora dentro del marketplace TapTrade.
* `id` (`String`, UUID, PK)
* `companyId` (`String?`, FK -> `Company`): Empresa matriz a la que pertenece la sucursal.
* `isMainBranch` (`Boolean`, default: `true`): Indica si es la casa matriz incluida en el plan base.
* `ownerId` (`String`, Unique, FK -> `User`): Usuario propietario de la tienda.
* `name` (`String`): Nombre comercial de la tienda (ej: "BloodMoonGames", "TapTrade Store").
* `subdomain` (`String`, Unique): Subdominio público asignado (ej: `bloodmoon.taptrade.cl`).
* `customDomain` (`String?`, Unique): Dominio propio opcional (ej: `www.mitiendatcg.cl`).
* `logoUrl` (`String?`): Logo de la tienda.
* `address` (`String?`): Dirección principal registrada de la empresa.
* `latitude` / `longitude` (`Float?`): Coordenadas GPS para mapas y geolocalización.
* `balance` (`Decimal(10,2)`, default: 0): Saldo disponible acumulado por ventas (Wallet).
* `originRegionId` (`String?`, FK -> `Region`): Región geográfica de origen de los despachos de la tienda.
* `originCommuneId` (`String?`, FK -> `Commune`): Comuna geográfica de origen utilizada para calcular distancias y cotizaciones de courier.
* **Campos Oficiales de Retiro Físico (Pick-up):**
  * `pickupEnabled` (`Boolean`, default: `false`): **FUENTE ÚNICA DE VERDAD**. Indica si la tienda ofrece retiro en local sin costo ($0).
  * `pickupAddress` (`String?`): Dirección física exacta donde el cliente debe acudir a retirar su pedido.
  * `pickupSchedule` (`String?`): Días y horarios de atención al público para retiro (ej: "Lunes a Viernes 12:00 a 19:30 hrs").
* `subscriptionDiscountType` (`String?`, "NONE" | "PERCENTAGE" | "FIXED_AMOUNT")
* `subscriptionDiscountValue` (`Decimal(10,2)`)
* `subscriptionNotes` (`String?`)
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `owner`, `inventory`, `customProducts`, `vendorOrders`, `shipping`, `settings`, `transactions`, `withdrawals`, `devaluations`, `languageDevaluations`, `gameExchangeRates`, `subscriptionPlans`, `customFeatures`, `buyListItems`, `storeCredits`, `creditTransactions`, `coupons`, `originRegion`, `originCommune`, `supportedGames`, `cashShifts`.

### `StoreSetting`
Pares clave-valor para configuraciones adicionales de la tienda (redes sociales, descripción, contacto).
* `id` (`String`, UUID, PK)
* `storeId` (`String`, FK -> `Store`)
* `key` (`String`): Clave (ej: "facebook", "instagram", "whatsapp", "description", "website").
* `value` (`String`): Valor configurado.
* **Índices:** `@@unique([key, storeId])`.

---

## 4. Suscripciones y Monetización SaaS

### `SubscriptionPlan`
Planes SaaS contratables por los dueños de tiendas (Básico, Pro, Enterprise).
* `id` (`String`, UUID, PK)
* `name` (`String`, Unique): Nombre del plan.
* `description` (`String?`)
* `price` (`Decimal(10,2)`): Costo mensual del plan.
* `skuLimit` (`Int`, default: -1): Límite de cartas/productos únicos en inventario (-1 = ilimitado).
* `commissionRate` (`Decimal(5,4)`, default: 0): Comisión porcentual sobre ventas (actualmente 0%).
* `isStandard` (`Boolean`, default: `true`).
* **Relaciones:** `features`, `stores`.

### `Feature`
Funcionalidades o módulos desbloqueables por plan o addons independientes (ej: buylist, api_sync, pos).
* `id` (`String`, UUID, PK)
* `key` (`String`, Unique): Identificador clave (ej: "module:buylist", "game:magic", "module:pos").
* `name` (`String`), `description` (`String?`), `price` (`Decimal(10,2)`).
* **Relaciones:** `plans`, `stores`.

---

## 5. Logística, Envíos y Territorio (Chile)

### `LogisticZone`
Zonas logísticas de Chile agrupadas para tarificación courier (RM, NORTE_GRANDE, NORTE_CHICO, CENTRO, SUR, EXTREMO_SUR, INSULAR).
* `id` (`String`, UUID, PK)
* `code` (`String`, Unique): Código de zona.
* `name` (`String`): Nombre descriptivo.
* `isActive` (`Boolean`, default: `true`).

### `Region`
Las 16 regiones oficiales de Chile ordenadas de norte a sur.
* `id` (`String`, UUID, PK)
* `code` (`String`, Unique): Código oficial (ej: "RM", "V", "VIII", "XV").
* `name` (`String`): Nombre oficial (ej: "Región Metropolitana de Santiago").
* `shortName` (`String?`)
* `zoneId` (`String?`, FK -> `LogisticZone`)
* `ordinal` (`Int`): Orden geográfico (1 a 16).
* `isActive` (`Boolean`, default: `true`).
* **Relaciones:** `zone`, `communes`, `stores`.

### `Commune`
Catálogo oficial de comunas de Chile homologadas con Chilexpress y Starken.
* `id` (`String`, UUID, PK)
* `code` (`String`, Unique): Código unificado en mayúsculas (ej: "SANTIAGO", "PROVIDENCIA", "VALPARAISO").
* `name` (`String`): Nombre legible (ej: "Santiago Centro", "Providencia").
* `regionId` (`String`, FK -> `Region`): Región a la que pertenece.
* `zoneId` (`String?`, FK -> `LogisticZone`)
* `isActive` (`Boolean`, default: `true`).
* **Relaciones:** `region`, `zone`, `stores`.

### `ShippingProvider`
Configuración de **couriers externos de despacho** (Starken, Chilexpress) y sus **tarifas planas de respaldo**.
> ⚠️ **REGLA DE ARQUITECTURA:** Esta tabla es **exclusiva para empresas de envío y paquetería externa**.  
> **NO debe contener registros llamados `"RETIRO_TIENDA"` ni opciones de retiro físico**. El retiro físico es una cualidad propia de la tienda y reside en `Store.pickupEnabled`.
* `id` (`String`, UUID, PK)
* `storeId` (`String?`, FK -> `Store`): Tienda a la que pertenece. Si es `NULL`, representa la plantilla global por defecto.
* `name` (`String`): Nombre del courier (`"CHILEXPRESS"`, `"STARKEN"`).
* `price` (`Decimal(10,2)`): Tarifa plana de respaldo si la API en vivo no responde.
* `isActive` (`Boolean`, default: `true`): Permite al vendedor pausar o activar dicho courier en su tienda.
* `createdAt` / `updatedAt` (`DateTime`).
* **Índices:** `@@unique([name, storeId])`.
* **Relaciones:** `store`, `vendorOrders`.

### `ShippingLabel`
Etiquetas de transporte y seguimiento generadas para una orden.
* `id` (`String`, UUID, PK)
* `orderId` (`String`, Unique, FK -> `Order`)
* `provider` (`String`): "STARKEN" | "CHILEXPRESS".
* `trackingNumber` (`String`): Número de orden de transporte (OT).
* `pdfUrl` (`String`): Enlace al PDF de la etiqueta oficial.
* `cost` (`Float`): Costo real cobrado por el courier.
* `status` (`String`).

---

## 6. Usuarios, Autenticación y Direcciones

### `User`
Cuentas de compradores, administradores de tienda y superadministradores.
* `id` (`String`, UUID, PK)
* `email` (`String`, Unique)
* `password` (`String?`): Hash bcrypt (opcional si usa OAuth).
* `googleId` (`String?`, Unique): ID OAuth de Google.
* `avatar`, `name`, `phone`, `address`, `city` (`String?`)
* `lat`, `lng` (`Float?`): Coordenadas geográficas.
* `regionCode`, `cityCode` (`String?`): Ubicación para cotizaciones automáticas.
* `role` (`Role`, enum: `USER`, `ADMIN`, `SUPERADMIN`).
* `isVerified` (`Boolean`, default: `false`) / `verificationToken` (`String?`).
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `store`, `wishlist`, `orders`, `storeCredits`, `creditTransactions`, `addresses`.

### `Address`
Libreta de direcciones múltiples guardadas por el comprador en su perfil.
* `id` (`String`, UUID, PK)
* `userId` (`String`, FK -> `User`)
* `alias` (`String?`): "Casa", "Oficina", "Sucursal Starken".
* `name` (`String`): Nombre del destinatario.
* `phone` (`String`): Teléfono de contacto.
* `address` (`String`): Calle, número, departamento o sucursal.
* `city` (`String`): Nombre de comuna.
* `cityCode` (`String`): Código oficial de comuna.
* `regionCode` (`String`): Código de región.
* `isDefault` (`Boolean`, default: `false`).
* **Relaciones:** `user`.

### `WishlistItem`
Lista de deseos de cartas de los compradores.
* `userId` (`String`, FK -> `User`, PK compuesta)
* `productId` (`String`, FK -> `Product`, PK compuesta)
* `createdAt` (`DateTime`, default: `now()`)

---

## 7. Órdenes, Pagos y Transacciones

### `Order`
**Orden Maestra del Comprador (Master Order)**. Representa el carrito completo pagado en una única transacción ante la pasarela de pago (Transbank Webpay o Mercado Pago), aun si contiene cartas de múltiples tiendas vendedoras.
* `id` (`String`, UUID, PK)
* `buyOrder` (`String`, Unique): Código alfanumérico único de compra para el banco/pasarela.
* `userId` (`String?`, FK -> `User`): Comprador registrado (o `null` para checkout como invitado).
* `email`, `name`, `phone`, `address`, `city`, `cityCode`, `regionCode` (`String`): Datos de contacto y entrega.
* `notes` (`String?`): Instrucciones especiales de entrega o notas de tarifa pasarela.
* `totalAmount` (`Decimal(10,2)`): Monto final total cobrado al cliente (Productos + Envíos + Tarifa de Pasarela).
* `currencyCode` (`String?`, default: "CLP").
* `exchangeRate` (`Decimal(10,2)?`).
* `status` (`OrderStatus`, enum: `PENDING`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED`).
* `origin` (`OrderOrigin`, enum: `ONLINE_MARKETPLACE`, `POS_IN_STORE`, default: `ONLINE_MARKETPLACE`): Identifica el canal de venta.
* `posPaymentMethod` (`PosPaymentMethod?`, enum: `CASH`, `CARD_POS`, `TRANSFER`, `STORE_CREDIT`, `MIXED`): Método de pago presencial para ventas en mostrador.
* `posVoucherRef` (`String?`): Nº de autorización bancaria o número de voucher físico de la maquinita (Compraquí, Transbank, SumUp).
* `posCashierName` (`String?`): Nombre o identificador del cajero/vendedor que procesó la venta.
* `cashShiftId` (`String?`, FK -> `CashShift`): Turno de caja en el que se registró la transacción.
* `isOfflineSync` (`Boolean`, default: `false`): Flag que indica si la venta se originó en modo desconectado (sin internet) y fue sincronizada posteriormente al recuperar la red.
* `offlineCreatedAt` (`DateTime?`): Fecha y hora real exacta en la que se generó la venta en el local físico antes de la sincronización.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `payment`, `shippingLabel`, `user`, `vendorOrders`, `reservations`, `cashShift`.

### `VendorOrder`
**Sub-Orden por Tienda (Split Order)**. Divide la Orden Maestra en paquetes independientes para cada tienda vendedora.
* `id` (`String`, UUID, PK)
* `orderId` (`String`, FK -> `Order`): Orden Maestra a la que pertenece.
* `storeId` (`String`, FK -> `Store`): Tienda responsable del despacho.
* `shippingProviderId` (`String?`, FK -> `ShippingProvider`): Courier contratado para este paquete. **Es `null` para ventas presenciales POS** donde la entrega es inmediata en mostrador ($0).
* `shippingCourier` (`String?`): Nombre legible del método (`"STARKEN"`, `"CHILEXPRESS"`, `"POS_PRESENCIAL"`, `"RETIRO_TIENDA"`).
* `shippingCost` (`Decimal(10,2)`, default: 0): Costo de envío específico asignado a este paquete ($0 si es retiro o POS).
* `subtotal` (`Decimal(10,2)`, default: 0): Monto neto de productos de esta tienda.
* `status` (`OrderStatus`, default: `PENDING`): Estado de pago.
* `deliveryStatus` (`String?`, default: `"PENDING_DISPATCH"`): Estado logístico (`PENDING_DISPATCH`, `DISPATCHED`, `DELIVERED`). En ventas POS es automáticamente `DELIVERED`.
* `trackingNumber` (`String?`): Número de orden de transporte, `"RETIRO-LOCAL"` o `"VENTA-MOSTRADOR"`.
* `trackingUrl` (`String?`): Enlace directo al rastreo del courier.
* `dispatchedAt` (`DateTime?`): Fecha y hora de entrega o despacho.
* **Relaciones:** `order`, `store`, `shippingProvider`, `items`.

### `OrderItem`
Líneas de ítems individuales pertenecientes a una Sub-Orden de tienda (`VendorOrder`).
* `id` (`String`, UUID, PK)
* `vendorOrderId` (`String`, FK -> `VendorOrder`)
* `productId` (`String`): ID del producto maestro.
* `inventoryItemId` (`String?`): ID del ejemplar físico de inventario.
* `productName` (`String`): Nombre histórico al momento de la compra.
* `quantity` (`Int`): Cantidad comprada.
* `unitPrice` (`Decimal(10,2)`): Precio unitario en CLP al momento de la compra.
* **Relaciones:** `vendorOrder`.

### `Payment`
Registro de la transacción financiera con el procesador de pago.
* `id` (`String`, UUID, PK)
* `orderId` (`String`, Unique, FK -> `Order`)
* `token` (`String`, Unique): Token oficial de Webpay Plus o Mercado Pago.
* `status` (`PaymentStatus`, enum: `PENDING`, `AUTHORIZED`, `FAILED`, `NULLIFIED`).
* `amount` (`Decimal(10,2)`): Monto procesado.
* `authCode` (`String?`): Código de autorización bancaria.
* `cardLast4` (`String?`): Últimos 4 dígitos de la tarjeta.
* `paymentType` (`String?`): Tipo de tarjeta (Débito, Crédito, etc.).
* `installments` (`Int?`): Cuotas seleccionadas.
* `transactionDate` (`DateTime?`): Timestamp bancario.
* **Relaciones:** `order`.

---

## 8. Billetera y Finanzas de Tiendas

### `WalletTransaction`
Libro mayor contable (Ledger) de las tiendas para registrar créditos y débitos en su saldo.
* `id` (`String`, UUID, PK)
* `storeId` (`String`, FK -> `Store`)
* `amount` (`Decimal(10,2)`): Monto (+ positivo para abonos de ventas, - negativo para retiros).
* `type` (`TransactionType`, enum: `SALE`, `COMMISSION`, `WITHDRAWAL`, `REFUND`).
* `paymentMethod` (`String`, default: "WEBPAY").
* `isWithdrawable` (`Boolean`, default: `true`).
* `reference` (`String?`): ID de la orden o referencia contable.
* `createdAt` (`DateTime`, default: `now()`).
* **Relaciones:** `store`.

### `WithdrawalRequest`
Solicitudes de liquidación de saldo de las tiendas hacia sus cuentas bancarias comerciales.
* `id` (`String`, UUID, PK)
* `storeId` (`String`, FK -> `Store`)
* `amount` (`Decimal(10,2)`): Monto solicitado para transferencia.
* `status` (`WithdrawalStatus`, enum: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`).
* `bankDetails` (`String?`): Datos bancarios del vendedor (Banco, Tipo de Cuenta, Número, RUT).
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `store`.

---

## 9. Sistema Buylist y Crédito en Tienda

### `BuyListItem`
Lista de cartas que una tienda está dispuesta a comprar a particulares con sus precios en efectivo y en crédito en tienda.
* `id` (`String`, UUID, PK)
* `storeId` (`String`, FK -> `Store`), `productId` (`String`, FK -> `Product`)
* `conditionId` (`String`, FK -> `Condition`), `languageId` (`String`, FK -> `Language`)
* `quantityWanted` (`Int`, default: 1): Cupos que la tienda desea adquirir.
* `cashPrice` (`Decimal(10,2)`): Precio de compra pagado en dinero.
* `creditPrice` (`Decimal(10,2)`): Precio de compra pagado en saldo virtual de la tienda (Store Credit).
* `isActive` (`Boolean`, default: `true`).
* **Índices:** `@@unique([storeId, productId, conditionId, languageId])`.
* **Relaciones:** `store`, `product`, `condition`, `language`.

### `StoreCredit` / `StoreCreditTransaction`
Saldos virtuales de compradores específicos utilizables exclusivamente en una tienda determinada.
* `StoreCredit`: `storeId`, `userId`, `balance`.
* `StoreCreditTransaction`: `storeId`, `userId`, `amount`, `type` ("BUYLIST_TRADE", "MANUAL_ADD", "PURCHASE"), `reference`, `itemsData`.

---

## 10. Devaluaciones y Tasas de Cambio

### `Currency`
Monedas del sistema (CLP por defecto, USD de referencia).
* `code` ("CLP", "USD"), `name`, `symbol`, `exchangeRate`, `isDefault`.

### `GlobalGameExchangeRate` / `StoreGameExchangeRate`
Multiplicador para convertir precios de fuentes internacionales (como Scryfall USD) a pesos chilenos (CLP), a nivel global o por tienda/juego.

### `StoreConditionDevaluation` / `StoreLanguageDevaluation`
Multiplicadores porcentuales que cada tienda aplica sobre el precio base según la condición (ej: LP = 0.85, HP = 0.60) o el idioma (ej: Español = 0.95, Japonés = 1.10).

---

## 11. Promociones y Marketing

### `Coupon`
Códigos promocionales de descuento creados por tiendas.
* `id` (`String`, UUID, PK)
* `code` (`String`, Unique): Código en mayúsculas (ej: "CYBER10").
* `discountPercent` (`Float`): Porcentaje de descuento (ej: 10 para 10%).
* `validFrom` / `validUntil` (`DateTime`): Periodo de vigencia.
* `isActive` (`Boolean`, default: `true`).
* `storeId` (`String`, FK -> `Store`): Tienda que financia el cupón.
* `scope` (`CouponScope`, enum: `STORE_WIDE`, `CATEGORY_SPECIFIC`, `GAME_SPECIFIC`).
* **Relaciones:** `store`, `categories`, `games`.

### `GlobalSetting`
Pares clave-valor globales del marketplace (banners generales, mantenimiento, anuncios).

---

## 12. Punto de Venta (POS) y Turnos de Caja

### `CashShift`
Sesión de apertura, control de flujo de caja y arqueo diario de mostrador para tiendas físicas.
* `id` (`String`, UUID, PK)
* `storeId` (`String`, FK -> `Store`): Tienda a la que pertenece la sesión de caja.
* `cashierName` (`String`): Nombre del cajero o vendedor responsable del turno.
* `status` (`String`, default: `"OPEN"`): Estado del turno (`"OPEN"`, `"CLOSED"`).
* `openedAt` (`DateTime`, default: `now()`): Fecha y hora de apertura.
* `closedAt` (`DateTime?`): Fecha y hora de cierre y arqueo.
* `initialCash` (`Decimal(10,2)`): Fondo inicial en efectivo para dar cambio/vuelto.
* `expectedCash` (`Decimal(10,2)?`): Monto en efectivo calculado automáticamente por el sistema (`initialCash` + ventas en efectivo).
* `actualCash` (`Decimal(10,2)?`): Monto real de efectivo contado físicamente por el cajero al momento de cerrar.
* `cardTotal` (`Decimal(10,2)`, default: 0): Total acumulado en cobros con maquinita física (Compraquí, Transbank, MP Point) para cuadrar con el cierre de lote de la terminal.
* `transferTotal` (`Decimal(10,2)`, default: 0): Total acumulado en transferencias bancarias directas.
* `creditTotal` (`Decimal(10,2)`, default: 0): Total cobrado en Store Credit (saldo de tienda).
* `cashOutTotal` (`Decimal(10,2)`, default: 0): Total acumulado de salidas de efectivo por compras de cartas al público (`CashPurchase`).
* `difference` (`Decimal(10,2)?`): Descuadre de caja calculado (`actualCash - expectedCash`). Positivo indica sobrante, negativo faltante.
* `notes` (`String?`): Observaciones del turno o justificación de diferencias.
* `createdAt` / `updatedAt` (`DateTime`).
* **Índices:** `@@index([storeId, status])`.
* **Relaciones:** `store`, `orders`, `cashPurchases`.

### `CashPurchase`
Registro canónico de **compras de cartas en efectivo (Trade-In Cash)** realizadas por la tienda a particulares en el mostrador. Separa estrictamente los egresos de efectivo real de las ventas (`Order`) y de los saldos virtuales (`StoreCreditTransaction`).
* `id` (`String`, UUID, PK)
* `code` (`String`, Unique): Código legible de comprobante de egreso (ej: `BUY-CASH-173021...`).
* `storeId` (`String`, FK -> `Store`): Tienda que adquiere las cartas y desembolsa el dinero.
* `userId` (`String?`, FK -> `User`): Usuario registrado al que se le compró (opcional si es un vendedor de paso).
* `customerName`, `customerEmail`, `customerRut` (`String?`): Datos de identificación de la persona que recibió el efectivo.
* `totalAmount` (`Decimal(10,2)`): Monto total desembolsado en efectivo de la caja.
* `cashierName` (`String`): Nombre del cajero responsable de la recepción de las cartas y entrega del efectivo.
* `cashShiftId` (`String?`, FK -> `CashShift`): Turno de caja del cual salió el efectivo.
* `itemsData` (`Json`): Snapshot detallado de las cartas adquiridas (`product`, `quantity`, `price`, `condition`, `language`, `finish`).
* `notes` (`String?`): Observaciones de la compra.
* `createdAt` (`DateTime`, default: `now()`).
* **Índices:** `@@index([storeId, createdAt])`, `@@index([cashShiftId])`.
* **Relaciones:** `store`, `user`, `cashShift`.

> ⚠️ **REGLA FINANCIERA CANÓNICA (NO RETENCIÓN EN BILLETERA):**  
> Las ventas presenciales procesadas a través del módulo POS son cobradas directamente por el vendedor en su local físico (dinero en efectivo en mano o depósito en la cuenta de su maquinita propia).  
> **Dichos fondos NO se acreditan a `Store.balance` en la tabla `WalletTransaction` como saldo retirable**, ya que el dinero nunca pasa por la cuenta recaudadora central de TapTrade. Esto evita que una tienda solicite una transferencia de liquidación (`WithdrawalRequest`) por dinero que ya percibió físicamente.

---

## Resumen de Cambios Recientes (Auditoría Anti-Duplicidad)

| Fecha | Cambio | Justificación Técnica |
| :--- | :--- | :--- |
| **Octubre 2026** | **Arquitectura de Punto de Venta (POS) y Turnos de Caja** | Se incorporó el modelo `CashShift`, campos `barcode` y `sku` en `Product`, origen `POS_IN_STORE` en `Order` y flexibilización de `VendorOrder.shippingProviderId`. Se fijó la regla financiera canónica que impide computar ventas presenciales en la billetera de custodia del marketplace. |
| **Octubre 2026** | **Eliminación de `RETIRO_TIENDA` en `ShippingProvider`** | Se consolidó `Store.pickupEnabled` (`pickupAddress` y `pickupSchedule`) como la **única fuente de verdad** del retiro en local ($0). La tabla `ShippingProvider` queda reservada exclusivamente para couriers de despacho externos (`CHILEXPRESS`, `STARKEN`). |
| **Octubre 2026** | **Persistencia de Carrito en `localStorage`** | Se implementó sincronización automática en `cart-slice.ts` (`taptrade_cart_v1`) para evitar la pérdida de cartas seleccionadas al refrescar la página. |
