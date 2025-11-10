import { Router, Request, Response } from "express";
import { menuManager, MenuItem, Order } from "../services/sakshi-menu";

const router = Router();

// ==================== MENU MANAGEMENT ====================

/**
 * GET /api/sakshi/menu/:cafeId
 * Get all menu items for a cafe
 */
router.get("/menu/:cafeId", (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const { category, dietary, allergies } = req.query;

    let items = menuManager.getCafeMenu(cafeId);

    if (category) {
      items = items.filter((item) => item.category === category);
    }

    if (dietary) {
      const dietaryTags = (dietary as string).split(",");
      items = menuManager.filterByDietaryPreferences(cafeId, dietaryTags);
    }

    if (allergies) {
      const allergyList = (allergies as string).split(",");
      items = menuManager.filterByAllergies(cafeId, allergyList);
    }

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/sakshi/menu/:cafeId/category/:category
 * Get menu items by category
 */
router.get("/menu/:cafeId/category/:category", (req: Request, res: Response) => {
  try {
    const { cafeId, category } = req.params;
    const items = menuManager.getMenuByCategory(
      cafeId,
      category as MenuItem["category"]
    );
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/sakshi/menu/:cafeId/ayurvedic/:constitution
 * Get menu items recommended for Ayurvedic constitution
 */
router.get("/menu/:cafeId/ayurvedic/:constitution", (req: Request, res: Response) => {
  try {
    const { cafeId, constitution } = req.params;
    const items = menuManager.recommendByConstitution(
      cafeId,
      constitution as "vata" | "pitta" | "kapha"
    );
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/sakshi/menu/:cafeId/sustainable
 * Get sustainable menu items
 */
router.get("/menu/:cafeId/sustainable", (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const { minScore } = req.query;
    const items = menuManager.getSustainableItems(
      cafeId,
      minScore ? parseInt(minScore as string) : 80
    );
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/sakshi/menu/:cafeId
 * Add new menu item (Admin)
 */
router.post("/menu/:cafeId", (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const {
      name,
      description,
      category,
      price,
      ingredients,
      allergens,
      dietaryTags,
      ayurvedicBenefits,
      nutritionInfo,
      sustainabilityScore,
      sustainabilityNotes,
      preparationTime,
    } = req.body;

    const menuItem = menuManager.addMenuItem(
      cafeId,
      name,
      description,
      category,
      price,
      {
        ingredients,
        allergens,
        dietaryTags,
        ayurvedicBenefits,
        nutritionInfo,
        sustainabilityScore,
        sustainabilityNotes,
        preparationTime,
      }
    );

    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * PUT /api/sakshi/menu/:itemId
 * Update menu item (Admin)
 */
router.put("/menu/:itemId", (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const updates = req.body;

    const menuItem = menuManager.updateMenuItem(itemId, updates);
    if (!menuItem) {
      return res.status(404).json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * PATCH /api/sakshi/menu/:itemId/availability
 * Toggle menu item availability
 */
router.patch("/menu/:itemId/availability", (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const menuItem = menuManager.toggleAvailability(itemId);

    if (!menuItem) {
      return res.status(404).json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, data: menuItem });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ==================== ORDER MANAGEMENT ====================

/**
 * POST /api/sakshi/orders
 * Create new order
 */
router.post("/orders", (req: Request, res: Response) => {
  try {
    const {
      cafeId,
      customerName,
      customerPhone,
      items,
      deliveryType,
      customerId,
      specialInstructions,
    } = req.body;

    const order = menuManager.createOrder(
      cafeId,
      customerName,
      customerPhone,
      items,
      deliveryType,
      { customerId, specialInstructions }
    );

    // Calculate estimated ready time
    order.estimatedReadyTime = menuManager.calculateEstimatedReadyTime(items);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/sakshi/orders/:orderId
 * Get order by ID
 */
router.get("/orders/:orderId", (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = menuManager.getOrder(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/sakshi/orders/cafe/:cafeId
 * Get all orders for a cafe
 */
router.get("/orders/cafe/:cafeId", (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const { status } = req.query;

    let orders = menuManager.getCafeOrders(cafeId);

    if (status) {
      orders = menuManager.getOrdersByStatus(cafeId, status as Order["status"]);
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * PATCH /api/sakshi/orders/:orderId/status
 * Update order status
 */
router.patch("/orders/:orderId/status", (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = menuManager.updateOrderStatus(orderId, status);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// ==================== ANALYTICS ====================

/**
 * GET /api/sakshi/analytics/menu/:cafeId
 * Get menu analytics
 */
router.get("/analytics/menu/:cafeId", (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const analytics = menuManager.getMenuAnalytics(cafeId);
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/sakshi/analytics/orders/:cafeId
 * Get order analytics
 */
router.get("/analytics/orders/:cafeId", (req: Request, res: Response) => {
  try {
    const { cafeId } = req.params;
    const { days } = req.query;
    const analytics = menuManager.getOrderAnalytics(
      cafeId,
      days ? parseInt(days as string) : 30
    );
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
