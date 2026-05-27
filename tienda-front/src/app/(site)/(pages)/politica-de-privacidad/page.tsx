import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "Política de Privacidad | Blood Moon Games",
  description: "Detalles y políticas de privacidad oficiales sobre el tratamiento de tus datos personales en Blood Moon Games.",
};

const PoliticaPrivacidadPage = () => {
  return (
    <>
      <Breadcrumb title="Política de Privacidad" pages={["Política de Privacidad"]} />
      
      <section className="bg-gray-2 py-15 lg:py-25">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-15 items-start">
            
            {/* Quick Navigation Sidebar */}
            <aside className="w-full lg:w-[280px] shrink-0 sticky top-[160px] bg-white rounded-lg shadow-1 p-6 hidden lg:block">
              <h3 className="font-bold text-dark text-base mb-4 border-b border-gray-3 pb-3">
                Navegación Rápida
              </h3>
              <ul className="flex flex-col gap-2.5 text-custom-sm text-gray-6 font-medium">
                <li>
                  <a href="#introduccion-privacidad" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    Introducción
                  </a>
                </li>
                <li>
                  <a href="#informacion-recopilada" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    1. Información Recopilada
                  </a>
                </li>
                <li>
                  <a href="#uso-informacion" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    2. Uso de la Información
                  </a>
                </li>
                <li>
                  <a href="#compartir-informacion" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    3. Compartir Información
                  </a>
                </li>
                <li>
                  <a href="#retencion-datos" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    4. Retención de Datos
                  </a>
                </li>
                <li>
                  <a href="#cambios-contacto" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3 font-semibold text-[#800D0D]">
                    5. Cambios y Contacto
                  </a>
                </li>
              </ul>
            </aside>

            {/* Document Content */}
            <article className="flex-1 bg-white rounded-lg shadow-1 p-6 sm:p-10 lg:p-12 w-full">
              
              {/* Header Box */}
              <div className="border-b border-gray-3 pb-8 mb-10">
                <div className="inline-block bg-[#800D0D]/10 text-[#800D0D] font-bold text-xs uppercase px-3 py-1 rounded-full mb-4">
                  Privacidad y Seguridad
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                  Política de Privacidad de Datos
                </h2>
                <p className="text-gray-5 text-custom-sm mt-2">
                  En Blood Moon Games nos tomamos muy en serio la seguridad y el resguardo de tu información personal.
                </p>
              </div>

              {/* INTRO */}
              <section id="introduccion-privacidad" className="mb-10 scroll-mt-[160px]">
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    Esta <strong className="text-dark">Política de Privacidad</strong> describe cómo se recopila, utiliza y comparte tu información personal cuando visitas o realizas una compra en nuestro portal web oficial <a href="https://www.bloodmoongames.cl" target="_blank" rel="noreferrer" className="text-blue font-semibold hover:underline">www.bloodmoongames.cl</a>.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 1 */}
              <section id="informacion-recopilada" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">1</span>
                  Qué Información Personal Recopilamos
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-4">
                  <p>
                    Cuando visitas el Sitio, recopilamos automáticamente cierta información sobre tu dispositivo, incluida información sobre tu navegador web, dirección IP, zona horaria y algunas de las cookies que están instaladas en tu dispositivo.
                  </p>
                  
                  <p>
                    Además, a medida que navegas por el Sitio, recopilamos información sobre las páginas web individuales o los productos que ves, qué sitios web o términos de búsqueda te remiten al Sitio, e información sobre cómo interactúas con la plataforma. Nos referimos a esta información recopilada automáticamente como <strong className="text-dark">Información del Dispositivo</strong>.
                  </p>

                  <div className="bg-gray-2 p-5 rounded-lg border-l-4 border-[#800D0D] flex flex-col gap-3">
                    <p className="font-bold text-dark mb-1">🛠️ Tecnologías que utilizamos para recopilar esta información:</p>
                    <ul className="list-disc pl-5 flex flex-col gap-2">
                      <li>
                        <strong className="text-dark">Cookies:</strong> Son pequeños archivos de datos que se colocan en tu dispositivo o computadora y con frecuencia incluyen un identificador único anónimo.
                      </li>
                      <li>
                        <strong className="text-dark">Archivos de registro (Log Files):</strong> Rastrean las acciones que ocurren en el Sitio y recopilan datos esenciales, incluida tu dirección IP, el tipo de navegador, el proveedor de servicios de Internet (ISP), las páginas de referencia/salida y las marcas exactas de fecha y hora.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-dark text-white p-5 rounded-lg border-l-4 border-blue flex flex-col gap-3">
                    <p className="font-bold text-blue mb-1">🛒 Información de Compras e Historial (Información del Pedido):</p>
                    <p className="text-gray-3">
                      Cuando efectúas una compra o intentas realizar una compra a través del Sitio, recopilamos de forma segura ciertos datos tuyos indispensables para la transacción: tu <strong className="text-white">nombre completo</strong>, <strong className="text-white">dirección de facturación</strong>, <strong className="text-white">dirección de envío</strong>, <strong className="text-white">información de pago</strong>, <strong className="text-white">dirección de correo electrónico</strong> y tu <strong className="text-white">número de teléfono de contacto</strong>.
                    </p>
                  </div>

                  <p>
                    Al referirnos a <strong className="text-dark">Información Personal</strong> en esta Política de Privacidad, estamos englobando tanto la <strong className="text-dark">Información del Dispositivo</strong> como la <strong className="text-dark">Información del Pedido</strong> recopiladas anteriormente.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 2 */}
              <section id="uso-informacion" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">2</span>
                  Cómo Usamos tu Información Personal
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-4">
                  <p>
                    Utilizamos la <strong className="text-dark">Información del Pedido</strong> que recopilamos por lo general para cumplir con los pedidos realizados a través del Sitio (incluido el procesamiento de tu información de pago, la organización logística del envío, y la entrega oportuna de boletas, facturas y/o confirmaciones de pedidos).
                  </p>
                  
                  <div>
                    <strong className="text-dark">Adicionalmente, usamos esta Información del Pedido para:</strong>
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
                      <li>Establecer comunicación directa y oportuna contigo sobre el estado de tu pedido.</li>
                      <li>Examinar y validar nuestros pedidos para detectar y prevenir de forma proactiva posibles riesgos o fraudes transaccionales.</li>
                      <li>Ofrecerte información y publicidad selectiva relacionada con nuestros productos, ofertas especiales o servicios (en línea con las preferencias de boletines informativos que has compartido voluntariamente con nosotros).</li>
                    </ul>
                  </div>

                  <p>
                    Utilizamos la <strong className="text-dark">Información del Dispositivo</strong> que recopilamos para ayudarnos a detectar posibles riesgos y fraudes (en particular, tu dirección IP) y, en general, para mejorar, depurar y optimizar el rendimiento y la experiencia de usuario de nuestra tienda online.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 3 */}
              <section id="compartir-informacion" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">3</span>
                  Compartiendo tu Información Personal
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-4">
                  <p>
                    Compartimos tu Información Personal con terceros proveedores logísticos, pasarelas de pago autorizadas y servicios analíticos para ayudarnos a utilizarla exactamente como se describió anteriormente. Por ejemplo, utilizamos nuestra pasarela para procesar transacciones bancarias de forma segura, y empresas de courier asociadas para que tu correspondencia llegue a destino.
                  </p>
                  
                  <div className="bg-[#800D0D]/5 border border-[#800D0D]/10 p-4.5 rounded">
                    <p className="font-semibold text-dark mb-1">📊 Google Analytics:</p>
                    <p>
                      También empleamos la herramienta de <strong className="text-dark">Google Analytics</strong> para ayudarnos a comprender y analizar cómo interactúan nuestros clientes con Blood Moon Games, facilitándonos información para mejorar el inventario de cartas sueltas y productos. Puedes informarte sobre cómo usa Google tu información en sus términos oficiales de privacidad.
                    </p>
                  </div>

                  <p>
                    Finalmente, también podemos divulgar o compartir tu Información Personal en situaciones especiales para cumplir cabalmente con las leyes y regulaciones aplicables en Chile, responder a requerimientos legales de la autoridad competente (como una citación judicial o una orden de registro oficial), o bien para proteger y defender legítimamente nuestros derechos legales de propiedad.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 4 */}
              <section id="retencion-datos" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">4</span>
                  Retención de Datos
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    Cuando realices un pedido a través del Sitio, mantendremos la <strong className="text-dark">Información de Pedido</strong> en nuestros registros administrativos y contables de forma segura con el fin de procesar garantías, acumulaciones de créditos o validación de transacciones, a menos y hasta que nos solicites expresamente la eliminación parcial o total de esta información mediante nuestros canales oficiales.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 5 */}
              <section id="cambios-contacto" className="mb-10 scroll-mt-[160px] bg-[#800D0D]/5 border border-[#800D0D]/20 rounded-lg p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">5</span>
                  Cambios en las Políticas y Contacto
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-4">
                  <p>
                    Podemos actualizar esta política de privacidad periódicamente para reflejar, por ejemplo, cambios en nuestras prácticas operativas internas, mejoras de seguridad, o bien por otras razones de índole operativa, legal o reglamentaria de acuerdo al marco legal en Chile.
                  </p>
                  
                  <div className="bg-white p-4.5 rounded shadow-sm border border-gray-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-bold text-dark">✉️ ¿Tienes dudas o preguntas?</p>
                      <p className="text-xs text-gray-5">Escríbenos directamente y te responderemos a la brevedad.</p>
                    </div>
                    <a href="mailto:tiendabloodmoon@gmail.com" className="bg-[#800D0D] hover:bg-dark text-white font-bold text-custom-sm py-2 px-4 rounded transition duration-200">
                      tiendabloodmoon@gmail.com
                    </a>
                  </div>
                </div>
              </section>

              {/* Footer Box */}
              <div className="border-t border-gray-3 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-custom-xs text-gray-5 font-semibold">
                  Última Actualización: 01 de Enero de 2025
                </span>
                <Link href="/shop" className="text-custom-sm text-blue font-bold hover:underline">
                  Volver a la Tienda &rarr;
                </Link>
              </div>

            </article>

          </div>

        </div>
      </section>
    </>
  );
};

export default PoliticaPrivacidadPage;
