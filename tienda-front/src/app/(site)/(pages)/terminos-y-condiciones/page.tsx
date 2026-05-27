import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Blood Moon Games",
  description: "Políticas, términos y condiciones oficiales para compras, envíos, devoluciones y créditos de tienda en Blood Moon Games.",
};

const TerminosCondicionesPage = () => {
  return (
    <>
      <Breadcrumb title="Términos y Condiciones" pages={["Términos y Condiciones"]} />
      
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
                  <a href="#introduccion" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    1. Introducción
                  </a>
                </li>
                <li>
                  <a href="#informacion" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    2. Información de la Tienda
                  </a>
                </li>
                <li>
                  <a href="#precios-pagos" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    3. Precios y Pagos
                  </a>
                </li>
                <li>
                  <a href="#envios-entregas" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    4. Envíos y Entregas
                  </a>
                </li>
                <li>
                  <a href="#devoluciones" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    5. Devoluciones y Reembolsos
                  </a>
                </li>
                <li>
                  <a href="#privacidad" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    6. Privacidad
                  </a>
                </li>
                <li>
                  <a href="#responsabilidad" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    7. Limitación de Responsabilidad
                  </a>
                </li>
                <li>
                  <a href="#ley-aplicable" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    8. Ley y Jurisdicción
                  </a>
                </li>
                <li>
                  <a href="#disposiciones-generales" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3">
                    9. Disposiciones Generales
                  </a>
                </li>
                <li>
                  <a href="#creditos-tienda" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3 font-semibold text-blue">
                    10. Créditos de Tienda
                  </a>
                </li>
                <li>
                  <a href="#transferencias" className="hover:text-blue transition-colors block py-1 border-l-2 border-transparent hover:border-blue pl-3 font-semibold text-[#800D0D]">
                    Transferencias Bancarias
                  </a>
                </li>
              </ul>
            </aside>

            {/* Document Content */}
            <article className="flex-1 bg-white rounded-lg shadow-1 p-6 sm:p-10 lg:p-12 w-full">
              
              {/* Header Box */}
              <div className="border-b border-gray-3 pb-8 mb-10">
                <div className="inline-block bg-[#800D0D]/10 text-[#800D0D] font-bold text-xs uppercase px-3 py-1 rounded-full mb-4">
                  Políticas Oficiales
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                  Términos, Condiciones y Políticas de Compra
                </h2>
                <p className="text-gray-5 text-custom-sm mt-2">
                  Por favor, lee detalladamente los siguientes términos antes de realizar una transacción.
                </p>
              </div>

              {/* SECTION 1 */}
              <section id="introduccion" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">1</span>
                  Introducción
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">1.1</strong> Bienvenido a <strong className="text-dark">Blood Moon Games</strong>, una tienda Online dedicada a la venta de cartas sueltas de juegos de cartas coleccionables. Estas políticas, términos y condiciones se aplican a todas las compras realizadas en nuestra tienda Online. Al hacer una compra, usted acepta estas políticas, términos y condiciones. Si no está de acuerdo con alguna de ellas, no podrá realizar una compra en nuestra tienda.
                  </p>
                  <p>
                    <strong className="text-dark">1.2</strong> Nos reservamos el derecho de actualizar, modificar o cambiar estas políticas, términos y condiciones en cualquier momento y sin previo aviso. Es responsabilidad del usuario revisar periódicamente estos términos y condiciones para estar al tanto de cualquier cambio.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 2 */}
              <section id="informacion" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">2</span>
                  Información de la Tienda
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">2.1</strong> Blood Moon Games es propiedad de <strong className="text-dark">BMG Spa 77930277-6</strong>, registrada en Chile.
                  </p>
                  <p>
                    <strong className="text-dark">2.2</strong> Nuestra tienda Online está ubicada en la Región Metropolitana. Si necesita comunicarse con nosotros, puede hacerlo a través de nuestro correo electrónico <a href="mailto:tiendabloodmoon@gmail.com" className="text-blue underline font-semibold">tiendabloodmoon@gmail.com</a> o por nuestros canales oficiales de contacto.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 3 */}
              <section id="precios-pagos" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">3</span>
                  Precios y Pagos
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">3.1</strong> Todos los precios que aparecen en nuestra tienda virtual están expresados en <strong className="text-dark">Pesos Chilenos (CLP)</strong> e incluyen el Impuesto al Valor Agregado (IVA).
                  </p>
                  <p>
                    <strong className="text-dark">3.2</strong> Aceptamos las siguientes formas de pago electrónicas autorizadas: Débito y Crédito (a través de pasarelas de pago seguras).
                  </p>
                  <p>
                    <strong className="text-dark">3.3</strong> El pago se realizará íntegramente en el momento de la compra. Una vez que se haya procesado y verificado el pago con éxito, se enviará un correo electrónico de confirmación automática al usuario.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 4 */}
              <section id="envios-entregas" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">4</span>
                  Envíos y Entregas
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">4.1</strong> Los productos se enviarán a la dirección exacta proporcionada por el usuario en el momento de la compra. El costo de envío se calculará de forma automática en función de la dirección de entrega seleccionada y del peso del paquete.
                  </p>
                  <p>
                    <strong className="text-dark">4.2</strong> Hacemos todo lo posible para despachar y entregar los productos en el plazo indicado en la descripción de cada tipo de Envío. Sin embargo, no nos hacemos responsables de los retrasos operativos causados directamente por la empresa proveedora de servicios de envío.
                  </p>
                  <p>
                    <strong className="text-dark">4.3</strong> El usuario es estrictamente responsable de proporcionar una dirección de entrega precisa, vigente y completa. Si el paquete es devuelto a nuestras instalaciones debido a una dirección incorrecta o incompleta, el usuario deberá asumir la totalidad de los costos asociados al reenvío del paquete.
                  </p>
                  <div className="bg-gray-2 border-l-4 border-blue p-4.5 rounded-r-[5px] mt-2">
                    <p className="font-semibold text-dark mb-1">⏰ Horarios de Despacho y Retiro:</p>
                    <p className="text-custom-sm">
                      <strong className="text-dark">4.4</strong> Las compras realizadas <strong className="text-dark">antes de las 14:00 hrs</strong> pueden ser retiradas en tienda o enviadas el mismo día en que se realizaron, a partir de las <strong className="text-dark">16:00 hrs</strong>. Si la compra se efectúa después de ese horario, el retiro o envío se programará para el día hábil siguiente, condicionado a la disponibilidad de recolección de los proveedores logísticos.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 5 */}
              <section id="devoluciones" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">5</span>
                  Devoluciones y Reembolsos
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">5.1</strong> Si el usuario no está completamente satisfecho con su compra, dispone de un plazo legal de <strong className="text-dark">5 días continuos</strong> a partir de la fecha de entrega para devolver el producto. Para que proceda la devolución, el producto debe estar en idénticas condiciones en que fue recibido, sin señales de uso, con sellos intactos y en su embalaje original.
                  </p>
                  <p>
                    <strong className="text-dark">5.2</strong> El usuario deberá asumir los costos de envío para proceder con la devolución del artículo. Una vez que hayamos recibido y verificado el estado del producto en nuestra tienda, realizaremos el reembolso completo en un plazo de <strong className="text-dark">3 días hábiles</strong> si el pago fue mediante Crédito, y de <strong className="text-dark">6 días hábiles</strong> si se pagó con Débito.
                  </p>
                  <p>
                    <strong className="text-dark">5.3</strong> No se aceptarán devoluciones bajo ningún concepto de productos personalizados, cartas sueltas alteradas, ni productos que hayan sido abiertos o utilizados.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 6 */}
              <section id="privacidad" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">6</span>
                  Privacidad
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">6.1</strong> Nos comprometemos al resguardo y protección absoluta de la privacidad de los datos personales de nuestros usuarios. Para obtener información detallada respecto al tratamiento, almacenamiento y uso de su información de registro, le invitamos a consultar nuestra Política de Privacidad.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 7 */}
              <section id="responsabilidad" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">7</span>
                  Limitación de Responsabilidad
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">7.1</strong> No nos hacemos responsables de ningún tipo de daño directo, indirecto, incidental, especial o emergente que se derive del uso o de la imposibilidad de uso técnico de nuestra tienda virtual.
                  </p>
                  <p>
                    <strong className="text-dark">7.2</strong> No podemos garantizar que la plataforma web esté completamente libre de fallos tipográficos, interrupciones o malware de terceros, aunque aplicamos los estándares de seguridad web pertinentes para mitigar estos riesgos.
                  </p>
                  <p>
                    <strong className="text-dark">7.3</strong> En ningún caso la responsabilidad total de nuestra empresa superará el monto pagado por el usuario por el producto específico en cuestión.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 8 */}
              <section id="ley-aplicable" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">8</span>
                  Ley Aplicable y Jurisdicción
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">8.1</strong> Estas políticas, términos y condiciones se rigen, regulan e interpretan de estricto acuerdo con las leyes vigentes de la República de Chile.
                  </p>
                  <p>
                    <strong className="text-dark">8.2</strong> Cualquier litigio, disputa o controversia que surja en relación con estas políticas se someterá y resolverá de manera exclusiva ante la jurisdicción ordinaria de los tribunales de Santiago, Chile.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 9 */}
              <section id="disposiciones-generales" className="mb-10 scroll-mt-[160px]">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <span className="bg-[#800D0D] text-white rounded w-6 h-6 flex items-center justify-center text-xs">9</span>
                  Disposiciones Generales
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    <strong className="text-dark">9.1</strong> Estos términos y condiciones constituyen el acuerdo vinculante y completo entre el usuario y Blood Moon Games en relación con el uso de la plataforma de comercio electrónico, sustituyendo cualquier negociación o comunicación previa.
                  </p>
                  <p>
                    <strong className="text-dark">9.2</strong> Si alguna cláusula de este documento fuese declarada nula o inaplicable por un tribunal competente, dicha cláusula se reformulará intentando capturar la intención original de las partes bajo la ley vigente, permaneciendo todas las demás cláusulas plenamente activas y vigentes.
                  </p>
                  <p>
                    <strong className="text-dark">9.3</strong> La falta de ejercicio o de exigencia por nuestra parte de cualquier derecho o disposición del presente texto no se interpretará en ningún caso como una renuncia implícita o explícita a dicho derecho o disposición.
                  </p>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SECTION 10 (CRITICAL ACCENT CARD) */}
              <section id="creditos-tienda" className="mb-10 scroll-mt-[160px] bg-dark text-white rounded-lg p-6 sm:p-8 border-l-4 border-blue">
                <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                  <span className="bg-blue text-white rounded w-6 h-6 flex items-center justify-center text-xs font-bold">10</span>
                  Políticas de Créditos de Tienda
                </h3>
                <div className="text-custom-sm text-gray-3 leading-relaxed flex flex-col gap-4">
                  <p>
                    <strong className="text-white">10.1</strong> Estas políticas, términos y condiciones constituyen el acuerdo completo entre el usuario y Blood Moon Games con respecto al uso de los créditos otorgados o acumulados en la tienda.
                  </p>
                  
                  <div className="border border-white/10 rounded p-4 bg-white/5">
                    <p className="font-bold text-blue mb-1">🎮 Créditos Ganados en Torneos:</p>
                    <p>
                      <strong className="text-white">10.2</strong> Cuando los Créditos de tienda son ganados en Torneos organizados por BMG, estos tendrán una vigencia estricta de <strong className="text-white">1 mes (30 días)</strong> para su utilización. De no ser utilizados dentro de ese lapso, pasados los 31 días de haber sido cargados a su cuenta virtual, el saldo acumulado de torneos <strong className="text-white">se reducirá automáticamente a un límite máximo de $10.000 (CLP)</strong>.
                    </p>
                  </div>

                  <div className="border border-white/10 rounded p-4 bg-white/5">
                    <p className="font-bold text-blue mb-1">💰 Créditos por Venta de Cartas (Singles):</p>
                    <p>
                      <strong className="text-white">10.3</strong> Cuando los Créditos de tienda se obtengan mediante la venta de tus cartas sueltas (sistema Buyback/Singles), podrás hacer uso de ellos sin un límite de tiempo de caducidad. <strong className="text-blue">Excepción:</strong> Si la cantidad total acumulada por este concepto excede los <strong className="text-white">$100.000 (CLP)</strong>, dispondrás de un plazo máximo e improrrogable de <strong className="text-white">2 meses (60 días)</strong> a partir del saldo excedido para gastar el saldo completo.
                    </p>
                  </div>

                  <div>
                    <strong className="text-white">10.4</strong> Los créditos de tienda podrán utilizarse como medio de pago para la adquisición de cualquier tipo de artículo disponible, <strong className="text-blue">con excepción de los siguientes conceptos:</strong>
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-gray-4">
                      <li>Costos de despacho o envíos a domicilio.</li>
                      <li>Inscripciones directas a torneos presenciales, ligas o eventos especiales.</li>
                      <li>Productos catalogados en etapa de Preventa (Pre-orders).</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-white">10.5</strong> Los Créditos virtuales de la tienda no son acumulables ni combinables en su uso con:
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-gray-4">
                      <li>Cupones promocionales de descuento web.</li>
                      <li>Tarjetas o credenciales de descuento físico o presencial en tienda.</li>
                    </ul>
                  </div>
                </div>
              </section>

              <hr className="border-gray-3 my-8" />

              {/* SPECIAL SECTION: TRANSFERENCIA BANCARIA */}
              <section id="transferencias" className="mb-10 scroll-mt-[160px] bg-[#800D0D]/5 border border-[#800D0D]/20 rounded-lg p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#800D0D] mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                  </svg>
                  Pagos por Transferencia Bancaria
                </h3>
                <div className="text-custom-sm text-gray-6 leading-relaxed flex flex-col gap-3">
                  <p>
                    Los pedidos completados seleccionando el método de pago <strong className="text-dark">Transferencia Bancaria Directa</strong> deberán ser pagados y su respectivo comprobante enviado en un plazo máximo e improrrogable de <strong className="text-[#800D0D] font-bold">24 horas</strong> contadas a partir del correo de confirmación de reserva del pedido.
                  </p>
                  <p className="font-medium text-dark bg-yellow-100/50 p-3.5 border-l-2 border-yellow-500 rounded-r">
                    ⚠️ Importante: Si el pago no es recibido, acreditado y confirmado de manera conforme dentro del plazo establecido de 24 horas, el pedido será cancelado automáticamente por el sistema informático, liberando el inventario de las cartas y dejándolas nuevamente disponibles para su venta.
                  </p>
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

export default TerminosCondicionesPage;
