import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/analytics/MetricCard";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { LocationFilter } from "@/components/analytics/LocationFilter";
import { ExportButton } from "@/components/analytics/ExportButton";
import { Users, UserPlus, Repeat, TrendingDown, ArrowLeft } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

export default function CustomerAnalytics() {
  const [dateRange, setDateRange] = useState("30days");
  const [location, setLocation] = useState("all");

  // Mock data
  const keyMetrics = {
    totalCustomers: 4250,
    customersTrend: 15.2,
    newCustomers: 850,
    newCustomersTrend: 22.5,
    repeatRate: 68.5,
    repeatRateTrend: 5.3,
    churnRate: 12.3,
    churnRateTrend: -2.1,
  };

  const customerSegments = [
    { name: "VIP Customers", value: 15, count: 638, avgOrderValue: 450, color: "#4F46E5" },
    { name: "Regular Customers", value: 35, count: 1488, avgOrderValue: 280, color: "#10B981" },
    { name: "Occasional Customers", value: 30, count: 1275, avgOrderValue: 200, color: "#F59E0B" },
    { name: "New Customers", value: 20, count: 850, avgOrderValue: 180, color: "#EF4444" },
  ];

  const retentionData = [
    { month: "Month 1", retention: 100 },
    { month: "Month 2", retention: 85 },
    { month: "Month 3", retention: 72 },
    { month: "Month 4", retention: 68 },
    { month: "Month 5", retention: 65 },
    { month: "Month 6", retention: 63 },
  ];

  const customerLifetimeValue = [
    { segment: "VIP", value: 18000, fill: "#4F46E5" },
    { segment: "Regular", value: 12000, fill: "#10B981" },
    { segment: "Occasional", value: 6000, fill: "#F59E0B" },
    { segment: "New", value: 2500, fill: "#EF4444" },
  ];

  const topCustomers = [
    {
      name: "Rajesh Kumar",
      orders: 45,
      totalSpent: 22500,
      avgOrder: 500,
      lastVisit: "2 days ago",
      segment: "VIP",
    },
    {
      name: "Priya Sharma",
      orders: 38,
      totalSpent: 19000,
      avgOrder: 500,
      lastVisit: "1 day ago",
      segment: "VIP",
    },
    {
      name: "Amit Patel",
      orders: 32,
      totalSpent: 16000,
      avgOrder: 500,
      lastVisit: "3 days ago",
      segment: "VIP",
    },
    {
      name: "Sneha Desai",
      orders: 28,
      totalSpent: 14000,
      avgOrder: 500,
      lastVisit: "1 week ago",
      segment: "Regular",
    },
    {
      name: "Vikram Singh",
      orders: 25,
      totalSpent: 12500,
      avgOrder: 500,
      lastVisit: "4 days ago",
      segment: "Regular",
    },
  ];

  const customerGrowth = [
    { month: "Jul", new: 650, returning: 2800 },
    { month: "Aug", new: 720, returning: 2950 },
    { month: "Sep", new: 780, returning: 3100 },
    { month: "Oct", new: 820, returning: 3200 },
    { month: "Nov", new: 850, returning: 3400 },
  ];

  const retentionGaugeData = [
    { name: "Retention", value: 68.5, fill: "#10B981" },
  ];

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting customer analytics as ${format}...`);
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
              <h1 className="font-bold text-xl">Customer Analytics</h1>
              <p className="text-xs text-muted-foreground">Customer insights and behavior</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Header with Filters */}
      <section className="border-b border-border bg-card/30 py-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold">Customer Insights</h2>
              <p className="text-muted-foreground mt-1">
                Understand customer behavior and retention
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
            <h3 className="text-xl font-semibold mb-4">Key Customer Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Customers"
                value={keyMetrics.totalCustomers}
                trend={keyMetrics.customersTrend}
                trendLabel="vs last period"
                icon={Users}
                variant="success"
              />
              <MetricCard
                title="New Customers"
                value={keyMetrics.newCustomers}
                trend={keyMetrics.newCustomersTrend}
                trendLabel="vs last period"
                icon={UserPlus}
                variant="success"
              />
              <MetricCard
                title="Repeat Rate"
                value={`${keyMetrics.repeatRate}%`}
                trend={keyMetrics.repeatRateTrend}
                trendLabel="vs last period"
                icon={Repeat}
                variant="success"
              />
              <MetricCard
                title="Churn Rate"
                value={`${keyMetrics.churnRate}%`}
                trend={keyMetrics.churnRateTrend}
                trendLabel="vs last period (lower is better)"
                icon={TrendingDown}
                variant="warning"
              />
            </div>
          </section>

          {/* Customer Segments & Retention Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
                <CardDescription>Distribution of customers by segment</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name.split(" ")[0]}: ${value}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `${props.payload.count} customers (${value}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {customerSegments.map((segment, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span>{segment.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        Avg: ₹{segment.avgOrderValue}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Retention Rate Gauge */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Customer Retention Rate</CardTitle>
                <CardDescription>Percentage of returning customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height={200}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="100%"
                      barSize={20}
                      data={retentionGaugeData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        minAngle={15}
                        background
                        clockWise
                        dataKey="value"
                        cornerRadius={10}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-4">
                    <p className="text-4xl font-bold text-green-600">{keyMetrics.repeatRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Retention Rate</p>
                    <p className="text-xs text-green-600 mt-1">
                      +{keyMetrics.repeatRateTrend}% vs last period
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Growth & Retention Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Growth */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New vs returning customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="new" fill="#10B981" radius={[8, 8, 0, 0]} name="New Customers" />
                    <Bar
                      dataKey="returning"
                      fill="#4F46E5"
                      radius={[8, 8, 0, 0]}
                      name="Returning Customers"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Retention Cohort */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Retention Cohort Analysis</CardTitle>
                <CardDescription>Customer retention over 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="retention"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={{ fill: "#4F46E5", r: 5 }}
                      name="Retention %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Customer Lifetime Value */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Customer Lifetime Value by Segment</CardTitle>
              <CardDescription>Average lifetime value per customer segment</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerLifetimeValue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="segment" type="category" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Lifetime Value (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Highest value customers by total spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Customer</th>
                      <th className="text-right py-3 px-4 font-semibold">Orders</th>
                      <th className="text-right py-3 px-4 font-semibold">Total Spent</th>
                      <th className="text-right py-3 px-4 font-semibold">Avg Order</th>
                      <th className="text-right py-3 px-4 font-semibold">Last Visit</th>
                      <th className="text-center py-3 px-4 font-semibold">Segment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/50 hover:bg-background/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{customer.name}</td>
                        <td className="text-right py-3 px-4">{customer.orders}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{customer.totalSpent.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">₹{customer.avgOrder}</td>
                        <td className="text-right py-3 px-4 text-muted-foreground">
                          {customer.lastVisit}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              customer.segment === "VIP"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {customer.segment}
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
