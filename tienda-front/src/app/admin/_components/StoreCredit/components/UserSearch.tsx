import React from "react";
import type { StoreCreditUser } from "../types/store-credit.types";

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchResults: StoreCreditUser[];
  searching: boolean;
  selectedUser: StoreCreditUser | null;
  preselectedUser: StoreCreditUser | null;
  onSelectUser: (user: StoreCreditUser) => void;
  onClearUser: () => void;
}

/**
 * Handles user search input and displays the selected user card.
 * Extracted from StoreCreditModal to follow SRP.
 */
export default function UserSearch({
  searchTerm,
  onSearchChange,
  searchResults,
  searching,
  selectedUser,
  preselectedUser,
  onSelectUser,
  onClearUser,
}: UserSearchProps) {
  if (selectedUser) {
    return (
      <div className="flex items-center justify-between bg-[#0f1115] p-4 rounded-xl border border-white/10">
        <div>
          <p className="text-xs text-gray-4 font-bold uppercase mb-1">Cliente Seleccionado</p>
          <p className="text-sm font-bold text-white">{selectedUser.name || "Sin Nombre"}</p>
          <p className="text-xs text-blue">{selectedUser.email}</p>
        </div>
        {!preselectedUser && (
          <button
            type="button"
            onClick={onClearUser}
            className="text-gray-4 hover:text-white text-xs underline"
          >
            Cambiar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-4 uppercase">
        Buscar Cliente en TapTrade (Nombre o Email)
      </label>
      <input
        type="text"
        placeholder="Escribe el nombre o email del usuario..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none"
      />
      {searching && <p className="text-xs text-blue">Buscando...</p>}
      {searchResults.length > 0 && (
        <div className="bg-[#0f1115] border border-white/10 rounded-xl max-h-48 overflow-y-auto mt-2 p-2 space-y-1">
          {searchResults.map((u) => (
            <div
              key={u.id}
              onClick={() => onSelectUser(u)}
              className="p-3 hover:bg-white/5 rounded-lg cursor-pointer"
            >
              <p className="text-sm font-bold text-white">{u.name || "Sin Nombre"}</p>
              <p className="text-xs text-gray-4">{u.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
