"use client";
import React, { useState } from "react";
import {
  IconCheck,
  IconCirclePlus,
  IconCircleMinus,
  IconExternalLink,
  IconShare,
  IconTruck,
  IconMapPin,
  IconHome,
  IconShieldCheck,
} from "@/components/ui/Icons";

export interface CarrierEvent {
  date: string;
  description: string;
  location?: string;
  detail?: string;
}

export interface CarrierTimelineProps {
  courierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  status?: string;
  destination?: string;
  service?: string;
  events?: CarrierEvent[];
  className?: string;
  defaultTheme?: "light" | "dark";
}

export function formatCarrierDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const [, y, m, d] = isoMatch;
      return `${d}/${m}/${y}`;
    }
    const slashMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (slashMatch) {
      const [, m, d, y] = slashMatch;
      return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function formatCarrierTime(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const timeMatch = dateStr.match(/T(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]} hrs`;
    }
  } catch {
    // fallback
  }
  return "";
}

export default function CarrierTimeline({
  courierName,
  trackingNumber,
  trackingUrl,
  status,
  destination,
  service,
  events = [],
  className = "",
  defaultTheme = "light",
}: CarrierTimelineProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(defaultTheme === "dark");

  const toggleDetail = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleShare = async () => {
    const textToShare = `Seguimiento ${courierName} N° ${trackingNumber}: ${status || "En tránsito"}${
      trackingUrl ? ` - ${trackingUrl}` : ""
    }`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!events || events.length === 0) {
    const isStarken = courierName.toUpperCase().includes("STARKEN");
    return (
      <div
        className={`rounded-2xl transition-colors shadow-2xl relative overflow-hidden ${
          isDarkMode
            ? "bg-[#0A0C10] text-white border border-white/10 p-5 sm:p-6"
            : "bg-white text-black border border-gray-200 p-6 sm:p-8"
        } ${className}`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b ${
            isDarkMode ? "border-white/10" : "border-gray-200"
          }`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs uppercase tracking-wider font-extrabold ${
                  isDarkMode ? "text-white" : "text-black"
                }`}
              >
                {courierName}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  isDarkMode
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                <IconShieldCheck className="w-3 h-3 shrink-0" />
                <span>Orden Registrada</span>
              </span>
            </div>
            <p
              className={`text-xs font-mono ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              N° OT:{" "}
              <span
                className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}
              >
                {trackingNumber}
              </span>
              {service && (
                <span
                  className={`ml-2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  · {service}
                </span>
              )}
            </p>
          </div>

          {destination && (
            <div className="text-right">
              <span
                className={`text-[10px] uppercase tracking-wider block ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Destino
              </span>
              <span
                className={`text-xs font-bold flex items-center justify-end gap-1 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <IconMapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{destination}</span>
              </span>
            </div>
          )}
        </div>

        {/* Barra de progreso visual informativa */}
        <div className="py-2 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-400 block">1. Despachado</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 block">2. En Tránsito</span>
            </div>
            <div className="space-y-1">
              <div className={`h-1.5 rounded-full ${isDarkMode ? "bg-white/15" : "bg-gray-200"}`} />
              <span
                className={`text-[10px] font-medium block ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                3. Entrega
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div
              className={`flex items-center gap-2 text-xs ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <IconTruck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Estado:{" "}
                <strong className={isDarkMode ? "text-white" : "text-black"}>
                  {status || "En tránsito hacia destino"}
                </strong>
              </span>
            </div>

            {trackingUrl && (
              <a
                href={trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer"
              >
                <span>Consultar en Portal {isStarken ? "Starken" : courierName}</span>
                <IconExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl transition-colors shadow-2xl relative overflow-hidden ${
        isDarkMode
          ? "bg-[#0A0C10] text-white border border-white/10 p-5 sm:p-6"
          : "bg-white text-black border border-gray-200 p-6 sm:p-8"
      } ${className}`}
    >
      {/* Header Resumen del Courier */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b ${
          isDarkMode ? "border-white/10" : "border-gray-200"
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs uppercase tracking-wider font-extrabold ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              {courierName}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                isDarkMode
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              <IconShieldCheck className="w-3 h-3 shrink-0" />
              <span>Verificación Oficial en Vivo</span>
            </span>
          </div>
          <p
            className={`text-xs font-mono ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            N° OT:{" "}
            <span
              className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}
            >
              {trackingNumber}
            </span>
            {service && (
              <span
                className={`ml-2 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                · {service}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {destination && (
            <div className="text-right">
              <span
                className={`text-[10px] uppercase tracking-wider block ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Destino
              </span>
              <span
                className={`text-xs font-bold flex items-center justify-end gap-1 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <IconMapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{destination}</span>
              </span>
            </div>
          )}

          {/* Toggle de tema */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Alternar entre tema original Chilexpress y modo oscuro"
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
              isDarkMode
                ? "border-white/15 bg-white/5 text-gray-300 hover:bg-white/10"
                : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isDarkMode ? "Ver Blanco Oficial" : "Modo Oscuro"}
          </button>
        </div>
      </div>

      {/* Línea de Tiempo Vertical - Réplica exacta del Courier */}
      <div className="relative pl-12 py-2">
        {/* Línea vertical continua que conecta los nodos */}
        <div
          className={`absolute left-[11px] top-3 bottom-6 w-[3.5px] ${
            isDarkMode ? "bg-white/25" : "bg-black"
          }`}
        />

        <div className="space-y-6">
          {events.map((event, idx) => {
            const isLast = idx === events.length - 1;
            const isDelivered =
              (event.description || "").toLowerCase().includes("entregad") ||
              (status || "").toLowerCase().includes("entregad");
            const isExpanded = expandedIndex === idx;
            const formattedDate = formatCarrierDate(event.date);
            const formattedTime = formatCarrierTime(event.date);

            return (
              <div key={idx} className="relative group">
                {/* Nodo circular o icono oficial sobre la línea */}
                <div
                  className="absolute -left-12 top-0.5 flex items-center justify-center"
                  style={{ width: "24px", height: "24px" }}
                >
                  {isLast && isDelivered ? (
                    <div
                      className={`w-7 h-7 flex items-center justify-center shrink-0 ${
                        isDarkMode
                          ? "bg-[#0A0C10] text-emerald-400"
                          : "bg-white text-black"
                      }`}
                    >
                      <IconHome className="w-6 h-6 stroke-[2.4]" />
                    </div>
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                        isDarkMode
                          ? isLast
                            ? "bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/30"
                            : "bg-white text-black font-black"
                          : "bg-black text-white"
                      }`}
                    >
                      <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Contenido textual del evento */}
                <div className="space-y-1">
                  {/* Fecha del evento */}
                  {formattedDate && (
                    <span
                      className={`text-xs block ${
                        isDarkMode
                          ? "font-medium text-gray-400"
                          : "font-normal text-gray-700"
                      }`}
                    >
                      {formattedDate}
                    </span>
                  )}

                  {/* Título en negrita */}
                  <h4
                    className={`leading-snug tracking-tight font-bold ${
                      isLast
                        ? isDarkMode
                          ? "text-base text-white"
                          : "text-lg text-black font-extrabold"
                        : isDarkMode
                        ? "text-sm text-gray-100"
                        : "text-base text-black"
                    }`}
                  >
                    {event.description}
                  </h4>

                  {/* Botón (+) Detalle interactivo */}
                  {(event.location || event.detail) && (
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleDetail(idx)}
                        className={`inline-flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                          isDarkMode
                            ? "text-blue-400 hover:text-blue-300 font-semibold"
                            : "text-black hover:opacity-75 font-medium"
                        }`}
                      >
                        {isExpanded ? (
                          <IconCircleMinus className="w-4 h-4 shrink-0" />
                        ) : (
                          <IconCirclePlus className="w-4 h-4 shrink-0" />
                        )}
                        <span className="underline underline-offset-2">
                          {isExpanded ? "Ocultar Detalle" : "Detalle"}
                        </span>
                      </button>

                      {/* Caja de detalle desplegada */}
                      {isExpanded && (
                        <div
                          className={`mt-2 p-3 rounded-xl text-xs space-y-1.5 transition-all animate-fadeIn ${
                            isDarkMode
                              ? "bg-white/[0.04] border border-white/10 text-gray-300"
                              : "bg-gray-50 border border-gray-200 text-gray-800 shadow-sm"
                          }`}
                        >
                          {event.location && (
                            <p className="flex items-center gap-1.5">
                              <span
                                className={`font-semibold ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                Ubicación / Sucursal:
                              </span>
                              <span
                                className={`font-bold ${
                                  isDarkMode ? "text-white" : "text-black"
                                }`}
                              >
                                {event.location}
                              </span>
                            </p>
                          )}
                          {event.detail && (
                            <p>
                              <span
                                className={`font-semibold ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                Glosa:
                              </span>{" "}
                              <span>{event.detail}</span>
                            </p>
                          )}
                          {formattedTime && (
                            <p>
                              <span
                                className={`font-semibold ${
                                  isDarkMode ? "text-gray-400" : "text-gray-600"
                                }`}
                              >
                                Hora registro:
                              </span>{" "}
                              <span className="font-mono">{formattedTime}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botón de Compartir Estado si es el último evento */}
                  {isLast && (
                    <div className="pt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleShare}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                          isDarkMode
                            ? "border border-white/15 bg-white/5 hover:bg-white/10 text-gray-200"
                            : "border border-gray-300 bg-white hover:bg-gray-100 text-black"
                        }`}
                      >
                        <IconShare
                          className={`w-3.5 h-3.5 ${
                            isDarkMode ? "text-gray-300" : "text-black"
                          } shrink-0`}
                        />
                        <span>
                          {copied
                            ? "¡Copiado al portapapeles!"
                            : "Compartir estado"}
                        </span>
                      </button>

                      {trackingUrl && (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            isDarkMode
                              ? "border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
                              : "border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          <span>Rastrear en {courierName}</span>
                          <IconExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
