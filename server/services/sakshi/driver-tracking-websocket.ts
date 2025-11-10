/**
 * Real-Time Driver Tracking WebSocket Handler
 * Manages WebSocket connections for live driver location updates and ETA tracking
 */

import { WebSocket, Server as WebSocketServer } from 'ws';
import DriverTrackingService from './driver-tracking-service';

interface ClientConnection {
  ws: WebSocket;
  clientId: string;
  userId: string;
  subscriptions: Set<string>; // orderId, driverId, etc.
  lastHeartbeat: Date;
}

class DriverTrackingWebSocketHandler {
  private wss: WebSocketServer;
  private trackingService: DriverTrackingService;
  private clients: Map<string, ClientConnection> = new Map();
  private driverSubscribers: Map<string, Set<string>> = new Map(); // driverId -> Set of clientIds
  private orderSubscribers: Map<string, Set<string>> = new Map(); // orderId -> Set of clientIds
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(wss: WebSocketServer, trackingService: DriverTrackingService) {
    this.wss = wss;
    this.trackingService = trackingService;
    this.setupWebSocketServer();
    this.startHeartbeat();
  }

  /**
   * Setup WebSocket Server
   */

  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(clientId, ws, message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'connected',
          clientId,
          timestamp: new Date(),
        })
      );
    });
  }

  /**
   * Message Handling
   */

  private handleMessage(clientId: string, ws: WebSocket, message: any): void {
    const { type, payload } = message;

    switch (type) {
      case 'auth':
        this.handleAuth(clientId, ws, payload);
        break;
      case 'subscribe_driver':
        this.handleSubscribeDriver(clientId, payload);
        break;
      case 'subscribe_order':
        this.handleSubscribeOrder(clientId, payload);
        break;
      case 'unsubscribe_driver':
        this.handleUnsubscribeDriver(clientId, payload);
        break;
      case 'unsubscribe_order':
        this.handleUnsubscribeOrder(clientId, payload);
        break;
      case 'location_update':
        this.handleLocationUpdate(clientId, payload);
        break;
      case 'heartbeat':
        this.handleHeartbeat(clientId);
        break;
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  }

  /**
   * Authentication
   */

  private handleAuth(clientId: string, ws: WebSocket, payload: any): void {
    const { userId } = payload;

    if (!userId) {
      ws.send(JSON.stringify({ type: 'error', message: 'Missing userId' }));
      return;
    }

    const client: ClientConnection = {
      ws,
      clientId,
      userId,
      subscriptions: new Set(),
      lastHeartbeat: new Date(),
    };

    this.clients.set(clientId, client);

    ws.send(
      JSON.stringify({
        type: 'authenticated',
        clientId,
        userId,
        timestamp: new Date(),
      })
    );
  }

  /**
   * Driver Subscription
   */

  private handleSubscribeDriver(clientId: string, payload: any): void {
    const { driverId } = payload;
    const client = this.clients.get(clientId);

    if (!client) {
      console.warn(`Client ${clientId} not authenticated`);
      return;
    }

    client.subscriptions.add(`driver:${driverId}`);

    if (!this.driverSubscribers.has(driverId)) {
      this.driverSubscribers.set(driverId, new Set());
    }
    this.driverSubscribers.get(driverId)!.add(clientId);

    client.ws.send(
      JSON.stringify({
        type: 'subscribed_driver',
        driverId,
        timestamp: new Date(),
      })
    );
  }

  private handleUnsubscribeDriver(clientId: string, payload: any): void {
    const { driverId } = payload;
    const client = this.clients.get(clientId);

    if (!client) return;

    client.subscriptions.delete(`driver:${driverId}`);

    const subscribers = this.driverSubscribers.get(driverId);
    if (subscribers) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.driverSubscribers.delete(driverId);
      }
    }
  }

  /**
   * Order Subscription
   */

  private handleSubscribeOrder(clientId: string, payload: any): void {
    const { orderId } = payload;
    const client = this.clients.get(clientId);

    if (!client) {
      console.warn(`Client ${clientId} not authenticated`);
      return;
    }

    client.subscriptions.add(`order:${orderId}`);

    if (!this.orderSubscribers.has(orderId)) {
      this.orderSubscribers.set(orderId, new Set());
    }
    this.orderSubscribers.get(orderId)!.add(clientId);

    client.ws.send(
      JSON.stringify({
        type: 'subscribed_order',
        orderId,
        timestamp: new Date(),
      })
    );
  }

  private handleUnsubscribeOrder(clientId: string, payload: any): void {
    const { orderId } = payload;
    const client = this.clients.get(clientId);

    if (!client) return;

    client.subscriptions.delete(`order:${orderId}`);

    const subscribers = this.orderSubscribers.get(orderId);
    if (subscribers) {
      subscribers.delete(clientId);
      if (subscribers.size === 0) {
        this.orderSubscribers.delete(orderId);
      }
    }
  }

  /**
   * Location Updates
   */

  private async handleLocationUpdate(clientId: string, payload: any): Promise<void> {
    const { driverId, latitude, longitude, accuracy, speed, heading } = payload;

    if (!driverId || latitude === undefined || longitude === undefined) {
      console.warn('Invalid location update payload');
      return;
    }

    // Update location in tracking service
    const location = await this.trackingService.updateDriverLocation(driverId, latitude, longitude, accuracy, speed, heading);

    // Broadcast to all subscribers of this driver
    const driverSubscribers = this.driverSubscribers.get(driverId) || new Set();
    const broadcastMessage = JSON.stringify({
      type: 'driver_location_update',
      driverId,
      location,
      timestamp: new Date(),
    });

    for (const subscriberClientId of driverSubscribers) {
      const subscriber = this.clients.get(subscriberClientId);
      if (subscriber && subscriber.ws.readyState === WebSocket.OPEN) {
        subscriber.ws.send(broadcastMessage);
      }
    }

    // Also broadcast ETA updates to order subscribers
    const etas = await this.trackingService.getAllETAs(driverId);
    for (const eta of etas) {
      const orderSubscribers = this.orderSubscribers.get(eta.orderId) || new Set();
      const etaMessage = JSON.stringify({
        type: 'eta_update',
        orderId: eta.orderId,
        eta,
        timestamp: new Date(),
      });

      for (const subscriberClientId of orderSubscribers) {
        const subscriber = this.clients.get(subscriberClientId);
        if (subscriber && subscriber.ws.readyState === WebSocket.OPEN) {
          subscriber.ws.send(etaMessage);
        }
      }
    }
  }

  /**
   * Heartbeat
   */

  private handleHeartbeat(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastHeartbeat = new Date();
      client.ws.send(
        JSON.stringify({
          type: 'heartbeat_ack',
          timestamp: new Date(),
        })
      );
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = new Date();
      const timeout = 60000; // 60 seconds

      for (const [clientId, client] of this.clients.entries()) {
        if (now.getTime() - client.lastHeartbeat.getTime() > timeout) {
          // Client is inactive, close connection
          client.ws.close();
          this.handleDisconnect(clientId);
        } else if (client.ws.readyState === WebSocket.OPEN) {
          // Send heartbeat ping
          client.ws.send(
            JSON.stringify({
              type: 'heartbeat',
              timestamp: new Date(),
            })
          );
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Disconnect Handling
   */

  private handleDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);

    if (!client) return;

    // Remove from all subscriptions
    for (const subscription of client.subscriptions) {
      if (subscription.startsWith('driver:')) {
        const driverId = subscription.split(':')[1];
        const subscribers = this.driverSubscribers.get(driverId);
        if (subscribers) {
          subscribers.delete(clientId);
          if (subscribers.size === 0) {
            this.driverSubscribers.delete(driverId);
          }
        }
      } else if (subscription.startsWith('order:')) {
        const orderId = subscription.split(':')[1];
        const subscribers = this.orderSubscribers.get(orderId);
        if (subscribers) {
          subscribers.delete(clientId);
          if (subscribers.size === 0) {
            this.orderSubscribers.delete(orderId);
          }
        }
      }
    }

    this.clients.delete(clientId);
  }

  /**
   * Broadcasting
   */

  broadcastToDriver(driverId: string, message: any): void {
    const subscribers = this.driverSubscribers.get(driverId) || new Set();
    const data = JSON.stringify(message);

    for (const clientId of subscribers) {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  broadcastToOrder(orderId: string, message: any): void {
    const subscribers = this.orderSubscribers.get(orderId) || new Set();
    const data = JSON.stringify(message);

    for (const clientId of subscribers) {
      const client = this.clients.get(clientId);
      if (client && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  broadcastToAll(message: any): void {
    const data = JSON.stringify(message);

    for (const client of this.clients.values()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(data);
      }
    }
  }

  /**
   * Statistics
   */

  getStats(): any {
    return {
      totalClients: this.clients.size,
      driverSubscriptions: this.driverSubscribers.size,
      orderSubscriptions: this.orderSubscribers.size,
      totalSubscriptions: Array.from(this.clients.values()).reduce((sum, c) => sum + c.subscriptions.size, 0),
    };
  }

  /**
   * Cleanup
   */

  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    for (const client of this.clients.values()) {
      client.ws.close();
    }

    this.clients.clear();
    this.driverSubscribers.clear();
    this.orderSubscribers.clear();
  }

  /**
   * Utilities
   */

  private generateClientId(): string {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default DriverTrackingWebSocketHandler;
