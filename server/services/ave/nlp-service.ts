/**
 * AVE NLP Service
 * Natural Language Processing for intent recognition and entity extraction
 * Uses local AI runtime (no external APIs)
 */

export enum Intent {
  ORDER_FOOD = 'order_food',
  MAKE_RESERVATION = 'make_reservation',
  CHECK_MENU = 'check_menu',
  CHECK_STATUS = 'check_status',
  MODIFY_ORDER = 'modify_order',
  CANCEL_ORDER = 'cancel_order',
  COMPLAINT = 'complaint',
  GENERAL_INQUIRY = 'general_inquiry',
  GREETING = 'greeting',
  GOODBYE = 'goodbye',
  UNKNOWN = 'unknown',
}

export interface IntentResult {
  intent: Intent;
  confidence: number;
  entities: Entity[];
  context?: any;
}

export interface Entity {
  type: EntityType;
  value: string;
  confidence: number;
  raw?: string;
}

export enum EntityType {
  MENU_ITEM = 'menu_item',
  QUANTITY = 'quantity',
  DATE = 'date',
  TIME = 'time',
  PHONE_NUMBER = 'phone_number',
  NAME = 'name',
  LOCATION = 'location',
  PARTY_SIZE = 'party_size',
  ORDER_ID = 'order_id',
  DIETARY_PREFERENCE = 'dietary_preference',
}

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  currentIntent?: Intent;
  entities: Entity[];
  conversationHistory: Message[];
  userPreferences?: any;
  previousOrders?: any[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * NLP Service Class
 * Handles natural language understanding and response generation
 */
export class NLPService {
  private contexts: Map<string, ConversationContext> = new Map();

  // Intent patterns for simple rule-based matching
  private intentPatterns: Map<Intent, RegExp[]> = new Map([
    [
      Intent.ORDER_FOOD,
      [
        /\b(order|want|need|get|buy)\b.*\b(food|meal|dish|thali|biryani|curry)\b/i,
        /\b(i would like|i'd like|can i have|may i have)\b/i,
        /\b(hungry|eat|lunch|dinner|breakfast)\b/i,
      ],
    ],
    [
      Intent.MAKE_RESERVATION,
      [
        /\b(book|reserve|reservation|table)\b/i,
        /\b(book a table|make a reservation)\b/i,
        /\b(table for|reservation for)\b.*\b(people|persons|guests)\b/i,
      ],
    ],
    [
      Intent.CHECK_MENU,
      [
        /\b(menu|what do you have|what's available|special|today's special)\b/i,
        /\b(show me|tell me|what are)\b.*\b(dishes|items|options)\b/i,
      ],
    ],
    [
      Intent.CHECK_STATUS,
      [
        /\b(status|where is|track|check)\b.*\b(order|delivery)\b/i,
        /\b(my order|order status)\b/i,
      ],
    ],
    [
      Intent.MODIFY_ORDER,
      [
        /\b(change|modify|update|edit)\b.*\b(order)\b/i,
        /\b(add|remove)\b.*\b(item|dish)\b/i,
      ],
    ],
    [
      Intent.CANCEL_ORDER,
      [
        /\b(cancel|delete|remove)\b.*\b(order|reservation)\b/i,
      ],
    ],
    [
      Intent.COMPLAINT,
      [
        /\b(complaint|problem|issue|wrong|bad|terrible|disappointed)\b/i,
        /\b(not happy|not satisfied)\b/i,
      ],
    ],
    [
      Intent.GREETING,
      [
        /\b(hello|hi|hey|namaste|good morning|good afternoon|good evening)\b/i,
      ],
    ],
    [
      Intent.GOODBYE,
      [
        /\b(bye|goodbye|thank you|thanks|that's all)\b/i,
      ],
    ],
  ]);

  // Menu items dictionary for entity extraction
  private menuItems = [
    'ayurvedic thali',
    'vata balance bowl',
    'pitta cooling salad',
    'kapha warming curry',
    'premium biryani',
    'masala dosa',
    'idli sambar',
    'dosha smoothie',
  ];

  /**
   * Analyze intent from text
   */
  async analyzeIntent(text: string, sessionId: string): Promise<IntentResult> {
    console.log(`[AVE NLP] Analyzing intent: "${text}"`);

    const normalizedText = text.toLowerCase().trim();

    // Find matching intent
    let detectedIntent = Intent.UNKNOWN;
    let maxConfidence = 0;

    for (const [intent, patterns] of this.intentPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          detectedIntent = intent;
          maxConfidence = 0.85; // High confidence for pattern match
          break;
        }
      }
      if (detectedIntent !== Intent.UNKNOWN) break;
    }

    // Extract entities
    const entities = await this.extractEntities(text);

    // Get or create context
    const context = this.getContext(sessionId);
    context.currentIntent = detectedIntent;
    context.entities.push(...entities);
    context.conversationHistory.push({
      role: 'user',
      content: text,
      timestamp: new Date(),
    });

    const result: IntentResult = {
      intent: detectedIntent,
      confidence: maxConfidence,
      entities,
      context,
    };

    console.log(`[AVE NLP] Intent: ${detectedIntent}, Confidence: ${maxConfidence}`);
    return result;
  }

  /**
   * Extract entities from text
   */
  async extractEntities(text: string): Promise<Entity[]> {
    const entities: Entity[] = [];
    const normalizedText = text.toLowerCase();

    // Extract menu items
    for (const item of this.menuItems) {
      if (normalizedText.includes(item)) {
        entities.push({
          type: EntityType.MENU_ITEM,
          value: item,
          confidence: 0.9,
          raw: item,
        });
      }
    }

    // Extract quantities
    const quantityMatch = normalizedText.match(/\b(\d+|one|two|three|four|five)\b/);
    if (quantityMatch) {
      const quantityMap: Record<string, string> = {
        one: '1',
        two: '2',
        three: '3',
        four: '4',
        five: '5',
      };
      const quantity = quantityMap[quantityMatch[1]] || quantityMatch[1];
      entities.push({
        type: EntityType.QUANTITY,
        value: quantity,
        confidence: 0.85,
        raw: quantityMatch[1],
      });
    }

    // Extract phone numbers
    const phoneMatch = text.match(/\b(\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b/);
    if (phoneMatch) {
      entities.push({
        type: EntityType.PHONE_NUMBER,
        value: phoneMatch[1].replace(/[-.\s]/g, ''),
        confidence: 0.95,
        raw: phoneMatch[1],
      });
    }

    // Extract dates (simple patterns)
    const datePatterns = [
      /\b(today|tomorrow|tonight)\b/i,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        entities.push({
          type: EntityType.DATE,
          value: match[0],
          confidence: 0.8,
          raw: match[0],
        });
        break;
      }
    }

    // Extract time
    const timeMatch = text.match(/\b(\d{1,2})\s*(am|pm|o'clock)\b/i);
    if (timeMatch) {
      entities.push({
        type: EntityType.TIME,
        value: timeMatch[0],
        confidence: 0.85,
        raw: timeMatch[0],
      });
    }

    // Extract party size for reservations
    const partySizeMatch = text.match(/\b(for|table for)\s+(\d+|one|two|three|four|five|six)\s+(people|persons|guests)\b/i);
    if (partySizeMatch) {
      const sizeMap: Record<string, string> = {
        one: '1',
        two: '2',
        three: '3',
        four: '4',
        five: '5',
        six: '6',
      };
      const size = sizeMap[partySizeMatch[2].toLowerCase()] || partySizeMatch[2];
      entities.push({
        type: EntityType.PARTY_SIZE,
        value: size,
        confidence: 0.9,
        raw: partySizeMatch[0],
      });
    }

    console.log(`[AVE NLP] Extracted ${entities.length} entities`);
    return entities;
  }

  /**
   * Generate response based on intent and context
   */
  async generateResponse(intentResult: IntentResult): Promise<string> {
    const { intent, entities, context } = intentResult;

    let response = '';

    switch (intent) {
      case Intent.GREETING:
        response = 'Namaste! Welcome to Sakshi Cafe. How can I help you today?';
        break;

      case Intent.ORDER_FOOD:
        const menuItem = entities.find((e) => e.type === EntityType.MENU_ITEM);
        const quantity = entities.find((e) => e.type === EntityType.QUANTITY);

        if (menuItem && quantity) {
          response = `Great! I've added ${quantity.value} ${menuItem.value} to your order. Would you like to add anything else?`;
        } else if (menuItem) {
          response = `How many ${menuItem.value} would you like to order?`;
        } else {
          response = 'What would you like to order? We have Ayurvedic Thali, Vata Balance Bowl, Premium Biryani, and more.';
        }
        break;

      case Intent.MAKE_RESERVATION:
        const date = entities.find((e) => e.type === EntityType.DATE);
        const time = entities.find((e) => e.type === EntityType.TIME);
        const partySize = entities.find((e) => e.type === EntityType.PARTY_SIZE);

        if (date && time && partySize) {
          response = `Perfect! I'm booking a table for ${partySize.value} people on ${date.value} at ${time.value}. May I have your name and phone number?`;
        } else {
          const missing = [];
          if (!date) missing.push('date');
          if (!time) missing.push('time');
          if (!partySize) missing.push('number of guests');
          response = `I'd be happy to help you with a reservation. Could you please provide the ${missing.join(', ')}?`;
        }
        break;

      case Intent.CHECK_MENU:
        response = 'Our menu includes Ayurvedic Thali, Vata Balance Bowl, Pitta Cooling Salad, Kapha Warming Curry, Premium Biryani, and more. What would you like to know more about?';
        break;

      case Intent.CHECK_STATUS:
        response = 'I can help you check your order status. Could you please provide your order ID or phone number?';
        break;

      case Intent.MODIFY_ORDER:
        response = 'I can help you modify your order. What changes would you like to make?';
        break;

      case Intent.CANCEL_ORDER:
        response = 'I understand you want to cancel. Could you please provide your order ID?';
        break;

      case Intent.COMPLAINT:
        response = 'I'm sorry to hear you're having an issue. Let me transfer you to our manager who can help you better.';
        break;

      case Intent.GOODBYE:
        response = 'Thank you for calling Sakshi Cafe! Have a wonderful day. Namaste!';
        break;

      default:
        response = 'I'm sorry, I didn't quite understand that. Could you please rephrase?';
    }

    // Add response to conversation history
    if (context) {
      context.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });
    }

    return response;
  }

  /**
   * Get or create conversation context
   */
  getContext(sessionId: string): ConversationContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        entities: [],
        conversationHistory: [],
      });
    }
    return this.contexts.get(sessionId)!;
  }

  /**
   * Update conversation context
   */
  updateContext(sessionId: string, data: Partial<ConversationContext>): void {
    const context = this.getContext(sessionId);
    Object.assign(context, data);
  }

  /**
   * Clear conversation context
   */
  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  /**
   * Get all active contexts
   */
  getActiveContexts(): number {
    return this.contexts.size;
  }
}

// Export singleton instance
export const nlpService = new NLPService();
