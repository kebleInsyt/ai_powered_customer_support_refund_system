'use client';

import { Order } from '../lib/types';
import { Package, Truck, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Props {
  order: Order | null;
  selectedItemIds: string[];
  onToggleItem: (itemId: string) => void;
  onSelectAll: () => void;
}

export default function OrderSummaryCard({ order, selectedItemIds, onToggleItem, onSelectAll }: Props) {
  if (!order) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500">
        <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
        <p className="text-sm">No active order loaded for this customer.</p>
      </div>
    );
  }

  const items = order.items || [];
  const allSelected = items.length > 0 && items.every((i) => selectedItemIds.includes(i.id));

  // Compute selected total
  const selectedTotal = items
    .filter((i) => selectedItemIds.includes(i.id))
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      {/* Order Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">{order.order_number}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {order.status}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Ordered: {new Date(order.order_date).toLocaleDateString()}
            </span>
            {order.delivery_date && (
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                Delivered: {new Date(order.delivery_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Order Total</span>
          <span className="text-lg font-bold text-slate-900">${order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Courier & Tracking Proof */}
      <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-slate-500">Carrier: </span>
          <span className="font-semibold text-slate-800">{order.tracking_carrier || 'Standard Post'}</span>
          {order.tracking_number && (
            <span className="ml-2 font-mono text-slate-600">({order.tracking_number})</span>
          )}
        </div>
        {order.signed_by && (
          <div className="text-slate-700">
            <span className="text-slate-500">Proof: </span>
            <span className="font-medium text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {order.signed_by}
            </span>
          </div>
        )}
      </div>

      {/* Item Selection List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Select Items to Refund</h4>
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors"
          >
            {allSelected ? 'Deselect All' : 'Select All Items'}
          </button>
        </div>

        <div className="space-y-2.5">
          {items.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onToggleItem(item.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${isSelected
                    ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 pointer-events-none"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 text-sm">{item.product_name}</span>
                      {item.is_final_sale === 1 && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Final Sale
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      SKU: {item.sku} &bull; Qty: {item.quantity} &bull; Category: {item.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-semibold text-sm text-slate-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Refund Subtotal */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Selected Refund Total:</span>
          <span className="text-base font-bold text-sky-700">${selectedTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
