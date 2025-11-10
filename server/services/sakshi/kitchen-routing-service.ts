/**
 * Smart Kitchen Order Routing Service
 * Intelligent order assignment to kitchen stations based on item type and queue optimization
 */

type StationType = 'grill' | 'tandoor' | 'fryer' | 'curry' | 'bread' | 'dessert' | 'salad' | 'beverage';
type OrderStatus = 'pending' | 'assigned' | 'preparing' | 'ready' | 'completed' | 'cancelled';

interface KitchenStation {
  id: string;
  name: string;
  type: StationType;
  locationId: string;
  capacity: number; // max concurrent orders
  currentLoad: number; // current orders being prepared
  avgPrepTime: number; // average preparation time in minutes
  specialties: string[]; // items this station specializes in
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  requiredStations: StationType[]; // stations needed for this item
  estimatedPrepTime: number; // minutes
  complexity: number; // 1-5 (5 = most complex)
  ingredients: string[];
}

interface KitchenOrder {
  id: string;
  orderId: string;
  locationId: string;
  items: Array<{ itemId: string; quantity: number; specialInstructions?: string }>;
  assignedStations: Array<{ stationId: string; items: string[] }>;
  status: OrderStatus;
  priority: number; // 1-5 (5 = highest)
  estimatedPrepTime: number; // minutes
  actualPrepTime?: number; // minutes
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface StationQueue {
  stationId: string;
  orders: KitchenOrder[];
  totalWaitTime: number; // minutes
  avgWaitTime: number; // minutes
  utilizationRate: number; // percentage
}

interface RoutingMetrics {
  totalOrders: number;
  averagePrepTime: number;
  onTimeDelivery: number; // percentage
  stationUtilization: Record<string, number>;
  bottlenecks: string[];
  recommendations: string[];
}

class KitchenRoutingService {
  private stations: Map<string, KitchenStation> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private orders: Map<string, KitchenOrder> = new Map();
  private stationQueues: Map<string, StationQueue> = new Map();
  private routingHistory: KitchenOrder[] = [];

  /**
   * Station Management
   */

  async createStation(stationData: Partial<KitchenStation>): Promise<KitchenStation> {
    const id = stationData.id || `STATION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const station: KitchenStation = {
      id,
      name: stationData.name || '',
      type: stationData.type || 'curry',
      locationId: stationData.locationId || '',
      capacity: stationData.capacity || 5,
      currentLoad: 0,
      avgPrepTime: stationData.avgPrepTime || 15,
      specialties: stationData.specialties || [],
      status: 'active',
      createdAt: new Date(),
    };

    this.stations.set(id, station);
    this.stationQueues.set(id, {
      stationId: id,
      orders: [],
      totalWaitTime: 0,
      avgWaitTime: 0,
      utilizationRate: 0,
    });

    return station;
  }

  async getStation(stationId: string): Promise<KitchenStation | null> {
    return this.stations.get(stationId) || null;
  }

  async getLocationStations(locationId: string): Promise<KitchenStation[]> {
    return Array.from(this.stations.values()).filter((s) => s.locationId === locationId && s.status === 'active');
  }

  async updateStationLoad(stationId: string, delta: number): Promise<KitchenStation | null> {
    const station = this.stations.get(stationId);
    if (!station) return null;

    station.currentLoad = Math.max(0, station.currentLoad + delta);
    this.stations.set(stationId, station);
    return station;
  }

  /**
   * Menu Item Management
   */

  async addMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
    const id = itemData.id || `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const item: MenuItem = {
      id,
      name: itemData.name || '',
      category: itemData.category || '',
      requiredStations: itemData.requiredStations || [],
      estimatedPrepTime: itemData.estimatedPrepTime || 15,
      complexity: itemData.complexity || 2,
      ingredients: itemData.ingredients || [],
    };

    this.menuItems.set(id, item);
    return item;
  }

  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    return this.menuItems.get(itemId) || null;
  }

  /**
   * Smart Order Routing
   */

  async assignOrderToStations(orderId: string, locationId: string, itemIds: string[]): Promise<KitchenOrder | null> {
    const id = `KITCHEN-ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get all items in order
    const items = await Promise.all(itemIds.map((id) => this.getMenuItem(id)));
    const validItems = items.filter((item) => item !== null) as MenuItem[];

    if (validItems.length === 0) return null;

    // Get all required stations
    const requiredStationTypes = new Set<StationType>();
    for (const item of validItems) {
      item.requiredStations.forEach((st) => requiredStationTypes.add(st));
    }

    // Find best stations for this order
    const assignedStations = await this.findOptimalStations(locationId, Array.from(requiredStationTypes), validItems);

    // Calculate estimated prep time
    const estimatedPrepTime = this.calculateEstimatedPrepTime(validItems, assignedStations);

    const kitchenOrder: KitchenOrder = {
      id,
      orderId,
      locationId,
      items: itemIds.map((itemId, index) => ({
        itemId,
        quantity: 1,
      })),
      assignedStations,
      status: 'assigned',
      priority: 3, // default priority
      estimatedPrepTime,
      createdAt: new Date(),
      assignedAt: new Date(),
    };

    this.orders.set(id, kitchenOrder);

    // Update station queues
    for (const assignment of assignedStations) {
      const queue = this.stationQueues.get(assignment.stationId);
      if (queue) {
        queue.orders.push(kitchenOrder);
        await this.updateStationLoad(assignment.stationId, 1);
      }
    }

    return kitchenOrder;
  }

  private async findOptimalStations(
    locationId: string,
    requiredTypes: StationType[],
    items: MenuItem[]
  ): Promise<Array<{ stationId: string; items: string[] }>> {
    const stations = await this.getLocationStations(locationId);
    const assignments: Array<{ stationId: string; items: string[] }> = [];

    for (const requiredType of requiredTypes) {
      // Find best station for this type
      const candidateStations = stations.filter((s) => s.type === requiredType && s.status === 'active');

      if (candidateStations.length === 0) continue;

      // Sort by load (ascending) and specialties match
      const sortedStations = candidateStations.sort((a, b) => {
        const loadDiff = a.currentLoad - b.currentLoad;
        if (loadDiff !== 0) return loadDiff;

        // If same load, prefer station with matching specialties
        const itemsForType = items.filter((i) => i.requiredStations.includes(requiredType));
        const aSpecialtyMatch = itemsForType.filter((i) => a.specialties.includes(i.name)).length;
        const bSpecialtyMatch = itemsForType.filter((i) => b.specialties.includes(i.name)).length;

        return bSpecialtyMatch - aSpecialtyMatch;
      });

      const selectedStation = sortedStations[0];
      const itemsForStation = items.filter((i) => i.requiredStations.includes(requiredType)).map((i) => i.id);

      assignments.push({
        stationId: selectedStation.id,
        items: itemsForStation,
      });
    }

    return assignments;
  }

  private calculateEstimatedPrepTime(items: MenuItem[], assignments: Array<{ stationId: string; items: string[] }>): number {
    let maxPrepTime = 0;

    for (const assignment of assignments) {
      const stationItems = items.filter((i) => assignment.items.includes(i.id));
      const stationPrepTime = Math.max(...stationItems.map((i) => i.estimatedPrepTime));

      const station = this.stations.get(assignment.stationId);
      if (station) {
        // Add queue wait time
        const queue = this.stationQueues.get(assignment.stationId);
        const queueWaitTime = queue ? queue.avgWaitTime : 0;
        maxPrepTime = Math.max(maxPrepTime, stationPrepTime + queueWaitTime);
      }
    }

    return Math.ceil(maxPrepTime);
  }

  /**
   * Order Status Management
   */

  async startOrderPreparation(kitchenOrderId: string): Promise<KitchenOrder | null> {
    const order = this.orders.get(kitchenOrderId);
    if (!order) return null;

    order.status = 'preparing';
    order.startedAt = new Date();

    this.orders.set(kitchenOrderId, order);
    return order;
  }

  async completeOrderPreparation(kitchenOrderId: string): Promise<KitchenOrder | null> {
    const order = this.orders.get(kitchenOrderId);
    if (!order) return null;

    order.status = 'ready';
    order.completedAt = new Date();

    if (order.startedAt) {
      order.actualPrepTime = Math.floor((order.completedAt.getTime() - order.startedAt.getTime()) / 60000);
    }

    // Update station loads
    for (const assignment of order.assignedStations) {
      await this.updateStationLoad(assignment.stationId, -1);
    }

    this.orders.set(kitchenOrderId, order);
    this.routingHistory.push(order);

    return order;
  }

  async getKitchenOrder(kitchenOrderId: string): Promise<KitchenOrder | null> {
    return this.orders.get(kitchenOrderId) || null;
  }

  async getLocationOrders(locationId: string, status?: OrderStatus): Promise<KitchenOrder[]> {
    return Array.from(this.orders.values()).filter((o) => o.locationId === locationId && (!status || o.status === status));
  }

  /**
   * Queue Management
   */

  async getStationQueue(stationId: string): Promise<StationQueue | null> {
    return this.stationQueues.get(stationId) || null;
  }

  async getLocationQueues(locationId: string): Promise<StationQueue[]> {
    const stations = await this.getLocationStations(locationId);
    return stations.map((s) => this.stationQueues.get(s.id)).filter((q) => q !== undefined) as StationQueue[];
  }

  async updateQueueMetrics(stationId: string): Promise<void> {
    const queue = this.stationQueues.get(stationId);
    if (!queue) return;

    const station = this.stations.get(stationId);
    if (!station) return;

    // Calculate total wait time
    let totalWaitTime = 0;
    for (const order of queue.orders) {
      if (order.assignedAt) {
        const waitTime = (new Date().getTime() - order.assignedAt.getTime()) / 60000;
        totalWaitTime += waitTime;
      }
    }

    queue.totalWaitTime = totalWaitTime;
    queue.avgWaitTime = queue.orders.length > 0 ? totalWaitTime / queue.orders.length : 0;
    queue.utilizationRate = (station.currentLoad / station.capacity) * 100;

    this.stationQueues.set(stationId, queue);
  }

  /**
   * Priority Management
   */

  async setPriority(kitchenOrderId: string, priority: number): Promise<KitchenOrder | null> {
    const order = this.orders.get(kitchenOrderId);
    if (!order) return null;

    order.priority = Math.max(1, Math.min(5, priority));
    this.orders.set(kitchenOrderId, order);

    // Re-sort queues based on new priority
    for (const assignment of order.assignedStations) {
      const queue = this.stationQueues.get(assignment.stationId);
      if (queue) {
        queue.orders.sort((a, b) => b.priority - a.priority);
      }
    }

    return order;
  }

  /**
   * Analytics & Metrics
   */

  async getRoutingMetrics(locationId: string): Promise<RoutingMetrics> {
    const orders = await this.getLocationOrders(locationId);
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const stations = await this.getLocationStations(locationId);

    // Calculate metrics
    const totalOrders = completedOrders.length;
    const averagePrepTime =
      totalOrders > 0 ? completedOrders.reduce((sum, o) => sum + (o.actualPrepTime || 0), 0) / totalOrders : 0;

    // On-time delivery (within estimated time)
    const onTimeOrders = completedOrders.filter((o) => (o.actualPrepTime || 0) <= o.estimatedPrepTime).length;
    const onTimeDelivery = totalOrders > 0 ? (onTimeOrders / totalOrders) * 100 : 0;

    // Station utilization
    const stationUtilization: Record<string, number> = {};
    for (const station of stations) {
      const queue = this.stationQueues.get(station.id);
      stationUtilization[station.name] = queue ? queue.utilizationRate : 0;
    }

    // Identify bottlenecks
    const bottlenecks = Object.entries(stationUtilization)
      .filter(([, utilization]) => utilization > 80)
      .map(([name]) => name);

    // Generate recommendations
    const recommendations = this.generateRecommendations(bottlenecks, stationUtilization, averagePrepTime);

    return {
      totalOrders,
      averagePrepTime: Math.round(averagePrepTime * 100) / 100,
      onTimeDelivery: Math.round(onTimeDelivery),
      stationUtilization,
      bottlenecks,
      recommendations,
    };
  }

  private generateRecommendations(bottlenecks: string[], utilization: Record<string, number>, avgPrepTime: number): string[] {
    const recommendations: string[] = [];

    if (bottlenecks.length > 0) {
      recommendations.push(`${bottlenecks.join(', ')} stations are overloaded. Consider adding more capacity or staff.`);
    }

    if (avgPrepTime > 30) {
      recommendations.push('Average preparation time is high. Review order complexity and station efficiency.');
    }

    const underutilized = Object.entries(utilization)
      .filter(([, util]) => util < 30)
      .map(([name]) => name);

    if (underutilized.length > 0) {
      recommendations.push(`${underutilized.join(', ')} stations are underutilized. Consider cross-training staff.`);
    }

    return recommendations;
  }

  async getStationMetrics(stationId: string): Promise<any> {
    const station = this.stations.get(stationId);
    if (!station) return null;

    const queue = this.stationQueues.get(stationId);
    const stationOrders = this.routingHistory.filter((o) => o.assignedStations.some((a) => a.stationId === stationId));

    const avgPrepTime = stationOrders.length > 0 ? stationOrders.reduce((sum, o) => sum + (o.actualPrepTime || 0), 0) / stationOrders.length : 0;

    return {
      stationId,
      stationName: station.name,
      type: station.type,
      capacity: station.capacity,
      currentLoad: station.currentLoad,
      utilizationRate: queue?.utilizationRate || 0,
      queueLength: queue?.orders.length || 0,
      avgWaitTime: queue?.avgWaitTime || 0,
      totalOrdersProcessed: stationOrders.length,
      averagePrepTime: Math.round(avgPrepTime * 100) / 100,
      specialties: station.specialties,
    };
  }

  /**
   * Cleanup
   */

  async cleanupCompletedOrders(ageHours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - ageHours * 60 * 60 * 1000);
    let deletedCount = 0;

    for (const [id, order] of this.orders.entries()) {
      if (order.status === 'completed' && order.completedAt && order.completedAt < cutoffTime) {
        this.orders.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

export default KitchenRoutingService;
