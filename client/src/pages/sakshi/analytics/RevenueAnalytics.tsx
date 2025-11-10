import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/analytics/MetricCard";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { LocationFilter } from "@/components/analytics/LocationFilter";
import { ExportButton } from "@/components/analytics/ExportButton";
import { IndianRupee, TrendingUp, Calendar, ArrowLeft } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function RevenueAnalytics() {
  const [dateRange, setDateRange] = useState("30days");
  const [location, setLocation] = useState("all");

  // Mock data
  const keyMetrics = {
    totalRevenue: 1550000,
    revenueTrend: 12.5,
    avgDailyRevenue: 51667,
    avgDailyTrend: 10.2,
    growthRate: 15.3,
    growthTrend: 3.1,
    forecastNextMonth: 1720000,
    forecastTrend: 11.0,
  };

  const revenueTrendData = [
    { date: "Nov 1", revenue: 280000, forecast: null, prevPeriod: 265000 },
    { date: "Nov 5", revenue: 295000, forecast: null, prevPeriod: 275000 },
    { date: "Nov 10", revenue: 310000, forecast: null, prevPeriod: 285000 },
    { date: "Nov 15", revenue: 325000, forecast: null, prevPeriod: 295000 },
    { date: "Nov 20", revenue: 340000, forecast: null, prevPeriod: 305000 },
    { date: "Nov 25", revenue: null, forecast: 355000, prevPeriod: 315000 },
    { date: "Nov 30", revenue: null, forecast: 370000, prevPeriod: 325000 },
  ];

  const categoryRevenueData = [
    { category: "Breakfast", revenue: 320000, profit: 192000, margin: 60 },
    { category: "Lunch", revenue: 750000, profit: 450000, margin: 60 },
    { category: "Dinner", revenue: 350000, profit: 210000, margin: 60 },
    { category: "Beverages", revenue: 130000, profit: 91000, margin: 70 },
  ];

  const paymentMethodsData = [
    { name: "UPI", value: 697500, percentage: 45 },
    { name: "Card", value: 465000, percentage: 30 },
    { name: "Cash", value: 310000, percentage: 20 },
    { name: "Wallet", value: 77500, percentage: 5 },
  ];

  const topRevenueItems = [
    {
      name: "Ayurvedic Thali",
      quantity: 450,
      revenue: 112500,
      profit: 67500,
      margin: 60,
      trend: 12,
    },
    {
      name: "Vata Balance Bowl",
      quantity: 380,
      revenue: 95000,
      profit: 57000,
      margin: 60,
      trend: 8,
    },
    {
      name: "Pitta Cooling Salad",
      quantity: 320,
      revenue: 80000,
      profit: 56000,
      margin: 70,
      trend: -3,
    },
    {
      name: "Kapha Warming Curry",
      quantity: 280,
      revenue: 70000,
      profit: 42000,
      margin: 60,
      trend: 15,
    },
    {
      name: "Premium Biryani",
      quantity: 200,
      revenue: 60000,
      profit: 36000,
      margin: 60,
      trend: 22,
    },
  ];

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"];

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting revenue analytics as ${format}...`);
    alert(`Export as ${format.toUpperCase()} - Coming soon!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sakshi/analytics/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Revenue Analytics</h1>
              <p className="text-xs text-muted-foreground">Detailed revenue insights and trends</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Header with Filters */}
      <section className="border-b border-border bg-card/30 py-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold">Revenue Performance</h2>
              <p className="text-muted-foreground mt-1">
                Track revenue trends, growth, and forecasts
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
              <LocationFilter value={location} onChange={setLocation} />
              <ExportButton onExport={handleExport} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container space-y-8">
          {/* Key Metrics */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Key Revenue Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                value={`₹${(keyMetrics.totalRevenue / 100000).toFixed(1)}L`}
                trend={keyMetrics.revenueTrend}
                trendLabel="vs last period"
                icon={IndianRupee}
                variant="success"
              />
              <MetricCard
                title="Avg Daily Revenue"
                value={`₹${(keyMetrics.avgDailyRevenue / 1000).toFixed(0)}K`}
                trend={keyMetrics.avgDailyTrend}
                trendLabel="vs last period"
                icon={Calendar}
                variant="default"
              />
              <MetricCard
                title="Growth Rate"
                value={`${keyMetrics.growthRate}%`}
                trend={keyMetrics.growthTrend}
                trendLabel="vs last period"
                icon={TrendingUp}
                variant="success"
              />
              <MetricCard
                title="Forecast Next Month"
                value={`₹${(keyMetrics.forecastNextMonth / 100000).toFixed(1)}L`}
                trend={keyMetrics.forecastTrend}
                trendLabel="predicted growth"
                icon={TrendingUp}
                variant="default"
              />
            </div>
          </section>

          {/* Revenue Trend with Forecast */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Revenue Trend & Forecast</CardTitle>
              <CardDescription>
                Historical revenue with comparison to previous period and forecast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueTrendData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4F46E5"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                    name="Current Period"
                  />
                  <Line
                    type="monotone"
                    dataKey="prevPeriod"
                    stroke="#9CA3AF"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Previous Period"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={{ fill: "#10B981", r: 4 }}
                    name="Forecast"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Revenue & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Revenue */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Revenue and profit margin by meal category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4F46E5" radius={[8, 8, 0, 0]} name="Revenue (₹)" />
                    <Bar dataKey="profit" fill="#10B981" radius={[8, 8, 0, 0]} name="Profit (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Distribution of revenue across payment types</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top Revenue Items */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Top Revenue Generating Items</CardTitle>
              <CardDescription>Menu items with highest revenue contribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Item</th>
                      <th className="text-right py-3 px-4 font-semibold">Quantity</th>
                      <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold">Profit</th>
                      <th className="text-right py-3 px-4 font-semibold">Margin</th>
                      <th className="text-right py-3 px-4 font-semibold">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topRevenueItems.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/50 hover:bg-background/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="text-right py-3 px-4">{item.quantity}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{item.revenue.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">₹{item.profit.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{item.margin}%</td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={`font-semibold ${
                              item.trend > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {item.trend > 0 ? "+" : ""}
                            {item.trend}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleString()} • Data refreshes every 5 minutes</p>
        </div>
      </footer>
    </div>
  );
}
