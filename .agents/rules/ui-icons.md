---
name: Estandarización de Iconos de Interfaz
description: Directiva estricta para el uso y centralización de iconos SVG en la aplicación web, prohibiendo emojis e iconos inline.
---

# Estandarización y Centralización de Iconos de Interfaz

**REGLA ESTRICTA DE DISEÑO Y CÓDIGO:**
Todos los iconos utilizados en cualquier componente, página o modal de la aplicación (`tienda-front`) deben ser consistentes, reutilizables y limpios.

---

## 1. Prohibición Absoluta de Emojis
- **NUNCA usar emojis** (ej: 📦, 🟢, 🟡, 💡, 👁️, 🔍, 🛡️, ✨, 🃏, etc.) en interfaces de usuario, botones, badges, modales o tablas.
- Siempre utilizar iconos SVG estilizados bajo la identidad visual de la aplicación (Dark Vault / TCG).

## 2. Archivo Centralizado Obligatorio: `Icons.tsx`
- **Ubicación única:** `tienda-front/src/components/ui/Icons.tsx`
- **PROHIBIDO incrustar SVGs en línea o declarar funciones de iconos locales** dentro de páginas o componentes (como modales, tablas, botones o formularios).
- Todo componente debe importar sus iconos exclusivamente desde `@/components/ui/Icons`:
  ```tsx
  import { 
    IconCheckCircle, 
    IconClock, 
    IconBox, 
    IconEye, 
    IconSparkles, 
    IconInfo, 
    IconCard, 
    IconExternalLink, 
    IconX, 
    IconShieldCheck 
  } from "@/components/ui/Icons";
  ```

## 3. Protocolo para Nuevos Iconos
Cuando un componente requiera un icono que **aún no exista** en `Icons.tsx`:
1. **Paso Obligatorio 1:** Abrir `tienda-front/src/components/ui/Icons.tsx`.
2. **Paso Obligatorio 2:** Crear y exportar el nuevo icono utilizando la interfaz tipada `IconProps`:
   ```tsx
   export const IconNuevo: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
     <svg
       width={size || 16}
       height={size || 16}
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="2"
       strokeLinecap="round"
       strokeLinejoin="round"
       className={className}
       {...props}
     >
       {/* Paths del icono */}
     </svg>
   );
   ```
3. **Paso Obligatorio 3:** Importar el nuevo icono en el componente deseado desde `@/components/ui/Icons`.
4. De esta manera, el icono queda registrado permanentemente y disponible para futuras creaciones en toda la aplicación.
