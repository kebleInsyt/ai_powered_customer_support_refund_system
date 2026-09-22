'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Customer, Order, RefundEvaluationResponse } from '../lib/types';
import { fetchCustomers, fetchCustomerDetails, submitRefundRequest } from '../lib/api';
import CustomerSelector from '../components/CustomerSelector';
import OrderSummaryCard from '../components/OrderSummaryCard';
import RefundForm from '../components/RefundForm';
import DecisionResultCard from '../components/DecisionResultCard';
import { ShieldCheck } from 'lucide-react';

export default function CustomerPortalPage() {
  const queryClient = useQueryClient();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_001');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [decision, setDecision] = useState<RefundEvaluationResponse | null>(null);

  // Fetch 15 Customer Profiles
  const { data: customers = [], isLoading: isLoadingCustomers, error: customersError } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  // Automatically select first customer when loaded
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // 2. TanStack Query: Fetch Selected Customer Details & Orders
  const { data: customerDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['customer', selectedCustomerId],
    queryFn: () => fetchCustomerDetails(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  const activeOrder: Order | null = customerDetails?.orders && customerDetails.orders.length > 0
    ? customerDetails.orders[0]
    : null;

  // Pre-select first item when order changes
  useEffect(() => {
    if (activeOrder?.items && activeOrder.items.length > 0) {
      setSelectedItemIds([activeOrder.items[0].id]);
    } else {
      setSelectedItemIds([]);
    }
    setDecision(null);
  }, [activeOrder?.id]);

  // 3. TanStack Mutation: Evaluate Refund Request
  const evaluateMutation = useMutation({
    mutationFn: submitRefundRequest,
    onSuccess: (result) => {
      setDecision(result);
      // Invalidate admin queries so the support dashboard updates in real time
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setDecision(null);
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (!activeOrder?.items) return;
    if (selectedItemIds.length === activeOrder.items.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(activeOrder.items.map((i) => i.id));
    }
  };

  const handleSubmitRefund = (reason: string) => {
    if (!activeOrder || selectedItemIds.length === 0) return;
    evaluateMutation.mutate({
      customerId: selectedCustomerId,
      orderId: activeOrder.id,
      selectedItemIds,
      customerExplanation: reason,
    });
  };

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId) || customerDetails || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-3 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Customer Dispute Resolution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Customer Refund Resolution Portal
          </h1>
          <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
            Process customer return and refund claims against defined store policies, delivery verification records, and item condition assessments.
          </p>
        </div>
      </div>

      {(customersError || evaluateMutation.isError) && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-semibold">
          Error: {(evaluateMutation.error as Error)?.message || (customersError as Error)?.message || 'Service error'}
        </div>
      )}

      {/* Grid: Left Column (Customer & Order), Right Column (Form & Result) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Persona & Order Context */}
        <div className="lg:col-span-5 space-y-6">
          <CustomerSelector
            customers={customers}
            selectedCustomer={currentCustomer}
            onSelect={handleSelectCustomer}
            isLoading={isLoadingCustomers || isLoadingDetails}
          />

          <OrderSummaryCard
            order={activeOrder}
            selectedItemIds={selectedItemIds}
            onToggleItem={handleToggleItem}
            onSelectAll={handleSelectAll}
          />
        </div>

        {/* Right: Refund Request & Decision Card */}
        <div className="lg:col-span-7 space-y-6">
          {decision ? (
            <DecisionResultCard decision={decision} onReset={() => setDecision(null)} />
          ) : (
            <RefundForm
              onSubmit={handleSubmitRefund}
              isLoading={evaluateMutation.isPending}
              selectedItemCount={selectedItemIds.length}
            />
          )}

          {/* Business Policy Summary */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Refund Policy & Dispute Resolution Rules</span>
            </h4>
            <p>
              1. <strong>Eligibility Window</strong>: Items must be within 30 days of documented courier delivery.
            </p>
            <p>
              2. <strong>Condition Assessment</strong>: Damaged, defective, or incorrect items qualify for expedited approval with customer explanation.
            </p>
            <p>
              3. <strong>Supervisory Review</strong>: Claims over $500, delivery disputes, or high-risk accounts are routed for supervisor sign-off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
