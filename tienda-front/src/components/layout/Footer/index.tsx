import React from "react";
import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white border-t border-white/5 overflow-hidden">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- footer menu start --> */}
        <div className="flex flex-wrap xl:flex-nowrap gap-10 xl:gap-20 justify-between pt-17.5 xl:pt-22.5 pb-10 xl:pb-15">

          {/* Logo & Brand Column */}
          <div className="max-w-[340px] w-full flex flex-col gap-6">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-red to-orange flex items-center justify-center shadow-lg shadow-red/20">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  TapTrade
                </span>
              </div>
            </Link>
            <p className="text-custom-sm text-gray-4 leading-relaxed">
              Tu tienda especializada en cartas Magic: The Gathering, Pokémon TCG, Yu-Gi-Oh!, accesorios y más. Únete a la comunidad de jugadores más grande.
            </p>
          </div>

          {/* Información Column */}
          <div className="w-full sm:w-auto min-w-[200px]">
            <h2 className="mb-7.5 text-custom-1 font-bold text-blue tracking-wide">
              Información
            </h2>

            <ul className="flex flex-col gap-4 text-custom-sm text-gray-4">
              <li>
                <Link className="ease-out duration-200 hover:text-blue hover:translate-x-1 inline-block transition-all" href="/shop">
                  Clasificación de cartas
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue hover:translate-x-1 inline-block transition-all" href="/terminos-y-condiciones">
                  Políticas, términos y condiciones
                </Link>
              </li>
              <li>
                <Link className="ease-out duration-200 hover:text-blue hover:translate-x-1 inline-block transition-all" href="/politica-de-privacidad">
                  Política de privacidad
                </Link>
              </li>
            </ul>

            {/* Social Links inside Información Column */}
            <div className="flex items-center gap-4.5 mt-8">
              {/* WhatsApp */}
              <a
                href="https://api.whatsapp.com/send/?phone=%2B56950223095&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1d24]/5 hover:bg-[#25D366] hover:text-white transition ease-out duration-200 text-gray-4"
              >
                <svg className="fill-current w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12.004 2C6.51 2 2.014 6.5 2.014 12c0 2.14.67 4.12 1.82 5.75L2 22l4.41-1.35c1.51.87 3.27 1.35 5.59 1.35 5.49 0 9.99-4.5 9.99-10S17.494 2 12.004 2zm6.6 14.1c-.3.8-1.5 1.5-2.1 1.6-.6.1-1.3.2-3.8-.8-3.1-1.3-5.1-4.4-5.3-4.6-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.5 1.2-2.9.3-.3.7-.5 1-.5.3 0 .5.1.7.1.2 0 .5-.1.7.4.3.6 1 2.4 1.1 2.6.1.2.1.4 0 .6-.1.2-.2.3-.4.5-.2.2-.4.4-.6.6-.2.2-.4.4-.6.6-.2.2-.4.4-.2.8.2.4.9 1.5 2 2.5 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1.2-.3.9-1 1.2-1.4.3-.4.5-.3.8-.2.3.1 2.1 1 2.5 1.2.4.2.6.3.7.4.1.3.1 1.1-.2 1.9z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/tiendaTapTrade/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1d24]/5 hover:bg-[#E1306C] hover:text-white transition ease-out duration-200 text-gray-4"
              >
                <svg className="fill-current w-5 h-5" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>

              {/* Twitch */}
              <a
                href="https://www.twitch.tv/tiendaTapTrade"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitch"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1d24]/5 hover:bg-[#9146FF] hover:text-white transition ease-out duration-200 text-gray-4"
              >
                <svg className="fill-current w-5 h-5" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.857L9 18.857v-4.286H5.143V1.714h15.428z" />
                </svg>
              </a>

              {/* Mail */}
              <a
                href="mailto:TiendaTapTrade@Gmail.Com"
                aria-label="Mail"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1a1d24]/5 hover:bg-blue hover:text-white transition ease-out duration-200 text-gray-4"
              >
                <svg className="fill-current w-5 h-5" viewBox="0 0 24 24">
                  <path d="M0 3v18h24V3H0zm21.518 2L12 12.75 2.482 5h19.036zM2 19V6.883l10 8.1 10-8.1V19H2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Contáctanos Column */}
          <div className="max-w-[360px] w-full">
            <h2 className="mb-7.5 text-custom-1 font-bold text-blue tracking-wide">
              Contáctanos
            </h2>

            <ul className="flex flex-col gap-4 text-custom-sm text-gray-4">
              <li className="flex gap-4">
                <span className="flex-shrink-0 text-blue mt-1">
                  <svg className="fill-current w-5 h-5" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>
                <span>Pérez Valenzuela #1228, Metro Manuel Montt, Providencia, Santiago</span>
              </li>

              <li className="flex gap-4">
                <span className="flex-shrink-0 text-blue mt-0.5">
                  <svg className="fill-current w-5 h-5" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </span>
                <span>+56 9 5022 3095</span>
              </li>

              <li className="flex gap-4">
                <span className="flex-shrink-0 text-blue mt-0.5">
                  <svg className="fill-current w-5 h-5" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                </span>
                <span>TiendaTapTrade@Gmail.Com</span>
              </li>
            </ul>
          </div>
        </div>
        {/* <!-- footer menu end --> */}
      </div>

      {/* <!-- footer bottom start --> */}
      <div className="py-6 bg-[#0c0c0e] border-t border-white/5">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex gap-5 flex-wrap items-center justify-between">
            <p className="text-gray-4 font-medium text-custom-sm">
              &copy; {year} TapTrade. Todos los derechos reservados.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-custom-sm text-gray-4">
              <p className="font-semibold">Aceptamos:</p>

              <div className="flex flex-wrap items-center gap-5">
                <a href="#" aria-label="Visa">
                  <img style={{ width: "100%", height: "auto", filter: "grayscale(1) brightness(1.5)" }}
                    src="/images/payment/payment-01.svg"
                    alt="visa card"
                    width={48}
                    height={16}
                  />
                </a>
                <a href="#" aria-label="Paypal">
                  <img style={{ width: "100%", height: "auto", filter: "grayscale(1) brightness(1.5)" }}
                    src="/images/payment/payment-02.svg"
                    alt="paypal"
                    width={14}
                    height={16}
                  />
                </a>
                <a href="#" aria-label="Mastercard">
                  <img style={{ width: "100%", height: "auto", filter: "grayscale(1) brightness(1.5)" }}
                    src="/images/payment/payment-03.svg"
                    alt="master card"
                    width={22}
                    height={16}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- footer bottom end --> */}
    </footer>
  );
};

export default Footer;
