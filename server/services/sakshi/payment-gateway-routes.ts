/**
 * Payment Gateway API Routes
 */

import { Router, Request, Response } from 'express';
import PaymentGatewayService from './payment-gateway-service';

const router = Router();
const paymentService = new PaymentGatewayService();

/**
 * Create payment
 */
router.post('/payments', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, amount, method, metadata } = req.body;
    const transaction = await paymentService.createPayment(orderId, customerId, amount, method, metadata);
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get transaction
 */
router.get('/payments/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const transaction = await paymentService.getTransaction(transactionId);
    res.json(transaction || { error: 'Transaction not found' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get transactions for order
 */
router.get('/payments/order/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const transactions = await paymentService.getTransactionsForOrder(orderId);
    res.json({ orderId, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get transactions for customer
 */
router.get('/payments/customer/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { limit = 50 } = req.query;
    const transactions = await paymentService.getTransactionsForCustomer(customerId, parseInt(limit as string));
    res.json({ customerId, count: transactions.length, transactions });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Refund payment
 */
router.post('/refunds', async (req: Request, res: Response) => {
  try {
    const { transactionId, reason, amount } = req.body;
    const refund = await paymentService.refundPayment(transactionId, reason, amount);
    res.json({ success: true, refund });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get refund
 */
router.get('/refunds/:refundId', async (req: Request, res: Response) => {
  try {
    const { refundId } = req.params;
    const refund = await paymentService.getRefund(refundId);
    res.json(refund || { error: 'Refund not found' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get refunds for transaction
 */
router.get('/refunds/transaction/:transactionId', async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const refunds = await paymentService.getRefundsForTransaction(transactionId);
    res.json({ transactionId, count: refunds.length, refunds });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Save payment method
 */
router.post('/payment-methods', async (req: Request, res: Response) => {
  try {
    const { customerId, type, details, isDefault } = req.body;
    const paymentMethod = await paymentService.savePaymentMethod(customerId, type, details, isDefault);
    res.json({ success: true, paymentMethod });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get payment methods
 */
router.get('/payment-methods/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const methods = await paymentService.getPaymentMethods(customerId);
    res.json({ customerId, count: methods.length, methods });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get default payment method
 */
router.get('/payment-methods/:customerId/default', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const method = await paymentService.getDefaultPaymentMethod(customerId);
    res.json(method || { error: 'No default payment method' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Delete payment method
 */
router.delete('/payment-methods/:paymentMethodId', async (req: Request, res: Response) => {
  try {
    const { paymentMethodId } = req.params;
    const success = await paymentService.deletePaymentMethod(paymentMethodId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Validate card
 */
router.post('/validate/card', async (req: Request, res: Response) => {
  try {
    const { cardNumber, expiryMonth, expiryYear, cvv } = req.body;
    const isValid = await paymentService.validateCard(cardNumber, expiryMonth, expiryYear, cvv);
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Validate UPI
 */
router.post('/validate/upi', async (req: Request, res: Response) => {
  try {
    const { upiId } = req.body;
    const isValid = await paymentService.validateUPI(upiId);
    res.json({ isValid });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get payment statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await paymentService.getPaymentStats(new Date(startDate as string), new Date(endDate as string));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get settlement report
 */
router.get('/settlement', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await paymentService.getSettlementReport(new Date(startDate as string), new Date(endDate as string));
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Handle webhooks
 */
router.post('/webhooks/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const signature = req.headers['x-signature'] as string;
    const result = await paymentService.handleWebhook(provider, req.body, signature);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
