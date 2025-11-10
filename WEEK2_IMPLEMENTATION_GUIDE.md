# Week 2: Commerce & Marketplace Integration
## Deploy Medusa, Rasa, Keycloak, and MinIO (Days 6-10)

**Timeline:** 5 Days (Nov 15-19, 2025)  
**Components:** 4 major platforms  
**Time Saved:** 25+ days of development  
**Team:** 2 developers

---

## 📋 Week 2 Overview

| Day | Component | Tasks | Time |
|-----|-----------|-------|------|
| 6-7 | Medusa | Setup, customize, seller module | 6 hours |
| 8 | Rasa | NLU training, conversation flows | 5 hours |
| 9 | Keycloak | Deploy, configure realms, JWT | 3 hours |
| 10 | MinIO | Deploy, S3 API, bucket management | 3 hours |

---

## Day 6-7: Deploy Medusa E-Commerce Platform

### Step 1: Create Medusa Project

```bash
# Install Medusa CLI
npm install -g @medusajs/medusa-cli

# Create new Medusa store
medusa new my-store --seed

# Navigate to project
cd my-store

# Start development server
npm run dev
```

**Expected Output:**
```
✓ Medusa server running on http://localhost:9000
✓ Admin dashboard on http://localhost:7000
✓ Database seeded with sample data
```

### Step 2: Customize Medusa for SubCircle Marketplace

Create seller module:

```typescript
// medusa-store/src/modules/seller/models/seller.ts
import { BaseEntity } from "@medusajs/medusa"
import { Column, Entity, OneToMany } from "typeorm"
import { Product } from "@medusajs/medusa"

@Entity()
export class Seller extends BaseEntity {
  @Column()
  name: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ default: false })
  verified: boolean

  @Column({ nullable: true })
  logo_url: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @OneToMany(() => Product, (product) => product.seller)
  products: Product[]
}
```

Create seller service:

```typescript
// medusa-store/src/services/seller.ts
import { BaseService } from "@medusajs/medusa"
import { EntityManager } from "typeorm"
import { Seller } from "../models/seller"

class SellerService extends BaseService {
  protected manager_: EntityManager

  async createSeller(data: {
    name: string
    email: string
    phone: string
    description?: string
  }): Promise<Seller> {
    const sellerRepo = this.manager_.getRepository(Seller)
    const seller = sellerRepo.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      description: data.description,
      verified: false,
    })
    return await sellerRepo.save(seller)
  }

  async getSellerProducts(sellerId: string): Promise<any[]> {
    const sellerRepo = this.manager_.getRepository(Seller)
    const seller = await sellerRepo.findOne(sellerId, {
      relations: ["products"],
    })
    return seller?.products || []
  }

  async verifySeller(sellerId: string): Promise<Seller> {
    const sellerRepo = this.manager_.getRepository(Seller)
    const seller = await sellerRepo.findOne(sellerId)
    if (seller) {
      seller.verified = true
      return await sellerRepo.save(seller)
    }
    throw new Error("Seller not found")
  }

  async updateSellerProfile(
    sellerId: string,
    data: Partial<Seller>
  ): Promise<Seller> {
    const sellerRepo = this.manager_.getRepository(Seller)
    await sellerRepo.update(sellerId, data)
    return await sellerRepo.findOne(sellerId)
  }
}

export default SellerService
```

### Step 3: Create Medusa API Routes

```typescript
// medusa-store/src/api/routes/sellers/index.ts
import { Router } from "express"
import { SellerService } from "../../../services/seller"

const router = Router()

export function setupSellerRoutes(app: Router) {
  app.post("/sellers", async (req, res) => {
    const sellerService: SellerService = req.scope.resolve("sellerService")
    try {
      const seller = await sellerService.createSeller(req.body)
      res.json({ seller })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  app.get("/sellers/:id", async (req, res) => {
    const sellerService: SellerService = req.scope.resolve("sellerService")
    try {
      const products = await sellerService.getSellerProducts(req.params.id)
      res.json({ products })
    } catch (error) {
      res.status(404).json({ error: error.message })
    }
  })

  app.post("/sellers/:id/verify", async (req, res) => {
    const sellerService: SellerService = req.scope.resolve("sellerService")
    try {
      const seller = await sellerService.verifySeller(req.params.id)
      res.json({ seller })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  app.put("/sellers/:id", async (req, res) => {
    const sellerService: SellerService = req.scope.resolve("sellerService")
    try {
      const seller = await sellerService.updateSellerProfile(
        req.params.id,
        req.body
      )
      res.json({ seller })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  })

  return router
}
```

### Step 4: Integrate Medusa with AANS

```typescript
// server/routes/medusa.ts
import { router, publicProcedure, protectedProcedure } from "@/server/trpc"
import { z } from "zod"

const MEDUSA_URL = process.env.MEDUSA_URL || "http://localhost:9000"

export const medusaRouter = router({
  // Seller Management
  createSeller: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(`${MEDUSA_URL}/admin/sellers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN}`,
        },
        body: JSON.stringify(input),
      })
      return response.json()
    }),

  getSellerProducts: publicProcedure
    .input(z.object({ sellerId: z.string() }))
    .query(async ({ input }) => {
      const response = await fetch(
        `${MEDUSA_URL}/admin/sellers/${input.sellerId}/products`
      )
      return response.json()
    }),

  // Product Management
  createProduct: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        price: z.number(),
        sellerId: z.string(),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(`${MEDUSA_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MEDUSA_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          title: input.title,
          description: input.description,
          variants: [{ prices: [{ amount: input.price }] }],
          seller_id: input.sellerId,
        }),
      })
      return response.json()
    }),

  // Cart Management
  createCart: publicProcedure
    .input(z.object({ region_id: z.string() }))
    .mutation(async ({ input }) => {
      const response = await fetch(`${MEDUSA_URL}/store/carts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      return response.json()
    }),

  addToCart: publicProcedure
    .input(
      z.object({
        cart_id: z.string(),
        variant_id: z.string(),
        quantity: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${MEDUSA_URL}/store/carts/${input.cart_id}/line-items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variant_id: input.variant_id,
            quantity: input.quantity,
          }),
        }
      )
      return response.json()
    }),

  // Order Management
  completeCart: publicProcedure
    .input(z.object({ cart_id: z.string() }))
    .mutation(async ({ input }) => {
      const response = await fetch(
        `${MEDUSA_URL}/store/carts/${input.cart_id}/complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      )
      return response.json()
    }),
})
```

**Time: 6 hours**

---

## Day 8: Integrate Rasa Chatbot

### Step 1: Install and Initialize Rasa

```bash
# Install Rasa
pip install rasa

# Create new Rasa project
rasa init --no-prompt

# Navigate to project
cd rasa-project
```

### Step 2: Create NLU Training Data

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
    - namaste
    - welcome

- intent: reservation
  examples: |
    - I want to book a table
    - Can I make a reservation
    - Book a table for 4 people
    - I need a reservation for tomorrow
    - Reserve a table for 2
    - Can you book me a table

- intent: menu_inquiry
  examples: |
    - What do you have on the menu
    - Show me vegan options
    - Do you have gluten-free items
    - What's your specialty
    - What are your best dishes
    - Show me vegetarian options

- intent: order
  examples: |
    - I want to order
    - Can I place an order
    - Order 2 coffees and 1 sandwich
    - I'll have the green smoothie
    - Give me a biryani
    - I want to order food

- intent: feedback
  examples: |
    - Your service was great
    - The food was delicious
    - I didn't like it
    - The wait was too long
    - Excellent experience
    - Poor service

- intent: cancel
  examples: |
    - Cancel my order
    - I want to cancel
    - Remove my reservation
    - Cancel everything
    - Forget it

- intent: track_order
  examples: |
    - Where is my order
    - Track my order
    - When will it arrive
    - Status of my order
    - Is my order ready

- intent: payment
  examples: |
    - How do I pay
    - Payment options
    - Can I pay online
    - Do you accept cards
    - What payment methods

- intent: contact
  examples: |
    - What's your phone number
    - How do I contact you
    - Your address
    - Business hours
    - When are you open
```

### Step 3: Create Conversation Stories

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
    entities:
    - party_size
  - action: utter_ask_date
  - intent: inform
    entities:
    - date
  - action: utter_ask_time
  - intent: inform
    entities:
    - time
  - action: action_confirm_reservation

- story: menu inquiry flow
  steps:
  - intent: menu_inquiry
  - action: utter_menu_options
  - intent: inform
    entities:
    - dietary_preference
  - action: action_get_menu_items

- story: order flow
  steps:
  - intent: order
  - action: utter_ask_items
  - intent: inform
    entities:
    - item
  - action: action_add_to_cart
  - intent: payment
  - action: utter_payment_options
  - action: action_process_order

- story: feedback flow
  steps:
  - intent: feedback
  - action: utter_thank_feedback
  - action: action_save_feedback

- story: track order flow
  steps:
  - intent: track_order
  - action: action_get_order_status
  - action: utter_order_status
```

### Step 4: Create Custom Actions

```python
# actions/actions.py
from rasa_sdk import Action, FormValidationAction
from rasa_sdk.events import SlotSet
from typing import Any, Text, Dict, List
import requests

class ActionConfirmReservation(Action):
    def name(self) -> Text:
        return "action_confirm_reservation"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        party_size = tracker.get_slot("party_size")
        date = tracker.get_slot("date")
        time = tracker.get_slot("time")
        customer_name = tracker.get_slot("customer_name")

        # Call AANS API to create reservation
        try:
            response = requests.post(
                "http://localhost:3000/api/reservations",
                json={
                    "name": customer_name,
                    "party_size": party_size,
                    "date": date,
                    "time": time,
                },
            )

            if response.status_code == 201:
                reservation_id = response.json()["id"]
                dispatcher.utter_message(
                    text=f"Great! I've booked a table for {party_size} on {date} at {time}. "
                    f"Your reservation ID is {reservation_id}."
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't complete your reservation. Please try again."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}"
            )

        return []


class ActionGetMenuItems(Action):
    def name(self) -> Text:
        return "action_get_menu_items"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        dietary_preference = tracker.get_slot("dietary_preference")

        # Call AANS API to get menu items
        try:
            params = {}
            if dietary_preference:
                params["dietary"] = dietary_preference

            response = requests.get(
                "http://localhost:3000/api/menu-items",
                params=params,
            )

            if response.status_code == 200:
                items = response.json()["items"]
                menu_text = "Here are our available items:\n\n"
                for item in items[:5]:
                    menu_text += f"• {item['name']} - ₹{item['price']}\n"
                dispatcher.utter_message(text=menu_text)
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't retrieve the menu. Please try again."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}"
            )

        return []


class ActionProcessOrder(Action):
    def name(self) -> Text:
        return "action_process_order"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        items = tracker.get_slot("items") or []
        customer_name = tracker.get_slot("customer_name")
        customer_phone = tracker.get_slot("customer_phone")

        # Call AANS API to create order
        try:
            response = requests.post(
                "http://localhost:3000/api/orders",
                json={
                    "customer_name": customer_name,
                    "customer_phone": customer_phone,
                    "items": items,
                },
            )

            if response.status_code == 201:
                order = response.json()
                dispatcher.utter_message(
                    text=f"Perfect! Your order has been placed. "
                    f"Order ID: {order['id']}\n"
                    f"Estimated time: {order['estimated_time']} minutes"
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't process your order. Please try again."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}"
            )

        return []


class ActionGetOrderStatus(Action):
    def name(self) -> Text:
        return "action_get_order_status"

    def run(
        self,
        dispatcher,
        tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        order_id = tracker.get_slot("order_id")

        if not order_id:
            dispatcher.utter_message(
                text="I need your order ID to track your order. "
                "Could you please provide it?"
            )
            return []

        # Call AANS API to get order status
        try:
            response = requests.get(
                f"http://localhost:3000/api/orders/{order_id}"
            )

            if response.status_code == 200:
                order = response.json()
                dispatcher.utter_message(
                    text=f"Your order status: {order['status']}\n"
                    f"Estimated time: {order['estimated_time']} minutes"
                )
            else:
                dispatcher.utter_message(
                    text="Sorry, I couldn't find your order. Please check the order ID."
                )
        except Exception as e:
            dispatcher.utter_message(
                text=f"Sorry, something went wrong: {str(e)}"
            )

        return []
```

### Step 5: Create Rasa Domain

```yaml
# domain.yml
version: "3.0"

intents:
  - greet
  - reservation
  - menu_inquiry
  - order
  - feedback
  - cancel
  - track_order
  - payment
  - contact
  - inform

entities:
  - party_size
  - date
  - time
  - dietary_preference
  - item
  - order_id
  - customer_name
  - customer_phone

slots:
  party_size:
    type: text
  date:
    type: text
  time:
    type: text
  dietary_preference:
    type: text
  items:
    type: list
  order_id:
    type: text
  customer_name:
    type: text
  customer_phone:
    type: text

responses:
  utter_greet:
    - text: "Hello! Welcome to Sakshi Cafe. How can I help you today?"

  utter_ask_party_size:
    - text: "How many people will be dining?"

  utter_ask_date:
    - text: "What date would you like to reserve?"

  utter_ask_time:
    - text: "What time would you prefer?"

  utter_menu_options:
    - text: "Would you like to see our menu? We have vegetarian, vegan, and gluten-free options."

  utter_ask_items:
    - text: "What would you like to order?"

  utter_payment_options:
    - text: "We accept cash, card, and online payments. Which would you prefer?"

  utter_thank_feedback:
    - text: "Thank you for your feedback! We appreciate your input."

  utter_order_status:
    - text: "Let me check your order status for you."

actions:
  - action_confirm_reservation
  - action_get_menu_items
  - action_add_to_cart
  - action_process_order
  - action_get_order_status
  - action_save_feedback
```

### Step 6: Train and Run Rasa

```bash
# Train the model
rasa train

# Start Rasa server
rasa run --enable-api --cors "*"

# In another terminal, start action server
rasa run actions
```

### Step 7: Integrate Rasa with AANS

```typescript
// server/routes/rasa-chat.ts
import { router, publicProcedure } from "@/server/trpc"
import { z } from "zod"

const RASA_URL = process.env.RASA_URL || "http://localhost:5005"

export const rasaChatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        senderId: z.string(),
        message: z.string(),
        cafeId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `${RASA_URL}/webhooks/rest/webhook`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender: input.senderId,
              message: input.message,
              metadata: {
                cafe_id: input.cafeId,
              },
            }),
          }
        )

        const messages = await response.json()
        return { messages, success: true }
      } catch (error) {
        return {
          messages: [
            {
              text: "Sorry, I'm having trouble processing your request. Please try again.",
            },
          ],
          success: false,
          error: error.message,
        }
      }
    }),
})
```

**Time: 5 hours**

---

## Day 9: Setup Keycloak Authentication

### Step 1: Deploy Keycloak with Docker

```bash
docker run -d \
  -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -e KC_DB=postgres \
  -e KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak \
  -e KC_DB_USERNAME=keycloak \
  -e KC_DB_PASSWORD=keycloak \
  --name keycloak \
  --network aans-network \
  quay.io/keycloak/keycloak:latest \
  start-dev
```

### Step 2: Configure Keycloak Realm

Access `http://localhost:8080/admin` with admin/admin

1. **Create Realm:**
   - Name: `aans`
   - Enabled: true

2. **Create Clients:**
   - `aans-web` (Frontend)
   - `aans-mobile` (Mobile App)
   - `aans-admin` (Admin Panel)

3. **Configure Client Settings:**
   ```
   Client ID: aans-web
   Client Protocol: openid-connect
   Access Type: public
   Valid Redirect URIs: http://localhost:3000/*
   Web Origins: http://localhost:3000
   ```

4. **Create Roles:**
   - `cafe_manager`
   - `ave_admin`
   - `seller`
   - `customer`
   - `support_staff`

5. **Create Users:**
   - Test users for each role
   - Set passwords
   - Assign roles

### Step 3: Keycloak Middleware for Backend

```typescript
// server/middleware/keycloak.ts
import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import jwksClient from "jwks-rsa"

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || "http://localhost:8080"
const REALM = process.env.KEYCLOAK_REALM || "aans"

const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/certs`,
})

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err)
    } else {
      const signingKey = key.publicKey || key.rsaPublicKey
      callback(null, signingKey)
    }
  })
}

export function keycloakMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "No token provided" })
  }

  jwt.verify(token, getKey, {}, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" })
    }

    req.user = decoded
    req.userId = decoded.sub
    req.userRoles = decoded.realm_access?.roles || []
    next()
  })
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.userRoles?.includes(role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }
    next()
  }
}
```

### Step 4: Keycloak Integration with Frontend

```typescript
// client/src/lib/keycloak.ts
import Keycloak from "keycloak-js"

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM || "aans",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "aans-web",
})

export async function initKeycloak() {
  try {
    const authenticated = await keycloak.init({
      onLoad: "login-required",
      silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
    })

    if (authenticated) {
      console.log("User authenticated")
      return keycloak
    }
  } catch (error) {
    console.error("Keycloak initialization failed", error)
  }
}

export function getToken() {
  return keycloak.token
}

export function getUserInfo() {
  return keycloak.tokenParsed
}

export function logout() {
  keycloak.logout()
}

export function hasRole(role: string) {
  return keycloak.hasRealmRole(role)
}
```

**Time: 3 hours**

---

## Day 10: Implement MinIO File Storage

### Step 1: Deploy MinIO with Docker

```bash
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  --name minio \
  --network aans-network \
  minio/minio:latest \
  server /minio_data --console-address ":9001"
```

Access console at `http://localhost:9001` with minioadmin/minioadmin

### Step 2: Create MinIO Client Service

```typescript
// server/services/minio.ts
import * as Minio from "minio"
import path from "path"

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
})

export async function ensureBucket(bucketName: string) {
  try {
    const exists = await minioClient.bucketExists(bucketName)
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1")
      console.log(`Bucket '${bucketName}' created successfully`)
    }
  } catch (error) {
    console.error(`Error ensuring bucket '${bucketName}':`, error)
    throw error
  }
}

export async function uploadFile(
  bucketName: string,
  fileName: string,
  fileContent: Buffer,
  contentType: string = "application/octet-stream"
) {
  try {
    await ensureBucket(bucketName)

    const objectName = `${Date.now()}-${fileName}`

    await minioClient.putObject(
      bucketName,
      objectName,
      fileContent,
      fileContent.length,
      { "Content-Type": contentType }
    )

    return {
      bucket: bucketName,
      object: objectName,
      url: `${process.env.MINIO_URL}/${bucketName}/${objectName}`,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

export async function getFileUrl(
  bucketName: string,
  fileName: string,
  expiresIn: number = 24 * 60 * 60
) {
  try {
    const url = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      expiresIn
    )
    return url
  } catch (error) {
    console.error("Error getting file URL:", error)
    throw error
  }
}

export async function deleteFile(bucketName: string, fileName: string) {
  try {
    await minioClient.removeObject(bucketName, fileName)
    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

export async function listFiles(bucketName: string, prefix: string = "") {
  try {
    const files: any[] = []
    const stream = minioClient.listObjects(bucketName, prefix, true)

    return new Promise((resolve, reject) => {
      stream.on("data", (obj) => {
        files.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
        })
      })

      stream.on("error", (error) => {
        reject(error)
      })

      stream.on("end", () => {
        resolve(files)
      })
    })
  } catch (error) {
    console.error("Error listing files:", error)
    throw error
  }
}
```

### Step 3: Create File Upload API Routes

```typescript
// server/routes/upload.ts
import { router, protectedProcedure } from "@/server/trpc"
import { z } from "zod"
import {
  uploadFile,
  getFileUrl,
  deleteFile,
  listFiles,
} from "@/server/services/minio"

export const uploadRouter = router({
  uploadFile: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileContent: z.string(), // base64
        bucketName: z.string(),
        contentType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const buffer = Buffer.from(input.fileContent, "base64")
      const result = await uploadFile(
        input.bucketName,
        input.fileName,
        buffer,
        input.contentType
      )
      return result
    }),

  getFileUrl: publicProcedure
    .input(
      z.object({
        bucketName: z.string(),
        fileName: z.string(),
        expiresIn: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const url = await getFileUrl(
        input.bucketName,
        input.fileName,
        input.expiresIn
      )
      return { url }
    }),

  deleteFile: protectedProcedure
    .input(
      z.object({
        bucketName: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await deleteFile(input.bucketName, input.fileName)
    }),

  listFiles: publicProcedure
    .input(
      z.object({
        bucketName: z.string(),
        prefix: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const files = await listFiles(input.bucketName, input.prefix)
      return { files }
    }),
})
```

**Time: 3 hours**

---

## 🔧 Environment Variables for Week 2

```env
# Medusa
MEDUSA_URL=http://localhost:9000
MEDUSA_ADMIN_TOKEN=your-admin-token
MEDUSA_WEBHOOK_SECRET=your-webhook-secret

# Rasa
RASA_URL=http://localhost:5005
RASA_ACTION_SERVER_URL=http://localhost:5055

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=aans
KEYCLOAK_CLIENT_ID=aans-web
KEYCLOAK_CLIENT_SECRET=your-client-secret
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=aans
VITE_KEYCLOAK_CLIENT_ID=aans-web

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_URL=http://localhost:9000
```

---

## ✅ Week 2 Checklist

- [ ] Medusa installed and customized
- [ ] Seller module created
- [ ] Medusa API routes integrated
- [ ] Rasa NLU training data created
- [ ] Rasa conversation stories defined
- [ ] Rasa custom actions implemented
- [ ] Rasa model trained
- [ ] Rasa integrated with AANS
- [ ] Keycloak deployed
- [ ] Keycloak realm and clients configured
- [ ] Keycloak middleware implemented
- [ ] Keycloak frontend integration
- [ ] MinIO deployed
- [ ] MinIO file upload service created
- [ ] MinIO API routes created
- [ ] Environment variables configured
- [ ] Integration testing completed
- [ ] Documentation updated

---

## 📊 Expected Outcomes

| Component | Status | Time Saved |
|-----------|--------|-----------|
| Medusa | Production-ready | 10 days |
| Rasa | Trained & integrated | 8 days |
| Keycloak | Configured & secured | 5 days |
| MinIO | Deployed & operational | 2 days |
| **Total** | **All integrated** | **25 days** |

---

## 🚀 Week 3 Preview

**Analytics & Monitoring (Days 11-14)**
- Deploy Metabase for business intelligence
- Setup ELK Stack for centralized logging
- Create analytics dashboards
- Implement performance monitoring

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Status:** Ready for Implementation
