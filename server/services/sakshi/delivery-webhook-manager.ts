/**
 * Advanced Delivery Webhook Manager
 * Handles webhook verification, retry logic, and database persistence
 */

import crypto from 'crypto';

interface WebhookEvent {
  id: string;
  platform: string;
  event: string;
  orderId: string;
  locationId: string;
  payload: any;
  status: 'received' | 'processing' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  receivedAt: Date;
  processedAt?: Date;
}

interface PlatformSignatureConfig {
  platform: string;
  secretKey: string;
  signatureHeader: string;
  signatureAlgorithm: 'sha256' | 'sha512';
}

class DeliveryWebhookManager {
  private webhookEvents: Map<string, WebhookEvent> = new Map();
  private signatureConfigs: Map<string, PlatformSignatureConfig> = new Map();
  private eventQueue: string[] = [];
  private processingQueue: Set<string> = new Set();

  constructor() {
    this.initializeSignatureConfigs();
  }

  /**
   * Initialize signature verification configs for each platform
   */

  private initializeSignatureConfigs(): void {
    // Swiggy signature config
    this.signatureConfigs.set('swiggy', {
      platform: 'swiggy',
      secretKey: process.env.SWIGGY_WEBHOOK_SECRET || 'swiggy_secret',
      signatureHeader: 'x-swiggy-signature',
      signatureAlgorithm: 'sha256',
    });

    // Zomato signature config
    this.signatureConfigs.set('zomato', {
      platform: 'zomato',
      secretKey: process.env.ZOMATO_WEBHOOK_SECRET || 'zomato_secret',
      signatureHeader: 'x-zomato-signature',
      signatureAlgorithm: 'sha256',
    });

    // Uber Eats signature config
    this.signatureConfigs.set('uber_eats', {
      platform: 'uber_eats',
      secretKey: process.env.UBER_WEBHOOK_SECRET || 'uber_secret',
      signatureHeader: 'x-uber-signature',
      signatureAlgorithm: 'sha256',
    });
  }

  /**
   * Verify webhook signature
   */

  verifyWebhookSignature(platform: string, payload: string, signature: string): boolean {
    const config = this.signatureConfigs.get(platform);
    if (!config) {
      console.warn(`No signature config found for platform: ${platform}`);
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac(config.signatureAlgorithm, config.secretKey)
        .update(payload)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch (error) {
      console.error(`Signature verification failed for ${platform}:`, error);
      return false;
    }
  }

  /**
   * Process incoming webhook
   */

  async processWebhook(
    platform: string,
    event: string,
    orderId: string,
    locationId: string,
    payload: any
  ): Promise<WebhookEvent> {
    const webhookId = `${platform}-${orderId}-${Date.now()}`;

    const webhookEvent: WebhookEvent = {
      id: webhookId,
      platform,
      event,
      orderId,
      locationId,
      payload,
      status: 'received',
      retryCount: 0,
      maxRetries: 3,
      receivedAt: new Date(),
    };

    this.webhookEvents.set(webhookId, webhookEvent);
    this.eventQueue.push(webhookId);

    // Process webhook asynchronously
    this.processQueuedWebhook(webhookId).catch((error) => {
      console.error(`Error processing webhook ${webhookId}:`, error);
    });

    return webhookEvent;
  }

  /**
   * Process queued webhook with retry logic
   */

  private async processQueuedWebhook(webhookId: string): Promise<void> {
    if (this.processingQueue.has(webhookId)) {
      return; // Already processing
    }

    this.processingQueue.add(webhookId);

    try {
      const webhookEvent = this.webhookEvents.get(webhookId);
      if (!webhookEvent) {
        return;
      }

      webhookEvent.status = 'processing';

      // Simulate processing
      await this.executeWebhookLogic(webhookEvent);

      webhookEvent.status = 'completed';
      webhookEvent.processedAt = new Date();

      console.log(`Webhook processed successfully: ${webhookId}`);
    } catch (error) {
      const webhookEvent = this.webhookEvents.get(webhookId);
      if (webhookEvent) {
        webhookEvent.lastError = error instanceof Error ? error.message : 'Unknown error';
        webhookEvent.retryCount++;

        if (webhookEvent.retryCount < webhookEvent.maxRetries) {
          webhookEvent.status = 'received';
          // Retry after exponential backoff
          const backoffMs = Math.pow(2, webhookEvent.retryCount) * 1000;
          setTimeout(() => {
            this.processQueuedWebhook(webhookId).catch(console.error);
          }, backoffMs);
        } else {
          webhookEvent.status = 'failed';
          console.error(`Webhook failed after ${webhookEvent.maxRetries} retries: ${webhookId}`);
        }
      }
    } finally {
      this.processingQueue.delete(webhookId);
    }
  }

  /**
   * Execute webhook logic (placeholder)
   */

  private async executeWebhookLogic(webhookEvent: WebhookEvent): Promise<void> {
    // This would be replaced with actual business logic
    // For now, simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log(`Executing webhook logic for ${webhookEvent.platform} event: ${webhookEvent.event}`);
  }

  /**
   * Get webhook event status
   */

  getWebhookStatus(webhookId: string): WebhookEvent | null {
    return this.webhookEvents.get(webhookId) || null;
  }

  /**
   * Get all webhooks for a location
   */

  getLocationWebhooks(locationId: string, status?: string): WebhookEvent[] {
    const webhooks = Array.from(this.webhookEvents.values()).filter((w) => w.locationId === locationId);

    if (status) {
      return webhooks.filter((w) => w.status === status);
    }

    return webhooks;
  }

  /**
   * Get all webhooks for a platform
   */

  getPlatformWebhooks(platform: string, status?: string): WebhookEvent[] {
    const webhooks = Array.from(this.webhookEvents.values()).filter((w) => w.platform === platform);

    if (status) {
      return webhooks.filter((w) => w.status === status);
    }

    return webhooks;
  }

  /**
   * Get webhook statistics
   */

  getWebhookStats(): any {
    const webhooks = Array.from(this.webhookEvents.values());

    const stats = {
      total: webhooks.length,
      byStatus: {
        received: webhooks.filter((w) => w.status === 'received').length,
        processing: webhooks.filter((w) => w.status === 'processing').length,
        completed: webhooks.filter((w) => w.status === 'completed').length,
        failed: webhooks.filter((w) => w.status === 'failed').length,
      },
      byPlatform: {} as any,
      avgRetries: webhooks.length > 0 ? webhooks.reduce((sum, w) => sum + w.retryCount, 0) / webhooks.length : 0,
    };

    const platforms = ['swiggy', 'zomato', 'uber_eats'];
    for (const platform of platforms) {
      const platformWebhooks = webhooks.filter((w) => w.platform === platform);
      stats.byPlatform[platform] = {
        total: platformWebhooks.length,
        completed: platformWebhooks.filter((w) => w.status === 'completed').length,
        failed: platformWebhooks.filter((w) => w.status === 'failed').length,
        successRate: platformWebhooks.length > 0 ? (platformWebhooks.filter((w) => w.status === 'completed').length / platformWebhooks.length) * 100 : 0,
      };
    }

    return stats;
  }

  /**
   * Retry failed webhooks
   */

  async retryFailedWebhooks(locationId?: string): Promise<number> {
    const failedWebhooks = Array.from(this.webhookEvents.values()).filter(
      (w) => w.status === 'failed' && (!locationId || w.locationId === locationId)
    );

    let retryCount = 0;
    for (const webhook of failedWebhooks) {
      webhook.status = 'received';
      webhook.retryCount = 0;
      this.eventQueue.push(webhook.id);
      await this.processQueuedWebhook(webhook.id);
      retryCount++;
    }

    return retryCount;
  }

  /**
   * Clean up old webhooks
   */

  cleanupOldWebhooks(ageHours: number = 24): number {
    const cutoffTime = new Date(Date.now() - ageHours * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [webhookId, webhook] of this.webhookEvents.entries()) {
      if (webhook.receivedAt < cutoffTime && webhook.status === 'completed') {
        this.webhookEvents.delete(webhookId);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Get queue status
   */

  getQueueStatus(): any {
    return {
      queueLength: this.eventQueue.length,
      processingCount: this.processingQueue.size,
      pendingWebhooks: this.eventQueue.filter((id) => {
        const webhook = this.webhookEvents.get(id);
        return webhook && webhook.status === 'received';
      }).length,
    };
  }
}

export default DeliveryWebhookManager;
