# Quick-Start: Integrate Top MIT Open-Source Libraries
## Day-by-Day Implementation Guide (Fast Track)

**Timeline:** 4 weeks  
**Goal:** Integrate 10 critical open-source libraries  
**Team:** 2 developers  
**Expected Savings:** 60+ days of development

---

## Week 1: Foundation & Analytics

### Day 1: Install & Configure Nivo Charts

**Objective:** Replace Recharts with more powerful Nivo for analytics

**Step 1: Install Nivo**
```bash
cd /home/ubuntu/aans_research_website
npm install @nivo/core @nivo/bar @nivo/line @nivo/pie @nivo/heatmap @nivo/sankey
```

**Step 2: Create Nivo Chart Components**

```typescript
// client/src/components/charts/NivoBarChart.tsx
import { ResponsiveBar } from '@nivo/bar'

interface NivoBarChartProps {
  data: any[]
  keys: string[]
  indexBy: string
  title?: string
}

export default function NivoBarChart({
  data,
  keys,
  indexBy,
  title
}: NivoBarChartProps) {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.3}
        colors={{ scheme: 'nivo' }}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: indexBy,
          legendPosition: 'middle',
          legendOffset: 32,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'count',
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 20,
            effects: [
              {
                on: 'hover',
                style: {
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        animate={true}
        motionConfig="wobbly"
      />
    </div>
  )
}
```

```typescript
// client/src/components/charts/NivoLineChart.tsx
import { ResponsiveLine } from '@nivo/line'

interface NivoLineChartProps {
  data: any[]
  title?: string
}

export default function NivoLineChart({ data, title }: NivoLineChartProps) {
  return (
    <div style={{ height: 400 }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false,
        }}
        curve="catmullRom"
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Date',
          legendOffset: 36,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Value',
          legendOffset: -40,
          legendPosition: 'middle',
        }}
        colors={{ scheme: 'nivo' }}
        pointSize={8}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  )
}
```

**Step 3: Update Analytics Dashboard**

```typescript
// client/src/components/sakshi/AnalyticsDashboard.tsx - Update imports
import NivoBarChart from '@/components/charts/NivoBarChart'
import NivoLineChart from '@/components/charts/NivoLineChart'

// Replace Recharts usage with Nivo
<NivoBarChart
  data={[metrics.dailyMetrics]}
  keys={['answeredCalls', 'missedCalls']}
  indexBy="date"
  title="Call Metrics"
/>

<NivoLineChart
  data={[{
    id: 'Revenue',
    data: Object.entries(metrics.reservationTrends || {}).map(([date, count]) => ({
      x: date,
      y: count,
    }))
  }]}
  title="Revenue Trend"
/>
```

**Time: 2 hours**

---

### Day 2: Integrate Socket.io for Real-Time Updates

**Objective:** Add real-time order and call updates

**Step 1: Install Socket.io**
```bash
npm install socket.io socket.io-client
```

**Step 2: Create Socket.io Server**

```typescript
// server/socket.ts
import { Server } from 'socket.io'
import { createServer } from 'http'

export function setupSocket(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join cafe room
    socket.on('join-cafe', (cafeId: string) => {
      socket.join(`cafe-${cafeId}`)
      console.log(`User joined cafe ${cafeId}`)
    })

    // Broadcast new order
    socket.on('order-created', (data) => {
      io.to(`cafe-${data.cafeId}`).emit('new-order', data)
    })

    // Broadcast order status update
    socket.on('order-status-updated', (data) => {
      io.to(`cafe-${data.cafeId}`).emit('order-updated', data)
    })

    // Broadcast call received
    socket.on('call-received', (data) => {
      io.to(`cafe-${data.cafeId}`).emit('incoming-call', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}
```

**Step 3: Create Socket.io Client Hook**

```typescript
// client/src/hooks/useSocket.ts
import { useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

export function useSocket(cafeId: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newSocket = io(process.env.VITE_API_URL || 'http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join-cafe', cafeId)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [cafeId])

  return { socket, isConnected }
}
```

**Step 4: Use in Components**

```typescript
// client/src/components/sakshi/OrderTracking.tsx
import { useSocket } from '@/hooks/useSocket'

export default function OrderTracking({ cafeId, orderId }: Props) {
  const { socket, isConnected } = useSocket(cafeId)
  const [orderStatus, setOrderStatus] = useState('pending')

  useEffect(() => {
    if (!socket) return

    socket.on('order-updated', (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(data.status)
      }
    })

    return () => {
      socket.off('order-updated')
    }
  }, [socket, orderId])

  return (
    <div>
      <p>Status: {orderStatus}</p>
      <p>Connection: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
    </div>
  )
}
```

**Time: 3 hours**

---

### Day 3: Setup Strapi CMS

**Objective:** Replace custom menu management with Strapi

**Step 1: Install Strapi**
```bash
npm install -g create-strapi-app@latest
create-strapi-app strapi-cms --quickstart
cd strapi-cms
npm run develop
```

**Step 2: Create Content Types**

Access Strapi at `http://localhost:1337/admin`

Create Collections:
- **Cafe** (name, location, description, image)
- **MenuItem** (name, description, price, category, image, dietary tags)
- **Reservation** (customerName, phone, date, time, partySize)
- **Order** (items, total, status, deliveryType)

**Step 3: Create Strapi API Routes**

```typescript
// server/routes/strapi.ts
import { router, publicProcedure } from "@/server/trpc"
import { z } from "zod"

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'

export const strapiRouter = router({
  getMenuItems: publicProcedure
    .input(z.object({ cafeId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${STRAPI_URL}/api/menu-items?filters[cafe][id][$eq]=${input.cafeId}`
      )
      return response.json()
    }),

  createMenuItem: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      name: z.string(),
      description: z.string(),
      price: z.number(),
      category: z.string(),
    }))
    .mutation(async ({ input }) => {
      const response = await fetch(`${STRAPI_URL}/api/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            name: input.name,
            description: input.description,
            price: input.price,
            category: input.category,
            cafe: input.cafeId,
          },
        }),
      })
      return response.json()
    }),
})
```

**Time: 4 hours**

---

### Day 4: Add Uppy for File Uploads

**Objective:** Implement drag-and-drop file uploads

**Step 1: Install Uppy**
```bash
npm install @uppy/core @uppy/dashboard @uppy/tus @uppy/aws-s3
```

**Step 2: Create Upload Component**

```typescript
// client/src/components/UppyUploader.tsx
import { useEffect } from 'react'
import Uppy from '@uppy/core'
import Dashboard from '@uppy/dashboard'
import TusPlugin from '@uppy/tus'
import '@uppy/core/dist/style.css'
import '@uppy/dashboard/dist/style.css'

interface UppyUploaderProps {
  onComplete?: (files: any[]) => void
  endpoint?: string
}

export default function UppyUploader({
  onComplete,
  endpoint = '/api/upload'
}: UppyUploaderProps) {
  useEffect(() => {
    const uppy = new Uppy({
      id: 'uppy',
      autoProceed: false,
      allowMultipleUploads: true,
      restrictions: {
        maxNumberOfFiles: 10,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedFileTypes: ['image/*', 'application/pdf'],
      },
    })

    uppy.use(TusPlugin, {
      endpoint: endpoint,
      chunkSize: 5 * 1024 * 1024, // 5MB chunks
      retryDelays: [0, 1000, 3000, 5000],
    })

    uppy.on('complete', (result) => {
      if (onComplete) {
        onComplete(result.successful)
      }
    })

    const dashboard = new Dashboard({
      target: '#uppy-dashboard',
      inline: true,
      height: 400,
      proudlyDisplayPoweredByUppy: false,
    })

    uppy.use(dashboard)

    return () => {
      uppy.close()
    }
  }, [endpoint, onComplete])

  return <div id="uppy-dashboard" />
}
```

**Time: 2 hours**

---

### Day 5: Setup Sentry for Error Tracking

**Objective:** Monitor errors and performance

**Step 1: Install Sentry**
```bash
npm install @sentry/node @sentry/trpc @sentry/react
```

**Step 2: Configure Sentry**

```typescript
// server/sentry.ts
import * as Sentry from "@sentry/node"

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  })
}
```

```typescript
// client/src/sentry.ts
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})
```

**Time: 1 hour**

---

## Week 2: Marketplace & Commerce

### Day 6-7: Deploy Medusa Marketplace

**Objective:** Setup Medusa as foundation for SubCircle

**Step 1: Create Medusa Store**
```bash
npm install -g @medusajs/medusa-cli
medusa new my-store --seed
cd my-store
npm run dev
```

**Step 2: Customize for SubCircle**

```typescript
// medusa-config.js - Add custom modules
module.exports = {
  projectConfig: {
    // ... existing config
    redis_url: process.env.REDIS_URL,
  },
  plugins: [
    // Add custom plugins
    {
      resolve: `@medusajs/admin`,
      options: {
        autoRebuild: true,
      },
    },
  ],
}
```

**Step 3: Create Custom Seller Module**

```typescript
// src/modules/seller/seller.ts
import { BaseService } from "@medusajs/medusa"

export default class SellerService extends BaseService {
  async createSeller(data: {
    name: string
    email: string
    phone: string
    description: string
  }) {
    // Create seller profile
    return this.manager_.create('Seller', {
      name: data.name,
      email: data.email,
      phone: data.phone,
      description: data.description,
      verified: false,
    })
  }

  async getSellerProducts(sellerId: string) {
    // Get all products for a seller
    return this.manager_.find('Product', {
      where: { seller_id: sellerId },
    })
  }
}
```

**Time: 6 hours**

---

### Day 8: Integrate Rasa Chatbot

**Objective:** Setup AI chatbot for Sakshi and AVE

**Step 1: Install Rasa**
```bash
pip install rasa
rasa init --no-prompt
```

**Step 2: Create Rasa NLU Training Data**

```yaml
# data/nlu.yml
version: "3.0"

nlu:
- intent: greet
  examples: |
    - hey
    - hello
    - hi
    - good morning
    - good evening

- intent: reservation
  examples: |
    - I want to book a table
    - Can I make a reservation
    - Book a table for 4 people
    - I need a reservation for tomorrow

- intent: menu_inquiry
  examples: |
    - What do you have on the menu
    - Show me vegan options
    - Do you have gluten-free items
    - What's your specialty

- intent: order
  examples: |
    - I want to order
    - Can I place an order
    - Order 2 coffees and 1 sandwich
    - I'll have the green smoothie

- intent: feedback
  examples: |
    - Your service was great
    - The food was delicious
    - I didn't like it
    - The wait was too long
```

```yaml
# data/stories.yml
version: "3.0"

stories:
- story: reservation flow
  steps:
  - intent: greet
  - action: utter_greet
  - intent: reservation
  - action: utter_ask_party_size
  - intent: inform
  - action: utter_ask_date
  - intent: inform
  - action: utter_confirm_reservation

- story: menu inquiry flow
  steps:
  - intent: menu_inquiry
  - action: utter_menu_options
  - intent: order
  - action: utter_confirm_order
```

**Step 3: Create Rasa Actions**

```python
# actions/actions.py
from rasa_sdk import Action, FormValidationAction
from rasa_sdk.events import SlotSet
from typing import Any, Text, Dict, List

class ActionConfirmReservation(Action):
    def name(self) -> Text:
        return "action_confirm_reservation"

    def run(self, dispatcher, tracker, domain):
        party_size = tracker.get_slot("party_size")
        date = tracker.get_slot("date")
        time = tracker.get_slot("time")

        # Call API to create reservation
        dispatcher.utter_message(
            text=f"Great! I've booked a table for {party_size} on {date} at {time}."
        )

        return []

class ActionGetMenuOptions(Action):
    def name(self) -> Text:
        return "action_get_menu_options"

    def run(self, dispatcher, tracker, domain):
        dietary = tracker.get_slot("dietary_preference")

        # Get menu from API
        menu_text = "Here are our vegan options: ..."

        dispatcher.utter_message(text=menu_text)

        return []
```

**Step 4: Connect Rasa to Backend**

```typescript
// server/routes/rasa-chat.ts
import { router, publicProcedure } from "@/server/trpc"
import { z } from "zod"

const RASA_URL = process.env.RASA_URL || 'http://localhost:5005'

export const rasaChatRouter = router({
  sendMessage: publicProcedure
    .input(z.object({
      senderId: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${RASA_URL}/webhooks/rest/webhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: input.senderId,
            message: input.message,
          }),
        }
      )

      return response.json()
    }),
})
```

**Time: 5 hours**

---

### Day 9: Setup Keycloak for Authentication

**Objective:** Replace custom OAuth with Keycloak

**Step 1: Deploy Keycloak**
```bash
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

**Step 2: Configure Keycloak Realm**

Access `http://localhost:8080/admin`

1. Create realm: `aans`
2. Create clients:
   - `aans-web` (for frontend)
   - `aans-mobile` (for mobile app)
3. Create roles:
   - `cafe_manager`
   - `ave_admin`
   - `seller`
   - `customer`

**Step 3: Integrate with Backend**

```typescript
// server/middleware/keycloak.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export async function keycloakMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.KEYCLOAK_PUBLIC_KEY!)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

**Time: 3 hours**

---

### Day 10: Integrate MinIO for File Storage

**Objective:** Self-hosted S3-compatible storage

**Step 1: Deploy MinIO**
```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio:latest \
  server /minio_data --console-address ":9001"
```

**Step 2: Create MinIO Client**

```typescript
// server/services/minio.ts
import * as Minio from 'minio'

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
})

export async function uploadFile(
  bucketName: string,
  fileName: string,
  fileContent: Buffer
) {
  await minioClient.putObject(bucketName, fileName, fileContent)
  return `${process.env.MINIO_URL}/${bucketName}/${fileName}`
}

export async function getFileUrl(bucketName: string, fileName: string) {
  return minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60)
}
```

**Step 3: Create Upload API Route**

```typescript
// server/routes/upload.ts
import { router, publicProcedure } from "@/server/trpc"
import { z } from "zod"
import { uploadFile } from "@/server/services/minio"

export const uploadRouter = router({
  uploadFile: publicProcedure
    .input(z.object({
      fileName: z.string(),
      fileContent: z.string(), // base64
      bucketName: z.string(),
    }))
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileContent, 'base64')
      const url = await uploadFile(
        input.bucketName,
        input.fileName,
        buffer
      )
      return { url }
    }),
})
```

**Time: 3 hours**

---

## Week 3: Analytics & Monitoring

### Day 11-12: Deploy Metabase

**Objective:** Self-hosted analytics and BI

**Step 1: Deploy Metabase**
```bash
docker run -d -p 3001:3000 \
  -e MB_DB_TYPE=postgres \
  -e MB_DB_DBNAME=metabase \
  -e MB_DB_PORT=5432 \
  -e MB_DB_USER=metabase \
  -e MB_DB_PASS=metabase \
  -e MB_DB_HOST=postgres \
  --name metabase \
  metabase/metabase:latest
```

**Step 2: Connect to AANS Database**

Access `http://localhost:3001`

1. Setup admin account
2. Add database connection (PostgreSQL)
3. Create dashboards for:
   - Sakshi Cafe metrics
   - AVE business metrics
   - SubCircle marketplace metrics

**Step 3: Create API for Dashboard Access**

```typescript
// server/routes/metabase.ts
import { router, publicProcedure } from "@/server/trpc"

const METABASE_URL = process.env.METABASE_URL || 'http://localhost:3001'

export const metabaseRouter = router({
  getDashboard: publicProcedure
    .input(z.object({ dashboardId: z.number() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${METABASE_URL}/api/dashboard/${input.dashboardId}`
      )
      return response.json()
    }),
})
```

**Time: 4 hours**

---

### Day 13: Setup ELK Stack for Logging

**Objective:** Centralized logging and monitoring

**Step 1: Deploy ELK Stack**
```yaml
# docker-compose.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

  logstash:
    image: docker.elastic.co/logstash/logstash:8.0.0
    ports:
      - "5000:5000"
    depends_on:
      - elasticsearch
```

```bash
docker-compose up -d
```

**Step 2: Configure Application Logging**

```typescript
// server/logger.ts
import winston from 'winston'
import { ElasticsearchTransport } from 'winston-elasticsearch'

const esTransportOpts = {
  level: 'info',
  clientOpts: { node: 'http://localhost:9200' },
  index: 'aans-logs',
}

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new ElasticsearchTransport(esTransportOpts),
  ],
})
```

**Time: 2 hours**

---

### Day 14: Performance Optimization

**Objective:** Optimize all integrated components

**Tasks:**
- [ ] Configure Redis caching
- [ ] Setup database query optimization
- [ ] Implement API rate limiting
- [ ] Configure CDN for static assets
- [ ] Setup monitoring dashboards

**Time: 4 hours**

---

## Week 4: Testing & Deployment

### Day 15-16: Setup Cypress for E2E Testing

**Objective:** Automated end-to-end testing

**Step 1: Install Cypress**
```bash
npm install --save-dev cypress
npx cypress open
```

**Step 2: Create Test Suites**

```typescript
// cypress/e2e/sakshi-cafe.cy.ts
describe('Sakshi Cafe Features', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('should display menu items', () => {
    cy.get('[data-testid="menu-items"]').should('exist')
    cy.get('[data-testid="menu-item"]').should('have.length.greaterThan', 0)
  })

  it('should place an order', () => {
    cy.get('[data-testid="add-to-cart"]').first().click()
    cy.get('[data-testid="checkout"]').click()
    cy.get('[data-testid="place-order"]').click()
    cy.get('[data-testid="order-confirmation"]').should('exist')
  })

  it('should track order status', () => {
    cy.get('[data-testid="order-status"]').should('contain', 'Preparing')
    cy.wait(5000)
    cy.get('[data-testid="order-status"]').should('contain', 'Ready')
  })
})
```

**Time: 4 hours**

---

### Day 17-18: Setup Playwright for Cross-Browser Testing

**Objective:** Test across multiple browsers

**Step 1: Install Playwright**
```bash
npm install --save-dev @playwright/test
```

**Step 2: Create Tests**

```typescript
// tests/marketplace.spec.ts
import { test, expect } from '@playwright/test'

test.describe('SubCircle Marketplace', () => {
  test('should display products', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')
    const products = await page.locator('[data-testid="product"]')
    expect(await products.count()).toBeGreaterThan(0)
  })

  test('should add product to cart', async ({ page }) => {
    await page.goto('http://localhost:3000/marketplace')
    await page.click('[data-testid="add-to-cart"]')
    const cartCount = await page.locator('[data-testid="cart-count"]')
    expect(await cartCount.textContent()).toBe('1')
  })

  test('should complete checkout', async ({ page }) => {
    // Setup: Add product to cart
    await page.goto('http://localhost:3000/marketplace')
    await page.click('[data-testid="add-to-cart"]')

    // Checkout
    await page.click('[data-testid="checkout"]')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.click('[data-testid="place-order"]')

    // Verify
    const confirmation = await page.locator('[data-testid="order-confirmation"]')
    await expect(confirmation).toBeVisible()
  })
})
```

**Time: 3 hours**

---

### Day 19-20: Final Integration & Deployment

**Objective:** Integrate all components and deploy

**Checklist:**
- [ ] All services running (Strapi, Medusa, Rasa, Keycloak, MinIO, Metabase, ELK)
- [ ] Environment variables configured
- [ ] Database migrations complete
- [ ] API routes tested
- [ ] Frontend components updated
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Deployment to staging

**Time: 8 hours**

---

## Summary

| Week | Focus | Components | Time Saved |
|------|-------|-----------|-----------|
| 1 | Foundation | Nivo, Socket.io, Strapi, Uppy, Sentry | 15 days |
| 2 | Commerce | Medusa, Rasa, Keycloak, MinIO | 25 days |
| 3 | Analytics | Metabase, ELK | 20 days |
| 4 | Testing | Cypress, Playwright, Deployment | 15 days |
| **Total** | **Complete Stack** | **12 Components** | **75 days** |

---

## Next Steps

1. **Week 1:** Start with Nivo, Socket.io, and Strapi
2. **Week 2:** Deploy Medusa and Rasa
3. **Week 3:** Setup Metabase and ELK
4. **Week 4:** Complete testing and deployment

**Expected Outcome:** Fully functional AANS platform with all three divisions operational in 4 weeks instead of 6+ months.

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025
