# Guía de Skills de Diseño y Propuesta de Rediseño del Storefront (TapTrade)

Este documento reúne la explicación de las 10 skills de diseño UI/UX encontradas, la justificación estratégica para renovar la vitrina pública de la tienda (Storefront) y el cuestionario interactivo para definir la nueva identidad visual.

---

## 1. Desglose de las 10 Skills de Diseño UI/UX

| # | Skill | Enfoque Principal | Aplicación Práctica en TapTrade |
| :--- | :--- | :--- | :--- |
| **01** | **frontend-design** | Interfaces distintivas | Crea layouts únicos para la tienda. Evita que parezca una plantilla genérica de Shopify o WooCommerce. |
| **02** | **ui-ux-pro-max** | Inteligencia UI/UX | Optimiza los flujos de compra, filtros rápidos por juego/expansión, estados de carga y feedback visual inmediato. |
| **03** | **refactoring-ui** | Sistema de diseño | Reglas estrictas de jerarquía visual: espaciado armónico (escala de 4/8px), contrastes correctos y sombras sutiles. |
| **04** | **top-design** | Nivel Awwwards | Acabado premium: estética de alta gama, dark mode elegante, efectos de vidrio (glassmorphism) y bordes sutiles. |
| **05** | **web-typography** | Pairing de fuentes | Combinación de tipografías modernas (ej. fuente geométrica para títulos de cartas + fuente legible para números y precios). |
| **06** | **taste-skill** | Anti-slop frontend | Filtro de buen gusto: elimina clichés de diseño de IA y asegura terminaciones de producto profesional real. |
| **07** | **microinteractions** | Microinteracciones | Efectos dinámicos: destellos o reflejos holográficos en cartas foil, animaciones al añadir al carrito y transiciones fluidas. |
| **08** | **ux-heuristics** | Auditoría UX | Principios de Nielsen: mensajes de error claros, navegación sin fricción y prevención de errores en checkout. |
| **09** | **design-html** | Maquetado limpio | HTML5 semántico, componentes accesibles y código modular fácil de mantener. |
| **10** | **canvas-design** | Posters editables | Herramientas gráficas para banners promocionales, eventos de torneos y tarjetas compartibles en redes. |

---

## 2. ¿Por qué es una gran idea rediseñar el Storefront (Vitrina de la Tienda)?

1. **El público de TCG es coleccionista y visual:**
   * En Magic, Pokémon, Yu-Gi-Oh! o Mitos y Leyendas, el comprador valora el arte de la carta, la rareza y el estado de conservación (*Near Mint, Lightly Played, etc.*).
   * Un diseño genérico genera desconfianza. Una tienda con estética de **"Bóveda Digital de Coleccionismo"** eleva de inmediato el valor percibido del stock.

2. **El motor técnico ya está terminado:**
   * El Backend, la base de datos, el inventario, los precios, las monedas y el checkout ya están construidos y funcionando.
   * Rediseñar la tienda solo cambia la **capa visual (Frontend)**, sin riesgo de romper la lógica de negocio.

3. **Diferenciación brutal frente a la competencia:**
   * Plataformas locales como TCGMatch tienen interfaces muy básicas y planas.
   * Con estas skills podemos dejar la tienda a un nivel visual similar a sitios internacionales de referencia.

---

## 3. Cuestionario de Definición Visual para el Nuevo Storefront

Para aplicar la combinación exacta de estas skills en el código de la tienda, revisa estas opciones para definir el estilo:

### A. Atmósfera y Tema Visual
* **Opción 1: Dark Vault (Recomendado):** Fondo oscuro profundo (`#0B0E14`), tarjetas con bordes finos semi-transparentes, acentos de color neón sutil según el juego (ej. Amarillo Pokémon, Azul Magic, Púrpura Yu-Gi-Oh!).
* **Opción 2: Minimalista Limpio:** Fondo claro/blanco roto, estética editorial estilo Apple/Stripe, tipografía grande y foco 100% en el arte de las cartas.
* **Opción 3: Modo Híbrido con Switch:** Selector claro/oscuro para que cada coleccionista elija su preferencia.

### B. Tipografías (Font Pairing)
* **Combinación A (Moderna / Tech):** 
  * Títulos: *Outfit* o *Space Grotesk* (geométrica, moderna, con carácter).
  * Textos y Precios: *Inter* o *Plus Jakarta Sans* (ultra legible para números y listas).
* **Combinación B (Gaming / Coleccionismo):**
  * Títulos: *Cabinet Grotesk* o *Clash Display*.
  * Textos y Precios: *JetBrains Mono* (para números de coleccionista, precios y stock) + *Inter*.

### C. Visualización de Cartas e Inventario
* **Tarjeta Estilo Vitrina:**
  * Vista previa grande del arte con esquinas redondeadas.
  * Efecto sutil de brillo o reflejo (holográfico) al pasar el cursor sobre cartas foil.
  * Badge de condición claro y colorido (*NM en verde esmeralda, LP en azul, MP en amarillo*).
  * Selector rápido de idioma y acabado (Normal / Foil) sin salir del catálogo.
* **Modo Vista Lista (Para jugadores competitivos):**
  * Tabla compacta de alta densidad para armar mazos rápidamente con precios comparativos.

---

## 4. Próximos Pasos

1. Elige tu combinación preferida de atmósfera, tipografía y estilo de tarjeta.
2. Comenzaremos creando los tokens de diseño (colores, sombras, tipografías) en el CSS del frontend.
3. Maquetaremos los nuevos componentes de la tienda: Hero banner de tienda, Filtros avanzados de cartas, Grid de productos y Ficha de carta.
