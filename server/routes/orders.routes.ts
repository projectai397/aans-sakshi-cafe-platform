/**
 * Order Routes
 * Complete REST API for order management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Mock data storage (replace with database)
const orders: Map<string, any> = new Map();
let orderCounter = 1000;

/**
 * POST /api/v1/orders
 * Create a new order
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerId, locationId, items, deliveryType, totalAmount } = req.body;

    // Validation
    if (!customerId || !locationId || !items || !deliveryType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = {
      id: uuidv4(),
      orderNumber: `ORD-${++orderCounter}`,
      customerId,
      locationId,
      items,
      deliveryType,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    orders.set(order.id, order);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

/**
 * GET /api/v1/orders
 * Get all orders with filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, customerId, locationId, limit = 50, offset = 0 } = req.query;

    let allOrders = Array.from(orders.values());

    // Apply filters
    if (status) {
      allOrders = allOrders.filter((o) => o.status === status);
    }
    if (customerId) {
      allOrders = allOrders.filter((o) => o.customerId === customerId);
    }
    if (locationId) {
      allOrders = allOrders.filter((o) => o.locationId === locationId);
    }

    // Sort by creation date (newest first)
    allOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const paginatedOrders = allOrders.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      data: paginatedOrders,
      total: allOrders.length,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/v1/orders/:orderId
 * Get a specific order
 */
router.get('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * PUT /api/v1/orders/:orderId
 * Update an order
 */
router.put('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update fields
    const updatedOrder = {
      ...order,
      ...req.body,
      id: order.id, // Prevent ID change
      orderNumber: order.orderNumber, // Prevent order number change
      updatedAt: new Date(),
    };

    orders.set(orderId, updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

/**
 * DELETE /api/v1/orders/:orderId
 * Cancel an order
 */
router.delete('/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Mark as cancelled instead of deleting
    const cancelledOrder = {
      ...order,
      status: 'cancelled',
      updatedAt: new Date(),
    };

    orders.set(orderId, cancelledOrder);

    res.json(cancelledOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

/**
 * POST /api/v1/orders/:orderId/approve
 * Approve an order
 */
router.post('/:orderId/approve', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const approvedOrder = {
      ...order,
      status: 'confirmed',
      approvedAt: new Date(),
      updatedAt: new Date(),
    };

    orders.set(orderId, approvedOrder);

    res.json(approvedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve order' });
  }
});

/**
 * PUT /api/v1/orders/:orderId/status
 * Update order status
 */
router.put('/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date(),
    };

    orders.set(orderId, updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

/**
 * GET /api/v1/orders/search
 * Search orders
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchResults = Array.from(orders.values()).filter(
      (o) =>
        o.orderNumber.includes(String(query)) ||
        o.customerId.includes(String(query)) ||
        o.locationId.includes(String(query))
    );

    res.json(searchResults);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/v1/orders/analytics
 * Get order analytics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const allOrders = Array.from(orders.values());

    const analytics = {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0),
      averageOrderValue: allOrders.length > 0 ? allOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0) / allOrders.length : 0,
      ordersByStatus: {
        pending: allOrders.filter((o) => o.status === 'pending').length,
        confirmed: allOrders.filter((o) => o.status === 'confirmed').length,
        preparing: allOrders.filter((o) => o.status === 'preparing').length,
        ready: allOrders.filter((o) => o.status === 'ready').length,
        out_for_delivery: allOrders.filter((o) => o.status === 'out_for_delivery').length,
        delivered: allOrders.filter((o) => o.status === 'delivered').length,
        cancelled: allOrders.filter((o) => o.status === 'cancelled').length,
      },
      ordersByType: {
        dine_in: allOrders.filter((o) => o.deliveryType === 'dine_in').length,
        takeaway: allOrders.filter((o) => o.deliveryType === 'takeaway').length,
        delivery: allOrders.filter((o) => o.deliveryType === 'delivery').length,
      },
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * POST /api/v1/orders/:orderId/notify
 * Send notification for order
 */
router.post('/:orderId/notify', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { channel, message } = req.body;

    const order = orders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Simulate sending notification
    const notification = {
      id: uuidv4(),
      orderId,
      channel,
      message,
      status: 'sent',
      sentAt: new Date(),
    };

    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

/**
 * POST /api/v1/orders/bulk-create
 * Create multiple orders
 */
router.post('/bulk-create', async (req: Request, res: Response) => {
  try {
    const { ordersList } = req.body;

    if (!Array.isArray(ordersList)) {
      return res.status(400).json({ error: 'ordersList must be an array' });
    }

    const createdOrders = ordersList.map((orderData) => {
      const order = {
        id: uuidv4(),
        orderNumber: `ORD-${++orderCounter}`,
        ...orderData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      orders.set(order.id, order);
      return order;
    });

    res.status(201).json({
      created: createdOrders.length,
      orders: createdOrders,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create orders' });
  }
});

/**
 * GET /api/v1/orders/export
 * Export orders
 */
router.get('/export', async (req: Request, res: Response) => {
  try {
    const { format = 'json' } = req.query;

    const allOrders = Array.from(orders.values());

    if (format === 'csv') {
      // Convert to CSV
      const csv = [
        ['Order ID', 'Order Number', 'Customer ID', 'Location ID', 'Total Amount', 'Status', 'Created At'].join(','),
        ...allOrders.map((o) => [o.id, o.orderNumber, o.customerId, o.locationId, o.totalAmount, o.status, o.createdAt].join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
      res.send(csv);
    } else {
      // JSON format
      res.json(allOrders);
    }
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;
