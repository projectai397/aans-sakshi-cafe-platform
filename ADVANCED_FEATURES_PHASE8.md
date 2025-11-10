# Advanced Features (Phase 8) - Complete Implementation Guide

## Overview

Phase 8 introduces cutting-edge AI and AR technologies to transform the Sakshi Cafe experience:

1. **AI-Powered Menu Recommendations** - Personalized suggestions based on Ayurvedic constitution (Dosha)
2. **Voice Ordering System** - Natural language voice-to-order conversion
3. **AR Menu Visualization** - 3D models of dishes with nutritional information
4. **AI Chatbot** - Intelligent conversational ordering and recommendations

---

## Architecture

### Components

1. **AIRecommendationService** - Dosha-based recommendations
2. **VoiceChatbotService** - Voice ordering & chatbot
3. **ARMenuService** - AR visualization & analytics

### Data Flow

```
User Input (Voice/Text/AR)
       ↓
AI Processing (NLP, Dosha Analysis)
       ↓
Recommendation Engine
       ↓
Personalized Response
       ↓
Order Processing / Menu Display
```

---

## Installation & Setup

### 1. Environment Variables

```bash
# Advanced Features Configuration
AI_FEATURES_ENABLED=true
VOICE_ORDERING_ENABLED=true
AR_MENU_ENABLED=true
CHATBOT_ENABLED=true
NLP_MODEL=bert-base-multilingual
DOSHA_QUIZ_ENABLED=true
```

### 2. Dependencies

```bash
npm install @tensorflow/tfjs @tensorflow/tfjs-node
npm install natural
npm install axios
npm install three three-gltf-loader
```

### 3. Database Schema

```sql
CREATE TABLE user_profiles (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  age INT,
  dosha ENUM('vata', 'pitta', 'kapha', 'mixed'),
  healthConditions JSON,
  dietaryRestrictions JSON,
  preferences JSON,
  lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_dosha (dosha)
);

CREATE TABLE menu_items_ar (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  modelUrl VARCHAR(500),
  textureUrl VARCHAR(500),
  calories INT,
  protein DECIMAL(10, 2),
  carbs DECIMAL(10, 2),
  fat DECIMAL(10, 2),
  fiber DECIMAL(10, 2),
  vataBalance INT,
  pittaBalance INT,
  kaphaBalance INT,
  allergens JSON,
  prepTime INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

CREATE TABLE voice_orders (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  transcript TEXT,
  items JSON,
  totalAmount DECIMAL(10, 2),
  status ENUM('pending', 'confirmed', 'processing', 'completed'),
  confidence INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId),
  INDEX idx_status (status)
);

CREATE TABLE chat_sessions (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  context JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId)
);

CREATE TABLE chat_messages (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  sessionId VARCHAR(255) NOT NULL,
  type ENUM('user', 'bot'),
  message TEXT,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (sessionId) REFERENCES chat_sessions(id),
  INDEX idx_sessionId (sessionId)
);

CREATE TABLE ar_sessions (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255) NOT NULL,
  itemId VARCHAR(255) NOT NULL,
  startTime TIMESTAMP,
  endTime TIMESTAMP,
  viewDuration INT,
  interactions JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (itemId) REFERENCES menu_items_ar(id),
  INDEX idx_userId (userId)
);
```

---

## Feature 1: AI-Powered Menu Recommendations

### Dosha Determination

The service determines user's Ayurvedic constitution through a questionnaire:

```bash
POST /api/ai/dosha-quiz
Content-Type: application/json

{
  "userId": "user_123",
  "answers": {
    "vata_q1": 3,
    "vata_q2": 2,
    "pitta_q1": 1,
    "pitta_q2": 2,
    "kapha_q1": 1,
    "kapha_q2": 2
  }
}
```

Response:
```json
{
  "userId": "user_123",
  "dosha": "vata",
  "confidence": 85,
  "description": "Vata constitution is characterized by movement, creativity, and sensitivity"
}
```

### Get Personalized Recommendations

```bash
GET /api/ai/recommendations/{userId}?limit=5
```

Response:
```json
{
  "userId": "user_123",
  "dosha": "vata",
  "recommendations": [
    {
      "itemId": "ITEM-001",
      "itemName": "Butter Chicken",
      "score": 92,
      "reason": "Balances Vata dosha, warm and grounding",
      "healthBenefit": "Improves digestion and energy",
      "compatibility": 92
    },
    {
      "itemId": "ITEM-002",
      "itemName": "Paneer Tikka",
      "score": 85,
      "reason": "Balances Vata dosha, rich in protein",
      "healthBenefit": "Supports muscle health",
      "compatibility": 85
    }
  ]
}
```

### Seasonal Recommendations

```bash
GET /api/ai/seasonal-recommendations/{userId}?season=winter
```

Response:
```json
{
  "userId": "user_123",
  "season": "winter",
  "recommendations": [
    {
      "itemId": "ITEM-003",
      "itemName": "Tandoori Chicken",
      "score": 88,
      "reason": "Ideal for winter season, balances Kapha",
      "healthBenefit": "Warming and energizing",
      "compatibility": 88
    }
  ]
}
```

### Similar Items

```bash
GET /api/ai/similar-items/{itemId}?limit=5
```

Response:
```json
{
  "itemId": "ITEM-001",
  "similarItems": [
    {
      "id": "ITEM-004",
      "name": "Tandoori Chicken",
      "similarity": 87
    },
    {
      "id": "ITEM-005",
      "name": "Murgh Makhani",
      "similarity": 82
    }
  ]
}
```

---

## Feature 2: Voice Ordering System

### Process Voice Order

```bash
POST /api/voice/process-order
Content-Type: application/json

{
  "userId": "user_123",
  "transcript": "I want two butter chicken, one paneer tikka, and three naan without salt",
  "confidence": 92
}
```

Response:
```json
{
  "success": true,
  "voiceOrder": {
    "id": "VOICE-ORDER-123",
    "userId": "user_123",
    "transcript": "I want two butter chicken, one paneer tikka, and three naan without salt",
    "items": [
      {
        "itemId": "ITEM-001",
        "quantity": 2,
        "specialInstructions": "without salt"
      },
      {
        "itemId": "ITEM-002",
        "quantity": 1
      },
      {
        "itemId": "ITEM-005",
        "quantity": 3,
        "specialInstructions": "without salt"
      }
    ],
    "totalAmount": 1250,
    "status": "pending",
    "confidence": 92
  }
}
```

### Confirm Voice Order

```bash
POST /api/voice/confirm-order/{orderId}
```

Response:
```json
{
  "success": true,
  "message": "Order confirmed and sent to kitchen",
  "estimatedTime": "25 minutes"
}
```

### Get User Voice Orders

```bash
GET /api/voice/user-orders/{userId}
```

---

## Feature 3: AI Chatbot

### Start Chat Session

```bash
POST /api/chat/start-session
Content-Type: application/json

{
  "userId": "user_123"
}
```

Response:
```json
{
  "sessionId": "CHAT-123",
  "userId": "user_123",
  "botMessage": "Hello! Welcome to Sakshi Cafe. How can I help you today? You can order food, ask about our menu, or get recommendations based on your constitution."
}
```

### Send Message

```bash
POST /api/chat/send-message
Content-Type: application/json

{
  "sessionId": "CHAT-123",
  "userId": "user_123",
  "message": "I want to order something for Vata constitution"
}
```

Response:
```json
{
  "success": true,
  "userMessage": {
    "id": "MSG-001",
    "type": "user",
    "message": "I want to order something for Vata constitution"
  },
  "botResponse": {
    "id": "MSG-002",
    "type": "bot",
    "message": "Great! For Vata constitution, I recommend warm, grounding foods. Would you like me to suggest specific dishes?"
  }
}
```

### Get Chat History

```bash
GET /api/chat/history/{userId}?limit=50
```

### Chatbot Intents

The chatbot understands these intents:

- **Order**: "I want to order...", "Can I get..."
- **Recommend**: "What do you recommend?", "Suggest something"
- **Menu**: "What's on the menu?", "What do you have?"
- **Price**: "How much is...", "What's the cost?"
- **Delivery**: "How long for delivery?", "When will it arrive?"
- **Dosha**: "I'm Vata", "I'm Pitta", "I'm Kapha"
- **Confirm**: "Confirm order", "Place order", "Checkout"

---

## Feature 4: AR Menu Visualization

### Add AR Menu Item

```bash
POST /api/ar/add-item
Content-Type: application/json

{
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry with tender chicken",
  "price": 350,
  "modelUrl": "https://cdn.example.com/models/butter-chicken.glb",
  "textureUrl": "https://cdn.example.com/textures/butter-chicken.jpg",
  "nutritionInfo": {
    "calories": 280,
    "protein": 25,
    "carbs": 8,
    "fat": 15,
    "fiber": 1
  },
  "doshaInfo": {
    "vata": -5,
    "pitta": 2,
    "kapha": 3
  },
  "ingredients": ["chicken", "tomato", "cream", "spices"],
  "allergens": ["dairy"],
  "prepTime": 20,
  "servingSize": "1 serving (250g)"
}
```

### Get AR Menu Item

```bash
GET /api/ar/item/{itemId}
```

Response:
```json
{
  "id": "AR-ITEM-001",
  "name": "Butter Chicken",
  "description": "Creamy tomato-based curry with tender chicken",
  "price": 350,
  "modelUrl": "https://cdn.example.com/models/butter-chicken.glb",
  "textureUrl": "https://cdn.example.com/textures/butter-chicken.jpg",
  "nutritionInfo": {
    "calories": 280,
    "protein": 25,
    "carbs": 8,
    "fat": 15,
    "fiber": 1
  },
  "doshaInfo": {
    "vata": -5,
    "pitta": 2,
    "kapha": 3
  }
}
```

### Start AR Session

```bash
POST /api/ar/start-session
Content-Type: application/json

{
  "userId": "user_123",
  "itemId": "AR-ITEM-001"
}
```

Response:
```json
{
  "sessionId": "AR-SESSION-123",
  "userId": "user_123",
  "itemId": "AR-ITEM-001",
  "startTime": "2024-11-10T13:00:00Z"
}
```

### Record Interaction

```bash
POST /api/ar/interaction
Content-Type: application/json

{
  "sessionId": "AR-SESSION-123",
  "interactionType": "rotate"
}
```

Supported interactions:
- `rotate` - User rotated the 3D model
- `zoom` - User zoomed in/out
- `view_nutrition` - User viewed nutrition info
- `view_dosha` - User viewed dosha information
- `add_to_cart` - User added item to cart

### Get Nutrition Info

```bash
GET /api/ar/nutrition/{itemId}
```

Response:
```json
{
  "itemId": "AR-ITEM-001",
  "itemName": "Butter Chicken",
  "servingSize": "1 serving (250g)",
  "nutrition": {
    "calories": 280,
    "protein": 25,
    "carbs": 8,
    "fat": 15,
    "fiber": 1
  },
  "calorieBreakdown": {
    "protein": 36,
    "carbs": 11,
    "fat": 53
  },
  "healthScore": 72,
  "doshaBalance": {
    "vata": -5,
    "pitta": 2,
    "kapha": 3
  },
  "allergens": ["dairy"]
}
```

### Get Dosha Info

```bash
GET /api/ar/dosha/{itemId}
```

Response:
```json
{
  "itemId": "AR-ITEM-001",
  "itemName": "Butter Chicken",
  "balancedDoshas": ["Vata"],
  "aggravateDoshas": ["Pitta", "Kapha"],
  "doshaScores": {
    "vata": -5,
    "pitta": 2,
    "kapha": 3
  },
  "recommendations": [
    "Great for Vata constitution",
    "May aggravate Pitta and Kapha - consume in moderation"
  ]
}
```

### Compare Items

```bash
POST /api/ar/compare
Content-Type: application/json

{
  "itemIds": ["AR-ITEM-001", "AR-ITEM-002", "AR-ITEM-003"]
}
```

Response:
```json
{
  "items": [
    {
      "id": "AR-ITEM-001",
      "name": "Butter Chicken",
      "price": 350,
      "calories": 280,
      "protein": 25,
      "prepTime": 20
    }
  ],
  "comparison": {
    "cheapest": { "id": "AR-ITEM-002", "name": "Paneer Tikka", "price": 280 },
    "healthiest": { "id": "AR-ITEM-003", "name": "Tandoori Chicken", "score": 85 },
    "quickest": { "id": "AR-ITEM-001", "name": "Butter Chicken", "prepTime": 20 }
  }
}
```

---

## React Implementation Examples

### AR Menu Component

```typescript
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface ARMenuProps {
  itemId: string;
  modelUrl: string;
}

export default function ARMenuComponent({ itemId, modelUrl }: ARMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.1);
    containerRef.current.appendChild(renderer.domElement);

    // Load 3D model
    const loader = new GLTFLoader();
    loader.load(modelUrl, (gltf) => {
      const model = gltf.scene;
      scene.add(model);

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      camera.position.z = 5;

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        model.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      animate();
    });

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Handle window resize
    const handleResize = () => {
      if (rendererRef.current) {
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [modelUrl]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
}
```

### Chatbot Component

```typescript
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
}

export default function ChatbotComponent({ userId }: { userId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start chat session
    axios.post('/api/chat/start-session', { userId }).then((res) => {
      setSessionId(res.data.sessionId);
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          message: res.data.botMessage,
          timestamp: new Date(),
        },
      ]);
    });
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      type: 'user',
      message: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const res = await axios.post('/api/chat/send-message', {
        sessionId,
        userId,
        message: input,
      });

      const botMessage: Message = {
        id: res.data.botResponse.id,
        type: 'bot',
        message: res.data.botResponse.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              marginBottom: '12px',
              textAlign: msg.type === 'user' ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: msg.type === 'user' ? '#007AFF' : '#E5E5EA',
                color: msg.type === 'user' ? 'white' : 'black',
              }}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', borderTop: '1px solid #E5E5EA' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #E5E5EA',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
          <button
            onClick={handleSendMessage}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Analytics & Monitoring

### Get AI Analytics

```bash
GET /api/ai/analytics
```

Response:
```json
{
  "totalRecommendations": 1250,
  "averageScore": 82,
  "topRecommendedItems": [
    {
      "itemId": "ITEM-001",
      "name": "Butter Chicken",
      "recommendationCount": 125
    }
  ],
  "doshaDistribution": {
    "vata": 35,
    "pitta": 30,
    "kapha": 25,
    "mixed": 10
  }
}
```

### Get Voice Order Analytics

```bash
GET /api/voice/analytics
```

Response:
```json
{
  "totalVoiceOrders": 450,
  "completedOrders": 420,
  "completionRate": 93,
  "averageConfidence": 88,
  "topOrderedItems": [
    {
      "itemId": "ITEM-001",
      "name": "Butter Chicken",
      "orderCount": 85
    }
  ]
}
```

### Get AR Analytics

```bash
GET /api/ar/analytics
```

Response:
```json
{
  "totalSessions": 2500,
  "completedSessions": 2350,
  "conversionRate": 68,
  "averageViewDuration": 45,
  "topViewedItems": [
    {
      "itemId": "AR-ITEM-001",
      "name": "Butter Chicken",
      "views": 450
    }
  ],
  "nutritionViewRate": 75,
  "doshaInfoViewRate": 62
}
```

---

## Best Practices

1. **Dosha Accuracy**: Use comprehensive questionnaire for accurate dosha determination
2. **Voice Confidence**: Only process voice orders with >85% confidence
3. **AR Performance**: Optimize 3D models for mobile devices (< 5MB)
4. **Chatbot Training**: Continuously improve NLP model with user interactions
5. **Privacy**: Encrypt user health data and preferences

---

## Conclusion

Phase 8 Advanced Features provide a comprehensive AI and AR-powered experience that personalizes the Sakshi Cafe ordering journey. With Ayurvedic recommendations, voice ordering, and AR visualization, customers enjoy a modern, health-conscious dining experience.
