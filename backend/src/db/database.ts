import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { Customer, Order, OrderItem, RefundRequest, AuditLog, RefundStatus } from '../types/index.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.resolve(DB_DIR, 'refunds.db');
export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode for reliability
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Embedded schema DDL ensures zero file-resolution issues in Docker or bundled dist
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  loyalty_tier TEXT NOT NULL DEFAULT 'Standard',
  account_created_at TEXT NOT NULL,
  total_orders_count INTEGER NOT NULL DEFAULT 1,
  total_refunds_count INTEGER NOT NULL DEFAULT 0,
  refund_risk_score REAL NOT NULL DEFAULT 0.0,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  order_number TEXT UNIQUE NOT NULL,
  order_date TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Delivered',
  delivery_date TEXT,
  tracking_carrier TEXT,
  tracking_number TEXT,
  signed_by TEXT,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_final_sale INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS refund_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  requested_amount REAL NOT NULL,
  status TEXT NOT NULL,
  decision_reason TEXT NOT NULL,
  customer_explanation TEXT NOT NULL,
  policy_flags TEXT NOT NULL,
  ai_confidence REAL NOT NULL DEFAULT 1.0,
  customer_facing_message TEXT NOT NULL,
  prompt_injection_detected INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  resolved_by TEXT,
  resolved_at TEXT,
  admin_notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  refund_id TEXT NOT NULL,
  raw_prompt TEXT NOT NULL,
  raw_llm_response TEXT NOT NULL,
  deterministic_flags TEXT NOT NULL,
  prompt_injection_detected INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (refund_id) REFERENCES refund_requests(id)
);
`;

db.exec(SCHEMA_SQL);

// Auto-seed if database is brand new and unseeded
try {
  const custCount = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  if (!custCount || custCount.count === 0) {
    import('./seed.js').then((mod) => mod.seedDatabase()).catch((err) => {
      console.warn('Auto-seed deferred:', err.message);
    });
  }
} catch (err: any) {
  console.warn('Auto-seed check skipped:', err.message);
}

// ----------------- Database Queries -----------------

export function getAllCustomers(): Customer[] {
  return db.prepare('SELECT * FROM customers ORDER BY name ASC').all() as unknown as Customer[];
}

export function getCustomerById(id: string): Customer | undefined {
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as unknown as Customer | undefined;
}

export function getOrdersByCustomerId(customerId: string): Order[] {
  const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC').all(customerId) as unknown as Order[];
  for (const order of orders) {
    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as unknown as OrderItem[];
  }
  return orders;
}

export function getOrderById(orderId: string): Order | undefined {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as unknown as Order | undefined;
  if (order) {
    order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id) as unknown as OrderItem[];
  }
  return order;
}

export function createRefundRequest(refund: {
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
  admin_notes?: string;
}): void {
  const stmt = db.prepare(`
    INSERT INTO refund_requests (
      id, order_id, customer_id, requested_amount, status,
      decision_reason, customer_explanation, policy_flags,
      ai_confidence, customer_facing_message, prompt_injection_detected,
      created_at, admin_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    refund.id,
    refund.order_id,
    refund.customer_id,
    refund.requested_amount,
    refund.status,
    refund.decision_reason,
    refund.customer_explanation,
    refund.policy_flags,
    refund.ai_confidence,
    refund.customer_facing_message,
    refund.prompt_injection_detected,
    refund.created_at,
    refund.admin_notes || null
  );
}

export function createAuditLog(log: {
  id: string;
  refund_id: string;
  raw_prompt: string;
  raw_llm_response: string;
  deterministic_flags: string;
  prompt_injection_detected: number;
  created_at: string;
}): void {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (
      id, refund_id, raw_prompt, raw_llm_response,
      deterministic_flags, prompt_injection_detected, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    log.id,
    log.refund_id,
    log.raw_prompt,
    log.raw_llm_response,
    log.deterministic_flags,
    log.prompt_injection_detected,
    log.created_at
  );
}

export function getAllRefundRequests(): RefundRequest[] {
  const sql = `
    SELECT 
      r.*,
      c.name AS customer_name,
      c.email AS customer_email,
      o.order_number
    FROM refund_requests r
    JOIN customers c ON r.customer_id = c.id
    JOIN orders o ON r.order_id = o.id
    ORDER BY r.created_at DESC
  `;
  return db.prepare(sql).all() as unknown as RefundRequest[];
}

export function getRefundDetails(refundId: string): { refund: RefundRequest; auditLog?: AuditLog; order?: Order } | null {
  const refundSql = `
    SELECT 
      r.*,
      c.name AS customer_name,
      c.email AS customer_email,
      o.order_number
    FROM refund_requests r
    JOIN customers c ON r.customer_id = c.id
    JOIN orders o ON r.order_id = o.id
    WHERE r.id = ?
  `;
  const refund = db.prepare(refundSql).get(refundId) as unknown as RefundRequest | undefined;
  if (!refund) return null;

  const auditLog = db.prepare('SELECT * FROM audit_logs WHERE refund_id = ?').get(refundId) as unknown as AuditLog | undefined;
  const order = getOrderById(refund.order_id);

  return { refund, auditLog, order };
}

export function updateRefundStatus(
  refundId: string,
  status: RefundStatus,
  resolvedBy: string,
  adminNotes?: string
): void {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE refund_requests 
    SET status = ?, resolved_by = ?, resolved_at = ?, admin_notes = ?
    WHERE id = ?
  `).run(status, resolvedBy, now, adminNotes || null, refundId);
}

export function getStats() {
  const total = db.prepare('SELECT COUNT(*) as count FROM refund_requests').get() as { count: number };
  const approved = db.prepare("SELECT COUNT(*) as count FROM refund_requests WHERE status = 'Approved'").get() as { count: number };
  const denied = db.prepare("SELECT COUNT(*) as count FROM refund_requests WHERE status = 'Denied'").get() as { count: number };
  const escalated = db.prepare("SELECT COUNT(*) as count FROM refund_requests WHERE status = 'Escalated'").get() as { count: number };
  const promptInjections = db.prepare('SELECT COUNT(*) as count FROM refund_requests WHERE prompt_injection_detected = 1').get() as { count: number };

  return {
    totalRequests: total?.count || 0,
    approved: approved?.count || 0,
    denied: denied?.count || 0,
    escalated: escalated?.count || 0,
    promptInjections: promptInjections?.count || 0,
  };
}
