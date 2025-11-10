/**
 * Real-Time Inventory Tracking Service
 * Stock level monitoring, low-stock alerts, supplier integration, waste tracking
 */

type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
type TransactionType = 'purchase' | 'usage' | 'waste' | 'adjustment' | 'return';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestockDate: Date;
  expiryDate?: Date;
  status: InventoryStatus;
}

interface StockTransaction {
  id: string;
  itemId: string;
  type: TransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  location: string;
  timestamp: Date;
  userId?: string;
}

interface LowStockAlert {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  reorderPoint: number;
  status: 'pending' | 'ordered' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

interface WasteRecord {
  id: string;
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  cost: number;
  location: string;
  date: Date;
  userId?: string;
}

interface SupplierIntegration {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  leadTime: number; // days
  minimumOrderQuantity: number;
  items: string[]; // item IDs
  lastOrderDate?: Date;
  averageDeliveryTime: number; // days
}

class InventoryTrackingService {
  private items: Map<string, InventoryItem> = new Map();
  private transactions: StockTransaction[] = [];
  private lowStockAlerts: Map<string, LowStockAlert> = new Map();
  private wasteRecords: WasteRecord[] = [];
  private suppliers: Map<string, SupplierIntegration> = new Map();

  /**
   * Add inventory item
   */
  async addItem(item: Omit<InventoryItem, 'status'>): Promise<InventoryItem> {
    const status = this.calculateStatus(item.currentStock, item.minimumStock);
    const fullItem: InventoryItem = { ...item, status };

    this.items.set(item.id, fullItem);

    // Check if low stock alert needed
    if (status === 'low_stock') {
      await this.createLowStockAlert(item.id, item.name, item.currentStock, item.minimumStock);
    }

    return fullItem;
  }

  /**
   * Update stock level
   */
  async updateStock(
    itemId: string,
    quantity: number,
    type: TransactionType,
    reason?: string,
    location: string = 'main',
  ): Promise<StockTransaction> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const previousStock = item.currentStock;
    const newStock = type === 'usage' || type === 'waste' ? previousStock - quantity : previousStock + quantity;

    if (newStock < 0) {
      throw new Error(`Insufficient stock for item ${itemId}`);
    }

    // Update item
    item.currentStock = newStock;
    item.status = this.calculateStatus(newStock, item.minimumStock);
    item.lastRestockDate = new Date();

    // Create transaction record
    const transaction: StockTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      location,
      timestamp: new Date(),
    };

    this.transactions.push(transaction);

    // Handle waste
    if (type === 'waste') {
      const wasteRecord: WasteRecord = {
        id: `WASTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemId,
        itemName: item.name,
        quantity,
        reason: reason || 'Unknown',
        cost: quantity * item.costPerUnit,
        location,
        date: new Date(),
      };
      this.wasteRecords.push(wasteRecord);
    }

    // Check for low stock
    if (item.status === 'low_stock' && previousStock > item.minimumStock) {
      await this.createLowStockAlert(itemId, item.name, newStock, item.minimumStock);
    }

    // Check for out of stock
    if (item.status === 'out_of_stock' && previousStock > 0) {
      await this.notifyOutOfStock(itemId, item.name);
    }

    return transaction;
  }

  /**
   * Calculate inventory status
   */
  private calculateStatus(currentStock: number, minimumStock: number): InventoryStatus {
    if (currentStock === 0) return 'out_of_stock';
    if (currentStock <= minimumStock) return 'low_stock';
    return 'in_stock';
  }

  /**
   * Create low stock alert
   */
  private async createLowStockAlert(
    itemId: string,
    itemName: string,
    currentStock: number,
    minimumStock: number,
  ): Promise<LowStockAlert> {
    const item = this.items.get(itemId);
    if (!item) throw new Error(`Item ${itemId} not found`);

    const alert: LowStockAlert = {
      id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId,
      itemName,
      currentStock,
      minimumStock,
      reorderPoint: item.reorderPoint,
      status: 'pending',
      createdAt: new Date(),
    };

    this.lowStockAlerts.set(alert.id, alert);
    return alert;
  }

  /**
   * Notify out of stock
   */
  private async notifyOutOfStock(itemId: string, itemName: string): Promise<void> {
    console.log(`[ALERT] Item ${itemName} (${itemId}) is now OUT OF STOCK`);
    // Send notification to staff
  }

  /**
   * Get item details
   */
  async getItem(itemId: string): Promise<InventoryItem | null> {
    return this.items.get(itemId) || null;
  }

  /**
   * Get all items
   */
  async getAllItems(): Promise<InventoryItem[]> {
    return Array.from(this.items.values());
  }

  /**
   * Get items by status
   */
  async getItemsByStatus(status: InventoryStatus): Promise<InventoryItem[]> {
    return Array.from(this.items.values()).filter((item) => item.status === status);
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.items.values()).filter((item) => item.status === 'low_stock');
  }

  /**
   * Get out of stock items
   */
  async getOutOfStockItems(): Promise<InventoryItem[]> {
    return Array.from(this.items.values()).filter((item) => item.status === 'out_of_stock');
  }

  /**
   * Get stock transactions
   */
  async getTransactions(itemId?: string, limit: number = 100): Promise<StockTransaction[]> {
    let transactions = this.transactions;

    if (itemId) {
      transactions = transactions.filter((t) => t.itemId === itemId);
    }

    return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(status?: string): Promise<LowStockAlert[]> {
    let alerts = Array.from(this.lowStockAlerts.values());

    if (status) {
      alerts = alerts.filter((a) => a.status === status);
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Resolve low stock alert
   */
  async resolveLowStockAlert(alertId: string): Promise<LowStockAlert> {
    const alert = this.lowStockAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    return alert;
  }

  /**
   * Mark alert as ordered
   */
  async markAlertAsOrdered(alertId: string): Promise<LowStockAlert> {
    const alert = this.lowStockAlerts.get(alertId);
    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    alert.status = 'ordered';
    return alert;
  }

  /**
   * Get waste records
   */
  async getWasteRecords(startDate?: Date, endDate?: Date): Promise<WasteRecord[]> {
    let records = this.wasteRecords;

    if (startDate && endDate) {
      records = records.filter((r) => r.date >= startDate && r.date <= endDate);
    }

    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get waste statistics
   */
  async getWasteStats(startDate: Date, endDate: Date): Promise<any> {
    const records = await this.getWasteRecords(startDate, endDate);

    const stats = {
      totalWaste: records.length,
      totalCost: records.reduce((sum, r) => sum + r.cost, 0),
      byReason: {} as Record<string, { count: number; cost: number }>,
      byLocation: {} as Record<string, { count: number; cost: number }>,
      topWastedItems: [] as any[],
    };

    // Group by reason
    for (const record of records) {
      if (!stats.byReason[record.reason]) {
        stats.byReason[record.reason] = { count: 0, cost: 0 };
      }
      stats.byReason[record.reason].count++;
      stats.byReason[record.reason].cost += record.cost;
    }

    // Group by location
    for (const record of records) {
      if (!stats.byLocation[record.location]) {
        stats.byLocation[record.location] = { count: 0, cost: 0 };
      }
      stats.byLocation[record.location].count++;
      stats.byLocation[record.location].cost += record.cost;
    }

    // Top wasted items
    const itemWaste = new Map<string, { count: number; cost: number }>();
    for (const record of records) {
      if (!itemWaste.has(record.itemName)) {
        itemWaste.set(record.itemName, { count: 0, cost: 0 });
      }
      const waste = itemWaste.get(record.itemName)!;
      waste.count += record.quantity;
      waste.cost += record.cost;
    }

    stats.topWastedItems = Array.from(itemWaste.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10);

    return stats;
  }

  /**
   * Add supplier
   */
  async addSupplier(supplier: SupplierIntegration): Promise<SupplierIntegration> {
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  /**
   * Get supplier
   */
  async getSupplier(supplierId: string): Promise<SupplierIntegration | null> {
    return this.suppliers.get(supplierId) || null;
  }

  /**
   * Get all suppliers
   */
  async getAllSuppliers(): Promise<SupplierIntegration[]> {
    return Array.from(this.suppliers.values());
  }

  /**
   * Get supplier for item
   */
  async getSupplierForItem(itemId: string): Promise<SupplierIntegration | null> {
    for (const supplier of this.suppliers.values()) {
      if (supplier.items.includes(itemId)) {
        return supplier;
      }
    }
    return null;
  }

  /**
   * Auto-generate purchase order
   */
  async generatePurchaseOrder(itemId: string): Promise<any> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const supplier = await this.getSupplierForItem(itemId);
    if (!supplier) {
      throw new Error(`No supplier found for item ${itemId}`);
    }

    const orderQuantity = Math.max(item.reorderQuantity, supplier.minimumOrderQuantity);

    const purchaseOrder = {
      id: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [
        {
          itemId,
          itemName: item.name,
          quantity: orderQuantity,
          unitPrice: item.costPerUnit,
          total: orderQuantity * item.costPerUnit,
        },
      ],
      estimatedDeliveryDate: new Date(Date.now() + supplier.leadTime * 24 * 60 * 60 * 1000),
      status: 'pending',
      createdAt: new Date(),
    };

    return purchaseOrder;
  }

  /**
   * Get inventory value
   */
  async getInventoryValue(): Promise<number> {
    let totalValue = 0;
    for (const item of this.items.values()) {
      totalValue += item.currentStock * item.costPerUnit;
    }
    return totalValue;
  }

  /**
   * Get inventory metrics
   */
  async getInventoryMetrics(): Promise<any> {
    const items = Array.from(this.items.values());
    const lowStockCount = items.filter((i) => i.status === 'low_stock').length;
    const outOfStockCount = items.filter((i) => i.status === 'out_of_stock').length;
    const inStockCount = items.filter((i) => i.status === 'in_stock').length;

    return {
      totalItems: items.length,
      inStock: inStockCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      inventoryValue: await this.getInventoryValue(),
      turnoverRate: this.calculateTurnoverRate(),
      stockoutRate: ((outOfStockCount / items.length) * 100).toFixed(2),
    };
  }

  /**
   * Calculate turnover rate
   */
  private calculateTurnoverRate(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = this.transactions.filter((t) => t.timestamp >= thirtyDaysAgo && t.type === 'usage');

    return recentTransactions.length;
  }

  /**
   * Forecast stock depletion
   */
  async forecastStockDepletion(itemId: string, days: number = 7): Promise<any> {
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = this.transactions.filter(
      (t) => t.itemId === itemId && t.timestamp >= thirtyDaysAgo && t.type === 'usage',
    );

    const dailyUsage = recentTransactions.length / 30;
    const projectedUsage = dailyUsage * days;
    const projectedStock = item.currentStock - projectedUsage;
    const daysUntilStockout = projectedStock > 0 ? Math.ceil(item.currentStock / dailyUsage) : 0;

    return {
      itemId,
      itemName: item.name,
      currentStock: item.currentStock,
      dailyUsage: dailyUsage.toFixed(2),
      projectedUsage: projectedUsage.toFixed(2),
      projectedStock: projectedStock.toFixed(2),
      daysUntilStockout,
      willRunOut: projectedStock <= 0,
      recommendation: projectedStock <= item.reorderPoint ? 'ORDER NOW' : 'Monitor',
    };
  }
}

export default InventoryTrackingService;
