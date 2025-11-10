/**
 * Multi-Location Dashboard Service
 * Centralized management for 100+ locations with analytics and performance comparison
 */

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  manager: string;
  status: 'active' | 'inactive' | 'opening_soon' | 'closed';
  openingDate: Date;
  capacity: number;
  staffCount: number;
  createdAt: Date;
}

interface LocationMetrics {
  locationId: string;
  locationName: string;
  date: Date;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerCount: number;
  newCustomers: number;
  repeatCustomers: number;
  prepTime: number;
  deliveryTime: number;
  customerSatisfaction: number;
  onTimeDeliveryRate: number;
  orderAccuracy: number;
  staffUtilization: number;
  tableOccupancy?: number;
}

interface LocationComparison {
  metric: string;
  locations: Record<string, number>;
  topPerformer: string;
  bottomPerformer: string;
  average: number;
  variance: number;
}

interface LocationPerformanceRank {
  rank: number;
  locationId: string;
  locationName: string;
  score: number;
  revenue: number;
  orders: number;
  satisfaction: number;
  onTimeDelivery: number;
}

class MultiLocationDashboardService {
  private locations: Map<string, Location> = new Map();
  private metrics: Map<string, LocationMetrics[]> = new Map();
  private alerts: any[] = [];

  /**
   * Add location
   */
  async addLocation(location: Omit<Location, 'createdAt'>): Promise<Location> {
    const fullLocation: Location = {
      ...location,
      createdAt: new Date(),
    };

    this.locations.set(location.id, fullLocation);
    this.metrics.set(location.id, []);

    return fullLocation;
  }

  /**
   * Get location
   */
  async getLocation(locationId: string): Promise<Location | null> {
    return this.locations.get(locationId) || null;
  }

  /**
   * Get all locations
   */
  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  /**
   * Get active locations
   */
  async getActiveLocations(): Promise<Location[]> {
    return Array.from(this.locations.values()).filter((l) => l.status === 'active');
  }

  /**
   * Update location
   */
  async updateLocation(locationId: string, updates: Partial<Location>): Promise<Location> {
    const location = this.locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    const updated = { ...location, ...updates };
    this.locations.set(locationId, updated);

    return updated;
  }

  /**
   * Record location metrics
   */
  async recordMetrics(metrics: LocationMetrics): Promise<LocationMetrics> {
    const locationMetrics = this.metrics.get(metrics.locationId) || [];
    locationMetrics.push(metrics);
    this.metrics.set(metrics.locationId, locationMetrics);

    // Check for alerts
    this.checkForAlerts(metrics);

    return metrics;
  }

  /**
   * Check for alerts
   */
  private checkForAlerts(metrics: LocationMetrics): void {
    const alerts: string[] = [];

    if (metrics.prepTime > 25) {
      alerts.push(`High prep time (${metrics.prepTime} min) at ${metrics.locationName}`);
    }

    if (metrics.deliveryTime > 45) {
      alerts.push(`High delivery time (${metrics.deliveryTime} min) at ${metrics.locationName}`);
    }

    if (metrics.customerSatisfaction < 3.5) {
      alerts.push(`Low satisfaction (${metrics.customerSatisfaction}/5) at ${metrics.locationName}`);
    }

    if (metrics.onTimeDeliveryRate < 85) {
      alerts.push(`Low on-time delivery (${metrics.onTimeDeliveryRate}%) at ${metrics.locationName}`);
    }

    if (metrics.orderAccuracy < 95) {
      alerts.push(`Low accuracy (${metrics.orderAccuracy}%) at ${metrics.locationName}`);
    }

    for (const alert of alerts) {
      this.alerts.push({
        id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        message: alert,
        locationId: metrics.locationId,
        severity: 'warning',
        createdAt: new Date(),
      });
    }
  }

  /**
   * Get location metrics
   */
  async getLocationMetrics(locationId: string, days: number = 30): Promise<LocationMetrics[]> {
    const allMetrics = this.metrics.get(locationId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return allMetrics.filter((m) => m.date >= cutoffDate).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Get latest metrics for all locations
   */
  async getLatestMetricsForAllLocations(): Promise<LocationMetrics[]> {
    const latest: Map<string, LocationMetrics> = new Map();

    for (const [locationId, metrics] of this.metrics.entries()) {
      if (metrics.length > 0) {
        latest.set(locationId, metrics[metrics.length - 1]);
      }
    }

    return Array.from(latest.values());
  }

  /**
   * Compare locations
   */
  async compareLocations(metric: string, locationIds?: string[]): Promise<LocationComparison> {
    const metricsToCompare = locationIds
      ? Array.from(this.metrics.entries())
          .filter(([id]) => locationIds.includes(id))
          .map(([, metrics]) => metrics[metrics.length - 1])
          .filter((m) => m !== undefined)
      : await this.getLatestMetricsForAllLocations();

    const comparison: Record<string, number> = {};
    let total = 0;
    let count = 0;

    for (const m of metricsToCompare) {
      const value = (m as any)[metric];
      if (value !== undefined) {
        comparison[m.locationName] = value;
        total += value;
        count++;
      }
    }

    const average = count > 0 ? total / count : 0;

    // Calculate variance
    let variance = 0;
    for (const value of Object.values(comparison)) {
      variance += Math.pow(value - average, 2);
    }
    variance = count > 0 ? variance / count : 0;

    const topPerformer = Object.entries(comparison).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const bottomPerformer = Object.entries(comparison).sort((a, b) => a[1] - b[1])[0]?.[0] || '';

    return {
      metric,
      locations: comparison,
      topPerformer,
      bottomPerformer,
      average: parseFloat(average.toFixed(2)),
      variance: parseFloat(variance.toFixed(2)),
    };
  }

  /**
   * Get performance ranking
   */
  async getPerformanceRanking(): Promise<LocationPerformanceRank[]> {
    const latestMetrics = await this.getLatestMetricsForAllLocations();

    const rankings = latestMetrics.map((m) => {
      // Calculate composite score (0-100)
      const revenueScore = Math.min(100, (m.totalRevenue / 50000) * 100);
      const satisfactionScore = (m.customerSatisfaction / 5) * 100;
      const deliveryScore = m.onTimeDeliveryRate;
      const accuracyScore = m.orderAccuracy;

      const compositeScore = (revenueScore * 0.3 + satisfactionScore * 0.3 + deliveryScore * 0.2 + accuracyScore * 0.2);

      return {
        rank: 0,
        locationId: m.locationId,
        locationName: m.locationName,
        score: parseFloat(compositeScore.toFixed(2)),
        revenue: m.totalRevenue,
        orders: m.totalOrders,
        satisfaction: m.customerSatisfaction,
        onTimeDelivery: m.onTimeDeliveryRate,
      };
    });

    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((r, i) => (r.rank = i + 1));

    return rankings;
  }

  /**
   * Get consolidated metrics
   */
  async getConsolidatedMetrics(days: number = 30): Promise<any> {
    const latestMetrics = await this.getLatestMetricsForAllLocations();

    const consolidated = {
      totalLocations: this.locations.size,
      activeLocations: Array.from(this.locations.values()).filter((l) => l.status === 'active').length,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      totalCustomers: 0,
      newCustomers: 0,
      averagePrepTime: 0,
      averageDeliveryTime: 0,
      averageSatisfaction: 0,
      averageOnTimeDelivery: 0,
      averageAccuracy: 0,
      totalStaff: 0,
    };

    for (const m of latestMetrics) {
      consolidated.totalOrders += m.totalOrders;
      consolidated.totalRevenue += m.totalRevenue;
      consolidated.totalCustomers += m.customerCount;
      consolidated.newCustomers += m.newCustomers;
      consolidated.averagePrepTime += m.prepTime;
      consolidated.averageDeliveryTime += m.deliveryTime;
      consolidated.averageSatisfaction += m.customerSatisfaction;
      consolidated.averageOnTimeDelivery += m.onTimeDeliveryRate;
      consolidated.averageAccuracy += m.orderAccuracy;
    }

    const count = latestMetrics.length || 1;
    consolidated.averageOrderValue = consolidated.totalRevenue / Math.max(1, consolidated.totalOrders);
    consolidated.averagePrepTime = Math.round(consolidated.averagePrepTime / count);
    consolidated.averageDeliveryTime = Math.round(consolidated.averageDeliveryTime / count);
    consolidated.averageSatisfaction = parseFloat((consolidated.averageSatisfaction / count).toFixed(2));
    consolidated.averageOnTimeDelivery = parseFloat((consolidated.averageOnTimeDelivery / count).toFixed(2));
    consolidated.averageAccuracy = parseFloat((consolidated.averageAccuracy / count).toFixed(2));
    consolidated.totalStaff = Array.from(this.locations.values()).reduce((sum, l) => sum + l.staffCount, 0);

    return consolidated;
  }

  /**
   * Get location trends
   */
  async getLocationTrends(locationId: string, days: number = 30): Promise<any> {
    const metrics = await this.getLocationMetrics(locationId, days);

    const trends = {
      revenuetrend: metrics.map((m) => ({ date: m.date, value: m.totalRevenue })),
      orderTrend: metrics.map((m) => ({ date: m.date, value: m.totalOrders })),
      satisfactionTrend: metrics.map((m) => ({ date: m.date, value: m.customerSatisfaction })),
      deliveryTrend: metrics.map((m) => ({ date: m.date, value: m.onTimeDeliveryRate })),
    };

    return trends;
  }

  /**
   * Get alerts
   */
  async getAlerts(locationId?: string): Promise<any[]> {
    let alerts = this.alerts;

    if (locationId) {
      alerts = alerts.filter((a) => a.locationId === locationId);
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get expansion recommendations
   */
  async getExpansionRecommendations(): Promise<any[]> {
    const rankings = await this.getPerformanceRanking();
    const topPerformers = rankings.slice(0, 3);

    const recommendations = topPerformers.map((location) => ({
      locationId: location.locationId,
      locationName: location.locationName,
      reason: `High performer with ${location.score}/100 score`,
      potentialRevenue: location.revenue * 1.5,
      priority: 'high',
    }));

    return recommendations;
  }

  /**
   * Get optimization opportunities
   */
  async getOptimizationOpportunities(): Promise<any[]> {
    const rankings = await this.getPerformanceRanking();
    const bottomPerformers = rankings.slice(-3);

    const opportunities = bottomPerformers.map((location) => {
      const issues: string[] = [];

      if (location.satisfaction < 3.5) {
        issues.push('Low customer satisfaction - improve service quality');
      }

      if (location.onTimeDelivery < 85) {
        issues.push('Low on-time delivery - optimize delivery routes');
      }

      if (location.score < 50) {
        issues.push('Overall low performance - review operations');
      }

      return {
        locationId: location.locationId,
        locationName: location.locationName,
        score: location.score,
        issues,
        priority: 'high',
      };
    });

    return opportunities;
  }

  /**
   * Generate consolidated report
   */
  async generateConsolidatedReport(startDate: Date, endDate: Date): Promise<any> {
    const consolidated = await this.getConsolidatedMetrics(
      Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const rankings = await this.getPerformanceRanking();
    const expansionRecs = await this.getExpansionRecommendations();
    const optimizationOps = await this.getOptimizationOpportunities();

    return {
      period: { startDate, endDate },
      consolidated,
      rankings,
      expansionRecommendations: expansionRecs,
      optimizationOpportunities: optimizationOps,
      generatedAt: new Date(),
    };
  }
}

export default MultiLocationDashboardService;
