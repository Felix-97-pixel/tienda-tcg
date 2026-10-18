"use client";
import React, { useState } from "react";
import Link from "next/link";
import LegalPageLayout, { LegalLink } from "@/components/layout/LegalPageLayout";
import LegalSection from "@/components/layout/LegalSection";
import {
  IconShieldCheck,
  IconStore,
  IconCard,
  IconTruck,
  IconCreditCard,
  IconZap,
  IconSparkles,
} from "@/components/ui/Icons";

const TerminosCondicionesClient = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const sidebarLinks: LegalLink[] = [
    { id: "introduccion", label: "1. Introducción y Partes" },
    { id: "modelo-negocio", label: "2. Modelo SaaS y Marketplace" },
    { id: "registro-cuentas", label: "3. Registro y Verificación KYC" },
    { id: "precios-pagos", label: "4. Precios, Modelo SaaS y Pagos" },
    { id: "graduacion-autenticidad", label: "5. Graduación y Autenticidad" },
    { id: "logistica-envios", label: "6. Envíos y Retiro Presencial" },
    { id: "buylist-creditos", label: "7. Buylist y Store Credit" },
    { id: "garantias-devoluciones", label: "8. Garantía y No Retracto" },
    { id: "propiedad-intelectual", label: "9. Marcas y Propiedad Intelectual" },
    { id: "privacidad-datos", label: "10. Protección de Datos Personales" },
    { id: "responsabilidad-indemnidad", label: "11. Responsabilidad e Indemnidad" },
    { id: "jurisdiccion-ley", label: "12. Ley Aplicable y Jurisdicción" },
  ];

  return (
    <LegalPageLayout
      title="Términos y Condiciones | TapTrade Chile"
      navTitle="Índice de Cláusulas"
      links={sidebarLinks}
      lastUpdated="Última actualización: 15 de Octubre de 2026"
      backToShopText="Volver al Marketplace"
    >
      {/* Header Overview Card */}
      <div className="border-b border-white/10 pb-8 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#E10E0E]/20 text-[#E10E0E] border border-[#E10E0E]/40 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10E0E] animate-pulse"></span>
            Plataforma Oficial SaaS & Marketplace
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
            RUT 78.531.106-K • Chile
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          Términos, Condiciones y Políticas de Operación
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed">
          El presente contrato marco regula el acceso, registro y utilización de la infraestructura tecnológica, pasarela de software y servicios de marketplace multi-tienda de <strong className="text-white">TAPTRADE SpA</strong>. Aplica de manera vinculante a compradores, tiendas adheridas (LGS) y usuarios del motor de Buylist.
        </p>

        {/* Legal Identity Pill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Razón Social</span>
            <span className="text-xs font-bold text-white block mt-0.5">TAPTRADE SpA</span>
            <span className="text-[11px] font-mono text-gray-500">RUT: 78.531.106-K</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Domicilio y Jurisdicción</span>
            <span className="text-xs font-bold text-white block mt-0.5">Padre Mariano 98 Of. 315</span>
            <span className="text-[11px] font-mono text-gray-500">Providencia, Santiago de Chile</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Canales Oficiales</span>
            <span className="text-xs font-bold text-white block mt-0.5">legal@taptrade.cl</span>
            <span className="text-[11px] font-mono text-gray-500">soporte@taptrade.cl</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 text-gray-300">
        {/* =========================================================================
            SECCIÓN 1: INTRODUCCIÓN
           ========================================================================= */}
        <LegalSection id="introduccion" num={1} title="Introducción, Partes y Aceptación Vinculante">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">1.1. Naturaleza del Contrato:</strong> Este documento constituye un acuerdo legal vinculante celebrado entre el Usuario y <strong>TAPTRADE SpA</strong> (en adelante, "TapTrade" o "la Plataforma"). El acceso, navegación, registro o ejecución de cualquier orden de compra o venta en el dominio principal (<Link href="/" className="text-red-400 hover:underline">taptrade.cl</Link>), sus subdominios asociados (ej. <code className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded text-gray-300">[tienda].taptrade.cl</code>) y APIs satélites implica la aceptación íntegra de estas disposiciones.
            </p>
            <p>
              <strong className="text-white font-mono">1.2. Categorías de Usuarios:</strong> La Plataforma distingue tres perfiles de usuarios:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
              <li><strong className="text-white">Compradores:</strong> Personas naturales o jurídicas que adquieren cartas sueltas ("Singles"), cajas selladas o accesorios mediante el catálogo unificado.</li>
              <li><strong className="text-white">Tiendas Adheridas / Vendedores (LGS):</strong> Comercios establecidos o dealers autorizados con RUT chileno que gestionan inventario y venden a través de la infraestructura SaaS.</li>
              <li><strong className="text-white">Usuarios de Buylist:</strong> Coleccionistas que venden cartas directamente a tiendas adheridas a cambio de dinero o Crédito en Tienda.</li>
            </ul>
            <p>
              <strong className="text-white font-mono">1.3. Capacidad Legal:</strong> Los servicios de TapTrade están restringidos a personas mayores de 18 años con plena capacidad jurídica para celebrar actos de comercio bajo las leyes de la República de Chile.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 2: MODELO DE NEGOCIO SAAS Y MARKETPLACE
           ========================================================================= */}
        <LegalSection id="modelo-negocio" num={2} title="Modelo de Negocio (Marketplace SaaS Multi-Tenant)">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">2.1. Intermediación Tecnológica:</strong> TapTrade opera como un proveedor de Software como Servicio (SaaS) y facilitador de marketplace. Provee la tecnología para catálogo sincronizado (Scryfall, Pokémon TCG API, Riftcodex), carrito multi-tienda, procesamiento de pagos consolidados y generación de etiquetas de transporte.
            </p>
            <p>
              <strong className="text-white font-mono">2.2. Autonomía Contractual de las Tiendas:</strong> Salvo indicación expresa de inventario propio de TapTrade SpA, <strong>la relación de compraventa se perfecciona directa y exclusivamente entre la Tienda Adherida vendedora y el Comprador</strong>. La tienda es la responsable material y tributaria de la custodia física, embalaje, graduación del estado de conservación y emisión de la respectiva boleta o factura de venta.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
              <IconStore className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block mb-0.5">Tiendas con Identidad Propia</span>
                Cada tienda opera con sus propias políticas comerciales, direcciones de despacho y horarios de atención, las cuales son informadas de forma transparente en su vitrina o subdominio particular.
              </div>
            </div>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 3: REGISTRO Y KYC
           ========================================================================= */}
        <LegalSection id="registro-cuentas" num={3} title="Registro, Seguridad y Verificación KYC de Tiendas">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">3.1. Cuentas de Usuario:</strong> Los usuarios deben proveer información fidedigna, completa y vigente al registrarse. Queda prohibida la suplantación de identidad o la creación de cuentas múltiples con fines fraudulentos.
            </p>
            <p>
              <strong className="text-white font-mono">3.2. Verificación Legal de Tiendas (KYC):</strong> Para habilitar una tienda, recibir pagos y vender al público, el titular debe acreditar:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
              <li>RUT chileno vigente (persona natural o jurídica constituida en Chile).</li>
              <li>Inicio de Actividades ante el Servicio de Impuestos Internos (SII) en 1ra Categoría con giros compatibles con comercio minorista o electrónico.</li>
              <li>Titularidad de una cuenta bancaria comercial en una entidad financiera regulada en Chile.</li>
            </ul>
            <p>
              TapTrade se reserva el derecho de auditar, suspender o dar de baja tiendas que no cumplan con los estándares tributarios o de autenticidad exigidos.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 4: PRECIOS, MODELO SAAS Y LIQUIDACIÓN DIRECTA
           ========================================================================= */}
        <LegalSection id="precios-pagos" num={4} title="Precios, Modelo SaaS de Suscripción y Cero Comisión (0% Take Rate)">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">4.1. Moneda Oficial e Impuestos:</strong> Todos los precios fijados por las tiendas en la plataforma están expresados en Pesos Chilenos (CLP) o calculados según la tasa de cambio vigente de la tienda, e incluyen el IVA que corresponde legalmente a la venta de bienes en Chile.
            </p>
            <p>
              <strong className="text-white font-mono">4.2. Cero Comisión por Venta (Take Rate 0%):</strong> TapTrade descarta por completo el cobro de comisiones sobre las transacciones de cartas o productos. El 100% del subtotal de venta y los costos de envío van directamente a la tienda vendedora, sin recargos ocultos ni intermediación monetaria en las ventas.
            </p>
            <p>
              <strong className="text-white font-mono">4.3. Modelo de Monetización por Suscripción Fija (SaaS):</strong> El modelo de ingresos de TapTrade se basa exclusivamente en el cobro de una cuota mensual fija por el uso del software, catálogos e infraestructura tecnológica, con planes escalonados según el límite de cartas sincronizadas:
            </p>

            {/* Plans Table */}
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-gray-300 font-mono uppercase">
                  <tr>
                    <th className="p-3 border-b border-white/10">Plan SaaS</th>
                    <th className="p-3 border-b border-white/10">Cuota Base</th>
                    <th className="p-3 border-b border-white/10">Límite Catálogo</th>
                    <th className="p-3 border-b border-white/10">Comisión por Venta</th>
                    <th className="p-3 border-b border-white/10">Abono a Tienda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">Starter (Pequeña Tienda)</td>
                    <td className="p-3 font-mono font-bold text-white">1.5 UF/mes</td>
                    <td className="p-3 font-mono">1.500 cartas</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">0%</td>
                    <td className="p-3 text-emerald-400 font-bold">100% de Ventas + Envíos</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">Store (Crecimiento)</td>
                    <td className="p-3 font-mono font-bold text-white">3.5 UF/mes</td>
                    <td className="p-3 font-mono">7.500 cartas</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">0%</td>
                    <td className="p-3 text-emerald-400 font-bold">100% de Ventas + Envíos</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">Pioneras / Pro (Early Adopter)</td>
                    <td className="p-3 font-mono font-bold text-white">10 UF (5 UF con desc.)</td>
                    <td className="p-3 font-mono">20.000 cartas</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">0%</td>
                    <td className="p-3 text-emerald-400 font-bold">100% de Ventas + Envíos</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">Enterprise</td>
                    <td className="p-3 font-mono font-bold text-white">15 UF (7.5 UF con desc.)</td>
                    <td className="p-3 font-mono">Ilimitado</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">0%</td>
                    <td className="p-3 text-emerald-400 font-bold">100% de Ventas + Envíos</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong className="text-white font-mono">4.4. Descuentos y Condiciones Especiales:</strong> La administración de TapTrade podrá acordar y configurar en el sistema porcentajes o montos de descuento preferencial sobre la cuota mensual de software para tiendas pioneras o acuerdos comerciales específicos.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 5: GRADUACIÓN Y AUTENTICIDAD
           ========================================================================= */}
        <LegalSection id="graduacion-autenticidad" num={5} title="Estándares de Graduación TCG y Tolerancia Cero a Falsificaciones">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">5.1. Estándar Oficial de Graduación (Condition):</strong> Para garantizar la uniformidad en todo el mercado chileno, todas las cartas publicadas deben someterse a la siguiente escala:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    NM (Near Mint)
                  </span>
                  <span className="font-bold text-white">Estado Impecable</span>
                </div>
                <p className="text-gray-400">Sin desgaste visible por uso. Admite mínimos microrroces de corte o embalaje de fábrica difícilmente perceptibles.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    LP (Lightly Played)
                  </span>
                  <span className="font-bold text-white">Uso Muy Leve</span>
                </div>
                <p className="text-gray-400">Leve desgaste en bordes (edgewear fino) o pequeños roces superficiales, imperceptibles dentro de un folio protector.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    MP (Moderately Played)
                  </span>
                  <span className="font-bold text-white">Uso Moderado</span>
                </div>
                <p className="text-gray-400">Desgaste visible por juego constante en esquinas y bordes, pérdida de brillo o marcas moderadas sin pliegues estructurales.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    HP (Heavily Played)
                  </span>
                  <span className="font-bold text-white">Uso Intenso</span>
                </div>
                <p className="text-gray-400">Desgaste severo, blanqueamiento marcado de bordes (whitening) o arrugas menores. Apta para torneos con doble funda opaca.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                    DMG (Damaged)
                  </span>
                  <span className="font-bold text-white">Carta Dañada</span>
                </div>
                <p className="text-gray-400">Rasgaduras, pliegues pronunciados, manchas de tinta, daño por humedad o deformaciones estructurales evidentes.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 flex items-start gap-3 mt-2">
              <IconShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block mb-0.5">Tolerancia Cero a Cartas Falsificadas</span>
                Queda terminantemente prohibida la comercialización de reproducciones no autorizadas, cartas apócrifas o proxies no declarados. La venta de material no auténtico causará el bloqueo fulminante de la tienda infractora, el reembolso íntegro al comprador y la entrega de antecedentes a tribunales y autoridades competentes.
              </div>
            </div>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 6: LOGÍSTICA Y ENVÍOS
           ========================================================================= */}
        <LegalSection id="logistica-envios" num={6} title="Logística, Envíos Integrados y Retiro Presencial">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">6.1. Operadores Logísticos Oficiales:</strong> TapTrade opera sincronizado con las APIs oficiales de <strong>Chilexpress</strong> y <strong>Starken</strong>, cotizando dinámicamente el flete según peso, dimensiones y distancia geográfica entre el origen de la tienda y el destino del comprador.
            </p>
            <p>
              <strong className="text-white font-mono">6.2. Retiro Presencial Gratuito ($0 CLP):</strong> Cuando una tienda disponga de local comercial físico, el comprador puede optar por retirar sus cartas sin costo de envío presentando su documento de identidad y el número de orden de compra.
            </p>
            <p>
              <strong className="text-white font-mono">6.3. Plazo de Embalaje Seguro:</strong> Las tiendas adheridas disponen de un plazo perentorio de <strong>24 a 48 horas hábiles</strong> para despachar las cartas protegidas en fundas y protectores semirrígidos o toploaders para evitar dobleces o daños por fricción en tránsito.
            </p>
            <p>
              <strong className="text-white font-mono">6.4. Siniestros en Tránsito:</strong> En caso de extravío o daño atribuible a la empresa de mensajería durante el trayecto, TapTrade gestionará el reclamo formal ante el operador logístico, garantizando la indemnización o devolución de fondos al comprador.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 7: BUYLIST Y CRÉDITO DE TIENDA
           ========================================================================= */}
        <LegalSection id="buylist-creditos" num={7} title="Motor de Buylist y Billetera de Créditos de Tienda (Store Credit)">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">7.1. Compra de Singles a Usuarios:</strong> El motor de Buylist permite a los coleccionistas vender sus cartas a tiendas registradas aplicando factores automáticos de devaluación según condición e idioma. La tienda tiene derecho a verificar físicamente el estado de las cartas al recibirlas antes de transferir el pago definitivo.
            </p>
            <p>
              <strong className="text-white font-mono">7.2. Naturaleza del Store Credit:</strong> Cuando la liquidación de Buylist se realiza en "Crédito de Tienda":
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
              <li>El saldo queda registrado en la billetera virtual del usuario y es <strong>redimible exclusivamente en compras dentro del catálogo de la misma Tienda Adherida que lo emitió</strong>.</li>
              <li>No es canjeable por dinero en efectivo directamente ante TapTrade SpA ni es transferible a cuentas de otras tiendas.</li>
              <li>La tienda emisora es patrimonialmente responsable de garantizar la disponibilidad de catálogo para la redención de los créditos emitidos.</li>
            </ul>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 8: GARANTÍA Y RETRACTO
           ========================================================================= */}
        <LegalSection id="garantias-devoluciones" num={8} title="Garantía Legal, No Retracto en Singles y Devoluciones">
          <div className="flex flex-col gap-3.5">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs">
              <span className="font-bold text-amber-300 block mb-1">⚖️ Exclusión Legal del Derecho a Retracto en Cartas Sueltas</span>
              En virtud del artículo 3° bis letra b) de la <strong>Ley N° 19.496 sobre Protección de los Derechos de los Consumidores</strong>, el derecho a retracto unilateral no aplica a la compra de cartas coleccionables (Singles), por tratarse de bienes cuyo valor está sujeto a fluctuaciones inmediatas de mercados secundarios independientes, ni a productos sellados que hayan sido abiertos o desprecintados.
            </div>

            <p>
              <strong className="text-white font-mono">8.1. Garantía Legal por No Conformidad:</strong> Si una carta recibida presenta defectos de fábrica no informados o una discrepancia evidente e injustificable frente a la condición contratada (ej. se pagó una carta Near Mint y se entregó un ejemplar con daño marcado):
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-sm">
              <li>El comprador debe reportar el caso a <strong className="text-white">soporte@taptrade.cl</strong> dentro de las <strong>48 horas corridas</strong> posteriores a la entrega.</li>
              <li>Debe adjuntar fotografías nítidas y detalladas de la carta, sellos y embalaje original.</li>
              <li>Acreditada la no conformidad, el comprador tiene derecho a la sustitución del ejemplar o al reembolso total de su dinero.</li>
            </ul>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 9: PROPIEDAD INTELECTUAL
           ========================================================================= */}
        <LegalSection id="propiedad-intelectual" num={9} title="Propiedad Intelectual y Doctrina de Agotamiento de Marca">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">9.1. Derechos de TapTrade SpA:</strong> El código informático, diseño visual, marca comercial "TapTrade", logotipos, interfaces, algoritmos y bases de datos son propiedad intelectual exclusiva de TAPTRADE SpA protegida por la Ley N° 17.336.
            </p>
            <p>
              <strong className="text-white font-mono">9.2. Marcas de Terceros y Doctrina de Agotamiento:</strong> Todos los nombres comerciales, franquicias, personajes y logotipos de juegos mencionados en la plataforma, incluidos:
            </p>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400">
              • <em>Magic: The Gathering</em> (Wizards of the Coast / Hasbro) • <em>Pokémon TCG</em> (Nintendo / Creatures / Game Freak / The Pokémon Company) • <em>Yu-Gi-Oh!</em> (Konami / Kazuki Takahashi) • <em>Riftbound TCG</em> (Riftbound Games) • <em>One Piece Card Game</em> (Bandai / Eiichiro Oda / Shueisha) • <em>Mitos y Leyendas</em> (Klu / Fenix)
            </div>
            <p className="text-xs text-gray-400">
              Pertenecen a sus respectivos titulares. TapTrade SpA es una entidad tecnológica independiente y no posee afiliación corporativa con dichas compañías. Su uso en la plataforma tiene fines exclusivamente identificatorios, referenciales y descriptivos para la comercialización lícita en el mercado secundario bajo la doctrina universal de agotamiento marcario.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 10: PROTECCIÓN DE DATOS
           ========================================================================= */}
        <LegalSection id="privacidad-datos" num={10} title="Protección de Datos Personales y Privacidad">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">10.1. Marco Legal y Principios:</strong> TapTrade trata los datos personales de conformidad con la Nueva Ley de Protección de Datos Personales de Chile (Boletín N° 11.144-07 / Ley N° 19.628 reformada). La información se recolecta exclusivamente para la ejecución del contrato de compraventa, coordinación logística de envíos y emisión de boletas o facturas ante el Servicio de Impuestos Internos (SII).
            </p>
            <p>
              <strong className="text-white font-mono">10.2. Derechos ARCO+ y No Comercialización:</strong> Los titulares de datos gozan de los derechos de Acceso, Rectificación, Cancelación, Oposición, Portabilidad y Bloqueo, los cuales pueden ejercer gratuitamente en <a href="mailto:privacidad@taptrade.cl" className="text-emerald-400 underline font-semibold">privacidad@taptrade.cl</a>. TapTrade no vende, no comercializa ni arrienda información de usuarios a terceros ajenos a la operación transaccional y logística indispensable. Los detalles completos se encuentran descritos en nuestra <Link href="/politica-de-privacidad" className="text-red-light underline font-bold hover:text-white">Política de Privacidad</Link>.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 11: RESPONSABILIDAD
           ========================================================================= */}
        <LegalSection id="responsabilidad-indemnidad" num={11} title="Limitación de Responsabilidad e Indemnidad">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">11.1. Disponibilidad del Sistema:</strong> TapTrade realiza sus mayores esfuerzos técnicos para asegurar la continuidad del servicio, pero no responde por caídas originadas por cortes de conectividad internacional, fallas de terceros proveedores o fuerza mayor.
            </p>
            <p>
              <strong className="text-white font-mono">11.2. Límite Cuantitativo:</strong> En la medida que la ley chilena lo permita, la responsabilidad civil extracontractual o contractual de TapTrade SpA frente a las tiendas estará limitada como tope máximo al monto correspondiente a la última cuota mensual de suscripción SaaS pagada por la tienda afectada.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* =========================================================================
            SECCIÓN 12: JURISDICCIÓN
           ========================================================================= */}
        <LegalSection id="jurisdiccion-ley" num={12} title="Ley Aplicable, Domicilio Especial y Jurisdicción">
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">12.1. Legislación Aplicable:</strong> El presente acuerdo se rige, interpreta y ejecuta bajo las leyes vigentes de la República de Chile.
            </p>
            <p>
              <strong className="text-white font-mono">12.2. Tribunales de Santiago:</strong> Para todos los efectos legales emergentes del uso de la plataforma o de la validez e interpretación de este contrato, las partes fijan domicilio en la comuna de Santiago de Chile y se someten a la competencia de sus Tribunales Ordinarios de Justicia.
            </p>

            <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white block">¿Consultas Legales o Regulatorias?</span>
                <span className="text-xs text-gray-400">Nuestro equipo jurídico y tributario responde a la brevedad.</span>
              </div>
              <a
                href="mailto:legal@taptrade.cl"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-md shadow-[#E10E0E]/20 transition-all shrink-0"
              >
                Contactar a legal@taptrade.cl
              </a>
            </div>
          </div>
        </LegalSection>
      </div>
    </LegalPageLayout>
  );
};

export default TerminosCondicionesClient;
