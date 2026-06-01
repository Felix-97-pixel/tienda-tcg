# 🚀 Guía de Despliegue — TCG E-commerce Platform

Guía paso a paso para desplegar la plataforma en producción usando Vercel (frontend), Render (backend) y Neon (base de datos).

---

## Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Base de Datos — Neon](#1-base-de-datos--neon)
3. [Backend — Render](#2-backend--render)
4. [Frontend — Vercel](#3-frontend--vercel)
5. [Servicios de Terceros](#4-servicios-de-terceros)
6. [Dominio y DNS](#5-dominio-y-dns)
7. [Docker Compose (Local)](#6-docker-compose-local)
8. [Checklist Pre-Producción](#7-checklist-pre-producción)
9. [Monitoreo y Mantenimiento](#8-monitoreo-y-mantenimiento)

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- [ ] Cuenta en [Neon](https://neon.tech) (base de datos)
- [ ] Cuenta en [Render](https://render.com) (backend)
- [ ] Cuenta en [Vercel](https://vercel.com) (frontend)
- [ ] Cuenta en [Cloudinary](https://cloudinary.com) (imágenes)
- [ ] Cuenta en [Transbank](https://www.transbankdevelopers.cl/) (pagos)
- [ ] Cuenta en [Cloudflare](https://dash.cloudflare.com) (Turnstile CAPTCHA)
- [ ] Cuenta en un proveedor SMTP ([Resend](https://resend.com), Gmail, SendGrid, etc.)
- [ ] Repositorio Git con el código fuente
- [ ] Dominio propio (opcional pero recomendado)

---

## 1. Base de Datos — Neon

### Crear proyecto

1. Accede a [console.neon.tech](https://console.neon.tech)
2. Crea un nuevo proyecto:
   - **Nombre:** `taptrade-prod` (o el nombre que prefieras)
   - **Región:** Selecciona la más cercana a tus usuarios (ej: `us-east-1`)
   - **PostgreSQL version:** 16+
3. Copia la **Connection String** que se muestra:
   ```
   postgresql://user:password@host/dbname?sslmode=require
   ```

### Configurar para Prisma

Neon usa connection pooling con PgBouncer. La URL debe incluir los parámetros correctos:

```
# Para operaciones normales (con PgBouncer — puerto 6543)
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/db?sslmode=verify-full&pgbouncer=true"
```

### Ejecutar migraciones

Desde tu máquina local, con la `DATABASE_URL` apuntando a Neon:

```bash
cd tienda-backend
npx prisma migrate deploy
npx prisma db seed  # Opcional: datos iniciales
```

---

## 2. Backend — Render

### Crear Web Service

1. Accede a [dashboard.render.com](https://dashboard.render.com)
2. Click en **New → Web Service**
3. Conecta tu repositorio Git
4. Configuración:

| Campo | Valor |
|:---|:---|
| **Name** | `taptrade-api` |
| **Region** | Misma región que Neon |
| **Branch** | `main` |
| **Root Directory** | `tienda-backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | Starter ($7/mes) o superior |

### Variables de Entorno

Configura las siguientes variables en Render → Environment:

```env
DATABASE_URL=postgresql://...@neon.tech/...?sslmode=verify-full&pgbouncer=true
JWT_SECRET=<genera una clave de 64+ caracteres>
TURNSTILE_SECRET_KEY=<tu_secret_key_de_cloudflare>
CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>
WEBPAY_ENV=production
WEBPAY_COMMERCE_CODE=<codigo_comercio_transbank>
WEBPAY_API_KEY=<api_key_transbank>
FRONTEND_URL=https://tudominio.cl
BACKEND_URL=https://taptrade-api.onrender.com/api/v1
JUSTTCG_API_KEY=<tu_api_key>
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<tu_api_key_smtp>
SMTP_FROM="Tu Tienda" <no-reply@tudominio.cl>
NODE_ENV=production
PORT=3001
```

> **⚠️ Importante:** Genera un JWT_SECRET seguro con:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Verificar despliegue

Una vez desplegado, verifica accediendo a:
- `https://taptrade-api.onrender.com/api/v1` → Debería responder `"Hello World!"`
- `https://taptrade-api.onrender.com/api/docs` → Swagger UI

---

## 3. Frontend — Vercel

### Importar proyecto

1. Accede a [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio Git
3. Configuración:

| Campo | Valor |
|:---|:---|
| **Framework Preset** | Next.js |
| **Root Directory** | `tienda-front` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Node.js Version** | 18.x |

### Variables de Entorno

```env
NEXT_PUBLIC_API_URL=https://taptrade-api.onrender.com/api/v1
```

### Configuración adicional

En `next.config.js`, asegúrate de que los dominios de imágenes estén permitidos:
- `res.cloudinary.com` (imágenes de productos subidas)
- `cards.scryfall.io` (imágenes de cartas Magic)
- Otros dominios de imágenes de cartas

### Verificar despliegue

Accede a la URL proporcionada por Vercel y verifica que:
- La página principal carga correctamente
- Los productos se muestran (conexión con el backend)
- El carrito funciona
- El login/registro funciona

---

## 4. Servicios de Terceros

### Cloudinary

1. Accede a [console.cloudinary.com](https://console.cloudinary.com)
2. En el Dashboard, copia:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Crea las carpetas necesarias: `tienda/categories`, `tienda/brands`, `tienda/products`, `tienda/general`

### Transbank Webpay Plus

#### Modo Integración (Testing)
No necesitas credenciales reales. El sistema usa automáticamente las credenciales de prueba de Transbank:
```env
WEBPAY_ENV=integration
```

Tarjeta de prueba:
- **Número:** `4051 8856 0044 6623`
- **CVV:** `123`
- **Vencimiento:** Cualquier fecha futura

#### Modo Producción
1. Solicita credenciales en [www.transbankdevelopers.cl](https://www.transbankdevelopers.cl/)
2. Completa el proceso de certificación de Transbank
3. Una vez aprobado, configura:
```env
WEBPAY_ENV=production
WEBPAY_COMMERCE_CODE=<tu_codigo_comercio>
WEBPAY_API_KEY=<tu_api_key>
```

> **⚠️ La certificación de Transbank puede tomar 2-4 semanas.** Planifica con anticipación.

### Cloudflare Turnstile

1. Accede a [Cloudflare Dashboard → Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Crea un nuevo widget:
   - **Tipo:** Managed
   - **Dominios:** Agrega tu dominio (ej: `tudominio.cl`)
3. Copia la **Secret Key** para el backend
4. Copia la **Site Key** para el frontend

Para testing, usa las keys de prueba:
```
Site Key: 1x00000000000000000000AA
Secret Key: 1x0000000000000000000000000000000AA
```

### SMTP (Resend)

1. Crea cuenta en [resend.com](https://resend.com)
2. Verifica tu dominio
3. Genera una API Key
4. Configura:
```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxx
SMTP_FROM="Tu Tienda" <no-reply@tudominio.cl>
```

---

## 5. Dominio y DNS

### Configurar dominio personalizado

#### Frontend (Vercel)
1. En Vercel → Settings → Domains
2. Agrega `tudominio.cl` y `www.tudominio.cl`
3. Configura los registros DNS:

| Tipo | Nombre | Valor |
|:---|:---|:---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

#### Backend (Render)
1. En Render → Settings → Custom Domains
2. Agrega `api.tudominio.cl`
3. Configura el registro DNS:

| Tipo | Nombre | Valor |
|:---|:---|:---|
| `CNAME` | `api` | `taptrade-api.onrender.com` |

### Actualizar URLs

Después de configurar el dominio, actualiza:

**Backend (.env):**
```env
FRONTEND_URL=https://tudominio.cl
BACKEND_URL=https://api.tudominio.cl/api/v1
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.tudominio.cl/api/v1
```

**Backend (main.ts — CORS origins):**
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'https://tudominio.cl',
  'https://www.tudominio.cl',
];
```

---

## 6. Docker Compose (Local)

Para desarrollo local con Docker:

```bash
# Desde la raíz del proyecto
docker-compose up --build
```

Servicios:
- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:3001`

> **Nota:** Docker Compose no incluye PostgreSQL. Debes usar Neon o agregar un servicio PostgreSQL al `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: tienda
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 7. Checklist Pre-Producción

### Seguridad
- [ ] `JWT_SECRET` es único y tiene 64+ caracteres
- [ ] `.env` está en `.gitignore` y NO está en el repositorio
- [ ] CORS configurado solo para dominios de producción
- [ ] `WEBPAY_ENV=production` con credenciales reales
- [ ] Cloudflare Turnstile configurado con dominio real
- [ ] Cookies configuradas como `Secure` y `SameSite: none`

### Base de Datos
- [ ] Migraciones ejecutadas en Neon producción
- [ ] Datos de seed creados (condiciones, idiomas, categorías, finishes)
- [ ] Backup automático habilitado en Neon

### Funcionalidad
- [ ] Registro de usuario funciona (email de verificación se envía)
- [ ] Login funciona
- [ ] Productos se listan correctamente
- [ ] Carrito y checkout completo funcionan
- [ ] Pago con Webpay funciona (test con tarjeta de prueba primero)
- [ ] Panel admin accesible
- [ ] Sincronización de sets funciona
- [ ] Upload de imágenes funciona

### Performance
- [ ] Imágenes servidas desde Cloudinary CDN
- [ ] Next.js build sin errores
- [ ] API responde en < 500ms para consultas comunes

---

## 8. Monitoreo y Mantenimiento

### Logs
- **Render:** Dashboard → Logs (streaming en tiempo real)
- **Vercel:** Dashboard → Functions → Logs
- **Neon:** Dashboard → Monitoring (queries lentas, conexiones)

### Tareas periódicas
| Tarea | Frecuencia | Descripción |
|:---|:---|:---|
| Actualización de precios TCG | Semanal | Ejecutar desde el panel admin por expansión |
| Rotación de JWT Secret | Cada 6 meses | Generar nueva clave y redesplegar |
| Backup de BD | Diario (automático) | Verificar que Neon mantiene snapshots |
| Revisión de scraping | Mensual | Verificar que Puppeteer sigue funcionando |
| Actualización de dependencias | Mensual | `npm audit` y actualizar paquetes críticos |
| Monitoreo de costos | Mensual | Revisar usage en Render, Vercel, Neon, Cloudinary |

### Escalamiento

| Componente | Acción | Cuándo |
|:---|:---|:---|
| **Backend (Render)** | Upgrade de plan | > 100 req/min sostenidas |
| **BD (Neon)** | Upgrade de compute units | Queries > 1s promedio |
| **Cloudinary** | Upgrade de plan | > 25GB de storage |
| **Frontend (Vercel)** | Generalmente no necesita | El edge caching maneja la carga |
