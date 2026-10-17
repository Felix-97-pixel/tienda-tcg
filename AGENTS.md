# Directivas de Trabajo para el Proyecto (AGENTS.md)

## 1. Control de Versiones y Git (REGLA ESTRICTA)
- **PROHIBIDO EJECUTAR `git push`**: El asistente NUNCA debe ejecutar `git push` (ni a `origin main`, ni a ninguna otra rama remota).
- Los envíos a repositorios remotos y despliegues a producción son responsabilidad exclusiva del usuario.
- El asistente solo trabaja a nivel local: editar código, verificar compilación (`tsc`, `npm run build`), y ejecutar servidores de desarrollo.

## 2. Seguridad en Base de Datos (Prisma)
- Nunca ejecutar migraciones destructivas ni comandos que provoquen pérdida de datos (`db push --accept-data-loss`, `migrate reset`) en producción o staging sin confirmación previa del usuario.
- Consultar las directivas detalladas en `.agents/rules/prisma-safety.md`.
