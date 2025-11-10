/**
 * Automated Inventory Management Service
 * Real-time stock tracking with automatic reorder points and waste management
 */

type ItemCategory = 'vegetables' | 'meat' | 'dairy' | 'spices' | 'grains' | 'oils' | 'condiments' | 'beverages';
type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
type UnitType = 'kg' | 'liter' | 'piece' | 'dozen' | 'box' | 'carton';

interface InventoryItem {
  id: string;
  name: string;
  category: ItemCategory;
  unit: UnitType;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  supplierId?: string;
  status: StockStatus;
  lastUpdated: Date;
  expiryDate?: Date;
  locationId: string;
}

interface StockMovement {
  id: string;
  itemId: string;
  type: 'purchase' | 'usage' | 'waste' | 'adjustment' | 'return';
  quantity: number;
  timestamp: Date;
  reference?: string; // PO number, order ID, etc.
  notes?: string;
  recordedBy: string;
}

interface WasteRecord {
  id: string;
  itemId: string;
  quantity: number;
  reason: 'expiry' | 'damage' | 'spoilage' | 'theft' | 'other';
  cost: number;
  timestamp: Date;
  notes?: string;
  recordedBy: string;
}

interface ReorderAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  estimatedCost: number;
  supplierId?: string;
  createdAt: Date;
  status: 'pending' | 'ordered' | 'received';
}

interface InventoryAnalytics {
  totalItems: number;
  inStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  totalInventoryValue: number;
  totalWasteCost: number;
  wastePercentage: number;
  stockTurnover: number;
  averageStockAge: number;
  topWastedItems: Array<{ itemId: string; itemName: string; wasteCost: number }>;
  slowMovingItems: Array<{ itemId: string; itemName: string; daysInStock: number }>;
  fastMovingItems: Array<{ itemId: string; itemName: string; turnoverRate: number }>;
  categoryBreakdown: Record<ItemCategory, { items: number; value: number }>;
}

class InventoryManagementService {
  private items: Map<string, InventoryItem> = new Map();
  private movements: Map<string, StockMovement> = new Map();
  private waste: Map<string, WasteRecord> = new Map();
  private reorderAlerts: Map<string, ReorderAlert> = new Map();

  /**
   * Add inventory item
   */
  async addInventoryItem(item: Omit<InventoryItem, 'id | lastUpdated | status'>): Promise<InventoryItem> {
    const status = this.calculateStockStatus(item.currentStock, item.minimumStock, item.maximumStock);

    const fullItem: InventoryItem = {
      ...item,
      id: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
      status,
    };

    this.items.set(fullItem.id, fullItem);
    return fullItem;
  }

  /**
   * Get inventory item
   */
  async getInventoryItem(itemId: string): Promise<InventoryItem | null> {
    return this.items.get(itemId) || null;
  }

  /**
   * Get all inventory items
   */
  async getAllInventoryItems(locationId?: string, category?: ItemCategory, status?: StockStatus): Promise<InventoryItem[]> {
    let items = Array.from(this.items.values());

    if (locationId) {
      items = items.filter((i) => i.locationId === locationId);
    }

    if (category) {
      items = items.filter((i) => i.category === category);
    }

    if (status) {
      items = items.filter((i) => i.status === status);
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Calculate stock status
   */
  private calculateStockStatus(current: number, minimum: number, maximum: number): StockStatus {
    if (current === 0) return 'out_of_stock';
    if (current <= minimum) return 'low_stock';
    if (current >= maximum) return 'overstock';
    return 'in_stock';
  }

  /**
   * Record stock movement
   */
  async recordStockMovement(movement: Omit<StockMovement, 'id'>): Promise<StockMovement> {
    const item = this.items.get(movement.itemId);
    if (!item) {
      throw new Error(`Item ${movement.itemId} not found`);
    }

    const fullMovement: StockMovement = {
      ...movement,
      id: `MOV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.movements.set(fullMovement.id, fullMovement);

    // Update item stock
    if (movement.type === 'purchase' || movement.type === 'return') {
      item.currentStock += movement.quantity;
    } else if (movement.type === 'usage' || movement.type === 'waste') {
      item.currentStock -= movement.quantity;
    } else if (movement.type === 'adjustment') {
      item.currentStock = movement.quantity;
    }

    // Update status
    item.status = this.calculateStockStatus(item.currentStock, item.minimumStock, item.maximumStock);
    item.lastUpdated = new Date();

    // Check for reorder
    if (item.currentStock <= item.reorderPoint && item.supplierId) {
      await this.createReorderAlert(item);
    }

    return fullMovement;
  }

  /**
   * Record waste
   */
  async recordWaste(waste: Omit<WasteRecord, 'id'>): Promise<WasteRecord> {
    const item = this.items.get(waste.itemId);
    if (!item) {
      throw new Error(`Item ${waste.itemId} not found`);
    }

    const fullWaste: WasteRecord = {
      ...waste,
      id: `WASTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.waste.set(fullWaste.id, fullWaste);

    // Record as stock movement
    await this.recordStockMovement({
      itemId: waste.itemId,
      type: 'waste',
      quantity: waste.quantity,
      timestamp: waste.timestamp,
      notes: `Waste: ${waste.reason}`,
      recordedBy: waste.recordedBy,
    });

    return fullWaste;
  }

  /**
   * Create reorder alert
   */
  private async createReorderAlert(item: InventoryItem): Promise<void> {
    // Check if alert already exists
    const existing = Array.from(this.reorderAlerts.values()).find(
      (a) => a.itemId === item.id && a.status === 'pending'
    );

    if (existing) return;

    const alert: ReorderAlert = {
      id: `ALERT-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      currentStock: item.currentStock,
      reorderPoint: item.reorderPoint,
      reorderQuantity: item.reorderQuantity,
      estimatedCost: item.reorderQuantity * item.unitCost,
      supplierId: item.supplierId,
      createdAt: new Date(),
      status: 'pending',
    };

    this.reorderAlerts.set(alert.id, alert);
  }

  /**
   * Get reorder alerts
   */
  async getReorderAlerts(status?: 'pending' | 'ordered' | 'received'): Promise<ReorderAlert[]> {
    let alerts = Array.from(this.reorderAlerts.values());

    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Mark reorder alert as ordered
   */
  async markReorderAsOrdered(alertId: string, poNumber: string): Promise<ReorderAlert> {
    const alert = this.reorderAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'ordered';
    return alert;
  }

  /**
   * Get stock movements
   */
  async getStockMovements(itemId?: string, type?: StockMovement['type']): Promise<StockMovement[]> {
    let movements = Array.from(this.movements.values());

    if (itemId) {
      movements = movements.filter((m) => m.itemId === itemId);
    }

    if (type) {
      movements = movements.filter((m) => m.type === type);
    }

    return movements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get waste records
   */
  async getWasteRecords(itemId?: string, reason?: WasteRecord['reason']): Promise<WasteRecord[]> {
    let records = Array.from(this.waste.values());

    if (itemId) {
      records = records.filter((r) => r.itemId === itemId);
    }

    if (reason) {
      records = records.filter((r) => r.reason === reason);
    }

    return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get inventory analytics
   */
  async getInventoryAnalytics(locationId?: string): Promise<InventoryAnalytics> {
    let items = await this.getAllInventoryItems(locationId);
    const allMovements = Array.from(this.movements.values());
    const allWaste = Array.from(this.waste.values());

    const inStockItems = items.filter((i) => i.status === 'in_stock').length;
    const lowStockItems = items.filter((i) => i.status === 'low_stock').length;
    const outOfStockItems = items.filter((i) => i.status === 'out_of_stock').length;
    const overstockItems = items.filter((i) => i.status === 'overstock').length;

    const totalInventoryValue = items.reduce((sum, i) => sum + i.currentStock * i.unitCost, 0);
    const totalWasteCost = allWaste.reduce((sum, w) => sum + w.cost, 0);
    const wastePercentage = totalInventoryValue > 0 ? (totalWasteCost / totalInventoryValue) * 100 : 0;

    // Calculate stock turnover
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsage = allMovements.filter((m) => m.type === 'usage' && m.timestamp >= thirtyDaysAgo);
    const totalUsage = recentUsage.reduce((sum, m) => sum + m.quantity, 0);
    const averageStock = items.reduce((sum, i) => sum + i.currentStock, 0) / items.length;
    const stockTurnover = averageStock > 0 ? totalUsage / averageStock : 0;

    // Calculate average stock age
    const stockAges = items.map((i) => {
      const itemMovements = allMovements.filter((m) => m.itemId === i.id && m.type === 'purchase');
      if (itemMovements.length === 0) return 0;
      const lastPurchase = itemMovements[itemMovements.length - 1];
      return (Date.now() - lastPurchase.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    });
    const averageStockAge = stockAges.reduce((a, b) => a + b, 0) / stockAges.length;

    // Top wasted items
    const wasteByItem: Record<string, number> = {};
    for (const w of allWaste) {
      wasteByItem[w.itemId] = (wasteByItem[w.itemId] || 0) + w.cost;
    }

    const topWastedItems = Object.entries(wasteByItem)
      .map(([itemId, cost]) => ({
        itemId,
        itemName: this.items.get(itemId)?.name || 'Unknown',
        wasteCost: cost,
      }))
      .sort((a, b) => b.wasteCost - a.wasteCost)
      .slice(0, 5);

    // Slow moving items
    const slowMovingItems = items
      .filter((i) => {
        const itemMovements = allMovements.filter((m) => m.itemId === i.id && m.type === 'usage');
        return itemMovements.length < 5; // Less than 5 usage movements in history
      })
      .map((i) => ({
        itemId: i.id,
        itemName: i.name,
        daysInStock: Math.round(averageStockAge),
      }))
      .slice(0, 5);

    // Fast moving items
    const fastMovingItems = items
      .filter((i) => {
        const itemMovements = allMovements.filter((m) => m.itemId === i.id && m.type === 'usage');
        return itemMovements.length > 20; // More than 20 usage movements
      })
      .map((i) => {
        const itemMovements = allMovements.filter((m) => m.itemId === i.id && m.type === 'usage');
        return {
          itemId: i.id,
          itemName: i.name,
          turnoverRate: itemMovements.length / 30, // per day
        };
      })
      .sort((a, b) => b.turnoverRate - a.turnoverRate)
      .slice(0, 5);

    // Category breakdown
    const categoryBreakdown: Record<ItemCategory, { items: number; value: number }> = {
      vegetables: { items: 0, value: 0 },
      meat: { items: 0, value: 0 },
      dairy: { items: 0, value: 0 },
      spices: { items: 0, value: 0 },
      grains: { items: 0, value: 0 },
      oils: { items: 0, value: 0 },
      condiments: { items: 0, value: 0 },
      beverages: { items: 0, value: 0 },
    };

    for (const item of items) {
      categoryBreakdown[item.category].items++;
      categoryBreakdown[item.category].value += item.currentStock * item.unitCost;
    }

    return {
      totalItems: items.length,
      inStockItems,
      lowStockItems,
      outOfStockItems,
      overstockItems,
      totalInventoryValue: Math.round(totalInventoryValue),
      totalWasteCost: Math.round(totalWasteCost),
      wastePercentage: Math.round(wastePercentage * 100) / 100,
      stockTurnover: Math.round(stockTurnover * 100) / 100,
      averageStockAge: Math.round(averageStockAge),
      topWastedItems,
      slowMovingItems,
      fastMovingItems,
      categoryBreakdown,
    };
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(locationId?: string): Promise<InventoryItem[]> {
    return this.getAllInventoryItems(locationId, undefined, 'low_stock');
  }

  /**
   * Get out of stock items
   */
  async getOutOfStockItems(locationId?: string): Promise<InventoryItem[]> {
    return this.getAllInventoryItems(locationId, undefined, 'out_of_stock');
  }

  /**
   * Get overstock items
   */
  async getOverstockItems(locationId?: string): Promise<InventoryItem[]> {
    return this.getAllInventoryItems(locationId, undefined, 'overstock');
  }

  /**
   * Forecast demand
   */
  async forecastDemand(itemId: string, days: number = 7): Promise<number> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const movements = Array.from(this.movements.values())
      .filter((m) => m.itemId === itemId && m.type === 'usage')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 30); // Last 30 usage records

    if (movements.length === 0) return 0;

    const avgDaily = movements.reduce((sum, m) => sum + m.quantity, 0) / 30;
    return Math.ceil(avgDaily * days);
  }

  /**
   * Get inventory health score
   */
  async getInventoryHealthScore(locationId?: string): Promise<number> {
    const items = await this.getAllInventoryItems(locationId);
    const analytics = await this.getInventoryAnalytics(locationId);

    let score = 100;

    // Deduct for low stock
    const lowStockRatio = analytics.lowStockItems / items.length;
    score -= lowStockRatio * 20;

    // Deduct for out of stock
    const outOfStockRatio = analytics.outOfStockItems / items.length;
    score -= outOfStockRatio * 30;

    // Deduct for overstock
    const overstockRatio = analytics.overstockItems / items.length;
    score -= overstockRatio * 10;

    // Deduct for waste
    score -= Math.min(20, analytics.wastePercentage);

    return Math.max(0, score);
  }
}

export default InventoryManagementService;
