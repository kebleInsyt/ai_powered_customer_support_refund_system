import { Customer, Order, RefundRequest, RefundEvaluationResponse, DashboardStats, AuditLog } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/api/customers`);
  if (!res.ok) throw new Error('Failed to load customers');
  const json = await res.json();
  return json.data;
}

export async function fetchCustomerDetails(id: string): Promise<Customer> {
  const res = await fetch(`${API_BASE}/api/customers/${id}`);
  if (!res.ok) throw new Error('Failed to load customer details');
  const json = await res.json();
  return json.data;
}

export async function fetchOrderDetails(orderId: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
  if (!res.ok) throw new Error('Failed to load order details');
  const json = await res.json();
  return json.data;
}

export async function submitRefundRequest(payload: {
  customerId: string;
  orderId: string;
  selectedItemIds: string[];
  customerExplanation: string;
  customRequestedAmount?: number;
}): Promise<RefundEvaluationResponse> {
  const res = await fetch(`${API_BASE}/api/refunds/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error || 'Refund evaluation failed');
  }
  return json.data;
}

export async function fetchRefunds(status?: string): Promise<RefundRequest[]> {
  const url = status && status !== 'All' ? `${API_BASE}/api/refunds?status=${status}` : `${API_BASE}/api/refunds`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load refunds');
  const json = await res.json();
  return json.data;
}

export async function fetchRefundDetails(id: string): Promise<{ refund: RefundRequest; auditLog?: AuditLog; order?: Order }> {
  const res = await fetch(`${API_BASE}/api/refunds/${id}`);
  if (!res.ok) throw new Error('Failed to load refund details');
  const json = await res.json();
  return json.data;
}

export async function resolveRefund(id: string, status: string, resolvedBy: string, adminNotes?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/refunds/${id}/resolve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, resolvedBy, adminNotes }),
  });
  if (!res.ok) throw new Error('Failed to resolve refund');
}

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/api/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  const json = await res.json();
  return json.data;
}
