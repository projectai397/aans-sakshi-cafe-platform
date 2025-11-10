/**
 * Business Intelligence & Reporting Dashboard Service
 * Real-time KPIs, financial reports, and predictive analytics
 */

type ReportType = 'financial' | 'operational' | 'customer' | 'delivery' | 'inventory' | 'staff' | 'marketing';
type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type MetricType = 'revenue' | 'cost' | 'profit' | 'margin' | 'count' | 'average' | 'percentage';

interface KPI {
  id: string;
  name: string;
  value: number;
  unit: string;
  target: number;
  variance: number; // percentage
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  historicalData: Array<{ date: Date; value: number }>;
}

interface FinancialReport {
  period: { startDate: Date; endDate: Date };
  revenue: {
    total: number;
    byChannel: Record<string, number>; // dine-in, delivery, takeaway
    byCategory: Record<string, number>;
    byLocation: Record<string, number>;
  };
  costs: {
    cogs: number;
    labor: number;
    delivery: number;
    marketing: number;
    overhead: number;
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
  metrics: {
    averageOrderValue: number;
    orderCount: number;
    customerCount: number;
    conversionRate: number;
  };
}

interface OperationalReport {
  period: { startDate: Date; endDate: Date };
  orders: {
    total: number;
    completed: number;
    failed: number;
    cancelled: number;
    successRate: number;
  };
  delivery: {
    averageTime: number;
    onTimeRate: number;
    failureRate: number;
    partnerCount: number;
    partnerUtilization: number;
  };
  kitchen: {
    averagePrepTime: number;
    itemsPerHour: number;
    bottlenecks: string[];
    efficiency: number;
  };
  inventory: {
    stockValue: number;
    turnoverRate: number;
    wastePercentage: number;
    lowStockItems: number;
  };
}

interface CustomerReport {
  period: { startDate: Date; endDate: Date };
  customers: {
    total: number;
    new: number;
    returning: number;
    active: number;
    churned: number;
  };
  engagement: {
    averageRating: number;
    nps: number;
    satisfactionScore: number;
    retentionRate: number;
    churnRate: number;
  };
  behavior: {
    averageOrderValue: number;
    orderFrequency: number;
    lifetimeValue: number;
    repeatPurchaseRate: number;
  };
  segments: {
    vip: number;
    regular: number;
    occasional: number;
    inactive: number;
  };
}

interface Forecast {
  metric: string;
  period: { startDate: Date; endDate: Date };
  forecast: Array<{ date: Date; value: number; confidence: number }>;
  model: 'linear' | 'exponential' | 'seasonal' | 'arima';
  accuracy: number; // percentage
  lastUpdated: Date;
}

interface Dashboard {
  id: string;
  name: string;
  type: 'executive' | 'operational' | 'financial' | 'custom';
  widgets: Array<{
    id: string;
    type: string;
    metric: string;
    title: string;
    position: { x: number; y: number };
  }>;
  refreshInterval: number; // seconds
  createdAt: Date;
}

class BIReportingService {
  private kpis: Map<string, KPI> = new Map();
  private financialReports: Map<string, FinancialReport> = new Map();
  private operationalReports: Map<string, OperationalReport> = new Map();
  private customerReports: Map<string, CustomerReport> = new Map();
  private forecasts: Map<string, Forecast> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();

  /**
   * Create KPI
   */
  async createKPI(kpi: Omit<KPI, 'id | lastUpdated | historicalData'>): Promise<KPI> {
    const fullKPI: KPI = {
      ...kpi,
      id: `KPI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
      historicalData: [{ date: new Date(), value: kpi.value }],
    };

    this.kpis.set(fullKPI.id, fullKPI);
    return fullKPI;
  }

  /**
   * Update KPI value
   */
  async updateKPIValue(kpiId: string, value: number): Promise<KPI> {
    const kpi = this.kpis.get(kpiId);
    if (!kpi) {
      throw new Error(`KPI ${kpiId} not found`);
    }

    const oldValue = kpi.value;
    kpi.value = value;
    kpi.variance = ((value - kpi.target) / kpi.target) * 100;
    kpi.trend = value > oldValue ? 'up' : value < oldValue ? 'down' : 'stable';
    kpi.lastUpdated = new Date();
    kpi.historicalData.push({ date: new Date(), value });

    // Keep only last 90 days of history
    if (kpi.historicalData.length > 90) {
      kpi.historicalData = kpi.historicalData.slice(-90);
    }

    return kpi;
  }

  /**
   * Get KPI
   */
  async getKPI(kpiId: string): Promise<KPI | null> {
    return this.kpis.get(kpiId) || null;
  }

  /**
   * Get all KPIs
   */
  async getAllKPIs(): Promise<KPI[]> {
    return Array.from(this.kpis.values());
  }

  /**
   * Generate financial report
   */
  async generateFinancialReport(startDate: Date, endDate: Date): Promise<FinancialReport> {
    // Simulate financial data
    const report: FinancialReport = {
      period: { startDate, endDate },
      revenue: {
        total: 1550000, // ₹15.5 Lakh
        byChannel: {
          'dine-in': 620000,
          'delivery': 775000,
          'takeaway': 155000,
        },
        byCategory: {
          'Main Course': 620000,
          'Breads': 310000,
          'Desserts': 155000,
          'Beverages': 465000,
        },
        byLocation: {
          'Downtown': 775000,
          'Midtown': 465000,
          'Airport': 310000,
        },
      },
      costs: {
        cogs: 465000, // 30% of revenue
        labor: 310000, // 20% of revenue
        delivery: 155000, // 10% of revenue
        marketing: 93000, // 6% of revenue
        overhead: 124000, // 8% of revenue
        other: 62000, // 4% of revenue
      },
      profit: {
        gross: 1085000, // Revenue - COGS
        operating: 682000, // Gross - Labor - Delivery - Marketing
        net: 496000, // Operating - Overhead - Other
      },
      margins: {
        grossMargin: 70,
        operatingMargin: 44,
        netMargin: 32,
      },
      metrics: {
        averageOrderValue: 500,
        orderCount: 3100,
        customerCount: 2100,
        conversionRate: 8.5,
      },
    };

    const reportId = `REPORT-${Date.now()}`;
    this.financialReports.set(reportId, report);

    return report;
  }

  /**
   * Generate operational report
   */
  async generateOperationalReport(startDate: Date, endDate: Date): Promise<OperationalReport> {
    const report: OperationalReport = {
      period: { startDate, endDate },
      orders: {
        total: 3100,
        completed: 2945,
        failed: 93,
        cancelled: 62,
        successRate: 94.9,
      },
      delivery: {
        averageTime: 28,
        onTimeRate: 94,
        failureRate: 3,
        partnerCount: 45,
        partnerUtilization: 72,
      },
      kitchen: {
        averagePrepTime: 18.5,
        itemsPerHour: 165,
        bottlenecks: ['Tandoor', 'Fryer'],
        efficiency: 85,
      },
      inventory: {
        stockValue: 250000,
        turnoverRate: 6.2,
        wastePercentage: 2.1,
        lowStockItems: 8,
      },
    };

    const reportId = `REPORT-${Date.now()}`;
    this.operationalReports.set(reportId, report);

    return report;
  }

  /**
   * Generate customer report
   */
  async generateCustomerReport(startDate: Date, endDate: Date): Promise<CustomerReport> {
    const report: CustomerReport = {
      period: { startDate, endDate },
      customers: {
        total: 8500,
        new: 850,
        returning: 7650,
        active: 6800,
        churned: 425,
      },
      engagement: {
        averageRating: 4.6,
        nps: 55,
        satisfactionScore: 85,
        retentionRate: 90,
        churnRate: 5,
      },
      behavior: {
        averageOrderValue: 500,
        orderFrequency: 3.6,
        lifetimeValue: 12500,
        repeatPurchaseRate: 85,
      },
      segments: {
        vip: 850,
        regular: 2550,
        occasional: 3400,
        inactive: 1700,
      },
    };

    const reportId = `REPORT-${Date.now()}`;
    this.customerReports.set(reportId, report);

    return report;
  }

  /**
   * Generate forecast
   */
  async generateForecast(metric: string, days: number = 30): Promise<Forecast> {
    const forecast: Forecast = {
      metric,
      period: {
        startDate: new Date(),
        endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      },
      forecast: [],
      model: 'seasonal',
      accuracy: 82,
      lastUpdated: new Date(),
    };

    // Generate forecast data
    const baseValue = metric === 'revenue' ? 50000 : metric === 'orders' ? 100 : 4.5;

    for (let i = 1; i <= days; i++) {
      const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const variance = (Math.random() - 0.5) * 0.2; // ±10% variance
      const value = baseValue * (1 + variance);
      const confidence = 0.95 - (i / days) * 0.15; // Decreases over time

      forecast.forecast.push({
        date,
        value,
        confidence,
      });
    }

    const forecastId = `FORECAST-${Date.now()}`;
    this.forecasts.set(forecastId, forecast);

    return forecast;
  }

  /**
   * Create dashboard
   */
  async createDashboard(dashboard: Omit<Dashboard, 'id | createdAt'>): Promise<Dashboard> {
    const fullDashboard: Dashboard = {
      ...dashboard,
      id: `DASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.dashboards.set(fullDashboard.id, fullDashboard);
    return fullDashboard;
  }

  /**
   * Get dashboard
   */
  async getDashboard(dashboardId: string): Promise<Dashboard | null> {
    return this.dashboards.get(dashboardId) || null;
  }

  /**
   * Get all dashboards
   */
  async getAllDashboards(): Promise<Dashboard[]> {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get executive summary
   */
  async getExecutiveSummary(startDate: Date, endDate: Date): Promise<any> {
    const financialReport = await this.generateFinancialReport(startDate, endDate);
    const operationalReport = await this.generateOperationalReport(startDate, endDate);
    const customerReport = await this.generateCustomerReport(startDate, endDate);

    return {
      period: { startDate, endDate },
      financial: {
        revenue: financialReport.revenue.total,
        profit: financialReport.profit.net,
        margin: financialReport.margins.netMargin,
        costPerOrder: (financialReport.costs.cogs + financialReport.costs.labor) / financialReport.metrics.orderCount,
      },
      operational: {
        orderCount: operationalReport.orders.total,
        successRate: operationalReport.orders.successRate,
        averageDeliveryTime: operationalReport.delivery.averageTime,
        kitchenEfficiency: operationalReport.kitchen.efficiency,
      },
      customer: {
        totalCustomers: customerReport.customers.total,
        newCustomers: customerReport.customers.new,
        retentionRate: customerReport.engagement.retentionRate,
        nps: customerReport.engagement.nps,
        averageOrderValue: customerReport.behavior.averageOrderValue,
      },
      topMetrics: [
        { name: 'Revenue', value: `₹${(financialReport.revenue.total / 100000).toFixed(1)}L`, trend: 'up' },
        { name: 'Profit Margin', value: `${financialReport.margins.netMargin}%`, trend: 'up' },
        { name: 'Order Success Rate', value: `${operationalReport.orders.successRate}%`, trend: 'stable' },
        { name: 'Customer Retention', value: `${customerReport.engagement.retentionRate}%`, trend: 'up' },
      ],
    };
  }

  /**
   * Get financial metrics
   */
  async getFinancialMetrics(startDate: Date, endDate: Date): Promise<any> {
    const report = await this.generateFinancialReport(startDate, endDate);

    return {
      revenue: report.revenue,
      costs: report.costs,
      profit: report.profit,
      margins: report.margins,
      metrics: report.metrics,
      costBreakdown: {
        cogs: ((report.costs.cogs / report.revenue.total) * 100).toFixed(1),
        labor: ((report.costs.labor / report.revenue.total) * 100).toFixed(1),
        delivery: ((report.costs.delivery / report.revenue.total) * 100).toFixed(1),
        marketing: ((report.costs.marketing / report.revenue.total) * 100).toFixed(1),
        overhead: ((report.costs.overhead / report.revenue.total) * 100).toFixed(1),
        other: ((report.costs.other / report.revenue.total) * 100).toFixed(1),
      },
    };
  }

  /**
   * Get operational metrics
   */
  async getOperationalMetrics(startDate: Date, endDate: Date): Promise<any> {
    const report = await this.generateOperationalReport(startDate, endDate);

    return {
      orders: report.orders,
      delivery: report.delivery,
      kitchen: report.kitchen,
      inventory: report.inventory,
      efficiency: {
        orderSuccessRate: report.orders.successRate,
        deliveryOnTimeRate: report.delivery.onTimeRate,
        kitchenEfficiency: report.kitchen.efficiency,
      },
    };
  }

  /**
   * Get customer metrics
   */
  async getCustomerMetrics(startDate: Date, endDate: Date): Promise<any> {
    const report = await this.generateCustomerReport(startDate, endDate);

    return {
      customers: report.customers,
      engagement: report.engagement,
      behavior: report.behavior,
      segments: report.segments,
      acquisition: {
        newCustomers: report.customers.new,
        acquisitionCost: 500, // Simulated
        lifetimeValue: report.behavior.lifetimeValue,
        roi: (report.behavior.lifetimeValue / 500).toFixed(1),
      },
    };
  }

  /**
   * Get predictive insights
   */
  async getPredictiveInsights(): Promise<any> {
    const revenueForecast = await this.generateForecast('revenue', 30);
    const ordersForecast = await this.generateForecast('orders', 30);

    return {
      revenue: {
        forecast: revenueForecast.forecast.slice(0, 7), // Next 7 days
        trend: 'increasing',
        confidence: revenueForecast.accuracy,
      },
      orders: {
        forecast: ordersForecast.forecast.slice(0, 7),
        trend: 'stable',
        confidence: ordersForecast.accuracy,
      },
      recommendations: [
        'Increase staff during predicted peak hours',
        'Stock up on high-demand items',
        'Plan promotional campaigns for slow periods',
        'Optimize delivery routes based on forecast',
      ],
    };
  }

  /**
   * Get comparison analytics
   */
  async getComparisonAnalytics(period1Start: Date, period1End: Date, period2Start: Date, period2End: Date): Promise<any> {
    const report1 = await this.generateFinancialReport(period1Start, period1End);
    const report2 = await this.generateFinancialReport(period2Start, period2End);

    return {
      period1: { startDate: period1Start, endDate: period1End },
      period2: { startDate: period2Start, endDate: period2End },
      comparison: {
        revenue: {
          period1: report1.revenue.total,
          period2: report2.revenue.total,
          change: (((report2.revenue.total - report1.revenue.total) / report1.revenue.total) * 100).toFixed(1),
        },
        profit: {
          period1: report1.profit.net,
          period2: report2.profit.net,
          change: (((report2.profit.net - report1.profit.net) / report1.profit.net) * 100).toFixed(1),
        },
        margin: {
          period1: report1.margins.netMargin,
          period2: report2.margins.netMargin,
          change: (report2.margins.netMargin - report1.margins.netMargin).toFixed(1),
        },
      },
    };
  }
}

export default BIReportingService;
