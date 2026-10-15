---
name: tcg-storefront
description: Directivas de diseño de alta gama para interfaces de tiendas y catálogos de cartas coleccionables (TCG). Aplica principios de refactoring-ui, top-design, taste-skill y microinteractions.
---

# Directivas de Diseño: TCG Storefront (TapTrade)

Este skill define los estándares visuales y de interacción obligatorios para la vitrina pública de tiendas TCG.

## 1. Principios de Diseño
- **Estética Dark Vault:** Fondo oscuro profundo (`#090B10` a `#11151F`), bordes con sutil transparencia `border-white/10`, y capas con sombras difusas.
- **Jerarquía Visual TCG:**
  1. Arte de la carta (prioridad 1).
  2. Nombre y edición/set con su símbolo oficial.
  3. Badge de condición claro y contrastado (NM, LP, MP, HP).
  4. Precio y stock disponible.
- **Anti-Slop (No genérico):**
  - Prohibido usar selectores de ropa o plantillas de ecommerce estándar (tallas, géneros).
  - Usar terminología nativa de coleccionistas (Singles, Boosters, Foil, Reverse, Near Mint).

## 2. Badges de Condición Estandarizados
- **NM (Near Mint):** `bg-emerald-500/15 text-emerald-400 border-emerald-500/30`
- **LP (Lightly Played):** `bg-blue-500/15 text-blue-400 border-blue-500/30`
- **MP (Moderately Played):** `bg-amber-500/15 text-amber-400 border-amber-500/30`
- **HP (Heavily Played):** `bg-orange-500/15 text-orange-400 border-orange-500/30`
- **DMG (Damaged):** `bg-rose-500/15 text-rose-400 border-rose-500/30`

## 3. Microinteracciones
- **Efecto Foil Holográfico:** Las cartas con acabado Foil deben incluir un gradiente iridiscente animado o que reaccione al hover.
- **Acciones Rápidas:** Selector de idioma y condición directo en la tarjeta para no obligar al usuario a abrir modales innecesarios.
- **Feedback Táctil:** Botón de agregar al carrito con estado de éxito inmediato.
