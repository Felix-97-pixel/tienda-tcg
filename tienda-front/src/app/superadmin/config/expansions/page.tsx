"use client";
import React from "react";
import ExpansionTable from "@/app/superadmin/_components/Expansions/ExpansionTable";
import LinkExpansionModal from "@/app/superadmin/_components/Expansions/LinkExpansionModal";
import AutoMapModal from "@/app/superadmin/_components/Expansions/AutoMapModal";
import { Button } from "@/components/ui/Button";
import { useSuperAdminExpansions } from "@/app/superadmin/_components/Config/hooks/useSuperAdminExpansions";

export default function ExpansionsPage() {
  const {
    expansions,
    loading,
    page,
    setPage,
    totalPages,
    gameFilter,
    setGameFilter,
    search,
    setSearch,
    games,
    isLinkModalOpen,
    setIsLinkModalOpen,
    selectedExpansion,
    isAutoMapModalOpen,
    setIsAutoMapModalOpen,
    handleLinkClick,
    handleLinkSuccess,
    handleAutoMapSuccess
  } = useSuperAdminExpansions();

  return (
    <div className="p-6 pb-24">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestión de Expansiones</h1>
          <p className="text-gray-4 text-sm mt-1">
            Administra las expansiones y asegúrate de que estén vinculadas a un ID Oficial para que la sincronización de precios sea perfecta.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAutoMapModalOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 border-purple-500 shadow-lg shadow-purple-500/20"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          Auto-Mapear Juego
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Buscar por nombre..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue/50"
          />
        </div>
        <select 
          value={gameFilter} 
          onChange={(e) => { setGameFilter(e.target.value); setPage(1); }}
          className="bg-[#111318] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue/50"
        >
          <option value="all">Todos los Juegos</option>
          {games.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <ExpansionTable 
        expansions={expansions} 
        loading={loading} 
        onLink={handleLinkClick} 
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="text-white flex items-center px-4 font-medium">
            Página {page} de {totalPages}
          </span>
          <Button 
            variant="outline" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modals */}
      {isLinkModalOpen && selectedExpansion && (
        <LinkExpansionModal 
          expansion={selectedExpansion}
          onClose={() => setIsLinkModalOpen(false)}
          onSuccess={handleLinkSuccess}
        />
      )}

      {isAutoMapModalOpen && (
        <AutoMapModal 
          onClose={() => setIsAutoMapModalOpen(false)}
          onSuccess={handleAutoMapSuccess}
        />
      )}
    </div>
  );
}
