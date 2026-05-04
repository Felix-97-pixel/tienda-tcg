import React from "react";

export const metadata = {
  title: "Dashboard - Admin Panel",
  description: "Admin panel for managing the store",
};

export default function AdminDashboard() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black">
          Dashboard Overview
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {/* Card 1 */}
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default">
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black">
                Panel
              </h4>
              <span className="text-sm font-medium">Bienvenido al Panel de Administración</span>
            </div>
          </div>
        </div>

        {/* You can add more cards here for stats */}
      </div>

      <div className="mt-4 md:mt-6 2xl:mt-7.5">
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default sm:px-7.5 xl:pb-1">
          <h4 className="mb-6 text-xl font-semibold text-black">
            Instrucciones
          </h4>
          <p className="mb-4">
            Desde este panel podrás gestionar todos los aspectos de tu tienda. Usa el menú lateral para navegar entre:
          </p>
          <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Marcas:</strong> Administra las marcas de tus productos, añade logos y mantén organizado el catálogo.</li>
            <li><strong>Categorías:</strong> Crea, edita, y asigna imágenes a tus categorías (separando productos normales de cartas sueltas/TCG).</li>
            <li><strong>Productos:</strong> Visualiza, edita el stock, precio, imágenes, o elimina productos de tu tienda.</li>
            <li><strong>Sincronización:</strong> Ejecuta los scripts de actualización masiva de precios y base de datos (Ej. MTG).</li>
            <li><strong>Wishlist:</strong> Gestiona y monitorea qué productos tienen tus clientes en sus listas de deseos.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
