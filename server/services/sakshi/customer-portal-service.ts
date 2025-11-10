/**
 * Customer Portal Service
 * Customer-facing dashboard with order history, loyalty, and recommendations
 */

interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  addresses: Address[];
  preferences: CustomerPreferences;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalOrders: number;
  totalSpent: number;
  joinedAt: Date;
  lastOrderAt?: Date;
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface CustomerPreferences {
  notifications: boolean;
  emailMarketing: boolean;
  smsMarketing: boolean;
  language: string;
  currency: string;
  dietaryRestrictions: string[];
  favoriteItems: string[];
  allergies: string[];
}

interface CustomerOrder {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  platform: 'app' | 'website' | 'swiggy' | 'zomato' | 'uber_eats';
  deliveryAddress: Address;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  rating?: number;
  review?: string;
  createdAt: Date;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

interface Recommendation {
  id: string;
  type: 'popular' | 'personalized' | 'seasonal' | 'new' | 'trending';
  itemId: string;
  itemName: string;
  itemImage: string;
  price: number;
  reason: string;
  relevanceScore: number;
}

interface LoyaltyInfo {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  pointsToNextTier: number;
  benefits: string[];
  redeemableRewards: Reward[];
  sevaTokens: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discount?: number;
  expiresAt?: Date;
}

interface CustomerDashboard {
  profile: CustomerProfile;
  recentOrders: CustomerOrder[];
  loyaltyInfo: LoyaltyInfo;
  recommendations: Recommendation[];
  upcomingOrders: CustomerOrder[];
  savedItems: string[];
  favoriteRestaurants: string[];
}

class CustomerPortalService {
  private customers: Map<string, CustomerProfile> = new Map();
  private orders: Map<string, CustomerOrder> = new Map();
  private recommendations: Map<string, Recommendation> = new Map();
  private rewards: Map<string, Reward> = new Map();
  private savedItems: Map<string, string[]> = new Map(); // customerId -> itemIds

  /**
   * Get customer profile
   */
  async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    return this.customers.get(customerId) || null;
  }

  /**
   * Update customer profile
   */
  async updateCustomerProfile(customerId: string, updates: Partial<CustomerProfile>): Promise<CustomerProfile> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    Object.assign(customer, updates);
    return customer;
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId: string, limit: number = 10): Promise<CustomerOrder[]> {
    return Array.from(this.orders.values())
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get customer order details
   */
  async getOrderDetails(orderId: string): Promise<CustomerOrder | null> {
    return this.orders.get(orderId) || null;
  }

  /**
   * Rate and review order
   */
  async rateAndReviewOrder(orderId: string, rating: number, review: string): Promise<CustomerOrder> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.rating = rating;
    order.review = review;
    return order;
  }

  /**
   * Get customer loyalty info
   */
  async getCustomerLoyaltyInfo(customerId: string): Promise<LoyaltyInfo> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const tierPoints = {
      bronze: 0,
      silver: 1000,
      gold: 5000,
      platinum: 10000,
    };

    const tierBenefits = {
      bronze: ['5% discount', 'Birthday bonus'],
      silver: ['10% discount', 'Birthday bonus', 'Free delivery on orders >₹500'],
      gold: ['15% discount', 'Birthday bonus', 'Free delivery', 'Priority support'],
      platinum: ['20% discount', 'Birthday bonus', 'Free delivery', 'Priority support', 'Exclusive items'],
    };

    const currentTierPoints = tierPoints[customer.loyaltyTier];
    const nextTierKey = Object.keys(tierPoints)[Object.keys(tierPoints).indexOf(customer.loyaltyTier) + 1];
    const nextTierPoints = nextTierKey ? tierPoints[nextTierKey as keyof typeof tierPoints] : currentTierPoints;

    return {
      tier: customer.loyaltyTier,
      points: customer.totalOrders * 50, // 50 points per order
      pointsToNextTier: Math.max(0, nextTierPoints - (customer.totalOrders * 50)),
      benefits: tierBenefits[customer.loyaltyTier],
      redeemableRewards: this.getRedeemableRewards(customer.totalOrders * 50),
      sevaTokens: Math.floor((customer.totalOrders * 50) / 100), // 1 token per 100 points
    };
  }

  /**
   * Get redeemable rewards
   */
  private getRedeemableRewards(points: number): Reward[] {
    const allRewards: Reward[] = [
      {
        id: 'REWARD-001',
        name: '₹100 Discount',
        description: 'Get ₹100 off on your next order',
        pointsRequired: 200,
        discount: 100,
      },
      {
        id: 'REWARD-002',
        name: '₹250 Discount',
        description: 'Get ₹250 off on your next order',
        pointsRequired: 500,
        discount: 250,
      },
      {
        id: 'REWARD-003',
        name: 'Free Delivery',
        description: 'Free delivery on your next order',
        pointsRequired: 150,
      },
      {
        id: 'REWARD-004',
        name: '₹500 Discount',
        description: 'Get ₹500 off on your next order',
        pointsRequired: 1000,
        discount: 500,
      },
    ];

    return allRewards.filter((r) => r.pointsRequired <= points);
  }

  /**
   * Redeem reward
   */
  async redeemReward(customerId: string, rewardId: string): Promise<any> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const reward = this.rewards.get(rewardId);
    if (!reward) {
      throw new Error(`Reward ${rewardId} not found`);
    }

    const loyaltyInfo = await this.getCustomerLoyaltyInfo(customerId);
    if (loyaltyInfo.points < reward.pointsRequired) {
      throw new Error('Insufficient points to redeem this reward');
    }

    return {
      success: true,
      reward,
      pointsDeducted: reward.pointsRequired,
      remainingPoints: loyaltyInfo.points - reward.pointsRequired,
      redeemCode: `REDEEM-${Date.now()}`,
    };
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(customerId: string, limit: number = 5): Promise<Recommendation[]> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const recommendations: Recommendation[] = [];

    // Mock recommendations based on customer preferences
    const mockRecommendations: Recommendation[] = [
      {
        id: 'REC-001',
        type: 'personalized',
        itemId: 'ITEM-001',
        itemName: 'Butter Chicken',
        itemImage: '/images/butter-chicken.jpg',
        price: 350,
        reason: 'Based on your order history',
        relevanceScore: 0.95,
      },
      {
        id: 'REC-002',
        type: 'popular',
        itemId: 'ITEM-002',
        itemName: 'Biryani',
        itemImage: '/images/biryani.jpg',
        price: 280,
        reason: 'Most popular this week',
        relevanceScore: 0.88,
      },
      {
        id: 'REC-003',
        type: 'seasonal',
        itemId: 'ITEM-003',
        itemName: 'Mango Lassi',
        itemImage: '/images/mango-lassi.jpg',
        price: 120,
        reason: 'Seasonal favorite',
        relevanceScore: 0.82,
      },
      {
        id: 'REC-004',
        type: 'new',
        itemId: 'ITEM-004',
        itemName: 'Paneer Tikka Masala',
        itemImage: '/images/paneer-tikka.jpg',
        price: 320,
        reason: 'New on our menu',
        relevanceScore: 0.85,
      },
      {
        id: 'REC-005',
        type: 'trending',
        itemId: 'ITEM-005',
        itemName: 'Garlic Naan',
        itemImage: '/images/garlic-naan.jpg',
        price: 80,
        reason: 'Trending this month',
        relevanceScore: 0.79,
      },
    ];

    return mockRecommendations.slice(0, limit);
  }

  /**
   * Get customer dashboard
   */
  async getCustomerDashboard(customerId: string): Promise<CustomerDashboard> {
    const profile = await this.getCustomerProfile(customerId);
    if (!profile) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const recentOrders = await this.getCustomerOrders(customerId, 5);
    const loyaltyInfo = await this.getCustomerLoyaltyInfo(customerId);
    const recommendations = await this.getPersonalizedRecommendations(customerId, 5);
    const upcomingOrders = recentOrders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status));
    const savedItems = this.savedItems.get(customerId) || [];

    return {
      profile,
      recentOrders,
      loyaltyInfo,
      recommendations,
      upcomingOrders,
      savedItems,
      favoriteRestaurants: ['Downtown Branch', 'Airport Branch'],
    };
  }

  /**
   * Save item for later
   */
  async saveItemForLater(customerId: string, itemId: string): Promise<void> {
    if (!this.savedItems.has(customerId)) {
      this.savedItems.set(customerId, []);
    }

    const items = this.savedItems.get(customerId)!;
    if (!items.includes(itemId)) {
      items.push(itemId);
    }
  }

  /**
   * Remove saved item
   */
  async removeSavedItem(customerId: string, itemId: string): Promise<void> {
    const items = this.savedItems.get(customerId);
    if (items) {
      const index = items.indexOf(itemId);
      if (index > -1) {
        items.splice(index, 1);
      }
    }
  }

  /**
   * Get saved items
   */
  async getSavedItems(customerId: string): Promise<string[]> {
    return this.savedItems.get(customerId) || [];
  }

  /**
   * Add address
   */
  async addAddress(customerId: string, address: Omit<Address, 'id'>): Promise<Address> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const fullAddress: Address = {
      ...address,
      id: `ADDR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    customer.addresses.push(fullAddress);
    return fullAddress;
  }

  /**
   * Update address
   */
  async updateAddress(customerId: string, addressId: string, updates: Partial<Address>): Promise<Address> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const address = customer.addresses.find((a) => a.id === addressId);
    if (!address) {
      throw new Error(`Address ${addressId} not found`);
    }

    Object.assign(address, updates);
    return address;
  }

  /**
   * Get customer statistics
   */
  async getCustomerStatistics(customerId: string): Promise<any> {
    const customer = this.customers.get(customerId);
    if (!customer) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const orders = await this.getCustomerOrders(customerId, 100);
    const deliveredOrders = orders.filter((o) => o.status === 'delivered');

    const averageOrderValue = deliveredOrders.length > 0 ? deliveredOrders.reduce((sum, o) => sum + o.total, 0) / deliveredOrders.length : 0;
    const totalSpent = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const monthsSinceJoin = Math.floor((Date.now() - customer.joinedAt.getTime()) / (30 * 24 * 60 * 60 * 1000));

    return {
      totalOrders: customer.totalOrders,
      deliveredOrders: deliveredOrders.length,
      totalSpent,
      averageOrderValue: Math.round(averageOrderValue),
      monthsSinceJoin,
      ordersPerMonth: monthsSinceJoin > 0 ? (customer.totalOrders / monthsSinceJoin).toFixed(1) : 0,
      favoriteLocation: 'Downtown Branch',
      favoriteCategory: 'Chicken',
      lastOrderDate: customer.lastOrderAt,
    };
  }
}

export default CustomerPortalService;
