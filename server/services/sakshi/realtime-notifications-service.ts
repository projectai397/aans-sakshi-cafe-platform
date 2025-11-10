/**
 * Real-Time Notifications Service
 * WebSocket-based alerts for critical events
 */

type NotificationType = 'low_stock' | 'out_of_stock' | 'negative_review' | 'high_orders' | 'order_ready' | 'delivery_alert' | 'system_alert' | 'custom';
type NotificationSeverity = 'info' | 'warning' | 'critical';
type NotificationChannel = 'browser' | 'mobile' | 'email' | 'sms' | 'dashboard';

interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  data?: Record<string, any>;
  userId?: string;
  locationId?: string;
  channels: NotificationChannel[];
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
}

interface NotificationSubscription {
  id: string;
  userId: string;
  types: NotificationType[];
  channels: NotificationChannel[];
  minSeverity: NotificationSeverity;
  isActive: boolean;
  createdAt: Date;
}

interface NotificationTemplate {
  id: string;
  type: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  severity: NotificationSeverity;
  channels: NotificationChannel[];
  createdAt: Date;
}

interface WebSocketConnection {
  id: string;
  userId: string;
  connectionId: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  isActive: boolean;
}

interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<NotificationType, number>;
  notificationsBySeverity: Record<NotificationSeverity, number>;
  deliveryRate: number;
  averageReadTime: number;
}

class RealTimeNotificationsService {
  private notifications: Map<string, Notification> = new Map();
  private subscriptions: Map<string, NotificationSubscription> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private wsConnections: Map<string, WebSocketConnection> = new Map();
  private userConnections: Map<string, string[]> = new Map(); // userId -> connectionIds

  /**
   * Create notification
   */
  async createNotification(notification: Omit<Notification, 'id | createdAt'>): Promise<Notification> {
    const fullNotification: Notification = {
      ...notification,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.notifications.set(fullNotification.id, fullNotification);

    // Broadcast to subscribed users
    if (fullNotification.userId) {
      await this.broadcastToUser(fullNotification.userId, fullNotification);
    } else if (fullNotification.locationId) {
      await this.broadcastToLocation(fullNotification.locationId, fullNotification);
    }

    return fullNotification;
  }

  /**
   * Broadcast notification to user
   */
  private async broadcastToUser(userId: string, notification: Notification): Promise<void> {
    const connectionIds = this.userConnections.get(userId) || [];

    for (const connectionId of connectionIds) {
      const connection = this.wsConnections.get(connectionId);
      if (connection && connection.isActive) {
        // In production, send via WebSocket
        console.log(`Broadcasting notification ${notification.id} to user ${userId}`);
      }
    }
  }

  /**
   * Broadcast notification to location
   */
  private async broadcastToLocation(locationId: string, notification: Notification): Promise<void> {
    // Find all users at this location and broadcast
    for (const [userId, connectionIds] of this.userConnections) {
      // In production, check if user is at this location
      for (const connectionId of connectionIds) {
        const connection = this.wsConnections.get(connectionId);
        if (connection && connection.isActive) {
          console.log(`Broadcasting notification ${notification.id} to location ${locationId}`);
        }
      }
    }
  }

  /**
   * Register WebSocket connection
   */
  async registerWSConnection(userId: string, connectionId: string): Promise<WebSocketConnection> {
    const connection: WebSocketConnection = {
      id: `WS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      connectionId,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      isActive: true,
    };

    this.wsConnections.set(connection.id, connection);

    // Add to user connections
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, []);
    }
    this.userConnections.get(userId)!.push(connection.id);

    return connection;
  }

  /**
   * Unregister WebSocket connection
   */
  async unregisterWSConnection(connectionId: string): Promise<void> {
    const connection = this.wsConnections.get(connectionId);
    if (connection) {
      connection.isActive = false;

      const userConnections = this.userConnections.get(connection.userId) || [];
      const index = userConnections.indexOf(connectionId);
      if (index > -1) {
        userConnections.splice(index, 1);
      }
    }
  }

  /**
   * Send heartbeat
   */
  async sendHeartbeat(connectionId: string): Promise<void> {
    const connection = this.wsConnections.get(connectionId);
    if (connection) {
      connection.lastHeartbeat = new Date();
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(subscription: Omit<NotificationSubscription, 'id | createdAt'>): Promise<NotificationSubscription> {
    const fullSubscription: NotificationSubscription = {
      ...subscription,
      id: `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.subscriptions.set(fullSubscription.id, fullSubscription);
    return fullSubscription;
  }

  /**
   * Get subscription
   */
  async getSubscription(subscriptionId: string): Promise<NotificationSubscription | null> {
    return this.subscriptions.get(subscriptionId) || null;
  }

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<NotificationSubscription[]> {
    return Array.from(this.subscriptions.values())
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, updates: Partial<NotificationSubscription>): Promise<NotificationSubscription> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    Object.assign(subscription, updates);
    return subscription;
  }

  /**
   * Get notification
   */
  async getNotification(notificationId: string): Promise<Notification | null> {
    return this.notifications.get(notificationId) || null;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values()).filter((n) => n.userId === userId);

    if (unreadOnly) {
      notifications = notifications.filter((n) => !n.readAt);
    }

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    notification.readAt = new Date();
    return notification;
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const userNotifications = Array.from(this.notifications.values()).filter((n) => n.userId === userId && !n.readAt);

    for (const notification of userNotifications) {
      notification.readAt = new Date();
    }
  }

  /**
   * Create notification template
   */
  async createTemplate(template: Omit<NotificationTemplate, 'id | createdAt'>): Promise<NotificationTemplate> {
    const fullTemplate: NotificationTemplate = {
      ...template,
      id: `TMPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.templates.set(fullTemplate.id, fullTemplate);
    return fullTemplate;
  }

  /**
   * Get template
   */
  async getTemplate(templateId: string): Promise<NotificationTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get template by type
   */
  async getTemplateByType(type: NotificationType): Promise<NotificationTemplate | null> {
    return Array.from(this.templates.values()).find((t) => t.type === type) || null;
  }

  /**
   * Create notification from template
   */
  async createFromTemplate(type: NotificationType, data: Record<string, any>, userId?: string, locationId?: string): Promise<Notification> {
    const template = await this.getTemplateByType(type);
    if (!template) {
      throw new Error(`Template for type ${type} not found`);
    }

    const title = this.interpolateTemplate(template.titleTemplate, data);
    const message = this.interpolateTemplate(template.messageTemplate, data);

    return this.createNotification({
      type,
      severity: template.severity,
      title,
      message,
      data,
      userId,
      locationId,
      channels: template.channels,
    });
  }

  /**
   * Interpolate template
   */
  private interpolateTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return result;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId: string): Promise<NotificationStats> {
    const userNotifications = Array.from(this.notifications.values()).filter((n) => n.userId === userId);

    const totalNotifications = userNotifications.length;
    const unreadNotifications = userNotifications.filter((n) => !n.readAt).length;

    const notificationsByType: Record<NotificationType, number> = {
      low_stock: 0,
      out_of_stock: 0,
      negative_review: 0,
      high_orders: 0,
      order_ready: 0,
      delivery_alert: 0,
      system_alert: 0,
      custom: 0,
    };

    const notificationsBySeverity: Record<NotificationSeverity, number> = {
      info: 0,
      warning: 0,
      critical: 0,
    };

    for (const notification of userNotifications) {
      notificationsByType[notification.type]++;
      notificationsBySeverity[notification.severity]++;
    }

    const readNotifications = userNotifications.filter((n) => n.readAt);
    const readTimes = readNotifications.map((n) => (n.readAt!.getTime() - n.createdAt.getTime()) / 1000);
    const averageReadTime = readTimes.length > 0 ? readTimes.reduce((a, b) => a + b) / readTimes.length : 0;

    return {
      totalNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsBySeverity,
      deliveryRate: totalNotifications > 0 ? (readNotifications.length / totalNotifications) * 100 : 0,
      averageReadTime: Math.round(averageReadTime),
    };
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, notification] of this.notifications) {
      if (notification.createdAt < cutoffDate) {
        this.notifications.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get active connections
   */
  async getActiveConnections(): Promise<WebSocketConnection[]> {
    return Array.from(this.wsConnections.values()).filter((c) => c.isActive);
  }

  /**
   * Clean up inactive connections
   */
  async cleanupInactiveConnections(minutesInactive: number = 30): Promise<number> {
    const cutoffTime = new Date(Date.now() - minutesInactive * 60 * 1000);
    let cleanedCount = 0;

    for (const [id, connection] of this.wsConnections) {
      if (connection.isActive && connection.lastHeartbeat < cutoffTime) {
        await this.unregisterWSConnection(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }
}

export default RealTimeNotificationsService;
