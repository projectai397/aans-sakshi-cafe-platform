/**
 * Advanced Reporting Dashboard Component
 * Interactive charts, filters, and export capabilities
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Filter, RefreshCw, TrendingUp } from 'lucide-react';

type ReportType = 'financial' | 'operational' | 'customer' | 'location';
type DateRange = 'week' | 'month' | 'quarter' | 'year';

interface ReportData {
  type: ReportType;
  period: DateRange;
  data: any;
  lastUpdated: Date;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const AdvancedReportingDashboard: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('financial');
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [isLoading, setIsLoading] = useState(false);

  // Sample financial data
  const financialData = [
    { name: 'Week 1', revenue: 350000, profit: 105000, margin: 30 },
    { name: 'Week 2', revenue: 380000, margin: 32, profit: 121600 },
    { name: 'Week 3', revenue: 410000, profit: 136300, margin: 33 },
    { name: 'Week 4', revenue: 410000, profit: 131200, margin: 32 },
  ];

  // Sample operational data
  const operationalData = [
    { name: 'Mon', orders: 250, successRate: 94, prepTime: 18 },
    { name: 'Tue', orders: 280, successRate: 95, prepTime: 17 },
    { name: 'Wed', orders: 320, successRate: 96, prepTime: 16 },
    { name: 'Thu', orders: 290, successRate: 94, prepTime: 18 },
    { name: 'Fri', orders: 380, successRate: 97, prepTime: 15 },
    { name: 'Sat', orders: 420, successRate: 96, prepTime: 17 },
    { name: 'Sun', orders: 360, successRate: 95, prepTime: 18 },
  ];

  // Sample customer data
  const customerSegmentData = [
    { name: 'VIP', value: 850, fill: '#0088FE' },
    { name: 'Regular', value: 2550, fill: '#00C49F' },
    { name: 'Occasional', value: 3400, fill: '#FFBB28' },
    { name: 'Inactive', value: 1700, fill: '#FF8042' },
  ];

  // Sample location data
  const locationData = [
    { name: 'Downtown', revenue: 775000, profit: 248000, satisfaction: 88 },
    { name: 'Midtown', revenue: 465000, profit: 139500, satisfaction: 85 },
    { name: 'Airport', revenue: 310000, profit: 93000, satisfaction: 82 },
  ];

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    setIsLoading(true);
    // Simulate export
    setTimeout(() => {
      console.log(`Exporting ${reportType} report as ${format}`);
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const renderFinancialReport = () => (
    <div className="space-y-6">
      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Trend
          </CardTitle>
          <CardDescription>Weekly revenue and profit margin</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#00C49F" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Distribution of operational costs</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'COGS', value: 30 },
                  { name: 'Labor', value: 20 },
                  { name: 'Delivery', value: 10 },
                  { name: 'Marketing', value: 6 },
                  { name: 'Overhead', value: 8 },
                  { name: 'Other', value: 4 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹15.5L</div>
            <p className="text-xs text-muted-foreground">+5.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹4.96L</div>
            <p className="text-xs text-muted-foreground">32% margin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹500</div>
            <p className="text-xs text-muted-foreground">+2.5% growth</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,100</div>
            <p className="text-xs text-muted-foreground">94.9% success rate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderOperationalReport = () => (
    <div className="space-y-6">
      {/* Orders & Success Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Order Performance</CardTitle>
          <CardDescription>Order volume and success rate by day</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={operationalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="orders" fill="#0088FE" />
              <Bar yAxisId="right" dataKey="successRate" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Preparation Time Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Average Preparation Time</CardTitle>
          <CardDescription>Kitchen efficiency over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={operationalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="prepTime" stroke="#FF8042" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Order Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.9%</div>
            <p className="text-xs text-muted-foreground">+0.5% improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Prep Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5 min</div>
            <p className="text-xs text-muted-foreground">-26% from baseline</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivery On-Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% improvement</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kitchen Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Target: 90%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCustomerReport = () => (
    <div className="space-y-6">
      {/* Customer Segmentation */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Segmentation</CardTitle>
          <CardDescription>Distribution of customer segments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={customerSegmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {customerSegmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,500</div>
            <p className="text-xs text-muted-foreground">+10% growth</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90%</div>
            <p className="text-xs text-muted-foreground">Target: 95%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">55</div>
            <p className="text-xs text-muted-foreground">+5 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.6/5</div>
            <p className="text-xs text-muted-foreground">Excellent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderLocationReport = () => (
    <div className="space-y-6">
      {/* Location Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Location Performance Comparison</CardTitle>
          <CardDescription>Revenue and profit by location</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={locationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" fill="#0088FE" />
              <Bar yAxisId="left" dataKey="profit" fill="#00C49F" />
              <Bar yAxisId="right" dataKey="satisfaction" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Downtown</div>
            <p className="text-xs text-muted-foreground">₹7.75L revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">All locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">All active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Combined Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹15.5L</div>
            <p className="text-xs text-muted-foreground">Monthly</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Reporting Dashboard</h1>
          <p className="text-muted-foreground">Real-time analytics and insights</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={reportType} onValueChange={(value) => setReportType(value as ReportType)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financial">Financial Report</SelectItem>
              <SelectItem value="operational">Operational Report</SelectItem>
              <SelectItem value="customer">Customer Report</SelectItem>
              <SelectItem value="location">Location Report</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Export Report</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('pdf')}
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('excel')}
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-1" />
                Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Content */}
      {reportType === 'financial' && renderFinancialReport()}
      {reportType === 'operational' && renderOperationalReport()}
      {reportType === 'customer' && renderCustomerReport()}
      {reportType === 'location' && renderLocationReport()}
    </div>
  );
};

export default AdvancedReportingDashboard;
