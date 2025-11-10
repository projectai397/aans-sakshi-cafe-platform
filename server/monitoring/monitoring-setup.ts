/**
 * Monitoring & Alerts Setup
 * Configure Sentry, New Relic, and Slack notifications
 */

import * as Sentry from "@sentry/node";
import newrelic from "newrelic";

/**
 * Initialize Sentry for error tracking
 */
export function initializeSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    beforeSend(event, hint) {
      // Filter out health check errors
      if (event.request?.url?.includes("/health")) {
        return null;
      }
      return event;
    },
  });

  console.log("✅ Sentry initialized for error tracking");
}

/**
 * Initialize New Relic for performance monitoring
 */
export function initializeNewRelic() {
  // New Relic is initialized via newrelic.js config file
  console.log("✅ New Relic initialized for performance monitoring");
}

/**
 * Custom metrics for monitoring
 */
export class MetricsCollector {
  private metrics: Map<string, number> = new Map();

  /**
   * Record API response time
   */
  recordApiResponseTime(endpoint: string, duration: number) {
    newrelic.recordMetric(`Custom/API/${endpoint}/ResponseTime`, duration);
  }

  /**
   * Record database query time
   */
  recordDatabaseQueryTime(query: string, duration: number) {
    newrelic.recordMetric(`Custom/Database/QueryTime`, duration);
  }

  /**
   * Record order processing time
   */
  recordOrderProcessingTime(duration: number) {
    newrelic.recordMetric(`Custom/Orders/ProcessingTime`, duration);
  }

  /**
   * Record cache hit/miss
   */
  recordCacheHitMiss(hit: boolean) {
    const metric = hit ? "Custom/Cache/Hits" : "Custom/Cache/Misses";
    newrelic.recordMetric(metric, 1);
  }

  /**
   * Record error
   */
  recordError(error: Error, context: string) {
    Sentry.captureException(error, {
      tags: { context },
    });

    newrelic.recordMetric(`Custom/Errors/${context}`, 1);
  }
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  name: string;
  condition: string;
  threshold: number;
  duration: number; // in minutes
  severity: "critical" | "warning" | "info";
}

export const ALERT_CONFIGS: AlertConfig[] = [
  {
    name: "High Error Rate",
    condition: "error_rate > 5%",
    threshold: 5,
    duration: 5,
    severity: "critical",
  },
  {
    name: "High Response Time",
    condition: "response_time > 2000ms",
    threshold: 2000,
    duration: 10,
    severity: "warning",
  },
  {
    name: "Database Connection Pool Exhausted",
    condition: "db_connections > 90%",
    threshold: 90,
    duration: 2,
    severity: "critical",
  },
  {
    name: "High Memory Usage",
    condition: "memory_usage > 80%",
    threshold: 80,
    duration: 5,
    severity: "warning",
  },
  {
    name: "Low Disk Space",
    condition: "disk_space < 10%",
    threshold: 10,
    duration: 1,
    severity: "critical",
  },
  {
    name: "Order Processing Delay",
    condition: "order_processing_time > 5000ms",
    threshold: 5000,
    duration: 10,
    severity: "warning",
  },
];

/**
 * Slack notification helper
 */
export async function sendSlackAlert(
  message: string,
  severity: "critical" | "warning" | "info"
) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const colors: Record<string, string> = {
    critical: "#FF0000",
    warning: "#FFA500",
    info: "#0099FF",
  };

  const payload = {
    attachments: [
      {
        color: colors[severity],
        title: `${severity.toUpperCase()} Alert`,
        text: message,
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Failed to send Slack alert:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending Slack alert:", error);
  }
}

/**
 * Health check endpoint
 */
export async function performHealthCheck() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    checks: {
      database: false,
      cache: false,
      externalServices: false,
    },
  };

  try {
    // Check database
    // health.checks.database = await checkDatabase();

    // Check cache
    // health.checks.cache = await checkCache();

    // Check external services
    // health.checks.externalServices = await checkExternalServices();

    const allHealthy = Object.values(health.checks).every((v) => v === true);
    health.status = allHealthy ? "healthy" : "degraded";

    return health;
  } catch (error) {
    return {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Monitoring middleware for Express
 */
export function monitoringMiddleware(
  req: any,
  res: any,
  next: () => void
) {
  const startTime = Date.now();

  // Capture response
  const originalSend = res.send;
  res.send = function (data: any) {
    const duration = Date.now() - startTime;

    // Record metrics
    newrelic.recordMetric(`Custom/API/${req.path}/ResponseTime`, duration);
    newrelic.recordMetric(`Custom/API/${req.method}/${res.statusCode}`, 1);

    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} (${duration}ms)`);
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Error handler with monitoring
 */
export function errorHandler(
  error: Error,
  req: any,
  res: any,
  next: () => void
) {
  // Capture error in Sentry
  Sentry.captureException(error, {
    tags: {
      method: req.method,
      path: req.path,
    },
  });

  // Record error metric
  newrelic.recordMetric(`Custom/Errors/${req.path}`, 1);

  // Send Slack alert for critical errors
  if (error.message.includes("database") || error.message.includes("connection")) {
    sendSlackAlert(
      `Critical error on ${req.method} ${req.path}: ${error.message}`,
      "critical"
    );
  }

  // Send response
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  static recordDuration(name: string, duration: number) {
    newrelic.recordMetric(`Custom/Performance/${name}`, duration);

    if (duration > 1000) {
      console.warn(`Slow operation: ${name} (${duration}ms)`);
    }
  }

  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      return await fn();
    } finally {
      const duration = Date.now() - startTime;
      this.recordDuration(name, duration);
    }
  }

  static measure<T>(name: string, fn: () => T): T {
    const startTime = Date.now();
    try {
      return fn();
    } finally {
      const duration = Date.now() - startTime;
      this.recordDuration(name, duration);
    }
  }
}

/**
 * Initialize all monitoring
 */
export function initializeMonitoring() {
  console.log("🔍 Initializing monitoring...");

  initializeSentry();
  initializeNewRelic();

  console.log("✅ Monitoring initialized successfully");
  console.log("📊 Sentry DSN:", process.env.SENTRY_DSN?.substring(0, 20) + "...");
  console.log("📊 New Relic enabled");
  console.log("🔔 Slack alerts enabled");
}

export default {
  initializeMonitoring,
  MetricsCollector,
  PerformanceMonitor,
  sendSlackAlert,
  performHealthCheck,
  monitoringMiddleware,
  errorHandler,
};
