/**
 * Delivery Platform Webhook API Routes
 * Handles webhook endpoints for Swiggy, Zomato, and Uber Eats
 */

import { Router, Request, Response } from 'express';
import DeliveryWebhookService from './delivery-webhook-service';

const router = Router();
const webhookService = new DeliveryWebhookService();

/**
 * Platform Registration
 */

router.post('/platform/register', async (req: Request, res: Response) => {
  try {
    const { platform, apiKey, apiSecret, webhookUrl, baseUrl, locationId } = req.body;

    if (!platform || !apiKey || !locationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await webhookService.registerPlatform({
      platform,
      apiKey,
      apiSecret,
      webhookUrl,
      baseUrl,
      locationId,
    });

    res.json({
      success: true,
      message: `Platform ${platform} registered successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Swiggy Webhook Endpoint
 */

router.post('/webhook/swiggy', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Verify webhook signature (implement based on Swiggy docs)
    // const signature = req.headers['x-swiggy-signature'];
    // if (!verifySwiggySignature(payload, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    await webhookService.handleSwiggyWebhook(payload);

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Swiggy webhook error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Zomato Webhook Endpoint
 */

router.post('/webhook/zomato', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Verify webhook signature (implement based on Zomato docs)
    // const signature = req.headers['x-zomato-signature'];
    // if (!verifyZomatoSignature(payload, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    await webhookService.handleZomatoWebhook(payload);

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Zomato webhook error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Uber Eats Webhook Endpoint
 */

router.post('/webhook/uber-eats', async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    // Verify webhook signature (implement based on Uber Eats docs)
    // const signature = req.headers['x-uber-signature'];
    // if (!verifyUberSignature(payload, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    await webhookService.handleUberEatsWebhook(payload);

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Uber Eats webhook error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Order Management Endpoints
 */

router.get('/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await webhookService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:locationId/orders', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { status } = req.query;

    const orders = await webhookService.getLocationOrders(locationId, status as string | undefined);

    res.json({
      locationId,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:locationId/platform/:platform/orders', async (req: Request, res: Response) => {
  try {
    const { locationId, platform } = req.params;
    const orders = await webhookService.getPlatformOrders(platform, locationId);

    res.json({
      locationId,
      platform,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Commission & Revenue Tracking
 */

router.get('/location/:locationId/commission/:period', async (req: Request, res: Response) => {
  try {
    const { locationId, period } = req.params;
    const report = await webhookService.getCommissionReport(locationId, period);

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Reconciliation
 */

router.get('/location/:locationId/reconcile/:platform', async (req: Request, res: Response) => {
  try {
    const { locationId, platform } = req.params;
    const reconciliation = await webhookService.reconcileOrders(locationId, platform);

    res.json(reconciliation);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Webhook Logs
 */

router.get('/webhook-logs', async (req: Request, res: Response) => {
  try {
    const { platform, limit = '100' } = req.query;
    const logs = await webhookService.getWebhookLogs(platform as string | undefined, parseInt(limit as string));

    res.json({
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Health Check
 */

router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await webhookService.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
