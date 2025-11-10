import { v4 as uuidv4 } from "uuid";

export interface MenuItem {
  id: string;
  cafeId: string;
  name: string;
  description: string;
  category: "breakfast" | "lunch" | "dinner" | "beverages" | "desserts";
  price: number;
  ingredients: string[];
  allergens: string[];
  dietaryTags: ("vegan" | "vegetarian" | "gluten-free" | "dairy-free" | "nut-free")[];
  ayurvedicBenefits: {
    vata: number; // 0-10 scale
    pitta: number;
    kapha: number;
    description: string;
  };
  nutritionInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  sustainabilityScore: number; // 0-100
  sustainabilityNotes: string;
  imageUrl?: string;
  isAvailable: boolean;
  preparationTime: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  cafeId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  deliveryType: "dine_in" | "takeaway" | "delivery";
  specialInstructions?: string;
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialRequests?: string;
}

export class MenuManager {
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();

  /**
   * Add menu item
   */
  addMenuItem(
    cafeId: string,
    name: string,
    description: string,
    category: MenuItem["category"],
    price: number,
    options: Partial<MenuItem>
  ): MenuItem {
    const id = uuidv4();
    const now = new Date();

    const menuItem: MenuItem = {
      id,
      cafeId,
      name,
      description,
      category,
      price,
      ingredients: options.ingredients || [],
      allergens: options.allergens || [],
      dietaryTags: options.dietaryTags || [],
      ayurvedicBenefits: options.ayurvedicBenefits || {
        vata: 5,
        pitta: 5,
        kapha: 5,
        description: "Balanced for all constitutions",
      },
      nutritionInfo: options.nutritionInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      },
      sustainabilityScore: options.sustainabilityScore || 75,
      sustainabilityNotes: options.sustainabilityNotes || "Locally sourced",
      imageUrl: options.imageUrl,
      isAvailable: true,
      preparationTime: options.preparationTime || 15,
      createdAt: now,
      updatedAt: now,
    };

    this.menuItems.set(id, menuItem);
    return menuItem;
  }

  /**
   * Get menu item by ID
   */
  getMenuItem(itemId: string): MenuItem | undefined {
    return this.menuItems.get(itemId);
  }

  /**
   * Get all menu items for a cafe
   */
  getCafeMenu(cafeId: string): MenuItem[] {
    return Array.from(this.menuItems.values()).filter((item) => item.cafeId === cafeId);
  }

  /**
   * Get menu items by category
   */
  getMenuByCategory(
    cafeId: string,
    category: MenuItem["category"]
  ): MenuItem[] {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.cafeId === cafeId && item.category === category
    );
  }

  /**
   * Filter menu items by dietary preferences
   */
  filterByDietaryPreferences(
    cafeId: string,
    dietaryTags: string[]
  ): MenuItem[] {
    return Array.from(this.menuItems.values()).filter((item) => {
      if (item.cafeId !== cafeId) return false;
      if (dietaryTags.length === 0) return true;
      return dietaryTags.every((tag) => item.dietaryTags.includes(tag as any));
    });
  }

  /**
   * Filter menu items by allergens to avoid
   */
  filterByAllergies(cafeId: string, allergies: string[]): MenuItem[] {
    return Array.from(this.menuItems.values()).filter((item) => {
      if (item.cafeId !== cafeId) return false;
      return !allergies.some((allergy) => item.allergens.includes(allergy));
    });
  }

  /**
   * Get menu items recommended for Ayurvedic constitution
   */
  recommendByConstitution(
    cafeId: string,
    constitution: "vata" | "pitta" | "kapha"
  ): MenuItem[] {
    const items = this.getCafeMenu(cafeId);
    return items
      .map((item) => ({
        item,
        score: item.ayurvedicBenefits[constitution],
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ item }) => item);
  }

  /**
   * Get sustainable menu items
   */
  getSustainableItems(cafeId: string, minScore: number = 80): MenuItem[] {
    return Array.from(this.menuItems.values()).filter(
      (item) => item.cafeId === cafeId && item.sustainabilityScore >= minScore
    );
  }

  /**
   * Update menu item
   */
  updateMenuItem(itemId: string, updates: Partial<MenuItem>): MenuItem | undefined {
    const item = this.menuItems.get(itemId);
    if (!item) return undefined;

    const updated = { ...item, ...updates, updatedAt: new Date() };
    this.menuItems.set(itemId, updated);
    return updated;
  }

  /**
   * Toggle menu item availability
   */
  toggleAvailability(itemId: string): MenuItem | undefined {
    const item = this.menuItems.get(itemId);
    if (!item) return undefined;

    item.isAvailable = !item.isAvailable;
    item.updatedAt = new Date();
    this.menuItems.set(itemId, item);
    return item;
  }

  /**
   * Create order
   */
  createOrder(
    cafeId: string,
    customerName: string,
    customerPhone: string,
    items: OrderItem[],
    deliveryType: Order["deliveryType"],
    options?: {
      customerId?: string;
      specialInstructions?: string;
    }
  ): Order {
    const id = uuidv4();
    const now = new Date();

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order: Order = {
      id,
      cafeId,
      customerId: options?.customerId,
      customerName,
      customerPhone,
      items,
      totalAmount,
      status: "pending",
      deliveryType,
      specialInstructions: options?.specialInstructions,
      createdAt: now,
      updatedAt: now,
    };

    this.orders.set(id, order);
    return order;
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Get all orders for a cafe
   */
  getCafeOrders(cafeId: string): Order[] {
    return Array.from(this.orders.values()).filter((order) => order.cafeId === cafeId);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(cafeId: string, status: Order["status"]): Order[] {
    return Array.from(this.orders.values()).filter(
      (order) => order.cafeId === cafeId && order.status === status
    );
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: Order["status"]): Order | undefined {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    order.status = status;
    order.updatedAt = new Date();

    if (status === "ready") {
      order.actualReadyTime = new Date();
    }

    this.orders.set(orderId, order);
    return order;
  }

  /**
   * Calculate estimated ready time
   */
  calculateEstimatedReadyTime(items: OrderItem[]): Date {
    const maxPreparationTime = Math.max(
      ...items.map((item) => {
        const menuItem = this.menuItems.get(item.menuItemId);
        return menuItem?.preparationTime || 15;
      })
    );

    const estimatedTime = new Date();
    estimatedTime.setMinutes(estimatedTime.getMinutes() + maxPreparationTime + 5); // Add 5 min buffer
    return estimatedTime;
  }

  /**
   * Get menu analytics
   */
  getMenuAnalytics(cafeId: string): {
    totalItems: number;
    availableItems: number;
    categoryCounts: Record<string, number>;
    averageSustainabilityScore: number;
    mostPopularCategory: string;
  } {
    const cafeMenu = this.getCafeMenu(cafeId);
    const cafeOrders = this.getCafeOrders(cafeId);

    const availableItems = cafeMenu.filter((item) => item.isAvailable).length;

    const categoryCounts: Record<string, number> = {};
    cafeMenu.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const averageSustainabilityScore =
      cafeMenu.length > 0
        ? Math.round(
            cafeMenu.reduce((sum, item) => sum + item.sustainabilityScore, 0) /
              cafeMenu.length
          )
        : 0;

    // Calculate most popular category from orders
    const orderCategoryCounts: Record<string, number> = {};
    cafeOrders.forEach((order) => {
      order.items.forEach((item) => {
        const menuItem = this.menuItems.get(item.menuItemId);
        if (menuItem) {
          orderCategoryCounts[menuItem.category] =
            (orderCategoryCounts[menuItem.category] || 0) + item.quantity;
        }
      });
    });

    const mostPopularCategory =
      Object.entries(orderCategoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "breakfast";

    return {
      totalItems: cafeMenu.length,
      availableItems,
      categoryCounts,
      averageSustainabilityScore,
      mostPopularCategory,
    };
  }

  /**
   * Get order analytics
   */
  getOrderAnalytics(cafeId: string, days: number = 30): {
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    deliveryTypeBreakdown: Record<string, number>;
    peakOrderHours: string[];
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantOrders = this.getCafeOrders(cafeId).filter(
      (order) => order.createdAt >= cutoffDate
    );

    const completedOrders = relevantOrders.filter((order) => order.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    const deliveryTypeBreakdown: Record<string, number> = {};
    relevantOrders.forEach((order) => {
      deliveryTypeBreakdown[order.deliveryType] =
        (deliveryTypeBreakdown[order.deliveryType] || 0) + 1;
    });

    // Calculate peak order hours
    const hourCounts: Record<string, number> = {};
    relevantOrders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const hourStr = `${hour}:00`;
      hourCounts[hourStr] = (hourCounts[hourStr] || 0) + 1;
    });

    const peakOrderHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);

    return {
      totalOrders: relevantOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      averageOrderValue:
        completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      deliveryTypeBreakdown,
      peakOrderHours,
    };
  }
}

export const menuManager = new MenuManager();
