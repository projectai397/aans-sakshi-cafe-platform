/**
 * Automated Promotions Engine
 * Dynamic discounts based on customer behavior, order history, and time-based triggers
 */

type PromotionType = 'percentage' | 'fixed' | 'free_item' | 'buy_one_get_one' | 'loyalty_points';
type TriggerType = 'time_based' | 'behavior_based' | 'order_history' | 'customer_segment' | 'inventory';
type PromotionStatus = 'active' | 'inactive' | 'scheduled' | 'expired';

interface Promotion {
  id: string;
  name: string;
  description: string;
  type: PromotionType;
  value: number; // percentage or fixed amount
  minOrderValue: number;
  maxDiscount: number;
  applicableItems?: string[]; // item IDs
  applicableCategories?: string[];
  triggerType: TriggerType;
  triggerConditions: Record<string, any>;
  status: PromotionStatus;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PromotionCode {
  id: string;
  code: string;
  promotionId: string;
  customerId?: string; // If specific to customer
  usageLimit: number;
  usageCount: number;
  expiryDate: Date;
  createdAt: Date;
}

interface CustomerSegment {
  id: string;
  name: string;
  criteria: {
    minOrderValue?: number;
    maxOrderValue?: number;
    minOrderCount?: number;
    maxOrderCount?: number;
    minLifetimeValue?: number;
    maxLifetimeValue?: number;
    lastOrderDaysAgo?: number;
    churnRisk?: boolean;
  };
  createdAt: Date;
}

interface PromotionEligibility {
  customerId: string;
  eligiblePromotions: Promotion[];
  recommendedPromotion: Promotion | null;
  estimatedDiscount: number;
  estimatedFinalAmount: number;
}

class PromotionsEngineService {
  private promotions: Map<string, Promotion> = new Map();
  private promotionCodes: Map<string, PromotionCode> = new Map();
  private segments: Map<string, CustomerSegment> = new Map();
  private customerPromotionHistory: Map<string, string[]> = new Map();

  /**
   * Create promotion
   */
  async createPromotion(promotion: Omit<Promotion, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<Promotion> {
    const fullPromotion: Promotion = {
      ...promotion,
      id: `PROMO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.promotions.set(fullPromotion.id, fullPromotion);
    return fullPromotion;
  }

  /**
   * Get promotion
   */
  async getPromotion(promotionId: string): Promise<Promotion | null> {
    return this.promotions.get(promotionId) || null;
  }

  /**
   * Get active promotions
   */
  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return Array.from(this.promotions.values()).filter(
      (p) => p.status === 'active' && p.startDate <= now && p.endDate >= now,
    );
  }

  /**
   * Create promotion code
   */
  async createPromotionCode(
    promotionId: string,
    code: string,
    usageLimit: number,
    expiryDate: Date,
    customerId?: string,
  ): Promise<PromotionCode> {
    const promotionCode: PromotionCode = {
      id: `CODE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code: code.toUpperCase(),
      promotionId,
      customerId,
      usageLimit,
      usageCount: 0,
      expiryDate,
      createdAt: new Date(),
    };

    this.promotionCodes.set(promotionCode.id, promotionCode);
    return promotionCode;
  }

  /**
   * Validate promotion code
   */
  async validatePromotionCode(code: string, customerId: string): Promise<{ valid: boolean; promotion?: Promotion; error?: string }> {
    const promotionCode = Array.from(this.promotionCodes.values()).find((pc) => pc.code === code.toUpperCase());

    if (!promotionCode) {
      return { valid: false, error: 'Invalid promotion code' };
    }

    if (promotionCode.expiryDate < new Date()) {
      return { valid: false, error: 'Promotion code expired' };
    }

    if (promotionCode.usageCount >= promotionCode.usageLimit) {
      return { valid: false, error: 'Promotion code usage limit exceeded' };
    }

    if (promotionCode.customerId && promotionCode.customerId !== customerId) {
      return { valid: false, error: 'Promotion code not applicable to this customer' };
    }

    const promotion = await this.getPromotion(promotionCode.promotionId);
    if (!promotion) {
      return { valid: false, error: 'Promotion not found' };
    }

    if (promotion.status !== 'active') {
      return { valid: false, error: 'Promotion is not active' };
    }

    return { valid: true, promotion };
  }

  /**
   * Apply promotion code
   */
  async applyPromotionCode(code: string, customerId: string, orderValue: number): Promise<{ discount: number; finalAmount: number; error?: string }> {
    const validation = await this.validatePromotionCode(code, customerId);

    if (!validation.valid) {
      return { discount: 0, finalAmount: orderValue, error: validation.error };
    }

    const promotion = validation.promotion!;

    // Check min order value
    if (orderValue < promotion.minOrderValue) {
      return {
        discount: 0,
        finalAmount: orderValue,
        error: `Minimum order value of ₹${promotion.minOrderValue} required`,
      };
    }

    // Calculate discount
    const discount = this.calculateDiscount(promotion, orderValue);

    // Update usage
    const promotionCode = Array.from(this.promotionCodes.values()).find((pc) => pc.code === code.toUpperCase())!;
    promotionCode.usageCount++;
    promotion.usageCount++;

    // Track usage
    const history = this.customerPromotionHistory.get(customerId) || [];
    history.push(promotion.id);
    this.customerPromotionHistory.set(customerId, history);

    return { discount, finalAmount: Math.max(0, orderValue - discount) };
  }

  /**
   * Calculate discount
   */
  private calculateDiscount(promotion: Promotion, orderValue: number): number {
    let discount = 0;

    switch (promotion.type) {
      case 'percentage':
        discount = (orderValue * promotion.value) / 100;
        break;
      case 'fixed':
        discount = promotion.value;
        break;
      case 'buy_one_get_one':
        discount = orderValue / 2; // 50% off
        break;
      case 'loyalty_points':
        discount = (orderValue * promotion.value) / 100;
        break;
    }

    // Apply max discount limit
    return Math.min(discount, promotion.maxDiscount);
  }

  /**
   * Get eligible promotions for customer
   */
  async getEligiblePromotions(customerId: string, orderValue: number, items?: string[]): Promise<Promotion[]> {
    const activePromotions = await this.getActivePromotions();
    const eligible: Promotion[] = [];

    for (const promotion of activePromotions) {
      // Check min order value
      if (orderValue < promotion.minOrderValue) continue;

      // Check usage limit
      if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) continue;

      // Check per-customer limit
      if (promotion.perCustomerLimit) {
        const history = this.customerPromotionHistory.get(customerId) || [];
        const usageCount = history.filter((p) => p === promotion.id).length;
        if (usageCount >= promotion.perCustomerLimit) continue;
      }

      // Check applicable items/categories
      if (promotion.applicableItems && items) {
        const hasApplicableItem = items.some((item) => promotion.applicableItems!.includes(item));
        if (!hasApplicableItem) continue;
      }

      // Check trigger conditions
      if (await this.checkTriggerConditions(promotion, customerId, orderValue)) {
        eligible.push(promotion);
      }
    }

    return eligible;
  }

  /**
   * Check trigger conditions
   */
  private async checkTriggerConditions(promotion: Promotion, customerId: string, orderValue: number): Promise<boolean> {
    switch (promotion.triggerType) {
      case 'time_based':
        return this.checkTimeBasedTrigger(promotion);
      case 'behavior_based':
        return this.checkBehaviorBasedTrigger(promotion, customerId);
      case 'order_history':
        return this.checkOrderHistoryTrigger(promotion, customerId);
      case 'customer_segment':
        return this.checkCustomerSegmentTrigger(promotion, customerId);
      case 'inventory':
        return this.checkInventoryTrigger(promotion);
      default:
        return true;
    }
  }

  /**
   * Check time-based trigger
   */
  private checkTimeBasedTrigger(promotion: Promotion): boolean {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const { peakHours, weekDays } = promotion.triggerConditions;

    if (peakHours && !peakHours.includes(hour)) return false;
    if (weekDays && !weekDays.includes(dayOfWeek)) return false;

    return true;
  }

  /**
   * Check behavior-based trigger
   */
  private checkBehaviorBasedTrigger(promotion: Promotion, customerId: string): boolean {
    // Simulate customer behavior check
    // In real implementation, fetch from customer data
    return Math.random() > 0.3; // 70% chance
  }

  /**
   * Check order history trigger
   */
  private checkOrderHistoryTrigger(promotion: Promotion, customerId: string): boolean {
    const history = this.customerPromotionHistory.get(customerId) || [];
    const { minOrders, maxOrders } = promotion.triggerConditions;

    if (minOrders && history.length < minOrders) return false;
    if (maxOrders && history.length > maxOrders) return false;

    return true;
  }

  /**
   * Check customer segment trigger
   */
  private checkCustomerSegmentTrigger(promotion: Promotion, customerId: string): boolean {
    // Simulate segment check
    // In real implementation, fetch customer data and check segment
    return true;
  }

  /**
   * Check inventory trigger
   */
  private checkInventoryTrigger(promotion: Promotion): boolean {
    // Simulate inventory check
    // In real implementation, check actual inventory levels
    return Math.random() > 0.2; // 80% chance
  }

  /**
   * Get promotion eligibility for customer
   */
  async getPromotionEligibility(
    customerId: string,
    orderValue: number,
    items?: string[],
  ): Promise<PromotionEligibility> {
    const eligiblePromotions = await this.getEligiblePromotions(customerId, orderValue, items);

    // Find best promotion
    let bestPromotion: Promotion | null = null;
    let maxDiscount = 0;

    for (const promotion of eligiblePromotions) {
      const discount = this.calculateDiscount(promotion, orderValue);
      if (discount > maxDiscount) {
        maxDiscount = discount;
        bestPromotion = promotion;
      }
    }

    return {
      customerId,
      eligiblePromotions,
      recommendedPromotion: bestPromotion,
      estimatedDiscount: maxDiscount,
      estimatedFinalAmount: Math.max(0, orderValue - maxDiscount),
    };
  }

  /**
   * Create customer segment
   */
  async createSegment(segment: Omit<CustomerSegment, 'id' | 'createdAt'>): Promise<CustomerSegment> {
    const fullSegment: CustomerSegment = {
      ...segment,
      id: `SEG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.segments.set(fullSegment.id, fullSegment);
    return fullSegment;
  }

  /**
   * Get segment
   */
  async getSegment(segmentId: string): Promise<CustomerSegment | null> {
    return this.segments.get(segmentId) || null;
  }

  /**
   * Get all segments
   */
  async getAllSegments(): Promise<CustomerSegment[]> {
    return Array.from(this.segments.values());
  }

  /**
   * Get promotion analytics
   */
  async getPromotionAnalytics(promotionId: string): Promise<any> {
    const promotion = await this.getPromotion(promotionId);
    if (!promotion) {
      throw new Error(`Promotion ${promotionId} not found`);
    }

    return {
      promotionId,
      name: promotion.name,
      type: promotion.type,
      usageCount: promotion.usageCount,
      usageLimit: promotion.usageLimit,
      usagePercentage: promotion.usageLimit ? (promotion.usageCount / promotion.usageLimit) * 100 : 0,
      status: promotion.status,
      daysRemaining: Math.ceil((promotion.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      estimatedRevenueLoss: promotion.usageCount * (promotion.type === 'percentage' ? (promotion.value / 100) * 500 : promotion.value),
    };
  }

  /**
   * Get all promotions analytics
   */
  async getAllPromotionsAnalytics(): Promise<any> {
    const activePromotions = await this.getActivePromotions();

    const analytics = {
      totalActivePromotions: activePromotions.length,
      totalUsage: 0,
      totalEstimatedRevenueLoss: 0,
      byType: {} as Record<PromotionType, { count: number; usage: number }>,
      topPromotions: [] as any[],
    };

    for (const promotion of activePromotions) {
      analytics.totalUsage += promotion.usageCount;
      analytics.totalEstimatedRevenueLoss += promotion.usageCount * (promotion.type === 'percentage' ? (promotion.value / 100) * 500 : promotion.value);

      if (!analytics.byType[promotion.type]) {
        analytics.byType[promotion.type] = { count: 0, usage: 0 };
      }
      analytics.byType[promotion.type].count++;
      analytics.byType[promotion.type].usage += promotion.usageCount;
    }

    // Top promotions
    analytics.topPromotions = activePromotions
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        name: p.name,
        usageCount: p.usageCount,
        type: p.type,
      }));

    return analytics;
  }
}

export default PromotionsEngineService;
