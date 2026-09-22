import { db } from './database.js';

export function seedDatabase(): void {
  console.log('Seeding CRM database with 15 customer personas and realistic orders...');

  // Helper to calculate relative date ISO strings
  const daysAgo = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

// Clear existing tables
db.exec('DELETE FROM audit_logs;');
db.exec('DELETE FROM refund_requests;');
db.exec('DELETE FROM order_items;');
db.exec('DELETE FROM orders;');
db.exec('DELETE FROM customers;');

// 1. Customers Data
const customers = [
  {
    id: 'cust_001',
    name: 'Alice Wright',
    email: 'alice.wright@example.com',
    loyalty_tier: 'VIP',
    account_created_at: daysAgo(420),
    total_orders_count: 18,
    total_refunds_count: 1,
    refund_risk_score: 0.05,
    notes: 'Long-time loyal customer, high lifetime value ($3,400+).',
  },
  {
    id: 'cust_002',
    name: 'Bob Miller',
    email: 'bob.miller@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(90),
    total_orders_count: 2,
    total_refunds_count: 0,
    refund_risk_score: 0.1,
    notes: 'Bought clearance streetwear on seasonal clearance.',
  },
  {
    id: 'cust_003',
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    loyalty_tier: 'Gold',
    account_created_at: daysAgo(310),
    total_orders_count: 8,
    total_refunds_count: 0,
    refund_risk_score: 0.08,
    notes: 'Purchased high-end electronics equipment.',
  },
  {
    id: 'cust_004',
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    loyalty_tier: 'Silver',
    account_created_at: daysAgo(210),
    total_orders_count: 5,
    total_refunds_count: 0,
    refund_risk_score: 0.12,
    notes: 'Infrequent shopper, trying to return winter wear late.',
  },
  {
    id: 'cust_005',
    name: 'Evan Reed',
    email: 'evan.reed@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(45),
    total_orders_count: 1,
    total_refunds_count: 0,
    refund_risk_score: 0.35,
    notes: 'First order dispute regarding courier delivery status.',
  },
  {
    id: 'cust_006',
    name: 'Fiona Gallagher',
    email: 'fiona.g@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(115),
    total_orders_count: 3,
    total_refunds_count: 0,
    refund_risk_score: 0.05,
    notes: 'Kitchenware shopper, received defective small appliance.',
  },
  {
    id: 'cust_007',
    name: 'George Clark',
    email: 'george.clark@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(60),
    total_orders_count: 7,
    total_refunds_count: 5,
    refund_risk_score: 0.85,
    notes: 'FLAGGED: Suspicious serial returner pattern detected across 5 orders.',
  },
  {
    id: 'cust_008',
    name: 'Hannah Abbott',
    email: 'hannah.abbott@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(180),
    total_orders_count: 4,
    total_refunds_count: 0,
    refund_risk_score: 0.05,
    notes: 'Received incorrect item SKU from warehouse fulfillment.',
  },
  {
    id: 'cust_009',
    name: 'Ian Malcolm',
    email: 'ian.chaos@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(15),
    total_orders_count: 1,
    total_refunds_count: 0,
    refund_risk_score: 0.4,
    notes: 'Security edge case persona testing adversarial prompt injections.',
  },
  {
    id: 'cust_010',
    name: 'Julia Roberts',
    email: 'julia.roberts@example.com',
    loyalty_tier: 'VIP',
    account_created_at: daysAgo(500),
    total_orders_count: 24,
    total_refunds_count: 1,
    refund_risk_score: 0.02,
    notes: 'Premier loyalty member returning one item from bundle.',
  },
  {
    id: 'cust_011',
    name: 'Kevin Bacon',
    email: 'kevin.bacon@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(85),
    total_orders_count: 2,
    total_refunds_count: 0,
    refund_risk_score: 0.1,
    notes: 'Furniture order arrived damaged during freight transit.',
  },
  {
    id: 'cust_012',
    name: 'Laura Croft',
    email: 'laura.croft@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(130),
    total_orders_count: 3,
    total_refunds_count: 0,
    refund_risk_score: 0.15,
    notes: 'Purchased non-refundable digital activation key.',
  },
  {
    id: 'cust_013',
    name: 'Michael Scott',
    email: 'michael.scott@example.com',
    loyalty_tier: 'Standard',
    account_created_at: daysAgo(200),
    total_orders_count: 6,
    total_refunds_count: 1,
    refund_risk_score: 0.3,
    notes: 'Office supplies order with quantity discrepancy.',
  },
  {
    id: 'cust_014',
    name: 'Nancy Drew',
    email: 'nancy.drew@example.com',
    loyalty_tier: 'Silver',
    account_created_at: daysAgo(300),
    total_orders_count: 9,
    total_refunds_count: 0,
    refund_risk_score: 0.1,
    notes: 'Porch piracy dispute requiring claims escalation.',
  },
  {
    id: 'cust_015',
    name: 'Oscar Martinez',
    email: 'oscar.martinez@example.com',
    loyalty_tier: 'Gold',
    account_created_at: daysAgo(380),
    total_orders_count: 11,
    total_refunds_count: 0,
    refund_risk_score: 0.05,
    notes: 'Standard return within 30-day window in original packaging.',
  },
];

const insertCust = db.prepare(`
  INSERT INTO customers (id, name, email, loyalty_tier, account_created_at, total_orders_count, total_refunds_count, refund_risk_score, notes)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const c of customers) {
  insertCust.run(c.id, c.name, c.email, c.loyalty_tier, c.account_created_at, c.total_orders_count, c.total_refunds_count, c.refund_risk_score, c.notes);
}

// 2. Orders & Order Items Data
const orders = [
  // 1. Alice Wright (Damaged dress, 6 days old, < $500 -> Expected: Approved)
  {
    id: 'ord_001',
    customer_id: 'cust_001',
    order_number: 'ORD-2026-1001',
    order_date: daysAgo(6),
    total_amount: 85.0,
    status: 'Delivered',
    delivery_date: daysAgo(4),
    tracking_carrier: 'FedEx',
    tracking_number: 'FX-88492019',
    signed_by: 'A. Wright',
    items: [
      { id: 'item_001', product_name: 'Italian Linen Summer Dress', sku: 'DRS-LIN-01', category: 'Apparel', price: 85.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 2. Bob Miller (Final Sale Sneakers -> Expected: Denied)
  {
    id: 'ord_002',
    customer_id: 'cust_002',
    order_number: 'ORD-2026-1002',
    order_date: daysAgo(12),
    total_amount: 120.0,
    status: 'Delivered',
    delivery_date: daysAgo(9),
    tracking_carrier: 'UPS',
    tracking_number: '1Z999AA10123456784',
    signed_by: 'B. Miller',
    items: [
      { id: 'item_002', product_name: 'Retro High-Top Sneakers (Clearance Final Sale)', sku: 'SNK-RETRO-FS', category: 'Footwear', price: 120.0, quantity: 1, is_final_sale: 1 },
    ],
  },
  // 3. Charlie Davis (High value $850 Drone -> Expected: Escalated > $500)
  {
    id: 'ord_003',
    customer_id: 'cust_003',
    order_number: 'ORD-2026-1003',
    order_date: daysAgo(10),
    total_amount: 850.0,
    status: 'Delivered',
    delivery_date: daysAgo(7),
    tracking_carrier: 'DHL Express',
    tracking_number: 'DHL-55420199',
    signed_by: 'C. Davis',
    items: [
      { id: 'item_003', product_name: 'Aerofly 4K Cinema Drone Kit', sku: 'DRN-4K-PRO', category: 'Electronics', price: 850.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 4. Diana Prince (Ordered 55 days ago -> Expected: Denied > 30 days)
  {
    id: 'ord_004',
    customer_id: 'cust_004',
    order_number: 'ORD-2026-1004',
    order_date: daysAgo(55),
    total_amount: 65.0,
    status: 'Delivered',
    delivery_date: daysAgo(51),
    tracking_carrier: 'USPS',
    tracking_number: '9400111202555441',
    signed_by: null,
    items: [
      { id: 'item_004', product_name: 'Insulated Arctic Parka', sku: 'APP-PRK-09', category: 'Apparel', price: 65.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 5. Evan Reed (Claims package never arrived, tracking confirms signed delivery -> Expected: Escalated)
  {
    id: 'ord_005',
    customer_id: 'cust_005',
    order_number: 'ORD-2026-1005',
    order_date: daysAgo(14),
    total_amount: 195.0,
    status: 'Delivered',
    delivery_date: daysAgo(11),
    tracking_carrier: 'FedEx',
    tracking_number: 'FX-33920199',
    signed_by: 'E. Reed (Signature & Doorstep Photo Captured)',
    items: [
      { id: 'item_005', product_name: 'Titan GPS Smart Watch', sku: 'WTC-GPS-02', category: 'Wearables', price: 195.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 6. Fiona Gallagher (Defective appliance within 8 days -> Expected: Approved)
  {
    id: 'ord_006',
    customer_id: 'cust_006',
    order_number: 'ORD-2026-1006',
    order_date: daysAgo(8),
    total_amount: 45.0,
    status: 'Delivered',
    delivery_date: daysAgo(5),
    tracking_carrier: 'USPS',
    tracking_number: '9400111202555998',
    signed_by: null,
    items: [
      { id: 'item_006', product_name: 'Precision Burr Coffee Grinder', sku: 'KIT-GRN-01', category: 'Kitchen', price: 45.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 7. George Clark (High refund risk score 0.85 -> Expected: Escalated)
  {
    id: 'ord_007',
    customer_id: 'cust_007',
    order_number: 'ORD-2026-1007',
    order_date: daysAgo(7),
    total_amount: 140.0,
    status: 'Delivered',
    delivery_date: daysAgo(4),
    tracking_carrier: 'UPS',
    tracking_number: '1Z999AA1099887766',
    signed_by: 'G. Clark',
    items: [
      { id: 'item_007', product_name: 'Cashmere V-Neck Sweater', sku: 'SWT-CSH-03', category: 'Apparel', price: 140.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 8. Hannah Abbott (Warehouse wrong SKU delivered -> Expected: Approved)
  {
    id: 'ord_008',
    customer_id: 'cust_008',
    order_number: 'ORD-2026-1008',
    order_date: daysAgo(5),
    total_amount: 110.0,
    status: 'Delivered',
    delivery_date: daysAgo(3),
    tracking_carrier: 'FedEx',
    tracking_number: 'FX-77884411',
    signed_by: 'H. Abbott',
    items: [
      { id: 'item_008', product_name: 'Studio Noise-Cancelling Headphones (Midnight Black)', sku: 'AUD-NC-BLK', category: 'Audio', price: 110.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 9. Ian Malcolm (Adversarial Prompt Injection Target)
  {
    id: 'ord_009',
    customer_id: 'cust_009',
    order_number: 'ORD-2026-1009',
    order_date: daysAgo(9),
    total_amount: 220.0,
    status: 'Delivered',
    delivery_date: daysAgo(6),
    tracking_carrier: 'UPS',
    tracking_number: '1Z888BB2033445566',
    signed_by: 'I. Malcolm',
    items: [
      { id: 'item_009', product_name: 'Oasis E-Reader Paperwhite Edition', sku: 'TAB-OASIS-01', category: 'Electronics', price: 220.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 10. Julia Roberts (VIP multi-item partial return)
  {
    id: 'ord_010',
    customer_id: 'cust_010',
    order_number: 'ORD-2026-1010',
    order_date: daysAgo(12),
    total_amount: 280.0,
    status: 'Delivered',
    delivery_date: daysAgo(8),
    tracking_carrier: 'FedEx',
    tracking_number: 'FX-11223344',
    signed_by: 'J. Roberts',
    items: [
      { id: 'item_010_a', product_name: 'Organic Cotton Duvet Cover', sku: 'BED-DVT-01', category: 'Home', price: 180.0, quantity: 1, is_final_sale: 0 },
      { id: 'item_010_b', product_name: 'Silk Pillowcase Set (2-pack)', sku: 'BED-SLK-02', category: 'Home', price: 100.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 11. Kevin Bacon (Damaged furniture on arrival -> Expected: Approved)
  {
    id: 'ord_011',
    customer_id: 'cust_011',
    order_number: 'ORD-2026-1011',
    order_date: daysAgo(15),
    total_amount: 420.0,
    status: 'Delivered',
    delivery_date: daysAgo(10),
    tracking_carrier: 'FreightLine',
    tracking_number: 'FL-9021882',
    signed_by: 'K. Bacon',
    items: [
      { id: 'item_011', product_name: 'Mid-Century Oak Accent Armchair', sku: 'FRN-CHR-MID', category: 'Furniture', price: 420.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 12. Laura Croft (Digital Key final sale -> Expected: Denied)
  {
    id: 'ord_012',
    customer_id: 'cust_012',
    order_number: 'ORD-2026-1012',
    order_date: daysAgo(4),
    total_amount: 79.0,
    status: 'Delivered',
    delivery_date: daysAgo(4),
    tracking_carrier: 'Digital Delivery',
    tracking_number: 'DIGITAL-KEY-SENT',
    signed_by: 'Instant Download',
    items: [
      { id: 'item_012', product_name: 'Digital Creative Suite 1-Year License Key', sku: 'SFT-LIC-PRO', category: 'Software', price: 79.0, quantity: 1, is_final_sale: 1 },
    ],
  },
  // 13. Michael Scott (Discrepancy / unusual request)
  {
    id: 'ord_013',
    customer_id: 'cust_013',
    order_number: 'ORD-2026-1013',
    order_date: daysAgo(18),
    total_amount: 150.0,
    status: 'Delivered',
    delivery_date: daysAgo(14),
    tracking_carrier: 'UPS',
    tracking_number: '1Z333CC4055667788',
    signed_by: 'M. Scott',
    items: [
      { id: 'item_013', product_name: 'Premium Bond Ream Paper (Box of 5)', sku: 'OFC-PPR-5PK', category: 'Office', price: 150.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 14. Nancy Drew (Porch theft dispute -> Escalated)
  {
    id: 'ord_014',
    customer_id: 'cust_014',
    order_number: 'ORD-2026-1014',
    order_date: daysAgo(8),
    total_amount: 230.0,
    status: 'Delivered',
    delivery_date: daysAgo(5),
    tracking_carrier: 'USPS',
    tracking_number: '9405511209988776',
    signed_by: null,
    items: [
      { id: 'item_014', product_name: 'Classic Heritage Double-Breasted Trench Coat', sku: 'APP-TRN-04', category: 'Apparel', price: 230.0, quantity: 1, is_final_sale: 0 },
    ],
  },
  // 15. Oscar Martinez (Standard return within 20 days -> Expected: Approved)
  {
    id: 'ord_015',
    customer_id: 'cust_015',
    order_number: 'ORD-2026-1015',
    order_date: daysAgo(20),
    total_amount: 80.0,
    status: 'Delivered',
    delivery_date: daysAgo(16),
    tracking_carrier: 'FedEx',
    tracking_number: 'FX-66554433',
    signed_by: 'O. Martinez',
    items: [
      { id: 'item_015', product_name: 'Financial Graphing Calculator Pro', sku: 'ELC-CALC-PRO', category: 'Electronics', price: 80.0, quantity: 1, is_final_sale: 0 },
    ],
  },
];

const insertOrder = db.prepare(`
  INSERT INTO orders (id, customer_id, order_number, order_date, total_amount, status, delivery_date, tracking_carrier, tracking_number, signed_by)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertItem = db.prepare(`
  INSERT INTO order_items (id, order_id, product_name, sku, category, price, quantity, is_final_sale)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const o of orders) {
  insertOrder.run(o.id, o.customer_id, o.order_number, o.order_date, o.total_amount, o.status, o.delivery_date, o.tracking_carrier, o.tracking_number, o.signed_by);
  for (const item of o.items) {
    insertItem.run(item.id, o.id, item.product_name, item.sku, item.category, item.price, item.quantity, item.is_final_sale);
  }
}

// 3. Seed initial historical refund requests for Admin Dashboard preview
const sampleRefunds = [
  {
    id: 'ref_hist_001',
    order_id: 'ord_004',
    customer_id: 'cust_004',
    requested_amount: 65.0,
    status: 'Denied',
    decision_reason: 'Order delivered 51 days ago, which exceeds our 30-day return policy window.',
    customer_explanation: 'I bought this two months ago but it is too warm for spring. Want a full refund.',
    policy_flags: JSON.stringify(['ORDER_TOO_OLD']),
    ai_confidence: 0.99,
    customer_facing_message: 'Thank you for reaching out. Under our return policy, items must be returned within 30 days of delivery. As this order was delivered 51 days ago, we are unable to process a return.',
    prompt_injection_detected: 0,
    created_at: daysAgo(2),
  },
  {
    id: 'ref_hist_002',
    order_id: 'ord_003',
    customer_id: 'cust_003',
    requested_amount: 850.0,
    status: 'Escalated',
    decision_reason: 'Refund amount of $850.00 exceeds the $500.00 automated threshold. Requires managerial review.',
    customer_explanation: 'Drone camera sensor has hot pixels out of the box. Need replacement or refund.',
    policy_flags: JSON.stringify(['EXCEEDS_500_THRESHOLD']),
    ai_confidence: 0.95,
    customer_facing_message: 'Your refund request for the 4K Drone has been received. Because this request exceeds our high-value threshold, a senior support specialist has been assigned to your ticket and will follow up within 24 hours.',
    prompt_injection_detected: 0,
    created_at: daysAgo(1),
  },
];

const insertRefund = db.prepare(`
  INSERT INTO refund_requests (
    id, order_id, customer_id, requested_amount, status,
    decision_reason, customer_explanation, policy_flags,
    ai_confidence, customer_facing_message, prompt_injection_detected,
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAudit = db.prepare(`
  INSERT INTO audit_logs (id, refund_id, raw_prompt, raw_llm_response, deterministic_flags, prompt_injection_detected, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

for (const r of sampleRefunds) {
  insertRefund.run(
    r.id, r.order_id, r.customer_id, r.requested_amount, r.status,
    r.decision_reason, r.customer_explanation, r.policy_flags,
    r.ai_confidence, r.customer_facing_message, r.prompt_injection_detected,
    r.created_at
  );

  insertAudit.run(
    `audit_${r.id}`,
    r.id,
    `[Historical Evaluation Prompt for ${r.order_id}]`,
    JSON.stringify({ action: r.status, reasoning: r.decision_reason }),
    r.policy_flags,
    r.prompt_injection_detected,
    r.created_at
  );
}
  console.log('Seed completed successfully! 15 customers, 15 orders, and sample historical logs ready.');
}

// If executed directly via CLI
if (process.argv[1]?.includes('seed')) {
  seedDatabase();
}
