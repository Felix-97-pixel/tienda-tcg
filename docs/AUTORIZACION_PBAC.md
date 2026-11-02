# 🛡️ Guía de Autorización PBAC y Tenancy Scoping — TapTrade

Este documento describe el funcionamiento técnico del sistema de **Control de Acceso Basado en Permisos (PBAC)** y el **Aislamiento Multi-Tenant (Tenancy Scoping)** implementado en la plataforma.

---

## 1. Fundamento: ¿Por qué PBAC en lugar de RBAC clásico?

En un SaaS B2B donde una empresa (Holding) puede tener múltiples sucursales físicas y distintos tipos de colaboradores (Dueños, Contadores, Encargados de Tienda y Cajeros de Mesón), evaluar roles en texto duro (`if rol === 'CASHIER'`) produce código frágil, difícil de mantener y propenso a brechas de seguridad.

### Principio de Diseño
- **El rol es solo una etiqueta.**
- **La autorización se evalúa por capacidades atómicas (Permisos).**
- Los controladores no preguntan *"¿Quién eres?"*, sino *"¿Posees la autorización para ejecutar esta acción?"*.

---

## 2. Doble Capa de Seguridad (Defensa en Profundidad)

Existe una distinción crítica entre la interfaz de usuario y la seguridad real del sistema:

| Capa | Componentes Responsables | Propósito | ¿Qué ocurre si falla? |
| :--- | :--- | :--- | :--- |
| **Capa 1: Frontend (UI/UX)** | `Sidebar.tsx`, `AdminGuard.tsx`, `usePermission()` | Ocultar botones, menús y rutas inaccesibles para brindar una experiencia limpia y sin ruido visual. | Si un usuario burla la UI (ej. usando la consola o Postman), **NO** puede realizar la acción porque el backend lo bloquea. |
| **Capa 2: Backend (Frontera API)** | `JwtAuthGuard`, `PermissionsGuard`, `@RequirePermissions()` | Validar criptográficamente el JWT, extraer los permisos y **rechazar con HTTP 403 Forbidden** cualquier petición no autorizada. | Es la barrera infranqueable. Protege la base de datos y la lógica financiera. |

> [!IMPORTANT]
> **Ocultar un menú o botón en el frontend NUNCA es seguridad.** La seguridad real reside exclusivamente en el `PermissionsGuard` del backend en NestJS.

---

## 3. Matriz de Permisos (`Permission`)

Ubicación: [`tienda-backend/src/auth/constants/permissions.enum.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/auth/constants/permissions.enum.ts)

```typescript
export enum Permission {
  // Billetera & Retiros (Holding)
  WALLET_READ = 'WALLET_READ',
  WALLET_WITHDRAW = 'WALLET_WITHDRAW',

  // Gestión de Personal & Accesos
  TEAM_LOCAL_MANAGE = 'TEAM_LOCAL_MANAGE',
  TEAM_CORPORATE_MANAGE = 'TEAM_CORPORATE_MANAGE',

  // Punto de Venta & Caja Local
  POS_ACCESS = 'POS_ACCESS',
  CASH_SHIFT_MANAGE = 'CASH_SHIFT_MANAGE',
  STORE_CREDIT_REDEEM = 'STORE_CREDIT_REDEEM',

  // Catálogo, Precios & Inventario
  CATALOG_READ = 'CATALOG_READ',
  LOCAL_STOCK_MANAGE = 'LOCAL_STOCK_MANAGE',
  GLOBAL_PRICE_SYNC = 'GLOBAL_PRICE_SYNC',

  // Pedidos & Despachos
  ORDERS_DISPATCH = 'ORDERS_DISPATCH',
  ORDERS_MANAGE_ALL = 'ORDERS_MANAGE_ALL',

  // Configuración de Tiendas & Holding
  LOCAL_STORE_SETTINGS = 'LOCAL_STORE_SETTINGS',
  HOLDING_SETTINGS = 'HOLDING_SETTINGS',
}
```

### Mapeo por Tipo de Sesión (`ROLE_PERMISSIONS`):
- **`SUPERADMIN`:** Posee todos los permisos de la plataforma de forma irrestricta.
- **`COMPANY_OWNER`:** Posee todos los permisos sobre su holding y todas sus sucursales.
- **`COMPANY_ADMIN`:** `WALLET_READ`, `WALLET_WITHDRAW`, `ORDERS_MANAGE_ALL`, `CATALOG_READ`, `POS_ACCESS`.
- **`BRANCH_MANAGER`:** Operación de POS, inventario local, precios, pedidos y gestión de cajeros de su local (`TEAM_LOCAL_MANAGE`). **Sin acceso a billetera holding ni permisos corporativos.**
- **`CASHIER`:** `POS_ACCESS`, `CASH_SHIFT_MANAGE`, `STORE_CREDIT_REDEEM`, `CATALOG_READ`, `ORDERS_DISPATCH`.

---

## 4. Guía para Desarrolladores: Cómo Crear un Nuevo Endpoint

Cuando se desarrolle un nuevo endpoint administrativo o protegido:

### Paso 1: Identificar o Crear el Permiso
Si la acción requiere un permiso existente (ej: `LOCAL_STOCK_MANAGE`), úsalo. Si es una funcionalidad nueva (ej: `DISCOUNTS_CREATE`), agrégalo a `permissions.enum.ts` y asígnalo en `ROLE_PERMISSIONS`.

### Paso 2: Decorar el Endpoint en el Controlador
Importar el guard y decorador:
```typescript
import { UseGuards, Post, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/constants/permissions.enum';

@Controller('ejemplo')
export class EjemploController {
  
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequirePermissions(Permission.LOCAL_STOCK_MANAGE)
  @Post('modificar-stock')
  async modificarStock(@Body() body: any) {
    // La ejecución llega aquí SOLO si el usuario tiene el permiso LOCAL_STOCK_MANAGE
    return this.ejemploService.modificar(body);
  }
}
```

### Paso 3: Aislamiento Multi-Tenant (Tenancy Scoping)
Si el endpoint opera sobre recursos de una sucursal física:
```typescript
const storeId = (req.user.sessionType === 'CASHIER' || req.user.sessionType === 'BRANCH_MANAGER')
  ? req.user.activeStoreId // Forzar sucursal asignada
  : (req.headers['x-store-id'] || req.user.activeStoreId); // Permitir alternar al dueño
```

---

## 5. Uso en el Frontend (React / Next.js)

En la interfaz de usuario, importar los hooks declarativos:
```tsx
import { usePermission, useHasAnyPermission } from "@/hooks/usePermission";

export default function MiComponente() {
  const canWithdraw = usePermission("WALLET_WITHDRAW");
  const canManageTeam = usePermission("TEAM_LOCAL_MANAGE");

  return (
    <div>
      {canWithdraw && (
        <button onClick={solicitarRetiro}>Solicitar Retiro de Fondos</button>
      )}
      {canManageTeam && (
        <button onClick={abrirModalPersonal}>Agregar Cajero</button>
      )}
    </div>
  );
}
```

