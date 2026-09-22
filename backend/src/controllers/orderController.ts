import { Request, Response } from 'express';
import { getAllCustomers, getCustomerById, getOrdersByCustomerId, getOrderById } from '../db/database.js';

export class OrderController {
  public static async getCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = getAllCustomers();
      res.json({ success: true, count: customers.length, data: customers });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getCustomerDetails(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'ID parameter is missing' });
        return;
      }
      const customer = getCustomerById(id);
      if (!customer) {
        res.status(404).json({ success: false, error: 'Customer not found' });
        return;
      }
      const orders = getOrdersByCustomerId(id);
      res.json({ success: true, data: { ...customer, orders } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  public static async getOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (!id) {
        res.status(400).json({ success: false, error: 'ID parameter is missing' });
        return;
      }
      const order = getOrderById(id);
      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }
      res.json({ success: true, data: order });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}
