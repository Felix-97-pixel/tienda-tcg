# 🏗️ Arquitectura del Sistema — TapTrade (SaaS Multi-tenant)

Este documento describe la arquitectura técnica, los patrones de diseño empleados, el modelo de datos y los flujos de operación de la plataforma SaaS y Marketplace B2B/B2C.

---

## Índice

1. [Vista General](#vista-general)
2. [Arquitectura de Módulos (Backend)](#arquitectura-de-módulos-backend)
3. [Patrones de Diseño](#patrones-de-diseño)
4. [Modelo de Datos](#modelo-de-datos)
5. [Flujos de Operación](#flujos-de-operación)
6. [Infraestructura](#infraestructura)
7. [Seguridad](#seguridad)
8. [Decisiones de Diseño](#decisiones-de-diseño)

---

## Vista General

El sistema se compone de una arquitectura SaaS Multi-tenant (Software as a Service) con un frontend unificado que actúa tanto como Marketplace para compradores, como Panel de Control para tiendas y administradores.

```mermaid
graph TB
    subgraph "Cliente (Browser)"
        FE["Next.js 16 (App Router)"]
        subgraph "Módulos UI"
            MKT["Marketplace Público"]
            SA["SuperAdmin Panel"]
            TEN["Store Tenant Panel"]
        end
        FE --> MKT
        FE --> SA
        FE --> TEN
    end

    subgraph "Servicios Externos"
        TBK["Transbank<br/>Webpay Plus"]
        SCR["Scryfall API"]
        PKM["PokemonTCG.io"]
        RFT["Riftcodex API"]
        CLD["Cloudinary<br/>CDN"]
        SMTP["SMTP<br/>Resend"]
    end

    subgraph "Backend SaaS (NestJS 11)"
        API["REST API<br/>/api/v1"]
        AUTH["Auth Module"]
        TENANT["Tenant/Store Module"]
        PROD["Products/Inventory Module"]
        PAY["Payments Module<br/>(CQRS)"]
        SYNC["Sync Module<br/>(Strategy)"]
    end

    subgraph "Base de Datos"
        DB[("PostgreSQL (Neon)<br/>Esquema Multi-tenant")]
    end

    MKT -->|"Búsqueda Global"| API
    TEN -->|"Gestión de Inventario"| API
    SA -->|"Gestión de Plataforma"| API
    API --> AUTH
    API --> TENANT
    API --> PROD
    API --> PAY
    API --> SYNC
    PAY -->|"Procesa Pagos"| TBK
    SYNC -->|"Catálogos Maestros"| SCR
    SYNC -->|"Catálogos Maestros"| PKM
    SYNC -->|"Catálogos Maestros"| RFT
    AUTH --> DB
    TENANT --> DB
    PROD --> DB
    PAY --> DB
    SYNC --> DB
```

---

## Arquitectura de Módulos (Backend)

El backend sigue la **arquitectura modular de NestJS**, donde cada dominio de negocio está encapsulado en su propio módulo con controller, service y DTOs.

```mermaid
graph LR
    subgraph "AppModule"
        direction TB
        ConfigModule["ConfigModule<br/>(Global)"]
        PrismaModule["PrismaModule<br/>(Singleton)"]
        ScheduleModule["ScheduleModule"]

        AuthModule["AuthModule"]
        UsersModule["UsersModule"]
        ProductsModule["ProductsModule"]
        PaymentsModule["PaymentsModule"]
        SyncModule["SyncModule"]
        PriceUpdaterModule["PriceUpdaterModule"]
        MailModule["MailModule"]
        UploadModule["UploadModule"]
        ShippingModule["ShippingModule"]
        CurrenciesModule["CurrenciesModule"]
        WishlistModule["WishlistModule"]
        SettingsModule["SettingsModule"]
    end

    ConfigModule -.->|"Env Vars"| AuthModule
    ConfigModule -.->|"Env Vars"| PaymentsModule
    ConfigModule -.->|"Env Vars"| MailModule
    PrismaModule -.->|"DB Access"| ProductsModule
    PrismaModule -.->|"DB Access"| PaymentsModule
    PrismaModule -.->|"DB Access"| SyncModule
    AuthModule -->|"Guards"| ProductsModule
    AuthModule -->|"Guards"| PaymentsModule
    AuthModule -->|"Guards"| SyncModule
```

### Descripción de cada módulo

| Módulo | Responsabilidad | Dependencias Clave |
|:---|:---|:---|
| **ConfigModule** | Carga de variables de entorno (`.env`). Configurado como global. | — |
| **PrismaModule** | Singleton del cliente Prisma. Acceso a la base de datos para todos los módulos. | PostgreSQL (Neon) |
| **AuthModule** | Registro, login, logout, verificación de email. JWT + Passport. | UsersModule, MailModule, Cloudflare Turnstile |
| **UsersModule** | Perfil del usuario, actualización de datos, historial de pedidos. | PrismaModule |
| **ProductsModule** | CRUD de productos, categorías, marcas. Bulk upload CSV. Gestión de inventario (variantes). Filtros y paginación. | PrismaModule, UploadModule, SyncModule (MagicService) |
| **PaymentsModule** | Creación de órdenes, integración Webpay, confirmación de pagos, estadísticas de ventas. Usa patrón **CQRS**. | PrismaModule, WebpayProvider, MailModule |
| **SyncModule** | Motor de sincronización multi-TCG. Importación de sets desde APIs externas. Usa patrón **Strategy**. | PrismaModule, APIs externas |
| **PriceUpdaterModule** | Controlador para disparar actualizaciones de precios por expansión. Delega al SyncModule. | SyncModule |
| **MailModule** | Envío de emails transaccionales (verificación de cuenta). Templates HTML embebidos. | Nodemailer, SMTP (Resend) |
| **UploadModule** | Upload y eliminación de imágenes en Cloudinary. | Cloudinary SDK |
| **ShippingModule** | CRUD de proveedores de envío y sus tarifas. | PrismaModule |
| **CurrenciesModule** | CRUD de divisas y tasas de cambio. | PrismaModule |
| **WishlistModule** | Lista de deseos por usuario (agregar/eliminar productos). | PrismaModule |
| **SettingsModule** | Configuración global key-value (ej: destinos de sincronización por juego). | PrismaModule |
| **StoresModule** | Gestión de Empresas (Holdings), asignación de sucursales físicas (Store), Casas Matrices, subdominios y balances. | PrismaModule |
| **PosModule** | Punto de Venta mostrador, apertura/cierre de turnos de caja (CashShift), arqueos de caja y ventas presenciales. | PrismaModule, ProductsModule |
| **BuylistModule** | Motor de compra de cartas a jugadores (Trade-In), cotizaciones automáticas y acreditación en Store Credit. | PrismaModule |

---

## Patrones de Diseño

### 1. CQRS (Command Query Responsibility Segregation)

Implementado en el módulo **Payments** usando `@nestjs/cqrs`. Separa las operaciones de escritura (Commands) de las de lectura (Queries).

```mermaid
graph TB
    subgraph "PaymentsModule (CQRS)"
        Controller["PaymentsController"]

        subgraph "Commands (Escritura)"
            IC["InitTransactionCommand"]
            CC["CommitTransactionCommand"]
            IH["InitTransactionHandler"]
            CH["CommitTransactionHandler"]
        end

        subgraph "Queries (Lectura)"
            GOS["GetOrderStatusQuery"]
            LO["ListOrdersQuery"]
            GSS["GetSalesStatsQuery"]
            GOSH["GetOrderStatusHandler"]
            LOH["ListOrdersHandler"]
            GSSH["GetSalesStatsHandler"]
        end

        WP["WebpayProvider"]
    end

    Controller -->|"CommandBus"| IC
    Controller -->|"CommandBus"| CC
    Controller -->|"QueryBus"| GOS
    Controller -->|"QueryBus"| LO
    Controller -->|"QueryBus"| GSS
    IC --> IH
    CC --> CH
    GOS --> GOSH
    LO --> LOH
    GSS --> GSSH
    IH --> WP
    CH --> WP
```

**Por qué CQRS aquí:**
- Las operaciones de pago (init/commit) tienen efectos secundarios complejos (crear orden, llamar a Webpay, actualizar estado de pago).
- Las consultas de estadísticas son pesadas y podrían optimizarse independientemente.
- Facilita la trazabilidad y testing de cada operación.

### 2. Strategy Pattern — Motor de Sincronización TCG

El módulo **Sync** usa herencia con una clase abstracta `TcgProvider` que define el contrato para cada juego. Cada juego concreto implementa la lógica específica de su API.

```mermaid
classDiagram
    class TcgProvider {
        <<abstract>>
        #gameName: string
        #prisma: PrismaService
        +onProgress: Function
        +syncSet(setId, categoryName)*
        +fetchExternalSet(setId)* any[]
        +mapToProduct(card, categoryId)* any
        +updateGamePrices(expansion)* Result
        +getExpectedVariants(card) string[]
        #cleanEmptyInventory(expansion)
    }

    class MagicProvider {
        +fetchExternalSet(setId)
        +mapToProduct(card, catId)
        +updateGamePrices(expansion)
        +getExpectedVariants(card)
    }

    class PokemonProvider {
        +fetchExternalSet(setId)
        +mapToProduct(card, catId)
        +updateGamePrices(expansion)
        +getExpectedVariants(card)
    }

    class RiftboundProvider {
        +fetchExternalSet(setId)
        +mapToProduct(card, catId)
        +updateGamePrices(expansion)
    }

    TcgProvider <|-- MagicProvider
    TcgProvider <|-- PokemonProvider
    TcgProvider <|-- RiftboundProvider
```

Cada provider tiene un **Service** asociado que encapsula las llamadas HTTP a las APIs externas:

| Provider | Service | API Externa | Datos Obtenidos |
|:---|:---|:---|:---|
| `MagicProvider` | `MagicService` | Scryfall, MTGJSON | Cards, sets, precios |
| `PokemonProvider` | `PokemonService` | PokemonTCG.io | Cards, sets, precios |
| `RiftboundProvider` | `RiftboundService` | Riftcodex, JustTCG | Cards, sets, precios |

**Cómo agregar un nuevo juego:**
1. Crear `nuevo-juego.service.ts` con las llamadas HTTP a la API del juego.
2. Crear `nuevo-juego.provider.ts` extendiendo `TcgProvider`.
3. Registrar el provider en `SyncService.constructor`.
4. Agregar la categoría correspondiente en la base de datos.

### 3. Guard Pattern — Autorización por Roles

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
```

Cadena de guards:
1. **JwtAuthGuard**: Verifica que el request tenga un JWT válido (cookie `access_token`).
2. **RolesGuard**: Verifica que el usuario tenga el rol requerido (`ADMIN` o `USER`).
3. **OptionalJwtAuthGuard**: Variante que permite acceso sin autenticación pero extrae el usuario si existe (usado en checkout para invitados).

### 4. Exception Filter — Manejo Global de Errores Prisma

`PrismaClientExceptionFilter` captura errores de Prisma y los traduce a respuestas HTTP apropiadas:

| Código Prisma | HTTP Status | Significado |
|:---|:---|:---|
| `P2002` | 409 Conflict | Violación de constraint único |
| `P2025` | 404 Not Found | Registro no encontrado |
| Otros | 500 Internal Server Error | Delegado al filtro base de NestJS |

---

## Modelo de Datos

### Diagrama Entidad-Relación

```mermaid
erDiagram
    Company ||--o{ Store : "agrupa (sucursales)"
    Company ||--o{ User : "representante legal / dueno"
    Store ||--o{ InventoryItem : "almacena stock fisico"
    Store ||--o{ CashShift : "opera turnos POS"
    Store ||--o{ VendorOrder : "recibe pedidos marketplace"
    Store }o--o{ SubscriptionPlan : "contrata plan SaaS"

    Category ||--o{ Product : "clasifica"
    Brand ||--o{ Product : "fabrica"
    Product ||--o| CardDetail : "metadatos TCG (opcional)"
    Product ||--o{ InventoryItem : "variantes de stock"
    Product ||--o{ WishlistItem : "deseado por"

    Language ||--o{ InventoryItem : "idioma"
    Condition ||--o{ InventoryItem : "estado fisico"
    Finish ||--o{ InventoryItem : "acabado"

    User ||--o{ WishlistItem : "guarda"
    User ||--o{ Order : "compra en marketplace"
    User ||--o{ CashShift : "abre/cierra caja en tienda"
    User ||--o{ StoreCredit : "acumula saldo tienda"

    Order ||--o{ OrderItem : "contiene items"
    Order ||--o{ VendorOrder : "divide pedido por sucursal"
    Order ||--o| Payment : "procesado por"
    ShippingProvider ||--o{ Order : "despacha"
    CashShift ||--o{ CashShiftTransaction : "registra arqueo"

    Company {
        string id PK
        string name "Razon Social"
        string rut UK "RUT Empresa"
        string ownerId FK "Dueno General"
        decimal balance "Billetera Matriz Unificada"
        int extraBranchesCount "Sucursales extra pagadas"
    }

    Store {
        string id PK
        string companyId FK "Empresa Matriz"
        boolean isMainBranch "Casa Matriz del Plan Base"
        string ownerId FK "Usuario Propietario"
        string name "Nombre Sucursal / Local"
        string subdomain UK "Subdominio publico"
        string address "Direccion fisica local"
        boolean pickupEnabled "Retiro en tienda ($0)"
        string pickupSchedule "Horario de retiro"
        string originRegionId FK
        string originCommuneId FK
        decimal balance "Billetera operativa"
    }

    CashShift {
        string id PK
        string storeId FK "Sucursal fisica"
        string userId FK "Cajero responsable"
        CashShiftStatus status "OPEN | CLOSED"
        decimal initialCash "Caja inicial"
        decimal finalCash "Caja real contada"
        decimal expectedCash "Caja teorica sistema"
        datetime openedAt
        datetime closedAt
    }

    CashShiftTransaction {
        string id PK
        string cashShiftId FK
        decimal amount
        string paymentMethod "CASH, DEBIT, CREDIT, TRANSFER, MIXED"
        string type "INFLOW, OUTFLOW, SALE, REFUND"
    }

    SubscriptionPlan {
        string id PK
        string name UK "Starter, Store, Mega Store, Enterprise"
        decimal price "1.5, 3.5, 6.5, 11.5 UF"
        int maxSingles "1500, 6000, 18000, Ilimitado"
        int maxSealed "50, 150, 500, Ilimitado"
    }

    Category {
        string id PK
        string name UK
        string slug UK
        string imageUrl
        boolean isTcg
    }

    Brand {
        string id PK
        string name UK
        string imageUrl
    }

    Product {
        string id PK
        string externalId UK
        string name
        string description
        string imageUrl
        string categoryId FK
        string brandId FK
    }

    CardDetail {
        string id PK
        string expansion
        string rarity
        string collectorNum
        string game
        string[] attributes
        string productId FK_UK
    }

    InventoryItem {
        string id PK
        string productId FK
        string storeId FK
        string conditionId FK
        string languageId FK
        string finishId FK
        decimal price
        int stock
    }

    User {
        string id PK
        string email UK
        string password
        string name
        string phone
        string address
        string city
        Role role "USER, ADMIN, SUPERADMIN"
        boolean isVerified
    }

    Order {
        string id PK
        string buyOrder UK
        string userId FK
        decimal totalAmount
        OrderStatus status "PENDING, PAID, FAILED, CANCELLED"
        datetime createdAt
    }

    VendorOrder {
        string id PK
        string orderId FK
        string storeId FK
        decimal subtotal
        decimal shippingCost
        VendorOrderStatus status
    }
```

### Enumeraciones

| Enum | Valores | Descripción |
|:---|:---|:---|
| `Role` | `USER`, `ADMIN`, `SUPERADMIN` | Roles del sistema (Cliente, Administrador de Tienda/Empresa, Superadministrador HQ). |
| `CashShiftStatus` | `OPEN`, `CLOSED` | Estado del turno de caja en el Punto de Venta POS. |
| `OrderStatus` | `PENDING`, `PAID`, `FAILED`, `CANCELLED`, `REFUNDED` | Estado general de la orden en el Marketplace. |
| `PaymentStatus` | `PENDING`, `AUTHORIZED`, `FAILED`, `NULLIFIED` | Estado del pago en Webpay Plus. |
| `VendorOrderStatus` | `PENDING`, `PREPARING`, `SHIPPED`, `DELIVERED`, `CANCELLED` | Estado del despacho o retiro por cada sucursal individual. |

### Relaciones Clave de la Arquitectura Multi-Branch

1. **Company → Store (1:N):** Una empresa jurídica matriz agrupa a una o más sucursales físicas. Todas las sucursales comparten la personería jurídica y la cuenta bancaria de liquidaciones.
2. **Suscripción Base + Sucursales Adicionales:** Cada suscripción base (Starter 1.5 UF, Store 3.5 UF, Mega Store 6.5 UF, Enterprise 11.5 UF) cubre una **Casa Matriz** (`isMainBranch = true`). Cada sucursal física adicional paga un Add-on mensual de **+2.5 UF/mes**.
3. **Consolidación Financiera:** El `balance` acumulado por ventas en el marketplace se centraliza en `Company.balance` para pagos unificados (Payouts), mientras que los arqueos físicos diarios (`CashShift`) operan localmente en cada `Store`.
4. **Product → InventoryItem:** El inventario vive a nivel de sucursal física (`storeId`), permitiendo que el comprador elija retiro en local específico ($0) o despacho a domicilio cotizado desde la comuna de esa sucursal.

---

## Flujos de Operación

### 1. Flujo de Compra (Checkout → Webpay → Confirmación)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as Backend
    participant WP as Webpay
    participant DB as Base de Datos

    U->>FE: Completa formulario de checkout
    FE->>BE: POST /payments/init (items, datos de envío)
    BE->>DB: Crear Order + OrderItems
    BE->>DB: Obtener ShippingProvider (costo)
    BE->>DB: Obtener Currency (tasa de cambio)
    BE->>WP: webpay.transaction.create(buyOrder, amount, returnUrl)
    WP-->>BE: { token, url }
    BE->>DB: Crear Payment (token, PENDING)
    BE-->>FE: { token, url, orderId }
    FE->>WP: Redirect usuario a URL de Webpay
    U->>WP: Ingresa datos de tarjeta
    WP->>BE: GET /payments/commit?token_ws=TOKEN
    BE->>WP: webpay.transaction.commit(token)
    WP-->>BE: Resultado (aprobado/rechazado)
    BE->>DB: Actualizar Payment y Order status
    BE->>DB: Descontar stock de InventoryItems
    BE->>FE: Redirect a /checkout/result?status=success
    FE->>U: Muestra resultado del pago
```

### 2. Flujo de Sincronización TCG

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant FE as Frontend
    participant BE as SyncController
    participant SS as SyncService
    participant PR as TcgProvider
    participant API as API Externa
    participant DB as Base de Datos

    Admin->>FE: Selecciona juego y set
    FE->>BE: POST /sync/set { game, setId }
    BE->>SS: syncSet(game, setId)
    SS->>SS: resolveProviderKey(game)
    SS-->>FE: { message: "Importación iniciada", active: true }

    Note over SS,DB: Ejecución en segundo plano

    SS->>PR: provider.syncSet(setId, categoryName)
    PR->>API: fetchExternalSet(setId)
    API-->>PR: Lista de cartas
    loop Por cada carta
        PR->>PR: mapToProduct(card, categoryId)
        PR->>DB: prisma.product.upsert(...)
        PR->>SS: onProgress(game, current, total, 'import')
    end

    Note over FE: Polling de progreso
    FE->>BE: GET /sync/status/:game
    BE-->>FE: { import: { current, total, active } }
```

### 3. Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BE as AuthController
    participant AS as AuthService
    participant CF as Cloudflare Turnstile
    participant DB as Base de Datos
    participant SMTP as SMTP (Resend)

    Note over U,SMTP: Registro
    U->>FE: Completa formulario de registro
    FE->>BE: POST /auth/register { email, password, name, captchaToken }
    BE->>AS: register(dto)
    AS->>CF: verifyCaptcha(token)
    CF-->>AS: { success: true }
    AS->>DB: Verificar email no existe
    AS->>DB: Crear usuario (isVerified: false, verificationToken)
    AS->>SMTP: sendVerificationEmail(email, name, token)
    AS-->>FE: { success: true, message: "Correo enviado" }

    U->>U: Recibe email, hace clic en enlace
    U->>FE: GET /verify-email?token=TOKEN
    FE->>BE: GET /auth/verify?token=TOKEN
    BE->>DB: Marcar usuario como verificado

    Note over U,SMTP: Login
    U->>FE: Ingresa email y password
    FE->>BE: POST /auth/login { email, password, captchaToken }
    BE->>AS: login(dto)
    AS->>CF: verifyCaptcha(token)
    AS->>DB: Buscar usuario, verificar password
    AS->>AS: Verificar isVerified === true
    AS->>AS: Generar JWT
    BE-->>FE: Set-Cookie: access_token (HttpOnly, Secure)
    BE-->>FE: { user: { id, email, name, role } }
```

---

## Infraestructura

### Arquitectura de Despliegue

```mermaid
graph TB
    subgraph "Internet"
        DNS["DNS<br/>(taptrade.cl)"]
    end

    subgraph "Vercel"
        FE["Next.js Frontend<br/>Edge Network"]
    end

    subgraph "Render"
        BE["NestJS Backend<br/>Web Service"]
    end

    subgraph "Neon"
        DB[("PostgreSQL<br/>Serverless")]
    end

    subgraph "Cloudinary"
        CDN["Imágenes<br/>CDN Global"]
    end

    DNS --> FE
    DNS --> BE
    FE -->|"REST API"| BE
    BE -->|"Prisma"| DB
    BE -->|"SDK"| CDN
    FE -->|"<img>"| CDN
```

### Entornos

| Entorno | Frontend | Backend | Base de Datos |
|:---|:---|:---|:---|
| **Desarrollo** | `localhost:3000` | `localhost:3001` | Neon (branch dev) o Docker local |
| **Producción** | Vercel (`taptrade.cl`) | Render | Neon (branch main) |

---

## Seguridad

### Autenticación
- **JWT** almacenado en cookies `HttpOnly` (inaccesible desde JavaScript del frontend).
- Cookie configurada como `Secure` en producción (solo HTTPS).
- `SameSite: none` en producción para permitir cross-origin.
- Token expira en **24 horas**.

### Autorización
- Sistema de roles: `USER`, `ADMIN` y `SUPERADMIN`.
- Guards encadenados: `JwtAuthGuard` → `RolesGuard`.
- `OptionalJwtAuthGuard` para rutas que aceptan usuarios autenticados y anónimos.

### Protección Anti-Bots
- **Cloudflare Turnstile** en registro y login.
- Validación server-side del token CAPTCHA.

### Validación de Datos
- `ValidationPipe` global con `whitelist: true` y `forbidNonWhitelisted: true`.
- DTOs con decoradores de `class-validator`.

### CORS
- Origins permitidos explícitamente (`localhost:3000`, `taptrade.cl`).
- Credenciales habilitadas.

---

## Decisiones de Diseño B2B SaaS

### ¿Por qué Arquitectura Multi-tenant en la misma Base de Datos?
Se optó por un esquema multi-tenant lógico (usando `storeId` en las tablas clave como `InventoryItem` y `Order`) en lugar de esquemas físicos separados. Esto permite que el Marketplace público (TapTrade) realice búsquedas globales (Global Search) cruzando el inventario de todas las tiendas de forma rápida y con índices eficientes en PostgreSQL.

### ¿Por qué cobrar por Límites de SKUs en lugar de "Por Carta"?
En los planes de suscripción, se limita la cantidad de *SKUs (InventoryItems únicos)* en lugar de limitar el número total absoluto de cartas físicas. Esto incentiva a las tiendas a subir grandes volúmenes de las mismas cartas comunes (dando profundidad al mercado) y desincentiva prácticas abusivas donde las tiendas borran cartas para hacer espacio, protegiendo así la integridad estadística de los catálogos y reduciendo la carga de base de datos.

### ¿Por qué CQRS solo en Payments?
El módulo de pagos es el más complejo y con más efectos secundarios (llamadas a Webpay, descuento de stock, split de pagos entre tiendas, notificaciones). CQRS permite aislar y testear cada operación. Los otros módulos usan el patrón service/controller estándar de NestJS porque su complejidad no justifica la sobrecarga de CQRS.

### Payouts a las Tiendas (Próximamente)
Actualmente, el sistema está diseñado para que TapTrade procese el pago íntegro centralizado (vía Webpay) del carrito unificado del jugador. En futuras iteraciones, el backend calculará el monto correspondiente a cada `VendorOrder`, deducirá la comisión correspondiente según el plan de la tienda, e ingresará un saldo pendiente en la Wallet de cada tienda (`Balance`). La liquidación de estos fondos a las cuentas bancarias de las tiendas requerirá procesos de facturación que están siendo evaluados.

### ¿Por qué Puppeteer para precios?
Algunos sitios de referencia de precios no ofrecen APIs públicas. Puppeteer permite scraping controlado. Sin embargo, este componente es **frágil** y requiere mantenimiento cuando los sitios cambian su estructura HTML.

### ¿Por qué next-intl sin prefijos de URL?
El locale se resuelve en el servidor (`src/i18n/request.ts`) sin prefijos en la URL. `/shop` funciona igual para todos los locales. Esto simplifica las URLs y el SEO, ya que el contenido es el mismo en las variantes regionales, cambiando principalmente símbolos de moneda o pequeños textos locales.
