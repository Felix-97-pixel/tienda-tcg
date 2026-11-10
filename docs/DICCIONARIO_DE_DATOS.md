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
   * `SubscriptionPlan`
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
* `commissionRate` (`Decimal(5,4)?`): Porcentaje opcional de comisión especial por categoría de producto (ej: `0.0500` = 5%).
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
Precios de referencia de mercado global (EE.UU. / APIs externas como TCGplayer y MTGJSON) y trazabilidad histórica de precios para cartas y acabados.
* `MarketPrice`: `id`, `productId`, `finishId`, `price`, `updatedAt`.
* `MarketPriceHistory`: `id`, `marketPriceId`, `price`, `date` (`DateTime @db.Date`, clave de deduplicación diaria), `createdAt`. Clave única: `@@unique([marketPriceId, date])`.

### `LocalMarketPriceHistory`
Índice histórico consolidado de precios del propio marketplace de TapTrade (generado por la actividad real de las tiendas y usuarios en la plataforma).
* `id` (`String`, UUID, PK)
* `productId` (`String`, FK -> `Product`)
* `finishId` (`String?`, FK -> `Finish`)
* `date` (`DateTime @db.Date`, YYYY-MM-DD): Fecha del snapshot diario.
* `lowPrice` (`Decimal(10,2)`): Precio más bajo listado con stock disponible por usuarios/tiendas en Chile.
* `avgPrice` (`Decimal(10,2)`): Promedio ponderado de precios listados en la plataforma.
* `highPrice` (`Decimal(10,2)`): Precio más alto listado.
* `lastSoldPrice` (`Decimal(10,2)?`): Último precio al que se concretó una venta real en el marketplace (`OrderItem`).
* `activeListings` (`Int`): Cantidad de usuarios/tiendas con stock activo hoy.
* `totalStock` (`Int`): Stock físico total disponible en la plataforma.
* `currency` (`String`, default: "CLP"): Moneda de transacción del mercado local.
* `createdAt` (`DateTime`).
* Clave única: `@@unique([productId, finishId, date])`.
* **Relaciones:** `product`, `finish`.

---

## 3. Tiendas y Vendedores (Multi-Tenant Marketplace)

### `Company`
Entidad jurídica matriz (Empresa) que agrupa una o más sucursales físicas (`Store`). Es la entidad contratante del plan SaaS y el sujeto tributario ante el SII (B2B2C).
* `id` (`String`, UUID, PK)
* `name` (`String`): Razón Social o nombre comercial principal de la empresa.
* `rut` (`String?`): Identificador tributario chileno (RUT con dígito verificador Módulo 11).
* `legalName` (`String?`): Razón social legal registrada ante el Servicio de Impuestos Internos (SII).
* `fantasyName` (`String?`): Nombre de fantasía registrado.
* `taxActivity` (`String?`): Giro o actividad económica principal registrada ante el SII.
* `taxAddress` (`String?`): Domicilio tributario de la casa matriz.
* `taxCommune` (`String?`): Comuna tributaria.
* `taxRegion` (`String?`): Región tributaria.
* `taxClassification` (`String`, default: `"PRIMERA_CATEGORIA_AFECTO"`): Régimen tributario (`"PRIMERA_CATEGORIA_AFECTO"` | `"PRIMERA_CATEGORIA_EXENTO"`).
* `siiActivityStarted` (`Boolean`, default: `true`): Confirmación de Inicio de Actividades vigente en 1ª Categoría ante el SII.
* `dteEmail` (`String?`): Correo oficial de intercambio de DTEs ante el SII.
* `verificationStatus` (`String`, default: `"ENABLED"`): Estado administrativo de habilitación (`"PENDING_VERIFICATION"` | `"PENDING_DOCS"` | `"ENABLED"` | `"SUSPENDED"` | `"BLOCKED"`).
* `verifiedAt` (`DateTime?`) / `verifiedByUserId` (`String?`): Auditoría de verificación por Superadministrador.
* `mandateAcceptedAt` (`DateTime?`) / `mandateContractUrl` (`String?`): Aceptación y respaldo del Mandato Mercantil de Recaudación.
* `customCommissionRate` (`Decimal(5,4)?`): Excepción comercial de comisión al vendedor para esta empresa (si es `null`, aplica la tasa del plan o plataforma).
* `commissionCalcBase` (`String`, default: `"NET"`): Base de cálculo de la comisión al vendedor (`"NET"` | `"GROSS"`).
* `bankName` (`String?`): Banco comercial de destino para liquidaciones.
* `bankAccountType` (`String?`): Tipo de cuenta (`"CUENTA_CORRIENTE"` | `"CUENTA_VISTA"` | `"CUENTA_RUT"`).
* `bankAccountNumber` (`String?`): Número de cuenta bancaria.
* `bankHolderRut` (`String?`): RUT del titular de la cuenta bancaria.
* `bankHolderName` (`String?`): Nombre/Razón Social del titular bancario.
* `bankEmail` (`String?`): Correo de notificación bancaria.
* `bankUpdatedAt` (`DateTime?`): Fecha de última actualización de datos bancarios para trazabilidad.
* `logoUrl` (`String?`): Logo corporativo principal del Holding / Empresa.
* `ownerId` (`String`, FK -> `User`): Usuario administrador principal o representante legal.
* `planId` (`String?`, FK -> `SubscriptionPlan`): Plan SaaS contratado por la empresa (Starter, Store, Mega Store, Enterprise). Todas las sucursales heredan este plan corporativo.
* `balance` (`Decimal(10,2)`, default: 0): Billetera unificada de liquidaciones por ventas de todas las sucursales.
* `extraBranchesCount` (`Int`, default: 0): Cantidad de sucursales adicionales contratadas fuera de la casa matriz.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `owner`, `plan`, `stores`, `members`.

### `CompanyMember`
Membresía que vincula un usuario de la tabla centralizada `User` con una `Company` (Holding), confiriéndole privilegios corporativos.
* `id` (`String`, UUID, PK): Identificador único de la membresía.
* `companyId` (`String`, FK -> `Company`): Empresa a la que pertenece.
* `userId` (`String`, FK -> `User`): Usuario acreditado.
* `role` (`CompanyRole`, enum: `OWNER`, `ADMIN`, `ACCOUNTANT`, default: `OWNER`):
  * `OWNER`: Dueño o representante legal de la empresa (Super Usuario de la tienda). Visión consolidada de todas las sucursales, cambio de sucursal, gestión de suscripción SaaS y administración de personal.
  * `ADMIN`: Administrador general del holding con permisos operativos sobre todas las tiendas.
  * `ACCOUNTANT`: Acceso a métricas consolidadas, balances y liquidaciones bancarias.
* `createdAt` (`DateTime`, default: `now()`).
* **Índices:** `@@unique([companyId, userId])`, `@@index([companyId])`, `@@index([userId])`.
* **Relaciones:** `company`, `user`.

### `StoreMember`
Membresía que asigna un usuario de la tabla centralizada `User` a una sucursal física o digital específica (`Store`), limitando su alcance operativo.
* `id` (`String`, UUID, PK): Identificador único de la membresía local.
* `storeId` (`String`, FK -> `Store`): Sucursal a la que está asignado.
* `userId` (`String`, FK -> `User`): Usuario asignado.
* `role` (`StoreRole`, enum: `BRANCH_MANAGER`, `CASHIER`, default: `CASHIER`):
  * `BRANCH_MANAGER`: Encargado de local. Puede gestionar inventario local, ventas POS, despachos locales y cajeros de su tienda.
  * `CASHIER`: Cajero de mesón/POS. Acceso exclusivo a apertura/cierre de turnos de caja (`CashShift`), ventas POS y búsqueda de inventario de su sucursal. No tiene acceso a billeteras matrices ni sucursales hermanas.
* `createdAt` (`DateTime`, default: `now()`).
* **Índices:** `@@unique([storeId, userId])`, `@@index([storeId])`, `@@index([userId])`.
* **Relaciones:** `store`, `user`.

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
* **Relaciones:** `owner`, `inventory`, `customProducts`, `vendorOrders`, `shipping`, `settings`, `transactions`, `withdrawals`, `devaluations`, `languageDevaluations`, `gameExchangeRates`, `subscriptionPlans`, `buyListItems`, `storeCredits`, `creditTransactions`, `coupons`, `originRegion`, `originCommune`, `supportedGames`, `cashShifts`.

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
* `commissionRate` (`Decimal(5,4)`, default: 0): Comisión porcentual sobre ventas a la tienda (0.00% bajo el modelo SaaS actual; el 3.00% neto + IVA de servicio y protección lo asume el comprador en checkout).
* `isStandard` (`Boolean`, default: `true`).
* **Relaciones:** `stores`, `companies`.

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
* **Relaciones:** `store`, `wishlist`, `orders`, `storeCredits`, `creditTransactions`, `addresses`, `companyMemberships`, `storeMemberships`, `ownedCompanies`.

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
* `notes` (`String?`): Instrucciones especiales de entrega y desglose financiero ("Comisión TapTrade (3% + IVA): $X | Pasarela Webpay: $Y").
* `totalAmount` (`Decimal(10,2)`): Monto final total cobrado al comprador en el terminal de pago (Productos + Envíos + Comisión TapTrade + Tarifa Pasarela de Pago).
* `productsTotal` (`Decimal(10,2)`, default: 0): Subtotal bruto consolidado de productos (IVA incluido por las tiendas).
* `shippingTotal` (`Decimal(10,2)`, default: 0): Subtotal bruto consolidado de envíos (IVA incluido por las tiendas o couriers).
* `serviceFeeGross` (`Decimal(10,2)`, default: 0): Comisión bruta de servicio cobrada al comprador por TapTrade (3% neto + IVA 19% propio).
* `serviceFeeNet` (`Decimal(10,2)`, default: 0): Comisión neta de servicio al comprador (ingreso propio de TapTrade SpA).
* `serviceFeeVat` (`Decimal(10,2)`, default: 0): IVA débito fiscal propio de TapTrade SpA sobre el cargo al comprador.
* `sellerCommissionNet` (`Decimal(10,2)`, default: 0): Suma consolidada de comisiones netas descontadas a los vendedores en la orden.
* `sellerCommissionVat` (`Decimal(10,2)`, default: 0): Suma consolidada de IVA débito propio de TapTrade sobre las comisiones descontadas a los vendedores.
* `sellerCommissionGross` (`Decimal(10,2)`, default: 0): Suma consolidada bruta de comisiones descontadas a los vendedores.
* `transbankFeeEstimate` (`Decimal(10,2)`, default: 0): Costo de procesamiento financiero cobrado de manera transparente al comprador (Webpay Plus o Mercado Pago).
* `vatRateSnapshot` (`Decimal(5,4)`, default: 0.19): Tasa de IVA vigente al momento de la transacción.
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
* `subtotal` (`Decimal(10,2)`, default: 0): Monto bruto de productos de esta tienda (IVA incluido).
* `taxableNet` (`Decimal(10,2)`, default: 0): Base neta imponible de la tienda para su propia boleta/factura electrónica ante el SII.
* `vatAmount` (`Decimal(10,2)`, default: 0): Monto del débito fiscal IVA (19%) correspondiente a la tienda.
* `vatRate` (`Decimal(5,4)`, default: 0.19): Tasa de IVA aplicada por la tienda.
* `commissionRateApplied` (`Decimal(5,4)`, default: 0): Tasa de comisión al vendedor aplicada a esta sub-orden según jerarquía comercial.
* `commissionCalcBase` (`String`, default: `"NET"`): Base de cálculo utilizada (`"NET"` | `"GROSS"`).
* `sellerCommissionNet` (`Decimal(10,2)`, default: 0): Comisión neta descontada al vendedor (ingreso propio de TapTrade).
* `sellerCommissionVat` (`Decimal(10,2)`, default: 0): IVA débito sobre la comisión al vendedor.
* `sellerCommissionGross` (`Decimal(10,2)`, default: 0): Comisión total con IVA retenida al vendedor.
* `sellerNetPayout` (`Decimal(10,2)`, default: 0): Saldo líquido exacto a transferir a la tienda por esta sub-orden (`subtotal + shippingCost - sellerCommissionGross`).
* `settlementStatus` (`String`, default: `"HELD_ESCROW"`): Estado financiero de liquidación de la sub-orden (`"HELD_ESCROW"` | `"AVAILABLE"` | `"LOCKED_IN_SETTLEMENT"` | `"SETTLED"` | `"REFUNDED"` | `"DISPUTED"`).
* `buyerDteType` (`Int?`): Código SII del DTE emitido por la tienda al comprador final (`39` Boleta Afecta, `41` Boleta Exenta, `33` Factura Electrónica).
* `buyerDteFolio` (`String?`) / `buyerDteUrl` (`String?`): Folio y enlace al DTE emitido por la tienda al comprador.
* `withdrawalRequestId` (`String?`, FK -> `WithdrawalRequest`): Lote de liquidación formal en el que fue incluida esta sub-orden.
* `sellerRut` (`String?`): RUT del comercio emisor del DTE.
* `sellerLegalName` (`String?`): Razón social del comercio emisor.
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

### `DispatchEvidence` (TapTrade Shield)
Evidencia multimedia registrada por la tienda al momento de despachar un paquete para blindar la operación contra fraudes.
* `id` (`String`, UUID, PK)
* `vendorOrderId` (`String`, Unique, FK -> `VendorOrder`): Sub-orden asociada.
* `contentPhotoUrl` (`String`): Foto 1 - Cartas sobre la mesa junto a la orden de despacho/packing slip.
* `packagingPhotoUrl` (`String`): Foto 2 - Cartas protegidas dentro de toploaders/sleeves/cartón.
* `packagePhotoUrl` (`String`): Foto 3 - Paquete exterior sellado con etiqueta de transporte del courier sobre la solapa o cierre.
* `capturedAt` (`DateTime`, default: `now()`): Marca temporal inmutable del momento del empaque.
* `uploaderUserId` (`String`, FK -> `User`): Empleado o administrador de tienda que realizó el empaque.
* `lifecycleExpiresAt` (`DateTime?`): Fecha programada de eliminación automática de fotos (30 días tras entrega sin reclamos) para ahorro de almacenamiento en la nube.
* **Relaciones:** `vendorOrder`, `uploader`.

### `OrderDispute` (Arbitraje Antifraude)
Procedimiento de reclamación y arbitraje formal entre comprador y tienda con congelamiento de fondos en escrow.
* `id` (`String`, UUID, PK)
* `vendorOrderId` (`String`, Unique, FK -> `VendorOrder`): Sub-orden disputada.
* `orderId` (`String`, FK -> `Order`): Orden maestra.
* `buyerId` (`String`, FK -> `User`): Comprador reclamante.
* `storeId` (`String`, FK -> `Store`): Tienda reclamada.
* `reason` (`DisputeReason`, enum: `WRONG_ITEM`, `MISSING_ITEM`, `CONDITION_MISMATCH`, `COUNTERFEIT_SUSPECT`, `PACKAGE_TAMPERED`): Motivo tipificado de la disputa.
* `buyerDescription` (`String`): Argumentos expuestos por el comprador.
* `unboxingVideoUrl` (`String?`): Enlace o archivo al video continuo de desempaque (obligatorio en reclamos > $20.000 CLP).
* `buyerPhotoUrls` (`String[]`): Fotografías de detalle aportadas por el comprador.
* `sellerResponse` (`String?`): Descargo formal de la tienda.
* `status` (`DisputeStatus`, enum: `OPEN`, `UNDER_REVIEW`, `RESOLVED_STORE`, `RESOLVED_BUYER`, `DISMISSED_FRAUD`): Estado del proceso arbitral.
* `resolutionNotes` (`String?`): Fundamento del fallo emitido por el Superadministrador.
* `arbitratedById` (`String?`, FK -> `User`): Superadministrador que resolvió la disputa.
* `resolvedAt` (`DateTime?`): Timestamp de cierre de la disputa.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `vendorOrder`, `order`, `buyer`, `store`, `arbitratedBy`.

### `UserFraudScore`
Métricas de reputación y riesgo automatizadas para compradores y tiendas.
* `id` (`String`, UUID, PK)
* `userId` (`String`, Unique, FK -> `User`): Usuario evaluado.
* `riskScore` (`Int`, default: 0): Puntuación de riesgo de 0 a 100 (>= 80 gatilla bloqueo preventivo).
* `totalOrdersCount` (`Int`, default: 0): Total histórico de órdenes completadas.
* `disputesOpenedCount` (`Int`, default: 0): Cantidad de disputas iniciadas.
* `disputesWonCount` (`Int`, default: 0): Disputas resueltas a favor.
* `disputesLostCount` (`Int`, default: 0): Disputas resueltas en contra o desestimadas por fraude.
* `isBanned` (`Boolean`, default: `false`): Flag de inhabilitación permanente de cuenta.
* `bannedAt` (`DateTime?`): Fecha de sanción.
* `banReason` (`String?`): Motivo del baneo.
* `associatedRuts` (`String[]`): RUTs vinculados para bloqueo cruzado.
* `associatedIps` (`String[]`): Direcciones IP registradas en actividades fraudulentas.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `user`.

---

## 8. Billetera y Finanzas de Tiendas

### `WalletTransaction`
Libro mayor contable inmutable (*Append-Only Financial Ledger*) de las tiendas y de la plataforma para registrar créditos, débitos, custodia, liberaciones, comisiones, liquidaciones, reembolsos y ajustes sin sobrescribir movimientos históricos.
* `id` (`String`, UUID, PK)
* `storeId` (`String`, FK -> `Store`)
* `orderId` (`String?`, FK -> `Order`): Orden maestra relacionada.
* `vendorOrderId` (`String?`, FK -> `VendorOrder`): Sub-orden específica relacionada.
* `withdrawalRequestId` (`String?`, FK -> `WithdrawalRequest`): Liquidación relacionada.
* `parentTransactionId` (`String?`): Referencia al asiento original cuando se trata de una liberación de custodia, reversa o reembolso.
* `amount` (`Decimal(10,2)`): Importe del movimiento (+ positivo para abonos, - negativo para cargos/salidas).
* `netAmount` (`Decimal(10,2)?`): Monto neto tributario asociado al movimiento.
* `vatAmount` (`Decimal(10,2)?`): IVA asociado al movimiento.
* `type` (`TransactionType`, enum: `SALE`, `ESCROW_RELEASE`, `COMMISSION`, `WITHDRAWAL`, `WITHDRAWAL_REVERSAL`, `REFUND`, `CHARGEBACK`, `ADJUSTMENT`).
* `direction` (`String`, default: `"CREDIT"`): Dirección contable (`"CREDIT"` | `"DEBIT"`).
* `bucket` (`String`, default: `"ESCROW"`): Cuenta/bolsillo afectado (`"ESCROW"` | `"AVAILABLE"` | `"SETTLED"` | `"PLATFORM_REVENUE"` | `"GATEWAY_COST"`).
* `status` (`String`, default: `"POSTED"`): Estado del asiento (`"POSTED"` | `"REVERSED"`).
* `balanceAfterEscrow` (`Decimal(10,2)`, default: 0): Saldo en custodia de la tienda inmediatamente después del asiento.
* `balanceAfterAvailable` (`Decimal(10,2)`, default: 0): Saldo disponible para liquidar de la tienda inmediatamente después del asiento.
* `paymentMethod` (`String`, default: `"WEBPAY"`).
* `isWithdrawable` (`Boolean`, default: `true`).
* `reference` (`String?`): Glosa o descripción contable legible.
* `idempotencyKey` (`String?`, Unique): Clave única de idempotencia para impedir asientos duplicados.
* `createdByUserId` (`String?`): Usuario o proceso que originó el movimiento.
* `metadata` (`Json?`): Metadatos estructurados de auditoría.
* `effectiveAt` (`DateTime`, default: `now()`): Fecha efectiva contable.
* `createdAt` (`DateTime`, default: `now()`).
* **Relaciones:** `store`, `order`, `vendorOrder`, `withdrawalRequest`.

### `WithdrawalRequest`
Liquidaciones formales por lote de sub-órdenes (`Settlements`) hacia las cuentas bancarias verificadas de las tiendas, incluyendo respaldo de Documentos Tributarios Electrónicos (DTE) y comprobantes bancarios.
* `id` (`String`, UUID, PK)
* `settlementCode` (`String?`, Unique): Código correlativo legible de la liquidación (ej: `LIQ-202611-0001`).
* `storeId` (`String`, FK -> `Store`)
* `grossSalesAmount` (`Decimal(10,2)`, default: 0): Suma bruta de ventas + envíos de las sub-órdenes (`VendorOrder`) incluidas en la liquidación.
* `sellerCommissionNet` (`Decimal(10,2)`, default: 0): Comisión neta retenida por TapTrade al vendedor en esta liquidación.
* `sellerCommissionVat` (`Decimal(10,2)`, default: 0): IVA débito sobre la comisión al vendedor.
* `sellerCommissionGross` (`Decimal(10,2)`, default: 0): Comisión total bruta descontada en la liquidación.
* `adjustmentsAmount` (`Decimal(10,2)`, default: 0): Ajustes manuales autorizados o descuentos adicionales aplicados.
* `amount` (`Decimal(10,2)`): **Monto líquido final a transferir** a la cuenta bancaria de la tienda (`grossSalesAmount - sellerCommissionGross + adjustmentsAmount`).
* `status` (`WithdrawalStatus`, enum: `PENDING`, `APPROVED`, `REJECTED`, `COMPLETED`, `FAILED`).
* `bankDetails` (`String?`): Resumen textual de la cuenta bancaria de destino.
* `bankSnapshot` (`Json?`): Snapshot inmutable de los datos bancarios estructurados al momento de solicitar la liquidación.
* `platformDteType` (`Int?`) / `platformDteFolio` (`String?`) / `platformDteUrl` (`String?`): Tipo DTE (ej: `33` Factura Electrónica), folio y PDF emitido por TapTrade por su comisión.
* `storeDteType` (`Int?`) / `storeDteFolio` (`String?`) / `storeDteUrl` (`String?`): Tipo DTE o Acta de Rendición de Mandato, folio y archivo PDF de respaldo subido por la tienda.
* `transferReference` (`String?`): Código o número de operación de la transferencia bancaria ejecutada.
* `transferReceiptUrl` (`String?`): Comprobante de transferencia bancaria adjuntado por Superadmin.
* `processedByUserId` (`String?`): ID del Superadministrador que procesó la liquidación.
* `processedAt` (`DateTime?`): Fecha y hora de ejecución bancaria o cierre.
* `rejectionReason` (`String?`) / `notes` (`String?`): Observaciones o motivo de rechazo/fallo.
* `createdAt` / `updatedAt` (`DateTime`).
* **Relaciones:** `store`, `vendorOrders`, `transactions`.

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
Multiplicador para convertir precios de fuentes internacionales (como Scryfall USD) a pesos chilenos (CLP), a nivel global o por tienda/juego, además de configurar las tasas de compra para Trade-in:
* `id` (`String`, UUID, PK)
* `storeId` (`String`, FK a `Store` en `StoreGameExchangeRate`): Tienda o sucursal dueña de la tasa personalizada.
* `gameId` (`String`, FK a `Game`): Juego TCG al que aplica la tasa.
* `currencyCode` (`String`, en `GlobalGameExchangeRate`): Divisa base (ej: "USD").
* `rate` (`Decimal(10,2)`): Tasa de conversión a CLP que fija el Precio Final de Venta al Público (con IVA incluido).
* `buyPercentage` (`Decimal(5,2)`, default: `50.00`): Porcentaje sobre el PVP de venta que se paga al cliente en efectivo/transferencia al recibir cartas de este juego en Trade-in cuando no figuran en la Buylist.
* `creditPercentage` (`Decimal(5,2)`, default: `70.00`): Porcentaje sobre el PVP de venta que se abona al cliente en Crédito de Tienda (+bono) al recibir cartas de este juego en Trade-in cuando no figuran en la Buylist.
* `createdAt` / `updatedAt` (`DateTime`).

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

> ⚠️ **REGLA FINANCIERA, COMERCIAL Y TRIBUTARIA CANÓNICA DEL POS (`POS_IN_STORE`):**  
> 1. **0% Comisión por Transacción y 0% Recargo de Pasarela:** Las ventas presenciales procesadas a través del módulo POS son cobradas directamente por la tienda en su local físico (Efectivo, Maquinita propia del local, Transferencia o Store Credit). No tienen recargo de pasarela Webpay/MP ni comisión porcentual por venta de TapTrade (`commissionRateApplied = 0`, `sellerCommissionGross = 0`), ya que el uso del POS se monetiza a través de la **Suscripción Mensual SaaS en UF (+ 19% IVA)** y los cobros por **Sucursal Extra (+2.50 UF/mes)** y **Cajero POS Extra (+0.35 UF/mes)**. Esto elimina cualquier incentivo para que la tienda venda por fuera del sistema y garantiza que el stock físico y web permanezcan sincronizados en tiempo real.  
> 2. **No Retención en Billetera ni Liquidaciones (`settlementStatus = 'SETTLED'`):** Dichos fondos **NO se acreditan a `Store.balance` ni al libro `WalletTransaction`**, y se excluyen de los lotes de liquidación (`WithdrawalRequest`), puesto que el dinero jamás pasa por la cuenta bancaria recaudadora de TapTrade.  
> 3. **Visibilidad Tributaria F29 para la Tienda (`/admin/wallet`):** Al crearse la orden POS, se calcula y persiste su `taxableNet` (Base Neta Imponible) y `vatAmount` (19% IVA Débito Fiscal propio de la tienda). El Resumen F29 y el Libro de Ventas CSV de la tienda consolidan ambos canales (`ONLINE_MARKETPLACE` y `POS_MOSTRADOR`) claramente diferenciados para el contador de la tienda.  
> 4. **Aislamiento Contable de TapTrade SpA (`/superadmin/accounting`):** La contabilidad corporativa de TapTrade SpA filtra estrictamente `origin: 'ONLINE_MARKETPLACE'` para que el dinero en efectivo o maquinita de los locales de las tiendas nunca contamine la Recaudación Bancaria Global ni el F29 propio de TapTrade.

---

## Resumen de Cambios Recientes (Auditoría Anti-Duplicidad)

| Fecha | Cambio | Justificación Técnica |
| :--- | :--- | :--- |
| **Noviembre 2026** | **Sistema de Intermediación, Comisiones Híbridas, Ledger Inmutable, Liquidaciones por Lotes SII y Regla Tributaria POS** | Se implementó el motor de comisiones híbrido, libro mayor inmutable (`WalletTransaction` append-only), liquidaciones por lote de sub-órdenes (`WithdrawalRequest`) con respaldo DTE/Mandato y comprobante TEF, y la separación contable entre ventas `ONLINE_MARKETPLACE` (recaudadas por TapTrade) y ventas `POS_IN_STORE` (0% comisión por transacción, monetizadas vía SaaS UF, reflejadas en el F29/CSV de la tienda y excluidas de la cartola bancaria de TapTrade). |
| **Octubre 2026** | **Arquitectura de Punto de Venta (POS) y Turnos de Caja** | Se incorporó el modelo `CashShift`, campos `barcode` y `sku` en `Product`, origen `POS_IN_STORE` en `Order` y flexibilización de `VendorOrder.shippingProviderId`. Se fijó la regla financiera canónica que impide computar ventas presenciales en la billetera de custodia del marketplace. |
| **Octubre 2026** | **Eliminación de `RETIRO_TIENDA` en `ShippingProvider`** | Se consolidó `Store.pickupEnabled` (`pickupAddress` y `pickupSchedule`) como la **única fuente de verdad** del retiro en local ($0). La tabla `ShippingProvider` queda reservada exclusivamente para couriers de despacho externos (`CHILEXPRESS`, `STARKEN`). |
| **Octubre 2026** | **Persistencia de Carrito en `localStorage`** | Se implementó sincronización automática en `cart-slice.ts` (`taptrade_cart_v1`) para evitar la pérdida de cartas seleccionadas al refrescar la página. |
