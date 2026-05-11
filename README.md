# 🃏 TCG E-commerce Platform

¡Bienvenido al repositorio oficial de nuestra plataforma de E-commerce especializada en Trading Card Games (TCG)! Este proyecto es una solución integral full-stack diseñada para la gestión, venta y sincronización automatizada de productos de juegos como Magic: The Gathering, Pokémon y Riftbound.

---

## 📝 Descripción del Proyecto

Esta plataforma permite a los administradores gestionar un inventario dinámico de cartas coleccionables, sincronizando datos en tiempo real (o bajo demanda) con fuentes externas para mantener precios y existencias actualizados. Ofrece una experiencia de usuario fluida con búsqueda avanzada, filtrado por rareza/edición y un proceso de pago seguro.

### ✨ Características Principales
- **Sincronización Automática:** Integración con APIs de TCG para importar sets completos y actualizar precios.
- **Gestión de Variantes:** Soporte para múltiples estados (Mint, Near Mint, etc.) e idiomas por cada carta.
- **Panel Administrativo:** Control total sobre productos, categorías, marcas y sincronización.
- **Pagos Seguros:** Integración nativa con Transbank (Webpay) para el mercado chileno.
- **Optimización de Imágenes:** Gestión eficiente de media a través de transformaciones automáticas.

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Estado Global:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Autenticación:** [Next-Auth](https://next-auth.js.org/)
- **Internacionalización:** [Next-intl](https://next-intl-docs.vercel.app/)

### Backend
- **Framework:** [NestJS](https://nestjs.com/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Base de Datos:** PostgreSQL
- **Automatización:** Puppeteer (para web scraping/sync)
- **Seguridad:** Passport.js + JWT

---

## ☁️ Servicios de Terceros

Para garantizar la escalabilidad y el rendimiento, el proyecto utiliza los siguientes servicios:

| Servicio | Propósito |
| :--- | :--- |
| **Vercel** | Hosting del Frontend y optimización de Edge Functions. |
| **Render** | Despliegue del Backend (API NestJS) y procesos en segundo plano. |
| **Neon** | Base de Datos PostgreSQL serverless de alto rendimiento. |
| **Cloudinary** | Almacenamiento y optimización de imágenes de productos y banners. |
| **Transbank** | Pasarela de pagos para transacciones con Webpay Plus. |
| **Sanity** | CMS para gestión de contenido estático y blogs (opcional/en integración). |

---

## 🚀 Configuración Local

### Requisitos Previos
- Node.js (v18+)
- Docker (opcional, para BD local)
- Cuentas en Cloudinary, Neon y Transbank (para llaves de API)

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Felix-97-pixel/tienda-tcg.git
   cd tienda-tcg
   ```

2. **Backend Setup:**
   ```bash
   cd tienda-backend
   cp .env.example .env # Configura tus variables de entorno
   npm install
   npx prisma generate
   npm run start:dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../tienda-front
   cp .env.example .env.local # Configura tus variables de entorno
   npm install
   npm run dev
   ```

## 🔑 Variables de Entorno

Para que el proyecto funcione correctamente, es necesario configurar los archivos `.env` en ambas carpetas.

### Backend (`tienda-backend/.env`)
- `DATABASE_URL`: Cadena de conexión de **Neon** (PostgreSQL).
- `JWT_SECRET`: Llave secreta para la generación de tokens.
- `CLOUDINARY_URL`: Configuración de Cloudinary (`cloud_name`, `api_key`, `api_secret`).
- `WEBPAY_ENV`: Entorno de Transbank (`integration` o `production`).
- `JUSTTCG_API_KEY`: API Key para la sincronización de sets de Riftbound.
- `FRONTEND_URL`: URL base del cliente (ej: `http://localhost:3000`).

### Frontend (`tienda-front/.env.local`)
- `NEXT_PUBLIC_API_URL`: URL base de la API del backend (ej: `http://localhost:3001/api/v1`).

---

## 🔄 Proceso de Sincronización

El sistema cuenta con un módulo de sincronización especializado que utiliza:
1. **APIs Externas:** Para obtener metadatos de MTG y Pokémon.
2. **Puppeteer:** Para realizar scraping controlado en sitios de referencia y obtener precios de mercado actualizados.
3. **Prisma Batching:** Procesamiento eficiente de grandes volúmenes de datos para evitar bloqueos en la base de datos.

---

## 📦 Estructura del Proyecto

```text
.
├── tienda-backend/    # Servidor NestJS, Prisma Models & Sync Logic
├── tienda-front/      # Aplicación Next.js, Redux & UI Components
└── docker-compose.yml # Configuración opcional de servicios locales
```

---

## 📄 Licencia

Este proyecto es privado y su uso está restringido.

---

Desarrollado con ❤️ por el equipo de **TapTrade**.
