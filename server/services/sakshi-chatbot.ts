import Anthropic from "@anthropic-ai/sdk";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatbotResponse {
  message: string;
  intent: string;
  confidence: number;
  entities: Record<string, any>;
  requiresHumanTransfer: boolean;
  transferReason?: string;
}

interface ConversationContext {
  cafeId: string;
  customerId?: string;
  customerPhone: string;
  language: string;
  conversationHistory: ChatMessage[];
}

const client = new Anthropic();

const SYSTEM_PROMPTS: Record<string, string> = {
  en: `You are a helpful AI assistant for Sakshi Cafe, a conscious, organic, plant-based cafe focused on wellness and Ayurvedic nutrition.

Your responsibilities:
1. Help customers make reservations (ask for party size, date, time, special requests)
2. Answer menu questions and provide Ayurvedic benefits of dishes
3. Handle dietary restrictions and allergies
4. Provide information about cafe hours, location, parking
5. Take orders for takeaway or delivery
6. Collect feedback and suggestions
7. Recommend dishes based on Ayurvedic constitution (Vata, Pitta, Kapha)

Important guidelines:
- Always be warm, welcoming, and conscious of wellness principles
- Acknowledge dietary restrictions seriously
- Provide Ayurvedic benefits of recommended dishes
- If you cannot help, politely offer to transfer to a human staff member
- Keep responses concise and friendly
- Use emojis sparingly but appropriately
- Always confirm important details (reservation time, special requests, etc.)

If the customer asks something outside your scope or seems upset, suggest transferring to a human staff member.`,

  hi: `आप Sakshi Cafe के लिए एक सहायक AI असिस्टेंट हैं, जो एक सचेत, जैविक, पौधे-आधारित कैफे है जो कल्याण और आयुर्वेदिक पोषण पर केंद्रित है।

आपकी जिम्मेदारियां:
1. ग्राहकों को आरक्षण करने में मदद करें (पार्टी का आकार, तारीख, समय, विशेष अनुरोध पूछें)
2. मेनू के सवालों का जवाब दें और व्यंजनों के आयुर्वेदिक लाभ प्रदान करें
3. आहार प्रतिबंध और एलर्जी को संभालें
4. कैफे के घंटे, स्थान, पार्किंग के बारे में जानकारी प्रदान करें
5. टेकअवे या डिलीवरी के लिए ऑर्डर लें
6. प्रतिक्रिया और सुझाव एकत्र करें
7. आयुर्वेदिक संविधान (वात, पित्त, कफ) के आधार पर व्यंजनों की सिफारिश करें

महत्वपूर्ण दिशानिर्देश:
- हमेशा गर्म, स्वागत योग्य और कल्याण सिद्धांतों के प्रति सचेत रहें
- आहार प्रतिबंध को गंभीरता से स्वीकार करें
- अनुशंसित व्यंजनों के आयुर्वेदिक लाभ प्रदान करें
- यदि आप मदद नहीं कर सकते, तो विनम्रता से मानव कर्मचारी सदस्य को स्थानांतरित करने की पेशकश करें
- प्रतिक्रियाएं संक्षिप्त और मित्रवत रखें
- इमोजी का कम लेकिन उचित रूप से उपयोग करें
- हमेशा महत्वपूर्ण विवरण की पुष्टि करें (आरक्षण समय, विशेष अनुरोध, आदि)

यदि ग्राहक आपके दायरे से बाहर कुछ पूछता है या परेशान दिखता है, तो मानव कर्मचारी सदस्य को स्थानांतरित करने का सुझाव दें।`,
};

const INTENT_PATTERNS: Record<string, RegExp[]> = {
  reservation: [
    /book|reserve|table|booking|reservation|book a table/i,
    /कृपया|आरक्षण|टेबल|बुकिंग|मेज/i,
  ],
  menu_inquiry: [
    /menu|what do you have|options|dishes|food|vegetarian|vegan/i,
    /मेनू|क्या है|विकल्प|व्यंजन|खाना|शाकाहारी/i,
  ],
  order: [
    /order|i want|give me|can i have|place an order/i,
    /ऑर्डर|मुझे|दे दो|क्या मैं|आदेश दें/i,
  ],
  dietary: [
    /allergy|allergic|gluten|dairy|vegan|vegetarian|diet|restriction/i,
    /एलर्जी|ग्लूटन|डेयरी|शाकाहारी|आहार|प्रतिबंध/i,
  ],
  feedback: [
    /feedback|review|suggestion|complaint|experience|service/i,
    /प्रतिक्रिया|समीक्षा|सुझाव|शिकायत|अनुभव|सेवा/i,
  ],
  hours: [
    /hours|open|close|timing|when|available/i,
    /घंटे|खुला|बंद|समय|कब|उपलब्ध/i,
  ],
};

export class SakshiChatbot {
  /**
   * Classify the intent of user message
   */
  private classifyIntent(message: string): {
    intent: string;
    confidence: number;
  } {
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(message)) {
          return { intent, confidence: 0.9 };
        }
      }
    }
    return { intent: "general", confidence: 0.5 };
  }

  /**
   * Extract entities from user message
   */
  private extractEntities(message: string): Record<string, any> {
    const entities: Record<string, any> = {};

    // Extract date patterns (tomorrow, next week, 11th November, etc.)
    const dateMatch = message.match(
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|tomorrow|next\s+(week|monday|tuesday|wednesday|thursday|friday|saturday|sunday))/i
    );
    if (dateMatch) entities.date = dateMatch[0];

    // Extract time patterns (7 PM, 19:00, evening, etc.)
    const timeMatch = message.match(
      /(\d{1,2}:\d{2}\s*(am|pm)?|\d{1,2}\s*(am|pm)|morning|afternoon|evening|night)/i
    );
    if (timeMatch) entities.time = timeMatch[0];

    // Extract party size (for 4, 2 people, table for 3, etc.)
    const sizeMatch = message.match(/for\s+(\d+)\s*(people|persons)?|(\d+)\s*people/i);
    if (sizeMatch) entities.partySize = parseInt(sizeMatch[1] || sizeMatch[3]);

    // Extract dietary preferences
    if (/vegan|vegetarian|gluten.?free|dairy.?free|nut.?free/i.test(message)) {
      entities.dietaryPreference = message.match(
        /vegan|vegetarian|gluten.?free|dairy.?free|nut.?free/i
      )?.[0];
    }

    // Extract allergies
    if (/allerg|intolerant/i.test(message)) {
      const allergyMatch = message.match(
        /allerg(y|ic)?\s+to\s+([^,]+)|intolerant\s+to\s+([^,]+)/i
      );
      if (allergyMatch) {
        entities.allergies = allergyMatch[2] || allergyMatch[3];
      }
    }

    return entities;
  }

  /**
   * Determine if conversation should be transferred to human
   */
  private shouldTransferToHuman(
    message: string,
    intent: string
  ): { shouldTransfer: boolean; reason?: string } {
    const escalationKeywords =
      /angry|upset|frustrated|complaint|manager|supervisor|help|emergency|urgent/i;
    const complexQuestions = /custom|special|unusual|complicated|specific/i;

    if (escalationKeywords.test(message)) {
      return {
        shouldTransfer: true,
        reason: "Customer seems upset or needs escalation",
      };
    }

    if (complexQuestions.test(message) && intent === "general") {
      return {
        shouldTransfer: true,
        reason: "Query requires human expertise",
      };
    }

    return { shouldTransfer: false };
  }

  /**
   * Main chatbot response handler
   */
  async chat(context: ConversationContext): Promise<ChatbotResponse> {
    const userMessage = context.conversationHistory[
      context.conversationHistory.length - 1
    ]?.content;

    if (!userMessage) {
      return {
        message: "I didn't receive your message. Please try again.",
        intent: "error",
        confidence: 0,
        entities: {},
        requiresHumanTransfer: false,
      };
    }

    // Classify intent
    const { intent, confidence } = this.classifyIntent(userMessage);

    // Extract entities
    const entities = this.extractEntities(userMessage);

    // Check if should transfer
    const { shouldTransfer, reason } = this.shouldTransferToHuman(
      userMessage,
      intent
    );

    if (shouldTransfer) {
      return {
        message:
          "I understand this needs special attention. Let me connect you with our team. They'll be with you shortly!",
        intent,
        confidence,
        entities,
        requiresHumanTransfer: true,
        transferReason: reason,
      };
    }

    // Get system prompt in user's language
    const systemPrompt = SYSTEM_PROMPTS[context.language] || SYSTEM_PROMPTS.en;

    try {
      // Call Claude API
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        system: systemPrompt,
        messages: context.conversationHistory,
      });

      const assistantMessage =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Add assistant response to history
      context.conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      return {
        message: assistantMessage,
        intent,
        confidence,
        entities,
        requiresHumanTransfer: false,
      };
    } catch (error) {
      console.error("Chatbot error:", error);
      return {
        message:
          "I apologize, but I'm having trouble processing your request. Please try again or I can connect you with our team.",
        intent: "error",
        confidence: 0,
        entities,
        requiresHumanTransfer: true,
        transferReason: "Technical error",
      };
    }
  }

  /**
   * Get conversation summary
   */
  async getConversationSummary(
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    if (conversationHistory.length === 0) return "";

    const messages = conversationHistory
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    try {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 256,
        system:
          "Summarize this customer service conversation in 2-3 sentences, highlighting key details like reservation requests, dietary preferences, or issues.",
        messages: [
          {
            role: "user",
            content: messages,
          },
        ],
      });

      return response.content[0].type === "text" ? response.content[0].text : "";
    } catch (error) {
      console.error("Summary generation error:", error);
      return "";
    }
  }

  /**
   * Recommend dishes based on Ayurvedic constitution
   */
  async recommendDishes(
    constitution: "vata" | "pitta" | "kapha",
    dietaryPreferences: string[]
  ): Promise<string[]> {
    const recommendations: Record<string, string[]> = {
      vata: [
        "Warm Ghee Rice with Sesame",
        "Spiced Lentil Soup",
        "Roasted Root Vegetables",
        "Warm Milk with Turmeric",
      ],
      pitta: [
        "Cooling Coconut Curry",
        "Fresh Green Salad",
        "Mint Lassi",
        "Cucumber Raita",
      ],
      kapha: [
        "Spiced Vegetable Stir-fry",
        "Light Quinoa Bowl",
        "Ginger Tea",
        "Steamed Broccoli",
      ],
    };

    return recommendations[constitution] || [];
  }
}

export const sakshiChatbot = new SakshiChatbot();
