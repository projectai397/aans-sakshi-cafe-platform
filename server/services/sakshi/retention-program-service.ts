/**
 * Customer Retention Program Service
 * Win-back campaigns, engagement scoring, and personalized re-engagement offers
 */

type ChurnRiskLevel = 'low' | 'medium' | 'high' | 'critical';
type EngagementLevel = 'highly_engaged' | 'engaged' | 'at_risk' | 'churned';
type CampaignType = 'win_back' | 'engagement' | 'loyalty' | 'vip' | 'seasonal';
type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';

interface CustomerEngagement {
  customerId: string;
  lastOrderDate: Date;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  daysSinceLastOrder: number;
  orderFrequency: number; // orders per month
  engagementScore: number; // 0-100
  engagementLevel: EngagementLevel;
  churnRiskLevel: ChurnRiskLevel;
  churnProbability: number; // 0-1
  preferredCategories: string[];
  preferredPaymentMethod: string;
  lastInteraction: Date;
  emailEngagement: number; // 0-100
  appEngagement: number; // 0-100
}

interface RetentionCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetSegment: {
    churnRiskLevel?: ChurnRiskLevel;
    engagementLevel?: EngagementLevel;
    daysSinceLastOrder?: { min: number; max: number };
    orderCount?: { min: number; max: number };
  };
  offer: {
    type: 'discount' | 'free_item' | 'loyalty_points' | 'free_delivery';
    value: number;
    minOrderValue?: number;
    maxUsagePerCustomer?: number;
  };
  channels: Array<'email' | 'sms' | 'push' | 'in_app'>;
  startDate: Date;
  endDate: Date;
  budget: number;
  spent: number;
  targetAudience: number;
  reached: number;
  converted: number;
  roi: number;
  createdAt: Date;
}

interface WinBackOffer {
  id: string;
  customerId: string;
  campaignId: string;
  offerType: string;
  offerValue: number;
  expiryDate: Date;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  sentAt?: Date;
  acceptedAt?: Date;
  usedAt?: Date;
  createdAt: Date;
}

interface EngagementAction {
  id: string;
  customerId: string;
  actionType: 'email_open' | 'email_click' | 'push_click' | 'app_open' | 'order_placed' | 'review_submitted';
  timestamp: Date;
  metadata?: Record<string, any>;
}

class RetentionProgramService {
  private engagements: Map<string, CustomerEngagement> = new Map();
  private campaigns: Map<string, RetentionCampaign> = new Map();
  private offers: Map<string, WinBackOffer> = new Map();
  private actions: EngagementAction[] = [];

  /**
   * Calculate engagement score
   */
  async calculateEngagementScore(customerId: string, engagement: Omit<CustomerEngagement, 'engagementScore' | 'engagementLevel' | 'churnRiskLevel' | 'churnProbability'>): Promise<CustomerEngagement> {
    const daysSinceLastOrder = engagement.daysSinceLastOrder;
    const orderFrequency = engagement.orderFrequency;
    const totalSpent = engagement.totalSpent;
    const averageOrderValue = engagement.averageOrderValue;

    // Calculate engagement score (0-100)
    let score = 0;

    // Recency (40 points)
    if (daysSinceLastOrder <= 7) score += 40;
    else if (daysSinceLastOrder <= 30) score += 30;
    else if (daysSinceLastOrder <= 60) score += 20;
    else if (daysSinceLastOrder <= 90) score += 10;

    // Frequency (30 points)
    if (orderFrequency >= 4) score += 30;
    else if (orderFrequency >= 2) score += 20;
    else if (orderFrequency >= 1) score += 10;

    // Monetary (30 points)
    if (totalSpent >= 10000) score += 30;
    else if (totalSpent >= 5000) score += 20;
    else if (totalSpent >= 1000) score += 10;

    // Determine engagement level
    let engagementLevel: EngagementLevel;
    if (score >= 80) engagementLevel = 'highly_engaged';
    else if (score >= 60) engagementLevel = 'engaged';
    else if (score >= 30) engagementLevel = 'at_risk';
    else engagementLevel = 'churned';

    // Calculate churn probability
    const churnProbability = Math.max(0, Math.min(1, (100 - score) / 100));

    // Determine churn risk level
    let churnRiskLevel: ChurnRiskLevel;
    if (churnProbability >= 0.75) churnRiskLevel = 'critical';
    else if (churnProbability >= 0.5) churnRiskLevel = 'high';
    else if (churnProbability >= 0.25) churnRiskLevel = 'medium';
    else churnRiskLevel = 'low';

    const fullEngagement: CustomerEngagement = {
      ...engagement,
      customerId,
      engagementScore: score,
      engagementLevel,
      churnRiskLevel,
      churnProbability,
    };

    this.engagements.set(customerId, fullEngagement);
    return fullEngagement;
  }

  /**
   * Get engagement
   */
  async getEngagement(customerId: string): Promise<CustomerEngagement | null> {
    return this.engagements.get(customerId) || null;
  }

  /**
   * Get customers at risk
   */
  async getCustomersAtRisk(riskLevel?: ChurnRiskLevel): Promise<CustomerEngagement[]> {
    let customers = Array.from(this.engagements.values()).filter((e) => e.churnRiskLevel !== 'low');

    if (riskLevel) {
      customers = customers.filter((e) => e.churnRiskLevel === riskLevel);
    }

    return customers.sort((a, b) => b.churnProbability - a.churnProbability);
  }

  /**
   * Create retention campaign
   */
  async createCampaign(campaign: Omit<RetentionCampaign, 'id | spent | reached | converted | roi | createdAt'>): Promise<RetentionCampaign> {
    const fullCampaign: RetentionCampaign = {
      ...campaign,
      id: `CAMPAIGN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      spent: 0,
      reached: 0,
      converted: 0,
      roi: 0,
      createdAt: new Date(),
    };

    this.campaigns.set(fullCampaign.id, fullCampaign);
    return fullCampaign;
  }

  /**
   * Get campaign
   */
  async getCampaign(campaignId: string): Promise<RetentionCampaign | null> {
    return this.campaigns.get(campaignId) || null;
  }

  /**
   * Get all campaigns
   */
  async getAllCampaigns(status?: CampaignStatus): Promise<RetentionCampaign[]> {
    let campaigns = Array.from(this.campaigns.values());

    if (status) {
      campaigns = campaigns.filter((c) => c.status === status);
    }

    return campaigns;
  }

  /**
   * Launch campaign
   */
  async launchCampaign(campaignId: string): Promise<RetentionCampaign> {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    campaign.status = 'active';

    // Get target customers
    const targetCustomers = await this.getCustomersAtRisk();
    const filtered = targetCustomers.filter((c) => {
      if (campaign.targetSegment.churnRiskLevel && c.churnRiskLevel !== campaign.targetSegment.churnRiskLevel) return false;
      if (campaign.targetSegment.engagementLevel && c.engagementLevel !== campaign.targetSegment.engagementLevel) return false;
      if (campaign.targetSegment.daysSinceLastOrder) {
        const { min, max } = campaign.targetSegment.daysSinceLastOrder;
        if (c.daysSinceLastOrder < min || c.daysSinceLastOrder > max) return false;
      }
      return true;
    });

    campaign.targetAudience = filtered.length;

    // Create offers for each customer
    for (const customer of filtered) {
      await this.createWinBackOffer(customer.customerId, campaignId, campaign.offer);
    }

    return campaign;
  }

  /**
   * Create win-back offer
   */
  async createWinBackOffer(customerId: string, campaignId: string, offer: RetentionCampaign['offer']): Promise<WinBackOffer> {
    const winBackOffer: WinBackOffer = {
      id: `OFFER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      campaignId,
      offerType: offer.type,
      offerValue: offer.value,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'pending',
      createdAt: new Date(),
    };

    this.offers.set(winBackOffer.id, winBackOffer);

    // Update campaign reached count
    const campaign = this.campaigns.get(campaignId);
    if (campaign) {
      campaign.reached++;
    }

    return winBackOffer;
  }

  /**
   * Send offer
   */
  async sendOffer(offerId: string): Promise<WinBackOffer> {
    const offer = this.offers.get(offerId);
    if (!offer) {
      throw new Error(`Offer ${offerId} not found`);
    }

    offer.status = 'sent';
    offer.sentAt = new Date();

    return offer;
  }

  /**
   * Accept offer
   */
  async acceptOffer(offerId: string): Promise<WinBackOffer> {
    const offer = this.offers.get(offerId);
    if (!offer) {
      throw new Error(`Offer ${offerId} not found`);
    }

    offer.status = 'accepted';
    offer.acceptedAt = new Date();

    // Update campaign converted count
    const campaign = this.campaigns.get(offer.campaignId);
    if (campaign) {
      campaign.converted++;
      campaign.roi = ((campaign.converted * 500 - campaign.spent) / campaign.spent) * 100; // Assume ₹500 avg order value
    }

    return offer;
  }

  /**
   * Reject offer
   */
  async rejectOffer(offerId: string): Promise<WinBackOffer> {
    const offer = this.offers.get(offerId);
    if (!offer) {
      throw new Error(`Offer ${offerId} not found`);
    }

    offer.status = 'rejected';
    return offer;
  }

  /**
   * Get offers for customer
   */
  async getOffersForCustomer(customerId: string): Promise<WinBackOffer[]> {
    return Array.from(this.offers.values()).filter((o) => o.customerId === customerId);
  }

  /**
   * Record engagement action
   */
  async recordAction(action: Omit<EngagementAction, 'id'>): Promise<EngagementAction> {
    const fullAction: EngagementAction = {
      ...action,
      id: `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.actions.push(fullAction);

    // Update engagement score
    const engagement = await this.getEngagement(action.customerId);
    if (engagement) {
      if (action.actionType === 'order_placed') {
        engagement.lastOrderDate = new Date();
        engagement.orderCount++;
        engagement.daysSinceLastOrder = 0;
      }
    }

    return fullAction;
  }

  /**
   * Get customer actions
   */
  async getCustomerActions(customerId: string, days: number = 30): Promise<EngagementAction[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return this.actions.filter((a) => a.customerId === customerId && a.timestamp >= cutoffDate);
  }

  /**
   * Get retention analytics
   */
  async getRetentionAnalytics(): Promise<any> {
    const allEngagements = Array.from(this.engagements.values());
    const allCampaigns = Array.from(this.campaigns.values());

    const analytics = {
      totalCustomers: allEngagements.length,
      highlyEngaged: allEngagements.filter((e) => e.engagementLevel === 'highly_engaged').length,
      engaged: allEngagements.filter((e) => e.engagementLevel === 'engaged').length,
      atRisk: allEngagements.filter((e) => e.engagementLevel === 'at_risk').length,
      churned: allEngagements.filter((e) => e.engagementLevel === 'churned').length,
      averageEngagementScore: (allEngagements.reduce((sum, e) => sum + e.engagementScore, 0) / Math.max(1, allEngagements.length)).toFixed(2),
      churnRate: (
        (allEngagements.filter((e) => e.engagementLevel === 'churned').length / Math.max(1, allEngagements.length)) *
        100
      ).toFixed(2),
      activeCampaigns: allCampaigns.filter((c) => c.status === 'active').length,
      totalCampaignBudget: allCampaigns.reduce((sum, c) => sum + c.budget, 0),
      totalCampaignSpent: allCampaigns.reduce((sum, c) => sum + c.spent, 0),
      averageCampaignROI: (allCampaigns.reduce((sum, c) => sum + c.roi, 0) / Math.max(1, allCampaigns.length)).toFixed(2),
    };

    return analytics;
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(customerId: string): Promise<any> {
    const engagement = await this.getEngagement(customerId);
    if (!engagement) {
      throw new Error(`Customer ${customerId} not found`);
    }

    const recommendations: any[] = [];

    // Based on churn risk
    if (engagement.churnRiskLevel === 'critical') {
      recommendations.push({
        type: 'urgent_offer',
        description: 'Offer significant discount to win back customer',
        discount: 30,
        priority: 'critical',
      });
    } else if (engagement.churnRiskLevel === 'high') {
      recommendations.push({
        type: 'loyalty_offer',
        description: 'Offer loyalty points or free item',
        priority: 'high',
      });
    }

    // Based on order frequency
    if (engagement.orderFrequency < 1) {
      recommendations.push({
        type: 'engagement_campaign',
        description: 'Send personalized recommendations based on past orders',
        priority: 'high',
      });
    }

    // Based on preferred categories
    if (engagement.preferredCategories.length > 0) {
      recommendations.push({
        type: 'category_promotion',
        description: `Promote ${engagement.preferredCategories[0]} category`,
        category: engagement.preferredCategories[0],
        priority: 'medium',
      });
    }

    return recommendations;
  }

  /**
   * Get campaign performance
   */
  async getCampaignPerformance(campaignId: string): Promise<any> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const conversionRate = campaign.reached > 0 ? ((campaign.converted / campaign.reached) * 100).toFixed(2) : 0;
    const costPerConversion = campaign.converted > 0 ? (campaign.spent / campaign.converted).toFixed(2) : 0;

    return {
      campaignId: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      targetAudience: campaign.targetAudience,
      reached: campaign.reached,
      converted: campaign.converted,
      conversionRate,
      budget: campaign.budget,
      spent: campaign.spent,
      roi: campaign.roi.toFixed(2),
      costPerConversion,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
    };
  }
}

export default RetentionProgramService;
