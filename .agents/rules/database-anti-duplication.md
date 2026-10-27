---
name: Database Architecture & Anti-Duplication
description: Reglas obligatorias para verificar el esquema de base de datos antes de crear o modificar campos, evitando duplicidad e inconsistencias.
---

# Reglas de Arquitectura de Datos y Prevención de Duplicidad

**PROPÓSITO:** Garantizar que cada entidad, atributo o estado del negocio tenga una **única fuente de verdad** (Single Source of Truth) en la base de datos PostgreSQL (`prisma/schema.prisma`). Queda terminantemente prohibido duplicar flags o estados en múltiples tablas.

---

## 1. Verificación Obligatoria Antes de Modificar o Proponer Campos
Antes de redactar código que agregue campos en Prisma, migraciones o DTOs:
1. **Consultar el Diccionario de Datos:** Revisar minuciosamente [`docs/DICCIONARIO_DE_DATOS.md`](file:///c:/Users/felix/Desktop/e-commerce/docs/DICCIONARIO_DE_DATOS.md) y [`prisma/schema.prisma`](file:///c:/Users/felix/Desktop/e-commerce/tienda-backend/prisma/schema.prisma).
2. **Identificar si el concepto ya existe:**
   * Si ya existe un campo o modelo que represente ese dato o estado, **DEBES USAR EL EXISTENTE**.
   * No crees un campo alternativo con nombre similar (ej. no crear `isPickupActive` si ya existe `pickupEnabled`).
3. **Preguntar antes de duplicar:** Si una nueva funcionalidad parece requerir un flag que ya existe en otra tabla, evalúa si es una relación o consulta directa antes de crear redundancia.

---

## 2. Principio: Atributo Propio vs Servicio Externo
* **Atributos Propios:** Pertenecen a la entidad raíz.
  * Ejemplo: `Store.pickupEnabled`, `Store.pickupAddress`, `Store.pickupSchedule` representan el local físico del vendedor.
* **Servicios Externos Tarifados:** Pertenecen a tablas de integración / catálogo de proveedores.
  * Ejemplo: `ShippingProvider` contiene únicamente empresas externas de paquetería con tarifas de flete (`CHILEXPRESS`, `STARKEN`). **NUNCA** insertar retiros propios dentro de tablas de couriers externos.

---

## 3. Protocolo de Modificación de Base de Datos
1. Si un nuevo requerimiento legítimamente necesita un campo nuevo:
   * Debe agregarse en el modelo canónico que sea dueño natural de ese dato.
   * Debe actualizarse de inmediato [`docs/DICCIONARIO_DE_DATOS.md`](file:///c:/Users/felix/Desktop/e-commerce/docs/DICCIONARIO_DE_DATOS.md) documentando el nombre del campo, tipo, valor por defecto y propósito.
2. Si se detecta un campo redundante o en desuso:
   * Centralizar la lógica en la fuente de verdad.
   * Eliminar las dependencias del campo obsoleto de forma segura respetando las directivas de [`prisma-safety.md`](file:///c:/Users/felix/Desktop/e-commerce/.agents/rules/prisma-safety.md).
