import { Router, Request, Response } from "express";
import { sakshiChatbot } from "../services/sakshi-chatbot";

const router = Router();

// POST /api/sakshi/chat - Send message to chatbot
router.post("/chat", async (req: Request, res: Response) => {
  try {
    const {
      cafeId,
      customerId,
      customerPhone,
      language = "en",
      message,
      conversationHistory = [],
    } = req.body;

    if (!message || !customerPhone) {
      return res.status(400).json({
        error: "Missing required fields: message, customerPhone",
      });
    }

    // Add user message to history
    const updatedHistory = [
      ...conversationHistory,
      { role: "user" as const, content: message },
    ];

    // Get chatbot response
    const response = await sakshiChatbot.chat({
      cafeId,
      customerId,
      customerPhone,
      language,
      conversationHistory: updatedHistory,
    });

    res.json({
      success: true,
      response,
      conversationHistory: updatedHistory,
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/sakshi/chat/:conversationId/history - Get conversation history
router.get("/chat/:conversationId/history", async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    // TODO: Fetch from database
    res.json({
      success: true,
      conversationId,
      history: [],
    });
  } catch (error) {
    console.error("History endpoint error:", error);
    res.status(500).json({
      error: "Failed to fetch conversation history",
    });
  }
});

// POST /api/sakshi/chat/:conversationId/transfer - Transfer to human
router.post(
  "/chat/:conversationId/transfer",
  async (req: Request, res: Response) => {
    try {
      const { conversationId } = req.params;
      const { reason } = req.body;

      // TODO: Create support ticket and notify staff
      res.json({
        success: true,
        message: "Conversation transferred to human support",
        conversationId,
        transferReason: reason,
      });
    } catch (error) {
      console.error("Transfer endpoint error:", error);
      res.status(500).json({
        error: "Failed to transfer conversation",
      });
    }
  }
);

// POST /api/sakshi/reservations - Create reservation
router.post("/reservations", async (req: Request, res: Response) => {
  try {
    const {
      cafeId,
      customerName,
      customerPhone,
      customerEmail,
      partySize,
      reservationTime,
      specialRequests,
    } = req.body;

    if (!cafeId || !customerPhone || !partySize || !reservationTime) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // TODO: Save to database
    const reservation = {
      id: Math.random().toString(36).substr(2, 9),
      cafeId,
      customerName,
      customerPhone,
      customerEmail,
      partySize,
      reservationTime,
      specialRequests,
      status: "pending",
      confirmationSent: false,
      reminderSent: false,
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      reservation,
    });
  } catch (error) {
    console.error("Reservation creation error:", error);
    res.status(500).json({
      error: "Failed to create reservation",
    });
  }
});

// PUT /api/sakshi/reservations/:id - Update reservation
router.put("/reservations/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // TODO: Update in database
    res.json({
      success: true,
      message: "Reservation updated",
      reservationId: id,
    });
  } catch (error) {
    console.error("Reservation update error:", error);
    res.status(500).json({
      error: "Failed to update reservation",
    });
  }
});

// POST /api/sakshi/reservations/:id/confirm - Send confirmation
router.post(
  "/reservations/:id/confirm",
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // TODO: Send SMS/Email confirmation
      res.json({
        success: true,
        message: "Confirmation sent to customer",
        reservationId: id,
      });
    } catch (error) {
      console.error("Confirmation error:", error);
      res.status(500).json({
        error: "Failed to send confirmation",
      });
    }
  }
);

// GET /api/sakshi/cafes/:id/menu - Get menu items
router.get("/cafes/:id/menu", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Fetch from database
    const menuItems = [
      {
        id: "1",
        name: "Green Smoothie Bowl",
        category: "Breakfast",
        price: 250,
        ayurvedicBenefits: "Cooling, detoxifying",
        sustainabilityScore: 95,
        image: "/menu/green-smoothie.jpg",
      },
      {
        id: "2",
        name: "Buddha Bowl",
        category: "Lunch",
        price: 350,
        ayurvedicBenefits: "Balancing, nourishing",
        sustainabilityScore: 90,
        image: "/menu/buddha-bowl.jpg",
      },
    ];

    res.json({
      success: true,
      cafeId: id,
      menuItems,
    });
  } catch (error) {
    console.error("Menu fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch menu",
    });
  }
});

// POST /api/sakshi/orders - Create order
router.post("/orders", async (req: Request, res: Response) => {
  try {
    const { cafeId, customerId, items, deliveryType } = req.body;

    if (!cafeId || !items || items.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    // TODO: Calculate total and save to database
    const order = {
      id: Math.random().toString(36).substr(2, 9),
      cafeId,
      customerId,
      items,
      totalAmount: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      deliveryType: deliveryType || "dine_in",
      status: "pending",
      createdAt: new Date(),
    };

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Failed to create order",
    });
  }
});

// GET /api/sakshi/analytics/daily/:cafeId - Get daily analytics
router.get("/analytics/daily/:cafeId", async (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;

    // TODO: Fetch from database
    const analytics = {
      cafeId,
      date: new Date().toISOString().split("T")[0],
      totalCalls: 45,
      answeredCalls: 43,
      missedCalls: 2,
      reservationsMade: 12,
      reservationsCompleted: 10,
      noShowCount: 1,
      totalRevenue: 15000,
      averageOrderValue: 350,
      customerSatisfaction: 4.7,
    };

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    res.status(500).json({
      error: "Failed to fetch analytics",
    });
  }
});

export default router;
