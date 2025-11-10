import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

interface DashboardData {
  inventory: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
    wastePercentage: number;
  };
  feedback: {
    averageRating: number;
    totalReviews: number;
    positiveReviews: number;
    negativeReviews: number;
    responseRate: number;
  };
  financial: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    cashPosition: number;
  };
  trends: {
    revenue: Array<{ date: string; value: number }>;
    expenses: Array<{ date: string; value: number }>;
    inventory: Array<{ category: string; value: number }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const IntegratedDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Array<{ id: string; type: 'warning' | 'error' | 'info'; title: string; message: string }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from actual API
      const mockData: DashboardData = {
        inventory: {
          totalItems: 150,
          lowStockItems: 12,
          outOfStockItems: 3,
          totalValue: 450000,
          wastePercentage: 2.5,
        },
        feedback: {
          averageRating: 4.5,
          totalReviews: 245,
          positiveReviews: 210,
          negativeReviews: 15,
          responseRate: 85,
        },
        financial: {
          totalRevenue: 1550000,
          totalExpenses: 950000,
          netProfit: 600000,
          profitMargin: 38.7,
          cashPosition: 250000,
        },
        trends: {
          revenue: [
            { date: 'Week 1', value: 350000 },
            { date: 'Week 2', value: 380000 },
            { date: 'Week 3', value: 410000 },
            { date: 'Week 4', value: 410000 },
          ],
          expenses: [
            { date: 'Week 1', value: 220000 },
            { date: 'Week 2', value: 230000 },
            { date: 'Week 3', value: 240000 },
            { date: 'Week 4', value: 260000 },
          ],
          inventory: [
            { category: 'Vegetables', value: 120000 },
            { category: 'Meat', value: 150000 },
            { category: 'Dairy', value: 80000 },
            { category: 'Spices', value: 50000 },
            { category: 'Others', value: 50000 },
          ],
        },
      };

      setData(mockData);

      // Generate alerts
      const generatedAlerts = [];
      if (mockData.inventory.lowStockItems > 10) {
        generatedAlerts.push({
          id: '1',
          type: 'warning' as const,
          title: 'Low Stock Alert',
          message: `${mockData.inventory.lowStockItems} items are running low on stock`,
        });
      }
      if (mockData.inventory.outOfStockItems > 0) {
        generatedAlerts.push({
          id: '2',
          type: 'error' as const,
          title: 'Out of Stock',
          message: `${mockData.inventory.outOfStockItems} items are out of stock`,
        });
      }
      if (mockData.feedback.negativeReviews > 10) {
        generatedAlerts.push({
          id: '3',
          type: 'warning' as const,
          title: 'Negative Reviews',
          message: `${mockData.feedback.negativeReviews} negative reviews need attention`,
        });
      }
      if (mockData.financial.profitMargin < 35) {
        generatedAlerts.push({
          id: '4',
          type: 'warning' as const,
          title: 'Profit Margin Alert',
          message: 'Profit margin is below target (35%)',
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load dashboard data. Please try again.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      {/* Header */}
      <div className="border-b bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sakshi Cafe Dashboard</h1>
            <p className="text-muted-foreground mt-2">Real-time operational overview</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="p-6 space-y-3">
          {alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
              {alert.type === 'error' ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(data.financial.totalRevenue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              +5.1% from last month
            </p>
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(data.financial.netProfit / 100000).toFixed(2)}L</div>
            <p className="text-xs text-muted-foreground mt-2">
              Margin: <span className="font-semibold text-green-600">{data.financial.profitMargin.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Inventory Health */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.inventory.totalItems}</div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <p>
                <Badge variant="outline" className="text-yellow-600">
                  {data.inventory.lowStockItems} Low
                </Badge>
              </p>
              <p>
                <Badge variant="outline" className="text-red-600">
                  {data.inventory.outOfStockItems} Out
                </Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Rating */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.feedback.averageRating.toFixed(1)} ⭐</div>
            <p className="text-xs text-muted-foreground mt-2">
              {data.feedback.totalReviews} reviews | {data.feedback.responseRate}% response rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="p-6">
        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses Trend</CardTitle>
                <CardDescription>Weekly comparison for the current month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.trends.revenue.map((r, i) => ({ ...r, expenses: data.trends.expenses[i].value }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${(value / 100000).toFixed(1)}L`} />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#0088FE" name="Revenue" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#FF8042" name="Expenses" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margin Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Margin</span>
                    <span className="text-2xl font-bold text-green-600">{data.financial.profitMargin.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${data.financial.profitMargin}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Target: 35%</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Value by Category</CardTitle>
                <CardDescription>Current stock value distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.trends.inventory} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ₹${(value / 10000).toFixed(0)}K`} outerRadius={80} fill="#8884d8" dataKey="value">
                      {data.trends.inventory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${(value / 10000).toFixed(1)}K`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stock Status Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">In Stock</span>
                  <span className="text-lg font-bold text-green-600">{data.inventory.totalItems - data.inventory.lowStockItems - data.inventory.outOfStockItems}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Low Stock</span>
                  <span className="text-lg font-bold text-yellow-600">{data.inventory.lowStockItems}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Out of Stock</span>
                  <span className="text-lg font-bold text-red-600">{data.inventory.outOfStockItems}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Review Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{data.feedback.positiveReviews}</div>
                    <p className="text-sm text-muted-foreground mt-2">Positive</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-600">{data.feedback.totalReviews - data.feedback.positiveReviews - data.feedback.negativeReviews}</div>
                    <p className="text-sm text-muted-foreground mt-2">Neutral</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-3xl font-bold text-red-600">{data.feedback.negativeReviews}</div>
                    <p className="text-sm text-muted-foreground mt-2">Negative</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Response Rate</span>
                    <span className="text-lg font-bold">{data.feedback.responseRate}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${data.feedback.responseRate}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">Total Reviews</span>
                  <span className="text-lg font-bold">{data.feedback.totalReviews}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default IntegratedDashboard;
