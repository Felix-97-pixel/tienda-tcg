# Plan de Implementación: Autenticación con Google (Google Sign-In)
**Proyecto:** TapTrade TCG Marketplace  
**Autor:** Antigravity  
**Fecha:** Octubre 2026  
**Estado:** Propuesta de Arquitectura e Implementación  

---

## 1. Resumen Ejecutivo y Objetivos

Permitir que los usuarios de **TapTrade** puedan registrarse e iniciar sesión con **1 solo clic** utilizando sus cuentas de **Google**, reduciendo la fricción en el registro y garantizando correos electrónicos 100% reales y verificados.

### Ventajas Clave
1. **Verificación Garantizada:** Google valida el correo de origen (`email_verified: true`), activando la cuenta al instante (`isVerified: true`) sin depender de correos en bandeja de spam.
2. **Cero Fricción:** 1 clic con Google One Tap o el botón oficial. Disminuye radicalmente el abandono en el registro.
3. **Seguridad Robusta:** Criptografía asimétrica mediante ID Tokens firmados por Google y validados por el backend.

---

## 2. Costos y Gratuidad (100% Gratis)

> **Costo: $0 CLP / $0 USD (Totalmente Gratuito e Ilimitado)**

- **¿Tiene costo usar Google Sign-In?**
  **NO.** El servicio de autenticación básica de Google (OAuth 2.0 / OpenID Connect) es **100% gratuito e ilimitado** para aplicaciones web y móviles.
- **¿Google me va a cobrar cuando crezca la plataforma?**
  **NO.** A diferencia de plataformas intermediarias como Auth0 o Clerk (que cobran una vez superas los 5.000 o 10.000 usuarios activos), la API nativa de Google OAuth 2.0 directa **no tiene cobros por número de usuarios ni inicios de sesión**.
- **¿Pide tarjeta de crédito?**
  **NO.** Para crear un proyecto en Google Cloud y generar un *OAuth Client ID* básico, Google **no exige ingresar tarjeta de crédito ni facturación**.
- **¿Requiere auditorías de pago?**
  **NO.** Solo solicitamos los scopes no confidenciales (`email`, `profile`, `openid`), por lo que Google no requiere auditorías de seguridad externas (las auditorías de pago solo aplican a apps que leen correos privados de Gmail o archivos de Google Drive, lo cual TapTrade jamás solicitará).

---

## 3. Modificaciones en Base de Datos (Prisma)

En `tienda-backend/prisma/schema.prisma` (Modelo `User`):
```prisma
model User {
  id                 String                   @id @default(uuid())
  email              String                   @unique
  password           String?                  // Opcional para cuentas de Google
  googleId           String?                  @unique // ID único proporcionado por Google
  avatar             String?                  // Foto de perfil
  name               String?
  phone              String?
  address            String?
  city               String?
  lat                Float?
  lng                Float?
  regionCode         String?
  cityCode           String?
  role               Role                     @default(USER)
  isVerified         Boolean                  @default(false)
  verificationToken  String?
  createdAt          DateTime                 @default(now())
  updatedAt          DateTime                 @updatedAt

  // Relaciones existentes
  store              Store?
  wishlist           WishlistItem[]
  orders             Order[]
  storeCredits       StoreCredit[]
  creditTransactions StoreCreditTransaction[]
}
```

---

## 4. Guía Administrativa: Credenciales de Google Cloud

1. Entrar a [Google Cloud Console](https://console.cloud.google.com/).
2. Crear un proyecto llamado **TapTrade**.
3. En **OAuth Consent Screen**:
   - User Type: **External**.
   - Nombre: **TapTrade TCG Marketplace**.
   - Correo de soporte: Tu correo.
   - Enlace de privacidad: `https://taptrade.cl/politica-de-privacidad`.
   - Enlace de términos: `https://taptrade.cl/terminos-y-condiciones`.
4. En **Credenciales > Crear Credenciales > ID de cliente de OAuth**:
   - Tipo: **Aplicación Web**.
   - Orígenes autorizados de JavaScript:
     - `http://localhost:3000`
     - `https://taptrade.cl`
5. Guardar el `NEXT_PUBLIC_GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

---

## 5. Fases de Implementación


### Fase 1: Base de Datos y Backend NestJS
- Modificar `schema.prisma` (`googleId`, `avatar`, `password String?`).
- Instalar `google-auth-library` en `tienda-backend`.
- Crear DTO `GoogleAuthDto` en `auth.dto.ts`.
- Implementar `googleLogin` en `auth.service.ts` con auto-vinculación si el email ya existe.
- Crear endpoint `POST /auth/google` en `auth.controller.ts`.

### Fase 2: Frontend Next.js
- Instalar `@react-oauth/google` en `tienda-front`.
- Configurar `GoogleOAuthProvider`.
- Diseñar el botón oficial **"Continuar con Google"** con estilo Dark Vault.
- Integrar el botón y soporte Google One Tap en `/login` y `/signup`.

### Fase 3: Pruebas y Validación
- Probar registro de usuario nuevo vía Google.
- Probar vinculación de usuario existente con mismo email.
- Probar creación de contraseña alternativa vía `/recuperar-cuenta`.
