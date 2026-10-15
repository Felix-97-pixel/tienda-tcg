# Plan Maestro de Implementación y Lanzamiento (TapTrade SpA)

Este documento es nuestra hoja de ruta definitiva para llevar TapTrade desde la constitución legal hasta el lanzamiento público de su versión final (V1.0), integrando todos los proveedores oficiales de pagos y logística.

---

## Fase 1: Formalización Legal y Tributaria
*Para poder firmar contratos comerciales con Mercado Pago, Transbank y empresas de logística, la empresa debe existir legalmente y poder emitir facturas.*

- [x] **1.1. Constitución de la SpA:** Trámite en "Tu Empresa en un Día" (Completado). Obtención del RUT (78.531.106-K) y Estatutos.
- [x] **1.2. Contrato de Oficina Virtual:** Recepción y firma electrónica del contrato de arriendo (Completado con Asesorías e Inversiones Pontevedra SpA / OficinaVirtual.cl, dirección: Padre Mariano 98 Of. 315, Providencia, Rol 02221-00515).
- [x] **1.3. Inicio de Actividades (SII):** Declaración de giros completada exitosamente el 13 de Octubre de 2026 (Giros 479100, 631200, 620900 en 1ra Categoría, afecto a IVA).
- [x] **1.4. Acreditación de Domicilio y Constitución:** Contrato de arriendo de oficina virtual y Certificado de Estatuto Actualizado (CVE CRmOFCe9Mh8j) adjuntados y enviados al SII.
- [x] **1.5. Certificado Digital e Inscripción de Facturación:** Certificado digital adquirido en Acepta y TAPTRADE SpA formalmente autorizada e inscrita en el Sistema de Facturación Gratuito del SII (Factura, Factura Exenta, Guías de Despacho, Notas de Crédito/Débito autorizadas).
- [/] **1.6. Cuenta Bancaria Empresa:** Solicitud de Cuenta Emprendedor BancoEstado enviada exitosamente el 14 de Octubre de 2026 para TAPTRADE SpA. A la espera de confirmación y número de cuenta (máx. 24 hrs hábiles).

---

## Fase 2: Contratación y Aprobación de APIs
*Con el RUT, el Inicio de Actividades y la cuenta bancaria lista, postulamos a los servicios corporativos.*

- [ ] **2.1. Mercado Pago (Split Payments):** 
   - Crear una cuenta de Mercado Pago a nombre de la empresa.
   - Contactar a soporte comercial enviando los Estatutos y el RUT para solicitar la habilitación de **"Pagos Avanzados (Advanced Payments)"** para marketplace.
- [ ] **2.2. Transbank (Webpay Plus):**
   - Inscribir a TapTrade SpA en Transbank (portal Transbank.cl).
   - Firmar el contrato comercial para obtener el **Código de Comercio (Mall/Marketplace)**.
   - Obtener las llaves de producción (API Keys).
- [x] **2.3. Chilexpress (APIs):** Cuenta técnica activada y suscripciones a APIs de Cotizador, Coberturas y Envíos generadas activas en el portal developers oficial (`developers.wschilexpress.com`).
- [x] **2.4. Starken (APIs):** Cuenta técnica de desarrollador creada y activada para TAPTRADE SpA en el portal oficial `developers.starken.cl` con acceso a servicios de Cotización, Creación de envíos y Tracking.

---

## Fase 3: Programación e Integración (Backend & Frontend)
*Una vez nos entreguen las credenciales (API Keys) de producción, pasamos a integrarlas al código.*

- [ ] **3.1. Refactorización de Pagos (Mercado Pago):** Asegurarse de que el flujo de `Advanced Payments` distribuye correctamente el dinero entre la plataforma (Application Fee) y los vendedores, ya con el permiso oficial.
- [ ] **3.2. Integración de Transbank:** (Opcional si se decide usar Webpay además de MP). Crear el módulo de Webpay Mall para dividir pagos.
- [ ] **3.3. Cotizador de Envíos Dinámico:**
   - Conectar la API de Chilexpress y Starken en la pantalla de Checkout.
   - Calcular el costo real del envío basándose en el peso/volumen de las cartas y la dirección del comprador vs la dirección de la tienda vendedora.
- [ ] **3.4. Generación de Etiquetas:** Programar en el panel de control del vendedor (Dashboard) un botón para generar e imprimir la etiqueta de envío de Chilexpress/Starken automáticamente cuando les entra una venta.

---

## Fase 4: Pruebas Exhaustivas (QA)
*Antes de abrirle la puerta al público, testeamos con dinero real.*

- [ ] **4.1. Simulacro de Compras Múltiples:** Armar un carrito con 5 productos de 3 tiendas distintas. Pagar con tarjeta de crédito/débito real y verificar que:
   - Se crea la orden maestra.
   - Se crean las 3 sub-órdenes para cada vendedor.
   - Mercado Pago deposita las partes correspondientes a los 3 vendedores.
   - TapTrade SpA recibe su comisión consolidada.
- [ ] **4.2. Pruebas de Logística:** Generar una venta de prueba, imprimir la etiqueta de Chilexpress y verificar que el código de seguimiento sea válido en la página oficial.
- [ ] **4.3. Pruebas de Carga y Seguridad:** Verificar que la base de datos de cartas responda rápido y no haya vulnerabilidades en la actualización del stock.

---

## Fase 5: Salida al Mercado (Lanzamiento)
- [ ] **5.1. Migración a Servidor de Producción Definitivo:** Asegurar que la base de datos (Neon) y los servidores (Vercel o VPS) estén escalados y optimizados.
- [ ] **5.2. Onboarding de Vendedores:** Invitar a tiendas beta (como BloodMoonGames) a subir su inventario definitivo y vincular sus cuentas de MP.
- [ ] **5.3. Lanzamiento Oficial:** Abrir la web al público, iniciar campañas de marketing y anunciar la versión 1.0.
