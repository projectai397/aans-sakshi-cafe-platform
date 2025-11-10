/**
 * Real-Time Dashboard Component
 * Live KPI tracking with interactive charts and updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

interface KPIData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  averageRating: number;
  onTimeDeliveryRate: number;
  orderAccuracy: number;
  profitMargin: number;
  costPerOrder: number;
  customerSatisfaction: number;
  growthRate: number;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface DashboardProps {
  locationId?: string;
  refreshInterval?: number;
  onDataUpdate?: (data: KPIData) => void;
}

const RealtimeDashboard: React.FC<DashboardProps> = ({ locationId, refreshInterval = 30000, onDataUpdate }) => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData[]>([]);
  const [orderData, setOrderData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(true);

  // Mock data generator
  const generateMockData = useCallback(() => {
    const mockKPI: KPIData = {
      totalRevenue: 1550000,
      totalOrders: 3200,
      averageOrderValue: 484,
      customerCount: 2450,
      averageRating: 4.5,
      onTimeDeliveryRate: 94,
      orderAccuracy: 97,
      profitMargin: 38,
      costPerOrder: 125,
      customerSatisfaction: 92,
      growthRate: 5.1,
    };

    const mockRevenue: ChartData[] = [
      { name: 'Mon', value: 180000 },
      { name: 'Tue', value: 200000 },
      { name: 'Wed', value: 190000 },
      { name: 'Thu', value: 210000 },
      { name: 'Fri', value: 250000 },
      { name: 'Sat', value: 280000 },
      { name: 'Sun', value: 240000 },
    ];

    const mockOrders: ChartData[] = [
      { name: '12 AM', value: 45 },
      { name: '4 AM', value: 30 },
      { name: '8 AM', value: 120 },
      { name: '12 PM', value: 280 },
      { name: '4 PM', value: 200 },
      { name: '8 PM', value: 350 },
      { name: '12 AM', value: 180 },
    ];

    const mockCategory: ChartData[] = [
      { name: 'Biryani', value: 35 },
      { name: 'Curry', value: 25 },
      { name: 'Bread', value: 20 },
      { name: 'Dessert', value: 12 },
      { name: 'Beverages', value: 8 },
    ];

    setKpiData(mockKPI);
    setRevenueData(mockRevenue);
    setOrderData(mockOrders);
    setCategoryData(mockCategory);
    setLastUpdate(new Date());
    setLoading(false);
    setIsConnected(true);

    if (onDataUpdate) {
      onDataUpdate(mockKPI);
    }
  }, [onDataUpdate]);

  // Fetch data on mount and set up interval
  useEffect(() => {
    generateMockData();

    const interval = setInterval(() => {
      generateMockData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [generateMockData, refreshInterval]);

  if (loading || !kpiData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="w-full bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(kpiData.totalRevenue / 100000).toFixed(1)}L</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">+{kpiData.growthRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Orders Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.totalOrders.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-2">Avg: ₹{kpiData.averageOrderValue}</div>
          </CardContent>
        </Card>

        {/* Rating Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.averageRating.toFixed(1)}★</div>
            <div className="text-sm text-muted-foreground mt-2">{kpiData.customerCount} customers</div>
          </CardContent>
        </Card>

        {/* Delivery Rate Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">On-Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.onTimeDeliveryRate}%</div>
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">Excellent</span>
            </div>
          </CardContent>
        </Card>

        {/* Satisfaction Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpiData.customerSatisfaction}%</div>
            <div className="text-sm text-muted-foreground mt-2">Accuracy: {kpiData.orderAccuracy}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Weekly revenue performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by Hour */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Hour</CardTitle>
            <CardDescription>Hourly order distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Sales by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key operational metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Profit Margin</span>
                <span className="text-sm font-bold">{kpiData.profitMargin}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${kpiData.profitMargin}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Order Accuracy</span>
                <span className="text-sm font-bold">{kpiData.orderAccuracy}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${kpiData.orderAccuracy}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Satisfaction</span>
                <span className="text-sm font-bold">{kpiData.customerSatisfaction}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${kpiData.customerSatisfaction}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => generateMockData()}>
          Refresh Now
        </Button>
        <Button>Export Report</Button>
      </div>
    </div>
  );
};

export default RealtimeDashboard;
