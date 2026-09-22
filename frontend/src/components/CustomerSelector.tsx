'use client';

import { Customer } from '../lib/types';
import { User, ShieldAlert, Award, ChevronDown } from 'lucide-react';

interface Props {
  customers: Customer[];
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer) => void;
  isLoading: boolean;
}

export default function CustomerSelector({ customers, selectedCustomer, onSelect, isLoading }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-sky-600" />
          <span>Active Customer Persona (Test Bench)</span>
        </label>
        <span className="text-xs text-slate-500 font-medium">{customers.length} Profiles Available</span>
      </div>

      <div className="relative">
        <select
          value={selectedCustomer?.id || ''}
          onChange={(e) => {
            const found = customers.find((c) => c.id === e.target.value);
            if (found) onSelect(found);
          }}
          disabled={isLoading || customers.length === 0}
          className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all cursor-pointer disabled:opacity-50"
        >
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.loyalty_tier}) &bull; {c.notes || c.email}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {selectedCustomer && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block">Email</span>
            <span className="font-semibold text-slate-800 truncate block" title={selectedCustomer.email}>
              {selectedCustomer.email}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block">Loyalty Tier</span>
            <span className="font-semibold text-sky-700 flex items-center gap-1">
              <Award className="w-3 h-3" />
              {selectedCustomer.loyalty_tier}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block">Order History</span>
            <span className="font-semibold text-slate-800">
              {selectedCustomer.total_orders_count} orders ({selectedCustomer.total_refunds_count} refunds)
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block">Risk Score</span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                selectedCustomer.refund_risk_score >= 0.5 ? 'text-rose-600 font-bold' : 'text-emerald-700'
              }`}
            >
              {selectedCustomer.refund_risk_score >= 0.5 && <ShieldAlert className="w-3 h-3" />}
              {(selectedCustomer.refund_risk_score * 100).toFixed(0)}% Risk
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
