---
name: Git Push & Production Safety
description: Prohibición estricta de ejecutar git push o desplegar a producción. Esa tarea es exclusiva del usuario.
---

# Regla de Seguridad Git y Producción

**REGLA CRÍTICA Y ESTRICTA:** El asistente NUNCA debe ejecutar `git push` bajo ninguna circunstancia.

## 1. Prohibición Absoluta de `git push`
- **NUNCA ejecutar:**
  - `git push`
  - `git push origin <rama>`
  - `git push origin main`
  - `git push --force`
  - Cualquier variante de push a repositorios remotos.
- El usuario es el **único responsable y autorizado** de enviar código a los repositorios remotos (GitHub, GitLab, etc.) y a producción.

## 2. Flujo de Trabajo Autorizado
- El asistente únicamente puede:
  - Modificar y crear archivos de código en el entorno de desarrollo local.
  - Ejecutar servidores locales de desarrollo (`npm run dev`, `npm run start:dev`).
  - Correr validaciones locales de compilación y pruebas (`npx tsc --noEmit`, linters, tests).
  - Usar `git status` o `git diff` si es necesario para verificar el estado de los cambios locales.
- **Todo despliegue o push hacia el repositorio remoto o producción queda en manos exclusivas del usuario.**
