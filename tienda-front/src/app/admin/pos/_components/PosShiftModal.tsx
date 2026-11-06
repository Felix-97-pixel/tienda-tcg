"use client";
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconX } from '@/components/ui/Icons';

interface PosShiftModalProps {
  isOpen: boolean;
  mode: 'OPEN' | 'CLOSE';
  onClose: () => void;
  onSubmitOpen: (cashierName: string, initialCash: number) => Promise<void>;
  onSubmitClose: (actualCash: number, notes?: string) => Promise<void>;
  currentShift: any;
  isProcessing: boolean;
}

export default function PosShiftModal({
  isOpen,
  mode,
  onClose,
  onSubmitOpen,
  onSubmitClose,
  currentShift,
  isProcessing,
}: PosShiftModalProps) {
  const t = useTranslations("pos_page");
  const [cashierName, setCashierName] = useState<string>('');
  const [initialCash, setInitialCash] = useState<number>(30000); // 30.000 fondo típico
  const [actualCash, setActualCash] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const expectedCash = Number(currentShift?.expectedCash || currentShift?.initialCash || 0);
  const difference = actualCash - expectedCash;

  const handleOpenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitOpen(cashierName.trim() || 'POS', initialCash);
  };

  const handleCloseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitClose(actualCash, notes.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-[#0E121B] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-lg font-black text-white">
            {mode === 'OPEN' ? t("open_shift") : t("shift_close_title")}
          </h2>
          <button
            onClick={onClose}
            disabled={isProcessing}
            type="button"
            className="text-white/40 hover:text-white"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {mode === 'OPEN' ? (
          <form onSubmit={handleOpenSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                {t("cashier_name_label")}
              </label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                placeholder={t("cashier_name_label")}
                className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-red"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                {t("initial_cash_label")}
              </label>
              <input
                type="number"
                min={0}
                value={initialCash}
                onChange={(e) => setInitialCash(Number(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-red"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              {isProcessing ? t("opening_register") : t("confirm_open_register")}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCloseSubmit} className="space-y-4">
            {/* Resumen del Sistema */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>{t("initial_float")}</span>
                <span className="font-mono font-bold text-white">
                  ${Number(currentShift?.initialCash || 0).toLocaleString('es-CL')}
                </span>
              </div>
              {Number(currentShift?.cashOutTotal || 0) > 0 && (
                <div className="flex justify-between text-white/60">
                  <span>{t("cash_out_card_buys")}</span>
                  <span className="font-mono font-bold text-red">
                    -${Number(currentShift?.cashOutTotal || 0).toLocaleString('es-CL')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-white/60 border-t border-white/5 pt-1.5">
                <span className="font-bold text-white/80">{t("expected_cash")}</span>
                <span className="font-mono font-bold text-emerald-400">
                  ${expectedCash.toLocaleString('es-CL')}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>{t("card_pos_sales")}</span>
                <span className="font-mono font-bold text-blue-400">
                  ${Number(currentShift?.cardTotal || 0).toLocaleString('es-CL')}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>{t("transfer_sales")}</span>
                <span className="font-mono font-bold text-purple-400">
                  ${Number(currentShift?.transferTotal || 0).toLocaleString('es-CL')}
                </span>
              </div>
            </div>

            {/* Dinero Físico Contado */}
            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                {t("counted_physical_cash")}
              </label>
              <input
                type="number"
                min={0}
                value={actualCash || ''}
                onChange={(e) => setActualCash(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white font-mono text-lg font-black focus:outline-none focus:border-red"
              />
            </div>

            {/* Descuadre */}
            <div className="p-3.5 rounded-xl bg-[#07090E] border border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-white/70">{t("difference_balance")}</span>
              <span
                className={`font-mono text-base font-bold ${
                  difference === 0
                    ? 'text-emerald-400'
                    : difference > 0
                    ? 'text-blue-400'
                    : 'text-red'
                }`}
              >
                {difference === 0
                  ? t("exact_zero")
                  : `${difference > 0 ? '+' : ''}$${difference.toLocaleString('es-CL')}`}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/70 mb-1.5">
                {t("shift_notes_label")}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={t("shift_notes_label")}
                className="w-full px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-red resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg"
            >
              {isProcessing ? t("closing_shift") : t("confirm_close_shift")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
