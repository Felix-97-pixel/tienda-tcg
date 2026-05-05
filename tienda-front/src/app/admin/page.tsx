import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard - Admin Panel",
  description: "Admin panel for managing the store",
};

const cards = [
  {
    href: "/admin/products",
    label: "Productos",
    desc: "Gestiona inventario, precios y stock",
    color: "bg-blue/10",
    iconColor: "text-blue",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
        <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categorías",
    desc: "Organiza el catálogo de la tienda",
    color: "bg-purple-100",
    iconColor: "text-purple-600",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    href: "/admin/brands",
    label: "Marcas",
    desc: "Administra marcas y sus logos",
    color: "bg-green-100",
    iconColor: "text-green-600",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/admin/sales",
    label: "Ventas",
    desc: "Estadísticas e ingresos",
    color: "bg-yellow-100",
    iconColor: "text-yellow-600",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Órdenes",
    desc: "Historial de pedidos y estados",
    color: "bg-orange-100",
    iconColor: "text-orange-600",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/admin/sync",
    label: "Sincronización",
    desc: "Importa cartas y actualiza precios",
    color: "bg-red-100",
    iconColor: "text-red-500",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    href: "/admin/wishlist",
    label: "Wishlist",
    desc: "Monitorea listas de deseos",
    color: "bg-pink-100",
    iconColor: "text-pink-500",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark">Panel de Administración</h1>
        <p className="text-dark-4 text-sm mt-1">Bienvenido. Desde aquí gestionas toda tu tienda.</p>
      </div>

      {/* Quick-access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-2xl shadow-1 p-6 flex items-start gap-4 hover:shadow-md transition-shadow group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${card.color} ${card.iconColor}`}>
              {card.icon}
            </div>
            <div>
              <p className="font-semibold text-dark group-hover:text-blue transition-colors">{card.label}</p>
              <p className="text-dark-4 text-sm mt-0.5">{card.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Info panel */}
      <div className="bg-white rounded-2xl shadow-1 p-6">
        <h2 className="font-semibold text-dark text-lg mb-4">📋 Guía rápida</h2>
        <ul className="space-y-3 text-sm text-dark-4">
          <li><span className="font-medium text-dark">Marcas y Categorías:</span> Crea la estructura del catálogo antes de agregar productos.</li>
          <li><span className="font-medium text-dark">Productos:</span> Edita stock, precio e imagen. Soporta subida masiva por CSV para cartas TCG.</li>
          <li><span className="font-medium text-dark">Sincronización:</span> Importa expansiones de MTG desde MTGJSON y actualiza precios desde Card Kingdom.</li>
          <li><span className="font-medium text-dark">Ventas:</span> Monitorea ingresos totales, crecimiento mensual, tasa de aprobación y los productos más vendidos.</li>
          <li><span className="font-medium text-dark">Órdenes:</span> Revisa el historial de pedidos, filtra por estado (Pagado, Pendiente, Fallido) y ve los detalles de cada transacción.</li>
          <li><span className="font-medium text-dark">Wishlist:</span> Descubre qué productos interesan más a tus clientes para tomar decisiones de inventario.</li>
        </ul>
      </div>
    </div>
  );
}
