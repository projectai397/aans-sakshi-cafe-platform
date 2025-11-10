/**
 * Automated Alert System Service
 * Threshold-based alerts for KPI deviations, SLA breaches, and performance drops
 */

type AlertType = 'kpi_deviation' | 'sla_breach' | 'performance_drop' | 'inventory_low' | 'order_failure' | 'customer_churn' | 'delivery_delay';
type AlertSeverity = 'info' | 'warning' | 'critical';
type AlertChannel = 'email' | 'sms' | 'push' | 'in_app' | 'slack';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';

interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  metric: string;
  threshold: number;
  operator: '<' | '>' | '=' | '!=';
  severity: AlertSeverity;
  channels: AlertChannel[];
  enabled: boolean;
  createdAt: Date;
}

interface Alert {
  id: string;
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  channels: AlertChannel[];
  status: AlertStatus;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

interface AlertNotification {
  id: string;
  alertId: string;
  channel: AlertChannel;
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  failureReason?: string;
}

interface AlertStatistics {
  totalAlerts: number;
  activeAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  averageResolutionTime: number;
  alertsByType: Record<AlertType, number>;
  alertsBySeverity: Record<AlertSeverity, number>;
  alertsByChannel: Record<AlertChannel, number>;
  topTriggeredRules: Array<{ ruleId: string; ruleName: string; count: number }>;
}

class AlertSystemService {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private notifications: Map<string, AlertNotification> = new Map();
  private ruleHistory: Map<string, Alert[]> = new Map();

  /**
   * Create alert rule
   */
  async createRule(rule: Omit<AlertRule, 'id | createdAt'>): Promise<AlertRule> {
    const fullRule: AlertRule = {
      ...rule,
      id: `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.rules.set(fullRule.id, fullRule);
    return fullRule;
  }

  /**
   * Get rule
   */
  async getRule(ruleId: string): Promise<AlertRule | null> {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Get all rules
   */
  async getAllRules(enabled?: boolean): Promise<AlertRule[]> {
    let rules = Array.from(this.rules.values());

    if (enabled !== undefined) {
      rules = rules.filter((r) => r.enabled === enabled);
    }

    return rules;
  }

  /**
   * Update rule
   */
  async updateRule(ruleId: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const updated = { ...rule, ...updates };
    this.rules.set(ruleId, updated);
    return updated;
  }

  /**
   * Delete rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    this.rules.delete(ruleId);
  }

  /**
   * Check metric against rules
   */
  async checkMetric(metric: string, value: number): Promise<Alert[]> {
    const triggeredAlerts: Alert[] = [];
    const enabledRules = await this.getAllRules(true);

    for (const rule of enabledRules) {
      if (rule.metric === metric) {
        let triggered = false;

        switch (rule.operator) {
          case '<':
            triggered = value < rule.threshold;
            break;
          case '>':
            triggered = value > rule.threshold;
            break;
          case '=':
            triggered = value === rule.threshold;
            break;
          case '!=':
            triggered = value !== rule.threshold;
            break;
        }

        if (triggered) {
          const alert = await this.createAlert(rule, value);
          triggeredAlerts.push(alert);

          // Send notifications
          await this.sendAlertNotifications(alert);
        }
      }
    }

    return triggeredAlerts;
  }

  /**
   * Create alert
   */
  private async createAlert(rule: AlertRule, currentValue: number): Promise<Alert> {
    const alert: Alert = {
      id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      description: `${rule.metric} is ${rule.operator} ${rule.threshold} (current: ${currentValue})`,
      metric: rule.metric,
      currentValue,
      threshold: rule.threshold,
      channels: rule.channels,
      status: 'active',
      createdAt: new Date(),
    };

    this.alerts.set(alert.id, alert);

    // Track in history
    const history = this.ruleHistory.get(rule.id) || [];
    history.push(alert);
    this.ruleHistory.set(rule.id, history);

    return alert;
  }

  /**
   * Get alert
   */
  async getAlert(alertId: string): Promise<Alert | null> {
    return this.alerts.get(alertId) || null;
  }

  /**
   * Get all alerts
   */
  async getAllAlerts(status?: AlertStatus, severity?: AlertSeverity): Promise<Alert[]> {
    let alerts = Array.from(this.alerts.values());

    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }

    if (severity) {
      alerts = alerts.filter((a) => a.severity === severity);
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<Alert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;

    return alert;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, resolvedBy: string, resolutionNotes?: string): Promise<Alert> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    alert.resolutionNotes = resolutionNotes;

    return alert;
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(alert: Alert): Promise<void> {
    for (const channel of alert.channels) {
      const notification: AlertNotification = {
        id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        alertId: alert.id,
        channel,
        recipient: this.getRecipientForChannel(channel),
        message: this.formatAlertMessage(alert),
        status: 'pending',
      };

      this.notifications.set(notification.id, notification);

      // Simulate sending
      setTimeout(() => {
        this.sendNotification(notification);
      }, 100);
    }
  }

  /**
   * Send notification
   */
  private async sendNotification(notification: AlertNotification): Promise<void> {
    try {
      // Simulate sending based on channel
      switch (notification.channel) {
        case 'email':
          console.log(`Sending email to ${notification.recipient}: ${notification.message}`);
          break;
        case 'sms':
          console.log(`Sending SMS to ${notification.recipient}: ${notification.message}`);
          break;
        case 'push':
          console.log(`Sending push notification: ${notification.message}`);
          break;
        case 'slack':
          console.log(`Sending Slack message: ${notification.message}`);
          break;
        case 'in_app':
          console.log(`Creating in-app notification: ${notification.message}`);
          break;
      }

      notification.status = 'sent';
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = 'failed';
      notification.failureReason = (error as Error).message;
    }
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(alert: Alert): string {
    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨',
    };

    return `${severityEmoji[alert.severity]} ${alert.title}\n${alert.description}`;
  }

  /**
   * Get recipient for channel
   */
  private getRecipientForChannel(channel: AlertChannel): string {
    // In production, this would look up actual recipients
    const recipients: Record<AlertChannel, string> = {
      email: 'admin@sakshicafe.com',
      sms: '+91-9876543210',
      push: 'app-user-001',
      slack: '#alerts',
      in_app: 'dashboard',
    };

    return recipients[channel];
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(startDate: Date, endDate: Date): Promise<AlertStatistics> {
    const allAlerts = Array.from(this.alerts.values()).filter((a) => a.createdAt >= startDate && a.createdAt <= endDate);

    const stats: AlertStatistics = {
      totalAlerts: allAlerts.length,
      activeAlerts: allAlerts.filter((a) => a.status === 'active').length,
      acknowledgedAlerts: allAlerts.filter((a) => a.status === 'acknowledged').length,
      resolvedAlerts: allAlerts.filter((a) => a.status === 'resolved').length,
      averageResolutionTime: 0,
      alertsByType: {} as Record<AlertType, number>,
      alertsBySeverity: {} as Record<AlertSeverity, number>,
      alertsByChannel: {} as Record<AlertChannel, number>,
      topTriggeredRules: [],
    };

    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedCount = 0;

    for (const alert of allAlerts) {
      if (alert.resolvedAt) {
        totalResolutionTime += alert.resolvedAt.getTime() - alert.createdAt.getTime();
        resolvedCount++;
      }

      // Count by type
      stats.alertsByType[alert.type] = (stats.alertsByType[alert.type] || 0) + 1;

      // Count by severity
      stats.alertsBySeverity[alert.severity] = (stats.alertsBySeverity[alert.severity] || 0) + 1;

      // Count by channel
      for (const channel of alert.channels) {
        stats.alertsByChannel[channel] = (stats.alertsByChannel[channel] || 0) + 1;
      }
    }

    stats.averageResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount / (1000 * 60) : 0; // minutes

    // Get top triggered rules
    const ruleCounts: Record<string, number> = {};
    for (const alert of allAlerts) {
      ruleCounts[alert.ruleId] = (ruleCounts[alert.ruleId] || 0) + 1;
    }

    stats.topTriggeredRules = Object.entries(ruleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ruleId, count]) => {
        const rule = this.rules.get(ruleId);
        return {
          ruleId,
          ruleName: rule?.name || 'Unknown',
          count,
        };
      });

    return stats;
  }

  /**
   * Get alerts by type
   */
  async getAlertsByType(type: AlertType): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((a) => a.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get alerts by severity
   */
  async getAlertsBySeverity(severity: AlertSeverity): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((a) => a.severity === severity)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get active alerts count
   */
  async getActiveAlertsCount(): Promise<number> {
    return Array.from(this.alerts.values()).filter((a) => a.status === 'active').length;
  }

  /**
   * Get critical alerts
   */
  async getCriticalAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((a) => a.severity === 'critical' && a.status === 'active')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export default AlertSystemService;
