/**
 * AI-Powered Menu Recommendation Service
 * Provides personalized menu recommendations based on Ayurvedic constitution (Dosha)
 */

type Dosha = 'vata' | 'pitta' | 'kapha' | 'mixed';

interface UserProfile {
  userId: string;
  name: string;
  age: number;
  dosha: Dosha;
  healthConditions: string[];
  dietaryRestrictions: string[];
  preferences: string[];
  lastUpdated: Date;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  ingredients: string[];
  doshaBalance: {
    vata: number; // -10 to +10 (negative = balances, positive = aggravates)
    pitta: number;
    kapha: number;
  };
  healthBenefits: string[];
  spiceLevel: number; // 1-5
  calories: number;
  prepTime: number; // in minutes
}

interface Recommendation {
  itemId: string;
  itemName: string;
  score: number; // 0-100
  reason: string;
  healthBenefit: string;
  compatibility: number; // percentage
}

class AIRecommendationService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private recommendationHistory: Map<string, Recommendation[]> = new Map();

  /**
   * User Profile Management
   */

  async createUserProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
    const userId = userData.userId || `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const profile: UserProfile = {
      userId,
      name: userData.name || '',
      age: userData.age || 0,
      dosha: userData.dosha || 'mixed',
      healthConditions: userData.healthConditions || [],
      dietaryRestrictions: userData.dietaryRestrictions || [],
      preferences: userData.preferences || [],
      lastUpdated: new Date(),
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return null;

    const updated = { ...profile, ...updates, lastUpdated: new Date() };
    this.userProfiles.set(userId, updated);
    return updated;
  }

  /**
   * Dosha Determination (Simplified)
   */

  async determineDoshaFromQuiz(answers: Record<string, number>): Promise<Dosha> {
    // Simplified dosha determination based on quiz answers
    // In production, this would use a comprehensive Ayurvedic questionnaire

    let vataScore = 0;
    let pittaScore = 0;
    let kaphaScore = 0;

    // Example scoring (simplified)
    for (const [question, answer] of Object.entries(answers)) {
      if (question.includes('vata')) vataScore += answer;
      if (question.includes('pitta')) pittaScore += answer;
      if (question.includes('kapha')) kaphaScore += answer;
    }

    const max = Math.max(vataScore, pittaScore, kaphaScore);

    if (vataScore === max && vataScore > pittaScore && vataScore > kaphaScore) {
      return 'vata';
    } else if (pittaScore === max && pittaScore > vataScore && pittaScore > kaphaScore) {
      return 'pitta';
    } else if (kaphaScore === max && kaphaScore > vataScore && kaphaScore > pittaScore) {
      return 'kapha';
    }

    return 'mixed';
  }

  /**
   * Menu Item Management
   */

  async addMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
    const id = itemData.id || `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const item: MenuItem = {
      id,
      name: itemData.name || '',
      description: itemData.description || '',
      price: itemData.price || 0,
      category: itemData.category || '',
      ingredients: itemData.ingredients || [],
      doshaBalance: itemData.doshaBalance || { vata: 0, pitta: 0, kapha: 0 },
      healthBenefits: itemData.healthBenefits || [],
      spiceLevel: itemData.spiceLevel || 1,
      calories: itemData.calories || 0,
      prepTime: itemData.prepTime || 15,
    };

    this.menuItems.set(id, item);
    return item;
  }

  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    return this.menuItems.get(itemId) || null;
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }

  /**
   * Recommendation Engine
   */

  async getRecommendations(userId: string, limit: number = 5): Promise<Recommendation[]> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return [];

    const menuItems = await this.getAllMenuItems();
    const recommendations: Recommendation[] = [];

    for (const item of menuItems) {
      const score = this.calculateCompatibilityScore(profile, item);

      if (score > 0) {
        recommendations.push({
          itemId: item.id,
          itemName: item.name,
          score,
          reason: this.generateRecommendationReason(profile, item),
          healthBenefit: item.healthBenefits[0] || 'Nutritious meal',
          compatibility: Math.round(score),
        });
      }
    }

    // Sort by score and limit results
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, limit);

    // Store in history
    if (!this.recommendationHistory.has(userId)) {
      this.recommendationHistory.set(userId, []);
    }
    this.recommendationHistory.get(userId)!.push(...topRecommendations);

    return topRecommendations;
  }

  private calculateCompatibilityScore(profile: UserProfile, item: MenuItem): number {
    let score = 50; // Base score

    // Dosha balance scoring
    if (profile.dosha === 'vata') {
      score += Math.max(0, -item.doshaBalance.vata * 5); // Negative values are good
    } else if (profile.dosha === 'pitta') {
      score += Math.max(0, -item.doshaBalance.pitta * 5);
    } else if (profile.dosha === 'kapha') {
      score += Math.max(0, -item.doshaBalance.kapha * 5);
    } else {
      // Mixed dosha - balance all three
      score += Math.max(0, -item.doshaBalance.vata * 2);
      score += Math.max(0, -item.doshaBalance.pitta * 2);
      score += Math.max(0, -item.doshaBalance.kapha * 2);
    }

    // Dietary restrictions
    for (const restriction of profile.dietaryRestrictions) {
      if (item.ingredients.some((ing) => ing.toLowerCase().includes(restriction.toLowerCase()))) {
        score -= 30; // Penalize if contains restricted ingredient
      }
    }

    // Health conditions
    for (const condition of profile.healthConditions) {
      if (item.healthBenefits.some((benefit) => benefit.toLowerCase().includes(condition.toLowerCase()))) {
        score += 20; // Bonus if helps with health condition
      }
    }

    // Preferences
    for (const preference of profile.preferences) {
      if (item.category.toLowerCase() === preference.toLowerCase() || item.name.toLowerCase().includes(preference.toLowerCase())) {
        score += 15;
      }
    }

    // Spice level consideration
    if (profile.dosha === 'pitta' && item.spiceLevel > 3) {
      score -= 10; // Pitta should avoid too much spice
    }

    return Math.min(100, Math.max(0, score));
  }

  private generateRecommendationReason(profile: UserProfile, item: MenuItem): string {
    const reasons: string[] = [];

    if (profile.dosha === 'vata' && item.doshaBalance.vata < 0) {
      reasons.push('Balances Vata dosha');
    } else if (profile.dosha === 'pitta' && item.doshaBalance.pitta < 0) {
      reasons.push('Balances Pitta dosha');
    } else if (profile.dosha === 'kapha' && item.doshaBalance.kapha < 0) {
      reasons.push('Balances Kapha dosha');
    }

    for (const condition of profile.healthConditions) {
      if (item.healthBenefits.some((benefit) => benefit.toLowerCase().includes(condition.toLowerCase()))) {
        reasons.push(`Supports ${condition} health`);
      }
    }

    if (profile.preferences.includes(item.category)) {
      reasons.push(`Your favorite category`);
    }

    return reasons.length > 0 ? reasons.join(', ') : 'Nutritious and balanced meal';
  }

  /**
   * Personalized Menu
   */

  async getPersonalizedMenu(userId: string): Promise<any> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    const recommendations = await this.getRecommendations(userId, 10);
    const menuItems = await this.getAllMenuItems();

    // Group recommendations by category
    const categorized: Record<string, Recommendation[]> = {};

    for (const rec of recommendations) {
      const item = menuItems.find((m) => m.id === rec.itemId);
      if (item) {
        if (!categorized[item.category]) {
          categorized[item.category] = [];
        }
        categorized[item.category].push(rec);
      }
    }

    return {
      userId,
      dosha: profile.dosha,
      recommendations,
      categorized,
      timestamp: new Date(),
    };
  }

  /**
   * Analytics
   */

  async getRecommendationStats(userId: string): Promise<any> {
    const history = this.recommendationHistory.get(userId) || [];

    if (history.length === 0) {
      return {
        userId,
        totalRecommendations: 0,
        averageScore: 0,
        topItems: [],
      };
    }

    const averageScore = history.reduce((sum, rec) => sum + rec.score, 0) / history.length;

    // Find top items
    const itemScores: Record<string, number[]> = {};
    for (const rec of history) {
      if (!itemScores[rec.itemId]) {
        itemScores[rec.itemId] = [];
      }
      itemScores[rec.itemId].push(rec.score);
    }

    const topItems = Object.entries(itemScores)
      .map(([itemId, scores]) => ({
        itemId,
        averageScore: scores.reduce((a, b) => a + b) / scores.length,
        recommendationCount: scores.length,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    return {
      userId,
      totalRecommendations: history.length,
      averageScore: Math.round(averageScore),
      topItems,
    };
  }

  /**
   * Similar Items
   */

  async getSimilarItems(itemId: string, limit: number = 5): Promise<MenuItem[]> {
    const item = await this.getMenuItem(itemId);
    if (!item) return [];

    const allItems = await this.getAllMenuItems();
    const similarItems: Array<{ item: MenuItem; similarity: number }> = [];

    for (const otherItem of allItems) {
      if (otherItem.id === itemId) continue;

      let similarity = 0;

      // Category match
      if (otherItem.category === item.category) similarity += 30;

      // Dosha balance similarity
      similarity += 100 - Math.abs(otherItem.doshaBalance.vata - item.doshaBalance.vata);
      similarity += 100 - Math.abs(otherItem.doshaBalance.pitta - item.doshaBalance.pitta);
      similarity += 100 - Math.abs(otherItem.doshaBalance.kapha - item.doshaBalance.kapha);

      // Health benefits overlap
      const commonBenefits = otherItem.healthBenefits.filter((b) => item.healthBenefits.includes(b));
      similarity += commonBenefits.length * 20;

      similarItems.push({ item: otherItem, similarity });
    }

    return similarItems.sort((a, b) => b.similarity - a.similarity).slice(0, limit).map((s) => s.item);
  }

  /**
   * Seasonal Recommendations
   */

  async getSeasonalRecommendations(userId: string, season: string): Promise<Recommendation[]> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return [];

    const menuItems = await this.getAllMenuItems();
    const recommendations: Recommendation[] = [];

    // Seasonal dosha balancing
    let seasonalDosha: Dosha = 'mixed';
    if (season === 'summer') seasonalDosha = 'pitta';
    if (season === 'winter') seasonalDosha = 'kapha';
    if (season === 'spring') seasonalDosha = 'kapha';
    if (season === 'autumn') seasonalDosha = 'vata';

    for (const item of menuItems) {
      // Prioritize items that balance the seasonal dosha
      let score = 50;

      if (seasonalDosha === 'vata' && item.doshaBalance.vata < 0) score += 30;
      if (seasonalDosha === 'pitta' && item.doshaBalance.pitta < 0) score += 30;
      if (seasonalDosha === 'kapha' && item.doshaBalance.kapha < 0) score += 30;

      // Also consider user's dosha
      score += this.calculateCompatibilityScore(profile, item);

      if (score > 50) {
        recommendations.push({
          itemId: item.id,
          itemName: item.name,
          score: Math.min(100, score),
          reason: `Ideal for ${season} season`,
          healthBenefit: item.healthBenefits[0] || 'Seasonal nutrition',
          compatibility: Math.round(score),
        });
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5);
  }
}

export default AIRecommendationService;
