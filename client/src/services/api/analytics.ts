/**
 * Analytics API Client
 * Handles all analytics-related API calls
 */

const API_BASE = '/api/analytics';

export interface RevenueTrend {
  date: Date;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  growth: number;
}

export interface RevenueSummary {
  locationId: string;
  timeRange: string;
  totalRevenue: number;
  avgRevenue: number;
  maxRevenue: number;
  minRevenue: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CustomerSegment {
  id: string;
  name: string;
  size: number;
  avgOrderValue: number;
  frequency: number;
  retention: number;
  lifetime: number;
  preferredItems: string[];
  churnRisk: number;
}

export interface DashboardMetrics {
  locationId: string;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  revenueTrend: number;
  ordersTrend: number;
  customersTrend: number;
  aovTrend: number;
}

export interface MenuPerformance {
  itemId: string;
  name: string;
  category: string;
  units: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  trend: number;
  rating: number;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  margin: number;
  rating: number;
}

/**
 * Revenue Analytics API
 */
export const analyticsApi = {
  // Revenue endpoints
  async getRevenueTrends(locationId: string, timeRange: string = 'monthly'): Promise<RevenueTrend[]> {
    const response = await fetch(`${API_BASE}/revenue/trends/${locationId}?timeRange=${timeRange}`);
    if (!response.ok) throw new Error('Failed to fetch revenue trends');
    const data = await response.json();
    return data.trends.map((t: any) => ({
      ...t,
      date: new Date(t.date),
    }));
  },

  async getRevenueSummary(locationId: string, timeRange: string = 'monthly'): Promise<RevenueSummary> {
    const response = await fetch(`${API_BASE}/revenue/summary/${locationId}?timeRange=${timeRange}`);
    if (!response.ok) throw new Error('Failed to fetch revenue summary');
    return response.json();
  },

  // Customer endpoints
  async getCustomerSegments(): Promise<CustomerSegment[]> {
    const response = await fetch(`${API_BASE}/customers/segments`);
    if (!response.ok) throw new Error('Failed to fetch customer segments');
    const data = await response.json();
    return data.segments;
  },

  async getCustomerRetention(locationId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/customers/retention?locationId=${locationId}`);
    if (!response.ok) throw new Error('Failed to fetch customer retention');
    return response.json();
  },

  // Menu endpoints
  async getMenuPerformance(locationId: string, timeRange: string = 'monthly'): Promise<MenuPerformance[]> {
    const response = await fetch(`${API_BASE}/menu/performance?locationId=${locationId}&timeRange=${timeRange}`);
    if (!response.ok) throw new Error('Failed to fetch menu performance');
    const data = await response.json();
    return data.items;
  },

  async getCategoryPerformance(locationId: string, timeRange: string = 'monthly'): Promise<CategoryPerformance[]> {
    const response = await fetch(`${API_BASE}/menu/category-performance?locationId=${locationId}&timeRange=${timeRange}`);
    if (!response.ok) throw new Error('Failed to fetch category performance');
    const data = await response.json();
    return data.categories;
  },

  // Dashboard endpoints
  async getDashboardMetrics(locationId: string): Promise<DashboardMetrics> {
    const response = await fetch(`${API_BASE}/dashboard/metrics/${locationId}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard metrics');
    return response.json();
  },

  // Forecasting endpoints
  async getForecastMetrics(locationId: string, horizon: number = 30): Promise<any> {
    const response = await fetch(`${API_BASE}/forecast/metrics?locationId=${locationId}&horizon=${horizon}`);
    if (!response.ok) throw new Error('Failed to fetch forecast metrics');
    return response.json();
  },

  // Recommendations
  async getRecommendations(locationId: string): Promise<any> {
    const response = await fetch(`${API_BASE}/recommendations/${locationId}`);
    if (!response.ok) throw new Error('Failed to fetch recommendations');
    return response.json();
  },

  // Export
  async exportReport(format: 'pdf' | 'excel' | 'csv', params: any): Promise<Blob> {
    const response = await fetch(`${API_BASE}/export/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ format, ...params }),
    });
    if (!response.ok) throw new Error('Failed to export report');
    return response.blob();
  },
};
