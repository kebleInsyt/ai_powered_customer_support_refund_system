import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { RefundController } from '../controllers/refundController.js';
import { REFUND_POLICY } from '../config/policy.js';

export const apiRouter = Router();

// Health Check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'customer-support-ai-refund-engine', timestamp: new Date().toISOString() });
});

// Policy Document endpoint
apiRouter.get('/policy', (req, res) => {
  res.json({
    success: true,
    policy: {
      maxRefundWindowDays: REFUND_POLICY.MAX_REFUND_WINDOW_DAYS,
      highValueThresholdUsd: REFUND_POLICY.HIGH_VALUE_THRESHOLD_USD,
      allowFinalSale: REFUND_POLICY.ALLOW_FINAL_SALE_REFUNDS,
      documentText: REFUND_POLICY.POLICY_DOCUMENT_TEXT,
    },
  });
});

// Customers endpoints
apiRouter.get('/customers', OrderController.getCustomers);
apiRouter.get('/customers/:id', OrderController.getCustomerDetails);

// Orders endpoints
apiRouter.get('/orders/:id', OrderController.getOrderDetails);

// Refund endpoints
apiRouter.post('/refunds/evaluate', RefundController.submitRefund);
apiRouter.get('/refunds', RefundController.getRefunds);
apiRouter.get('/refunds/:id', RefundController.getRefundDetails);
apiRouter.patch('/refunds/:id/resolve', RefundController.resolveRefund);

// Statistics endpoints
apiRouter.get('/stats', RefundController.getStats);
