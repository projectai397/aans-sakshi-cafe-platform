/**
 * Location Performance Dashboard Service
 * Location-wise analytics comparing revenue, costs, customer satisfaction, and operational metrics
 */

type LocationStatus = 'active' | 'inactive' | 'maintenance' | 'expansion';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
  status: LocationStatus;
  openingDate: Date;
  closingDate?: Date;
  capacity: number;
  staffCount: number;
  manager: string;
}

interface LocationPerformance {
  locationId: string;
  period: { startDate: Date; endDate: Date };
  revenue: {
    total: number;
    byChannel: Record<string, number>;
    byCategory: Record<string, number>;
    averageOrderValue: number;
    orderCount: number;
  };
  costs: {
    cogs: number;
    labor: number;
    rent: number;
    utilities: number;
    other: number;
  };
  profit: {
    gross: number;
    operating: number;
    net: number;
  };
  margins: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    averageRating: number;
    nps: number;
    satisfactionScore: number;
  };
  operations: {
    orderSuccessRate: number;
    averageDeliveryTime: number;
    averagePrepTime: number;
    kitchenEfficiency: number;
    staffUtilization: number;
  };
  inventory: {
    stockValue: number;
    turnoverRate: number;
    wastePercentage: number;
  };
}

interface LocationComparison {
  period: { startDate: Date; endDate: Date };
  locations: Array<{
    locationId: string;
    locationName: string;
    revenue: number;
    profit: number;
    margin: number;
    orderCount: number;
    customerSatisfaction: number;
    ranking: number;
  }>;
  topPerformers: Array<{ locationId: string; locationName: string; metric: string; value: number }>;
  bottomPerformers: Array<{ locationId: string; locationName: string; metric: string; value: number }>;
  averages: Record<string, number>;
}

interface LocationTrend {
  locationId: string;
  metric: string;
  data: Array<{ date: Date; value: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  growthRate: number;
}

class LocationPerformanceService {
  private locations: Map<string, Location> = new Map();
  private performance: Map<string, LocationPerformance[]> = new Map();

  /**
   * Register location
   */
  async registerLocation(location: Omit<Location, 'id'>): Promise<Location> {
    const fullLocation: Location = {
      ...location,
      id: `LOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.locations.set(fullLocation.id, fullLocation);
    this.performance.set(fullLocation.id, []);

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
  async getAllLocations(status?: LocationStatus): Promise<Location[]> {
    let locations = Array.from(this.locations.values());

    if (status) {
      locations = locations.filter((l) => l.status === status);
    }

    return locations;
  }

  /**
   * Record location performance
   */
  async recordPerformance(locationId: string, performance: Omit<LocationPerformance, 'locationId'>): Promise<LocationPerformance> {
    const fullPerformance: LocationPerformance = {
      ...performance,
      locationId,
    };

    const locationPerformance = this.performance.get(locationId) || [];
    locationPerformance.push(fullPerformance);
    this.performance.set(locationId, locationPerformance);

    return fullPerformance;
  }

  /**
   * Get location performance
   */
  async getLocationPerformance(locationId: string, startDate: Date, endDate: Date): Promise<LocationPerformance | null> {
    const locationPerformance = this.performance.get(locationId) || [];

    // Find performance record for the period
    return (
      locationPerformance.find((p) => p.period.startDate >= startDate && p.period.endDate <= endDate) ||
      null
    );
  }

  /**
   * Get location comparison
   */
  async getLocationComparison(startDate: Date, endDate: Date): Promise<LocationComparison> {
    const locations = await this.getAllLocations('active');
    const locationData: LocationComparison['locations'] = [];

    let totalRevenue = 0;
    let totalProfit = 0;
    let totalOrders = 0;
    let totalSatisfaction = 0;

    for (const location of locations) {
      const perf = await this.getLocationPerformance(location.id, startDate, endDate);

      if (perf) {
        locationData.push({
          locationId: location.id,
          locationName: location.name,
          revenue: perf.revenue.total,
          profit: perf.profit.net,
          margin: perf.margins.netMargin,
          orderCount: perf.revenue.orderCount,
          customerSatisfaction: perf.customers.satisfactionScore,
          ranking: 0, // Will be set after sorting
        });

        totalRevenue += perf.revenue.total;
        totalProfit += perf.profit.net;
        totalOrders += perf.revenue.orderCount;
        totalSatisfaction += perf.customers.satisfactionScore;
      }
    }

    // Sort by revenue and assign rankings
    locationData.sort((a, b) => b.revenue - a.revenue);
    locationData.forEach((loc, index) => {
      loc.ranking = index + 1;
    });

    // Get top and bottom performers
    const topPerformers = [
      { locationId: locationData[0]?.locationId, locationName: locationData[0]?.locationName, metric: 'Revenue', value: locationData[0]?.revenue },
      { locationId: locationData[0]?.locationId, locationName: locationData[0]?.locationName, metric: 'Profit Margin', value: locationData[0]?.margin },
    ].filter((p) => p.locationId);

    const bottomPerformers = [
      { locationId: locationData[locationData.length - 1]?.locationId, locationName: locationData[locationData.length - 1]?.locationName, metric: 'Revenue', value: locationData[locationData.length - 1]?.revenue },
      { locationId: locationData[locationData.length - 1]?.locationId, locationName: locationData[locationData.length - 1]?.locationName, metric: 'Profit Margin', value: locationData[locationData.length - 1]?.margin },
    ].filter((p) => p.locationId);

    return {
      period: { startDate, endDate },
      locations: locationData,
      topPerformers: topPerformers as any,
      bottomPerformers: bottomPerformers as any,
      averages: {
        revenue: totalRevenue / Math.max(1, locations.length),
        profit: totalProfit / Math.max(1, locations.length),
        orders: totalOrders / Math.max(1, locations.length),
        satisfaction: totalSatisfaction / Math.max(1, locations.length),
      },
    };
  }

  /**
   * Get location trends
   */
  async getLocationTrends(locationId: string, metric: string, days: number = 30): Promise<LocationTrend> {
    const locationPerformance = this.performance.get(locationId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentPerformance = locationPerformance.filter((p) => p.period.startDate >= cutoffDate);

    const data: Array<{ date: Date; value: number }> = [];

    for (const perf of recentPerformance) {
      let value = 0;

      switch (metric) {
        case 'revenue':
          value = perf.revenue.total;
          break;
        case 'profit':
          value = perf.profit.net;
          break;
        case 'orders':
          value = perf.revenue.orderCount;
          break;
        case 'satisfaction':
          value = perf.customers.satisfactionScore;
          break;
        case 'efficiency':
          value = perf.operations.kitchenEfficiency;
          break;
      }

      data.push({ date: perf.period.startDate, value });
    }

    // Calculate trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let growthRate = 0;

    if (data.length >= 2) {
      const firstValue = data[0].value;
      const lastValue = data[data.length - 1].value;
      growthRate = ((lastValue - firstValue) / firstValue) * 100;

      if (growthRate > 5) trend = 'increasing';
      else if (growthRate < -5) trend = 'decreasing';
    }

    return {
      locationId,
      metric,
      data,
      trend,
      growthRate,
    };
  }

  /**
   * Get location insights
   */
  async getLocationInsights(locationId: string, startDate: Date, endDate: Date): Promise<any> {
    const location = await this.getLocation(locationId);
    const perf = await this.getLocationPerformance(locationId, startDate, endDate);

    if (!location || !perf) {
      throw new Error(`Location or performance data not found`);
    }

    const comparison = await this.getLocationComparison(startDate, endDate);
    const avgRevenue = comparison.averages.revenue;
    const avgProfit = comparison.averages.profit;

    const insights = {
      location: location.name,
      period: { startDate, endDate },
      performance: {
        revenue: perf.revenue.total,
        profit: perf.profit.net,
        margin: perf.margins.netMargin,
        orderCount: perf.revenue.orderCount,
      },
      comparison: {
        revenueVsAverage: ((perf.revenue.total - avgRevenue) / avgRevenue) * 100,
        profitVsAverage: ((perf.profit.net - avgProfit) / avgProfit) * 100,
        ranking: comparison.locations.find((l) => l.locationId === locationId)?.ranking,
      },
      strengths: [] as string[],
      weaknesses: [] as string[],
      recommendations: [] as string[],
    };

    // Identify strengths
    if (perf.margins.netMargin > 30) insights.strengths.push('High profit margin');
    if (perf.customers.satisfactionScore > 85) insights.strengths.push('Excellent customer satisfaction');
    if (perf.operations.kitchenEfficiency > 85) insights.strengths.push('Efficient kitchen operations');

    // Identify weaknesses
    if (perf.inventory.wastePercentage > 3) insights.weaknesses.push('High inventory waste');
    if (perf.operations.orderSuccessRate < 95) insights.weaknesses.push('Order fulfillment issues');
    if (perf.customers.satisfactionScore < 80) insights.weaknesses.push('Customer satisfaction concerns');

    // Recommendations
    if (perf.revenue.total < avgRevenue) {
      insights.recommendations.push('Increase marketing efforts to boost orders');
      insights.recommendations.push('Review menu pricing strategy');
    }
    if (perf.inventory.wastePercentage > 3) {
      insights.recommendations.push('Improve inventory management');
      insights.recommendations.push('Review preparation quantities');
    }
    if (perf.operations.staffUtilization < 70) {
      insights.recommendations.push('Optimize staff scheduling');
      insights.recommendations.push('Consider staff cross-training');
    }

    return insights;
  }

  /**
   * Get expansion recommendations
   */
  async getExpansionRecommendations(): Promise<any> {
    const locations = await this.getAllLocations('active');
    const recommendations = [];

    for (const location of locations) {
      const trends = await this.getLocationTrends(location.id, 'revenue', 90);

      if (trends.trend === 'increasing' && trends.growthRate > 15) {
        recommendations.push({
          location: location.name,
          reason: 'Strong revenue growth',
          growthRate: trends.growthRate.toFixed(1),
          action: 'Consider expanding capacity or opening nearby location',
        });
      }
    }

    return {
      totalLocations: locations.length,
      expansionCandidates: recommendations.length,
      recommendations,
    };
  }

  /**
   * Get location health score
   */
  async getLocationHealthScore(locationId: string, startDate: Date, endDate: Date): Promise<number> {
    const perf = await this.getLocationPerformance(locationId, startDate, endDate);

    if (!perf) return 0;

    let score = 0;

    // Revenue health (25 points)
    if (perf.revenue.total > 1000000) score += 25;
    else if (perf.revenue.total > 500000) score += 20;
    else if (perf.revenue.total > 250000) score += 15;

    // Profit health (25 points)
    if (perf.margins.netMargin > 30) score += 25;
    else if (perf.margins.netMargin > 20) score += 20;
    else if (perf.margins.netMargin > 10) score += 15;

    // Customer satisfaction (25 points)
    if (perf.customers.satisfactionScore > 85) score += 25;
    else if (perf.customers.satisfactionScore > 75) score += 20;
    else if (perf.customers.satisfactionScore > 65) score += 15;

    // Operational efficiency (25 points)
    if (perf.operations.kitchenEfficiency > 85) score += 25;
    else if (perf.operations.kitchenEfficiency > 75) score += 20;
    else if (perf.operations.kitchenEfficiency > 65) score += 15;

    return score;
  }
}

export default LocationPerformanceService;
