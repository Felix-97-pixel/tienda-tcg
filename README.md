<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Transbank-00B2A9?style=for-the-badge&logoColor=white" alt="Transbank" />
</p>

# 🃏 TCG E-commerce Platform — TapTrade

Plataforma full-stack de e-commerce especializada en **Trading Card Games** (Magic: The Gathering, Pokémon TCG, Riftbound). Diseñada para tiendas que necesitan gestionar inventario de cartas coleccionables con sincronización automática de catálogos, actualización de precios de mercado y pagos integrados con **Transbank Webpay** para el mercado chileno.

---

## ✨ Características Principales

| Área | Funcionalidad |
|:---|:---|
| 🔄 **Sincronización Multi-TCG** | Importación automática de sets completos desde Scryfall (MTG), PokemonTCG.io y Riftcodex. Motor con patrón Strategy extensible a nuevos juegos. |
| 💰 **Actualización de Precios** | Obtención de precios de mercado desde MTGJSON, PokemonTCG.io API y JustTCG, con progreso en tiempo real. |
| 🛒 **E-commerce Completo** | Carrito, checkout multi-paso, checkout como invitado o usuario registrado, wishlist, historial de pedidos. |
| 💳 **Pagos Transbank Webpay** | Integración nativa con Webpay Plus. Soporte para modo integración (testing) y producción. |
| 📦 **Gestión de Inventario** | Variantes por condición (Mint, Near Mint...), idioma (ES, EN...) y acabado (Normal, Foil, Holo...). Carga masiva vía CSV. |
| 🛡️ **Panel Administrativo** | Dashboard con estadísticas de ventas, gestión de categorías/marcas, órdenes, sincronización, configuración global. |
| 🌐 **Internacionalización** | Soporte para Chile (es-CL), Argentina (es-AR) y Perú (es-PE) con `next-intl`. |
| 🔐 **Autenticación Segura** | JWT con cookies HttpOnly, verificación de email, CAPTCHA (Cloudflare Turnstile), roles (USER/ADMIN). |
| 🖼️ **Gestión de Imágenes** | Upload y optimización automática vía Cloudinary. |
| 📧 **Emails Transaccionales** | Verificación de cuenta y notificaciones con templates HTML profesionales (Nodemailer + SMTP). |
| 💱 **Multi-moneda** | Sistema de divisas configurable con tasas de cambio dinámicas. |
| 🚚 **Proveedores de Envío** | Gestión de múltiples proveedores de envío con tarifas configurables. |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│              Next.js 16 (App Router) + Redux Toolkit            │
│              Tailwind CSS · next-intl · next-auth               │
│                     Desplegado en Vercel                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (HTTPS)
┌────────────────────────────▼────────────────────────────────────┐
│                         BACKEND                                 │
│                 NestJS 11 + Prisma ORM (CQRS)                   │
│    Auth · Products · Payments · Sync · Mail · Upload · ...      │
│                    Desplegado en Render                          │
└───────┬──────────┬──────────┬──────────┬───────────┬────────────┘
        │          │          │          │           │
   ┌────▼───┐ ┌───▼────┐ ┌──▼───┐ ┌───▼────┐ ┌───▼──────┐
   │  Neon  │ │Cloudina│ │Trans │ │Scryfall│ │ PokemonTC│
   │ (PgSQL)│ │   ry   │ │ bank │ │MTGJSON │ │  G.io    │
   └────────┘ └────────┘ └──────┘ └────────┘ └──────────┘
```

> 📖 Para una descripción detallada de la arquitectura, patrones de diseño y flujos de datos, consulta [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología | Propósito |
|:---|:---|
| [Next.js 16](https://nextjs.org/) | Framework React con App Router y SSR |
| [Tailwind CSS](https://tailwindcss.com/) | Estilos utilitarios |
| [Redux Toolkit](https://redux-toolkit.js.org/) | Estado global (carrito, auth, wishlist, moneda) |
| [next-auth](https://next-auth.js.org/) | Autenticación del lado cliente |
| [next-intl](https://next-intl-docs.vercel.app/) | Internacionalización (3 locales) |
| [Sanity](https://www.sanity.io/) | CMS headless para blog |
| [Swiper](https://swiperjs.com/) | Carruseles y sliders |

### Backend
| Tecnología | Propósito |
|:---|:---|
| [NestJS 11](https://nestjs.com/) | Framework backend con inyección de dependencias |
| [Prisma 7](https://www.prisma.io/) | ORM con migraciones y type-safety |
| [PostgreSQL](https://www.postgresql.org/) | Base de datos relacional (Neon serverless) |
| [@nestjs/cqrs](https://docs.nestjs.com/recipes/cqrs) | Patrón Command/Query en módulo de pagos |
| [Passport + JWT](http://www.passportjs.org/) | Autenticación con tokens |
| [Swagger](https://swagger.io/) | Documentación automática de API (`/api/docs`) |
| [Puppeteer](https://pptr.dev/) | Web scraping para actualización de precios |
| [Nodemailer](https://nodemailer.com/) | Envío de emails transaccionales |

### Servicios de Terceros
| Servicio | Propósito |
|:---|:---|
| [Vercel](https://vercel.com/) | Hosting del frontend |
| [Render](https://render.com/) | Hosting del backend |
| [Neon](https://neon.tech/) | PostgreSQL serverless |
| [Cloudinary](https://cloudinary.com/) | CDN de imágenes |
| [Transbank](https://www.transbankdevelopers.cl/) | Pasarela de pagos (Webpay Plus) |
| [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) | CAPTCHA anti-bots |
| [Resend](https://resend.com/) | Servicio SMTP para emails |

---

## 🚀 Configuración Local

### Requisitos Previos

- **Node.js** v18+
- **npm** v9+
- **Docker** (opcional, para base de datos local)
- Cuentas en Cloudinary, Neon y Transbank (para llaves de API)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Felix-97-pixel/tienda-tcg.git
cd tienda-tcg
```

### 2. Backend

```bash
cd tienda-backend

# Copiar variables de entorno y configurar
cp .env.example .env
# Edita .env con tus credenciales (ver tabla abajo)

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# (Opcional) Poblar datos iniciales
npx prisma db seed

# Iniciar servidor de desarrollo
npm run start:dev
```

El backend estará disponible en `http://localhost:3001/api/v1`
La documentación Swagger estará en `http://localhost:3001/api/docs`

### 3. Frontend

```bash
cd tienda-front

# Copiar variables de entorno
cp .env.example .env.local
# Edita .env.local con la URL del backend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

### 4. Docker (Alternativa)

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Esto levanta ambos servicios:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

---

## 🔑 Variables de Entorno

### Backend (`tienda-backend/.env`)

| Variable | Descripción | Ejemplo |
|:---|:---|:---|
| `DATABASE_URL` | URL de conexión PostgreSQL (Neon) | `postgresql://user:pass@host/db?sslmode=verify-full` |
| `JWT_SECRET` | Clave secreta para firma de tokens JWT | `tu_clave_secreta_de_64_caracteres` |
| `TURNSTILE_SECRET_KEY` | Secret key de Cloudflare Turnstile | `1x0000000000000000000000000000000AA` |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud en Cloudinary | `mi_cloud` |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | `123456789012345` |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | `abcDefGhiJklMno` |
| `WEBPAY_ENV` | Entorno Transbank: `integration` o `production` | `integration` |
| `WEBPAY_COMMERCE_CODE` | Código de comercio (solo en producción) | `597055555532` |
| `WEBPAY_API_KEY` | API Key de Transbank (solo en producción) | `tu_api_key` |
| `FRONTEND_URL` | URL base del frontend | `http://localhost:3000` |
| `BACKEND_URL` | URL base del backend con prefijo API | `http://localhost:3001/api/v1` |
| `JUSTTCG_API_KEY` | API Key para sincronización Riftbound | `tcg_xxx` |
| `SMTP_HOST` | Host del servidor SMTP | `smtp.resend.com` |
| `SMTP_PORT` | Puerto SMTP (465 para SSL, 587 para TLS) | `465` |
| `SMTP_USER` | Usuario SMTP | `resend` |
| `SMTP_PASS` | Contraseña SMTP | `re_xxx` |
| `SMTP_FROM` | Dirección de remitente de emails | `"Mi Tienda" <no-reply@mitienda.cl>` |

### Frontend (`tienda-front/.env.local`)

| Variable | Descripción | Ejemplo |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | URL base de la API del backend | `http://localhost:3001/api/v1` |

---

## 📦 Estructura del Proyecto

```
tienda-tcg/
├── tienda-backend/                 # API NestJS
│   ├── prisma/                     # Schema, migraciones y seeds
│   │   ├── schema.prisma           # 14 modelos + 3 enums
│   │   ├── migrations/             # 5 migraciones
│   │   └── seed.ts                 # Datos iniciales
│   ├── src/
│   │   ├── auth/                   # JWT, Passport, Guards, CAPTCHA
│   │   ├── users/                  # Perfil, pedidos del usuario
│   │   ├── products/               # CRUD, bulk upload, inventario, filtros
│   │   ├── payments/               # Transbank Webpay (CQRS)
│   │   │   ├── commands/           # InitTransaction, CommitTransaction
│   │   │   ├── queries/            # OrderStatus, ListOrders, SalesStats
│   │   │   └── providers/          # WebpayProvider
│   │   ├── sync/                   # Motor de sincronización multi-TCG
│   │   │   └── providers/          # BaseTcgProvider → Magic, Pokemon, Riftbound
│   │   ├── price-updater/          # Actualización de precios
│   │   ├── mail/                   # Emails transaccionales (Nodemailer)
│   │   ├── upload/                 # Cloudinary integration
│   │   ├── shipping/               # Proveedores de envío
│   │   ├── currencies/             # Gestión de divisas
│   │   ├── wishlist/               # Lista de deseos
│   │   ├── settings/               # Configuración global
│   │   └── common/                 # Filtros de excepción (Prisma)
│   ├── Dockerfile
│   └── package.json
│
├── tienda-front/                   # Aplicación Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── (site)/             # Rutas públicas
│   │   │   │   └── (pages)/        # shop, cart, checkout, signin, wishlist...
│   │   │   └── admin/              # Panel administrativo
│   │   ├── components/
│   │   │   ├── Home/               # Hero, BestSeller, Categories, Countdown...
│   │   │   ├── Shop/               # Grid/List views, filtros
│   │   │   ├── Checkout/           # Billing, Shipping, Payment, Result
│   │   │   ├── Admin/              # Dashboard, CRUD, Sync, Orders
│   │   │   ├── Auth/               # SignIn, SignUp
│   │   │   └── layout/             # Header, Footer
│   │   ├── redux/                  # 7 slices (auth, cart, currency, wishlist...)
│   │   ├── hooks/                  # Custom hooks (useAdminProducts, useTcgSync...)
│   │   ├── i18n/                   # Configuración de internacionalización
│   │   └── types/                  # TypeScript interfaces
│   ├── messages/                   # Traducciones (es-CL, es-AR, es-PE, admin)
│   ├── middleware.ts               # Next.js middleware
│   ├── Dockerfile
│   └── package.json
│
├── docs/                           # Documentación técnica
│   ├── ARCHITECTURE.md             # Arquitectura y patrones de diseño
│   ├── API.md                      # Referencia completa de la API REST
│   └── DEPLOYMENT.md               # Guía de despliegue
│
├── docker-compose.yml              # Orquestación de contenedores
└── README.md                       # Este archivo
```

---

## 📖 Documentación

| Documento | Descripción |
|:---|:---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura del sistema, patrones de diseño, modelo de datos y flujos |
| [API.md](./docs/API.md) | Referencia completa de todos los endpoints REST con ejemplos |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Guía paso a paso para despliegue en producción |
| [Swagger UI](http://localhost:3001/api/docs) | Documentación interactiva auto-generada (requiere backend corriendo) |

---

## 📊 Métricas del Proyecto

| Métrica | Valor |
|:---|:---|
| Líneas de código (Backend) | ~26,000 |
| Líneas de código (Frontend) | ~18,000 |
| Archivos TypeScript | 280+ |
| Modelos de base de datos | 14 |
| Endpoints API | 35+ |
| Componentes React | 24+ |
| Rutas del frontend | 15+ |

---

## 📄 Licencia

Este proyecto es **privado y propietario**. Su uso, distribución y modificación están restringidos bajo los términos acordados con el propietario.

© 2024-2026 **TapTrade**. Todos los derechos reservados.

---

<p align="center">
  Desarrollado con ❤️ por el equipo de <strong>TapTrade</strong>
</p>
