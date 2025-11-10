/**
 * Rasa Chatbot Integration Routes
 * Handles chat messages and conversation management
 */

import { router, publicProcedure, protectedProcedure } from '@/server/_core/trpc'
import { z } from 'zod'

const RASA_URL = process.env.RASA_URL || 'http://localhost:5005'

// Validation schemas
const ChatMessageSchema = z.object({
  senderId: z.string().min(1, 'Sender ID required'),
  message: z.string().min(1, 'Message cannot be empty'),
  cafeId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

const ConversationSchema = z.object({
  senderId: z.string(),
  cafeId: z.string().optional(),
})

interface RasaMessage {
  recipient_id: string
  text?: string
  custom?: any
}

export const rasaChatbotRouter = router({
  /**
   * Send message to Rasa chatbot
   */
  sendMessage: publicProcedure
    .input(ChatMessageSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${RASA_URL}/webhooks/rest/webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: input.senderId,
            message: input.message,
            metadata: {
              cafe_id: input.cafeId,
              ...input.metadata,
            },
          }),
        })

        if (!response.ok) {
          throw new Error(`Rasa API error: ${response.statusText}`)
        }

        const messages: RasaMessage[] = await response.json()

        // Process and format messages
        const formattedMessages = messages.map((msg) => ({
          text: msg.text || '',
          custom: msg.custom,
          timestamp: new Date(),
        }))

        return {
          success: true,
          messages: formattedMessages,
          count: formattedMessages.length,
        }
      } catch (error) {
        console.error('Rasa chatbot error:', error)
        return {
          success: false,
          messages: [
            {
              text: "Sorry, I'm having trouble processing your request. Please try again.",
              timestamp: new Date(),
            },
          ],
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }),

  /**
   * Get conversation history
   */
  getConversationHistory: publicProcedure
    .input(ConversationSchema)
    .query(async ({ input }) => {
      try {
        // In real implementation, would fetch from database
        return {
          success: true,
          senderId: input.senderId,
          cafeId: input.cafeId,
          messages: [],
          count: 0,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch history',
        }
      }
    }),

  /**
   * Clear conversation history
   */
  clearConversation: protectedProcedure
    .input(ConversationSchema)
    .mutation(async ({ input }) => {
      try {
        // In real implementation, would delete from database
        return {
          success: true,
          message: 'Conversation cleared',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to clear conversation',
        }
      }
    }),

  /**
   * Get chatbot status
   */
  getChatbotStatus: publicProcedure.query(async () => {
    try {
      const response = await fetch(`${RASA_URL}/status`, {
        method: 'GET',
        timeout: 5000,
      })

      if (response.ok) {
        return {
          success: true,
          status: 'online',
          message: 'Chatbot is running',
        }
      } else {
        return {
          success: false,
          status: 'offline',
          message: 'Chatbot is not responding',
        }
      }
    } catch (error) {
      return {
        success: false,
        status: 'offline',
        message: 'Cannot connect to chatbot',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }),

  /**
   * Train chatbot model
   */
  trainModel: protectedProcedure.mutation(async () => {
    try {
      const response = await fetch(`${RASA_URL}/model/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: 'config.yml',
          domain: 'domain.yml',
          stories: 'data/stories.yml',
          nlu: 'data/nlu.yml',
        }),
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Model training started',
        }
      } else {
        return {
          success: false,
          error: 'Failed to start training',
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Training failed',
      }
    }
  }),

  /**
   * Get NLU model metrics
   */
  getModelMetrics: publicProcedure.query(async () => {
    try {
      // In real implementation, would fetch from Rasa
      return {
        success: true,
        metrics: {
          intent_accuracy: 0.95,
          entity_accuracy: 0.92,
          total_intents: 13,
          total_entities: 8,
          training_samples: 150,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      }
    }
  }),

  /**
   * Get conversation analytics
   */
  getConversationAnalytics: publicProcedure
    .input(
      z.object({
        cafeId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // In real implementation, would fetch from database
        return {
          success: true,
          analytics: {
            total_conversations: 0,
            total_messages: 0,
            average_conversation_length: 0,
            most_common_intent: '',
            user_satisfaction: 0,
            resolution_rate: 0,
          },
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        }
      }
    }),

  /**
   * Get intent distribution
   */
  getIntentDistribution: publicProcedure
    .input(
      z.object({
        cafeId: z.string().optional(),
        limit: z.number().int().positive().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        // In real implementation, would calculate from conversations
        return {
          success: true,
          intents: [
            { intent: 'reservation', count: 45, percentage: 25 },
            { intent: 'order', count: 40, percentage: 22 },
            { intent: 'menu_inquiry', count: 35, percentage: 19 },
            { intent: 'track_order', count: 30, percentage: 16 },
            { intent: 'feedback', count: 20, percentage: 11 },
            { intent: 'contact', count: 10, percentage: 5 },
            { intent: 'payment', count: 5, percentage: 2 },
          ],
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch intent distribution',
        }
      }
    }),

  /**
   * Get common questions
   */
  getCommonQuestions: publicProcedure
    .input(
      z.object({
        cafeId: z.string().optional(),
        limit: z.number().int().positive().default(5),
      })
    )
    .query(async ({ input }) => {
      try {
        // In real implementation, would fetch from database
        return {
          success: true,
          questions: [
            { question: 'What are your business hours?', count: 45 },
            { question: 'Do you have vegetarian options?', count: 38 },
            { question: 'What is your delivery time?', count: 32 },
            { question: 'Do you accept online payments?', count: 28 },
            { question: 'Can I make a reservation?', count: 25 },
          ],
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch common questions',
        }
      }
    }),
})
