import { Customer, Order, OrderItem, RefundStatus } from '../types/index.js';
import { REFUND_POLICY } from '../config/policy.js';

export interface DeterministicEvaluation {
  flags: string[];
  mandatoryAction?: RefundStatus; // Hard override if strict deterministic rule applies
  reasons: string[];
  policyCitations: string[];
  daysSinceDelivery: number;
}

export class PolicyEngine {
  /**
   * Evaluates deterministic business rules against database ground truth.
   * Runs BEFORE and AFTER LLM inference to guarantee strict adherence to store policy.
   */
  public static evaluate(params: {
    order: Order;
    customer: Customer;
    requestedAmount: number;
    selectedItems: OrderItem[];
    customerReason: string;
  }): DeterministicEvaluation {
    const { order, customer, requestedAmount, selectedItems, customerReason } = params;
    const flags: string[] = [];
    const reasons: string[] = [];
    const policyCitations: string[] = [];

    // Calculate days since delivery (or order date if delivery_date is missing)
    const refDateStr = order.delivery_date || order.order_date;
    const refDate = new Date(refDateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - refDate.getTime());
    const daysSinceDelivery = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Rule 1: Time limit (30 days)
    if (daysSinceDelivery > REFUND_POLICY.MAX_REFUND_WINDOW_DAYS) {
      flags.push('ORDER_TOO_OLD');
      reasons.push(`Order was delivered ${daysSinceDelivery} days ago, exceeding the ${REFUND_POLICY.MAX_REFUND_WINDOW_DAYS}-day return limit.`);
      policyCitations.push(`Policy Section 1: Orders older than ${REFUND_POLICY.MAX_REFUND_WINDOW_DAYS} days are ineligible for refunds.`);
    }

    // Rule 2: Final sale items cannot be refunded
    const finalSaleItems = selectedItems.filter((i) => i.is_final_sale === 1);
    if (finalSaleItems.length > 0) {
      flags.push('FINAL_SALE_ITEM');
      const itemNames = finalSaleItems.map((i) => i.product_name).join(', ');
      reasons.push(`The following items are designated Final Sale / Clearance and are non-refundable: ${itemNames}.`);
      policyCitations.push('Policy Section 2: Final sale and clearance items are strictly non-refundable.');
    }

    // Rule 3: High value refund (> $500 requires human escalation)
    if (requestedAmount > REFUND_POLICY.HIGH_VALUE_THRESHOLD_USD) {
      flags.push('EXCEEDS_500_THRESHOLD');
      reasons.push(`Requested refund amount ($${requestedAmount.toFixed(2)}) exceeds the $${REFUND_POLICY.HIGH_VALUE_THRESHOLD_USD.toFixed(2)} automated limit.`);
      policyCitations.push('Policy Section 3: Refunds over $500 require manual human supervisor approval.');
    }

    // Rule 4: Disputed / conflicting delivery
    const lowerReason = customerReason.toLowerCase();
    const claimsNeverReceived = lowerReason.includes('never received') || lowerReason.includes('not delivered') || lowerReason.includes('did not get');
    if (claimsNeverReceived && order.signed_by) {
      flags.push('DELIVERY_SIGNATURE_CONFLICT');
      reasons.push(`Customer claims order was not received, but courier record shows delivered and signed by "${order.signed_by}".`);
      policyCitations.push('Policy Section 5: Conflicting or disputed courier delivery records must be escalated for investigation.');
    }

    // Rule 5: High-risk customer account
    if (customer.refund_risk_score >= REFUND_POLICY.MAX_ALLOWED_REFUND_RISK_SCORE) {
      flags.push('HIGH_RISK_ACCOUNT');
      reasons.push(`Customer account exhibits elevated refund risk score (${customer.refund_risk_score.toFixed(2)}).`);
      policyCitations.push('Policy Section 5: Accounts with anomalous refund frequency must be escalated to Trust & Safety.');
    }

    // Rule 6: Requested amount exceeds total
    if (requestedAmount > order.total_amount) {
      flags.push('AMOUNT_EXCEEDS_ORDER_TOTAL');
      reasons.push(`Requested refund ($${requestedAmount.toFixed(2)}) exceeds the order total ($${order.total_amount.toFixed(2)}).`);
    }

    // Mandatory deterministic action (Defense-in-depth hard override)
    let mandatoryAction: RefundStatus | undefined = undefined;

    // Hard denials take precedence
    if (flags.includes('ORDER_TOO_OLD') || flags.includes('FINAL_SALE_ITEM') || flags.includes('AMOUNT_EXCEEDS_ORDER_TOTAL')) {
      mandatoryAction = 'Denied';
    }
    // Escalations take precedence over auto-approval
    else if (flags.includes('EXCEEDS_500_THRESHOLD') || flags.includes('DELIVERY_SIGNATURE_CONFLICT') || flags.includes('HIGH_RISK_ACCOUNT')) {
      mandatoryAction = 'Escalated';
    }

    return {
      flags,
      mandatoryAction,
      reasons,
      policyCitations,
      daysSinceDelivery,
    };
  }
}
