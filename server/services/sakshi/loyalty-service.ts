/**
 * Customer Loyalty Service
 * Seva Token integration, rewards management, and loyalty program
 */

type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum';
type RewardType = 'points' | 'discount' | 'free_item' | 'seva_token' | 'cashback';
type TransactionType = 'order' | 'referral' | 'review' | 'birthday' | 'milestone';

interface LoyaltyMember {
  id: string;
  userId: string;
  email: string;
  phone: string;
  name: string;
  tier: TierLevel;
  totalPoints: number;
  sevaTokens: number; // cross-division currency
  totalSpent: number; // lifetime value
  totalOrders: number;
  joinDate: Date;
  lastOrderDate?: Date;
  referralCode: string;
  referredBy?: string;
  preferences: {
    favoriteItems: string[];
    dietaryRestrictions: string[];
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

interface PointsTransaction {
  id: string;
  memberId: string;
  type: TransactionType;
  points: number;
  sevaTokens: number;
  description: string;
  orderId?: string;
  referralId?: string;
  expiryDate?: Date;
  status: 'pending' | 'credited' | 'redeemed' | 'expired';
  createdAt: Date;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsRequired: number;
  sevaTokensRequired?: number;
  value: number; // discount amount or item value
  category: string;
  validUntil: Date;
  maxRedemptions?: number;
  currentRedemptions: number;
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
}

interface RewardRedemption {
  id: string;
  memberId: string;
  rewardId: string;
  orderId?: string;
  pointsUsed: number;
  sevaTokensUsed: number;
  discountValue: number;
  status: 'pending' | 'applied' | 'completed' | 'cancelled';
  redeemedAt: Date;
  expiryDate?: Date;
}

interface TierBenefit {
  tier: TierLevel;
  minSpent: number; // minimum lifetime spending
  pointsMultiplier: number; // 1x, 1.5x, 2x, 2.5x
  sevaTokenBonus: number; // bonus tokens per order
  exclusiveRewards: string[];
  birthdayBonus: number; // bonus points on birthday
  referralBonus: number; // bonus points for referral
}

interface SevaTokenExchange {
  id: string;
  fromDivision: string; // 'sakshi_cafe'
  toDivision: string; // other AANS divisions
  memberId: string;
  sevaTokens: number;
  exchangeRate: number; // tokens to points conversion
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
}

class LoyaltyService {
  private members: Map<string, LoyaltyMember> = new Map();
  private transactions: Map<string, PointsTransaction> = new Map();
  private rewards: Map<string, Reward> = new Map();
  private redemptions: Map<string, RewardRedemption> = new Map();
  private sevaExchanges: Map<string, SevaTokenExchange> = new Map();

  private tierBenefits: Record<TierLevel, TierBenefit> = {
    bronze: {
      tier: 'bronze',
      minSpent: 0,
      pointsMultiplier: 1,
      sevaTokenBonus: 0,
      exclusiveRewards: [],
      birthdayBonus: 100,
      referralBonus: 50,
    },
    silver: {
      tier: 'silver',
      minSpent: 5000,
      pointsMultiplier: 1.25,
      sevaTokenBonus: 1,
      exclusiveRewards: ['silver_exclusive_discount'],
      birthdayBonus: 150,
      referralBonus: 100,
    },
    gold: {
      tier: 'gold',
      minSpent: 15000,
      pointsMultiplier: 1.5,
      sevaTokenBonus: 2,
      exclusiveRewards: ['gold_exclusive_discount', 'free_item_monthly'],
      birthdayBonus: 250,
      referralBonus: 200,
    },
    platinum: {
      tier: 'platinum',
      minSpent: 50000,
      pointsMultiplier: 2,
      sevaTokenBonus: 5,
      exclusiveRewards: ['platinum_vip_access', 'priority_delivery', 'concierge_service'],
      birthdayBonus: 500,
      referralBonus: 500,
    },
  };

  /**
   * Member Management
   */

  async createMember(memberData: Partial<LoyaltyMember>): Promise<LoyaltyMember> {
    const id = memberData.id || `MEMBER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const referralCode = this.generateReferralCode();

    const member: LoyaltyMember = {
      id,
      userId: memberData.userId || '',
      email: memberData.email || '',
      phone: memberData.phone || '',
      name: memberData.name || '',
      tier: 'bronze',
      totalPoints: 0,
      sevaTokens: 0,
      totalSpent: 0,
      totalOrders: 0,
      joinDate: new Date(),
      referralCode,
      preferences: memberData.preferences || {
        favoriteItems: [],
        dietaryRestrictions: [],
        notificationPreferences: {
          email: true,
          sms: true,
          push: true,
        },
      },
      status: 'active',
      createdAt: new Date(),
    };

    this.members.set(id, member);
    return member;
  }

  async getMember(memberId: string): Promise<LoyaltyMember | null> {
    return this.members.get(memberId) || null;
  }

  async getMemberByEmail(email: string): Promise<LoyaltyMember | null> {
    for (const member of this.members.values()) {
      if (member.email === email) return member;
    }
    return null;
  }

  async getMemberByReferralCode(code: string): Promise<LoyaltyMember | null> {
    for (const member of this.members.values()) {
      if (member.referralCode === code) return member;
    }
    return null;
  }

  async updateMember(memberId: string, updates: Partial<LoyaltyMember>): Promise<LoyaltyMember | null> {
    const member = this.members.get(memberId);
    if (!member) return null;

    const updated = { ...member, ...updates };
    this.members.set(memberId, updated);
    return updated;
  }

  /**
   * Points Management
   */

  async addPoints(memberId: string, points: number, type: TransactionType, description: string, orderId?: string): Promise<PointsTransaction> {
    const member = this.members.get(memberId);
    if (!member) throw new Error('Member not found');

    const id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Apply tier multiplier
    const tierBenefit = this.tierBenefits[member.tier];
    const multipliedPoints = Math.floor(points * tierBenefit.pointsMultiplier);
    const sevaTokens = tierBenefit.sevaTokenBonus;

    const transaction: PointsTransaction = {
      id,
      memberId,
      type,
      points: multipliedPoints,
      sevaTokens,
      description,
      orderId,
      status: 'credited',
      createdAt: new Date(),
    };

    this.transactions.set(id, transaction);

    // Update member
    member.totalPoints += multipliedPoints;
    member.sevaTokens += sevaTokens;
    this.members.set(memberId, member);

    // Check and update tier
    await this.updateTierIfEligible(memberId);

    return transaction;
  }

  async getPointsHistory(memberId: string, limit: number = 50): Promise<PointsTransaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.memberId === memberId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Tier Management
   */

  private async updateTierIfEligible(memberId: string): Promise<void> {
    const member = this.members.get(memberId);
    if (!member) return;

    const tiers: TierLevel[] = ['platinum', 'gold', 'silver', 'bronze'];

    for (const tier of tiers) {
      const benefit = this.tierBenefits[tier];
      if (member.totalSpent >= benefit.minSpent) {
        if (member.tier !== tier) {
          member.tier = tier;
          this.members.set(memberId, member);

          // Award tier upgrade bonus
          await this.addPoints(memberId, benefit.birthdayBonus, 'milestone', `Upgraded to ${tier} tier`);
        }
        break;
      }
    }
  }

  async getTierBenefits(tier: TierLevel): Promise<TierBenefit> {
    return this.tierBenefits[tier];
  }

  /**
   * Reward Management
   */

  async createReward(rewardData: Partial<Reward>): Promise<Reward> {
    const id = rewardData.id || `REWARD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const reward: Reward = {
      id,
      name: rewardData.name || '',
      description: rewardData.description || '',
      type: rewardData.type || 'discount',
      pointsRequired: rewardData.pointsRequired || 0,
      sevaTokensRequired: rewardData.sevaTokensRequired,
      value: rewardData.value || 0,
      category: rewardData.category || '',
      validUntil: rewardData.validUntil || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxRedemptions: rewardData.maxRedemptions,
      currentRedemptions: 0,
      status: 'active',
      createdAt: new Date(),
    };

    this.rewards.set(id, reward);
    return reward;
  }

  async getReward(rewardId: string): Promise<Reward | null> {
    return this.rewards.get(rewardId) || null;
  }

  async getAvailableRewards(memberId: string): Promise<Reward[]> {
    const member = this.members.get(memberId);
    if (!member) return [];

    return Array.from(this.rewards.values()).filter((reward) => {
      // Check if reward is active and not expired
      if (reward.status !== 'active' || reward.validUntil < new Date()) {
        return false;
      }

      // Check if member has enough points
      if (member.totalPoints < reward.pointsRequired) {
        return false;
      }

      // Check if max redemptions reached
      if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
        return false;
      }

      return true;
    });
  }

  /**
   * Reward Redemption
   */

  async redeemReward(memberId: string, rewardId: string, orderId?: string): Promise<RewardRedemption | null> {
    const member = this.members.get(memberId);
    const reward = this.rewards.get(rewardId);

    if (!member || !reward) return null;

    // Validate member has enough points
    if (member.totalPoints < reward.pointsRequired) {
      return null;
    }

    // Validate reward hasn't reached max redemptions
    if (reward.maxRedemptions && reward.currentRedemptions >= reward.maxRedemptions) {
      return null;
    }

    const id = `REDEMPTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const redemption: RewardRedemption = {
      id,
      memberId,
      rewardId,
      orderId,
      pointsUsed: reward.pointsRequired,
      sevaTokensUsed: reward.sevaTokensRequired || 0,
      discountValue: reward.value,
      status: 'pending',
      redeemedAt: new Date(),
    };

    this.redemptions.set(id, redemption);

    // Deduct points from member
    member.totalPoints -= reward.pointsRequired;
    if (reward.sevaTokensRequired) {
      member.sevaTokens -= reward.sevaTokensRequired;
    }
    this.members.set(memberId, member);

    // Increment reward redemptions
    reward.currentRedemptions++;
    this.rewards.set(rewardId, reward);

    return redemption;
  }

  async completeRedemption(redemptionId: string): Promise<RewardRedemption | null> {
    const redemption = this.redemptions.get(redemptionId);
    if (!redemption) return null;

    redemption.status = 'completed';
    this.redemptions.set(redemptionId, redemption);
    return redemption;
  }

  async getRedemptionHistory(memberId: string): Promise<RewardRedemption[]> {
    return Array.from(this.redemptions.values())
      .filter((r) => r.memberId === memberId)
      .sort((a, b) => b.redeemedAt.getTime() - a.redeemedAt.getTime());
  }

  /**
   * Referral Program
   */

  async processReferral(referrerId: string, newMemberId: string): Promise<PointsTransaction | null> {
    const referrer = this.members.get(referrerId);
    const newMember = this.members.get(newMemberId);

    if (!referrer || !newMember) return null;

    const tierBenefit = this.tierBenefits[referrer.tier];
    const bonusPoints = tierBenefit.referralBonus;

    const transaction = await this.addPoints(referrerId, bonusPoints, 'referral', `Referral bonus for ${newMember.name}`, newMemberId);

    newMember.referredBy = referrerId;
    this.members.set(newMemberId, newMember);

    return transaction;
  }

  /**
   * Seva Token Management (Cross-division)
   */

  async exchangeSevaTokens(memberId: string, sevaTokens: number, toDivision: string): Promise<SevaTokenExchange | null> {
    const member = this.members.get(memberId);
    if (!member || member.sevaTokens < sevaTokens) return null;

    const id = `EXCHANGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const exchangeRate = 1; // 1 Seva Token = 1 unit in other division

    const exchange: SevaTokenExchange = {
      id,
      fromDivision: 'sakshi_cafe',
      toDivision,
      memberId,
      sevaTokens,
      exchangeRate,
      status: 'pending',
      createdAt: new Date(),
    };

    this.sevaExchanges.set(id, exchange);

    // Deduct tokens
    member.sevaTokens -= sevaTokens;
    this.members.set(memberId, member);

    return exchange;
  }

  async completeSevaExchange(exchangeId: string): Promise<SevaTokenExchange | null> {
    const exchange = this.sevaExchanges.get(exchangeId);
    if (!exchange) return null;

    exchange.status = 'completed';
    exchange.completedAt = new Date();
    this.sevaExchanges.set(exchangeId, exchange);
    return exchange;
  }

  /**
   * Analytics
   */

  async getLoyaltyMetrics(): Promise<any> {
    const members = Array.from(this.members.values());
    const activeMembers = members.filter((m) => m.status === 'active');
    const totalPoints = members.reduce((sum, m) => sum + m.totalPoints, 0);
    const totalSevaTokens = members.reduce((sum, m) => sum + m.sevaTokens, 0);

    const tierDistribution: Record<TierLevel, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    for (const member of members) {
      tierDistribution[member.tier]++;
    }

    return {
      totalMembers: members.length,
      activeMembers: activeMembers.length,
      totalPoints,
      totalSevaTokens,
      tierDistribution,
      averageLifetimeValue: members.length > 0 ? members.reduce((sum, m) => sum + m.totalSpent, 0) / members.length : 0,
      averagePointsPerMember: members.length > 0 ? totalPoints / members.length : 0,
    };
  }

  async getMemberMetrics(memberId: string): Promise<any> {
    const member = this.members.get(memberId);
    if (!member) return null;

    const transactions = Array.from(this.transactions.values()).filter((t) => t.memberId === memberId);
    const redemptions = Array.from(this.redemptions.values()).filter((r) => r.memberId === memberId);

    return {
      member,
      totalTransactions: transactions.length,
      totalRedemptions: redemptions.length,
      pointsEarned: transactions.filter((t) => t.status === 'credited').reduce((sum, t) => sum + t.points, 0),
      pointsRedeemed: redemptions.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.pointsUsed, 0),
      sevaTokensEarned: transactions.filter((t) => t.status === 'credited').reduce((sum, t) => sum + t.sevaTokens, 0),
    };
  }

  /**
   * Utility Functions
   */

  private generateReferralCode(): string {
    return `REFER-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }

  async cleanupExpiredRewards(): Promise<number> {
    let expiredCount = 0;

    for (const [id, reward] of this.rewards.entries()) {
      if (reward.validUntil < new Date()) {
        reward.status = 'expired';
        this.rewards.set(id, reward);
        expiredCount++;
      }
    }

    return expiredCount;
  }
}

export default LoyaltyService;
