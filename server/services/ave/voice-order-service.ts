/**
 * AVE Voice Order Service
 * Processes food orders placed via voice calls
 * Integrates with menu, inventory, and order management systems
 */

import { Intent, Entity, EntityType, IntentResult } from './nlp-service';

export interface VoiceOrder {
  orderId: string;
  callId: string;
  customerId?: string;
  customerPhone: string;
  customerName?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  deliveryAddress?: string;
  specialInstructions?: string;
  status: 'building' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  confirmedAt?: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string[];
  specialRequests?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
  preparationTime: number;
  dietaryInfo: string[];
}

/**
 * Voice Order Service Class
 */
export class VoiceOrderService {
  private activeOrders: Map<string, VoiceOrder> = new Map();
  
  // Mock menu data
  private menu: MenuItem[] = [
    {
      id: 'item_001',
      name: 'ayurvedic thali',
      category: 'lunch',
      price: 250,
      description: 'Complete balanced meal with rice, dal, vegetables, roti, and dessert',
      available: true,
      preparationTime: 20,
      dietaryInfo: ['vegetarian', 'ayurvedic', 'balanced'],
    },
    {
      id: 'item_002',
      name: 'vata balance bowl',
      category: 'lunch',
      price: 220,
      description: 'Warm, grounding bowl with root vegetables and grains',
      available: true,
      preparationTime: 15,
      dietaryInfo: ['vegetarian', 'vata-balancing', 'warm'],
    },
    {
      id: 'item_003',
      name: 'pitta cooling salad',
      category: 'lunch',
      price: 180,
      description: 'Cooling salad with cucumber, mint, and coconut',
      available: true,
      preparationTime: 10,
      dietaryInfo: ['vegetarian', 'pitta-cooling', 'raw'],
    },
    {
      id: 'item_004',
      name: 'kapha warming curry',
      category: 'dinner',
      price: 200,
      description: 'Spicy, warming curry with seasonal vegetables',
      available: true,
      preparationTime: 25,
      dietaryInfo: ['vegetarian', 'kapha-balancing', 'spicy'],
    },
    {
      id: 'item_005',
      name: 'premium biryani',
      category: 'dinner',
      price: 300,
      description: 'Aromatic basmati rice with vegetables and spices',
      available: true,
      preparationTime: 30,
      dietaryInfo: ['vegetarian', 'aromatic', 'premium'],
    },
  ];

  /**
   * Process order from voice transcription
   */
  async processOrderFromVoice(
    intentResult: IntentResult,
    callId: string
  ): Promise<{ order: VoiceOrder; response: string }> {
    console.log(`[AVE Voice Order] Processing order for call ${callId}`);

    // Get or create order
    let order = this.activeOrders.get(callId);
    if (!order) {
      order = this.createNewOrder(callId);
    }

    // Extract menu items and quantities from entities
    const menuItemEntities = intentResult.entities.filter(
      (e) => e.type === EntityType.MENU_ITEM
    );
    const quantityEntities = intentResult.entities.filter(
      (e) => e.type === EntityType.QUANTITY
    );

    let response = '';

    if (menuItemEntities.length > 0) {
      // Add items to order
      for (let i = 0; i < menuItemEntities.length; i++) {
        const itemName = menuItemEntities[i].value;
        const quantity = quantityEntities[i]
          ? parseInt(quantityEntities[i].value)
          : 1;

        const menuItem = this.findMenuItem(itemName);
        if (menuItem) {
          this.addItemToOrder(order, menuItem, quantity);
          response += `Added ${quantity} ${menuItem.name} to your order. `;
        } else {
          response += `Sorry, I couldn't find ${itemName} on our menu. `;
        }
      }

      // Calculate totals
      this.calculateOrderTotals(order);

      response += `Your current total is ₹${order.total}. Would you like to add anything else?`;
    } else {
      response = 'What would you like to order? We have Ayurvedic Thali, Vata Balance Bowl, Premium Biryani, and more.';
    }

    return { order, response };
  }

  /**
   * Create new order
   */
  private createNewOrder(callId: string): VoiceOrder {
    const order: VoiceOrder = {
      orderId: `ORD_${Date.now()}`,
      callId,
      customerPhone: '',
      items: [],
      subtotal: 0,
      tax: 0,
      deliveryFee: 0,
      total: 0,
      status: 'building',
      createdAt: new Date(),
    };

    this.activeOrders.set(callId, order);
    return order;
  }

  /**
   * Add item to order
   */
  private addItemToOrder(
    order: VoiceOrder,
    menuItem: MenuItem,
    quantity: number
  ): void {
    // Check if item already exists in order
    const existingItem = order.items.find(
      (item) => item.menuItemId === menuItem.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      order.items.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity,
        price: menuItem.price,
      });
    }
  }

  /**
   * Remove item from order
   */
  removeItemFromOrder(orderId: string, menuItemId: string): void {
    const order = Array.from(this.activeOrders.values()).find(
      (o) => o.orderId === orderId
    );

    if (order) {
      order.items = order.items.filter((item) => item.menuItemId !== menuItemId);
      this.calculateOrderTotals(order);
    }
  }

  /**
   * Calculate order totals
   */
  private calculateOrderTotals(order: VoiceOrder): void {
    order.subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    order.tax = Math.round(order.subtotal * 0.05); // 5% tax
    order.deliveryFee = order.subtotal >= 500 ? 0 : 40; // Free delivery above ₹500
    order.total = order.subtotal + order.tax + order.deliveryFee;
  }

  /**
   * Confirm order
   */
  async confirmOrder(
    callId: string,
    customerInfo: { phone: string; name?: string; address?: string }
  ): Promise<{ success: boolean; response: string }> {
    const order = this.activeOrders.get(callId);
    if (!order) {
      return {
        success: false,
        response: 'No active order found. Would you like to start a new order?',
      };
    }

    if (order.items.length === 0) {
      return {
        success: false,
        response: 'Your order is empty. What would you like to order?',
      };
    }

    // Update customer info
    order.customerPhone = customerInfo.phone;
    order.customerName = customerInfo.name;
    order.deliveryAddress = customerInfo.address;
    order.status = 'confirmed';
    order.confirmedAt = new Date();

    // Calculate estimated delivery time
    const maxPrepTime = Math.max(
      ...order.items.map((item) => {
        const menuItem = this.menu.find((m) => m.id === item.menuItemId);
        return menuItem?.preparationTime || 20;
      })
    );
    const estimatedTime = maxPrepTime + 20; // Prep time + delivery time

    const response = `Perfect! Your order is confirmed. Order ID is ${order.orderId}. Total amount is ₹${order.total}. Your order will be delivered in approximately ${estimatedTime} minutes. You'll receive an SMS confirmation shortly. Thank you for ordering from Sakshi Cafe!`;

    // Save order to database
    await this.saveOrder(order);

    // Remove from active orders
    this.activeOrders.delete(callId);

    return { success: true, response };
  }

  /**
   * Get order summary
   */
  getOrderSummary(callId: string): string {
    const order = this.activeOrders.get(callId);
    if (!order || order.items.length === 0) {
      return 'Your order is currently empty.';
    }

    let summary = 'Here is your order summary: ';
    
    order.items.forEach((item) => {
      summary += `${item.quantity} ${item.name} at ₹${item.price} each. `;
    });

    summary += `Subtotal: ₹${order.subtotal}. `;
    summary += `Tax: ₹${order.tax}. `;
    if (order.deliveryFee > 0) {
      summary += `Delivery fee: ₹${order.deliveryFee}. `;
    } else {
      summary += `Free delivery! `;
    }
    summary += `Total: ₹${order.total}.`;

    return summary;
  }

  /**
   * Find menu item by name
   */
  private findMenuItem(name: string): MenuItem | undefined {
    const normalizedName = name.toLowerCase().trim();
    return this.menu.find(
      (item) => item.name.toLowerCase() === normalizedName
    );
  }

  /**
   * Get menu by category
   */
  getMenuByCategory(category: string): MenuItem[] {
    return this.menu.filter(
      (item) => item.category.toLowerCase() === category.toLowerCase() && item.available
    );
  }

  /**
   * Search menu items
   */
  searchMenu(query: string): MenuItem[] {
    const normalizedQuery = query.toLowerCase();
    return this.menu.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery) ||
        item.dietaryInfo.some((info) => info.toLowerCase().includes(normalizedQuery))
    );
  }

  /**
   * Get recommendations based on dietary preferences
   */
  getRecommendations(dietaryPreference?: string): MenuItem[] {
    if (!dietaryPreference) {
      return this.menu.filter((item) => item.available).slice(0, 3);
    }

    const recommendations = this.menu.filter(
      (item) =>
        item.available &&
        item.dietaryInfo.some((info) =>
          info.toLowerCase().includes(dietaryPreference.toLowerCase())
        )
    );

    return recommendations.slice(0, 3);
  }

  /**
   * Save order to database
   */
  private async saveOrder(order: VoiceOrder): Promise<void> {
    try {
      console.log('[AVE Voice Order] Saving order:', order.orderId);
      
      // TODO: Save to MongoDB
      // await db.collection('orders').insertOne(order);

      // Send SMS confirmation
      await this.sendOrderConfirmation(order);

      // Notify kitchen
      await this.notifyKitchen(order);
    } catch (error) {
      console.error('[AVE Voice Order] Failed to save order:', error);
    }
  }

  /**
   * Send order confirmation SMS
   */
  private async sendOrderConfirmation(order: VoiceOrder): Promise<void> {
    console.log(`[AVE Voice Order] Sending SMS to ${order.customerPhone}`);
    // TODO: Integrate with SMS service
  }

  /**
   * Notify kitchen about new order
   */
  private async notifyKitchen(order: VoiceOrder): Promise<void> {
    console.log(`[AVE Voice Order] Notifying kitchen about order ${order.orderId}`);
    // TODO: Send to kitchen display system
  }

  /**
   * Get active orders count
   */
  getActiveOrdersCount(): number {
    return this.activeOrders.size;
  }

  /**
   * Get order by call ID
   */
  getOrder(callId: string): VoiceOrder | undefined {
    return this.activeOrders.get(callId);
  }
}

// Export singleton instance
export const voiceOrderService = new VoiceOrderService();
