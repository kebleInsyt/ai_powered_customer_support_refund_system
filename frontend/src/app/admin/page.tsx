'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefundRequest, DashboardStats, AuditLog, Order, Customer } from '../../lib/types';
import { fetchRefunds, fetchStats, fetchRefundDetails, fetchCustomers } from '../../lib/api';
import StatsCard from '../../components/StatsCard';
import AuditModal from '../../components/AuditModal';
import {
  Search,
  Filter,
  ShieldAlert,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  ReceiptText,
  Award,
  Calendar,
  ShoppingBag
} from 'lucide-react';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [adminView, setAdminView] = useState<'refunds' | 'crm'>('refunds');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Inspector Modal State
  const [activeRefund, setActiveRefund] = useState<RefundRequest | null>(null);
  const [activeAuditLog, setActiveAuditLog] = useState<AuditLog | undefined>(undefined);
  const [activeOrder, setActiveOrder] = useState<Order | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats (Auto-polls every 5s)
  const { data: stats = { totalRequests: 0, approved: 0, denied: 0, escalated: 0, promptInjections: 0 } } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
    refetchInterval: 5000,
  });

  // Refunds Table (Auto-polls every 5s)
  const { data: refunds = [], isLoading: isLoadingRefunds, isFetching: isFetchingRefunds, refetch: refetchRefunds } = useQuery({
    queryKey: ['refunds', selectedStatus],
    queryFn: () => fetchRefunds(selectedStatus),
    refetchInterval: 5000,
  });

  // Customer CRM Profiles
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const handleOpenInspector = async (refund: RefundRequest) => {
    setActiveRefund(refund);
    try {
      const details = await fetchRefundDetails(refund.id);
      setActiveAuditLog(details.auditLog);
      setActiveOrder(details.order);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Failed to load refund details:', err);
      setIsModalOpen(true);
    }
  };

  const filteredRefunds = refunds.filter((r) => {
    const term = searchTerm.toLowerCase();
    const matchesName = r.customer_name?.toLowerCase().includes(term);
    const matchesOrder = r.order_number?.toLowerCase().includes(term);
    const matchesId = r.id.toLowerCase().includes(term);
    return matchesName || matchesOrder || matchesId;
  });

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Operations Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time monitoring of automated customer refund decisions, AI reasoning telemetry, and CRM customer records.
          </p>
        </div>

        <button
          onClick={() => {
            refetchRefunds();
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
          }}
          disabled={isFetchingRefunds}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRefunds ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <StatsCard stats={stats} />

      {/* View Switcher Tabs: Refund Requests vs Customer CRM */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setAdminView('refunds')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${adminView === 'refunds'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <ReceiptText className="w-4 h-4" />
          <span>Refund Requests & Audit Logs</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            {refunds.length}
          </span>
        </button>

        <button
          onClick={() => setAdminView('crm')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${adminView === 'crm'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Customer CRM Profiles</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            {customers.length}
          </span>
        </button>
      </div>

      {/* VIEW 1: REFUND REQUESTS & AUDIT LOGS */}
      {adminView === 'refunds' && (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
              <span className="text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {['All', 'Approved', 'Denied', 'Escalated'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedStatus === status
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search customer, order, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Table of Refund Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Refund Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Order</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4">Decision</th>
                    <th className="py-3.5 px-4">Security</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {isLoadingRefunds && refunds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        Loading refund records...
                      </td>
                    </tr>
                  ) : filteredRefunds.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No refund requests found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredRefunds.map((r) => {
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                            #{r.id.slice(0, 14)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{r.customer_name || 'Customer'}</div>
                            <div className="text-[11px] text-slate-400">{r.customer_email}</div>
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            {r.order_number || r.order_id}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                            ${r.requested_amount.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            {r.status === 'Approved' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                              </span>
                            )}
                            {r.status === 'Denied' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" /> Denied
                              </span>
                            )}
                            {r.status === 'Escalated' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" /> Escalated
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {r.prompt_injection_detected === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                                <ShieldAlert className="w-3 h-3 text-rose-600" /> INJECTION
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Clean</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {new Date(r.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenInspector(r)}
                              className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors inline-flex items-center gap-1 font-semibold"
                              title="Inspect Decision Telemetry & Overrides"
                            >
                              <Eye className="w-4 h-4" />
                              <span>Inspect</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: CUSTOMER CRM DIRECTORY */}
      {adminView === 'crm' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Mock Database: 15 pre-seeded customer profiles with historical order counts and risk metrics.
            </span>
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{cust.name}</h3>
                    <p className="text-xs text-slate-400">{cust.email}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {cust.loyalty_tier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Orders / Refunds</span>
                    <span className="font-semibold text-slate-800">
                      {cust.total_orders_count} orders &bull; {cust.total_refunds_count} refunds
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Assessment</span>
                    <span
                      className={`font-semibold ${cust.refund_risk_score >= 0.5 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                    >
                      {(cust.refund_risk_score * 100).toFixed(0)}% Score
                    </span>
                  </div>
                </div>

                {cust.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50/70 p-2 rounded-lg border border-slate-100">
                    {cust.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Centered Modal: Refund Audit Inspector */}
      {isModalOpen && activeRefund && (
        <AuditModal
          refund={activeRefund}
          auditLog={activeAuditLog}
          order={activeOrder}
          onClose={() => setIsModalOpen(false)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['refunds'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
