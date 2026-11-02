---
name: Directivas de Rendimiento en Interfaces y Frontend
description: Estándares estrictos de arquitectura, carga de datos, caching y code splitting para garantizar interfaces ultrarrápidas y evitar refactorizaciones de rendimiento.
---

# Directivas de Rendimiento en Interfaces y Frontend

**REGLA ESTRICTA DE ARQUITECTURA Y CÓDIGO:**
Toda nueva vista, componente, hook o integración en `tienda-front` debe construirse siguiendo estos principios de rendimiento desde el primer día para evitar cuellos de botella, waterfalls de red o degradación de la experiencia de usuario.

---

## 1. Desacoplamiento de Guards de Ruta y Carga de Datos
- **PROHIBIDO mezclar dependencias de navegación (`pathname`, `router`) con llamadas de red en el mismo `useEffect`:**
  - Los chequeos de autorización por rol o redirección deben ejecutarse en 0ms en cliente de forma puramente sincrónica.
  - La carga de datos de sesión o perfil (`/stores/me`, `/features`) debe residir en un hook o `useEffect` independiente que solo se ejecute al autenticar o cuando cambie explícitamente el ID de la entidad activa.
- **PROHIBIDO bloquear toda la pantalla con spinners si los datos ya existen en caché:**
  - Si el token JWT ya es válido localmente y los datos básicos existen en Redux/localStorage, renderizar la interfaz inmediatamente y actualizar en segundo plano (patrón stale-while-revalidate).

---

## 2. Uso Obligatorio de Caché de Metadatos y Deduplicación en Memoria
- **PROHIBIDO hacer `fetch` directo a endpoints de metadatos estáticos:**
  - Condiciones (`/products/meta/conditions`)
  - Idiomas (`/products/meta/languages`)
  - Monedas y tipos de cambio (`/currencies`)
  - Juegos disponibles (`/games`)
- **USO OBLIGATORIO DE LAS UTILIDADES DE CACHÉ:**
  - En vistas de catálogo o vitrinas, usar siempre el hook centralizado:
    ```tsx
    import { useTcgMetadata } from "@/hooks/useTcgMetadata";
    
    const { conditions, languages, currencies, isLoaded } = useTcgMetadata();
    ```
  - En funciones asíncronas o hooks personalizados, importar los métodos memorizados desde [`metadataCache.ts`](file:///c:/Users/felix/Desktop/e-commerce/tienda-front/src/utils/metadataCache.ts):
    ```tsx
    import { 
      fetchCachedConditions, 
      fetchCachedLanguages, 
      fetchCachedCurrencies,
      fetchCachedGames 
    } from "@/utils/metadataCache";
    ```
  - Estas funciones garantizan que múltiples componentes montados en paralelo reutilizan la misma promesa en vuelo y que navegaciones posteriores resuelven en 0ms sin consumir ancho de banda.

---

## 3. Prevención de Bucles y Re-renders por Dependencias de Objetos
- **PROHIBIDO usar objetos mutables o referencias de Redux en arrays de dependencias de `useEffect`:**
  - Incorrecto: `useEffect(() => { ... }, [user?.activeStore])` (causa re-renders continuos si Redux genera una nueva referencia).
  - Correcto: `useEffect(() => { ... }, [user?.activeStore?.id])` (utilizar siempre primitivos de string o números).
- **PROHIBIDO disparar acciones de Redux dentro de un `useEffect` que tenga como dependencia la misma porción de estado que la acción actualiza.**

---

## 4. Deduplicación y Caching en Server Components (SSR)
- **Uso obligatorio de `React.cache()` para datos compartidos en SSR:**
  - En páginas donde `generateMetadata()` y el componente de página (`Page`) requieren los mismos datos (ej: perfil público de tienda o detalle de producto), encapsular la llamada en una función envuelta con `cache()`:
    ```tsx
    import React, { cache } from "react";
    
    const getStoreData = cache(async (subdomain: string) => {
      const res = await fetch(`${API_URL}/stores/public/${subdomain}`, {
        next: { revalidate: 60 }
      });
      if (!res.ok) return null;
      return res.json();
    });
    ```
- **PROHIBIDO abusar de `{ cache: "no-store" }` en datos públicos o semiestáticos:**
  - Utilizar siempre `next: { revalidate: 60 }` (ISR) para permitir que Next.js responda desde caché de servidor con latencia inferior a 100ms.

---

## 5. Code Splitting Obligatorio de Componentes Pesados
- **PROHIBIDO importar estáticamente modales complejos o bibliotecas pesadas en bundles iniciales:**
  - Todo modal con formularios extensos, subida de archivos (CSV, dropzone) o tablas pesadas debe cargarse perezosamente:
    ```tsx
    import dynamic from "next/dynamic";
    
    const InventoryModal = dynamic(() => import("@/app/admin/_components/Products/InventoryModal"), { 
      ssr: false 
    });
    ```
  - Todas las bibliotecas pesadas como `recharts`, `jspdf`, `leaflet`, `html2canvas` o `papaparse` deben cargarse exclusivamente con `dynamic()` o mediante imports dinámicos dentro de manejadores de eventos (`await import(...)`).

---

## 6. Paginación y Filtrado del lado del Servidor
- **PROHIBIDO descargar colecciones completas sin límite al navegador para paginarlas en cliente:**
  - Siempre transferir parámetros de paginación (`page`, `limit`) al backend.
  - El backend debe aplicar `take` y `skip` nativos en la consulta de base de datos y devolver metadatos de paginación (`total`, `totalPages`, `page`, `limit`).
- **PROHIBIDO consultas "unbounded" en backend:**
  - Ningún endpoint de listado debe ejecutar `findMany` sin un límite máximo predeterminado o paginación por cursor.

---

## 7. Memoización de Cálculos y Transformaciones TCG
- **Uso de `useMemo` para transformaciones de catálogo:**
  - El cálculo del mejor precio (`getBestAvailableVariant`), conversión de divisas con tasas de cambio y filtrado de variantes debe estar envuelto en `useMemo` para evitar re-ejecutar bucles en cada tecla pulsada o render del padre.
- **Debounce obligatorio en campos de búsqueda:**
  - Todo campo de búsqueda en vivo en tablas o catálogos debe aplicar debounce (300ms a 400ms) antes de disparar la consulta al servidor.

