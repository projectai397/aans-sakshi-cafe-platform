/**
 * Webhook Implementation Examples & Test Utilities
 * Provides sample payloads and testing utilities for delivery platform webhooks
 */

/**
 * Swiggy Webhook Examples
 */

export const swiggyExamples = {
  orderPlaced: {
    event: 'order_placed',
    timestamp: 1699564800,
    data: {
      order_id: 'SWIGGY123456',
      restaurant_id: 'rest_001',
      customer_name: 'John Doe',
      customer_phone: '+919876543210',
      delivery_address: '123 Main St, Bangalore, KA 560001',
      items: [
        {
          name: 'Butter Chicken',
          quantity: 1,
          price: 350,
        },
        {
          name: 'Naan',
          quantity: 2,
          price: 80,
        },
      ],
      subtotal: 510,
      delivery_fee: 50,
      commission: 76.5,
      tax: 97.9,
      total: 734.4,
      order_time: 1699564800,
    },
  },

  orderConfirmed: {
    event: 'order_confirmed',
    timestamp: 1699564920,
    data: {
      order_id: 'SWIGGY123456',
      restaurant_id: 'rest_001',
      confirmed_at: 1699564920,
    },
  },

  orderPreparing: {
    event: 'order_preparing',
    timestamp: 1699565040,
    data: {
      order_id: 'SWIGGY123456',
      restaurant_id: 'rest_001',
      started_at: 1699565040,
    },
  },

  orderReady: {
    event: 'order_ready',
    timestamp: 1699565400,
    data: {
      order_id: 'SWIGGY123456',
      restaurant_id: 'rest_001',
      ready_at: 1699565400,
    },
  },

  orderPickedUp: {
    event: 'order_picked_up',
    timestamp: 1699565520,
    data: {
      order_id: 'SWIGGY123456',
      restaurant_id: 'rest_001',
      delivery_partner_id: 'DP123',
      delivery_partner_name: 'Rajesh Kumar',
      delivery_partner_phone: '+919876543211',
      picked_up_at: 1699565520,
      estimated_delivery_time: 1699566120,
    },
  },

  orderDelivered: {
    event: 'order_delivered',
    timestamp: 1699566120,
    data: {
      order_id: 'SWIGGY123456',
      restaurant_id: 'rest_001',
      delivery_partner_id: 'DP123',
      delivered_at: 1699566120,
      rating: 5,
      feedback: 'Great food and fast delivery!',
    },
  },

  orderCancelled: {
    event: 'order_cancelled',
    timestamp: 1699565700,
    data: {
      order_id: 'SWIGGY123456',
      restaurant_id: 'rest_001',
      cancelled_at: 1699565700,
      reason: 'Customer requested cancellation',
      refund_amount: 734.4,
    },
  },
};

/**
 * Zomato Webhook Examples
 */

export const zomatoExamples = {
  orderReceived: {
    event: 'order_received',
    timestamp: '2024-11-10T12:00:00Z',
    data: {
      order_id: 'ZOMATO789012',
      restaurant_id: 'rest_002',
      customer_name: 'Jane Smith',
      customer_phone: '+919876543211',
      delivery_address: '456 Oak Ave, Mumbai, MH 400001',
      items: [
        {
          name: 'Paneer Tikka',
          quantity: 2,
          price: 250,
        },
        {
          name: 'Biryani',
          quantity: 1,
          price: 350,
        },
      ],
      subtotal: 850,
      delivery_fee: 40,
      commission: 127.5,
      tax: 143.1,
      total: 1160.6,
      order_time: '2024-11-10T12:00:00Z',
    },
  },

  orderAccepted: {
    event: 'order_accepted',
    timestamp: '2024-11-10T12:05:00Z',
    data: {
      order_id: 'ZOMATO789012',
      restaurant_id: 'rest_002',
      accepted_at: '2024-11-10T12:05:00Z',
    },
  },

  orderInPreparation: {
    event: 'order_in_preparation',
    timestamp: '2024-11-10T12:10:00Z',
    data: {
      order_id: 'ZOMATO789012',
      restaurant_id: 'rest_002',
      started_at: '2024-11-10T12:10:00Z',
    },
  },

  orderReadyForPickup: {
    event: 'order_ready_for_pickup',
    timestamp: '2024-11-10T12:25:00Z',
    data: {
      order_id: 'ZOMATO789012',
      restaurant_id: 'rest_002',
      ready_at: '2024-11-10T12:25:00Z',
    },
  },

  orderPickedUp: {
    event: 'order_picked_up',
    timestamp: '2024-11-10T12:30:00Z',
    data: {
      order_id: 'ZOMATO789012',
      restaurant_id: 'rest_002',
      delivery_partner_id: 'DP456',
      delivery_partner_name: 'Priya Sharma',
      delivery_partner_phone: '+919876543212',
      picked_up_at: '2024-11-10T12:30:00Z',
      estimated_delivery_time: '2024-11-10T13:00:00Z',
    },
  },

  orderDelivered: {
    event: 'order_delivered',
    timestamp: '2024-11-10T13:00:00Z',
    data: {
      order_id: 'ZOMATO789012',
      restaurant_id: 'rest_002',
      delivery_partner_id: 'DP456',
      delivered_at: '2024-11-10T13:00:00Z',
      rating: 4,
      feedback: 'Good food, slightly delayed',
    },
  },

  orderCancelled: {
    event: 'order_cancelled',
    timestamp: '2024-11-10T12:15:00Z',
    data: {
      order_id: 'ZOMATO789012',
      restaurant_id: 'rest_002',
      cancelled_at: '2024-11-10T12:15:00Z',
      reason: 'Out of stock for selected item',
      refund_amount: 1160.6,
    },
  },
};

/**
 * Uber Eats Webhook Examples
 */

export const uberEatsExamples = {
  orderCreated: {
    event: 'order.created',
    timestamp: '2024-11-10T12:00:00Z',
    data: {
      order_id: 'UBER345678',
      restaurant_id: 'rest_003',
      customer_name: 'Mike Johnson',
      customer_phone: '+919876543212',
      delivery_address: '789 Pine Rd, Delhi, DL 110001',
      items: [
        {
          name: 'Tandoori Chicken',
          quantity: 1,
          price: 400,
        },
        {
          name: 'Garlic Bread',
          quantity: 1,
          price: 150,
        },
      ],
      subtotal: 550,
      delivery_fee: 60,
      commission: 82.5,
      tax: 136.8,
      total: 829.3,
      order_time: '2024-11-10T12:00:00Z',
    },
  },

  orderConfirmed: {
    event: 'order.confirmed',
    timestamp: '2024-11-10T12:05:00Z',
    data: {
      order_id: 'UBER345678',
      restaurant_id: 'rest_003',
      confirmed_at: '2024-11-10T12:05:00Z',
    },
  },

  orderStatusChanged: {
    event: 'order.status_changed',
    timestamp: '2024-11-10T12:15:00Z',
    data: {
      order_id: 'UBER345678',
      restaurant_id: 'rest_003',
      status: 'preparing',
      updated_at: '2024-11-10T12:15:00Z',
    },
  },

  orderDelivered: {
    event: 'order.delivered',
    timestamp: '2024-11-10T13:00:00Z',
    data: {
      order_id: 'UBER345678',
      restaurant_id: 'rest_003',
      delivered_at: '2024-11-10T13:00:00Z',
      rating: 5,
      feedback: 'Excellent service and food quality',
    },
  },

  orderCancelled: {
    event: 'order.cancelled',
    timestamp: '2024-11-10T12:10:00Z',
    data: {
      order_id: 'UBER345678',
      restaurant_id: 'rest_003',
      cancelled_at: '2024-11-10T12:10:00Z',
      reason: 'Customer cancelled',
      refund_amount: 829.3,
    },
  },

  driverLocationUpdated: {
    event: 'driver_location_updated',
    timestamp: '2024-11-10T12:45:00Z',
    data: {
      order_id: 'UBER345678',
      driver_id: 'DR789',
      driver_name: 'Amit Patel',
      latitude: 28.6139,
      longitude: 77.209,
      updated_at: '2024-11-10T12:45:00Z',
    },
  },
};

/**
 * Test Utilities
 */

export class WebhookTestUtils {
  /**
   * Generate random order ID
   */
  static generateOrderId(platform: string): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 8);
    return `${platform.toUpperCase()}${timestamp}${random}`.toUpperCase();
  }

  /**
   * Generate random customer phone
   */
  static generateCustomerPhone(): string {
    const prefix = '+91';
    const number = Math.floor(Math.random() * 9000000000) + 1000000000;
    return `${prefix}${number}`;
  }

  /**
   * Generate random delivery address
   */
  static generateDeliveryAddress(): string {
    const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Elm St', 'Maple Ave'];
    const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad'];
    const states = ['KA', 'MH', 'DL', 'MH', 'TG'];
    const zips = ['560001', '400001', '110001', '411001', '500001'];

    const street = streets[Math.floor(Math.random() * streets.length)];
    const number = Math.floor(Math.random() * 1000) + 1;
    const city = cities[Math.floor(Math.random() * cities.length)];
    const state = states[Math.floor(Math.random() * states.length)];
    const zip = zips[Math.floor(Math.random() * zips.length)];

    return `${number} ${street}, ${city}, ${state} ${zip}`;
  }

  /**
   * Generate random items
   */
  static generateItems(count: number = 2): any[] {
    const dishes = [
      { name: 'Butter Chicken', price: 350 },
      { name: 'Paneer Tikka', price: 250 },
      { name: 'Tandoori Chicken', price: 400 },
      { name: 'Biryani', price: 350 },
      { name: 'Naan', price: 80 },
      { name: 'Garlic Bread', price: 150 },
      { name: 'Samosa', price: 50 },
      { name: 'Gulab Jamun', price: 100 },
    ];

    const items = [];
    for (let i = 0; i < count; i++) {
      const dish = dishes[Math.floor(Math.random() * dishes.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      items.push({
        name: dish.name,
        quantity,
        price: dish.price,
      });
    }

    return items;
  }

  /**
   * Calculate order totals
   */
  static calculateTotals(items: any[], deliveryFee: number = 50): any {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const commission = subtotal * 0.15; // 15% commission
    const tax = (subtotal + deliveryFee) * 0.18; // 18% GST

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee,
      commission: Math.round(commission * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round((subtotal + deliveryFee + tax) * 100) / 100,
    };
  }

  /**
   * Generate Swiggy webhook payload
   */
  static generateSwiggyPayload(event: string, orderId?: string): any {
    const id = orderId || this.generateOrderId('SWIGGY');
    const timestamp = Math.floor(Date.now() / 1000);

    const basePayload = {
      event,
      timestamp,
      data: {
        order_id: id,
        restaurant_id: 'rest_001',
        customer_name: 'Customer Name',
        customer_phone: this.generateCustomerPhone(),
        delivery_address: this.generateDeliveryAddress(),
      },
    };

    if (event === 'order_placed') {
      const items = this.generateItems();
      const totals = this.calculateTotals(items);
      return {
        ...basePayload,
        data: {
          ...basePayload.data,
          items,
          ...totals,
          order_time: timestamp,
        },
      };
    }

    return basePayload;
  }

  /**
   * Generate Zomato webhook payload
   */
  static generateZomatoPayload(event: string, orderId?: string): any {
    const id = orderId || this.generateOrderId('ZOMATO');
    const timestamp = new Date().toISOString();

    const basePayload = {
      event,
      timestamp,
      data: {
        order_id: id,
        restaurant_id: 'rest_002',
        customer_name: 'Customer Name',
        customer_phone: this.generateCustomerPhone(),
        delivery_address: this.generateDeliveryAddress(),
      },
    };

    if (event === 'order_received') {
      const items = this.generateItems();
      const totals = this.calculateTotals(items);
      return {
        ...basePayload,
        data: {
          ...basePayload.data,
          items,
          ...totals,
          order_time: timestamp,
        },
      };
    }

    return basePayload;
  }

  /**
   * Generate Uber Eats webhook payload
   */
  static generateUberEatsPayload(event: string, orderId?: string): any {
    const id = orderId || this.generateOrderId('UBER');
    const timestamp = new Date().toISOString();

    const basePayload = {
      event,
      timestamp,
      data: {
        order_id: id,
        restaurant_id: 'rest_003',
        customer_name: 'Customer Name',
        customer_phone: this.generateCustomerPhone(),
        delivery_address: this.generateDeliveryAddress(),
      },
    };

    if (event === 'order.created') {
      const items = this.generateItems();
      const totals = this.calculateTotals(items);
      return {
        ...basePayload,
        data: {
          ...basePayload.data,
          items,
          ...totals,
          order_time: timestamp,
        },
      };
    }

    return basePayload;
  }

  /**
   * Simulate webhook delivery
   */
  static async simulateWebhookDelivery(
    endpoint: string,
    payload: any,
    signature?: string
  ): Promise<any> {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (signature) {
      headers['x-signature'] = signature;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    return response.json();
  }
}

export default WebhookTestUtils;
