/**
 * Commission Settlement API Routes
 * Handles settlement calculations, invoices, and reconciliation
 */

import { Router, Request, Response } from 'express';
import CommissionSettlementService from './commission-settlement-service';

const router = Router();
const settlementService = new CommissionSettlementService();

/**
 * Order Management
 */

router.post('/order/add', async (req: Request, res: Response) => {
  try {
    const orderData = req.body;
    const order = await settlementService.addOrder(orderData);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/order/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await settlementService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/orders/:month', async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    const { platform } = req.query;

    const orders = await settlementService.getOrdersByMonth(month, platform as any);

    res.json({
      month,
      platform: platform || 'all',
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Settlement Management
 */

router.post('/settlement/calculate/:month', async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    const settlement = await settlementService.calculateSettlement(month);

    res.json({
      success: true,
      settlement,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/settlement/:settlementId/approve', async (req: Request, res: Response) => {
  try {
    const { settlementId } = req.params;
    const settlement = await settlementService.approveSettlement(settlementId);

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    res.json({
      success: true,
      settlement,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/settlement/:settlementId/settle', async (req: Request, res: Response) => {
  try {
    const { settlementId } = req.params;
    const paymentDetails = req.body;

    const settlement = await settlementService.settlePayment(settlementId, paymentDetails);

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    res.json({
      success: true,
      settlement,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/settlement/:settlementId', async (req: Request, res: Response) => {
  try {
    const { settlementId } = req.params;
    const settlement = await settlementService.getSettlement(settlementId);

    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    res.json(settlement);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/settlements/:month', async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    const settlements = await settlementService.getSettlementsByMonth(month);

    res.json({
      month,
      count: settlements.length,
      settlements,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/settlements', async (req: Request, res: Response) => {
  try {
    const settlements = await settlementService.getAllSettlements();

    res.json({
      count: settlements.length,
      settlements,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Invoice Management
 */

router.get('/invoice/:invoiceId', async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await settlementService.getInvoice(invoiceId);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/invoices/settlement/:settlementId', async (req: Request, res: Response) => {
  try {
    const { settlementId } = req.params;
    const invoices = await settlementService.getInvoicesBySettlement(settlementId);

    res.json({
      settlementId,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/invoices/platform/:platform', async (req: Request, res: Response) => {
  try {
    const { platform } = req.params;
    const { month } = req.query;

    const invoices = await settlementService.getInvoicesByPlatform(platform as any, month as string);

    res.json({
      platform,
      month: month || 'all',
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/invoice/:invoiceId/mark-paid', async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await settlementService.markInvoiceAsPaid(invoiceId);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Reconciliation
 */

router.get('/reconciliation/:reconciliationId', async (req: Request, res: Response) => {
  try {
    const { reconciliationId } = req.params;
    const reconciliation = await settlementService.getReconciliation(reconciliationId);

    if (!reconciliation) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    res.json(reconciliation);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/reconciliations/settlement/:settlementId', async (req: Request, res: Response) => {
  try {
    const { settlementId } = req.params;
    const reconciliations = await settlementService.getReconciliationsBySettlement(settlementId);

    res.json({
      settlementId,
      count: reconciliations.length,
      reconciliations,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/reconciliation/:reconciliationId/resolve', async (req: Request, res: Response) => {
  try {
    const { reconciliationId } = req.params;
    const { notes } = req.body;

    const reconciliation = await settlementService.resolveDiscrepancy(reconciliationId, notes);

    if (!reconciliation) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    res.json({
      success: true,
      reconciliation,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Reports
 */

router.get('/report/monthly/:month', async (req: Request, res: Response) => {
  try {
    const { month } = req.params;
    const report = await settlementService.getMonthlyReport(month);

    if (!report) {
      return res.status(404).json({ error: 'No settlement found for this month' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/report/platform/:platform/:month', async (req: Request, res: Response) => {
  try {
    const { platform, month } = req.params;
    const report = await settlementService.getPlatformReport(platform as any, month);

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Analytics
 */

router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const analytics = await settlementService.getSettlementAnalytics();

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Cleanup
 */

router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { ageMonths = 12 } = req.body;

    const deletedCount = await settlementService.cleanupOldData(ageMonths);

    res.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
