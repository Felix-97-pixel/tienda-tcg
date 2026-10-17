"use client";

import React, { useState } from "react";
import Link from "next/link";
import LegalPageLayout, { LegalLink } from "@/components/layout/LegalPageLayout";
import LegalSection from "@/components/layout/LegalSection";
import {
  IconShieldCheck,
  IconCard,
  IconTruck,
  IconCreditCard,
  IconZap,
  IconSparkles,
} from "@/components/ui/Icons";

const PoliticaPrivacidadClient = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const sidebarLinks: LegalLink[] = [
    { id: "responsable-marco", label: "1. Responsable y Marco Legal" },
    { id: "principios-tratamiento", label: "2. Principios del Tratamiento" },
    { id: "bases-licitud", label: "3. Bases de Licitud" },
    { id: "datos-recopilados", label: "4. Datos Recopilados" },
    { id: "finalidades", label: "5. Finalidades del Uso" },
    { id: "seguridad-bancaria", label: "6. Seguridad Bancaria y Pagos" },
    { id: "terceros-encargados", label: "7. Transferencia a Terceros" },
    { id: "derechos-arco", label: "8. Derechos del Titular (ARCO+)" },
    { id: "procedimiento-derechos", label: "9. Procedimiento y Plazos" },
    { id: "autoridad-control", label: "10. Autoridad de Control (ANPD)" },
    { id: "seguridad-brechas", label: "11. Medidas de Seguridad" },
    { id: "plazo-conservacion", label: "12. Conservación y Supresión" },
    { id: "cookies-rastreo", label: "13. Cookies y Tecnologías" },
  ];

  return (
    <LegalPageLayout
      title="Política de Privacidad | TapTrade Chile"
      navTitle="Índice de Privacidad"
      links={sidebarLinks}
      lastUpdated="Última actualización: 16 de Octubre de 2026"
      backToShopText="Volver al Marketplace"
    >
      {/* Header Overview Card */}
      <div className="border-b border-white/10 pb-8 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Conforme a la Nueva Ley de Protección de Datos Personales
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
            RUT 78.531.106-K • Chile
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Política de Privacidad y Tratamiento de Datos Personales
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed">
          En <strong className="text-white">TAPTRADE SpA</strong> nos comprometemos a garantizar la máxima seguridad, confidencialidad y transparencia en el tratamiento de los datos personales de nuestros usuarios, compradores, vendedores y visitantes. Esta política se encuentra estrictamente alineada con la <strong className="text-white">Nueva Ley de Protección de Datos Personales de Chile</strong> (reforma a la Ley N° 19.628, creación de la Agencia de Protección de Datos Personales - ANPD) y los estándares internacionales de privacidad.
        </p>

        {/* Legal Identity Pill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Responsable del Tratamiento</span>
            <span className="text-xs font-bold text-white block mt-0.5">TAPTRADE SpA</span>
            <span className="text-[11px] font-mono text-gray-500">RUT: 78.531.106-K</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Canal Oficial de Privacidad</span>
            <span className="text-xs font-bold text-emerald-400 block mt-0.5">privacidad@taptrade.cl</span>
            <span className="text-[11px] text-gray-500">Atención de solicitudes ARCO+</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Autoridad Fiscalizadora</span>
            <span className="text-xs font-bold text-white block mt-0.5">ANPD / SERNAC</span>
            <span className="text-[11px] text-gray-500">República de Chile</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: Responsable y Marco Legal */}
      <LegalSection id="responsable-marco" num={1} title="Responsable del Tratamiento y Marco Legal Aplicable">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            El responsable del tratamiento de las bases de datos generadas a través del sitio web oficial <strong className="text-white">www.taptrade.cl</strong> y sus aplicaciones asociadas es <strong className="text-white">TAPTRADE SpA</strong>, sociedad por acciones constituida bajo las leyes de la República de Chile, RUT N° 78.531.106-K, domiciliada en Santiago de Chile.
          </p>
          <p>
            Esta política regula las operaciones de recolección, registro, almacenamiento, procesamiento, comunicación y supresión de datos en estricta conformidad con el marco jurídico chileno vigente, particularmente:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
            <li><strong className="text-white">Nueva Ley de Protección de Datos Personales</strong> (Boletín N° 11.144-07, que moderniza la Ley N° 19.628 y adecúa el marco chileno a los estándares del RGPD europeo y la OCDE).</li>
            <li><strong className="text-white">Ley N° 19.496</strong> sobre Protección de los Derechos de los Consumidores (SERNAC).</li>
            <li><strong className="text-white">Decreto Ley N° 825</strong> y Código Tributario de Chile respecto a la emisión de documentos tributarios electrónicos ante el Servicio de Impuestos Internos (SII).</li>
          </ul>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 2: Principios del Tratamiento */}
      <LegalSection id="principios-tratamiento" num={2} title="Principios Rectores del Tratamiento de Datos">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            En cumplimiento de la legislación chilena, todo tratamiento de datos personales en TapTrade se rige de manera obligatoria por los siguientes principios rectores:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Licitud y Lealtad
              </h4>
              <p className="text-xs text-gray-400">Los datos son tratados siempre con una base jurídica válida, de forma transparente y sin engaños hacia el titular.</p>
            </div>

            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Finalidad Determinada
              </h4>
              <p className="text-xs text-gray-400">Los datos se recopilan únicamente para fines específicos, explícitos y legítimos vinculados al marketplace y los envíos.</p>
            </div>

            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Proporcionalidad y Minimización
              </h4>
              <p className="text-xs text-gray-400">Solo solicitamos los datos estrictamente necesarios para procesar tus compras, emitir boletas y despachar los paquetes.</p>
            </div>

            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Seguridad y Confidencialidad
              </h4>
              <p className="text-xs text-gray-400">Aplicamos cifrado TLS 1.3, servidores seguros y estrictos controles de acceso para proteger tus datos contra accesos no autorizados.</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 3: Bases de Licitud */}
      <LegalSection id="bases-licitud" num={3} title="Bases de Licitud para el Tratamiento">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            TapTrade trata tus datos personales exclusivamente cuando concurre al menos una de las siguientes bases legales autorizadas por el ordenamiento chileno:
          </p>
          <div className="bg-[#111522] p-5 rounded-2xl border-l-4 border-emerald-500 space-y-3">
            <div>
              <strong className="text-white text-sm block">1. Ejecución Contractual:</strong>
              <p className="text-xs text-gray-300 mt-0.5">El tratamiento es imprescindible para crear tu cuenta, procesar el pago de tus cartas, coordinar con Starken/Chilexpress y entregarte tus pedidos.</p>
            </div>
            <div>
              <strong className="text-white text-sm block">2. Consentimiento Expreso e Informado:</strong>
              <p className="text-xs text-gray-300 mt-0.5">Otorgado al registrarte en la plataforma mediante la aceptación libre y voluntaria de esta Política de Privacidad.</p>
            </div>
            <div>
              <strong className="text-white text-sm block">3. Cumplimiento de Obligaciones Legales:</strong>
              <p className="text-xs text-gray-300 mt-0.5">Obligación tributaria de emisión y conservación de boletas o facturas electrónicas exigidas por el Servicio de Impuestos Internos (SII).</p>
            </div>
            <div>
              <strong className="text-white text-sm block">4. Interés Legítimo en Seguridad:</strong>
              <p className="text-xs text-gray-300 mt-0.5">Prevención de fraudes electrónicos, protección de la infraestructura ante ciberataques y mitigación de transacciones sospechosas.</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 4: Datos Recopilados */}
      <LegalSection id="datos-recopilados" num={4} title="Categorías de Datos Personales Recopilados">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            Para operar el marketplace y brindar el servicio de compra y venta de cartas TCG, recopilamos las siguientes categorías de datos:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="bg-[#0B0E17] border border-white/10 p-5 rounded-2xl">
              <span className="text-xs font-mono font-bold text-red uppercase block mb-1">A. Datos de Identificación y Cuenta</span>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>Nombre y apellido.</li>
                <li>Dirección de correo electrónico (utilizada como identificador único).</li>
                <li>Contraseña almacenada bajo hash criptográfico unidireccional irreversible.</li>
                <li>RUT (en caso de requerir factura comercial o registro de tienda LGS).</li>
              </ul>
            </div>

            <div className="bg-[#0B0E17] border border-white/10 p-5 rounded-2xl">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase block mb-1">B. Datos Logísticos y de Despacho</span>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>Nombre de la persona que recibe el paquete.</li>
                <li>Región y Comuna de destino oficial en Chile.</li>
                <li>Calle, número de casa/departamento y referencias de entrega.</li>
                <li>Teléfono de contacto para el transportista (Starken / Chilexpress).</li>
              </ul>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 5: Finalidades del Uso */}
      <LegalSection id="finalidades" num={5} title="Finalidades Específicas del Tratamiento">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            Los datos personales recolectados son utilizados con los siguientes propósitos exclusivos:
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300">
            <li><strong className="text-white">Gestión y Procesamiento de Pedidos:</strong> Validación de inventario, cobro de transacciones, custodia de fondos y liquidación a las tiendas vendedoras.</li>
            <li><strong className="text-white">Generación de Guías de Transporte:</strong> Envío automatizado de la información de despacho a Starken o Chilexpress para la impresión de etiquetas y seguimiento en vivo.</li>
            <li><strong className="text-white">Notificaciones Transaccionales:</strong> Envío de correos de confirmación de compra, número de seguimiento (*tracking*) y avisos cuando el paquete esté listo para retiro o entregado.</li>
            <li><strong className="text-white">Operación del Sistema Buylist:</strong> Acreditación de saldo en tienda (*Store Credit*) y verificación de cartas vendidas por coleccionistas a tiendas asociadas.</li>
            <li><strong className="text-white">Seguridad e Integridad:</strong> Prevención de accesos abusivos y detección de bots automatizados mediante Cloudflare Turnstile.</li>
          </ol>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 6: Seguridad Bancaria y Pagos */}
      <LegalSection id="seguridad-bancaria" num={6} title="Seguridad Bancaria y Tarjetas de Crédito/Débito">
        <div className="bg-[#111522] border border-emerald-500/30 p-6 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
              🔒
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Garantía de No Almacenamiento de Datos Bancarios</h3>
              <p className="text-xs text-emerald-400/90 font-medium">Estándar internacional PCI-DSS</p>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed pt-2">
            <strong className="text-white">TapTrade no almacena, no procesa ni tiene acceso bajo ninguna circunstancia a los números completos de tu tarjeta de crédito o débito, fechas de vencimiento ni códigos de seguridad CVV/CVC.</strong>
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Todas las transacciones de pago son procesadas directamente en los servidores seguros y encriptados de pasarelas de pago autorizadas y fiscalizadas por la Comisión para el Mercado Financiero (CMF), tales como Transbank (Webpay Plus) y MercadoPago. TapTrade solo recibe una confirmación digital cifrada del resultado del pago (aprobado o rechazado).
          </p>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 7: Transferencia a Terceros */}
      <LegalSection id="terceros-encargados" num={7} title="Comunicación de Datos a Terceros y Encargados del Tratamiento">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            Para hacer posible la entrega física de tus cartas y la operatividad del software, compartimos únicamente los datos estrictamente indispensables con los siguientes terceros:
          </p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#0B0E17] border border-white/10">
              <strong className="text-white text-sm block">1. Empresas de Transporte y Logística (Couriers Oficiales):</strong>
              <p className="text-xs text-gray-400 mt-1">
                Compartimos tu nombre, teléfono y dirección de despacho con <strong className="text-white">Starken</strong> y <strong className="text-white">Chilexpress</strong> para la emisión de la orden de transporte y entrega material del paquete.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0E17] border border-white/10">
              <strong className="text-white text-sm block">2. Tiendas Vendedoras del Marketplace (LGS):</strong>
              <p className="text-xs text-gray-400 mt-1">
                Cuando adquieres cartas de una tienda asociada, esta recibe exclusivamente los datos indispensables para rotular y empaquetar tu pedido, estando contractualmente obligada a respetar la confidencialidad de tu información.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0E17] border border-white/10">
              <strong className="text-white text-sm block">3. Proveedores de Infraestructura en la Nube:</strong>
              <p className="text-xs text-gray-400 mt-1">
                Servidores de base de datos y alojamiento web en la nube con certificaciones de seguridad ISO 27001 y SOC 2, operando bajo acuerdos de tratamiento de datos con altos estándares de cifrado.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red/10 border border-red/30 mt-2">
            <p className="text-xs text-red-light font-bold">
              🚫 Prohibición Absoluta de Comercialización: TapTrade NO vende, arrienda ni transfiere bajo ningún concepto tus datos personales a empresas de publicidad, telemarketing ni a terceros ajenos a la operación de la compra.
            </p>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 8: Derechos del Titular (ARCO+) */}
      <LegalSection id="derechos-arco" num={8} title="Derechos de los Titulares de Datos (Derechos ARCO+)">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            De conformidad con la <strong className="text-white">Nueva Ley de Protección de Datos Personales de Chile</strong>, todo usuario goza de los siguientes derechos inalienables y exigibles frente a TapTrade:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <span className="text-red">👁️</span> Derecho de Acceso
              </strong>
              <p className="text-xs text-gray-400 mt-1">Derecho a solicitar y recibir información gratuita sobre los datos personales tuyos que tratamos, su origen, finalidad y destinatarios.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <span className="text-amber-400">✏️</span> Derecho de Rectificación
              </strong>
              <p className="text-xs text-gray-400 mt-1">Derecho a exigir la corrección o actualización de tus datos personales cuando sean inexactos, incompletos o desactualizados.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <span className="text-rose-400">🗑️</span> Derecho de Cancelación / Supresión
              </strong>
              <p className="text-xs text-gray-400 mt-1">Derecho a solicitar la eliminación definitiva de tus datos personales cuando haya vencido el plazo legal o no exista deber de conservarlos.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <span className="text-blue-400">✋</span> Derecho de Oposición
              </strong>
              <p className="text-xs text-gray-400 mt-1">Derecho a oponerte en cualquier momento al uso de tus datos con fines de publicidad, ofertas especiales o mercadeo.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <span className="text-emerald-400">📦</span> Derecho de Portabilidad
              </strong>
              <p className="text-xs text-gray-400 mt-1">Derecho a recibir una copia de tus datos personales en formato digital estructurado, de uso común y lectura mecánica (JSON/CSV).</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <span className="text-purple-400">🛑</span> Derecho de Bloqueo
              </strong>
              <p className="text-xs text-gray-400 mt-1">Derecho a suspender temporalmente el uso de tus datos mientras se tramita una solicitud de rectificación o impugnación.</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 9: Procedimiento y Plazos */}
      <LegalSection id="procedimiento-derechos" num={9} title="Procedimiento y Plazos para Ejercer tus Derechos">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            Para ejercer cualquiera de tus derechos ARCO+, puedes hacerlo de forma <strong className="text-white">completamente gratuita</strong> a través de los siguientes canales:
          </p>

          <div className="bg-[#0B0E17] border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase block mb-1">Canal Exclusivo de Privacidad</span>
              <p className="text-sm font-bold text-white">Correo: privacidad@taptrade.cl</p>
              <p className="text-xs text-gray-400 mt-0.5">Asunto: "Ejercicio de Derechos ARCO+ - [Tu Nombre]"</p>
            </div>
            <a
              href="mailto:privacidad@taptrade.cl"
              className="bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl hover:brightness-110 transition-all shrink-0 shadow-lg shadow-red/20"
            >
              Contactar a Privacidad
            </a>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed mt-2">
            <strong className="text-white">Plazo Legal de Respuesta:</strong> Conforme al estándar legal chileno, TapTrade responderá y resolverá tu solicitud en un plazo máximo de <strong className="text-white">15 días hábiles</strong> contados desde la recepción de la misma. Para resguardar la identidad del titular, podremos solicitar una verificación fehaciente antes de proceder con la modificación o eliminación de la cuenta.
          </p>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 10: Autoridad de Control */}
      <LegalSection id="autoridad-control" num={10} title="Autoridad de Control y Reclamos ante el Estado">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            En caso de que consideres que tus derechos de protección de datos personales no han sido debidamente atendidos por TapTrade dentro del plazo legal, la legislación chilena te faculta expresamente para interponer un reclamo formal ante la autoridad estatal competente:
          </p>
          <div className="bg-[#111522] border border-white/10 p-5 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              🏛️ Agencia de Protección de Datos Personales (ANPD)
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Órgano estatal autónomo facultado por la ley para fiscalizar el cumplimiento de las normativas de datos personales, instruir sumarios e imponer sanciones a responsables que incumplan con sus deberes legales. Asimismo, podrás ejercer las acciones judiciales que correspondan ante los tribunales ordinarios de justicia de la República de Chile.
            </p>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 11: Seguridad y Brechas */}
      <LegalSection id="seguridad-brechas" num={11} title="Medidas de Seguridad y Protocolo ante Brechas">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            TapTrade implementa medidas técnicas y organizativas de última generación para evitar la pérdida, robo, alteración o acceso no autorizado a tus datos personales:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-xs sm:text-sm">
            <li><strong className="text-white">Cifrado Integral en Tránsito:</strong> Todo el tráfico entre tu navegador y la plataforma viaja protegido mediante certificados SSL/TLS con encriptación de 256 bits (HTTPS).</li>
            <li><strong className="text-white">Almacenamiento Seguro de Credenciales:</strong> Las contraseñas de usuario son procesadas con algoritmos de hashing unidireccional y salting (bcrypt). Ni el personal de soporte ni los administradores de TapTrade tienen acceso a tu clave en texto plano.</li>
            <li><strong className="text-white">Mitigación Anti-Bots:</strong> Integración de Cloudflare Turnstile para impedir ataques de fuerza bruta o relleno de credenciales.</li>
            <li><strong className="text-white">Notificación Proactiva de Incidentes:</strong> En el evento improbable de una vulneración o brecha de seguridad que afecte significativamente tus datos, TapTrade notificará a los usuarios afectados y a la autoridad reguladora en los plazos exigidos por la ley, detallando las medidas de mitigación adoptadas.</li>
          </ul>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 12: Conservación y Supresión */}
      <LegalSection id="plazo-conservacion" num={12} title="Plazo de Conservación y Supresión de Datos">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            Tus datos personales se conservarán únicamente durante el tiempo necesario para cumplir las finalidades descritas o según lo exijan los plazos legales:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-xs sm:text-sm">
            <li><strong className="text-white">Datos de Cuenta Activa:</strong> Se mantienen mientras tu cuenta permanezca activa en la plataforma.</li>
            <li><strong className="text-white">Datos Contables y Facturación (Obligación Legal):</strong> La información asociada a compras, boletas y facturas electrónicas se conserva durante el plazo legal de <strong className="text-white">6 años</strong> exigido por el Servicio de Impuestos Internos (SII) de Chile para efectos de auditoría tributaria y contable.</li>
            <li><strong className="text-white">Supresión Segura:</strong> Transcurrido dicho plazo o ante una solicitud válida de eliminación, los datos serán destruidos de forma segura o anonimizados para fines puramente estadísticos.</li>
          </ul>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 13: Cookies */}
      <LegalSection id="cookies-rastreo" num={13} title="Uso de Cookies y Tecnologías Similares">
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>
            TapTrade utiliza cookies técnicas esenciales para mantener tu sesión activa, recordar las cartas añadidas a tu carrito de compras y proteger el sitio contra accesos maliciosos.
          </p>
          <p className="text-xs text-gray-400">
            Puedes configurar o desactivar las cookies en cualquier momento desde las preferencias de tu navegador web. No obstante, ten en cuenta que la desactivación de cookies técnicas esenciales puede impedir el correcto funcionamiento del carrito de compras y el inicio de sesión en tu cuenta.
          </p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PoliticaPrivacidadClient;
