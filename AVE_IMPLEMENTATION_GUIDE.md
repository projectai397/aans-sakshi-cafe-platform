# AVE (AI Voice Engine) Implementation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Services](#services)
4. [API Endpoints](#api-endpoints)
5. [Frontend Pages](#frontend-pages)
6. [Integration Guide](#integration-guide)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Overview

**AVE (AI Voice Engine)** is a complete AI-powered voice assistant system for automated phone ordering, reservations, and customer service. It uses local AI runtime, direct Android app integration, and supports multi-language conversations.

### Key Features

- 🎯 **11 Intent Types**: Order, Reservation, Menu, Status, Modify, Cancel, Complaint, Greeting, Goodbye, General Inquiry
- 🧠 **9 Entity Types**: Menu items, Quantity, Date, Time, Phone, Name, Location, Party Size, Order ID
- 📞 **Complete Call Lifecycle**: Incoming, Answer, Active, Transfer, End
- 🌐 **Multi-Language**: English, Hindi, Hinglish support
- 🍽️ **Smart Ordering**: Menu recommendations, price calculation, order confirmation
- 📅 **Intelligent Booking**: Table availability, alternative suggestions, reservation management
- 📊 **Real-Time Analytics**: Live monitoring, performance metrics, insights

---

## Architecture

```
AVE System Architecture
│
├── Telephony Layer
│   ├── Call Handling (incoming, answer, end, transfer)
│   ├── Speech-to-Text (STT)
│   ├── Text-to-Speech (TTS)
│   └── Call Recording
│
├── NLP Layer
│   ├── Intent Recognition (11 intents)
│   ├── Entity Extraction (9 entity types)
│   ├── Context Management
│   └── Response Generation
│
├── Business Logic Layer
│   ├── Voice Order Service
│   │   ├── Menu search
│   │   ├── Order building
│   │   ├── Price calculation
│   │   └── Order confirmation
│   │
│   └── Voice Reservation Service
│       ├── Availability checking
│       ├── Table assignment
│       ├── Alternative suggestions
│       └── Reservation confirmation
│
├── API Layer
│   └── REST API (20+ endpoints)
│
└── Admin Dashboard
    ├── Real-Time Monitoring
    ├── Analytics & Reports
    └── Configuration
```

---

## Services

### 1. Telephony Service (`telephony-service.ts`)

**Purpose**: Manages voice calls and audio processing

**Key Methods**:

```typescript
// Handle incoming call
handleIncomingCall(callId: string, from: string): Promise<Call>

// Answer call
answerCall(callId: string): Promise<void>

// End call
endCall(callId: string): Promise<void>

// Transcribe audio (STT)
transcribeAudio(callId: string, audioBuffer: Buffer, language: string): Promise<VoiceRecognitionResult>

// Synthesize speech (TTS)
speak(callId: string, options: SpeechSynthesisOptions): Promise<Buffer>

// Transfer to agent
transferCall(callId: string, agentId: string): Promise<void>

// Get active calls
getActiveCalls(): Call[]
```

**Events**:
- `call:incoming` - New call received
- `call:answered` - Call answered
- `call:ended` - Call completed
- `call:transfer` - Call transferred
- `audio:play` - Audio playback

---

### 2. NLP Service (`nlp-service.ts`)

**Purpose**: Natural language understanding and response generation

**Intents**:
1. `ORDER_FOOD` - Customer wants to order food
2. `MAKE_RESERVATION` - Customer wants to book a table
3. `CHECK_MENU` - Customer asks about menu
4. `CHECK_STATUS` - Customer checks order/reservation status
5. `MODIFY_ORDER` - Customer wants to change order
6. `CANCEL_ORDER` - Customer wants to cancel
7. `COMPLAINT` - Customer has a complaint
8. `GENERAL_INQUIRY` - General questions
9. `GREETING` - Hello, Hi, Namaste
10. `GOODBYE` - Bye, Thank you
11. `UNKNOWN` - Intent not recognized

**Entity Types**:
1. `MENU_ITEM` - Food items (e.g., "Ayurvedic Thali")
2. `QUANTITY` - Numbers (e.g., "2", "three")
3. `DATE` - Dates (e.g., "tomorrow", "Monday")
4. `TIME` - Times (e.g., "7 PM", "noon")
5. `PHONE_NUMBER` - Phone numbers
6. `NAME` - Customer names
7. `LOCATION` - Locations
8. `PARTY_SIZE` - Number of guests
9. `ORDER_ID` - Order identifiers

**Key Methods**:

```typescript
// Analyze intent
analyzeIntent(text: string, sessionId: string): Promise<IntentResult>

// Extract entities
extractEntities(text: string): Promise<Entity[]>

// Generate response
generateResponse(intentResult: IntentResult): Promise<string>

// Manage context
getContext(sessionId: string): ConversationContext
updateContext(sessionId: string, data: Partial<ConversationContext>): void
clearContext(sessionId: string): void
```

---

### 3. Voice Order Service (`voice-order-service.ts`)

**Purpose**: Processes food orders via voice

**Menu Items** (5+ items):
- Ayurvedic Thali (₹250)
- Vata Balance Bowl (₹220)
- Pitta Cooling Salad (₹180)
- Kapha Warming Curry (₹200)
- Premium Biryani (₹300)

**Key Methods**:

```typescript
// Process order from voice
processOrderFromVoice(intentResult: IntentResult, callId: string): Promise<{order: VoiceOrder, response: string}>

// Get order summary
getOrderSummary(callId: string): string

// Confirm order
confirmOrder(callId: string, customerInfo: {phone, name, address}): Promise<{success: boolean, response: string}>

// Menu operations
findMenuItem(name: string): MenuItem | undefined
getMenuByCategory(category: string): MenuItem[]
searchMenu(query: string): MenuItem[]
getRecommendations(dietaryPreference?: string): MenuItem[]
```

**Order Flow**:
1. Customer states what they want to order
2. System extracts menu items and quantities
3. System adds items to cart
4. System calculates total (subtotal + tax + delivery)
5. System confirms order details
6. Customer provides phone/address
7. System confirms and sends SMS

**Pricing**:
- Subtotal: Sum of item prices × quantities
- Tax: 5% of subtotal
- Delivery: ₹40 (Free if subtotal ≥ ₹500)

---

### 4. Voice Reservation Service (`voice-reservation-service.ts`)

**Purpose**: Handles table reservations via voice

**Table Capacity**:
- 2-person tables: 2
- 4-person tables: 2
- 6-person tables: 1
- 8-person tables: 1

**Business Hours**:
- Open: 11:00 AM
- Close: 10:00 PM
- Time Slots: 11:00, 12:00, 13:00, 14:00, 18:00, 19:00, 20:00, 21:00

**Key Methods**:

```typescript
// Process reservation from voice
processReservationFromVoice(intentResult: IntentResult, callId: string): Promise<{reservation: VoiceReservation, response: string}>

// Check availability
checkAvailability(date: Date, time: string, partySize: number): Promise<AvailableSlot[]>

// Suggest alternatives
suggestAlternativeTimes(date: Date, partySize: number): Promise<AvailableSlot[]>

// Confirm reservation
confirmReservation(callId: string, customerInfo: {phone, name, specialRequests}): Promise<{success: boolean, response: string}>

// Modify/Cancel
cancelReservation(reservationId: string): Promise<{success: boolean, response: string}>
modifyReservation(reservationId: string, changes: Partial<VoiceReservation>): Promise<{success: boolean, response: string}>
```

**Reservation Flow**:
1. Customer states they want to make a reservation
2. System extracts date, time, party size
3. System checks availability
4. If available, system confirms details
5. If not available, system suggests alternatives
6. Customer provides phone/name
7. System assigns table and confirms

---

## API Endpoints

### Telephony Endpoints

```
POST /api/ave/call/incoming
POST /api/ave/call/:callId/answer
POST /api/ave/call/:callId/end
POST /api/ave/call/:callId/transcribe
POST /api/ave/call/:callId/speak
POST /api/ave/call/:callId/transfer
GET  /api/ave/calls/active
```

### NLP Endpoints

```
POST /api/ave/nlp/analyze
POST /api/ave/nlp/respond
GET  /api/ave/nlp/context/:sessionId
```

### Order Endpoints

```
POST /api/ave/order/process
GET  /api/ave/order/:callId/summary
POST /api/ave/order/:callId/confirm
GET  /api/ave/order/menu
```

### Reservation Endpoints

```
POST /api/ave/reservation/process
POST /api/ave/reservation/:callId/confirm
POST /api/ave/reservation/availability
POST /api/ave/reservation/:reservationId/cancel
```

### Unified Assistant Endpoint

```
POST /api/ave/assistant/process
```

**Request**:
```json
{
  "text": "I want to order an Ayurvedic Thali",
  "callId": "CALL_12345",
  "sessionId": "SESSION_67890"
}
```

**Response**:
```json
{
  "success": true,
  "intent": "order_food",
  "response": "Great! I've added 1 Ayurvedic Thali to your order. Your current total is ₹250. Would you like to add anything else?",
  "data": {
    "order": {
      "orderId": "ORD_123",
      "items": [...],
      "total": 250
    }
  }
}
```

### Health Check

```
GET /api/ave/health
```

**Response**:
```json
{
  "status": "healthy",
  "services": {
    "telephony": "active",
    "nlp": "active",
    "voiceOrder": "active",
    "voiceReservation": "active"
  },
  "stats": {
    "activeCalls": 3,
    "activeOrders": 5,
    "activeReservations": 2,
    "activeContexts": 8
  }
}
```

---

## Frontend Pages

### 1. AVE Dashboard (`/ave/dashboard`)

**Features**:
- Real-time call monitoring
- Active calls display
- Call volume chart (hourly)
- Intent distribution pie chart
- Conversion funnel
- Auto-refresh every 5 seconds

**Key Metrics**:
- Active Calls
- Queued Calls
- Avg Wait Time
- Recognition Accuracy
- Total Calls Today
- Orders Placed
- Reservations Booked
- Avg Call Duration

### 2. AVE Analytics (`/ave/analytics`)

**Features**:
- Call trends (weekly)
- Performance metrics vs targets
- Hourly call distribution
- Call outcomes breakdown
- Language distribution
- AI-powered insights

**Metrics**:
- Total Calls
- Success Rate
- Avg Duration
- Revenue Generated
- Recognition Accuracy
- Intent Classification
- Response Time
- Customer Satisfaction

---

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

```bash
# .env
AVE_ENABLED=true
AVE_PORT=3001
AVE_LOG_LEVEL=info
```

### Step 3: Start Services

```bash
# Start backend
npm run dev:server

# Start frontend
npm run dev:client
```

### Step 4: Test AVE System

```bash
# Health check
curl http://localhost:3001/api/ave/health

# Process voice input
curl -X POST http://localhost:3001/api/ave/assistant/process \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I want to order an Ayurvedic Thali",
    "callId": "TEST_CALL_001",
    "sessionId": "TEST_SESSION_001"
  }'
```

### Step 5: Integrate with Android App

1. Connect Android app via Wi-Fi/Bluetooth
2. Send audio stream to `/api/ave/call/:callId/transcribe`
3. Receive transcription and process via `/api/ave/assistant/process`
4. Get audio response from `/api/ave/call/:callId/speak`
5. Play audio response on Android device

---

## Testing

### Unit Tests

```bash
npm run test:ave
```

### Integration Tests

```bash
npm run test:ave:integration
```

### Test Scenarios

1. **Order Flow Test**
   - Input: "I want to order 2 Ayurvedic Thalis"
   - Expected: Order created with 2 items, total ₹500

2. **Reservation Flow Test**
   - Input: "Book a table for 4 people tomorrow at 7 PM"
   - Expected: Reservation created with date, time, party size

3. **Multi-Language Test**
   - Input: "मुझे एक थाली चाहिए" (Hindi)
   - Expected: Intent recognized, response in Hindi

---

## Deployment

### Production Checklist

- [ ] Configure production database (MongoDB)
- [ ] Set up SMS service (Twilio/AWS SNS)
- [ ] Configure speech services (Google Cloud/AWS)
- [ ] Set up monitoring (Datadog/New Relic)
- [ ] Configure load balancer
- [ ] Set up SSL certificates
- [ ] Enable logging and error tracking
- [ ] Configure backup and recovery
- [ ] Set up CI/CD pipeline
- [ ] Perform load testing

### Deployment Commands

```bash
# Build production
npm run build

# Start production server
npm run start:prod

# Run with PM2
pm2 start ecosystem.config.js
```

---

## Support

For issues or questions:
- GitHub: https://github.com/projectai397/aans-sakshi-cafe-platform
- Documentation: See MASTER_INDEX.md

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Status**: Production Ready
