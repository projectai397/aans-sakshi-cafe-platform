/**
 * Integration Hub Service
 * Third-party integration management and webhook handling
 */

type IntegrationType = 'accounting' | 'crm' | 'email_marketing' | 'sms' | 'payment' | 'inventory' | 'custom';
type IntegrationStatus = 'active' | 'inactive' | 'error' | 'pending';
type WebhookEvent = 'order_created' | 'order_updated' | 'payment_received' | 'customer_created' | 'inventory_updated' | 'custom';

interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  config: Record<string, any>;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly';
  createdAt: Date;
  updatedAt: Date;
}

interface Webhook {
  id: string;
  integrationId: string;
  event: WebhookEvent;
  targetUrl: string;
  headers?: Record<string, string>;
  isActive: boolean;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
}

interface WebhookLog {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  payload: Record<string, any>;
  status: 'success' | 'failed' | 'pending';
  statusCode?: number;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  deliveredAt?: Date;
}

interface SyncJob {
  id: string;
  integrationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  startTime: Date;
  endTime?: Date;
  errorMessage?: string;
}

interface IntegrationMetrics {
  integrationId: string;
  totalWebhooks: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number;
  successRate: number;
  lastSyncTime?: Date;
  nextSyncTime?: Date;
}

class IntegrationHubService {
  private integrations: Map<string, Integration> = new Map();
  private webhooks: Map<string, Webhook> = new Map();
  private webhookLogs: Map<string, WebhookLog> = new Map();
  private syncJobs: Map<string, SyncJob> = new Map();

  /**
   * Create integration
   */
  async createIntegration(integration: Omit<Integration, 'id | createdAt | updatedAt'>): Promise<Integration> {
    const fullIntegration: Integration = {
      ...integration,
      id: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.integrations.set(fullIntegration.id, fullIntegration);
    return fullIntegration;
  }

  /**
   * Get integration
   */
  async getIntegration(integrationId: string): Promise<Integration | null> {
    return this.integrations.get(integrationId) || null;
  }

  /**
   * Get all integrations
   */
  async getAllIntegrations(type?: IntegrationType): Promise<Integration[]> {
    let integrations = Array.from(this.integrations.values());

    if (type) {
      integrations = integrations.filter((i) => i.type === type);
    }

    return integrations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update integration
   */
  async updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<Integration> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    Object.assign(integration, updates);
    integration.updatedAt = new Date();
    return integration;
  }

  /**
   * Delete integration
   */
  async deleteIntegration(integrationId: string): Promise<void> {
    this.integrations.delete(integrationId);

    // Delete associated webhooks
    for (const [id, webhook] of this.webhooks) {
      if (webhook.integrationId === integrationId) {
        this.webhooks.delete(id);
      }
    }
  }

  /**
   * Create webhook
   */
  async createWebhook(webhook: Omit<Webhook, 'id | createdAt'>): Promise<Webhook> {
    const fullWebhook: Webhook = {
      ...webhook,
      id: `WEBHOOK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.webhooks.set(fullWebhook.id, fullWebhook);
    return fullWebhook;
  }

  /**
   * Get webhooks for integration
   */
  async getWebhooks(integrationId: string): Promise<Webhook[]> {
    return Array.from(this.webhooks.values())
      .filter((w) => w.integrationId === integrationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: string, updates: Partial<Webhook>): Promise<Webhook> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    Object.assign(webhook, updates);
    return webhook;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    this.webhooks.delete(webhookId);
  }

  /**
   * Trigger webhook
   */
  async triggerWebhook(webhookId: string, payload: Record<string, any>): Promise<WebhookLog> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) {
      throw new Error(`Webhook ${webhookId} not found`);
    }

    const log: WebhookLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      webhookId,
      event: webhook.event,
      payload,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date(),
    };

    this.webhookLogs.set(log.id, log);

    // Simulate webhook delivery
    setTimeout(() => {
      log.status = 'success';
      log.statusCode = 200;
      log.deliveredAt = new Date();
    }, 1000);

    return log;
  }

  /**
   * Get webhook logs
   */
  async getWebhookLogs(webhookId: string, limit: number = 50): Promise<WebhookLog[]> {
    return Array.from(this.webhookLogs.values())
      .filter((l) => l.webhookId === webhookId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Create sync job
   */
  async createSyncJob(integrationId: string): Promise<SyncJob> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    const job: SyncJob = {
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      status: 'pending',
      recordsProcessed: 0,
      recordsFailed: 0,
      startTime: new Date(),
    };

    this.syncJobs.set(job.id, job);

    // Simulate sync processing
    setTimeout(() => {
      job.status = 'in_progress';
    }, 1000);

    setTimeout(() => {
      job.status = 'completed';
      job.recordsProcessed = Math.floor(Math.random() * 1000) + 100;
      job.recordsFailed = Math.floor(Math.random() * 10);
      job.endTime = new Date();
      integration.lastSyncAt = new Date();
    }, 5000);

    return job;
  }

  /**
   * Get sync job
   */
  async getSyncJob(jobId: string): Promise<SyncJob | null> {
    return this.syncJobs.get(jobId) || null;
  }

  /**
   * Get sync jobs for integration
   */
  async getSyncJobs(integrationId: string, limit: number = 10): Promise<SyncJob[]> {
    return Array.from(this.syncJobs.values())
      .filter((j) => j.integrationId === integrationId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }

  /**
   * Test integration
   */
  async testIntegration(integrationId: string): Promise<any> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Simulate connection test
    return {
      success: true,
      message: `Successfully connected to ${integration.name}`,
      timestamp: new Date(),
      latency: Math.floor(Math.random() * 500) + 100, // ms
    };
  }

  /**
   * Get integration metrics
   */
  async getIntegrationMetrics(integrationId: string): Promise<IntegrationMetrics> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    const webhooks = await this.getWebhooks(integrationId);
    const allLogs = Array.from(this.webhookLogs.values()).filter((l) => webhooks.some((w) => w.id === l.webhookId));

    const successfulDeliveries = allLogs.filter((l) => l.status === 'success').length;
    const failedDeliveries = allLogs.filter((l) => l.status === 'failed').length;
    const responseTimes = allLogs.filter((l) => l.deliveredAt).map((l) => (l.deliveredAt!.getTime() - l.createdAt.getTime()) / 1000);
    const averageResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b) / responseTimes.length : 0;

    return {
      integrationId,
      totalWebhooks: webhooks.length,
      successfulDeliveries,
      failedDeliveries,
      averageResponseTime: Math.round(averageResponseTime * 1000), // ms
      successRate: allLogs.length > 0 ? (successfulDeliveries / allLogs.length) * 100 : 0,
      lastSyncTime: integration.lastSyncAt,
      nextSyncTime: integration.nextSyncAt,
    };
  }

  /**
   * Get all integration metrics
   */
  async getAllIntegrationMetrics(): Promise<IntegrationMetrics[]> {
    const integrations = await this.getAllIntegrations();
    const metrics: IntegrationMetrics[] = [];

    for (const integration of integrations) {
      metrics.push(await this.getIntegrationMetrics(integration.id));
    }

    return metrics.sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Retry failed webhook
   */
  async retryFailedWebhook(logId: string): Promise<WebhookLog> {
    const log = this.webhookLogs.get(logId);
    if (!log) {
      throw new Error(`Webhook log ${logId} not found`);
    }

    const webhook = this.webhooks.get(log.webhookId);
    if (!webhook || webhook.retryCount >= webhook.maxRetries) {
      throw new Error('Maximum retries exceeded');
    }

    log.retryCount++;
    webhook.retryCount++;

    // Simulate retry
    setTimeout(() => {
      log.status = 'success';
      log.statusCode = 200;
      log.deliveredAt = new Date();
    }, 1000);

    return log;
  }

  /**
   * Get integration health
   */
  async getIntegrationHealth(): Promise<any> {
    const allMetrics = await this.getAllIntegrationMetrics();

    const totalIntegrations = allMetrics.length;
    const healthyIntegrations = allMetrics.filter((m) => m.successRate >= 95).length;
    const averageSuccessRate = allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.successRate, 0) / allMetrics.length : 0;

    return {
      totalIntegrations,
      healthyIntegrations,
      unhealthyIntegrations: totalIntegrations - healthyIntegrations,
      averageSuccessRate: Math.round(averageSuccessRate),
      overallHealth: averageSuccessRate >= 95 ? 'healthy' : averageSuccessRate >= 80 ? 'degraded' : 'critical',
    };
  }
}

export default IntegrationHubService;
