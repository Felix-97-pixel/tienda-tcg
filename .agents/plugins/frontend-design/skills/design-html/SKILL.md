---
name: design-html
description: Estándares de maquetado HTML5 semántico, accesibilidad, atributos ARIA y arquitectura de componentes limpios.
---

# Directivas: Design HTML (Maquetado Limpio)

## 1. Semántica HTML5
- Estructurar el catálogo con elementos semánticos:
  - `<header>` para la cabecera de la tienda.
  - `<aside>` para la barra lateral de filtros TCG.
  - `<main>` y `<section>` para el contenedor de la vitrina.
  - `<article>` para cada tarjeta de carta en el grid.
- Prohibido el "div soup" (anidar 15 divs sin clases semánticas ni roles).

## 2. Accesibilidad (a11y)
- Imágenes de cartas siempre con `alt` descriptivo: `alt="Black Lotus - Beta (Near Mint)"`.
- Botones de acción rápida con `aria-label` descriptivos para lectores de pantalla.
- Navegación por teclado fluida (`tabindex` y estados `:focus-visible` con anillo sutil `focus:ring-2 focus:ring-red/50`).
