/**
 * Menu Management Dashboard Service
 * Menu updates, item pricing, availability management, and seasonal menu planning
 */

type ItemStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
type MenuType = 'regular' | 'seasonal' | 'special' | 'limited_time';
type ApprovalStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  preparationTime: number; // minutes
  image: string;
  tags: string[];
  allergens: string[];
  nutritionInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  status: ItemStatus;
  availability: {
    available: boolean;
    startTime?: string; // HH:MM
    endTime?: string; // HH:MM
    daysOfWeek?: number[]; // 0-6
  };
  popularity: number; // 0-100
  rating: number; // 1-5
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Menu {
  id: string;
  name: string;
  type: MenuType;
  description: string;
  items: string[]; // item IDs
  status: ApprovalStatus;
  startDate: Date;
  endDate?: Date;
  appliedLocations: string[]; // location IDs
  createdBy: string;
  approvedBy?: string;
  approvalNotes?: string;
  createdAt: Date;
  publishedAt?: Date;
}

interface MenuVersion {
  id: string;
  menuId: string;
  version: number;
  changes: {
    added: string[]; // item IDs
    removed: string[]; // item IDs
    modified: Array<{ itemId: string; changes: Record<string, any> }>;
  };
  createdBy: string;
  createdAt: Date;
}

interface PricingRule {
  id: string;
  itemId: string;
  rule: {
    type: 'percentage' | 'fixed' | 'dynamic';
    value: number;
    condition?: {
      dayOfWeek?: number[];
      timeRange?: { start: string; end: string };
      minQuantity?: number;
      location?: string;
    };
  };
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive';
}

interface MenuAnalytics {
  itemId: string;
  itemName: string;
  category: string;
  price: number;
  costPrice: number;
  margin: number;
  marginPercentage: number;
  salesCount: number;
  revenue: number;
  averageRating: number;
  popularity: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  daysSinceUpdate: number;
}

class MenuManagementService {
  private items: Map<string, MenuItem> = new Map();
  private menus: Map<string, Menu> = new Map();
  private versions: Map<string, MenuVersion[]> = new Map();
  private pricingRules: Map<string, PricingRule[]> = new Map();

  /**
   * Create menu item
   */
  async createMenuItem(item: Omit<MenuItem, 'id | popularity | rating | reviewCount | createdAt | updatedAt'>): Promise<MenuItem> {
    const fullItem: MenuItem = {
      ...item,
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      popularity: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.set(fullItem.id, fullItem);
    return fullItem;
  }

  /**
   * Get menu item
   */
  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    return this.items.get(itemId) || null;
  }

  /**
   * Get all menu items
   */
  async getAllMenuItems(category?: string, status?: ItemStatus): Promise<MenuItem[]> {
    let items = Array.from(this.items.values());

    if (category) {
      items = items.filter((i) => i.category === category);
    }

    if (status) {
      items = items.filter((i) => i.status === status);
    }

    return items;
  }

  /**
   * Update menu item
   */
  async updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const updated = { ...item, ...updates, updatedAt: new Date() };
    this.items.set(itemId, updated);

    return updated;
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(itemId: string): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    item.status = 'discontinued';
    return true;
  }

  /**
   * Update item availability
   */
  async updateAvailability(itemId: string, available: boolean, startTime?: string, endTime?: string): Promise<MenuItem> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    item.availability = { available, startTime, endTime };
    item.updatedAt = new Date();

    return item;
  }

  /**
   * Create menu
   */
  async createMenu(menu: Omit<Menu, 'id | createdAt'>): Promise<Menu> {
    const fullMenu: Menu = {
      ...menu,
      id: `MENU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.menus.set(fullMenu.id, fullMenu);
    this.versions.set(fullMenu.id, []);

    return fullMenu;
  }

  /**
   * Get menu
   */
  async getMenu(menuId: string): Promise<Menu | null> {
    return this.menus.get(menuId) || null;
  }

  /**
   * Get all menus
   */
  async getAllMenus(type?: MenuType, status?: ApprovalStatus): Promise<Menu[]> {
    let menus = Array.from(this.menus.values());

    if (type) {
      menus = menus.filter((m) => m.type === type);
    }

    if (status) {
      menus = menus.filter((m) => m.status === status);
    }

    return menus;
  }

  /**
   * Update menu
   */
  async updateMenu(menuId: string, updates: Partial<Menu>): Promise<Menu> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    const oldItems = menu.items;
    const updated = { ...menu, ...updates };

    // Create version if items changed
    if (JSON.stringify(oldItems) !== JSON.stringify(updates.items)) {
      await this.createVersion(menuId, oldItems, updates.items || []);
    }

    this.menus.set(menuId, updated);
    return updated;
  }

  /**
   * Create menu version
   */
  private async createVersion(menuId: string, oldItems: string[], newItems: string[]): Promise<MenuVersion> {
    const versions = this.versions.get(menuId) || [];
    const version: MenuVersion = {
      id: `VERSION-${Date.now()}`,
      menuId,
      version: versions.length + 1,
      changes: {
        added: newItems.filter((i) => !oldItems.includes(i)),
        removed: oldItems.filter((i) => !newItems.includes(i)),
        modified: [],
      },
      createdBy: 'system',
      createdAt: new Date(),
    };

    versions.push(version);
    this.versions.set(menuId, versions);

    return version;
  }

  /**
   * Submit menu for approval
   */
  async submitForApproval(menuId: string): Promise<Menu> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    menu.status = 'pending_approval';
    return menu;
  }

  /**
   * Approve menu
   */
  async approveMenu(menuId: string, approvedBy: string, notes?: string): Promise<Menu> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    menu.status = 'approved';
    menu.approvedBy = approvedBy;
    menu.approvalNotes = notes;

    return menu;
  }

  /**
   * Reject menu
   */
  async rejectMenu(menuId: string, rejectionReason: string): Promise<Menu> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    menu.status = 'rejected';
    menu.approvalNotes = rejectionReason;

    return menu;
  }

  /**
   * Publish menu
   */
  async publishMenu(menuId: string): Promise<Menu> {
    const menu = this.menus.get(menuId);
    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    if (menu.status !== 'approved') {
      throw new Error(`Menu must be approved before publishing`);
    }

    menu.status = 'published';
    menu.publishedAt = new Date();

    return menu;
  }

  /**
   * Get menu versions
   */
  async getMenuVersions(menuId: string): Promise<MenuVersion[]> {
    return this.versions.get(menuId) || [];
  }

  /**
   * Add pricing rule
   */
  async addPricingRule(rule: Omit<PricingRule, 'id'>): Promise<PricingRule> {
    const pricingRule: PricingRule = {
      ...rule,
      id: `RULE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const rules = this.pricingRules.get(rule.itemId) || [];
    rules.push(pricingRule);
    this.pricingRules.set(rule.itemId, rules);

    return pricingRule;
  }

  /**
   * Get pricing rules
   */
  async getPricingRules(itemId: string): Promise<PricingRule[]> {
    return this.pricingRules.get(itemId) || [];
  }

  /**
   * Calculate price
   */
  async calculatePrice(itemId: string, context?: { dayOfWeek?: number; time?: string; quantity?: number; location?: string }): Promise<number> {
    const item = await this.getMenuItem(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    let price = item.price;
    const rules = await this.getPricingRules(itemId);

    for (const rule of rules) {
      if (rule.status !== 'active') continue;

      const now = new Date();
      if (rule.startDate > now || (rule.endDate && rule.endDate < now)) continue;

      const condition = rule.rule.condition;
      if (!condition) {
        // Apply rule
        if (rule.rule.type === 'percentage') {
          price *= 1 + rule.rule.value / 100;
        } else if (rule.rule.type === 'fixed') {
          price += rule.rule.value;
        }
        continue;
      }

      let conditionMet = true;

      if (condition.dayOfWeek && context?.dayOfWeek !== undefined) {
        conditionMet = conditionMet && condition.dayOfWeek.includes(context.dayOfWeek);
      }

      if (condition.timeRange && context?.time) {
        const [start, end] = [condition.timeRange.start, condition.timeRange.end];
        conditionMet = conditionMet && context.time >= start && context.time <= end;
      }

      if (condition.minQuantity && context?.quantity !== undefined) {
        conditionMet = conditionMet && context.quantity >= condition.minQuantity;
      }

      if (condition.location && context?.location) {
        conditionMet = conditionMet && context.location === condition.location;
      }

      if (conditionMet) {
        if (rule.rule.type === 'percentage') {
          price *= 1 + rule.rule.value / 100;
        } else if (rule.rule.type === 'fixed') {
          price += rule.rule.value;
        }
      }
    }

    return price;
  }

  /**
   * Get menu analytics
   */
  async getMenuAnalytics(menuId: string): Promise<MenuAnalytics[]> {
    const menu = await this.getMenu(menuId);
    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    const analytics: MenuAnalytics[] = [];

    for (const itemId of menu.items) {
      const item = await this.getMenuItem(itemId);
      if (!item) continue;

      const margin = item.price - item.costPrice;
      const marginPercentage = (margin / item.price) * 100;

      // Simulate sales data
      const salesCount = Math.floor(Math.random() * 100) + 10;
      const revenue = salesCount * item.price;

      analytics.push({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        price: item.price,
        costPrice: item.costPrice,
        margin,
        marginPercentage,
        salesCount,
        revenue,
        averageRating: item.rating,
        popularity: item.popularity,
        trend: item.popularity > 70 ? 'increasing' : item.popularity < 30 ? 'decreasing' : 'stable',
        daysSinceUpdate: Math.floor((Date.now() - item.updatedAt.getTime()) / (1000 * 60 * 60 * 24)),
      });
    }

    return analytics.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get category analytics
   */
  async getCategoryAnalytics(): Promise<Record<string, any>> {
    const items = await this.getAllMenuItems();
    const categories: Record<string, any> = {};

    for (const item of items) {
      if (!categories[item.category]) {
        categories[item.category] = {
          itemCount: 0,
          activeItems: 0,
          averagePrice: 0,
          averageRating: 0,
          totalRevenue: 0,
        };
      }

      categories[item.category].itemCount++;
      if (item.status === 'active') categories[item.category].activeItems++;
      categories[item.category].averagePrice += item.price;
      categories[item.category].averageRating += item.rating;
    }

    // Calculate averages
    for (const category of Object.values(categories)) {
      category.averagePrice = (category.averagePrice / category.itemCount).toFixed(2);
      category.averageRating = (category.averageRating / category.itemCount).toFixed(2);
    }

    return categories;
  }

  /**
   * Get seasonal menu recommendations
   */
  async getSeasonalRecommendations(): Promise<string[]> {
    const month = new Date().getMonth();
    const recommendations: string[] = [];

    // Simulate seasonal recommendations
    if (month >= 11 || month <= 2) {
      // Winter
      recommendations.push('Hot beverages', 'Soups', 'Warm desserts');
    } else if (month >= 3 && month <= 5) {
      // Summer
      recommendations.push('Cold beverages', 'Salads', 'Light dishes');
    } else {
      // Monsoon/Autumn
      recommendations.push('Comfort food', 'Spicy items', 'Warm beverages');
    }

    return recommendations;
  }
}

export default MenuManagementService;
