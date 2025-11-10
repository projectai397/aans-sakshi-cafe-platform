/**
 * Voice Ordering & AI Chatbot Service
 * Handles voice-to-text conversion, natural language processing, and chatbot responses
 */

interface VoiceOrder {
  id: string;
  userId: string;
  transcript: string;
  items: Array<{ itemId: string; quantity: number; specialInstructions?: string }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed';
  confidence: number; // 0-100
  createdAt: Date;
}

interface ChatMessage {
  id: string;
  userId: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  metadata?: any;
}

interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class VoiceChatbotService {
  private voiceOrders: Map<string, VoiceOrder> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private chatHistory: Map<string, ChatMessage[]> = new Map();

  /**
   * Voice Order Processing
   */

  async processVoiceOrder(userId: string, transcript: string, confidence: number): Promise<VoiceOrder> {
    const id = `VOICE-ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Parse transcript to extract items
    const items = this.parseOrderTranscript(transcript);

    // Calculate total (placeholder - should integrate with menu service)
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * 250, 0); // Assuming ₹250 per item

    const voiceOrder: VoiceOrder = {
      id,
      userId,
      transcript,
      items,
      totalAmount,
      status: 'pending',
      confidence,
      createdAt: new Date(),
    };

    this.voiceOrders.set(id, voiceOrder);
    return voiceOrder;
  }

  private parseOrderTranscript(transcript: string): Array<{ itemId: string; quantity: number; specialInstructions?: string }> {
    // Simplified parsing - in production, use NLP library like spaCy or BERT
    const items: Array<{ itemId: string; quantity: number; specialInstructions?: string }> = [];

    // Common menu items (simplified)
    const menuKeywords: Record<string, string> = {
      'butter chicken': 'ITEM-001',
      'paneer tikka': 'ITEM-002',
      'tandoori chicken': 'ITEM-003',
      biryani: 'ITEM-004',
      naan: 'ITEM-005',
      'garlic bread': 'ITEM-006',
      samosa: 'ITEM-007',
      'gulab jamun': 'ITEM-008',
    };

    const lowerTranscript = transcript.toLowerCase();

    // Extract quantities
    const quantityPattern = /(\d+)\s+(butter chicken|paneer tikka|tandoori chicken|biryani|naan|garlic bread|samosa|gulab jamun)/gi;
    let match;

    while ((match = quantityPattern.exec(lowerTranscript)) !== null) {
      const quantity = parseInt(match[1]);
      const itemName = match[2].toLowerCase();
      const itemId = menuKeywords[itemName];

      if (itemId) {
        items.push({
          itemId,
          quantity,
        });
      }
    }

    // Extract special instructions
    const specialInstructionsPattern = /(?:without|extra|more|less|spicy|mild|no)\s+(\w+)/gi;
    while ((match = specialInstructionsPattern.exec(lowerTranscript)) !== null) {
      if (items.length > 0) {
        items[items.length - 1].specialInstructions = match[1];
      }
    }

    return items;
  }

  async confirmVoiceOrder(orderId: string): Promise<VoiceOrder | null> {
    const order = this.voiceOrders.get(orderId);
    if (!order) return null;

    order.status = 'confirmed';
    this.voiceOrders.set(orderId, order);
    return order;
  }

  async getVoiceOrder(orderId: string): Promise<VoiceOrder | null> {
    return this.voiceOrders.get(orderId) || null;
  }

  async getUserVoiceOrders(userId: string): Promise<VoiceOrder[]> {
    return Array.from(this.voiceOrders.values()).filter((o) => o.userId === userId);
  }

  /**
   * Chatbot Conversation
   */

  async startChatSession(userId: string): Promise<ChatSession> {
    const sessionId = `CHAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: ChatSession = {
      id: sessionId,
      userId,
      messages: [],
      context: {
        orderInProgress: false,
        currentOrder: [],
        userPreferences: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.chatSessions.set(sessionId, session);
    this.chatHistory.set(userId, []);

    // Send welcome message
    const welcomeMessage = await this.sendBotMessage(userId, sessionId, 'Hello! Welcome to Sakshi Cafe. How can I help you today? You can order food, ask about our menu, or get recommendations based on your constitution.');

    return session;
  }

  async sendUserMessage(userId: string, sessionId: string, message: string): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'user',
      message,
      timestamp: new Date(),
    };

    // Store message
    if (!this.chatHistory.has(userId)) {
      this.chatHistory.set(userId, []);
    }
    this.chatHistory.get(userId)!.push(userMessage);

    const session = this.chatSessions.get(sessionId);
    if (session) {
      session.messages.push(userMessage);
      session.updatedAt = new Date();
    }

    // Generate bot response
    const botResponse = await this.generateBotResponse(userId, sessionId, message);
    await this.sendBotMessage(userId, sessionId, botResponse);

    return userMessage;
  }

  private async sendBotMessage(userId: string, sessionId: string, message: string): Promise<ChatMessage> {
    const botMessage: ChatMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'bot',
      message,
      timestamp: new Date(),
    };

    // Store message
    if (!this.chatHistory.has(userId)) {
      this.chatHistory.set(userId, []);
    }
    this.chatHistory.get(userId)!.push(botMessage);

    const session = this.chatSessions.get(sessionId);
    if (session) {
      session.messages.push(botMessage);
      session.updatedAt = new Date();
    }

    return botMessage;
  }

  private async generateBotResponse(userId: string, sessionId: string, userMessage: string): Promise<string> {
    const session = this.chatSessions.get(sessionId);
    if (!session) return 'I apologize, but I cannot process your request at this time.';

    const lowerMessage = userMessage.toLowerCase();

    // Intent detection
    if (lowerMessage.includes('order') || lowerMessage.includes('want') || lowerMessage.includes('like')) {
      session.context.orderInProgress = true;
      return 'Great! What would you like to order? You can say items like "butter chicken", "paneer tikka", "biryani", etc.';
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('best')) {
      return 'I can recommend dishes based on your Ayurvedic constitution. What is your dosha? (Vata, Pitta, or Kapha)';
    }

    if (lowerMessage.includes('menu') || lowerMessage.includes('what do you have')) {
      return 'We offer a variety of Ayurvedic dishes including Butter Chicken, Paneer Tikka, Tandoori Chicken, Biryani, and more. Would you like recommendations based on your constitution?';
    }

    if (lowerMessage.includes('vata') || lowerMessage.includes('pitta') || lowerMessage.includes('kapha')) {
      const dosha = lowerMessage.includes('vata') ? 'Vata' : lowerMessage.includes('pitta') ? 'Pitta' : 'Kapha';
      return `Great! For ${dosha} constitution, I recommend warm, grounding foods. Would you like me to suggest specific dishes?`;
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return 'Most of our main dishes are around ₹300-400. Would you like to know the price of a specific item?';
    }

    if (lowerMessage.includes('delivery') || lowerMessage.includes('how long')) {
      return 'We offer delivery within 30-45 minutes depending on your location. Where would you like the order delivered?';
    }

    if (lowerMessage.includes('confirm') || lowerMessage.includes('place order') || lowerMessage.includes('checkout')) {
      if (session.context.currentOrder.length > 0) {
        const totalItems = session.context.currentOrder.reduce((sum: number, item: any) => sum + item.quantity, 0);
        return `Perfect! You have ${totalItems} items in your order. Should I proceed with the order?`;
      }
      return 'You haven\'t added any items yet. What would you like to order?';
    }

    if (lowerMessage.includes('yes') || lowerMessage.includes('confirm') || lowerMessage.includes('proceed')) {
      return 'Your order has been placed successfully! You can track it in the app. Is there anything else I can help you with?';
    }

    if (lowerMessage.includes('no') || lowerMessage.includes('cancel')) {
      session.context.orderInProgress = false;
      session.context.currentOrder = [];
      return 'No problem. What else can I help you with?';
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return 'You\'re welcome! Feel free to order anytime. Have a great day!';
    }

    // Default response
    return 'I didn\'t quite understand that. You can ask me to recommend dishes, place an order, or check our menu. How can I help?';
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    const history = this.chatHistory.get(userId) || [];
    return history.slice(-limit);
  }

  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    return this.chatSessions.get(sessionId) || null;
  }

  /**
   * Analytics
   */

  async getChatbotStats(): Promise<any> {
    const totalSessions = this.chatSessions.size;
    const totalMessages = Array.from(this.chatHistory.values()).reduce((sum, msgs) => sum + msgs.length, 0);
    const totalVoiceOrders = this.voiceOrders.size;
    const completedOrders = Array.from(this.voiceOrders.values()).filter((o) => o.status === 'completed').length;

    return {
      totalSessions,
      totalMessages,
      averageMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
      totalVoiceOrders,
      completedOrders,
      completionRate: totalVoiceOrders > 0 ? Math.round((completedOrders / totalVoiceOrders) * 100) : 0,
      timestamp: new Date(),
    };
  }

  async getUserChatStats(userId: string): Promise<any> {
    const userMessages = this.chatHistory.get(userId) || [];
    const userOrders = Array.from(this.voiceOrders.values()).filter((o) => o.userId === userId);

    return {
      userId,
      totalMessages: userMessages.length,
      totalVoiceOrders: userOrders.length,
      completedOrders: userOrders.filter((o) => o.status === 'completed').length,
      lastInteraction: userMessages.length > 0 ? userMessages[userMessages.length - 1].timestamp : null,
    };
  }
}

export default VoiceChatbotService;
