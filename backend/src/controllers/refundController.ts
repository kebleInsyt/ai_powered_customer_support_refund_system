import { Request, Response } from 'express';
import { z } from 'zod';
import {
  createRefundRequest,
  createAuditLog,
  getAllRefundRequests,
  getRefundDetails,
  updateRefundStatus,
  getStats,
  getCustomerById,
  getOrderById,
} from '../db/database.js';
import { PolicyEngine } from '../services/policyEngine.js';
import { SecurityGuard } from '../services/securityGuard.js';
import { AIService } from '../services/aiService.js';
import { RefundStatus } from '../types/index.js';

const submitRefundSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  selectedItemIds: z.array(z.string()).min(1, 'At least one item must be selected for refund'),
  customerExplanation: z.string().min(3, 'Please provide an explanation for your refund request'),
  customRequestedAmount: z.number().positive().optional(),
});

const resolveRefundSchema = z.object({
  status: z.enum(['Approved', 'Denied', 'Escalated']),
  resolvedBy: z.string().min(1, 'Support Agent name is required'),
  adminNotes: z.string().optional(),
});

export class RefundController {
  /**
   * Evaluates and processes a refund request through the safety guard,
   * policy engine and AI reasoning layer(Gemini is what we are using).
   */
  public static async submitRefund(req: Request, res: Response): Promise<void> {
    try {
      const parsed = submitRefundSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.format() });
        return;
      }

      const { customerId, orderId, selectedItemIds, customerExplanation, customRequestedAmount } = parsed.data;

      // Fetch customer and order ground truth
      const customer = getCustomerById(customerId);
      if (!customer) {
        res.status(404).json({ success: false, error: 'Customer profile not found' });
        return;
      }

      const order = getOrderById(orderId);
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      if (order.customer_id !== customer.id) {
        res.status(400).json({ success: false, error: 'Order does not belong to specified customer' });
        return;
      }

      // Filter selected items
      const selectedItems = (order.items || []).filter((item) => selectedItemIds.includes(item.id));
      if (selectedItems.length === 0) {
        res.status(400).json({ success: false, error: 'None of the selected items were found on this order' });
        return;
      }

      // Calculate total requested amount (sum of items unless custom amount provided)
      const calculatedAmount = selectedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const requestedAmount = customRequestedAmount ?? calculatedAmount;

      // Security Guard: Scan for prompt injection and sanitize
      const securityResult = SecurityGuard.inspectInput(customerExplanation);

      // Deterministic Policy Engine: Pre-evaluate hard rules
      const deterministicEval = PolicyEngine.evaluate({
        order,
        customer,
        requestedAmount,
        selectedItems,
        customerReason: customerExplanation,
      });

      //  AI Layer: Reasoning, sentiment, and response drafting
      const { result: evalResult, rawPrompt, rawResponse } = await AIService.evaluateRefund({
        customer,
        order,
        selectedItems,
        requestedAmount,
        customerExplanation,
        deterministicEval,
        securityResult,
      });

      // Store Refund Request in Database
      const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const createdAt = new Date().toISOString();

      createRefundRequest({
        id: refundId,
        order_id: order.id,
        customer_id: customer.id,
        requested_amount: requestedAmount,
        status: evalResult.status,
        decision_reason: evalResult.internalReasoning,
        customer_explanation: customerExplanation,
        policy_flags: JSON.stringify(evalResult.deterministicFlags),
        ai_confidence: evalResult.confidence,
        customer_facing_message: evalResult.customerFacingMessage,
        prompt_injection_detected: evalResult.promptInjectionDetected ? 1 : 0,
        created_at: createdAt,
        admin_notes: evalResult.securityNotice,
      });

      // Store Audit Log for Compliance & Support Inspection
      createAuditLog({
        id: `audit_${refundId}`,
        refund_id: refundId,
        raw_prompt: rawPrompt,
        raw_llm_response: rawResponse,
        deterministic_flags: JSON.stringify(evalResult.deterministicFlags),
        prompt_injection_detected: evalResult.promptInjectionDetected ? 1 : 0,
        created_at: createdAt,
      });

      res.status(201).json({
        success: true,
        data: {
          refundId,
          status: evalResult.status,
          customerFacingMessage: evalResult.customerFacingMessage,
          internalReasoning: evalResult.internalReasoning,
          policyCitations: evalResult.policyCitations,
          confidence: evalResult.confidence,
          promptInjectionDetected: evalResult.promptInjectionDetected,
          securityNotice: evalResult.securityNotice,
          deterministicFlags: evalResult.deterministicFlags,
          requestedAmount,
          createdAt,
        },
      });
    } catch (err: any) {
      console.error('Error submitting refund:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getRefunds(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      let refunds = getAllRefundRequests();
      if (status && typeof status === 'string' && ['Approved', 'Denied', 'Escalated'].includes(status)) {
        refunds = refunds.filter((r) => r.status === status);
      }
      res.json({ success: true, count: refunds.length, data: refunds });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getRefundDetails(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'ID parameter is missing' });
        return;
      }
      const details = getRefundDetails(id);
      if (!details) {
        res.status(404).json({ success: false, error: 'Refund record not found' });
        return;
      }
      res.json({ success: true, data: details });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async resolveRefund(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'ID parameter is missing' });
        return;
      }
      const parsed = resolveRefundSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ success: false, errors: parsed.error.format() });
        return;
      }

      const { status, resolvedBy, adminNotes } = parsed.data;
      updateRefundStatus(id, status as RefundStatus, resolvedBy, adminNotes);

      res.json({
        success: true,
        message: `Refund #${id} successfully updated to status "${status}" by ${resolvedBy}`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = getStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
