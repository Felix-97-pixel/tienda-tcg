# 📡 API Reference — TCG E-commerce Platform

Documentación completa de la API REST del backend. Todos los endpoints usan el prefijo base `/api/v1`.

> **Swagger UI** disponible en `http://localhost:3001/api/docs` cuando el backend está corriendo.

---

## Índice

1. [Convenciones](#convenciones)
2. [Auth](#auth)
3. [Users](#users)
4. [Products](#products)
5. [Payments](#payments)
6. [Sync](#sync)
7. [Price Updater](#price-updater)
8. [Shipping](#shipping)
9. [Currencies](#currencies)
10. [Wishlist](#wishlist)
11. [Upload](#upload)
12. [Settings](#settings)

---

## Convenciones

### Base URL
```
http://localhost:3001/api/v1
```

### Autenticación
Los endpoints protegidos requieren un JWT válido enviado como cookie `access_token`. La cookie se establece automáticamente al hacer login.

Los iconos indican el nivel de acceso requerido:
- 🌐 **Público** — Sin autenticación requerida
- 🔒 **Autenticado** — Requiere JWT válido (cualquier rol)
- 🛡️ **Admin** — Requiere JWT con rol `ADMIN`

### Respuestas de Error

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

| Código | Significado |
|:---|:---|
| `400` | Datos de entrada inválidos |
| `401` | No autenticado |
| `403` | Sin permisos suficientes |
| `404` | Recurso no encontrado |
| `409` | Conflicto (registro duplicado) |

---

## Auth

Módulo de autenticación con JWT, verificación de email y CAPTCHA.

### `POST /auth/register` 🌐

Registra un nuevo usuario y envía email de verificación.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123",
  "name": "Juan Pérez",
  "captchaToken": "token_de_turnstile"
}
```

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Registro exitoso. Se ha enviado un correo de verificación para activar tu cuenta.",
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "USER"
  }
}
```

---

### `POST /auth/login` 🌐

Autentica al usuario y establece cookie JWT.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123",
  "captchaToken": "token_de_turnstile"
}
```

**Respuesta (200):**

Establece cookie `access_token` (HttpOnly) y retorna:
```json
{
  "user": {
    "id": "uuid-del-usuario",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "role": "USER"
  }
}
```

---

### `POST /auth/logout` 🌐

Cierra sesión eliminando la cookie.

**Respuesta (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### `GET /auth/verify?token=TOKEN` 🌐

Verifica la cuenta del usuario usando el token enviado por email.

**Query Params:** `token` — Token de verificación

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Cuenta verificada correctamente. Ya puedes iniciar sesión."
}
```

---

## Users

Gestión del perfil del usuario autenticado.

### `GET /users/me` 🔒

Obtiene el perfil del usuario autenticado.

**Respuesta (200):**
```json
{
  "id": "uuid",
  "email": "usuario@ejemplo.com",
  "name": "Juan Pérez",
  "phone": "+56912345678",
  "address": "Av. Providencia 1234",
  "city": "Santiago",
  "role": "USER",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-06-01T08:00:00.000Z"
}
```

---

### `PATCH /users/me` 🔒

Actualiza datos del perfil.

**Body:**
```json
{
  "name": "Juan Pérez Actualizado",
  "phone": "+56987654321",
  "address": "Nueva Dirección 5678",
  "city": "Valparaíso"
}
```

---

### `GET /users/me/orders` 🔒

Obtiene el historial de pedidos del usuario.

**Respuesta (200):**
```json
[
  {
    "id": "uuid-orden",
    "buyOrder": "ORD-1717200000000",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "totalAmount": "25990.00",
    "status": "PAID",
    "createdAt": "2025-06-01T10:00:00.000Z",
    "items": [
      {
        "id": "uuid-item",
        "productName": "Black Lotus",
        "quantity": 1,
        "unitPrice": "25990.00"
      }
    ],
    "payment": {
      "status": "AUTHORIZED",
      "authCode": "123456",
      "cardLast4": "6623"
    }
  }
]
```

---

## Products

CRUD completo de productos, categorías, marcas, inventario y filtros.

### `GET /products` 🌐

Lista productos con filtros y paginación.

**Query Params:**

| Param | Tipo | Default | Descripción |
|:---|:---|:---|:---|
| `page` | number | 1 | Página actual |
| `limit` | number | 50 | Productos por página |
| `category` | string | — | Filtrar por nombre de categoría |
| `expansion` | string | — | Filtrar por nombre de expansión |
| `attribute` | string | — | Filtrar por atributo (color, ej: "W", "U", "Incolora") |
| `search` | string | — | Búsqueda por nombre (case-insensitive) |

**Respuesta (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "externalId": "scryfall-id",
      "name": "Lightning Bolt",
      "description": "Deal 3 damage to any target.",
      "imageUrl": "https://cards.scryfall.io/...",
      "category": { "id": "uuid", "name": "Singles Magic The Gathering" },
      "brand": null,
      "cardDetail": {
        "expansion": "Alpha",
        "rarity": "common",
        "collectorNum": "161",
        "game": "Magic",
        "attributes": ["R"]
      },
      "items": [
        {
          "id": "uuid",
          "price": "1500.00",
          "stock": 3,
          "condition": { "id": "uuid", "name": "near_mint" },
          "language": { "id": "uuid", "name": "English", "code": "en" },
          "finish": { "id": "uuid", "name": "Normal", "game": "Magic" }
        }
      ]
    }
  ],
  "meta": {
    "total": 1250,
    "page": 1,
    "limit": 50,
    "totalPages": 25
  }
}
```

---

### `GET /products/:id` 🌐

Obtiene un producto por ID con todas sus relaciones.

---

### `POST /products` 🛡️

Crea un nuevo producto.

**Body:**
```json
{
  "name": "Producto Manual",
  "categoryId": "uuid-categoria",
  "brandId": "uuid-marca",
  "price": 9990,
  "stock": 10
}
```

---

### `PATCH /products/:id` 🛡️

Actualiza un producto existente.

---

### `DELETE /products/:id` 🛡️

Elimina un producto (solo productos no-TCG). Elimina también inventario, wishlist y card detail asociados.

---

### `POST /products/bulk-upload` 🛡️

Carga masiva de productos vía CSV (solo para categoría Magic).

**Body:**
```json
{
  "categoryId": "uuid-categoria-magic",
  "items": [
    {
      "name": "Lightning Bolt",
      "scryfallId": "scryfall-uuid",
      "expansion": "Alpha",
      "rarity": "common",
      "collectorNum": "161",
      "condition": "near_mint",
      "language": "en",
      "finish": "Normal",
      "price": 1500,
      "quantity": 3
    }
  ]
}
```

**Respuesta (201):**
```json
{
  "added": 5,
  "updated": 12,
  "errors": [
    { "index": 3, "error": "No se pudo encontrar ni crear la carta 'XXX'" }
  ]
}
```

---

### `POST /products/bulk-update-stock` 🛡️

Actualización masiva de stock por ID de producto.

**Body:**
```json
{
  "items": [
    { "id": "uuid-producto", "stock": 5 }
  ]
}
```

---

### `POST /products/:productId/inventory` 🛡️

Agrega una nueva variante de inventario a un producto.

**Body:**
```json
{
  "languageId": "uuid-idioma",
  "conditionId": "uuid-condicion",
  "finishId": "uuid-finish",
  "price": 2500,
  "stock": 1
}
```

---

### `PATCH /products/inventory/:id` 🛡️

Actualiza precio y/o stock de un ítem de inventario.

**Body:**
```json
{
  "price": 3000,
  "stock": 5
}
```

---

### `DELETE /products/inventory/:id` 🛡️

Elimina una variante de inventario.

---

### Metadata Endpoints

| Endpoint | Método | Auth | Descripción |
|:---|:---|:---|:---|
| `/products/meta/categories` | GET | 🌐 | Lista categorías con conteo de productos |
| `/products/meta/categories/admin` | GET | 🌐 | Lista categorías para el panel admin |
| `/products/meta/categories` | POST | 🛡️ | Crear categoría |
| `/products/meta/categories/:id` | PATCH | 🛡️ | Actualizar categoría |
| `/products/meta/categories/:id` | DELETE | 🛡️ | Eliminar categoría (sin productos) |
| `/products/meta/brands` | GET | 🌐 | Lista marcas con conteo |
| `/products/meta/brands` | POST | 🛡️ | Crear marca |
| `/products/meta/brands/:id` | PATCH | 🛡️ | Actualizar marca |
| `/products/meta/brands/:id` | DELETE | 🛡️ | Eliminar marca (sin productos) |
| `/products/meta/expansions?category=X` | GET | 🌐 | Lista expansiones con conteo |
| `/products/meta/attributes?category=X&expansion=Y` | GET | 🌐 | Lista atributos (colores) con conteo |
| `/products/meta/languages` | GET | 🌐 | Lista idiomas disponibles |
| `/products/meta/conditions` | GET | 🌐 | Lista condiciones disponibles |
| `/products/meta/finishes?game=X` | GET | 🌐 | Lista acabados por juego |

---

## Payments

Módulo de pagos con Transbank Webpay Plus. Usa patrón CQRS.

### `POST /payments/init` 🔒 (OptionalJwt)

Crea una orden e inicia transacción con Webpay. Funciona para usuarios autenticados e invitados.

**Body:**
```json
{
  "email": "comprador@ejemplo.com",
  "name": "María García",
  "phone": "+56912345678",
  "address": "Av. Los Leones 567",
  "city": "Santiago",
  "notes": "Dejar en portería",
  "shippingProviderId": "uuid-proveedor",
  "currency": "USD",
  "exchangeRate": 950,
  "items": [
    {
      "productId": "uuid-producto",
      "inventoryItemId": "uuid-inventory",
      "productName": "Lightning Bolt (NM, EN, Normal)",
      "quantity": 2,
      "unitPrice": 1.58
    }
  ]
}
```

**Respuesta (201):**
```json
{
  "token": "webpay-token-xxx",
  "url": "https://webpay3gint.transbank.cl/webpayserver/initTransaction",
  "orderId": "uuid-orden",
  "buyOrder": "ORD-1717200000000"
}
```

> El frontend debe redirigir al usuario a `url` + `?token_ws=` + `token`.

---

### `GET /payments/commit?token_ws=TOKEN` 🌐

Callback de Webpay tras el pago. Confirma la transacción y redirige al frontend.

**Redirecciones posibles:**
- `{FRONTEND_URL}/checkout/result?status=success&orderId=UUID` — Pago aprobado
- `{FRONTEND_URL}/checkout/result?status=failed&orderId=UUID` — Pago rechazado
- `{FRONTEND_URL}/checkout/result?status=cancelled` — Usuario canceló en Webpay
- `{FRONTEND_URL}/checkout/result?status=error` — Error del sistema

---

### `GET /payments/order/:orderId` 🌐

Estado de una orden específica (para la página de resultado).

**Respuesta (200):**
```json
{
  "id": "uuid-orden",
  "buyOrder": "ORD-1717200000000",
  "name": "María García",
  "email": "comprador@ejemplo.com",
  "totalAmount": "5990.00",
  "status": "PAID",
  "shippingCost": "3990.00",
  "items": [...],
  "payment": {
    "status": "AUTHORIZED",
    "authCode": "123456",
    "cardLast4": "6623",
    "paymentType": "VD",
    "installments": 0,
    "transactionDate": "2025-06-01T10:30:00.000Z"
  }
}
```

---

### `GET /payments/orders?page=1&limit=20` 🛡️

Lista paginada de todas las órdenes (panel admin).

---

### `GET /payments/stats` 🛡️

Estadísticas de ventas para el dashboard administrativo.

**Respuesta (200):**
```json
{
  "orders": {
    "total": 150,
    "paid": 120,
    "failed": 15,
    "pending": 15
  },
  "revenue": {
    "total": 2500000,
    "thisMonth": 450000,
    "prevMonth": 380000,
    "monthGrowth": 18.4
  },
  "topProducts": [
    {
      "productId": "uuid",
      "productName": "Lightning Bolt",
      "totalUnits": 45,
      "timesOrdered": 30
    }
  ],
  "recentOrders": [
    {
      "id": "uuid",
      "buyOrder": "ORD-xxx",
      "name": "Cliente",
      "totalAmount": "25990.00",
      "createdAt": "2025-06-01T10:00:00.000Z"
    }
  ]
}
```

---

## Sync

Motor de sincronización de catálogos TCG. Solo accesible para administradores.

### `GET /sync/magic-sets` 🛡️

Obtiene la lista de sets de Magic desde MTGJSON.

### `GET /sync/pokemon-sets` 🛡️

Obtiene la lista de sets de Pokémon desde PokemonTCG.io.

### `GET /sync/riftbound-sets` 🛡️

Obtiene la lista de sets de Riftbound desde Riftcodex.

### `POST /sync/set` 🛡️

Inicia la importación de un set completo. Ejecuta en segundo plano.

**Body:**
```json
{
  "game": "Singles Magic The Gathering",
  "setId": "fdn"
}
```

**Respuesta (200):**
```json
{
  "message": "Importación de 'fdn' iniciada.",
  "active": true
}
```

### `GET /sync/status/:game` 🛡️

Consulta el progreso de importación/actualización de precios.

**Respuesta (200):**
```json
{
  "import": { "current": 150, "total": 280, "active": true },
  "price": { "current": 0, "total": 0, "active": false }
}
```

---

## Price Updater

Actualización de precios de mercado por expansión.

### `POST /price-updater/sync-set` 🛡️

Actualiza precios de Magic (fuente: MTGJSON).

**Body:**
```json
{ "expansion": "Foundations" }
```

### `POST /price-updater/sync-pokemon` 🛡️

Actualiza precios de Pokémon (fuente: PokemonTCG.io API).

**Body:**
```json
{ "expansion": "Scarlet & Violet" }
```

### `POST /price-updater/sync-riftbound` 🛡️

Actualiza precios de Riftbound (fuente: JustTCG API).

**Body:**
```json
{ "expansion": "Core Set" }
```

### `GET /price-updater/status/:game` 🛡️

Progreso de la actualización de precios.

**Respuesta (200):**
```json
{ "current": 50, "total": 200, "active": true }
```

---

## Shipping

Gestión de proveedores de envío.

### `GET /shipping/providers` 🌐

Lista proveedores de envío **activos** con sus tarifas.

**Respuesta (200):**
```json
[
  { "id": "uuid", "name": "CHILEXPRESS", "price": "4990.00", "isActive": true },
  { "id": "uuid", "name": "STARKEN", "price": "3990.00", "isActive": true }
]
```

### `GET /shipping/providers/all` 🛡️

Lista **todos** los proveedores (incluidos inactivos).

### `PATCH /shipping/providers/:id` 🛡️

Actualiza precio y/o estado activo de un proveedor.

**Body:**
```json
{ "price": 5990, "isActive": false }
```

---

## Currencies

Gestión de divisas y tasas de cambio.

### `GET /currencies` 🌐

Lista todas las divisas configuradas.

**Respuesta (200):**
```json
[
  { "id": "uuid", "code": "CLP", "name": "Peso Chileno", "symbol": "$", "exchangeRate": "1.00", "isDefault": true },
  { "id": "uuid", "code": "USD", "name": "Dólar", "symbol": "US$", "exchangeRate": "950.00", "isDefault": false }
]
```

### `GET /currencies/default` 🌐

Obtiene la divisa por defecto.

### `POST /currencies` 🛡️

Crea una nueva divisa.

**Body:**
```json
{
  "code": "EUR",
  "name": "Euro",
  "symbol": "€",
  "exchangeRate": 1030,
  "isDefault": false
}
```

### `PATCH /currencies/:id` 🛡️

Actualiza una divisa.

### `DELETE /currencies/:id` 🛡️

Elimina una divisa.

---

## Wishlist

Lista de deseos del usuario autenticado.

### `GET /wishlist` 🔒

Obtiene la wishlist del usuario.

### `POST /wishlist/:productId` 🔒

Agrega un producto a la wishlist.

### `DELETE /wishlist/:productId` 🔒

Elimina un producto de la wishlist.

### `GET /wishlist/count` 🛡️

Obtiene el conteo total de items en wishlists (estadística admin).

---

## Upload

Gestión de imágenes en Cloudinary.

### `POST /upload/image?folder=categories` 🛡️

Sube una imagen a Cloudinary.

**Content-Type:** `multipart/form-data`

**Form Data:** `file` — Archivo de imagen

**Query Params:** `folder` — Carpeta destino en Cloudinary (default: `general`)

**Respuesta (201):**
```json
{ "url": "https://res.cloudinary.com/xxx/image/upload/v123/tienda/categories/imagen.jpg" }
```

### `DELETE /upload/image` 🛡️

Elimina una imagen de Cloudinary.

**Body:**
```json
{ "url": "https://res.cloudinary.com/xxx/image/upload/v123/tienda/categories/imagen.jpg" }
```

---

## Settings

Configuración global del sistema (key-value store).

### `GET /settings` 🌐

Obtiene todas las configuraciones globales.

**Respuesta (200):**
```json
{
  "mtg_sync_destination": "singles magic the gathering",
  "pokemon_sync_destination": "singles pokemon",
  "riftbound_sync_destination": "singles riftbound"
}
```

### `POST /settings` 🛡️

Actualiza configuraciones globales.

**Body:**
```json
{
  "mtg_sync_destination": "singles magic the gathering",
  "pokemon_sync_destination": "singles pokemon"
}
```
