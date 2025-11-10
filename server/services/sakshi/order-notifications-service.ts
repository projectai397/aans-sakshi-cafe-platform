/**
 * Order Notifications Service
 * Multi-channel notifications: SMS, Email, Push, Audio/Visual alerts
 */

type NotificationChannel = 'sms' | 'email' | 'push' | 'audio' | 'visual' | 'whatsapp';
type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
type OrderStatus = 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface NotificationTemplate {
  id: string;
  name: string;
  channels: NotificationChannel[];
  subject?: string;
  body: string;
  priority: NotificationPriority;
  delay?: number; // milliseconds
}

interface NotificationPreference {
  customerId: string;
  smsEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  audioEnabled: boolean;
  visualEnabled: boolean;
  whatsappEnabled: boolean;
  quietHours?: { start: string; end: string }; // e.g., "22:00" to "08:00"
}

interface NotificationLog {
  id: string;
  orderId: string;
  customerId: string;
  channels: NotificationChannel[];
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sentAt: Date;
  deliveredAt?: Date;
  failureReason?: string;
}

class OrderNotificationsService {
  private templates: Map<string, NotificationTemplate> = new Map();
  private preferences: Map<string, NotificationPreference> = new Map();
  private notificationLogs: NotificationLog[] = [];
  private audioAlerts: Map<string, string> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeAudioAlerts();
  }

  /**
   * Initialize notification templates
   */
  private initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        id: 'order_confirmed',
        name: 'Order Confirmed',
        channels: ['sms', 'email', 'push', 'whatsapp'],
        subject: 'Order Confirmed - {{orderId}}',
        body: 'Your order {{orderId}} has been confirmed! Estimated delivery: {{eta}}',
        priority: 'high',
      },
      {
        id: 'order_preparing',
        name: 'Order Preparing',
        channels: ['push', 'visual'],
        body: 'Your order {{orderId}} is being prepared. Estimated time: {{eta}}',
        priority: 'medium',
      },
      {
        id: 'order_ready',
        name: 'Order Ready',
        channels: ['sms', 'push', 'audio', 'visual'],
        subject: 'Your Order is Ready - {{orderId}}',
        body: 'Your order {{orderId}} is ready for pickup/delivery!',
        priority: 'urgent',
      },
      {
        id: 'order_out_for_delivery',
        name: 'Out for Delivery',
        channels: ['sms', 'push', 'whatsapp'],
        subject: 'Order Out for Delivery - {{orderId}}',
        body: 'Your order {{orderId}} is on the way! Driver: {{driverName}}, ETA: {{eta}}',
        priority: 'high',
      },
      {
        id: 'order_delivered',
        name: 'Order Delivered',
        channels: ['sms', 'email', 'push', 'whatsapp'],
        subject: 'Order Delivered - {{orderId}}',
        body: 'Your order {{orderId}} has been delivered. Thank you for ordering!',
        priority: 'medium',
      },
      {
        id: 'order_delayed',
        name: 'Order Delayed',
        channels: ['sms', 'push', 'audio'],
        subject: 'Order Delayed - {{orderId}}',
        body: 'Your order {{orderId}} is delayed. New ETA: {{eta}}. Apologies for the inconvenience.',
        priority: 'urgent',
      },
      {
        id: 'order_cancelled',
        name: 'Order Cancelled',
        channels: ['sms', 'email', 'push'],
        subject: 'Order Cancelled - {{orderId}}',
        body: 'Your order {{orderId}} has been cancelled. Refund will be processed within 24 hours.',
        priority: 'high',
      },
    ];

    for (const template of templates) {
      this.templates.set(template.id, template);
    }
  }

  /**
   * Initialize audio alerts
   */
  private initializeAudioAlerts(): void {
    this.audioAlerts.set('order_ready', '/audio/order-ready.mp3');
    this.audioAlerts.set('order_delayed', '/audio/order-delayed.mp3');
    this.audioAlerts.set('urgent_alert', '/audio/urgent-alert.mp3');
  }

  /**
   * Send notification through all enabled channels
   */
  async sendNotification(
    orderId: string,
    customerId: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<NotificationLog> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const preferences = this.preferences.get(customerId) || this.getDefaultPreferences(customerId);
    const enabledChannels = this.getEnabledChannels(template.channels, preferences);

    const notificationLog: NotificationLog = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      customerId,
      channels: enabledChannels,
      status: 'pending',
      sentAt: new Date(),
    };

    // Send through all enabled channels in parallel
    const sendPromises = enabledChannels.map((channel) =>
      this.sendThroughChannel(channel, orderId, customerId, template, variables, notificationLog),
    );

    try {
      await Promise.all(sendPromises);
      notificationLog.status = 'sent';
      notificationLog.deliveredAt = new Date();
    } catch (error) {
      notificationLog.status = 'failed';
      notificationLog.failureReason = error instanceof Error ? error.message : 'Unknown error';
    }

    this.notificationLogs.push(notificationLog);
    return notificationLog;
  }

  /**
   * Send through specific channel
   */
  private async sendThroughChannel(
    channel: NotificationChannel,
    orderId: string,
    customerId: string,
    template: NotificationTemplate,
    variables: Record<string, string>,
    log: NotificationLog,
  ): Promise<void> {
    const message = this.interpolateTemplate(template.body, variables);

    switch (channel) {
      case 'sms':
        await this.sendSMS(customerId, message);
        break;
      case 'email':
        await this.sendEmail(customerId, template.subject || '', message);
        break;
      case 'push':
        await this.sendPushNotification(customerId, template.name, message);
        break;
      case 'audio':
        await this.playAudioAlert(template.id);
        break;
      case 'visual':
        await this.displayVisualAlert(orderId, template.name, message);
        break;
      case 'whatsapp':
        await this.sendWhatsApp(customerId, message);
        break;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(customerId: string, message: string): Promise<void> {
    // Integration with SMS provider (Twilio, AWS SNS, etc.)
    console.log(`[SMS] To: ${customerId}, Message: ${message}`);
    // await smsProvider.send(customerId, message);
  }

  /**
   * Send email notification
   */
  private async sendEmail(customerId: string, subject: string, body: string): Promise<void> {
    // Integration with email provider (SendGrid, AWS SES, etc.)
    console.log(`[EMAIL] To: ${customerId}, Subject: ${subject}`);
    // await emailProvider.send(customerId, subject, body);
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(customerId: string, title: string, body: string): Promise<void> {
    // Integration with push notification service (Firebase, OneSignal, etc.)
    console.log(`[PUSH] To: ${customerId}, Title: ${title}, Body: ${body}`);
    // await pushProvider.send(customerId, { title, body });
  }

  /**
   * Play audio alert
   */
  private async playAudioAlert(templateId: string): Promise<void> {
    const audioFile = this.audioAlerts.get(templateId);
    if (audioFile) {
      console.log(`[AUDIO] Playing: ${audioFile}`);
      // In browser: new Audio(audioFile).play();
    }
  }

  /**
   * Display visual alert
   */
  private async displayVisualAlert(orderId: string, title: string, message: string): Promise<void> {
    console.log(`[VISUAL] OrderID: ${orderId}, Title: ${title}, Message: ${message}`);
    // In browser: Show notification banner, toast, or modal
  }

  /**
   * Send WhatsApp message
   */
  private async sendWhatsApp(customerId: string, message: string): Promise<void> {
    // Integration with WhatsApp Business API
    console.log(`[WHATSAPP] To: ${customerId}, Message: ${message}`);
    // await whatsappProvider.send(customerId, message);
  }

  /**
   * Interpolate template variables
   */
  private interpolateTemplate(template: string, variables: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
  }

  /**
   * Get enabled channels based on preferences
   */
  private getEnabledChannels(
    templateChannels: NotificationChannel[],
    preferences: NotificationPreference,
  ): NotificationChannel[] {
    return templateChannels.filter((channel) => {
      switch (channel) {
        case 'sms':
          return preferences.smsEnabled;
        case 'email':
          return preferences.emailEnabled;
        case 'push':
          return preferences.pushEnabled;
        case 'audio':
          return preferences.audioEnabled;
        case 'visual':
          return preferences.visualEnabled;
        case 'whatsapp':
          return preferences.whatsappEnabled;
        default:
          return false;
      }
    });
  }

  /**
   * Get default preferences
   */
  private getDefaultPreferences(customerId: string): NotificationPreference {
    return {
      customerId,
      smsEnabled: true,
      emailEnabled: true,
      pushEnabled: true,
      audioEnabled: false,
      visualEnabled: true,
      whatsappEnabled: true,
    };
  }

  /**
   * Set notification preferences
   */
  async setPreferences(customerId: string, preferences: Partial<NotificationPreference>): Promise<NotificationPreference> {
    const existing = this.preferences.get(customerId) || this.getDefaultPreferences(customerId);
    const updated = { ...existing, ...preferences, customerId };
    this.preferences.set(customerId, updated);
    return updated;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(customerId: string): Promise<NotificationPreference> {
    return this.preferences.get(customerId) || this.getDefaultPreferences(customerId);
  }

  /**
   * Send order status notification
   */
  async notifyOrderStatus(
    orderId: string,
    customerId: string,
    status: OrderStatus,
    variables: Record<string, string>,
  ): Promise<NotificationLog> {
    const templateMap: Record<OrderStatus, string> = {
      confirmed: 'order_confirmed',
      preparing: 'order_preparing',
      ready: 'order_ready',
      out_for_delivery: 'order_out_for_delivery',
      delivered: 'order_delivered',
      cancelled: 'order_cancelled',
    };

    const templateId = templateMap[status];
    return this.sendNotification(orderId, customerId, templateId, variables);
  }

  /**
   * Send urgent alert (e.g., order delayed)
   */
  async sendUrgentAlert(orderId: string, customerId: string, reason: string): Promise<NotificationLog> {
    const variables = {
      orderId,
      reason,
      eta: new Date(Date.now() + 15 * 60000).toLocaleTimeString(),
    };

    return this.sendNotification(orderId, customerId, 'order_delayed', variables);
  }

  /**
   * Get notification logs
   */
  async getNotificationLogs(orderId: string): Promise<NotificationLog[]> {
    return this.notificationLogs.filter((log) => log.orderId === orderId);
  }

  /**
   * Get customer notification history
   */
  async getCustomerNotificationHistory(customerId: string, limit: number = 50): Promise<NotificationLog[]> {
    return this.notificationLogs
      .filter((log) => log.customerId === customerId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, limit);
  }

  /**
   * Resend notification
   */
  async resendNotification(notificationId: string): Promise<NotificationLog> {
    const log = this.notificationLogs.find((l) => l.id === notificationId);
    if (!log) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    // Resend through all channels that were originally used
    log.status = 'pending';
    log.sentAt = new Date();
    return log;
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(startDate: Date, endDate: Date): Promise<any> {
    const logs = this.notificationLogs.filter((log) => log.sentAt >= startDate && log.sentAt <= endDate);

    const stats = {
      total: logs.length,
      sent: logs.filter((l) => l.status === 'sent').length,
      failed: logs.filter((l) => l.status === 'failed').length,
      pending: logs.filter((l) => l.status === 'pending').length,
      byChannel: {
        sms: logs.filter((l) => l.channels.includes('sms')).length,
        email: logs.filter((l) => l.channels.includes('email')).length,
        push: logs.filter((l) => l.channels.includes('push')).length,
        audio: logs.filter((l) => l.channels.includes('audio')).length,
        visual: logs.filter((l) => l.channels.includes('visual')).length,
        whatsapp: logs.filter((l) => l.channels.includes('whatsapp')).length,
      },
      successRate: logs.length > 0 ? ((logs.filter((l) => l.status === 'sent').length / logs.length) * 100).toFixed(2) : '0',
    };

    return stats;
  }

  /**
   * Bulk send notifications
   */
  async bulkSendNotifications(
    orderIds: string[],
    customerIds: string[],
    templateId: string,
    variables: Record<string, string>,
  ): Promise<NotificationLog[]> {
    const results: NotificationLog[] = [];

    for (let i = 0; i < orderIds.length; i++) {
      const log = await this.sendNotification(orderIds[i], customerIds[i], templateId, variables);
      results.push(log);
    }

    return results;
  }

  /**
   * Schedule notification
   */
  async scheduleNotification(
    orderId: string,
    customerId: string,
    templateId: string,
    variables: Record<string, string>,
    delayMs: number,
  ): Promise<{ scheduledId: string; sendAt: Date }> {
    const sendAt = new Date(Date.now() + delayMs);
    const scheduledId = `SCHED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Schedule for later execution
    setTimeout(() => {
      this.sendNotification(orderId, customerId, templateId, variables);
    }, delayMs);

    return { scheduledId, sendAt };
  }
}

export default OrderNotificationsService;
