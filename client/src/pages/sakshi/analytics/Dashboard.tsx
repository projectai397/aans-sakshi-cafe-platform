import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/analytics/MetricCard";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { LocationFilter } from "@/components/analytics/LocationFilter";
import { ExportButton } from "@/components/analytics/ExportButton";
import {
  IndianRupee,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
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
} from "recharts";

export default function SakshiAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30days");
  const [location, setLocation] = useState("all");

  // Mock data - will be replaced with API calls
  const keyMetrics = {
    totalRevenue: 1550000,
    revenueTrend: 12.5,
    totalOrders: 6000,
    ordersTrend: 8.3,
    totalCustomers: 4250,
    customersTrend: 15.2,
    avgOrderValue: 258,
    aovTrend: 4.1,
  };

  const revenueTrendData = [
    { date: "Week 1", revenue: 280000, orders: 1100 },
    { date: "Week 2", revenue: 295000, orders: 1150 },
    { date: "Week 3", revenue: 310000, orders: 1200 },
    { date: "Week 4", revenue: 325000, orders: 1250 },
    { date: "Week 5", revenue: 340000, orders: 1300 },
  ];

  const orderVolumeData = [
    { day: "Mon", orders: 850 },
    { day: "Tue", orders: 920 },
    { day: "Wed", orders: 780 },
    { day: "Thu", orders: 950 },
    { day: "Fri", orders: 1100 },
    { day: "Sat", orders: 1200 },
    { day: "Sun", orders: 1200 },
  ];

  const topItems = [
    { name: "Ayurvedic Thali", quantity: 450, revenue: 112500, trend: 12 },
    { name: "Vata Balance Bowl", quantity: 380, revenue: 95000, trend: 8 },
    { name: "Pitta Cooling Salad", quantity: 320, revenue: 80000, trend: -3 },
    { name: "Kapha Warming Curry", quantity: 280, revenue: 70000, trend: 15 },
    { name: "Dosha Smoothie", quantity: 250, revenue: 37500, trend: 22 },
  ];

  const paymentMethodsData = [
    { name: "UPI", value: 45, amount: 697500 },
    { name: "Card", value: 30, amount: 465000 },
    { name: "Cash", value: 20, amount: 310000 },
    { name: "Wallet", value: 5, amount: 77500 },
  ];

  const COLORS = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"];

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting as ${format}...`);
    // TODO: Implement actual export functionality
    alert(`Export as ${format.toUpperCase()} - Coming soon!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/sakshi" className="flex items-center gap-2 hover:opacity-80">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Sakshi Analytics</h1>
              <p className="text-xs text-muted-foreground">Restaurant Performance Dashboard</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Header with Filters */}
      <section className="border-b border-border bg-card/30 py-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold">Dashboard Overview</h2>
              <p className="text-muted-foreground mt-1">
                Track revenue, orders, and customer metrics
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
            <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                value={`₹${(keyMetrics.totalRevenue / 100000).toFixed(1)}L`}
                trend={keyMetrics.revenueTrend}
                trendLabel="vs last period"
                icon={IndianRupee}
                variant="success"
                sparklineData={revenueTrendData.map((d) => d.revenue)}
              />
              <MetricCard
                title="Total Orders"
                value={keyMetrics.totalOrders}
                trend={keyMetrics.ordersTrend}
                trendLabel="vs last period"
                icon={ShoppingCart}
                variant="default"
                sparklineData={orderVolumeData.map((d) => d.orders)}
              />
              <MetricCard
                title="Total Customers"
                value={keyMetrics.totalCustomers}
                trend={keyMetrics.customersTrend}
                trendLabel="vs last period"
                icon={Users}
                variant="success"
              />
              <MetricCard
                title="Avg Order Value"
                value={`₹${keyMetrics.avgOrderValue}`}
                trend={keyMetrics.aovTrend}
                trendLabel="vs last period"
                icon={TrendingUp}
                variant="default"
              />
            </div>
          </section>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Weekly revenue and order volume</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueTrendData}>
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
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4F46E5"
                      strokeWidth={2}
                      dot={{ fill: "#4F46E5", r: 4 }}
                      name="Revenue (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Order Volume */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Order Volume</CardTitle>
                <CardDescription>Daily orders for the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={orderVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="orders" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Items */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
                <CardDescription>Best performing menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <span
                            className={`text-xs ${
                              item.trend > 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {item.trend > 0 ? "+" : ""}
                            {item.trend}%
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} orders • ₹{item.revenue.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentMethodsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
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
                        formatter={(value: number, name: string, props: any) => [
                          `₹${props.payload.amount.toLocaleString()} (${value}%)`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
              <CardDescription>Explore more detailed reports and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/sakshi/analytics/revenue">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <IndianRupee className="h-4 w-4" />
                    Revenue Analytics
                  </Button>
                </Link>
                <Link href="/sakshi/analytics/customers">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Customer Analytics
                  </Button>
                </Link>
                <Link href="/sakshi/analytics/menu">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Menu Performance
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            Last updated: {new Date().toLocaleString()} • Data refreshes every 5 minutes
          </p>
        </div>
      </footer>
    </div>
  );
}
