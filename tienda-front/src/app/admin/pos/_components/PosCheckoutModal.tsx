import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PosCartItem } from './PosCart';
import { adminFetch } from '@/utils/api';
import { IconX, IconCheck, IconAlertTriangle, IconChevronDown } from '@/components/ui/Icons';

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
    userId?: string;
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
  const t = useTranslations("admin.pos_page");
  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'CARD_POS' | 'TRANSFER' | 'STORE_CREDIT'>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<number>(totalAmount);
  const [voucherRef, setVoucherRef] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerRut, setCustomerRut] = useState<string>('');
  const [storeCreditAmount, setStoreCreditAmount] = useState<number>(0);

  // Estados para búsqueda y verificación de saldo de Store Credit
  const [storeCreditsList, setStoreCreditsList] = useState<any[]>([]);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [selectedCreditCustomer, setSelectedCreditCustomer] = useState<any | null>(null);
  const [creditSearchQuery, setCreditSearchQuery] = useState('');

  // Inicializar monto recibido con el total cada vez que abre el modal
  useEffect(() => {
    if (isOpen) {
      setReceivedAmount(totalAmount);
      setVoucherRef('');
    }
  }, [isOpen, totalAmount]);

  // Cargar clientes con Store Credit cuando se activa ese método de pago
  useEffect(() => {
    if (isOpen && selectedMethod === 'STORE_CREDIT') {
      setIsLoadingCredits(true);
      adminFetch('/store-credit')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setStoreCreditsList(data);
            // Si ya había ingresado un email/RUT, intentar auto-seleccionar
            if (customerEmail || customerRut) {
              const term = (customerEmail || customerRut).toLowerCase().trim();
              const matched = data.find(
                (c) =>
                  c.user?.email?.toLowerCase() === term ||
                  c.user?.name?.toLowerCase().includes(term)
              );
              if (matched) setSelectedCreditCustomer(matched);
            }
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingCredits(false));
    }
  }, [isOpen, selectedMethod, customerEmail, customerRut]);

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

  const creditBalance = selectedCreditCustomer ? Number(selectedCreditCustomer.balance || 0) : 0;
  const isCreditSufficient = selectedCreditCustomer ? creditBalance >= totalAmount : true;

  const handleQuickBill = (amount: number) => {
    setReceivedAmount((prev) => prev + amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMethod === 'CASH' && !isValidCash) return;
    if (selectedMethod === 'STORE_CREDIT' && selectedCreditCustomer && !isCreditSufficient) return;

    await onConfirmSale({
      paymentMethod: selectedMethod,
      receivedAmount: selectedMethod === 'CASH' ? receivedAmount : undefined,
      changeAmount: selectedMethod === 'CASH' ? change : undefined,
      voucherRef: voucherRef.trim() || undefined,
      customerName: selectedCreditCustomer?.user?.name || customerName.trim() || undefined,
      customerEmail: selectedCreditCustomer?.user?.email || customerEmail.trim() || undefined,
      customerRut: customerRut.trim() || undefined,
      userId: selectedCreditCustomer?.userId || selectedCreditCustomer?.user?.id || undefined,
      storeCreditAmount: selectedMethod === 'STORE_CREDIT' ? totalAmount : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0E121B] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-black text-white">{t("complete_charge")}</h2>
            <p className="text-xs text-white/50 mt-0.5">
              {t("products_total_summary", { count: items.length, total: totalAmount.toLocaleString('es-CL') })}
            </p>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            type="button"
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Método de Pago */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'CASH', label: t('method_cash'), tag: t('tag_register') },
              { id: 'CARD_POS', label: t('method_card_pos'), tag: t('tag_card') },
              { id: 'TRANSFER', label: t('method_transfer'), tag: t('tag_bank') },
              { id: 'STORE_CREDIT', label: t('method_credit'), tag: t('tag_balance') },
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
                <span className="text-xs font-bold text-white/70">{t("amount_handed_by_customer")}</span>
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
                  {t("exact_btn")}
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
                placeholder={t("enter_received_amount")}
                className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white font-mono text-base font-bold placeholder-white/30 focus:outline-none focus:border-red"
              />

              {/* Vuelto calculado */}
              <div className="p-4 rounded-xl bg-[#07090E] border border-white/10 flex items-center justify-between">
                <span className="text-sm font-bold text-white/70">{t("change_to_return")}</span>
                <span className={`font-mono text-2xl font-black ${change >= 0 ? 'text-emerald-400' : 'text-red'}`}>
                  ${change.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          )}

          {selectedMethod === 'CARD_POS' && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
                <p className="font-bold mb-1">{t("card_pos_instructions_title")}</p>
                <p>{t("card_pos_step_1", { amount: totalAmount.toLocaleString('es-CL') })}</p>
                <p>{t("card_pos_step_2")}</p>
                <p>{t("card_pos_step_3")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5">
                  {t("voucher_number_opt")}
                </label>
                <input
                  type="text"
                  value={voucherRef}
                  onChange={(e) => setVoucherRef(e.target.value)}
                  placeholder={t("voucher_placeholder")}
                  className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white font-mono text-sm placeholder-white/30 focus:outline-none focus:border-red"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'TRANSFER' && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <p className="text-xs text-white/60">
                {t("transfer_verify_msg", { amount: totalAmount.toLocaleString('es-CL') })}
              </p>
              <div>
                <label className="block text-xs font-bold text-white/70 mb-1.5">
                  {t("transfer_ref_opt")}
                </label>
                <input
                  type="text"
                  value={voucherRef}
                  onChange={(e) => setVoucherRef(e.target.value)}
                  placeholder={t("transfer_ref_placeholder")}
                  className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-red"
                />
              </div>
            </div>
          )}

          {selectedMethod === 'STORE_CREDIT' && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{t("store_credit_payment_title")}</h3>
                  <p className="text-xs text-white/50">{t("store_credit_payment_desc")}</p>
                </div>
                {isLoadingCredits && (
                  <div className="w-4 h-4 border-2 border-red border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {selectedCreditCustomer ? (
                <div className="p-4 rounded-xl bg-[#090C13] border border-white/10 space-y-3 font-mono">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                    <div>
                      <span className="text-white font-bold block text-sm">
                        {selectedCreditCustomer.user?.name || t('default_customer')}
                      </span>
                      <span className="text-white/50 text-[11px]">
                        {selectedCreditCustomer.user?.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCreditCustomer(null)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] border border-white/10 transition-colors"
                    >
                      {t("change_btn")}
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] text-white/40 block">{t("current_balance")}</span>
                      <span className="font-bold text-white text-xs sm:text-sm">
                        ${creditBalance.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] text-white/40 block">{t("total_sale")}</span>
                      <span className="font-bold text-red text-xs sm:text-sm">
                        -${totalAmount.toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                      <span className="text-[10px] text-white/40 block">{t("new_balance")}</span>
                      <span className={`font-bold text-xs sm:text-sm ${isCreditSufficient ? 'text-emerald-400' : 'text-red'}`}>
                        ${Math.max(0, creditBalance - totalAmount).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>

                  {isCreditSufficient ? (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                      <IconCheck className="w-4 h-4 shrink-0" />
                      <span>{t("sufficient_balance_msg", { amount: totalAmount.toLocaleString('es-CL') })}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-red/10 border border-red/20 text-red text-xs flex items-center gap-2">
                      <IconAlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        {t("insufficient_balance_msg", { amount: (totalAmount - creditBalance).toLocaleString('es-CL') })}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-white/70 mb-1.5">
                      {t("search_registered_credit_customer")}
                    </label>
                    <input
                      type="text"
                      value={creditSearchQuery}
                      onChange={(e) => {
                        setCreditSearchQuery(e.target.value);
                        setCustomerRut(e.target.value);
                      }}
                      placeholder={t("search_credit_customer_placeholder")}
                      className="w-full px-4 py-3 bg-[#07090E] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-red"
                    />
                  </div>

                  {/* Lista de clientes coincidentes */}
                  <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-white/10 p-2 bg-[#07090E]">
                    {storeCreditsList.length === 0 ? (
                      <p className="text-xs text-white/40 text-center py-3">
                        {isLoadingCredits ? t('loading_customers') : t('no_credit_customers')}
                      </p>
                    ) : (
                      storeCreditsList
                        .filter((c) => {
                          if (!creditSearchQuery) return true;
                          const q = creditSearchQuery.toLowerCase();
                          return (
                            c.user?.name?.toLowerCase().includes(q) ||
                            c.user?.email?.toLowerCase().includes(q)
                          );
                        })
                        .map((c) => (
                          <button
                            key={c.id || c.userId}
                            type="button"
                            onClick={() => {
                              setSelectedCreditCustomer(c);
                              setCustomerEmail(c.user?.email || '');
                              setCustomerName(c.user?.name || '');
                            }}
                            className="w-full p-2.5 rounded-lg bg-white/[0.02] hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between text-left group"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="text-xs font-bold text-white group-hover:text-red transition-colors block truncate">
                                {c.user?.name || t('default_customer')}
                              </span>
                              <span className="text-[11px] text-white/40 truncate block font-mono">
                                {c.user?.email}
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs shrink-0">
                              ${Number(c.balance || 0).toLocaleString('es-CL')}
                            </span>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Datos del Cliente (Opcional) */}
          <div className="pt-2 border-t border-white/10">
            <details className="group">
              <summary className="text-xs font-bold text-white/50 cursor-pointer hover:text-white flex items-center justify-between py-1">
                <span>{t("customer_digital_receipt_opt")}</span>
                <span className="text-[10px] text-white/30 group-open:rotate-180 transition-transform"><IconChevronDown className="w-3.5 h-3.5" /></span>
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t("customer_name_placeholder")}
                  className="px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-red"
                />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t("customer_email_placeholder")}
                  className="px-3 py-2 bg-[#07090E] border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-red"
                />
              </div>
            </details>
          </div>

          {/* Botón Finalizar */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={
                isProcessing ||
                (selectedMethod === 'CASH' && !isValidCash) ||
                (selectedMethod === 'STORE_CREDIT' && (!selectedCreditCustomer && !customerEmail.trim() && !customerRut.trim())) ||
                (selectedMethod === 'STORE_CREDIT' && selectedCreditCustomer && !isCreditSufficient)
              }
              className="w-full py-4 rounded-xl bg-red hover:bg-red-light disabled:opacity-40 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-red/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t("processing_sale")}</span>
                </>
              ) : (
                <>
                  <span>{t("confirm_sale_emit_ticket")}</span>
                  <span className="font-mono text-base">• ${totalAmount.toLocaleString('es-CL')} CLP</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
