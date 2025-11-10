/**
 * Order Notifications API Routes
 * Multi-channel notification endpoints
 */

import { Router, Request, Response } from 'express';
import OrderNotificationsService from './order-notifications-service';

const router = Router();
const notificationsService = new OrderNotificationsService();

/**
 * Send notification
 */
router.post('/send', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, templateId, variables } = req.body;

    const result = await notificationsService.sendNotification(orderId, customerId, templateId, variables);

    res.json({
      success: true,
      notificationId: result.id,
      channels: result.channels,
      status: result.status,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Send order status notification
 */
router.post('/order-status', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, status, variables } = req.body;

    const result = await notificationsService.notifyOrderStatus(orderId, customerId, status, variables);

    res.json({
      success: true,
      notificationId: result.id,
      status: result.status,
      sentAt: result.sentAt,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Send urgent alert
 */
router.post('/urgent-alert', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, reason } = req.body;

    const result = await notificationsService.sendUrgentAlert(orderId, customerId, reason);

    res.json({
      success: true,
      notificationId: result.id,
      priority: 'urgent',
      status: result.status,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get notification preferences
 */
router.get('/preferences/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    const preferences = await notificationsService.getPreferences(customerId);

    res.json({
      customerId,
      preferences,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Update notification preferences
 */
router.put('/preferences/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const preferences = req.body;

    const updated = await notificationsService.setPreferences(customerId, preferences);

    res.json({
      success: true,
      customerId,
      preferences: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get notification logs for order
 */
router.get('/logs/order/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    const logs = await notificationsService.getNotificationLogs(orderId);

    res.json({
      orderId,
      count: logs.length,
      logs,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get customer notification history
 */
router.get('/history/:customerId', async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;
    const { limit = 50 } = req.query;

    const history = await notificationsService.getCustomerNotificationHistory(customerId, parseInt(limit as string));

    res.json({
      customerId,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Resend notification
 */
router.post('/resend/:notificationId', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const result = await notificationsService.resendNotification(notificationId);

    res.json({
      success: true,
      notificationId: result.id,
      status: result.status,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Get notification statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const stats = await notificationsService.getNotificationStats(start, end);

    res.json({
      period: { startDate: start, endDate: end },
      stats,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Bulk send notifications
 */
router.post('/bulk-send', async (req: Request, res: Response) => {
  try {
    const { orderIds, customerIds, templateId, variables } = req.body;

    const results = await notificationsService.bulkSendNotifications(orderIds, customerIds, templateId, variables);

    res.json({
      success: true,
      count: results.length,
      results: results.map((r) => ({
        notificationId: r.id,
        status: r.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Schedule notification
 */
router.post('/schedule', async (req: Request, res: Response) => {
  try {
    const { orderId, customerId, templateId, variables, delayMs } = req.body;

    const result = await notificationsService.scheduleNotification(orderId, customerId, templateId, variables, delayMs);

    res.json({
      success: true,
      scheduledId: result.scheduledId,
      sendAt: result.sendAt,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
