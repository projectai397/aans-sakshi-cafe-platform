/**
 * Kitchen Routing API Routes & WebSocket Handlers
 * Real-time kitchen order management and queue visualization
 */

import { Router, Request, Response } from 'express';
import { WebSocketServer } from 'ws';
import KitchenRoutingService from './kitchen-routing-service';

const router = Router();
const routingService = new KitchenRoutingService();

/**
 * Station Management
 */

router.post('/station/create', async (req: Request, res: Response) => {
  try {
    const stationData = req.body;
    const station = await routingService.createStation(stationData);

    res.json({
      success: true,
      station,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/station/:stationId', async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;
    const station = await routingService.getStation(stationId);

    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(station);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:locationId/stations', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const stations = await routingService.getLocationStations(locationId);

    res.json({
      locationId,
      count: stations.length,
      stations,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Menu Item Management
 */

router.post('/menu-item/add', async (req: Request, res: Response) => {
  try {
    const itemData = req.body;
    const item = await routingService.addMenuItem(itemData);

    res.json({
      success: true,
      item,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/menu-item/:itemId', async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const item = await routingService.getMenuItem(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Order Routing
 */

router.post('/order/assign', async (req: Request, res: Response) => {
  try {
    const { orderId, locationId, itemIds } = req.body;

    const kitchenOrder = await routingService.assignOrderToStations(orderId, locationId, itemIds);

    if (!kitchenOrder) {
      return res.status(400).json({ error: 'Failed to assign order to stations' });
    }

    res.json({
      success: true,
      kitchenOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/order/:kitchenOrderId/start', async (req: Request, res: Response) => {
  try {
    const { kitchenOrderId } = req.params;

    const order = await routingService.startOrderPreparation(kitchenOrderId);

    if (!order) {
      return res.status(404).json({ error: 'Kitchen order not found' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/order/:kitchenOrderId/complete', async (req: Request, res: Response) => {
  try {
    const { kitchenOrderId } = req.params;

    const order = await routingService.completeOrderPreparation(kitchenOrderId);

    if (!order) {
      return res.status(404).json({ error: 'Kitchen order not found' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/order/:kitchenOrderId', async (req: Request, res: Response) => {
  try {
    const { kitchenOrderId } = req.params;

    const order = await routingService.getKitchenOrder(kitchenOrderId);

    if (!order) {
      return res.status(404).json({ error: 'Kitchen order not found' });
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

    const orders = await routingService.getLocationOrders(locationId, status as any);

    res.json({
      locationId,
      status: status || 'all',
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Queue Management
 */

router.get('/station/:stationId/queue', async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;

    const queue = await routingService.getStationQueue(stationId);

    if (!queue) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:locationId/queues', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const queues = await routingService.getLocationQueues(locationId);

    res.json({
      locationId,
      count: queues.length,
      queues,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Priority Management
 */

router.post('/order/:kitchenOrderId/priority', async (req: Request, res: Response) => {
  try {
    const { kitchenOrderId } = req.params;
    const { priority } = req.body;

    const order = await routingService.setPriority(kitchenOrderId, priority);

    if (!order) {
      return res.status(404).json({ error: 'Kitchen order not found' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Analytics & Metrics
 */

router.get('/metrics/location/:locationId', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const metrics = await routingService.getRoutingMetrics(locationId);

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/metrics/station/:stationId', async (req: Request, res: Response) => {
  try {
    const { stationId } = req.params;

    const metrics = await routingService.getStationMetrics(stationId);

    if (!metrics) {
      return res.status(404).json({ error: 'Station not found' });
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Cleanup
 */

router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { ageHours = 24 } = req.body;

    const deletedCount = await routingService.cleanupCompletedOrders(ageHours);

    res.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * WebSocket Handler for Real-time Updates
 */

export class KitchenRoutingWebSocketHandler {
  private wss: WebSocketServer;
  private routingService: KitchenRoutingService;
  private clientSubscriptions: Map<string, Set<string>> = new Map(); // clientId -> locationIds

  constructor(wss: WebSocketServer, routingService: KitchenRoutingService) {
    this.wss = wss;
    this.routingService = routingService;

    wss.on('connection', (ws) => {
      const clientId = `CLIENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(clientId, ws, message);
        } catch (error) {
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.clientSubscriptions.delete(clientId);
      });
    });
  }

  private async handleMessage(clientId: string, ws: any, message: any): Promise<void> {
    const { type, payload } = message;

    switch (type) {
      case 'subscribe_location':
        this.subscribeToLocation(clientId, payload.locationId);
        break;

      case 'unsubscribe_location':
        this.unsubscribeFromLocation(clientId, payload.locationId);
        break;

      case 'order_assigned':
        await this.broadcastOrderUpdate('order_assigned', payload);
        break;

      case 'order_started':
        await this.broadcastOrderUpdate('order_started', payload);
        break;

      case 'order_completed':
        await this.broadcastOrderUpdate('order_completed', payload);
        break;

      case 'queue_update':
        await this.broadcastQueueUpdate(payload);
        break;

      case 'heartbeat':
        ws.send(JSON.stringify({ type: 'heartbeat' }));
        break;
    }
  }

  private subscribeToLocation(clientId: string, locationId: string): void {
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, new Set());
    }
    this.clientSubscriptions.get(clientId)!.add(locationId);
  }

  private unsubscribeFromLocation(clientId: string, locationId: string): void {
    const subscriptions = this.clientSubscriptions.get(clientId);
    if (subscriptions) {
      subscriptions.delete(locationId);
    }
  }

  private async broadcastOrderUpdate(eventType: string, payload: any): Promise<void> {
    const message = JSON.stringify({
      type: eventType,
      payload,
      timestamp: new Date(),
    });

    for (const client of this.wss.clients) {
      if (client.readyState === 1) {
        // OPEN
        client.send(message);
      }
    }
  }

  private async broadcastQueueUpdate(payload: any): Promise<void> {
    const message = JSON.stringify({
      type: 'queue_update',
      payload,
      timestamp: new Date(),
    });

    for (const client of this.wss.clients) {
      if (client.readyState === 1) {
        // OPEN
        client.send(message);
      }
    }
  }
}

export default router;
