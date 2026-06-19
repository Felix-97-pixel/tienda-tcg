import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import SearchableSelect from "@/components/ui/SearchableSelect";

interface StoreCreditModalProps {
  preselectedUser: any | null;
  defaultType?: "MANUAL_ADD" | "MANUAL_SUBTRACT";
  onClose: () => void;
  onSuccess: () => void;
}

export default function StoreCreditModal({ preselectedUser, defaultType = "MANUAL_ADD", onClose, onSuccess }: StoreCreditModalProps) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(preselectedUser);

  // Búsqueda de Usuario
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Formulario General
  const [amount, setAmount] = useState<number | "">("");
  const [type, setType] = useState<"MANUAL_ADD" | "MANUAL_SUBTRACT">(defaultType);
  const [reference, setReference] = useState("");

  // Metadatos para Filtros
  const [categories, setCategories] = useState<any[]>([]);
  const [expansions, setExpansions] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");

  // Búsqueda de Cartas / Productos (Trade-in / Compra)
  const [cardSearchTerm, setCardSearchTerm] = useState("");
  const [cardSearchResults, setCardSearchResults] = useState<any[]>([]);
  const [searchingCards, setSearchingCards] = useState(false);
  const [tradeInCards, setTradeInCards] = useState<any[]>([]);

  // Metadatos adicionales para Trade-in
  const [languages, setLanguages] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [finishes, setFinishes] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/products/meta/languages`).then(r => r.json()).then(setLanguages).catch(() => {});
    fetch(`${API_URL}/products/meta/conditions`).then(r => r.json()).then(setConditions).catch(() => {});
    fetch(`${API_URL}/products/meta/finishes`).then(r => r.json()).then(setFinishes).catch(() => {});
  }, []);

  // Buscar Usuario
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      setSearching(true);
      fetch(`${API_URL}/users/search?query=${encodeURIComponent(searchTerm)}`, { credentials: "include" })
        .then(r => r.json())
        .then(data => setSearchResults(data || []))
        .finally(() => setSearching(false));
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Cargar Categorías
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=true`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Cargar Expansiones al cambiar Categoría
  useEffect(() => {
    if (!selectedCategory) {
      setExpansions([]);
      setSelectedExpansion("");
      return;
    }
    fetch(`${API_URL}/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`)
      .then(r => r.json())
      .then(setExpansions)
      .catch(() => {});
  }, [selectedCategory]);

  // Buscar Cartas / Productos
  useEffect(() => {
    if (cardSearchTerm.length < 3 && !selectedCategory && !selectedExpansion) {
      setCardSearchResults([]);
      return;
    }
    const delay = setTimeout(() => {
      setSearchingCards(true);
      
      let productUrl = `${API_URL}/products?search=${encodeURIComponent(cardSearchTerm)}&limit=10`;
      
      // Lógica Dual
      if (type === "MANUAL_ADD") {
        productUrl += `&adminCatalog=true`;
      } else {
        productUrl += `&inventoryOnly=true`;
      }

      if (selectedCategory) productUrl += `&category=${encodeURIComponent(selectedCategory)}`;
      if (selectedExpansion) productUrl += `&expansion=${encodeURIComponent(selectedExpansion)}`;

      fetch(productUrl, { credentials: "include" })
        .then(r => r.json())
        .then(data => setCardSearchResults(data.data || []))
        .finally(() => setSearchingCards(false));
    }, 500);
    return () => clearTimeout(delay);
  }, [cardSearchTerm, selectedCategory, selectedExpansion, type]);

  // Auto-calcular monto si hay cartas
  useEffect(() => {
    if (tradeInCards.length > 0) {
      const total = tradeInCards.reduce((acc, card) => acc + (card.quantity * card.price), 0);
      setAmount(total);
    }
  }, [tradeInCards]);

  const handleAddCard = (product: any) => {
    const defaultCondition = conditions.length > 0 ? conditions[0].name : "NM";
    const defaultLanguage = languages.length > 0 ? languages[0].name : "EN";
    const defaultFinish = finishes.length > 0 ? finishes[0].name : "Normal";
    setTradeInCards([...tradeInCards, { product, quantity: 1, price: 0, condition: defaultCondition, language: defaultLanguage, finish: defaultFinish }]);
    setCardSearchTerm("");
    setCardSearchResults([]);
  };

  const handleUpdateCard = (index: number, field: string, value: any) => {
    const updated = [...tradeInCards];
    updated[index][field] = value;
    setTradeInCards(updated);
  };

  const handleRemoveCard = (index: number) => {
    const updated = tradeInCards.filter((_, i) => i !== index);
    setTradeInCards(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      showToast("Debes seleccionar un usuario", "error");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      showToast("El monto debe ser mayor a 0", "error");
      return;
    }

    setLoading(true);
    const finalAmount = type === "MANUAL_ADD" ? Number(amount) : -Number(amount);

    let finalReference = reference;
    if (tradeInCards.length > 0) {
      const cardsText = tradeInCards.map(c => `${c.quantity}x ${c.product.name} [${c.condition || 'NM'}, ${c.language || 'EN'}, ${c.finish || 'Normal'}] ($${c.price})`).join(', ');
      finalReference = reference ? `${reference} | Productos: ${cardsText}` : `${type === 'MANUAL_ADD' ? 'Trade-in' : 'Compra en tienda'}: ${cardsText}`;
    }

    try {
      const res = await fetch(`${API_URL}/store-credit/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: finalAmount,
          type: tradeInCards.length > 0 ? (type === "MANUAL_ADD" ? "BUYLIST_TRADE" : "STORE_PURCHASE") : type,
          reference: finalReference || "Ajuste Manual",
          itemsData: tradeInCards.length > 0 ? tradeInCards : undefined
        }),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Error al ajustar saldo");

      showToast("Saldo ajustado correctamente", "success");
      onSuccess();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
      <h2 className="text-xl font-bold text-white mb-6">
        Ajustar Saldo (Store Credit)
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Buscador de usuario si no hay uno seleccionado */}
        {!selectedUser && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-4 uppercase">Buscar Cliente en TapTrade (Nombre o Email)</label>
            <input
              type="text"
              placeholder="Escribe el nombre o email del usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none"
            />
            {searching && <p className="text-xs text-blue">Buscando...</p>}
            {searchResults.length > 0 && (
              <div className="bg-[#0f1115] border border-white/10 rounded-xl max-h-48 overflow-y-auto mt-2 p-2 space-y-1">
                {searchResults.map((u: any) => (
                  <div
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className="p-3 hover:bg-white/5 rounded-lg cursor-pointer"
                  >
                    <p className="text-sm font-bold text-white">{u.name || 'Sin Nombre'}</p>
                    <p className="text-xs text-gray-4">{u.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Usuario Seleccionado */}
        {selectedUser && (
          <div className="flex items-center justify-between bg-[#0f1115] p-4 rounded-xl border border-white/10">
            <div>
              <p className="text-xs text-gray-4 font-bold uppercase mb-1">Cliente Seleccionado</p>
              <p className="text-sm font-bold text-white">{selectedUser.name || 'Sin Nombre'}</p>
              <p className="text-xs text-blue">{selectedUser.email}</p>
            </div>
            {!preselectedUser && (
              <button type="button" onClick={() => setSelectedUser(null)} className="text-gray-4 hover:text-white text-xs underline">
                Cambiar
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-4 uppercase">Monto Total ($ SC)</label>
            <input
              type="number"
              min="1"
              required
              value={amount}
              readOnly={tradeInCards.length > 0}
              onChange={(e) => setAmount(Number(e.target.value))}
              className={`w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none ${tradeInCards.length > 0 ? 'text-gray-4 cursor-not-allowed' : type === 'MANUAL_ADD' ? 'text-green-400 focus:border-blue' : 'text-red-400 focus:border-blue'}`}
              placeholder="Ej: 5000"
            />
          </div>
        </div>

        {/* Sección de Cartas / Productos (Ambos Flujos) */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">{type === "MANUAL_ADD" ? "🃏" : "🛒"}</span> 
            {type === "MANUAL_ADD" ? "Productos Recibidos (Trade-in)" : "Productos Comprados por el Cliente"} <span className="text-gray-4 text-xs font-normal normal-case">(Opcional)</span>
          </h3>
          
          <div className="p-4 bg-[#111318] rounded-xl border border-white/10 space-y-3 relative">
            
            <div className="relative z-[60] grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={type === "MANUAL_ADD" ? "Buscar en catálogo global..." : "Buscar en tu inventario..."}
                value={cardSearchTerm}
                onChange={(e) => setCardSearchTerm(e.target.value)}
                className="w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue outline-none"
              />
              <SearchableSelect
                options={[
                  { label: "Todas las Categorías", value: "" },
                  ...categories.map(c => ({ label: c.name, value: c.name }))
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Categorías"
              />
              <SearchableSelect
                options={[
                  { label: !selectedCategory ? "Elige Categoría..." : "Todas las Expansiones", value: "" },
                  ...expansions.map(e => ({ label: e.name, value: e.name }))
                ]}
                value={selectedExpansion}
                onChange={setSelectedExpansion}
                placeholder={!selectedCategory ? "Elige Categoría..." : "Buscar expansión..."}
                disabled={!selectedCategory}
              />
            </div>

            {searchingCards && <p className="text-xs text-blue">Buscando...</p>}
            
            {cardSearchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#0f1115] border border-white/10 rounded-xl max-h-60 overflow-y-auto p-2 space-y-1 shadow-2xl">
                {cardSearchResults.map((res: any) => (
                  <div
                    key={res.id}
                    onClick={() => handleAddCard(res)}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                  >
                    <div className="w-8 h-10 bg-black rounded overflow-hidden flex-shrink-0">
                      {res.imageUrl && <img src={res.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{res.name}</p>
                      <p className="text-xs text-gray-4">{res.setName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lista de Cartas Seleccionadas */}
          {tradeInCards.length > 0 && (
            <div className="space-y-2">
              {tradeInCards.map((c, index) => (
                <div key={index} className="flex items-center gap-3 bg-[#1a1d24] p-3 rounded-xl border border-white/5">
                  <div className="w-10 h-14 bg-black rounded overflow-hidden flex-shrink-0">
                    {c.product.imageUrl && <img src={c.product.imageUrl} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white leading-tight line-clamp-1">{c.product.name}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-4 uppercase">Condición:</span>
                        <select
                          className="bg-[#0f1115] border border-white/10 rounded px-1.5 py-1 text-[10px] text-white outline-none focus:border-blue"
                          value={c.condition || (conditions[0]?.name || "NM")}
                          onChange={(e) => handleUpdateCard(index, 'condition', e.target.value)}
                        >
                          {conditions.map(cond => (
                            <option key={cond.id} value={cond.name}>{cond.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-4 uppercase">Idioma:</span>
                        <select
                          className="bg-[#0f1115] border border-white/10 rounded px-1.5 py-1 text-[10px] text-white outline-none focus:border-blue"
                          value={c.language || (languages[0]?.name || "EN")}
                          onChange={(e) => handleUpdateCard(index, 'language', e.target.value)}
                        >
                          {languages.map(lang => (
                            <option key={lang.id} value={lang.name}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-4 uppercase">Acabado:</span>
                        <select
                          className="bg-[#0f1115] border border-white/10 rounded px-1.5 py-1 text-[10px] text-white outline-none focus:border-blue"
                          value={c.finish || (finishes[0]?.name || "Normal")}
                          onChange={(e) => handleUpdateCard(index, 'finish', e.target.value)}
                        >
                          {finishes.map(fin => (
                            <option key={fin.id} value={fin.name}>{fin.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-4">Cant:</span>
                        <input 
                          type="number" min="1" 
                          className="w-16 bg-[#0f1115] border border-white/10 rounded px-2 py-1 text-xs text-white"
                          value={c.quantity}
                          onChange={e => handleUpdateCard(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-4">Precio SC:</span>
                        <input 
                          type="number" min="0" 
                          className="w-24 bg-[#0f1115] border border-white/10 rounded px-2 py-1 text-xs text-blue font-bold"
                          value={c.price}
                          onChange={e => handleUpdateCard(index, 'price', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  <button type="button" onClick={() => handleRemoveCard(index)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 border-t border-white/10 pt-4">
          <label className="text-xs font-bold text-gray-4 uppercase">Notas / Referencia Adicional</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none"
            placeholder={tradeInCards.length > 0 ? (type === "MANUAL_ADD" ? "Ej: Cartas recibidas en evento" : "Ej: Compra presencial en tienda") : "Ej: Ajuste manual por error"}
            required={tradeInCards.length === 0}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose} type="button">Cancelar</Button>
          <Button variant="primary" type="submit" disabled={loading || !selectedUser || (!amount && amount !== 0)}>
            {loading ? "Procesando..." : "Confirmar Transacción"}
          </Button>
        </div>
      </form>
    </div>
  );
}
