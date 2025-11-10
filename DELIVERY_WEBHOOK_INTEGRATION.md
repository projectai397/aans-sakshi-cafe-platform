# Delivery Platform Webhook Integration Guide

## Overview

This comprehensive guide covers the integration of real-time webhook systems for Swiggy, Zomato, and Uber Eats. The implementation enables automatic order synchronization, status tracking, commission management, and order reconciliation.

---

## Architecture

### Components

1. **DeliveryWebhookService** - Core webhook handling and order management
2. **DeliveryWebhookManager** - Advanced webhook processing with retry logic and signature verification
3. **DeliveryWebhookRoutes** - Express API endpoints for webhook handling

### Data Flow

```
Delivery Platform
       ↓
Webhook Endpoint (POST /webhook/{platform})
       ↓
Signature Verification
       ↓
Event Queue
       ↓
Webhook Manager (Process with Retry)
       ↓
Order Database
       ↓
Real-time Notifications
```

---

## Installation & Setup

### 1. Environment Variables

Add to `.env`:

```bash
# Swiggy Configuration
SWIGGY_API_KEY=your_swiggy_api_key
SWIGGY_WEBHOOK_SECRET=your_swiggy_webhook_secret
SWIGGY_BASE_URL=https://api.swiggy.com/v1

# Zomato Configuration
ZOMATO_API_KEY=your_zomato_api_key
ZOMATO_WEBHOOK_SECRET=your_zomato_webhook_secret
ZOMATO_BASE_URL=https://api.zomato.com/v2.1

# Uber Eats Configuration
UBER_API_KEY=your_uber_api_key
UBER_WEBHOOK_SECRET=your_uber_webhook_secret
UBER_BASE_URL=https://api.uber.com/v1
```

### 2. Database Schema

```sql
CREATE TABLE delivery_webhook_events (
  id VARCHAR(255) PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  event VARCHAR(100) NOT NULL,
  orderId VARCHAR(255) NOT NULL,
  locationId VARCHAR(255) NOT NULL,
  payload JSON NOT NULL,
  status ENUM('received', 'processing', 'completed', 'failed') DEFAULT 'received',
  retryCount INT DEFAULT 0,
  maxRetries INT DEFAULT 3,
  lastError TEXT,
  receivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processedAt TIMESTAMP,
  INDEX idx_platform (platform),
  INDEX idx_status (status),
  INDEX idx_locationId (locationId),
  INDEX idx_orderId (orderId)
);

CREATE TABLE delivery_orders (
  id VARCHAR(255) PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  platformOrderId VARCHAR(255) NOT NULL,
  locationId VARCHAR(255) NOT NULL,
  customerName VARCHAR(255),
  customerPhone VARCHAR(20),
  deliveryAddress TEXT,
  items JSON NOT NULL,
  subtotal DECIMAL(10, 2),
  deliveryFee DECIMAL(10, 2),
  platformCommission DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  totalAmount DECIMAL(10, 2),
  status VARCHAR(50) NOT NULL,
  orderTime TIMESTAMP,
  deliveryTime TIMESTAMP,
  driverId VARCHAR(255),
  driverName VARCHAR(255),
  driverPhone VARCHAR(20),
  driverLocation JSON,
  estimatedDeliveryTime TIMESTAMP,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_platform (platform),
  INDEX idx_locationId (locationId),
  INDEX idx_status (status),
  INDEX idx_orderTime (orderTime)
);

CREATE TABLE delivery_commissions (
  id VARCHAR(255) PRIMARY KEY,
  locationId VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  period VARCHAR(7) NOT NULL,
  totalOrders INT,
  totalRevenue DECIMAL(10, 2),
  totalCommission DECIMAL(10, 2),
  netRevenue DECIMAL(10, 2),
  commissionPercentage DECIMAL(5, 2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_period (locationId, platform, period),
  INDEX idx_locationId (locationId),
  INDEX idx_platform (platform)
);
```

### 3. Register Platforms

```bash
curl -X POST http://localhost:3000/api/delivery/platform/register \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "swiggy",
    "apiKey": "your_api_key",
    "apiSecret": "your_api_secret",
    "webhookUrl": "https://your-domain.com/api/delivery/webhook/swiggy",
    "baseUrl": "https://api.swiggy.com/v1",
    "locationId": "loc_123"
  }'
```

---

## Webhook Endpoints

### Swiggy Webhook

**URL:** `POST /api/delivery/webhook/swiggy`

**Events:**
- `order_placed` - New order received
- `order_confirmed` - Order confirmed by restaurant
- `order_preparing` - Order being prepared
- `order_ready` - Order ready for pickup
- `order_picked_up` - Driver picked up order
- `order_delivered` - Order delivered
- `order_cancelled` - Order cancelled

**Payload Example:**

```json
{
  "event": "order_placed",
  "timestamp": 1699564800,
  "data": {
    "order_id": "SWIGGY123456",
    "restaurant_id": "rest_001",
    "customer_name": "John Doe",
    "customer_phone": "+919876543210",
    "delivery_address": "123 Main St, City",
    "items": [
      {
        "name": "Butter Chicken",
        "quantity": 1,
        "price": 350
      }
    ],
    "subtotal": 350,
    "delivery_fee": 50,
    "commission": 52.5,
    "tax": 63.35,
    "total": 515.85,
    "order_time": 1699564800
  }
}
```

### Zomato Webhook

**URL:** `POST /api/delivery/webhook/zomato`

**Events:**
- `order_received` - New order received
- `order_accepted` - Order accepted by restaurant
- `order_in_preparation` - Order being prepared
- `order_ready_for_pickup` - Order ready for pickup
- `order_picked_up` - Driver picked up order
- `order_delivered` - Order delivered
- `order_cancelled` - Order cancelled

**Payload Example:**

```json
{
  "event": "order_received",
  "timestamp": "2024-11-10T12:00:00Z",
  "data": {
    "order_id": "ZOMATO789012",
    "restaurant_id": "rest_002",
    "customer_name": "Jane Smith",
    "customer_phone": "+919876543211",
    "delivery_address": "456 Oak Ave, City",
    "items": [
      {
        "name": "Paneer Tikka",
        "quantity": 2,
        "price": 250
      }
    ],
    "subtotal": 500,
    "delivery_fee": 40,
    "commission": 75,
    "tax": 86.4,
    "total": 701.4,
    "order_time": "2024-11-10T12:00:00Z"
  }
}
```

### Uber Eats Webhook

**URL:** `POST /api/delivery/webhook/uber-eats`

**Events:**
- `order.created` - New order created
- `order.confirmed` - Order confirmed
- `order.status_changed` - Order status changed
- `order.delivered` - Order delivered
- `order.cancelled` - Order cancelled
- `driver_location_updated` - Driver location updated

**Payload Example:**

```json
{
  "event": "order.created",
  "timestamp": "2024-11-10T12:00:00Z",
  "data": {
    "order_id": "UBER345678",
    "restaurant_id": "rest_003",
    "customer_name": "Mike Johnson",
    "customer_phone": "+919876543212",
    "delivery_address": "789 Pine Rd, City",
    "items": [
      {
        "name": "Tandoori Chicken",
        "quantity": 1,
        "price": 400
      }
    ],
    "subtotal": 400,
    "delivery_fee": 60,
    "commission": 60,
    "tax": 109.2,
    "total": 629.2,
    "order_time": "2024-11-10T12:00:00Z"
  }
}
```

---

## API Endpoints

### Order Management

#### Get Order Details
```bash
GET /api/delivery/orders/{orderId}
```

Response:
```json
{
  "id": "SWIGGY-123456",
  "platform": "swiggy",
  "platformOrderId": "123456",
  "locationId": "loc_001",
  "customerName": "John Doe",
  "status": "delivered",
  "totalAmount": 515.85,
  "deliveryTime": "2024-11-10T12:45:00Z"
}
```

#### Get Location Orders
```bash
GET /api/delivery/location/{locationId}/orders?status=delivered
```

Response:
```json
{
  "locationId": "loc_001",
  "count": 45,
  "orders": [...]
}
```

#### Get Platform Orders
```bash
GET /api/delivery/location/{locationId}/platform/{platform}/orders
```

Response:
```json
{
  "locationId": "loc_001",
  "platform": "swiggy",
  "count": 15,
  "orders": [...]
}
```

### Commission & Revenue

#### Get Commission Report
```bash
GET /api/delivery/location/{locationId}/commission/{period}
```

Example: `/api/delivery/location/loc_001/commission/2024-11`

Response:
```json
{
  "period": "2024-11",
  "locationId": "loc_001",
  "totalOrders": 150,
  "totalRevenue": 75000,
  "totalCommission": 11250,
  "netRevenue": 63750,
  "platformBreakdown": {
    "swiggy": {
      "orders": 60,
      "revenue": 30000,
      "commission": 4500,
      "netRevenue": 25500,
      "commissionPercentage": 15
    },
    "zomato": {
      "orders": 50,
      "revenue": 25000,
      "commission": 3750,
      "netRevenue": 21250,
      "commissionPercentage": 15
    },
    "uber_eats": {
      "orders": 40,
      "revenue": 20000,
      "commission": 3000,
      "netRevenue": 17000,
      "commissionPercentage": 15
    }
  },
  "averageCommissionPercentage": 15
}
```

### Reconciliation

#### Reconcile Orders
```bash
GET /api/delivery/location/{locationId}/reconcile/{platform}
```

Response:
```json
{
  "platform": "swiggy",
  "locationId": "loc_001",
  "totalOrders": 60,
  "deliveredOrders": 58,
  "cancelledOrders": 2,
  "pendingOrders": 0,
  "totalRevenue": 30000,
  "totalCommission": 4500,
  "discrepancies": []
}
```

### Webhook Management

#### Get Webhook Logs
```bash
GET /api/delivery/webhook-logs?platform=swiggy&limit=50
```

Response:
```json
{
  "count": 50,
  "logs": [
    {
      "platform": "swiggy",
      "event": "order_delivered",
      "timestamp": "2024-11-10T12:45:00Z",
      "payload": {...}
    }
  ]
}
```

#### Health Check
```bash
GET /api/delivery/health
```

Response:
```json
{
  "status": "healthy",
  "platforms": ["swiggy", "zomato", "uber_eats"],
  "totalOrders": 250,
  "webhookLogsCount": 1000,
  "timestamp": "2024-11-10T13:00:00Z"
}
```

---

## Signature Verification

### Swiggy

```typescript
import crypto from 'crypto';

function verifySwiggySignature(payload: string, signature: string): boolean {
  const secret = process.env.SWIGGY_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Zomato

```typescript
function verifyZomatoSignature(payload: string, signature: string): boolean {
  const secret = process.env.ZOMATO_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Uber Eats

```typescript
function verifyUberSignature(payload: string, signature: string): boolean {
  const secret = process.env.UBER_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Webhook Processing Flow

### 1. Receive Webhook

```typescript
router.post('/webhook/swiggy', async (req, res) => {
  const payload = req.body;
  const signature = req.headers['x-swiggy-signature'];
  
  // Verify signature
  if (!verifySwiggySignature(JSON.stringify(payload), signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook
  await webhookService.handleSwiggyWebhook(payload);
  res.json({ success: true });
});
```

### 2. Queue Event

```typescript
async processWebhook(platform, event, orderId, locationId, payload) {
  const webhookEvent = {
    id: `${platform}-${orderId}-${Date.now()}`,
    platform,
    event,
    orderId,
    locationId,
    payload,
    status: 'received',
    retryCount: 0,
    receivedAt: new Date()
  };
  
  this.webhookEvents.set(webhookEvent.id, webhookEvent);
  this.eventQueue.push(webhookEvent.id);
  
  // Process asynchronously
  this.processQueuedWebhook(webhookEvent.id);
}
```

### 3. Process with Retry

```typescript
async processQueuedWebhook(webhookId) {
  try {
    const webhook = this.webhookEvents.get(webhookId);
    webhook.status = 'processing';
    
    // Execute business logic
    await this.executeWebhookLogic(webhook);
    
    webhook.status = 'completed';
    webhook.processedAt = new Date();
  } catch (error) {
    webhook.retryCount++;
    
    if (webhook.retryCount < webhook.maxRetries) {
      // Exponential backoff retry
      const backoffMs = Math.pow(2, webhook.retryCount) * 1000;
      setTimeout(() => this.processQueuedWebhook(webhookId), backoffMs);
    } else {
      webhook.status = 'failed';
    }
  }
}
```

---

## Error Handling

### Retry Strategy

- **Max Retries:** 3
- **Backoff Strategy:** Exponential (2^n seconds)
- **Retry Delays:** 2s, 4s, 8s

### Error Scenarios

| Error | Handling |
|-------|----------|
| Invalid Signature | Reject webhook (401) |
| Database Error | Retry with exponential backoff |
| Timeout | Retry with exponential backoff |
| Duplicate Order | Idempotent processing (no duplicate) |
| Missing Data | Log error, mark as failed |

---

## Monitoring & Analytics

### Webhook Statistics

```bash
GET /api/delivery/webhook-stats
```

Response:
```json
{
  "total": 5000,
  "byStatus": {
    "received": 10,
    "processing": 5,
    "completed": 4950,
    "failed": 35
  },
  "byPlatform": {
    "swiggy": {
      "total": 2000,
      "completed": 1980,
      "failed": 20,
      "successRate": 99
    },
    "zomato": {
      "total": 1500,
      "completed": 1485,
      "failed": 15,
      "successRate": 99
    },
    "uber_eats": {
      "total": 1500,
      "completed": 1485,
      "failed": 15,
      "successRate": 99
    }
  },
  "avgRetries": 0.15
}
```

### Queue Status

```bash
GET /api/delivery/queue-status
```

Response:
```json
{
  "queueLength": 15,
  "processingCount": 3,
  "pendingWebhooks": 12
}
```

---

## Best Practices

### 1. Idempotent Processing

Ensure webhook handlers are idempotent to handle duplicate deliveries:

```typescript
async handleOrderDelivered(data) {
  const order = await Order.findOne({ platformOrderId: data.order_id });
  
  if (order.status === 'delivered') {
    return; // Already processed
  }
  
  order.status = 'delivered';
  await order.save();
}
```

### 2. Timeout Handling

Set appropriate timeouts for webhook processing:

```typescript
const webhookTimeout = 30000; // 30 seconds
Promise.race([
  processWebhook(webhook),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), webhookTimeout)
  )
]);
```

### 3. Logging & Monitoring

Log all webhook events for debugging:

```typescript
logWebhook(platform, event, payload) {
  console.log(`[${platform}] ${event}:`, {
    timestamp: new Date(),
    orderId: payload.data.order_id,
    status: payload.data.status
  });
}
```

### 4. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000 // 1000 requests per minute
});

router.post('/webhook/:platform', webhookLimiter, ...);
```

### 5. Cleanup

Periodically clean up old webhook events:

```typescript
setInterval(() => {
  const deletedCount = webhookManager.cleanupOldWebhooks(24); // Delete events older than 24 hours
  console.log(`Cleaned up ${deletedCount} old webhooks`);
}, 6 * 60 * 60 * 1000); // Every 6 hours
```

---

## Testing

### Unit Tests

```typescript
describe('DeliveryWebhookService', () => {
  let service: DeliveryWebhookService;
  
  beforeEach(() => {
    service = new DeliveryWebhookService();
  });
  
  it('should handle Swiggy order placed event', async () => {
    const payload = {
      event: 'order_placed',
      data: { order_id: 'SWIGGY123' }
    };
    
    await service.handleSwiggyWebhook(payload);
    const order = await service.getOrder('SWIGGY-SWIGGY123');
    
    expect(order).toBeDefined();
    expect(order.status).toBe('pending');
  });
});
```

### Integration Tests

```typescript
describe('Webhook Endpoints', () => {
  it('should process Swiggy webhook', async () => {
    const response = await request(app)
      .post('/api/delivery/webhook/swiggy')
      .send({
        event: 'order_placed',
        data: { order_id: 'SWIGGY123' }
      });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

---

## Troubleshooting

### Webhook Not Received

1. Check webhook URL is publicly accessible
2. Verify firewall/security group allows incoming traffic
3. Check platform webhook configuration
4. Review webhook logs

### Signature Verification Failed

1. Verify secret key is correct
2. Ensure payload is not modified
3. Check signature algorithm matches platform
4. Review platform documentation

### Orders Not Updating

1. Check database connection
2. Verify order IDs match
3. Check retry logs for errors
4. Review webhook processing status

---

## Conclusion

The Delivery Webhook Integration system provides a robust, scalable solution for real-time order synchronization across Swiggy, Zomato, and Uber Eats. With comprehensive error handling, retry logic, and monitoring capabilities, it ensures reliable order processing and accurate commission tracking.
