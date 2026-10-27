import React, { useState, useEffect } from 'react';
import { API_URL } from '@/utils/api';
import { PosBuyCartItem } from './PosBuyCart';
import { IconCash, IconWallet } from '@/components/ui/Icons';

interface PosBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PosBuyCartItem[];
  onConfirmPayout: (payload: {
    payoutMethod: 'STORE_CREDIT' | 'CASH';
    totalAmount: number;
    userId?: string;
    customerName?: string;
    customerEmail?: string;
    customerRut?: string;
    notes?: string;
  }) => Promise<void>;
  isProcessing: boolean;
}

export default function PosBuyModal({
  isOpen,
  onClose,
  items,
  onConfirmPayout,
  isProcessing,
}: PosBuyModalProps) {
  const [payoutMethod, setPayoutMethod] = useState<'STORE_CREDIT' | 'CASH'>('STORE_CREDIT');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerRut, setCustomerRut] = useState('');
  const [notes, setNotes] = useState('');

  const totalCash = items.reduce((acc, i) => acc + i.cashPrice * i.quantity, 0);
  const totalCredit = items.reduce((acc, i) => acc + i.creditPrice * i.quantity, 0);
  const selectedAmount = payoutMethod === 'STORE_CREDIT' ? totalCredit : totalCash;

  // Búsqueda de cliente registrado para abonar Store Credit
  useEffect(() => {
    if (!isOpen || customerSearchTerm.trim().length < 2) {
      setCustomerResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setSearchingCustomer(true);
      fetch(`${API_URL}/users/search?query=${encodeURIComponent(customerSearchTerm.trim())}`, {
        credentials: 'include',
        headers: { 'x-auth-scope': 'admin' },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setCustomerResults(Array.isArray(data) ? data : []))
        .catch(() => setCustomerResults([]))
        .finally(() => setSearchingCustomer(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchTerm, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayout({
      payoutMethod,
      totalAmount: selectedAmount,
      userId: selectedUser?.id,
      customerName: selectedUser?.name || customerName,
      customerEmail: selectedUser?.email || customerEmail,
      customerRut: selectedUser?.phone || customerRut,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E121B] rounded-2xl border border-white/10 shadow-2xl p-6 space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-black text-white">
              Confirmar Pago de Compra (Trade-in)
            </h2>
            <p className="text-xs text-white/50">
              {items.length} carta(s) a recibir por la tienda
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            type="button"
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Método de Pago al Cliente */}
          <div>
            <label className="text-xs font-bold text-white/60 uppercase block mb-2">
              ¿Cómo le pagas al cliente?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayoutMethod('STORE_CREDIT')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  payoutMethod === 'STORE_CREDIT'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500 shadow-md'
                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                <IconWallet className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-black uppercase">Crédito de Tienda</span>
                <span className="font-mono text-sm font-bold text-cyan-300">
                  ${totalCredit.toLocaleString('es-CL')} CLP
                </span>
                {totalCredit > totalCash && (
                  <span className="text-[10px] text-amber-300 font-bold">
                    +${(totalCredit - totalCash).toLocaleString('es-CL')} extra
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setPayoutMethod('CASH')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                  payoutMethod === 'CASH'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500 shadow-md'
                    : 'bg-white/[0.02] border-white/10 text-white/60 hover:border-white/20'
                }`}
              >
                <IconCash className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black uppercase">Efectivo / Cash</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  ${totalCash.toLocaleString('es-CL')} CLP
                </span>
                <span className="text-[10px] text-white/40">Egreso directo de caja</span>
              </button>
            </div>
          </div>

          {/* Si elige Crédito de Tienda, requiere cliente registrado */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-xs font-bold text-white/70 uppercase block">
              {payoutMethod === 'STORE_CREDIT'
                ? 'Cliente a quien abonar el Crédito (Requerido)'
                : 'Datos del Cliente (Opcional)'}
            </label>

            {selectedUser ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-cyan-500/30">
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedUser.name || 'Usuario'}
                  </p>
                  <p className="text-xs text-cyan-400 font-mono">
                    {selectedUser.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="text-xs text-white/40 hover:text-white underline"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  placeholder="Buscar usuario por nombre o email..."
                  className="w-full px-3 py-2.5 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />

                {searchingCustomer && (
                  <p className="text-[11px] text-white/40">Buscando usuarios...</p>
                )}

                {customerResults.length > 0 && (
                  <div className="max-h-36 overflow-y-auto bg-[#07090E] border border-white/10 rounded-xl divide-y divide-white/5">
                    {customerResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setCustomerSearchTerm('');
                          setCustomerResults([]);
                        }}
                        className="w-full text-left p-2.5 hover:bg-white/5 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{u.name || 'Usuario'}</p>
                          <p className="text-[10px] text-white/40">{u.email}</p>
                        </div>
                        <span className="text-[10px] text-cyan-400 font-bold">Seleccionar</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Campos manuales de nombre si no está registrado */}
                {payoutMethod === 'CASH' && !selectedUser && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Nombre del cliente"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="RUT o Teléfono"
                      value={customerRut}
                      onChange={(e) => setCustomerRut(e.target.value)}
                      className="px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notas u observaciones */}
          <div>
            <label className="text-xs font-bold text-white/50 uppercase block mb-1">
              Notas u observaciones (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Cartas de Magic recibidas en buen estado"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white"
            />
          </div>

          {/* Resumen Final */}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
            <span className="text-xs text-white/60">Total a desembolsar / abonar:</span>
            <span className="font-mono text-lg font-black text-emerald-400">
              ${selectedAmount.toLocaleString('es-CL')} CLP
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isProcessing || (payoutMethod === 'STORE_CREDIT' && !selectedUser)}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-black uppercase text-white shadow-lg shadow-emerald-600/30"
            >
              {isProcessing ? 'Procesando...' : 'Confirmar Compra'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

