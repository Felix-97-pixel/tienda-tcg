"use client";
import React from 'react';
import { PosCartItem } from './PosCart';

export interface PosReceiptData {
  orderNumber: string;
  storeName: string;
  cashierName: string;
  createdAt: string;
  items: PosCartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  receivedAmount?: number;
  changeAmount?: number;
  voucherRef?: string;
  customerName?: string;
  customerRut?: string;
  isOffline?: boolean;
}

interface PosReceiptProps {
  receipt: PosReceiptData | null;
}

export default function PosReceipt({ receipt }: PosReceiptProps) {
  if (!receipt) return null;

  const paymentLabels: Record<string, string> = {
    CASH: 'EFECTIVO',
    CARD_POS: 'TARJETA (MAQUINITA)',
    TRANSFER: 'TRANSFERENCIA BANCARIA',
    STORE_CREDIT: 'CRÉDITO EN TIENDA',
    MIXED: 'PAGO MIXTO',
  };

  return (
    <div id="pos-receipt-print" className="hidden print:block text-black bg-white p-4 font-mono text-xs w-[80mm] mx-auto leading-tight">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #pos-receipt-print,
          #pos-receipt-print * {
            visibility: visible;
          }
          #pos-receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 4mm;
            margin: 0;
            background: #fff;
            color: #000;
          }
        }
      `}</style>

      {/* Cabecera */}
      <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-400">
        <h1 className="text-base font-black tracking-tight uppercase">
          {receipt.storeName || 'TAPTRADE TCG STORE'}
        </h1>
        <p className="text-[10px] text-gray-600">COMPROBANTE INTERNO DE VENTA</p>
        <p className="text-[10px] text-gray-600">{receipt.createdAt}</p>
        <p className="text-xs font-bold pt-1">TICKET #{receipt.orderNumber}</p>
        {receipt.isOffline && (
          <p className="text-[9px] font-bold uppercase">[ VENTA MODO SIN CONEXIÓN ]</p>
        )}
      </div>

      {/* Info Venta */}
      <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-400">
        <div className="flex justify-between">
          <span>Atendido por:</span>
          <span className="font-bold">{receipt.cashierName}</span>
        </div>
        {receipt.customerName && (
          <div className="flex justify-between">
            <span>Cliente:</span>
            <span>{receipt.customerName}</span>
          </div>
        )}
        {receipt.customerRut && (
          <div className="flex justify-between">
            <span>RUT:</span>
            <span>{receipt.customerRut}</span>
          </div>
        )}
      </div>

      {/* Detalle de Productos */}
      <div className="py-2 border-b border-dashed border-gray-400 space-y-1.5">
        <div className="flex justify-between font-bold text-[10px] border-b border-gray-300 pb-1">
          <span>DESCRIPCIÓN</span>
          <span>TOTAL</span>
        </div>
        {receipt.items.map((item) => (
          <div key={item.inventoryItemId} className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold truncate pr-2">{item.name}</span>
              <span className="font-bold whitespace-nowrap">
                ${(item.unitPrice * item.quantity).toLocaleString('es-CL')}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span>
                {item.quantity} x ${item.unitPrice.toLocaleString('es-CL')}
                {item.conditionLabel ? ` [${item.conditionLabel}]` : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div className="py-2 space-y-1 border-b border-dashed border-gray-400">
        <div className="flex justify-between text-xs">
          <span>Subtotal:</span>
          <span>${receipt.subtotal.toLocaleString('es-CL')}</span>
        </div>
        {receipt.discountAmount > 0 && (
          <div className="flex justify-between text-xs text-gray-700">
            <span>Descuento:</span>
            <span>-${receipt.discountAmount.toLocaleString('es-CL')}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-black pt-1 border-t border-gray-400">
          <span>TOTAL:</span>
          <span>${receipt.total.toLocaleString('es-CL')}</span>
        </div>
      </div>

      {/* Forma de Pago */}
      <div className="py-2 text-[10px] space-y-0.5 border-b border-dashed border-gray-400">
        <div className="flex justify-between">
          <span>Forma de Pago:</span>
          <span className="font-bold">
            {paymentLabels[receipt.paymentMethod] || receipt.paymentMethod}
          </span>
        </div>
        {receipt.receivedAmount !== undefined && receipt.receivedAmount > 0 && (
          <div className="flex justify-between">
            <span>Pagó con:</span>
            <span>${receipt.receivedAmount.toLocaleString('es-CL')}</span>
          </div>
        )}
        {receipt.changeAmount !== undefined && receipt.changeAmount > 0 && (
          <div className="flex justify-between font-bold">
            <span>Vuelto:</span>
            <span>${receipt.changeAmount.toLocaleString('es-CL')}</span>
          </div>
        )}
        {receipt.voucherRef && (
          <div className="flex justify-between">
            <span>Voucher / Ref:</span>
            <span>{receipt.voucherRef}</span>
          </div>
        )}
      </div>

      {/* Pie Legal */}
      <div className="text-center pt-3 text-[9px] text-gray-500 space-y-1">
        <p>¡Gracias por tu compra!</p>
        <p className="leading-tight">
          En compras con tarjeta (maquinita), su voucher es su boleta oficial conforme a resolución del SII.
        </p>
        <p className="pt-1 text-[8px] text-gray-400">Powered by TapTrade POS</p>
      </div>
    </div>
  );
}
