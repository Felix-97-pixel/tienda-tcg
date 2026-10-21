# 🛡️ Guía Paso a Paso y Checklist de Producción (TapTrade)

Esta guía detalla con precisión **qué ocurre cuando haces `git push`**, qué configuraciones deben estar listas **antes de enviar código**, y cómo validar que la plataforma opere al 100% en producción sin caídas ni sorpresas.

---

## ⚡ 1. ¿Qué sucede exactamente cuando haces `git push`?

Dado que tu repositorio está conectado a plataformas de despliegue continuo (CI/CD):

```mermaid
flowchart LR
    A["git push a main"] --> B["Vercel (Frontend)"]
    A --> C["Render / VPS (Backend)"]
    B --> D["next build --webpack"]
    C --> E["prisma generate && nest build"]
    D --> F["Sitio Web en Vivo (taptrade.cl)"]
    E --> G["API en Vivo (/api/v1)"]
```

1. **Vercel** detecta el commit en la rama vinculada (`main`), ejecuta `npm run build` en `tienda-front` y reemplaza el frontend en vivo en menos de 2 minutos.
2. **Render** detecta el commit, ejecuta el comando de build (`npm install && npx prisma generate && npm run build`) y reinicia el servicio backend con `npm run start:prod`.

> [!WARNING]
> Como el despliegue es inmediato y automático al hacer `git push`, cualquier variable de entorno faltante o migración de base de datos no aplicada puede afectar a los usuarios en tiempo real. Por ello, sigue el orden a continuación.

---

## 📋 2. Paso 0: Variables de Entorno (Revisar ANTES del Push)

El error más común en despliegues automáticos es que el frontend intente consultar a `http://localhost:3001` en vez de la URL pública de producción.

### A. En el Panel de Vercel (`tienda-front`)
Ve a **Vercel Dashboard → Tu Proyecto → Settings → Environment Variables**:

| Variable | Valor en Producción | ¿Por qué es vital? |
|:---|:---|:---|
| `NEXT_PUBLIC_API_URL` | `https://api.taptrade.cl/api/v1` *(o URL de Render)* | **Crítico:** Si queda en `localhost`, los navegadores de los clientes no podrán cargar productos ni iniciar sesión. |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Tu Client ID de Google Cloud | Para el botón de inicio de sesión con Google. |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Public Key oficial de Mercado Pago (`APP_USR-...`) | Para el checkout transparente de tarjetas. |

---

### B. En el Panel de Render / Servidor Backend (`tienda-backend`)
Ve a **Render Dashboard → Web Service → Environment**:

| Variable | Valor Recomendado | Explicación |
|:---|:---|:---|
| `NODE_ENV` | `production` | **Vital:** Oculta Swagger (`/api/docs`), activa optimizaciones de NestJS y protege endpoints internos. |
| `DATABASE_URL` | String de conexión Neon con PgBouncer | `postgresql://user:pass@host-pooler.neon.tech/neondb?sslmode=verify-full&pgbouncer=true` |
| `JWT_SECRET` | Clave aleatoria de 64+ caracteres | Firma los tokens de acceso y protege las sesiones de usuarios y administradores. |
| `FRONTEND_URL` | `https://taptrade.cl` | Origen permitido para CORS y redirecciones de pago. |
| `BACKEND_URL` | `https://api.taptrade.cl/api/v1` | URL donde las pasarelas enviarán los Webhooks. |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de Producción (`APP_USR-...`) | Para procesar los cobros reales a los clientes. |
| `MERCADOPAGO_CLIENT_SECRET`| Client Secret de Mercado Pago | Para la firma HMAC del flujo OAuth de tiendas. |
| `WEBPAY_ENV` | `production` *(o `integration` para pruebas)* | Controla si Transbank opera con tarjetas reales. |
| `WEBPAY_COMMERCE_CODE` | Código de comercio entregado por Transbank | Código único de tu tienda física/web en Transbank. |
| `WEBPAY_API_KEY` | API Key entregada por Transbank | Llave privada de Webpay. |
| `CLOUDINARY_CLOUD_NAME` | Cloud Name de Cloudinary | Almacenamiento seguro de imágenes de cartas y tiendas. |
| `CLOUDINARY_API_KEY` | API Key de Cloudinary | Credencial de subida. |
| `CLOUDINARY_API_SECRET` | API Secret de Cloudinary | Credencial de subida. |
| `SMTP_HOST` / `SMTP_PASS` | Credenciales de Resend / SendGrid / Gmail | Envío de correos de bienvenida, compras y recuperación. |

---

## 🗄️ 3. Paso 1: Base de Datos y Migraciones con Neon

> [!IMPORTANT]
> **REGLA ESTRICTA DE BASE DE DATOS:**  
> Nunca ejecutes `npx prisma db push --accept-data-loss` ni `npx prisma migrate reset` en producción. Provocaría pérdida total de datos de clientes, productos y órdenes.

### ¿Cómo aplicar cambios en la base de datos de producción?
Antes de hacer `git push` a `main`, si agregaste modelos o columnas en `schema.prisma`:

1. Desde tu terminal local, apunta temporalmente la variable `DATABASE_URL` al PostgreSQL de Neon de producción (o ejecútalo en la consola de Render):
   ```bash
   cd tienda-backend
   npx prisma migrate deploy
   ```
   *`migrate deploy` aplica únicamente las migraciones pendientes sin borrar ni alterar datos existentes.*
2. Verifica en la consola de [Neon Console](https://console.neon.tech) que el proyecto tenga habilitado el auto-backup / Branching de seguridad.

---

## 💳 4. Paso 2: Configuración de Pasarelas de Pago

### Mercado Pago
1. En el [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com/developers/panel):
   - Ve a **Tus Aplicaciones → Webhooks**.
   - Configura la URL del webhook de producción:
     ```text
     https://api.taptrade.cl/api/v1/payments/webhook
     ```
   - Eventos a escuchar: `payment`, `merchant_order`.
   - En **Redirect URLs** (para vincular cuentas de vendedores vía OAuth):
     ```text
     https://api.taptrade.cl/api/v1/payments/mp-oauth/callback
     ```

### Transbank Webpay Plus
* Si estás en modo producción (`WEBPAY_ENV=production`), asegúrate de que el proceso de validación técnica de Transbank esté aprobado con tu código de comercio oficial.

---

## 🌐 5. Paso 3: Google OAuth y Dominios Permitidos

En la [Consola de Google Cloud](https://console.cloud.google.com/apis/credentials):
1. Edita tu **ID de cliente de OAuth 2.0**.
2. En **Orígenes autorizados de JavaScript**, añade:
   - `https://taptrade.cl`
   - `https://www.taptrade.cl`
3. En **URIs de redireccionamiento autorizados**:
   - `https://taptrade.cl`
   - `https://taptrade.cl/login`

---

## 🚀 6. Paso 4: El Momento del Despliegue (`git push`)

Una vez verificados los pasos anteriores:

1. **Haz el merge o push de tu rama auditada a la rama de producción (`main`):**
   ```bash
   git checkout main
   git merge auditoria-seguridad
   git push origin main
   ```
2. **Monitorea los registros de compilación:**
   - En **Vercel**: Confirma que el build diga `Ready` en color verde.
   - En **Render**: Confirma que los logs muestren:
     ```text
     Nest application successfully started
     Listening on port 3001
     ```

---

## 🔍 7. Paso 5: Prueba de Humo de 5 Minutos (Post-Push)

Apenas termine el despliegue, abre una ventana en modo incógnito y verifica estos 6 puntos:

- [ ] **1. Swagger Oculto:** Entra a `https://api.taptrade.cl/api/docs`. Debe devolver `404 Not Found`. *(Confirma que `NODE_ENV=production` está activo).*
- [ ] **2. Carga del Catálogo:** Entra a `https://taptrade.cl/shop`. Las cartas y productos deben cargar sin errores de red en la consola de inspección.
- [ ] **3. Aislamiento de Cuenta:** Entra a `https://taptrade.cl/my-account` sin haber iniciado sesión. Debe redirigirte de inmediato a `/login`.
- [ ] **4. Aislamiento de Administración:** Entra a `https://taptrade.cl/admin` sin sesión. Debe redirigirte a `/admin/login`.
- [ ] **5. Login y Cookies:** Inicia sesión con una cuenta de prueba. Verifica en DevTools $\rightarrow$ Application $\rightarrow$ Cookies que la cookie `taptrade_user_session` esté presente.
- [ ] **6. Carrito y Checkout:** Añade una carta al carrito y avanza hasta la pantalla de pago para verificar que la comunicación con Mercado Pago / Webpay responda con éxito.

---

## 🛟 8. Plan de Emergencia (Rollback Inmediato)

Si algo inesperado llegase a ocurrir en producción:

* **En Vercel:**  
  Ve a **Deployments** $\rightarrow$ busca el despliegue anterior que funcionaba $\rightarrow$ haz clic en los 3 puntos $\rightarrow$ **Instant Rollback**. Vercel restaurará la versión anterior en menos de 10 segundos.
* **En Render:**  
  Ve a **Deploys** $\rightarrow$ selecciona el commit anterior $\rightarrow$ **Rollback to this deploy**.
