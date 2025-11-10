# Real-Time Driver Tracking Dashboard

## Overview

The Real-Time Driver Tracking Dashboard provides comprehensive live tracking of delivery drivers, real-time ETA updates, route optimization, and performance analytics. This system integrates with the delivery webhook system to provide end-to-end order tracking from restaurant to customer.

---

## Architecture

### Components

1. **DriverTrackingService** - Core tracking logic and calculations
2. **DriverTrackingRoutes** - REST API endpoints
3. **DriverTrackingWebSocketHandler** - Real-time WebSocket updates

### Data Flow

```
Driver App (Location Update)
       ↓
WebSocket/REST API
       ↓
DriverTrackingService (Process Location)
       ↓
Calculate ETA & Distance
       ↓
Broadcast to Subscribers
       ↓
Customer App (Real-time ETA)
```

---

## Installation & Setup

### 1. Environment Variables

```bash
# Driver Tracking Configuration
DRIVER_TRACKING_ENABLED=true
DRIVER_TRACKING_UPDATE_INTERVAL=5000 # 5 seconds
DRIVER_TRACKING_HISTORY_LIMIT=100
DRIVER_TRACKING_CLEANUP_HOURS=24
```

### 2. Database Schema

```sql
CREATE TABLE driver_locations (
  id VARCHAR(255) PRIMARY KEY,
  driverId VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2),
  speed DECIMAL(10, 2),
  heading DECIMAL(10, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_driverId (driverId),
  INDEX idx_timestamp (timestamp)
);

CREATE TABLE delivery_routes (
  id VARCHAR(255) PRIMARY KEY,
  driverId VARCHAR(255) NOT NULL,
  orderId VARCHAR(255) NOT NULL,
  restaurantLat DECIMAL(10, 8),
  restaurantLng DECIMAL(11, 8),
  customerLat DECIMAL(10, 8),
  customerLng DECIMAL(11, 8),
  distance DECIMAL(10, 2),
  duration INT,
  status VARCHAR(50),
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  actualDistance DECIMAL(10, 2),
  actualDuration INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_driverId (driverId),
  INDEX idx_orderId (orderId),
  INDEX idx_status (status)
);

CREATE TABLE driver_performance (
  id VARCHAR(255) PRIMARY KEY,
  driverId VARCHAR(255) NOT NULL UNIQUE,
  totalDeliveries INT DEFAULT 0,
  completedDeliveries INT DEFAULT 0,
  cancelledDeliveries INT DEFAULT 0,
  averageRating DECIMAL(3, 2) DEFAULT 0,
  totalDistance DECIMAL(10, 2) DEFAULT 0,
  totalDuration INT DEFAULT 0,
  averageDeliveryTime DECIMAL(10, 2) DEFAULT 0,
  onTimeDeliveries INT DEFAULT 0,
  onTimePercentage DECIMAL(5, 2) DEFAULT 0,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_driverId (driverId),
  INDEX idx_onTimePercentage (onTimePercentage)
);

CREATE TABLE eta_updates (
  id VARCHAR(255) PRIMARY KEY,
  orderId VARCHAR(255) NOT NULL UNIQUE,
  driverId VARCHAR(255) NOT NULL,
  currentLat DECIMAL(10, 8),
  currentLng DECIMAL(11, 8),
  estimatedArrivalTime TIMESTAMP,
  distanceRemaining DECIMAL(10, 2),
  timeRemaining INT,
  confidence DECIMAL(5, 2),
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orderId (orderId),
  INDEX idx_driverId (driverId)
);
```

### 3. WebSocket Setup

```typescript
import { WebSocketServer } from 'ws';
import DriverTrackingWebSocketHandler from './driver-tracking-websocket';

const wss = new WebSocketServer({ port: 8080 });
const trackingHandler = new DriverTrackingWebSocketHandler(wss, trackingService);
```

---

## API Endpoints

### Location Updates

#### Update Driver Location
```bash
POST /api/tracking/location/update
Content-Type: application/json

{
  "driverId": "driver_123",
  "latitude": 28.6139,
  "longitude": 77.209,
  "accuracy": 5,
  "speed": 25.5,
  "heading": 180
}
```

Response:
```json
{
  "success": true,
  "location": {
    "driverId": "driver_123",
    "latitude": 28.6139,
    "longitude": 77.209,
    "accuracy": 5,
    "timestamp": "2024-11-10T13:00:00Z",
    "speed": 25.5,
    "heading": 180
  }
}
```

#### Get Current Location
```bash
GET /api/tracking/location/{driverId}
```

Response:
```json
{
  "driverId": "driver_123",
  "latitude": 28.6139,
  "longitude": 77.209,
  "accuracy": 5,
  "timestamp": "2024-11-10T13:00:00Z",
  "speed": 25.5,
  "heading": 180
}
```

#### Get Location History
```bash
GET /api/tracking/location-history/{driverId}?limit=50
```

Response:
```json
{
  "driverId": "driver_123",
  "count": 50,
  "history": [
    {
      "driverId": "driver_123",
      "latitude": 28.6139,
      "longitude": 77.209,
      "accuracy": 5,
      "timestamp": "2024-11-10T13:00:00Z"
    }
  ]
}
```

### Route Management

#### Create Route
```bash
POST /api/tracking/route/create
Content-Type: application/json

{
  "driverId": "driver_123",
  "orderId": "order_456",
  "restaurantLocation": {
    "lat": 28.6139,
    "lng": 77.209
  },
  "customerLocation": {
    "lat": 28.5244,
    "lng": 77.1855
  },
  "waypoints": []
}
```

Response:
```json
{
  "success": true,
  "route": {
    "id": "ROUTE-driver_123-order_456-1699564800",
    "driverId": "driver_123",
    "orderId": "order_456",
    "distance": 8.5,
    "duration": 18,
    "status": "pending"
  }
}
```

#### Start Route
```bash
POST /api/tracking/route/{routeId}/start
```

#### Complete Route
```bash
POST /api/tracking/route/{routeId}/complete
Content-Type: application/json

{
  "actualDistance": 8.7,
  "actualDuration": 19
}
```

#### Cancel Route
```bash
POST /api/tracking/route/{routeId}/cancel
```

#### Get Active Routes
```bash
GET /api/tracking/driver/{driverId}/active-routes
```

Response:
```json
{
  "driverId": "driver_123",
  "count": 2,
  "routes": [
    {
      "id": "ROUTE-driver_123-order_456-1699564800",
      "orderId": "order_456",
      "distance": 8.5,
      "duration": 18,
      "status": "active"
    }
  ]
}
```

### ETA Management

#### Get ETA for Order
```bash
GET /api/tracking/eta/{orderId}
```

Response:
```json
{
  "orderId": "order_456",
  "driverId": "driver_123",
  "currentLocation": {
    "lat": 28.6100,
    "lng": 77.2050
  },
  "estimatedArrivalTime": "2024-11-10T13:15:00Z",
  "distanceRemaining": 2.3,
  "timeRemaining": 5,
  "confidence": 92
}
```

#### Get All ETAs for Driver
```bash
GET /api/tracking/driver/{driverId}/etas
```

Response:
```json
{
  "driverId": "driver_123",
  "count": 2,
  "etas": [
    {
      "orderId": "order_456",
      "estimatedArrivalTime": "2024-11-10T13:15:00Z",
      "distanceRemaining": 2.3,
      "timeRemaining": 5,
      "confidence": 92
    }
  ]
}
```

### Route Optimization

#### Optimize Route
```bash
POST /api/tracking/route/optimize
Content-Type: application/json

{
  "driverId": "driver_123",
  "restaurantLocation": {
    "lat": 28.6139,
    "lng": 77.209
  },
  "deliveryLocations": [
    {
      "orderId": "order_1",
      "lat": 28.5244,
      "lng": 77.1855
    },
    {
      "orderId": "order_2",
      "lat": 28.5500,
      "lng": 77.2000
    }
  ]
}
```

Response:
```json
{
  "driverId": "driver_123",
  "optimizedRoute": [
    {
      "orderId": "order_2",
      "sequence": 1,
      "distance": 5.2
    },
    {
      "orderId": "order_1",
      "sequence": 2,
      "distance": 3.1
    }
  ]
}
```

### Performance Analytics

#### Get Driver Performance
```bash
GET /api/tracking/performance/{driverId}
```

Response:
```json
{
  "driverId": "driver_123",
  "totalDeliveries": 145,
  "completedDeliveries": 142,
  "cancelledDeliveries": 3,
  "averageRating": 4.8,
  "totalDistance": 1250.5,
  "totalDuration": 2850,
  "averageDeliveryTime": 20.1,
  "onTimeDeliveries": 138,
  "onTimePercentage": 97.2,
  "lastUpdated": "2024-11-10T13:00:00Z"
}
```

#### Get All Performance Data
```bash
GET /api/tracking/performance
```

#### Get Top Performers
```bash
GET /api/tracking/top-performers?limit=10
```

Response:
```json
{
  "count": 10,
  "topPerformers": [
    {
      "driverId": "driver_123",
      "onTimePercentage": 97.2,
      "completedDeliveries": 142,
      "averageRating": 4.8
    }
  ]
}
```

### Analytics

#### Driver Location Analytics
```bash
GET /api/tracking/analytics/driver/{driverId}
```

Response:
```json
{
  "driverId": "driver_123",
  "coverageArea": {
    "minLat": 28.5000,
    "maxLat": 28.6500,
    "minLng": 77.1500,
    "maxLng": 77.2500,
    "center": {
      "lat": 28.5750,
      "lng": 77.2000
    }
  },
  "totalDistance": 1250.5,
  "totalTime": 2850,
  "averageSpeed": 26.5,
  "locationCount": 100,
  "performance": {
    "totalDeliveries": 145,
    "onTimePercentage": 97.2
  }
}
```

#### Fleet Analytics
```bash
GET /api/tracking/analytics/fleet
```

Response:
```json
{
  "totalDrivers": 45,
  "activeDrivers": 32,
  "totalDeliveries": 8450,
  "totalDistance": 52300,
  "averageDeliveryTime": 19.5,
  "averageRating": 4.7,
  "averageOnTimePercentage": 96.2,
  "topPerformers": [
    {
      "driverId": "driver_123",
      "onTimePercentage": 97.2,
      "completedDeliveries": 142
    }
  ]
}
```

### Active Deliveries
```bash
GET /api/tracking/active-deliveries
```

Response:
```json
{
  "count": 32,
  "deliveries": [
    {
      "orderId": "order_456",
      "driverId": "driver_123",
      "currentLocation": {
        "lat": 28.6100,
        "lng": 77.2050
      },
      "destination": {
        "lat": 28.5244,
        "lng": 77.1855
      },
      "eta": "2024-11-10T13:15:00Z",
      "distanceRemaining": 2.3,
      "timeRemaining": 5,
      "status": "active"
    }
  ]
}
```

---

## WebSocket Protocol

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log(message);
};
```

### Authentication

```javascript
ws.send(JSON.stringify({
  type: 'auth',
  payload: {
    userId: 'user_123'
  }
}));
```

### Subscribe to Driver

```javascript
ws.send(JSON.stringify({
  type: 'subscribe_driver',
  payload: {
    driverId: 'driver_123'
  }
}));
```

### Subscribe to Order

```javascript
ws.send(JSON.stringify({
  type: 'subscribe_order',
  payload: {
    orderId: 'order_456'
  }
}));
```

### Send Location Update

```javascript
ws.send(JSON.stringify({
  type: 'location_update',
  payload: {
    driverId: 'driver_123',
    latitude: 28.6139,
    longitude: 77.209,
    accuracy: 5,
    speed: 25.5,
    heading: 180
  }
}));
```

### Receive Messages

#### Driver Location Update
```json
{
  "type": "driver_location_update",
  "driverId": "driver_123",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "timestamp": "2024-11-10T13:00:00Z"
  }
}
```

#### ETA Update
```json
{
  "type": "eta_update",
  "orderId": "order_456",
  "eta": {
    "estimatedArrivalTime": "2024-11-10T13:15:00Z",
    "distanceRemaining": 2.3,
    "timeRemaining": 5,
    "confidence": 92
  }
}
```

#### Heartbeat
```json
{
  "type": "heartbeat",
  "timestamp": "2024-11-10T13:00:00Z"
}
```

---

## Client Implementation

### React Component Example

```typescript
import { useEffect, useState } from 'react';
import { MapView } from '@/components/Map';

export default function DriverTrackingDashboard() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket('ws://localhost:8080');

    websocket.onopen = () => {
      // Authenticate
      websocket.send(JSON.stringify({
        type: 'auth',
        payload: { userId: 'user_123' }
      }));

      // Subscribe to drivers
      websocket.send(JSON.stringify({
        type: 'subscribe_driver',
        payload: { driverId: 'driver_123' }
      }));
    };

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === 'driver_location_update') {
        setDrivers(prev => 
          prev.map(d => 
            d.id === message.driverId 
              ? { ...d, location: message.location }
              : d
          )
        );
      }
    };

    setWs(websocket);

    return () => websocket.close();
  }, []);

  return (
    <div className="w-full h-screen">
      <MapView
        onMapReady={(map) => {
          // Add driver markers
          drivers.forEach(driver => {
            new window.google.maps.Marker({
              position: {
                lat: driver.location.latitude,
                lng: driver.location.longitude
              },
              map,
              title: driver.name
            });
          });
        }}
      />
    </div>
  );
}
```

---

## Performance Optimization

### Location Update Batching

```typescript
// Batch location updates to reduce API calls
const locationBuffer: DriverLocation[] = [];
const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 5000; // 5 seconds

async function addLocationUpdate(location: DriverLocation) {
  locationBuffer.push(location);
  
  if (locationBuffer.length >= BATCH_SIZE) {
    await flushLocationBuffer();
  }
}

async function flushLocationBuffer() {
  if (locationBuffer.length === 0) return;
  
  const batch = locationBuffer.splice(0, BATCH_SIZE);
  await fetch('/api/tracking/location/batch-update', {
    method: 'POST',
    body: JSON.stringify({ locations: batch })
  });
}

setInterval(flushLocationBuffer, BATCH_TIMEOUT);
```

### Distance Caching

```typescript
const distanceCache = new Map<string, number>();

function getDistance(from: Location, to: Location): number {
  const key = `${from.lat},${from.lng}-${to.lat},${to.lng}`;
  
  if (distanceCache.has(key)) {
    return distanceCache.get(key)!;
  }
  
  const distance = calculateDistance(from, to);
  distanceCache.set(key, distance);
  
  return distance;
}
```

---

## Monitoring & Alerts

### Alert Conditions

1. **Delayed Delivery**: ETA exceeded by 15+ minutes
2. **Driver Offline**: No location update for 10+ minutes
3. **Route Deviation**: Driver 2+ km off optimal route
4. **Low Performance**: On-time percentage < 80%

### Alert Implementation

```typescript
async function checkAlerts() {
  const deliveries = await trackingService.getActiveDeliveries();
  
  for (const delivery of deliveries) {
    const eta = await trackingService.getETA(delivery.orderId);
    
    if (eta && new Date() > eta.estimatedArrivalTime) {
      // Alert: Delayed delivery
      await sendAlert({
        type: 'delayed_delivery',
        orderId: delivery.orderId,
        driverId: delivery.driverId,
        delayMinutes: Math.floor((new Date().getTime() - eta.estimatedArrivalTime.getTime()) / 60000)
      });
    }
  }
}

setInterval(checkAlerts, 60000); // Check every minute
```

---

## Best Practices

1. **Update Frequency**: 5-10 second intervals for location updates
2. **Accuracy Threshold**: Only process locations with accuracy < 50 meters
3. **ETA Confidence**: Only show ETA with confidence > 70%
4. **Data Retention**: Keep location history for 24 hours
5. **Cleanup**: Run cleanup job daily to remove old data

---

## Troubleshooting

### High Battery Drain

- Increase location update interval
- Reduce accuracy requirement
- Disable background tracking

### Inaccurate ETA

- Check GPS accuracy
- Verify traffic data integration
- Increase confidence threshold

### WebSocket Disconnections

- Implement automatic reconnection
- Use heartbeat mechanism
- Add fallback to REST API

---

## Conclusion

The Real-Time Driver Tracking Dashboard provides comprehensive tracking, analytics, and optimization capabilities for delivery operations. With real-time WebSocket updates, intelligent route optimization, and detailed performance analytics, it enables efficient delivery management and improved customer experience.
