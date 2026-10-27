"use client";
import React, { useState, useEffect } from 'react';
import { PosCartItem } from './PosCart';

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: PosCartItem[];
  totalAmount: number;
  discountAmount: number;
  isOnline: boolean;
  onConfirmSale: (payload: {
    paymentMethod: 'CASH' | 'CARD_POS' | 'TRANSFER' | 'STORE_CREDIT' | 'MIXED';
    receivedAmount?: number;
    changeAmount?: number;
    voucherRef?: string;
    customerName?: string;
    customerEmail?: string;
    customerRut?: string;
    storeCreditAmount?: number;
  }) => Promise<void>;
  isProcessing: boolean;
}

export default function PosCheckoutModal({
  isOpen,
  onClose,
  items,
  totalAmount,
  isOnline,
  onConfirmSale,
  isProcessing,
}: PosCheckoutModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'CARD_POS' | 'TRANSFER' | 'STORE_CREDIT'>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<number>(totalAmount);
  const [voucherRef, setVoucherRef] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerRut, setCustomerRut] = useState<string>('');
  const [storeCreditAmount, setStoreCreditAmount] = useState<number>(0);

  // Inicializar monto recibido con el total cada vez que abre el modal
  useEffect(() => {
    if (isOpen) {
      setReceivedAmount(totalAmount);
      setVoucherRef('');
    }
  }, [isOpen, totalAmount]);

  // Atajo de escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const change = Math.max(0, receivedAmount - totalAmount);
  const isValidCash = receivedAmount >= totalAmount;

  const handleQuickBill = (amount: number) => {
    setReceivedAmount((prev) => prev + amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'CASH' && !isValidCash) return;

    await onConfirmSale({
      paymentMethod: selectedMethod,
      receivedAmount: selectedMethod === 'CASH' ? receivedAmount : undefined,
      changeAmount: selectedMethod === 'CASH' ? change : undefined,
      voucherRef: voucherRef.trim() || undefined,
      customerName: customerName.trim() || undefined,
      customerEmail: customerEmail.trim() || undefined,
      customerRut: customerRut.trim() || undefined,
      storeCreditAmount: selectedMethod === 'STORE_CREDIT' ? totalAmount : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0E121B] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-black text-white">Completar Cobro</h2>
            <p className="text-xs text-white/50 mt-0.5">
              {items.length} productos • Total: ${totalAmount.toLocaleString('es-CL')}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            type="button"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Selector de Método de Pago */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: 'Efectivo', tag: 'Caja' },
              { id: 'CARD_POS', label: 'Maquinita', tag: 'Tarjeta' },
              { id: 'TRANSFER', label: 'Transferencia', tag: 'Banco' },
              { id: 'STORE_CREDIT', label: 'Crédito', tag: 'Saldo' },
            ].map((method) => {
              const active = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    active
                      ? 'bg-red/15 border-red text-white shadow-md shadow-red/10'
                      : 'bg-white/[0.02] border-white/5 text-white/60 hover:border-white/15 hover:text-white'
                  }`}
                >
                  <span className="block text-xs uppercase tracking-widest font-black text-white/40 mb-1">
                    {method.tag}
                  </span>
                  <span className="block text-sm font-bold">{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Panel según Método Seleccionado */}
          {selectedMethod === 'CASH' && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/70">Monto entregado por cliente:</span>
                <span className="font-mono text-xl font-black text-white">
                  ${receivedAmount.toLocaleString('es-CL')}
                </span>
              </div>

              {/* Botones de billetes rápidos */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() => setReceivedAmount(totalAmount)}
                  className="py-2 px-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono font-bold text-xs hover:bg-white/10 transition-colors"
                >
                  Exacto
                </button>
                {[1000, 2000, 5000, 10000, 20000].map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => handleQuickBill(bill)}
                    className="py-2 px-2 rounded-xl bg-white/5 border border-white/10 text-white/80 font-mono font-bold text-xs hover:bg-red/10 hover:border-red/30 hover:text-white transition-colors"
                  >
                    +${bill / 1000}k
                  </button>
                ))}
              </div>

              {/* Input manual */}
              <input
                type="number"
                min={0}
                value={receivedAmount || ''}
                onChange={(e) => setReceivedAmount(Number(e.target.value) || 0)}
                placeholder="Digitar monto recibido..."
                className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white font-mono text-base font-bold placeholder-white/30 focus:outline-none focus:border-red"
              />

              {/* Vuelto calculado */}
              <div className="p-4 rounded-xl bg-[#07090E] border border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-white/70">VUELTO A DEVOLVER:</span>
                <span className={`font-mono text-2xl font-black ${change >= 0 ? 'text-emerald-400' : 'text-red'}`}>
                  ${change.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          )}

          {selectedMethod === 'CARD_POS' && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
                <p className="font-bold mb-1">Cobro con Maquinita (Compraquí, Transbank, SumUp, etc.):</p>
                <p>1. Digita <strong className="font-mono text-white text-sm">${totalAmount.toLocaleString('es-CL')}</strong> en tu terminal física.</p>
                <p>2. Pasa la tarjeta del cliente (CuentaRUT, Débito o Crédito).</p>
                <p>3. Ingresa opcionalmente el Nº de Voucher o Código de Aprobación abajo.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5">
                  Nº de Operación / Voucher (Opcional):
                </label>
                <input
                  type="text"
                  value={voucherRef}
                  onChange={(e) => setVoucherRef(e.target.value)}
                  placeholder="Ej: 004128 o AUTH-8931"
                  className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-red"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'TRANSFER' && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <p className="text-xs text-white/60">
                Verifica el abono de <strong className="text-white font-mono">${totalAmount.toLocaleString('es-CL')}</strong> en la cuenta bancaria de tu tienda antes de continuar.
              </p>
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5">
                  Referencia o RUT del emisor (Opcional):
                </label>
                <input
                  type="text"
                  value={voucherRef}
                  onChange={(e) => setVoucherRef(e.target.value)}
                  placeholder="Ej: Transf. Juan Pérez"
                  className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-red"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'STORE_CREDIT' && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <p className="text-xs text-white/60">
                Cobro total con saldo acumulado en tienda (Store Credit).
              </p>
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5">
                  RUT o Email del Jugador / Comprador:
                </label>
                <input
                  type="text"
                  value={customerRut}
                  onChange={(e) => setCustomerRut(e.target.value)}
                  placeholder="12.345.678-9 o correo@ejemplo.com"
                  className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-red"
                />
              </div>
            </div>
          )}

          {/* Datos del Cliente (Opcional) */}
          <div className="pt-2 border-t border-white/10">
            <details className="group">
              <summary className="text-xs font-bold text-white/50 cursor-pointer hover:text-white flex items-center justify-between py-1">
                <span>Datos del Cliente / Boleta Digital (Opcional)</span>
                <span className="text-[10px] text-white/30 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre cliente"
                  className="px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-red"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="correo@cliente.cl"
                  className="px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-red"
                />
              </div>
            </details>
          </div>

          {/* Botón Finalizar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isProcessing || (selectedMethod === 'CASH' && !isValidCash)}
              className="w-full py-4 rounded-xl bg-red hover:bg-red-light disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-red/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando venta...</span>
                </>
              ) : (
                <>
                  <span>Confirmar Venta & Emitir Ticket</span>
                  <span className="font-mono text-base">• ${totalAmount.toLocaleString('es-CL')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
