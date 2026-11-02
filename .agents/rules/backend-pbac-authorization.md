# Regla de Arquitectura: Autorización Basada en Permisos - PBAC (Backend & Frontend)

## Contexto y Fundamento
En TapTrade, el control de acceso en paneles de administración y operaciones NO se basa en condicionales manuales de roles dentro de los controladores (`if (req.user.sessionType === ...)` o `if (user.role === ...)`). 
Toda autorización de funcionalidades administrativas se rige por un esquema **PBAC (Permission-Based Access Control) Declarativo** apoyado en decoradores y guards de NestJS.

---

## 1. Reglas Estrictas para Nuevos Endpoints (Backend)

1. **PROHIBIDO EL USO DE CONDICIONALES MANUALES DE ROL EN CONTROLADORES:**
   - Queda estrictamente prohibido escribir `if (req.user.sessionType === 'CASHIER') throw new ForbiddenException(...)` dentro de los métodos de un controlador.
   - La autorización DEBE ejecutarse en la frontera del endpoint utilizando el guard:
     ```typescript
     @UseGuards(JwtAuthGuard, PermissionsGuard)
     @RequirePermissions(Permission.NOMBRE_DEL_PERMISO)
     ```

2. **DECLARACIÓN OBLIGATORIA EN EL CATÁLOGO DE PERMISOS:**
   - Antes de crear un nuevo permiso o capacidad administrativa, DEBE registrarse en el enum `Permission` localizado en:
     [`tienda-backend/src/auth/constants/permissions.enum.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/auth/constants/permissions.enum.ts)
   - Debe asignarse a los roles correspondientes dentro del mapa `ROLE_PERMISSIONS` en el mismo archivo.

3. **AISLAMIENTO MULTI-TENANT (ZERO TRUST):**
   - Si un endpoint opera a nivel de sucursal física (ej: POS, turnos de caja, inventario local), y el usuario conectado es de nivel tienda (`CASHIER` o `BRANCH_MANAGER`), el backend DEBE forzar obligatoriamente `req.user.activeStoreId` desde el JWT, ignorando cualquier ID que el cliente envíe en query params, headers o body.

4. **IMPORTACIÓN DE AUTHMODULE:**
   - Cualquier módulo de NestJS cuyos controladores usen `PermissionsGuard` debe importar `AuthModule` en su array `imports`.

---

## 2. Reglas para Frontend (UI y Vistas)

1. **USO DEL HOOK DECLARATIVO `usePermission`:**
   - En lugar de preguntar `if (user.sessionType === 'BRANCH_MANAGER')`, los componentes, botones y pestañas deben utilizar:
     ```tsx
     import { usePermission, useHasAnyPermission } from "@/hooks/usePermission";

     const canWithdraw = usePermission("WALLET_WITHDRAW");
     const canManageTeam = usePermission("TEAM_LOCAL_MANAGE");
     ```
2. **DOBLE CAPA DE SEGURIDAD:**
   - Ocultar un botón o enlace en la interfaz es únicamente ergonomía de usuario; la seguridad real reside en la protección del endpoint en el servidor. Nunca confiar únicamente en el frontend.

