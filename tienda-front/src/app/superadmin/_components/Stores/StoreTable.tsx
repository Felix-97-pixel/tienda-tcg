"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Store } from "./hooks/useSuperAdminStores";

interface StoreTableProps {
  stores: Store[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export default function StoreTable({ stores, loading, onDelete }: StoreTableProps) {
  const getStoreUrl = (subdomain: string) => {
    if (typeof window === 'undefined') return '#';
    return `${window.location.protocol}//${window.location.host}/shop/store/${subdomain}`;
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Cargando tiendas...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-[#0a0a0a] text-gray-400">
          <tr>
            <th className="px-4 py-3 rounded-tl-lg">Logo</th>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Subdominio</th>
            <th className="px-4 py-3">Dueño</th>
            <th className="px-4 py-3">Balance</th>
            <th className="px-4 py-3 rounded-tr-lg">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr key={store.id} className="border-b border-white/5 hover:bg-white/5 transition">
              <td className="px-4 py-3">
                {store.logoUrl ? (
                  <img src={store.logoUrl} alt={store.name} className="w-10 h-10 rounded-md object-contain bg-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-white/10 flex items-center justify-center font-bold">
                    {store.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 font-semibold text-white">{store.name}</td>
              <td className="px-4 py-3 text-purple-400">{store.subdomain}</td>
              <td className="px-4 py-3">
                <div className="text-white">{store.owner?.name}</div>
                <div className="text-xs text-gray-500">{store.owner?.email}</div>
              </td>
              <td className="px-4 py-3">${store.balance}</td>
              <td className="px-4 py-3 flex gap-2">
                <a href={getStoreUrl(store.subdomain)} target="_blank" rel="noreferrer" title="Visitar tienda">
                  <Button size="sm" variant="primary" className="!px-3 !py-2.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </Button>
                </a>
                <Link href={`/superadmin/stores/${store.id}/edit`} title="Editar tienda">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="!px-3 !py-2.5 hover:border-blue hover:text-blue"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  className="!px-3 !py-2.5"
                  onClick={() => onDelete(store.id)}
                  title="Eliminar tienda"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </Button>
              </td>
            </tr>
          ))}
          {stores.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">
                No hay tiendas registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
