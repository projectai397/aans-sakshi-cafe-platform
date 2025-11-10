/**
 * AVE API Routes
 * Exposes AVE services as REST API endpoints
 */

import { Router, Request, Response } from 'express';
import { telephonyService } from './telephony-service';
import { nlpService, Intent } from './nlp-service';
import { voiceOrderService } from './voice-order-service';
import { voiceReservationService } from './voice-reservation-service';

const router = Router();

/**
 * Telephony Routes
 */

// Handle incoming call
router.post('/call/incoming', async (req: Request, res: Response) => {
  try {
    const { callId, from } = req.body;

    if (!callId || !from) {
      return res.status(400).json({ error: 'Missing required fields: callId, from' });
    }

    const call = await telephonyService.handleIncomingCall(callId, from);
    res.json({ success: true, call });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Answer call
router.post('/call/:callId/answer', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    await telephonyService.answerCall(callId);
    res.json({ success: true, message: 'Call answered' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// End call
router.post('/call/:callId/end', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    await telephonyService.endCall(callId);
    res.json({ success: true, message: 'Call ended' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Transcribe audio
router.post('/call/:callId/transcribe', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { audioBuffer, language = 'en-IN' } = req.body;

    const result = await telephonyService.transcribeAudio(
      callId,
      Buffer.from(audioBuffer),
      language
    );

    res.json({ success: true, transcription: result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Synthesize speech
router.post('/call/:callId/speak', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { text, language = 'en-IN', voice = 'female' } = req.body;

    await telephonyService.speak(callId, { text, language, voice });
    res.json({ success: true, message: 'Speech synthesized' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Transfer call
router.post('/call/:callId/transfer', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { agentId } = req.body;

    await telephonyService.transferCall(callId, agentId);
    res.json({ success: true, message: 'Call transferred' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get active calls
router.get('/calls/active', async (req: Request, res: Response) => {
  try {
    const calls = telephonyService.getActiveCalls();
    res.json({ success: true, count: calls.length, calls });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * NLP Routes
 */

// Analyze intent
router.post('/nlp/analyze', async (req: Request, res: Response) => {
  try {
    const { text, sessionId } = req.body;

    if (!text || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields: text, sessionId' });
    }

    const result = await nlpService.analyzeIntent(text, sessionId);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Generate response
router.post('/nlp/respond', async (req: Request, res: Response) => {
  try {
    const { intentResult } = req.body;

    if (!intentResult) {
      return res.status(400).json({ error: 'Missing required field: intentResult' });
    }

    const response = await nlpService.generateResponse(intentResult);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get conversation context
router.get('/nlp/context/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const context = nlpService.getContext(sessionId);
    res.json({ success: true, context });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Voice Order Routes
 */

// Process order from voice
router.post('/order/process', async (req: Request, res: Response) => {
  try {
    const { text, callId, sessionId } = req.body;

    if (!text || !callId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Analyze intent
    const intentResult = await nlpService.analyzeIntent(text, sessionId);

    // Process order if intent is ORDER_FOOD
    if (intentResult.intent === Intent.ORDER_FOOD) {
      const { order, response } = await voiceOrderService.processOrderFromVoice(
        intentResult,
        callId
      );
      return res.json({ success: true, order, response });
    } else {
      const response = await nlpService.generateResponse(intentResult);
      return res.json({ success: true, response });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get order summary
router.get('/order/:callId/summary', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const summary = voiceOrderService.getOrderSummary(callId);
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Confirm order
router.post('/order/:callId/confirm', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { phone, name, address } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await voiceOrderService.confirmOrder(callId, { phone, name, address });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Get menu
router.get('/order/menu', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let menu;
    if (category) {
      menu = voiceOrderService.getMenuByCategory(category as string);
    } else if (search) {
      menu = voiceOrderService.searchMenu(search as string);
    } else {
      menu = voiceOrderService.getRecommendations();
    }

    res.json({ success: true, menu });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Voice Reservation Routes
 */

// Process reservation from voice
router.post('/reservation/process', async (req: Request, res: Response) => {
  try {
    const { text, callId, sessionId } = req.body;

    if (!text || !callId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Analyze intent
    const intentResult = await nlpService.analyzeIntent(text, sessionId);

    // Process reservation if intent is MAKE_RESERVATION
    if (intentResult.intent === Intent.MAKE_RESERVATION) {
      const { reservation, response } =
        await voiceReservationService.processReservationFromVoice(intentResult, callId);
      return res.json({ success: true, reservation, response });
    } else {
      const response = await nlpService.generateResponse(intentResult);
      return res.json({ success: true, response });
    }
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Confirm reservation
router.post('/reservation/:callId/confirm', async (req: Request, res: Response) => {
  try {
    const { callId } = req.params;
    const { phone, name, specialRequests } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await voiceReservationService.confirmReservation(callId, {
      phone,
      name,
      specialRequests,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Check availability
router.post('/reservation/availability', async (req: Request, res: Response) => {
  try {
    const { date, time, partySize } = req.body;

    if (!date || !time || !partySize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const available = await voiceReservationService.checkAvailability(
      new Date(date),
      time,
      parseInt(partySize)
    );

    res.json({ success: true, available: available.length > 0, slots: available });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Cancel reservation
router.post('/reservation/:reservationId/cancel', async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params;
    const result = await voiceReservationService.cancelReservation(reservationId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Unified Voice Assistant Route
 * Single endpoint that handles all voice interactions
 */
router.post('/assistant/process', async (req: Request, res: Response) => {
  try {
    const { text, callId, sessionId } = req.body;

    if (!text || !callId || !sessionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Analyze intent
    const intentResult = await nlpService.analyzeIntent(text, sessionId);

    let response = '';
    let data: any = {};

    // Route to appropriate service based on intent
    switch (intentResult.intent) {
      case Intent.ORDER_FOOD:
        const orderResult = await voiceOrderService.processOrderFromVoice(
          intentResult,
          callId
        );
        response = orderResult.response;
        data.order = orderResult.order;
        break;

      case Intent.MAKE_RESERVATION:
        const reservationResult =
          await voiceReservationService.processReservationFromVoice(intentResult, callId);
        response = reservationResult.response;
        data.reservation = reservationResult.reservation;
        break;

      default:
        response = await nlpService.generateResponse(intentResult);
        break;
    }

    // Speak the response
    await telephonyService.speak(callId, {
      text: response,
      language: 'en-IN',
    });

    res.json({
      success: true,
      intent: intentResult.intent,
      response,
      data,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    services: {
      telephony: 'active',
      nlp: 'active',
      voiceOrder: 'active',
      voiceReservation: 'active',
    },
    stats: {
      activeCalls: telephonyService.getActiveCalls().length,
      activeOrders: voiceOrderService.getActiveOrdersCount(),
      activeReservations: voiceReservationService.getActiveReservationsCount(),
      activeContexts: nlpService.getActiveContexts(),
    },
  });
});

export default router;
