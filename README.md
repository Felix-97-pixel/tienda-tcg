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

# 🃏 TapTrade — TCG B2B SaaS & Marketplace Multi-tenant

Plataforma SaaS y Marketplace B2B/B2C especializada en **Trading Card Games** (Magic: The Gathering, Pokémon TCG, Riftbound, etc). 
TapTrade centraliza el inventario de múltiples tiendas (Tenants) en un solo lugar. Las tiendas pagan una suscripción mensual para usar el software como su motor de inventario y punto de venta, permitiendo a los jugadores buscar singles en todo el país con un "carrito unificado".

---

## ✨ Características Principales

| Área | Funcionalidad |
|:---|:---|
| 🏢 **Arquitectura Multi-tenant** | Sistema SaaS donde múltiples "Dealers" y "Stores" gestionan su propio inventario en una plataforma central (Marketplace). |
| 💳 **Suscripciones B2B** | Planes escalonados (Dealer, Store, Mega Store, Enterprise) que limitan la cantidad máxima de publicaciones (SKUs) y definen la comisión por venta. |
| 🧩 **Módulos Premium (Addons)** | Funcionalidades de pago adicional (Ej: Estadísticas Detalladas, Buylist Automatizada, Radar de Demanda). |
| 🔄 **Sincronización Multi-TCG** | Importación automática de catálogos maestros desde Scryfall (MTG), PokemonTCG.io y Riftcodex. |
| 🛒 **Carrito Unificado** | Los jugadores pueden armar un carrito con singles de múltiples tiendas distintas en un solo flujo de checkout. |
| 📦 **Gestión de Inventario Pormenorizada** | Las tiendas categorizan por condición (NM, LP...), idioma (ES, EN...) y acabado (Normal, Foil...). Soporta carga masiva vía CSV controlada por los límites del plan. |
| 🛡️ **Paneles Administrativos** | Un panel "SuperAdmin" para los dueños de TapTrade, y paneles "Admin" exclusivos para cada tienda registrada. |
| 🌐 **Internacionalización** | Soporte para Chile (es-CL), Argentina (es-AR) y Perú (es-PE). |

---

## 🏗️ Arquitectura SaaS

```
┌─────────────────────────────────────────────────────────────────┐
│                     MARKETPLACE (FRONTEND)                      │
│     Next.js 16 (App Router) + Redux Toolkit · Tailwind CSS      │
│     Catálogo Unificado · Carrito Multi-Tienda · Landing SaaS    │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────────┐
│                        MOTOR SAAS (BACKEND)                     │
│                 NestJS 11 + Prisma ORM (PostgreSQL)             │
│   SuperAdmin Auth · Store Tenants · Subscriptions · Billing     │
└───────┬──────────┬──────────┬──────────┬───────────┬────────────┘
        │          │          │          │           │
   ┌────▼───┐ ┌───▼────┐ ┌──▼───┐ ┌───▼────┐ ┌───▼──────┐
   │Database│ │Cloudina│ │ Pay  │ │Scryfall│ │ PokemonTC│
   │ (Neon) │ │   ry   │ │ments │ │MTGJSON │ │  G.io    │
   └────────┘ └────────┘ └──────┘ └────────┘ └──────────┘
```

> 📖 Para una descripción detallada de la arquitectura, patrones de diseño y flujos de datos, consulta [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** (App Router)
- **Tailwind CSS**
- **Redux Toolkit** (Estado global)
- **next-auth** (Autenticación)

### Backend
- **NestJS 11**
- **Prisma 7** (ORM)
- **PostgreSQL** (Neon Serverless)
- **@nestjs/cqrs** (Command/Query en operaciones de pago)

### Infraestructura y Servicios
- Vercel (Frontend) & Render (Backend)
- Cloudinary (Imágenes)
- Transbank (Pagos Webpay)
- Cloudflare Turnstile (CAPTCHA)
- Resend (SMTP)

---

## 💸 Modelo de Negocio y Suscripciones (Tenants)

Las tiendas que se unen a TapTrade operan bajo planes de suscripción B2B que dictan su capacidad operativa.

1. **Planes Base (Ejemplos)**
   - **Dealer (1.5 UF/mes):** Hasta 3,000 SKUs y 6.5% de comisión.
   - **Store (3.5 UF/mes):** Hasta 15,000 SKUs y 5.5% de comisión.
   - **Mega Store (7 UF/mes):** Hasta 60,000 SKUs y 4% de comisión.
   - **Enterprise (15 UF/mes):** SKUs ilimitados y 3% de comisión.

2. **Add-ons Premium**
   - Módulo de Estadísticas Detalladas.
   - Buylist Automatizada.
   - Radar de Demanda (Wishlists de clientes).

### 🚧 Próximamente: Flujo de Pagos a Tiendas (Payouts)
Actualmente, el mecanismo de dispersión de fondos está en diseño. Próximamente se documentará cómo la plataforma recauda el total (ej. a través de Transbank u otras pasarelas) y distribuye (payouts) las ganancias a cada tienda, reteniendo automáticamente la comisión por venta.

---

## 🚀 Configuración Local

### Requisitos Previos
- **Node.js** v18+
- **Docker** (opcional, para base de datos local)

### 1. Backend
```bash
cd tienda-backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed # Pobla Features y Planes Base
npm run start:dev
```
API: `http://localhost:3001/api/v1` | Swagger: `http://localhost:3001/api/docs`

### 2. Frontend
```bash
cd tienda-front
cp .env.example .env.local
npm install
npm run dev
```
Cliente: `http://localhost:3000`

---

## 📖 Documentación

| Documento | Descripción |
|:---|:---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura SaaS, modelo multi-tenant, entidades y flujos |
| [API.md](./docs/API.md) | Referencia de la API REST (Rutas globales y protegidas por tenant) |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Guía de despliegue |

---

## 📄 Licencia

Este proyecto es **privado y propietario**. Su uso, distribución y modificación están restringidos bajo los términos acordados con el propietario.

© 2024-2026 **TapTrade**. Todos los derechos reservados.
