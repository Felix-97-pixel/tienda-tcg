# Estándar de Soporte Dual: Modo Claro y Modo Oscuro (ui-theming-light-dark.md)

## 1. Principio Fundamental
Toda nueva vista, página, componente, modal, tabla, formulario o tarjeta en la plataforma DEBE ser concebida, desarrollada y testeada para funcionar de manera nativa e impecable tanto en **Modo Claro (`.light`)** como en **Modo Oscuro (`.dark`)**. No se admiten interfaces diseñadas únicamente para modo oscuro con fondos duros.

---

## 2. Prohibición de Colores Hexadecimales Fijos para Estructura
Queda estrictamente prohibido utilizar colores fijos (hardcoded) para fondos de página, contenedores, bordes y textos principales:
- **PROHIBIDO**: `bg-[#07090E]`, `bg-[#0E121B]`, `bg-[#0B0E14]`, `bg-[#111522]`, `bg-black`.
- **PROHIBIDO**: `text-white`, `text-white/80`, `text-gray-400` para textos que deban contrastar en fondos claros.
- **PROHIBIDO**: `border-white/10`, `border-white/5`, `border-white/15`.

### Tokens Semánticos Obligatorios (`--tt-`):
Todo componente debe consumir las variables CSS centralizadas del sistema de diseño:
- **Fondos de Lienzo / Canvas**: `bg-[var(--tt-bg-canvas)]`
- **Fondos de Tarjetas / Superficies**: `bg-[var(--tt-bg-surface)]`
- **Fondos de Inputs / Paneles Sutiles**: `bg-[var(--tt-bg-subtle)]`
- **Bordes y Separadores**: `border-[var(--tt-border-medium)]` o `border-[var(--tt-border-light)]`
- **Texto Principal**: `text-[var(--tt-text-main)]`
- **Texto Secundario / Metadatos**: `text-[var(--tt-text-muted)]`
- **Texto Terciario / Placeholders**: `text-[var(--tt-text-subtle)]`

---

## 3. Degradados de Texto con Alto Contraste (Regla de /contact)
- **PROHIBIDO EL DESVANECIMIENTO HACIA BLANCO O AMARILLO PÁLIDO**: Ningún degradado de texto (`bg-clip-text text-transparent`) puede usar tonos que terminen en blanco o amarillo pálido (`to-white`, `to-gray-400`, `via-amber-300`, `to-yellow-500`), ya que se vuelven invisibles sobre fondos claros.
- **DEGRADADO OFICIAL ESTÁNDAR**:
  ```tsx
  bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent
  ```
  Este patrón garantiza legibilidad óptima y alto impacto visual tanto en fondo blanco como en fondo oscuro.

---

## 4. Botones y Estados Interactivos (:hover, :focus, :active)
- Todo botón secundario o esquema de botones (`Button.tsx`) debe respetar el contraste en hover:
  - **PROHIBIDO**: `hover:bg-white/5` sobre fondos claros (genera texto invisible o botón lavado).
  - **CORRECTO**: `hover:bg-[var(--tt-bg-canvas)]`, `hover:border-[var(--tt-border-strong)]`, `hover:text-red` o `hover:text-[var(--tt-text-main)]`.
- Los inputs y dropdowns (`SearchableSelect`, `ChileLocationsSelect`) deben contar con fondo `bg-[var(--tt-bg-subtle)]`, borde `border-[var(--tt-border-medium)]` y texto `text-[var(--tt-text-main)]`.

---

## 5. Detección SSR y Persistencia de Tema
- La persistencia del tema se maneja vía cookies (`theme=light` o `theme=dark`).
- Todo layout raíz de un grupo de rutas (ej: `(site)/layout.tsx`, `landing/layout.tsx`, `admin/layout.tsx`) debe leer `cookies().get("theme")?.value` e inyectar `className={themeClass}` en el elemento `<html>` para evitar parpadeos visuales (FOUC).
- Envolver la aplicación con el proveedor reactivo `ThemeProvider` para permitir que el componente `ThemeToggle` alterne las clases en tiempo real.

