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

