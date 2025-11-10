/**
 * AR Menu Visualization Service
 * Provides augmented reality menu visualization with 3D models and nutritional information
 */

interface ARMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  modelUrl: string; // URL to 3D model (GLTF/GLB format)
  textureUrl: string; // URL to texture image
  nutritionInfo: {
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber: number; // grams
  };
  doshaInfo: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  ingredients: string[];
  allergens: string[];
  prepTime: number; // minutes
  servingSize: string;
}

interface ARSession {
  id: string;
  userId: string;
  itemId: string;
  startTime: Date;
  endTime?: Date;
  viewDuration: number; // seconds
  interactionData: {
    rotations: number;
    zooms: number;
    nutritionViewed: boolean;
    doshaInfoViewed: boolean;
    addedToCart: boolean;
  };
}

interface ARExperience {
  id: string;
  name: string;
  description: string;
  items: string[]; // Array of item IDs
  backgroundUrl: string;
  lightingPreset: 'warm' | 'cool' | 'neutral';
  ambientSound?: string;
}

class ARMenuService {
  private arMenuItems: Map<string, ARMenuItem> = new Map();
  private arSessions: Map<string, ARSession> = new Map();
  private arExperiences: Map<string, ARExperience> = new Map();
  private userPreferences: Map<string, any> = new Map();

  /**
   * AR Menu Item Management
   */

  async addARMenuItem(itemData: Partial<ARMenuItem>): Promise<ARMenuItem> {
    const id = itemData.id || `AR-ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const arItem: ARMenuItem = {
      id,
      name: itemData.name || '',
      description: itemData.description || '',
      price: itemData.price || 0,
      modelUrl: itemData.modelUrl || '',
      textureUrl: itemData.textureUrl || '',
      nutritionInfo: itemData.nutritionInfo || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
      },
      doshaInfo: itemData.doshaInfo || {
        vata: 0,
        pitta: 0,
        kapha: 0,
      },
      ingredients: itemData.ingredients || [],
      allergens: itemData.allergens || [],
      prepTime: itemData.prepTime || 15,
      servingSize: itemData.servingSize || '1 serving',
    };

    this.arMenuItems.set(id, arItem);
    return arItem;
  }

  async getARMenuItem(itemId: string): Promise<ARMenuItem | null> {
    return this.arMenuItems.get(itemId) || null;
  }

  async getAllARMenuItems(): Promise<ARMenuItem[]> {
    return Array.from(this.arMenuItems.values());
  }

  /**
   * AR Session Management
   */

  async startARSession(userId: string, itemId: string): Promise<ARSession> {
    const sessionId = `AR-SESSION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: ARSession = {
      id: sessionId,
      userId,
      itemId,
      startTime: new Date(),
      viewDuration: 0,
      interactionData: {
        rotations: 0,
        zooms: 0,
        nutritionViewed: false,
        doshaInfoViewed: false,
        addedToCart: false,
      },
    };

    this.arSessions.set(sessionId, session);
    return session;
  }

  async endARSession(sessionId: string): Promise<ARSession | null> {
    const session = this.arSessions.get(sessionId);
    if (!session) return null;

    session.endTime = new Date();
    session.viewDuration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);

    this.arSessions.set(sessionId, session);
    return session;
  }

  async recordInteraction(sessionId: string, interactionType: string): Promise<ARSession | null> {
    const session = this.arSessions.get(sessionId);
    if (!session) return null;

    switch (interactionType) {
      case 'rotate':
        session.interactionData.rotations++;
        break;
      case 'zoom':
        session.interactionData.zooms++;
        break;
      case 'view_nutrition':
        session.interactionData.nutritionViewed = true;
        break;
      case 'view_dosha':
        session.interactionData.doshaInfoViewed = true;
        break;
      case 'add_to_cart':
        session.interactionData.addedToCart = true;
        break;
    }

    this.arSessions.set(sessionId, session);
    return session;
  }

  async getARSession(sessionId: string): Promise<ARSession | null> {
    return this.arSessions.get(sessionId) || null;
  }

  /**
   * AR Experience Management
   */

  async createARExperience(experienceData: Partial<ARExperience>): Promise<ARExperience> {
    const id = `AR-EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const experience: ARExperience = {
      id,
      name: experienceData.name || '',
      description: experienceData.description || '',
      items: experienceData.items || [],
      backgroundUrl: experienceData.backgroundUrl || '',
      lightingPreset: experienceData.lightingPreset || 'neutral',
      ambientSound: experienceData.ambientSound,
    };

    this.arExperiences.set(id, experience);
    return experience;
  }

  async getARExperience(experienceId: string): Promise<ARExperience | null> {
    return this.arExperiences.get(experienceId) || null;
  }

  async getAllARExperiences(): Promise<ARExperience[]> {
    return Array.from(this.arExperiences.values());
  }

  /**
   * Nutrition Information
   */

  async getNutritionInfo(itemId: string): Promise<any> {
    const item = await this.getARMenuItem(itemId);
    if (!item) return null;

    const totalCalories = item.nutritionInfo.calories;
    const proteinCalories = item.nutritionInfo.protein * 4;
    const carbCalories = item.nutritionInfo.carbs * 4;
    const fatCalories = item.nutritionInfo.fat * 9;

    return {
      itemId,
      itemName: item.name,
      servingSize: item.servingSize,
      nutrition: item.nutritionInfo,
      calorieBreakdown: {
        protein: Math.round((proteinCalories / totalCalories) * 100),
        carbs: Math.round((carbCalories / totalCalories) * 100),
        fat: Math.round((fatCalories / totalCalories) * 100),
      },
      healthScore: this.calculateHealthScore(item.nutritionInfo),
      doshaBalance: item.doshaInfo,
      allergens: item.allergens,
    };
  }

  private calculateHealthScore(nutrition: any): number {
    let score = 50;

    // Protein score
    if (nutrition.protein >= 20) score += 15;
    else if (nutrition.protein >= 10) score += 10;

    // Fiber score
    if (nutrition.fiber >= 5) score += 15;
    else if (nutrition.fiber >= 3) score += 10;

    // Calorie score (lower is better for most cases)
    if (nutrition.calories <= 300) score += 10;
    else if (nutrition.calories <= 500) score += 5;

    // Fat score
    if (nutrition.fat <= 10) score += 10;
    else if (nutrition.fat <= 15) score += 5;

    return Math.min(100, score);
  }

  /**
   * Dosha Information
   */

  async getDoshaInfo(itemId: string): Promise<any> {
    const item = await this.getARMenuItem(itemId);
    if (!item) return null;

    const doshaBalance = item.doshaInfo;
    const balancedDoshas = [];
    const aggravateDoshas = [];

    if (doshaBalance.vata < 0) balancedDoshas.push('Vata');
    if (doshaBalance.vata > 0) aggravateDoshas.push('Vata');

    if (doshaBalance.pitta < 0) balancedDoshas.push('Pitta');
    if (doshaBalance.pitta > 0) aggravateDoshas.push('Pitta');

    if (doshaBalance.kapha < 0) balancedDoshas.push('Kapha');
    if (doshaBalance.kapha > 0) aggravateDoshas.push('Kapha');

    return {
      itemId,
      itemName: item.name,
      balancedDoshas,
      aggravateDoshas,
      doshaScores: doshaBalance,
      recommendations: this.generateDoshaRecommendations(balancedDoshas, aggravateDoshas),
    };
  }

  private generateDoshaRecommendations(balanced: string[], aggravated: string[]): string[] {
    const recommendations: string[] = [];

    if (balanced.length > 0) {
      recommendations.push(`Great for ${balanced.join(' and ')} constitution`);
    }

    if (aggravated.length > 0) {
      recommendations.push(`May aggravate ${aggravated.join(' and ')} - consume in moderation`);
    }

    return recommendations;
  }

  /**
   * Comparison Tool
   */

  async compareItems(itemIds: string[]): Promise<any> {
    const items = await Promise.all(itemIds.map((id) => this.getARMenuItem(id)));
    const validItems = items.filter((item) => item !== null) as ARMenuItem[];

    if (validItems.length === 0) return null;

    return {
      items: validItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        calories: item.nutritionInfo.calories,
        protein: item.nutritionInfo.protein,
        prepTime: item.prepTime,
        doshaBalance: item.doshaInfo,
      })),
      comparison: {
        cheapest: validItems.reduce((min, item) => (item.price < min.price ? item : min)),
        healthiest: validItems.reduce((max, item) =>
          this.calculateHealthScore(item.nutritionInfo) > this.calculateHealthScore(max.nutritionInfo) ? item : max
        ),
        quickest: validItems.reduce((min, item) => (item.prepTime < min.prepTime ? item : min)),
      },
    };
  }

  /**
   * Analytics
   */

  async getARAnalytics(): Promise<any> {
    const sessions = Array.from(this.arSessions.values());
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.endTime !== undefined).length;
    const averageViewDuration = sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.viewDuration, 0) / sessions.length) : 0;

    const itemViews: Record<string, number> = {};
    const itemAddToCart: Record<string, number> = {};

    for (const session of sessions) {
      itemViews[session.itemId] = (itemViews[session.itemId] || 0) + 1;
      if (session.interactionData.addedToCart) {
        itemAddToCart[session.itemId] = (itemAddToCart[session.itemId] || 0) + 1;
      }
    }

    return {
      totalSessions,
      completedSessions,
      conversionRate: totalSessions > 0 ? Math.round((Object.values(itemAddToCart).reduce((a, b) => a + b, 0) / totalSessions) * 100) : 0,
      averageViewDuration,
      topViewedItems: Object.entries(itemViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([itemId, views]) => ({ itemId, views })),
      nutritionViewRate: sessions.length > 0 ? Math.round((sessions.filter((s) => s.interactionData.nutritionViewed).length / sessions.length) * 100) : 0,
      doshaInfoViewRate: sessions.length > 0 ? Math.round((sessions.filter((s) => s.interactionData.doshaInfoViewed).length / sessions.length) * 100) : 0,
    };
  }

  async getUserARStats(userId: string): Promise<any> {
    const userSessions = Array.from(this.arSessions.values()).filter((s) => s.userId === userId);
    const totalViews = userSessions.length;
    const itemsViewed = new Set(userSessions.map((s) => s.itemId)).size;
    const itemsAddedToCart = userSessions.filter((s) => s.interactionData.addedToCart).length;

    return {
      userId,
      totalViews,
      itemsViewed,
      itemsAddedToCart,
      conversionRate: totalViews > 0 ? Math.round((itemsAddedToCart / totalViews) * 100) : 0,
      averageViewDuration:
        userSessions.length > 0 ? Math.round(userSessions.reduce((sum, s) => sum + s.viewDuration, 0) / userSessions.length) : 0,
    };
  }
}

export default ARMenuService;
