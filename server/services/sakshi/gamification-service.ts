/**
 * Gamification Service
 * Points, badges, leaderboards, and challenges for engagement
 */

type BadgeType = 'achievement' | 'milestone' | 'special' | 'seasonal';
type ChallengeStatus = 'active' | 'completed' | 'expired' | 'archived';
type LeaderboardType = 'daily' | 'weekly' | 'monthly' | 'all_time';

interface UserPoints {
  userId: string;
  userType: 'staff' | 'customer';
  totalPoints: number;
  pointsThisMonth: number;
  pointsThisWeek: number;
  level: number;
  nextLevelPoints: number;
  lastUpdated: Date;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  pointsRequired: number;
  criteria: string;
  createdAt: Date;
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team' | 'location';
  status: ChallengeStatus;
  pointsReward: number;
  startDate: Date;
  endDate: Date;
  target: number;
  progress: number;
  participants: string[];
  createdAt: Date;
}

interface Leaderboard {
  rank: number;
  userId: string;
  userName: string;
  userType: 'staff' | 'customer';
  points: number;
  badges: number;
  level: number;
  location?: string;
}

interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  pointsEarned: number;
  earnedAt: Date;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discount?: number;
  freeItem?: string;
  expiresAt?: Date;
}

class GamificationService {
  private userPoints: Map<string, UserPoints> = new Map();
  private badges: Map<string, Badge> = new Map();
  private userBadges: Map<string, UserBadge[]> = new Map();
  private challenges: Map<string, Challenge> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private rewards: Map<string, Reward> = new Map();

  constructor() {
    this.initializeDefaultBadges();
    this.initializeDefaultRewards();
  }

  /**
   * Initialize default badges
   */
  private initializeDefaultBadges(): void {
    const defaultBadges: Badge[] = [
      {
        id: 'BADGE-001',
        name: 'First Order',
        description: 'Complete your first order',
        icon: '/badges/first-order.png',
        type: 'achievement',
        pointsRequired: 0,
        criteria: 'Complete 1 order',
        createdAt: new Date(),
      },
      {
        id: 'BADGE-002',
        name: 'Loyal Customer',
        description: 'Complete 50 orders',
        icon: '/badges/loyal-customer.png',
        type: 'milestone',
        pointsRequired: 2500,
        criteria: 'Complete 50 orders',
        createdAt: new Date(),
      },
      {
        id: 'BADGE-003',
        name: 'Speed Demon',
        description: 'Complete 10 orders in one week',
        icon: '/badges/speed-demon.png',
        type: 'achievement',
        pointsRequired: 500,
        criteria: 'Complete 10 orders in 7 days',
        createdAt: new Date(),
      },
      {
        id: 'BADGE-004',
        name: 'Reviewer',
        description: 'Write 5 reviews',
        icon: '/badges/reviewer.png',
        type: 'achievement',
        pointsRequired: 250,
        criteria: 'Write 5 reviews',
        createdAt: new Date(),
      },
      {
        id: 'BADGE-005',
        name: 'Top Performer',
        description: 'Rank #1 on leaderboard',
        icon: '/badges/top-performer.png',
        type: 'special',
        pointsRequired: 5000,
        criteria: 'Rank #1 on leaderboard',
        createdAt: new Date(),
      },
    ];

    defaultBadges.forEach((b) => this.badges.set(b.id, b));
  }

  /**
   * Initialize default rewards
   */
  private initializeDefaultRewards(): void {
    const defaultRewards: Reward[] = [
      {
        id: 'REWARD-001',
        name: '₹100 Discount',
        description: 'Get ₹100 off on your next order',
        pointsRequired: 500,
        discount: 100,
      },
      {
        id: 'REWARD-002',
        name: 'Free Biryani',
        description: 'Get a free biryani on your next order',
        pointsRequired: 750,
        freeItem: 'Biryani',
      },
      {
        id: 'REWARD-003',
        name: '₹250 Discount',
        description: 'Get ₹250 off on your next order',
        pointsRequired: 1000,
        discount: 250,
      },
      {
        id: 'REWARD-004',
        name: 'Free Delivery',
        description: 'Get free delivery on your next order',
        pointsRequired: 300,
      },
    ];

    defaultRewards.forEach((r) => this.rewards.set(r.id, r));
  }

  /**
   * Add points to user
   */
  async addPoints(userId: string, userType: 'staff' | 'customer', points: number, reason: string): Promise<UserPoints> {
    let userPointsData = this.userPoints.get(userId);

    if (!userPointsData) {
      userPointsData = {
        userId,
        userType,
        totalPoints: 0,
        pointsThisMonth: 0,
        pointsThisWeek: 0,
        level: 1,
        nextLevelPoints: 1000,
        lastUpdated: new Date(),
      };
      this.userPoints.set(userId, userPointsData);
    }

    userPointsData.totalPoints += points;
    userPointsData.pointsThisMonth += points;
    userPointsData.pointsThisWeek += points;
    userPointsData.lastUpdated = new Date();

    // Update level
    const levelThresholds = [0, 1000, 2500, 5000, 10000, 20000];
    for (let i = 0; i < levelThresholds.length; i++) {
      if (userPointsData.totalPoints >= levelThresholds[i]) {
        userPointsData.level = i + 1;
        userPointsData.nextLevelPoints = levelThresholds[i + 1] || levelThresholds[i] + 10000;
      }
    }

    // Log achievement
    await this.logAchievement(userId, 'points_earned', `Earned ${points} points: ${reason}`, points);

    return userPointsData;
  }

  /**
   * Get user points
   */
  async getUserPoints(userId: string): Promise<UserPoints | null> {
    return this.userPoints.get(userId) || null;
  }

  /**
   * Earn badge
   */
  async earnBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const badge = this.badges.get(badgeId);
    if (!badge) {
      throw new Error(`Badge ${badgeId} not found`);
    }

    // Check if user already has badge
    const userBadges = this.userBadges.get(userId) || [];
    if (userBadges.some((b) => b.badgeId === badgeId)) {
      throw new Error('User already has this badge');
    }

    const userBadge: UserBadge = {
      id: `UB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      badgeId,
      earnedAt: new Date(),
    };

    if (!this.userBadges.has(userId)) {
      this.userBadges.set(userId, []);
    }

    this.userBadges.get(userId)!.push(userBadge);

    // Award points
    await this.addPoints(userId, 'customer', badge.pointsRequired, `Earned badge: ${badge.name}`);

    return userBadge;
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: string): Promise<Badge[]> {
    const userBadges = this.userBadges.get(userId) || [];
    return userBadges.map((ub) => this.badges.get(ub.badgeId)!).filter((b) => b !== undefined);
  }

  /**
   * Create challenge
   */
  async createChallenge(challenge: Omit<Challenge, 'id | createdAt'>): Promise<Challenge> {
    const fullChallenge: Challenge = {
      ...challenge,
      id: `CHALLENGE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.challenges.set(fullChallenge.id, fullChallenge);
    return fullChallenge;
  }

  /**
   * Get active challenges
   */
  async getActiveChallenges(): Promise<Challenge[]> {
    return Array.from(this.challenges.values())
      .filter((c) => c.status === 'active' && new Date() < c.endDate)
      .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type: LeaderboardType = 'all_time', limit: number = 10): Promise<Leaderboard[]> {
    const leaderboard: Leaderboard[] = [];
    let sortedUsers: [string, UserPoints][] = [];

    if (type === 'daily') {
      sortedUsers = Array.from(this.userPoints.entries()).sort((a, b) => b[1].pointsThisWeek - a[1].pointsThisWeek);
    } else if (type === 'weekly') {
      sortedUsers = Array.from(this.userPoints.entries()).sort((a, b) => b[1].pointsThisWeek - a[1].pointsThisWeek);
    } else if (type === 'monthly') {
      sortedUsers = Array.from(this.userPoints.entries()).sort((a, b) => b[1].pointsThisMonth - a[1].pointsThisMonth);
    } else {
      sortedUsers = Array.from(this.userPoints.entries()).sort((a, b) => b[1].totalPoints - a[1].totalPoints);
    }

    return sortedUsers.slice(0, limit).map((entry, index) => ({
      rank: index + 1,
      userId: entry[0],
      userName: `User-${entry[0].substring(0, 8)}`,
      userType: entry[1].userType,
      points: entry[1].totalPoints,
      badges: (this.userBadges.get(entry[0]) || []).length,
      level: entry[1].level,
    }));
  }

  /**
   * Log achievement
   */
  async logAchievement(userId: string, type: string, title: string, pointsEarned: number): Promise<Achievement> {
    const achievement: Achievement = {
      id: `ACH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      title,
      description: title,
      pointsEarned,
      earnedAt: new Date(),
    };

    this.achievements.set(achievement.id, achievement);
    return achievement;
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string, limit: number = 10): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get available rewards
   */
  async getAvailableRewards(userPoints: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter((r) => r.pointsRequired <= userPoints);
  }

  /**
   * Redeem reward
   */
  async redeemReward(userId: string, rewardId: string): Promise<any> {
    const reward = this.rewards.get(rewardId);
    if (!reward) {
      throw new Error(`Reward ${rewardId} not found`);
    }

    const userPointsData = this.userPoints.get(userId);
    if (!userPointsData || userPointsData.totalPoints < reward.pointsRequired) {
      throw new Error('Insufficient points');
    }

    userPointsData.totalPoints -= reward.pointsRequired;

    return {
      success: true,
      reward,
      pointsDeducted: reward.pointsRequired,
      remainingPoints: userPointsData.totalPoints,
      redeemCode: `REDEEM-${Date.now()}`,
    };
  }

  /**
   * Get gamification stats
   */
  async getGamificationStats(): Promise<any> {
    const totalUsers = this.userPoints.size;
    const totalBadgesEarned = Array.from(this.userBadges.values()).reduce((sum, badges) => sum + badges.length, 0);
    const totalPointsDistributed = Array.from(this.userPoints.values()).reduce((sum, up) => sum + up.totalPoints, 0);
    const activeChallenges = (await this.getActiveChallenges()).length;

    return {
      totalUsers,
      totalBadgesEarned,
      totalPointsDistributed,
      activeChallenges,
      totalBadges: this.badges.size,
      totalRewards: this.rewards.size,
    };
  }
}

export default GamificationService;
