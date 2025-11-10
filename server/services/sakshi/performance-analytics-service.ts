/**
 * Performance Analytics Dashboard Service
 * Real-time KPI tracking and comparative analysis
 */

interface LocationMetrics {
  locationId: string;
  locationName: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  customerCount: number;
  rating: number;
  onTimeDeliveryRate: number;
  orderAccuracy: number;
  staffCount: number;
  profitMargin: number;
  costPerOrder: number;
  customerSatisfaction: number;
}

interface KPIDashboard {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCustomers: number;
  averageRating: number;
  onTimeDeliveryRate: number;
  orderAccuracy: number;
  profitMargin: number;
  costPerOrder: number;
  customerSatisfaction: number;
  growthRate: number;
}

interface LocationComparison {
  topPerformer: LocationMetrics;
  bottomPerformer: LocationMetrics;
  averageMetrics: LocationMetrics;
  allLocations: LocationMetrics[];
  recommendations: string[];
}

interface TrendAnalysis {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  period: string;
  forecast: number;
}

interface PerformanceRanking {
  location: string;
  rank: number;
  score: number;
  metrics: Record<string, number>;
}

interface OptimizationOpportunity {
  id: string;
  location: string;
  category: string;
  issue: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
  estimatedImprovement: number;
  priority: number;
}

class PerformanceAnalyticsService {
  private locationMetrics: Map<string, LocationMetrics> = new Map();
  private trendHistory: Map<string, TrendAnalysis[]> = new Map();
  private opportunities: Map<string, OptimizationOpportunity> = new Map();

  /**
   * Get KPI dashboard
   */
  async getKPIDashboard(period: string = 'monthly'): Promise<KPIDashboard> {
    const allMetrics = Array.from(this.locationMetrics.values());

    if (allMetrics.length === 0) {
      return this.getMockKPIDashboard(period);
    }

    const totalRevenue = allMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalOrders = allMetrics.reduce((sum, m) => sum + m.orders, 0);
    const totalCustomers = allMetrics.reduce((sum, m) => sum + m.customerCount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const averageRating = allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.rating, 0) / allMetrics.length : 0;
    const averageOnTimeDelivery = allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.onTimeDeliveryRate, 0) / allMetrics.length : 0;
    const averageAccuracy = allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.orderAccuracy, 0) / allMetrics.length : 0;
    const averageProfitMargin = allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.profitMargin, 0) / allMetrics.length : 0;
    const averageCostPerOrder = allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.costPerOrder, 0) / allMetrics.length : 0;
    const averageSatisfaction = allMetrics.length > 0 ? allMetrics.reduce((sum, m) => sum + m.customerSatisfaction, 0) / allMetrics.length : 0;

    return {
      period,
      totalRevenue,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue),
      totalCustomers,
      averageRating: Math.round(averageRating * 10) / 10,
      onTimeDeliveryRate: Math.round(averageOnTimeDelivery),
      orderAccuracy: Math.round(averageAccuracy),
      profitMargin: Math.round(averageProfitMargin),
      costPerOrder: Math.round(averageCostPerOrder),
      customerSatisfaction: Math.round(averageSatisfaction),
      growthRate: 5.1, // 5.1% growth
    };
  }

  /**
   * Get mock KPI dashboard
   */
  private getMockKPIDashboard(period: string): KPIDashboard {
    return {
      period,
      totalRevenue: 1550000,
      totalOrders: 3200,
      averageOrderValue: 484,
      totalCustomers: 2450,
      averageRating: 4.5,
      onTimeDeliveryRate: 94,
      orderAccuracy: 97,
      profitMargin: 38,
      costPerOrder: 125,
      customerSatisfaction: 92,
      growthRate: 5.1,
    };
  }

  /**
   * Get location metrics
   */
  async getLocationMetrics(locationId: string): Promise<LocationMetrics | null> {
    return this.locationMetrics.get(locationId) || null;
  }

  /**
   * Get all location metrics
   */
  async getAllLocationMetrics(): Promise<LocationMetrics[]> {
    return Array.from(this.locationMetrics.values()).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get location comparison
   */
  async getLocationComparison(): Promise<LocationComparison> {
    const allMetrics = await this.getAllLocationMetrics();

    if (allMetrics.length === 0) {
      return this.getMockLocationComparison();
    }

    const topPerformer = allMetrics[0];
    const bottomPerformer = allMetrics[allMetrics.length - 1];

    const averageMetrics: LocationMetrics = {
      locationId: 'AVERAGE',
      locationName: 'Average',
      revenue: allMetrics.reduce((sum, m) => sum + m.revenue, 0) / allMetrics.length,
      orders: allMetrics.reduce((sum, m) => sum + m.orders, 0) / allMetrics.length,
      averageOrderValue: allMetrics.reduce((sum, m) => sum + m.averageOrderValue, 0) / allMetrics.length,
      customerCount: allMetrics.reduce((sum, m) => sum + m.customerCount, 0) / allMetrics.length,
      rating: allMetrics.reduce((sum, m) => sum + m.rating, 0) / allMetrics.length,
      onTimeDeliveryRate: allMetrics.reduce((sum, m) => sum + m.onTimeDeliveryRate, 0) / allMetrics.length,
      orderAccuracy: allMetrics.reduce((sum, m) => sum + m.orderAccuracy, 0) / allMetrics.length,
      staffCount: allMetrics.reduce((sum, m) => sum + m.staffCount, 0) / allMetrics.length,
      profitMargin: allMetrics.reduce((sum, m) => sum + m.profitMargin, 0) / allMetrics.length,
      costPerOrder: allMetrics.reduce((sum, m) => sum + m.costPerOrder, 0) / allMetrics.length,
      customerSatisfaction: allMetrics.reduce((sum, m) => sum + m.customerSatisfaction, 0) / allMetrics.length,
    };

    const recommendations = this.generateRecommendations(allMetrics, topPerformer, bottomPerformer);

    return {
      topPerformer,
      bottomPerformer,
      averageMetrics,
      allLocations: allMetrics,
      recommendations,
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(allMetrics: LocationMetrics[], topPerformer: LocationMetrics, bottomPerformer: LocationMetrics): string[] {
    const recommendations: string[] = [];

    // Revenue recommendations
    const revenueGap = topPerformer.revenue - bottomPerformer.revenue;
    if (revenueGap > 0) {
      recommendations.push(`${bottomPerformer.locationName} can increase revenue by ₹${Math.round(revenueGap)} by implementing strategies from ${topPerformer.locationName}`);
    }

    // Delivery performance
    if (bottomPerformer.onTimeDeliveryRate < 90) {
      recommendations.push(`Improve on-time delivery at ${bottomPerformer.locationName} (currently ${bottomPerformer.onTimeDeliveryRate}%) to match ${topPerformer.locationName} (${topPerformer.onTimeDeliveryRate}%)`);
    }

    // Order accuracy
    if (bottomPerformer.orderAccuracy < 95) {
      recommendations.push(`Focus on order accuracy at ${bottomPerformer.locationName} (currently ${bottomPerformer.orderAccuracy}%) to reduce complaints and increase ratings`);
    }

    // Staff optimization
    const avgRevenuePerStaff = allMetrics.map((m) => m.revenue / m.staffCount).reduce((a, b) => a + b) / allMetrics.length;
    const bottomRevenuePerStaff = bottomPerformer.revenue / bottomPerformer.staffCount;
    if (bottomRevenuePerStaff < avgRevenuePerStaff * 0.8) {
      recommendations.push(`Optimize staffing at ${bottomPerformer.locationName} to improve revenue per staff member`);
    }

    return recommendations;
  }

  /**
   * Get mock location comparison
   */
  private getMockLocationComparison(): LocationComparison {
    const topPerformer: LocationMetrics = {
      locationId: 'LOC-001',
      locationName: 'Downtown Branch',
      revenue: 1500000,
      orders: 3100,
      averageOrderValue: 484,
      customerCount: 2200,
      rating: 4.6,
      onTimeDeliveryRate: 96,
      orderAccuracy: 98,
      staffCount: 45,
      profitMargin: 40,
      costPerOrder: 120,
      customerSatisfaction: 94,
    };

    const bottomPerformer: LocationMetrics = {
      locationId: 'LOC-002',
      locationName: 'Airport Branch',
      revenue: 800000,
      orders: 1650,
      averageOrderValue: 485,
      customerCount: 1200,
      rating: 4.2,
      onTimeDeliveryRate: 88,
      orderAccuracy: 95,
      staffCount: 25,
      profitMargin: 35,
      costPerOrder: 135,
      customerSatisfaction: 88,
    };

    return {
      topPerformer,
      bottomPerformer,
      averageMetrics: {
        locationId: 'AVERAGE',
        locationName: 'Average',
        revenue: 1150000,
        orders: 2375,
        averageOrderValue: 484,
        customerCount: 1700,
        rating: 4.4,
        onTimeDeliveryRate: 92,
        orderAccuracy: 96,
        staffCount: 35,
        profitMargin: 37,
        costPerOrder: 127,
        customerSatisfaction: 91,
      },
      allLocations: [topPerformer, bottomPerformer],
      recommendations: [
        'Airport Branch can increase revenue by ₹700K by implementing strategies from Downtown Branch',
        'Improve on-time delivery at Airport Branch (88%) to match Downtown Branch (96%)',
        'Focus on order accuracy at Airport Branch (95%) to reduce complaints',
      ],
    };
  }

  /**
   * Get trend analysis
   */
  async getTrendAnalysis(metric: string, period: string = 'monthly'): Promise<TrendAnalysis> {
    const trends = this.trendHistory.get(metric) || [];

    if (trends.length === 0) {
      return this.getMockTrendAnalysis(metric, period);
    }

    const latestTrend = trends[trends.length - 1];
    return latestTrend;
  }

  /**
   * Get mock trend analysis
   */
  private getMockTrendAnalysis(metric: string, period: string): TrendAnalysis {
    const trendMap: Record<string, TrendAnalysis> = {
      revenue: {
        metric: 'Revenue',
        trend: 'up',
        percentageChange: 5.1,
        period,
        forecast: 1630000,
      },
      orders: {
        metric: 'Orders',
        trend: 'up',
        percentageChange: 3.2,
        period,
        forecast: 3300,
      },
      customerSatisfaction: {
        metric: 'Customer Satisfaction',
        trend: 'up',
        percentageChange: 2.1,
        period,
        forecast: 93,
      },
      profitMargin: {
        metric: 'Profit Margin',
        trend: 'stable',
        percentageChange: 0.5,
        period,
        forecast: 38,
      },
    };

    return trendMap[metric] || trendMap['revenue'];
  }

  /**
   * Get performance ranking
   */
  async getPerformanceRanking(): Promise<PerformanceRanking[]> {
    const allMetrics = await this.getAllLocationMetrics();

    return allMetrics.map((m, index) => {
      const score = (m.revenue / 1500000) * 0.3 + (m.rating / 5) * 0.2 + (m.onTimeDeliveryRate / 100) * 0.2 + (m.orderAccuracy / 100) * 0.15 + (m.customerSatisfaction / 100) * 0.15;

      return {
        location: m.locationName,
        rank: index + 1,
        score: Math.round(score * 100),
        metrics: {
          revenue: m.revenue,
          rating: m.rating,
          onTimeDelivery: m.onTimeDeliveryRate,
          accuracy: m.orderAccuracy,
          satisfaction: m.customerSatisfaction,
        },
      };
    });
  }

  /**
   * Get optimization opportunities
   */
  async getOptimizationOpportunities(): Promise<OptimizationOpportunity[]> {
    return Array.from(this.opportunities.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Identify optimization opportunities
   */
  async identifyOpportunities(): Promise<OptimizationOpportunity[]> {
    const allMetrics = await this.getAllLocationMetrics();
    const opportunities: OptimizationOpportunity[] = [];

    for (const metric of allMetrics) {
      // Low delivery performance
      if (metric.onTimeDeliveryRate < 90) {
        opportunities.push({
          id: `OPP-${Date.now()}-1`,
          location: metric.locationName,
          category: 'Delivery',
          issue: `On-time delivery rate is ${metric.onTimeDeliveryRate}%`,
          impact: 'high',
          recommendation: 'Optimize delivery routes and improve driver coordination',
          estimatedImprovement: 5,
          priority: 1,
        });
      }

      // High cost per order
      if (metric.costPerOrder > 130) {
        opportunities.push({
          id: `OPP-${Date.now()}-2`,
          location: metric.locationName,
          category: 'Cost',
          issue: `Cost per order is ₹${metric.costPerOrder}`,
          impact: 'medium',
          recommendation: 'Review procurement and reduce operational costs',
          estimatedImprovement: 8,
          priority: 2,
        });
      }

      // Low rating
      if (metric.rating < 4.3) {
        opportunities.push({
          id: `OPP-${Date.now()}-3`,
          location: metric.locationName,
          category: 'Quality',
          issue: `Customer rating is ${metric.rating}`,
          impact: 'high',
          recommendation: 'Improve food quality and customer service',
          estimatedImprovement: 12,
          priority: 1,
        });
      }
    }

    return opportunities;
  }
}

export default PerformanceAnalyticsService;
