export type RefundStatus = 'Approved' | 'Denied' | 'Escalated';
export type LoyaltyTier = 'Standard' | 'Silver' | 'Gold' | 'VIP';

export interface Customer {
  id: string;
  name: string;
  email: string;
  loyalty_tier: LoyaltyTier;
  account_created_at: string;
  total_orders_count: number;
  total_refunds_count: number;
  refund_risk_score: number;
  notes?: string;
  orders?: Order[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  is_final_sale: number;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  order_date: string;
  total_amount: number;
  status: 'Delivered' | 'In Transit' | 'Returned' | 'Cancelled';
  delivery_date: string | null;
  tracking_carrier: string | null;
  tracking_number: string | null;
  signed_by: string | null;
  items?: OrderItem[];
}

export interface RefundRequest {
  id: string;
  order_id: string;
  customer_id: string;
  requested_amount: number;
  status: RefundStatus;
  decision_reason: string;
  customer_explanation: string;
  policy_flags: string;
  ai_confidence: number;
  customer_facing_message: string;
  prompt_injection_detected: number;
  created_at: string;
  resolved_by?: string | null;
  resolved_at?: string | null;
  admin_notes?: string | null;
  customer_name?: string;
  customer_email?: string;
  order_number?: string;
}

export interface AuditLog {
  id: string;
  refund_id: string;
  raw_prompt: string;
  raw_llm_response: string;
  deterministic_flags: string;
  prompt_injection_detected: number;
  created_at: string;
}

export interface RefundEvaluationResponse {
  refundId: string;
  status: RefundStatus;
  customerFacingMessage: string;
  internalReasoning: string;
  policyCitations: string[];
  confidence: number;
  promptInjectionDetected: boolean;
  securityNotice?: string;
  deterministicFlags: string[];
  requestedAmount: number;
  createdAt: string;
}

export interface DashboardStats {
  totalRequests: number;
  approved: number;
  denied: number;
  escalated: number;
  promptInjections: number;
}
