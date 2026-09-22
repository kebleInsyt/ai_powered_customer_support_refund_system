-- Customers table
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

-- Orders table
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

-- Order items table
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

-- Refund requests table
CREATE TABLE IF NOT EXISTS refund_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  requested_amount REAL NOT NULL,
  status TEXT NOT NULL, -- 'Approved', 'Denied', 'Escalated'
  decision_reason TEXT NOT NULL,
  customer_explanation TEXT NOT NULL,
  policy_flags TEXT NOT NULL, -- JSON array of tags
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

-- Audit logs table (for support agent / compliance review)
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
