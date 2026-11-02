# Directivas de Trabajo para el Proyecto (AGENTS.md)

## 1. Control de Versiones y Git (REGLA ESTRICTA)
- **PROHIBIDO EJECUTAR `git push`**: El asistente NUNCA debe ejecutar `git push` (ni a `origin main`, ni a ninguna otra rama remota).
- Los envíos a repositorios remotos y despliegues a producción son responsabilidad exclusiva del usuario.
- El asistente solo trabaja a nivel local: editar código, verificar compilación (`tsc`, `npm run build`), y ejecutar servidores de desarrollo.

## 2. Seguridad en Base de Datos (Prisma)
- Nunca ejecutar migraciones destructivas ni comandos que provoquen pérdida de datos (`db push --accept-data-loss`, `migrate reset`) en producción o staging sin confirmación previa del usuario.
- Consultar las directivas detalladas en `.agents/rules/prisma-safety.md`.

## 3. Estandarización y Centralización de Iconos (REGLA ESTRICTA)
- **PROHIBIDO EL USO DE EMOJIS**: Nunca usar emojis en interfaces, botones, modales o tablas.
- **ARCHIVO CENTRALIZADO OBLIGATORIO (`Icons.tsx`)**: Todo icono debe residir exclusivamente en `tienda-front/src/components/ui/Icons.tsx`.
- **PROHIBIDO INCRUSTAR SVGs EN LÍNEA**: Nunca declarar SVG locales o funciones de iconos duplicadas dentro de componentes de vista o modales.
- **CREACIÓN DE NUEVOS ICONOS**: Si un componente necesita un icono que no existe, debe agregarse primero a `Icons.tsx` con su interfaz tipada `IconProps` y luego importarse, dejándolo disponible para el resto de la aplicación.
- Consultar las directivas detalladas en `.agents/rules/ui-icons.md`.

## 4. Arquitectura de Base de Datos y Prevención de Duplicidad (REGLA ESTRICTA)
- **CONSULTA PREVIA OBLIGATORIA DEL DICCIONARIO DE DATOS**: Antes de proponer o crear nuevos campos o modelos en Prisma o DTOs, el asistente DEBE consultar [`docs/DICCIONARIO_DE_DATOS.md`](file:///c:/Users/felix/Desktop/e-commerce/docs/DICCIONARIO_DE_DATOS.md) y [`prisma/schema.prisma`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/prisma/schema.prisma).
- **PROHIBIDO DUPLICAR CAMPOS O ESTADOS**: Si un concepto o flag ya existe en la base de datos (ej: `Store.pickupEnabled`), es OBLIGATORIO utilizar ese campo existente y NO crear variables o registros duplicados en otras tablas.
- **ACTUALIZACIÓN OBLIGATORIA DE LA DOCUMENTACIÓN**: Todo nuevo campo legítimo añadido al esquema debe documentarse inmediatamente en el diccionario de datos.
- Consultar las directivas detalladas en `.agents/rules/database-anti-duplication.md`.

## 5. Autorización Backend Basada en Permisos - PBAC (REGLA ESTRICTA)
- **PROHIBIDO EL USO DE CONDICIONALES MANUALES DE ROL EN CONTROLADORES**: Nunca escribir `if (req.user.sessionType === ...)` o `if (user.role === ...)` dentro de los métodos del controlador.
- **USO OBLIGATORIO DE DECORADORES Y GUARDS**: Todo endpoint administrativo o con restricción de acceso debe usar `@UseGuards(JwtAuthGuard, PermissionsGuard)` y el decorador declarativo `@RequirePermissions(Permission.XYZ)`.
- **CATÁLOGO TIPADO CENTRALIZADO**: Todo nuevo permiso debe definirse en el enum `Permission` y mapearse en `ROLE_PERMISSIONS` en [`tienda-backend/src/auth/constants/permissions.enum.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/src/auth/constants/permissions.enum.ts).
- Consultar las directivas detalladas en `.agents/rules/backend-pbac-authorization.md`.

## 6. Rendimiento en Interfaces y Frontend (REGLA ESTRICTA)
- **PROHIBIDO MEZCLAR GUARDS DE RUTA CON LLAMADAS DE RED**: La verificación de rutas y roles en `useEffect` debe ser instantánea (0ms en cliente) sin re-ejecutar peticiones como `/stores/me` en cada cambio de subruta.
- **USO OBLIGATORIO DE CACHÉ DE METADATOS**: Prohibido hacer `fetch` directo a metadatos estáticos (`conditions`, `languages`, `currencies`, `games`). Utilizar exclusivamente el hook [`useTcgMetadata.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-front/src/hooks/useTcgMetadata.ts) o las funciones de [`metadataCache.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-front/src/utils/metadataCache.ts).
- **PREVENCIÓN DE BUCLES EN HOOKS**: Nunca usar objetos mutables en arrays de dependencias de `useEffect`; utilizar siempre identificadores primitivos (ej: `user?.activeStore?.id`).
- **DEDUPLICACIÓN SSR CON `React.cache()`**: En páginas Server Components donde `generateMetadata` y el componente de página requieren los mismos datos, envolver la consulta en `React.cache()` y configurar revalidación ligera (`next: { revalidate: 60 }`).
- **CODE SPLITTING OBLIGATORIO**: Todo modal complejo (subida de archivos, CSV, formularios grandes) y bibliotecas pesadas (`recharts`, `jspdf`, `leaflet`) deben importarse con `next/dynamic` y `{ ssr: false }`.
- Consultar las directivas detalladas en [`.agents/rules/frontend-performance.md`](file:///c:/Users/felix/Desktop/e-commerce/.agents/rules/frontend-performance.md).
