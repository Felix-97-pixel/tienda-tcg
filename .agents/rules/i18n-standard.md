# Regla de Internacionalización (i18n Standard)

Esta directiva establece los requerimientos para el desarrollo de nuevas pantallas, componentes y modificaciones dentro del frontend (`tienda-front`).

## 1. Prohibición de Hardcoded Strings
- Queda estrictamente prohibido escribir texto visible para el usuario (etiquetas, botones, placeholders, títulos, mensajes de error, tooltips, modales) directamente en JSX/HTML o código fuente.
- Todo texto debe consumirse a través de la función de traducción correspondiente de `next-intl`:
  ```tsx
  import { useTranslations } from "next-intl";
  
  const t = useTranslations("buylist");
  return <h1>{t("cards_wanted_title")}</h1>;
  ```

## 2. Integridad y Paridad de Diccionarios
- Toda nueva clave creada debe agregarse simultáneamente en los tres idiomas soportados:
  * `tienda-front/messages/es/{modulo}.json` (Español - Base/Referencia)
  * `tienda-front/messages/en/{modulo}.json` (Inglés)
  * `tienda-front/messages/pt/{modulo}.json` (Portugués)
- Las claves deben ser descriptivas y jerárquicas: `modulo.seccion.accion_o_elemento`.
- Módulos estándar: `common`, `nav`, `shop`, `auth`, `buylist`, `admin`, `legal`, `errors`.

## 3. Parámetros e Interpolación Formal
- Los valores dinámicos no deben concatenarse con strings (`count + " copias"` es un antipatrón).
- Usar interpolación y plurales provistos por ICU format / `next-intl`:
  ```json
  "looking_for": "Buscan {count, plural, =1 {1 copia} other {# copias}}"
  ```
  ```tsx
  t("item_card.looking_for", { count: item.quantityWanted })
  ```

## 4. Arquitectura de URLs Limpias (Sin prefijos)
- Las rutas de navegación no deben modificarse agregando `/es/`, `/en/` o `/pt/` en las URLs.
- La persistencia del idioma se gestiona exclusivamente por la cookie `NEXT_LOCALE` y el header `Accept-Language`, manteniendo intactas las URLs canónicas y la arquitectura de subdominios (`/shop/store/[subdomain]`).

## 5. Tipado Estricto (Type-Safe i18n)
- Todas las traducciones están tipadas en `tienda-front/src/types/global.d.ts` bajo la interfaz `IntlMessages`.
- `npx tsc --noEmit` debe pasar con 0 errores al añadir nuevas pantallas o editar traducciones.

