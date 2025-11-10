/**
 * Inventory Tracking API Routes
 */

import { Router, Request, Response } from 'express';
import InventoryTrackingService from './inventory-tracking-service';

const router = Router();
const inventoryService = new InventoryTrackingService();

/**
 * Add inventory item
 */
router.post('/items', async (req: Request, res: Response) => {
  try {
    const item = await inventoryService.addItem(req.body);
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get item details
 */
router.get('/items/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await inventoryService.getItem(itemId);
    res.json(item || { error: 'Item not found' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get all items
 */
router.get('/items', async (req: Request, res: Response) => {
  try {
    const items = await inventoryService.getAllItems();
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get items by status
 */
router.get('/items/status/:status', async (req: Request, res: Response) => {
  try {
    const { status } = req.params;
    const items = await inventoryService.getItemsByStatus(status as any);
    res.json({ status, count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get low stock items
 */
router.get('/low-stock', async (req: Request, res: Response) => {
  try {
    const items = await inventoryService.getLowStockItems();
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get out of stock items
 */
router.get('/out-of-stock', async (req: Request, res: Response) => {
  try {
    const items = await inventoryService.getOutOfStockItems();
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Update stock
 */
router.post('/update-stock', async (req: Request, res: Response) => {
  try {
    const { itemId, quantity, type, reason, location } = req.body;
    const transaction = await inventoryService.updateStock(itemId, quantity, type, reason, location);
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get stock transactions
 */
router.get('/transactions/:itemId?', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { limit = 100 } = req.query;
    const transactions = await inventoryService.getTransactions(itemId, parseInt(limit as string));
    res.json({ count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get low stock alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const alerts = await inventoryService.getLowStockAlerts(status as string);
    res.json({ count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Resolve low stock alert
 */
router.put('/alerts/:alertId/resolve', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alert = await inventoryService.resolveLowStockAlert(alertId);
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Mark alert as ordered
 */
router.put('/alerts/:alertId/ordered', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const alert = await inventoryService.markAlertAsOrdered(alertId);
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get waste records
 */
router.get('/waste', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const records = await inventoryService.getWasteRecords(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );
    res.json({ count: records.length, records });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get waste statistics
 */
router.get('/waste/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await inventoryService.getWasteStats(
      new Date(startDate as string),
      new Date(endDate as string),
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Add supplier
 */
router.post('/suppliers', async (req: Request, res: Response) => {
  try {
    const supplier = await inventoryService.addSupplier(req.body);
    res.json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get all suppliers
 */
router.get('/suppliers', async (req: Request, res: Response) => {
  try {
    const suppliers = await inventoryService.getAllSuppliers();
    res.json({ count: suppliers.length, suppliers });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get supplier for item
 */
router.get('/suppliers/item/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const supplier = await inventoryService.getSupplierForItem(itemId);
    res.json(supplier || { error: 'No supplier found' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Generate purchase order
 */
router.post('/purchase-order/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const purchaseOrder = await inventoryService.generatePurchaseOrder(itemId);
    res.json({ success: true, purchaseOrder });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get inventory value
 */
router.get('/value', async (req: Request, res: Response) => {
  try {
    const value = await inventoryService.getInventoryValue();
    res.json({ inventoryValue: value });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get inventory metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await inventoryService.getInventoryMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Forecast stock depletion
 */
router.get('/forecast/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { days = 7 } = req.query;
    const forecast = await inventoryService.forecastStockDepletion(itemId, parseInt(days as string));
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
