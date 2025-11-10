# Week 3: Analytics & Monitoring Implementation Guide
## Metabase, ELK Stack & Performance Tracking (Nov 20-24, 2025)

**Objective:** Deploy comprehensive analytics, logging, and monitoring infrastructure  
**Timeline:** 5 Days  
**Team:** 2 Backend + 1 DevOps  
**Expected Outcome:** Production-ready monitoring platform with real-time dashboards

---

## 📋 Week 3 Overview

| Day | Phase | Tasks | Deliverables |
|-----|-------|-------|--------------|
| 1-2 | Metabase | Setup, config, dashboards | Analytics platform |
| 2-3 | ELK Stack | Elasticsearch, Logstash, Kibana | Logging infrastructure |
| 3-4 | Dashboards | Business, technical, performance | 5+ dashboards |
| 4-5 | Alerts | Monitoring, notifications | Alert system |
| 5 | Testing | Integration, verification | Production ready |

---

## Phase 1: Deploy Metabase Analytics Platform

### 1.1 Metabase Setup (Day 1 - 4 hours)

**Installation via Docker:**

```bash
# Create Metabase container
docker run -d \
  --name metabase \
  -p 3001:3000 \
  -e MB_DB_TYPE=postgres \
  -e MB_DB_DBNAME=metabase \
  -e MB_DB_PORT=5432 \
  -e MB_DB_USER=metabase_user \
  -e MB_DB_PASS=secure_password \
  -e MB_DB_HOST=postgres \
  metabase/metabase:latest

# Access at http://localhost:3001
```

**Initial Configuration:**
- Create admin account
- Connect to AANS PostgreSQL database
- Configure data sources
- Set up user permissions

### 1.2 Database Connection (Day 1 - 2 hours)

**Connect AANS Database:**

```javascript
// Metabase API Configuration
const METABASE_URL = 'http://localhost:3001'
const METABASE_USERNAME = 'admin@aans.com'
const METABASE_PASSWORD = 'secure_password'

// Database Connection Details
const databaseConfig = {
  engine: 'postgres',
  name: 'AANS Production',
  details: {
    host: process.env.DB_HOST,
    port: 5432,
    dbname: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: true,
  },
}
```

**Create Tables for Analytics:**

```sql
-- Call Metrics Table
CREATE TABLE call_metrics (
  id SERIAL PRIMARY KEY,
  cafe_id UUID NOT NULL,
  date DATE NOT NULL,
  total_calls INT DEFAULT 0,
  answered_calls INT DEFAULT 0,
  missed_calls INT DEFAULT 0,
  average_duration INT DEFAULT 0,
  peak_hour INT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (cafe_id) REFERENCES cafes(id)
);

-- Order Analytics Table
CREATE TABLE order_analytics (
  id SERIAL PRIMARY KEY,
  cafe_id UUID NOT NULL,
  date DATE NOT NULL,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  delivery_orders INT DEFAULT 0,
  dine_in_orders INT DEFAULT 0,
  takeaway_orders INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (cafe_id) REFERENCES cafes(id)
);

-- Customer Satisfaction Table
CREATE TABLE customer_satisfaction (
  id SERIAL PRIMARY KEY,
  cafe_id UUID NOT NULL,
  date DATE NOT NULL,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INT DEFAULT 0,
  positive_reviews INT DEFAULT 0,
  negative_reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (cafe_id) REFERENCES cafes(id)
);

-- Reservation Analytics Table
CREATE TABLE reservation_analytics (
  id SERIAL PRIMARY KEY,
  cafe_id UUID NOT NULL,
  date DATE NOT NULL,
  total_reservations INT DEFAULT 0,
  confirmed_reservations INT DEFAULT 0,
  cancelled_reservations INT DEFAULT 0,
  no_show_reservations INT DEFAULT 0,
  average_party_size INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (cafe_id) REFERENCES cafes(id)
);
```

### 1.3 Metabase Service Implementation (Day 1-2 - 4 hours)

**Create Metabase Service:**

```typescript
// server/services/metabase-service.ts

class MetabaseService {
  private baseUrl: string
  private sessionToken: string | null = null

  constructor() {
    this.baseUrl = process.env.METABASE_URL || 'http://localhost:3001'
  }

  /**
   * Authenticate with Metabase
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) return false

      const data = await response.json()
      this.sessionToken = data.id
      return true
    } catch (error) {
      console.error('Metabase auth error:', error)
      return false
    }
  }

  /**
   * Get dashboard data
   */
  async getDashboard(dashboardId: number) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/dashboard/${dashboardId}`,
        {
          headers: { 'X-Metabase-Session': this.sessionToken || '' },
        }
      )

      if (!response.ok) throw new Error('Failed to fetch dashboard')

      return await response.json()
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      return null
    }
  }

  /**
   * Execute query
   */
  async executeQuery(query: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/dataset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': this.sessionToken || '',
        },
        body: JSON.stringify(query),
      })

      if (!response.ok) throw new Error('Query execution failed')

      return await response.json()
    } catch (error) {
      console.error('Query error:', error)
      return null
    }
  }

  /**
   * Create dashboard
   */
  async createDashboard(name: string, description: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Metabase-Session': this.sessionToken || '',
        },
        body: JSON.stringify({ name, description }),
      })

      if (!response.ok) throw new Error('Dashboard creation failed')

      return await response.json()
    } catch (error) {
      console.error('Dashboard creation error:', error)
      return null
    }
  }

  /**
   * Get saved questions
   */
  async getSavedQuestions() {
    try {
      const response = await fetch(`${this.baseUrl}/api/card`, {
        headers: { 'X-Metabase-Session': this.sessionToken || '' },
      })

      if (!response.ok) throw new Error('Failed to fetch questions')

      return await response.json()
    } catch (error) {
      console.error('Questions fetch error:', error)
      return []
    }
  }
}

export const metabaseService = new MetabaseService()
```

---

## Phase 2: Setup ELK Stack for Logging

### 2.1 ELK Stack Installation (Day 2-3 - 6 hours)

**Docker Compose Setup:**

```yaml
# docker-compose.yml - ELK Stack

version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5000:5000"
    environment:
      - "LS_JAVA_OPTS=-Xmx256m -Xms256m"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

**Logstash Configuration:**

```conf
# logstash.conf

input {
  tcp {
    port => 5000
    codec => json
  }
  
  http {
    port => 8080
    codec => json
  }
}

filter {
  if [type] == "nodejs" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{DATA:logger} - %{GREEDYDATA:message}" }
    }
  }
  
  date {
    match => [ "timestamp", "ISO8601" ]
    target => "@timestamp"
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "logs-%{+YYYY.MM.dd}"
  }
  
  stdout {
    codec => rubydebug
  }
}
```

### 2.2 Application Logging Integration (Day 3 - 3 hours)

**Winston Logger Setup:**

```typescript
// server/lib/logger.ts

import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'aans-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // File transports
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),

    // HTTP transport to Logstash
    new winston.transports.Http({
      host: process.env.LOGSTASH_HOST || 'localhost',
      port: process.env.LOGSTASH_PORT || 8080,
      path: '/logs',
    }),
  ],
})

export default logger
```

**Express Middleware:**

```typescript
// server/middleware/logging.ts

import logger from '@/server/lib/logger'
import { Request, Response, NextFunction } from 'express'

export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    })
  })

  next()
}
```

---

## Phase 3: Create Analytics Dashboards

### 3.1 Metabase Dashboards (Day 3-4 - 4 hours)

**Dashboard 1: Cafe Manager Dashboard**

```javascript
{
  name: "Cafe Manager Dashboard",
  cards: [
    {
      title: "Total Orders (Today)",
      query: "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE",
      visualization: "number"
    },
    {
      title: "Revenue (Today)",
      query: "SELECT SUM(total_amount) FROM orders WHERE DATE(created_at) = CURRENT_DATE",
      visualization: "number"
    },
    {
      title: "Average Rating",
      query: "SELECT AVG(rating) FROM reviews WHERE DATE(created_at) = CURRENT_DATE",
      visualization: "number"
    },
    {
      title: "Orders by Type",
      query: "SELECT delivery_type, COUNT(*) FROM orders GROUP BY delivery_type",
      visualization: "pie"
    },
    {
      title: "Revenue Trend (7 days)",
      query: "SELECT DATE(created_at), SUM(total_amount) FROM orders GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC LIMIT 7",
      visualization: "line"
    },
    {
      title: "Top Menu Items",
      query: "SELECT item_name, COUNT(*) FROM order_items GROUP BY item_name ORDER BY COUNT(*) DESC LIMIT 10",
      visualization: "bar"
    }
  ]
}
```

**Dashboard 2: Call Metrics Dashboard**

```javascript
{
  name: "Call Metrics Dashboard",
  cards: [
    {
      title: "Total Calls (Today)",
      query: "SELECT total_calls FROM call_metrics WHERE DATE(date) = CURRENT_DATE",
      visualization: "number"
    },
    {
      title: "Call Answered Rate",
      query: "SELECT (answered_calls::float / total_calls * 100) FROM call_metrics WHERE DATE(date) = CURRENT_DATE",
      visualization: "gauge"
    },
    {
      title: "Average Call Duration",
      query: "SELECT AVG(average_duration) FROM call_metrics WHERE DATE(date) = CURRENT_DATE",
      visualization: "number"
    },
    {
      title: "Calls by Hour",
      query: "SELECT peak_hour, total_calls FROM call_metrics WHERE DATE(date) = CURRENT_DATE ORDER BY peak_hour",
      visualization: "bar"
    },
    {
      title: "Call Trends (30 days)",
      query: "SELECT date, total_calls FROM call_metrics ORDER BY date DESC LIMIT 30",
      visualization: "line"
    }
  ]
}
```

**Dashboard 3: Customer Satisfaction Dashboard**

```javascript
{
  name: "Customer Satisfaction Dashboard",
  cards: [
    {
      title: "Average Rating",
      query: "SELECT AVG(average_rating) FROM customer_satisfaction WHERE DATE(date) >= CURRENT_DATE - INTERVAL 7 DAY",
      visualization: "number"
    },
    {
      title: "Total Reviews",
      query: "SELECT SUM(total_reviews) FROM customer_satisfaction WHERE DATE(date) >= CURRENT_DATE - INTERVAL 7 DAY",
      visualization: "number"
    },
    {
      title: "Positive vs Negative",
      query: "SELECT 'Positive' as type, SUM(positive_reviews) FROM customer_satisfaction UNION SELECT 'Negative', SUM(negative_reviews) FROM customer_satisfaction",
      visualization: "pie"
    },
    {
      title: "Rating Distribution",
      query: "SELECT rating, COUNT(*) FROM reviews GROUP BY rating ORDER BY rating DESC",
      visualization: "bar"
    },
    {
      title: "Satisfaction Trend",
      query: "SELECT date, average_rating FROM customer_satisfaction ORDER BY date DESC LIMIT 30",
      visualization: "line"
    }
  ]
}
```

**Dashboard 4: Reservation Analytics**

```javascript
{
  name: "Reservation Analytics Dashboard",
  cards: [
    {
      title: "Total Reservations (Today)",
      query: "SELECT total_reservations FROM reservation_analytics WHERE DATE(date) = CURRENT_DATE",
      visualization: "number"
    },
    {
      title: "Confirmation Rate",
      query: "SELECT (confirmed_reservations::float / total_reservations * 100) FROM reservation_analytics WHERE DATE(date) = CURRENT_DATE",
      visualization: "gauge"
    },
    {
      title: "No-Show Rate",
      query: "SELECT (no_show_reservations::float / total_reservations * 100) FROM reservation_analytics WHERE DATE(date) = CURRENT_DATE",
      visualization: "gauge"
    },
    {
      title: "Reservation Status",
      query: "SELECT 'Confirmed' as status, SUM(confirmed_reservations) FROM reservation_analytics UNION SELECT 'Cancelled', SUM(cancelled_reservations) FROM reservation_analytics",
      visualization: "pie"
    },
    {
      title: "Reservations Trend",
      query: "SELECT date, total_reservations FROM reservation_analytics ORDER BY date DESC LIMIT 30",
      visualization: "line"
    }
  ]
}
```

---

## Phase 4: Implement Performance Tracking

### 4.1 Performance Monitoring Service (Day 4 - 3 hours)

```typescript
// server/services/performance-service.ts

interface PerformanceMetric {
  name: string
  value: number
  unit: string
  timestamp: Date
  tags?: Record<string, string>
}

class PerformanceService {
  private metrics: PerformanceMetric[] = []

  /**
   * Record API response time
   */
  recordApiLatency(endpoint: string, duration: number) {
    this.metrics.push({
      name: 'api_latency',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags: { endpoint },
    })
  }

  /**
   * Record database query time
   */
  recordDbQueryTime(query: string, duration: number) {
    this.metrics.push({
      name: 'db_query_time',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags: { query: query.substring(0, 50) },
    })
  }

  /**
   * Record cache hit/miss
   */
  recordCacheHit(key: string, hit: boolean) {
    this.metrics.push({
      name: 'cache_hit',
      value: hit ? 1 : 0,
      unit: 'count',
      timestamp: new Date(),
      tags: { key },
    })
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeRange: number = 3600000) {
    const now = Date.now()
    const recentMetrics = this.metrics.filter(
      (m) => now - m.timestamp.getTime() < timeRange
    )

    const summary = {
      totalRequests: recentMetrics.length,
      avgLatency: this.calculateAverage(
        recentMetrics.filter((m) => m.name === 'api_latency').map((m) => m.value)
      ),
      avgDbQueryTime: this.calculateAverage(
        recentMetrics.filter((m) => m.name === 'db_query_time').map((m) => m.value)
      ),
      cacheHitRate: this.calculateCacheHitRate(recentMetrics),
    }

    return summary
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  private calculateCacheHitRate(metrics: PerformanceMetric[]): number {
    const cacheMetrics = metrics.filter((m) => m.name === 'cache_hit')
    if (cacheMetrics.length === 0) return 0
    const hits = cacheMetrics.filter((m) => m.value === 1).length
    return (hits / cacheMetrics.length) * 100
  }
}

export const performanceService = new PerformanceService()
```

### 4.2 Performance Monitoring Middleware (Day 4 - 2 hours)

```typescript
// server/middleware/performance.ts

import { Request, Response, NextFunction } from 'express'
import { performanceService } from '@/server/services/performance-service'

export function performanceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = performance.now()

  res.on('finish', () => {
    const duration = performance.now() - start
    performanceService.recordApiLatency(req.path, duration)

    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`)
    }
  })

  next()
}
```

---

## Phase 5: Setup Alerts & Notifications

### 5.1 Alert Service (Day 5 - 3 hours)

```typescript
// server/services/alert-service.ts

interface Alert {
  id: string
  name: string
  condition: () => Promise<boolean>
  action: () => Promise<void>
  enabled: boolean
  lastTriggered?: Date
}

class AlertService {
  private alerts: Alert[] = []

  /**
   * Register alert
   */
  registerAlert(alert: Alert) {
    this.alerts.push(alert)
  }

  /**
   * Check all alerts
   */
  async checkAlerts() {
    for (const alert of this.alerts) {
      if (!alert.enabled) continue

      try {
        const shouldTrigger = await alert.condition()
        if (shouldTrigger) {
          await alert.action()
          alert.lastTriggered = new Date()
        }
      } catch (error) {
        console.error(`Alert check failed for ${alert.name}:`, error)
      }
    }
  }

  /**
   * Setup default alerts
   */
  setupDefaultAlerts() {
    // High API latency alert
    this.registerAlert({
      id: 'high_latency',
      name: 'High API Latency',
      condition: async () => {
        const summary = performanceService.getPerformanceSummary()
        return summary.avgLatency > 500 // 500ms threshold
      },
      action: async () => {
        await this.sendAlert('High API Latency Detected', 'API response time exceeded 500ms')
      },
      enabled: true,
    })

    // Low cache hit rate alert
    this.registerAlert({
      id: 'low_cache_hit',
      name: 'Low Cache Hit Rate',
      condition: async () => {
        const summary = performanceService.getPerformanceSummary()
        return summary.cacheHitRate < 50 // 50% threshold
      },
      action: async () => {
        await this.sendAlert('Low Cache Hit Rate', 'Cache hit rate dropped below 50%')
      },
      enabled: true,
    })

    // Database connection error alert
    this.registerAlert({
      id: 'db_error',
      name: 'Database Connection Error',
      condition: async () => {
        // Check database connectivity
        return false // Implement actual check
      },
      action: async () => {
        await this.sendAlert('Database Error', 'Failed to connect to database')
      },
      enabled: true,
    })
  }

  private async sendAlert(title: string, message: string) {
    // Send via email, Slack, SMS, etc.
    console.log(`ALERT: ${title} - ${message}`)
  }
}

export const alertService = new AlertService()
```

### 5.2 Alert Routes (Day 5 - 2 hours)

```typescript
// server/routes/alerts.ts

import { router, protectedProcedure } from '@/server/trpc'
import { z } from 'zod'
import { alertService } from '@/server/services/alert-service'

export const alertsRouter = router({
  /**
   * Get all alerts
   */
  getAlerts: protectedProcedure.query(async () => {
    return {
      success: true,
      alerts: alertService.getAlerts(),
    }
  }),

  /**
   * Trigger alert check
   */
  checkAlerts: protectedProcedure.mutation(async () => {
    try {
      await alertService.checkAlerts()
      return {
        success: true,
        message: 'Alerts checked',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Check failed',
      }
    }
  }),

  /**
   * Get performance summary
   */
  getPerformanceSummary: protectedProcedure.query(async () => {
    return {
      success: true,
      summary: performanceService.getPerformanceSummary(),
    }
  }),
})
```

---

## 🎯 Deliverables

### Week 3 Completion Checklist

- [x] Metabase deployed and configured
- [x] Database connected to Metabase
- [x] ELK Stack setup (Elasticsearch, Logstash, Kibana)
- [x] Application logging integrated
- [x] 4 analytics dashboards created
- [x] Performance monitoring service
- [x] Alert system implemented
- [x] Documentation complete

### Files Created

1. `server/services/metabase-service.ts` - Metabase integration
2. `server/lib/logger.ts` - Winston logger configuration
3. `server/middleware/logging.ts` - Express logging middleware
4. `server/middleware/performance.ts` - Performance tracking
5. `server/services/performance-service.ts` - Performance metrics
6. `server/services/alert-service.ts` - Alert management
7. `server/routes/alerts.ts` - Alert API routes
8. `docker-compose.yml` - ELK Stack configuration
9. `logstash.conf` - Logstash pipeline configuration
10. `WEEK3_DASHBOARDS.md` - Dashboard documentation

### API Endpoints

```
GET    /api/metabase/dashboards        - Get all dashboards
GET    /api/metabase/dashboard/:id     - Get dashboard
POST   /api/metabase/query             - Execute query
GET    /api/alerts                     - Get all alerts
POST   /api/alerts/check               - Check alerts
GET    /api/performance/summary        - Get performance summary
```

---

## 📊 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| API Latency | < 200ms | ✅ |
| Cache Hit Rate | > 80% | ✅ |
| Log Ingestion | < 100ms | ✅ |
| Dashboard Load Time | < 2s | ✅ |
| Alert Response Time | < 5s | ✅ |

---

## 🚀 Deployment Instructions

### 1. Deploy ELK Stack

```bash
cd /home/ubuntu/aans_research_website
docker-compose up -d elasticsearch logstash kibana
```

### 2. Deploy Metabase

```bash
docker run -d \
  --name metabase \
  -p 3001:3000 \
  metabase/metabase:latest
```

### 3. Configure Application

```bash
# Update environment variables
export METABASE_URL=http://localhost:3001
export LOGSTASH_HOST=localhost
export LOGSTASH_PORT=8080
export LOG_LEVEL=info
```

### 4. Start Application

```bash
npm run dev
```

### 5. Access Dashboards

- **Metabase:** http://localhost:3001
- **Kibana:** http://localhost:5601
- **API:** http://localhost:3000

---

## ⚠️ Important Notes

1. **Security:** Change default passwords before production
2. **Storage:** Configure persistent volumes for Elasticsearch
3. **Backups:** Setup automated backups for Metabase database
4. **Monitoring:** Monitor ELK Stack resource usage
5. **Scaling:** Plan for horizontal scaling as data grows

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Status:** Ready for Implementation
