import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/analytics/MetricCard";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { LocationFilter } from "@/components/analytics/LocationFilter";
import { ExportButton } from "@/components/analytics/ExportButton";
import { UtensilsCrossed, TrendingUp, Star, AlertTriangle, ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

export default function MenuPerformance() {
  const [dateRange, setDateRange] = useState("30days");
  const [location, setLocation] = useState("all");

  // Mock data
  const keyMetrics = {
    totalItems: 85,
    itemsTrend: 5.2,
    topPerformers: 12,
    topPerformersTrend: 8.3,
    avgMargin: 62.5,
    avgMarginTrend: 3.1,
    lowPerformers: 8,
    lowPerformersTrend: -15.2,
  };

  const categoryPerformance = [
    { category: "Breakfast", revenue: 320000, orders: 1280, margin: 60, rating: 4.5 },
    { category: "Lunch", revenue: 750000, orders: 3000, margin: 60, rating: 4.7 },
    { category: "Dinner", revenue: 350000, orders: 1400, margin: 60, rating: 4.6 },
    { category: "Beverages", revenue: 130000, orders: 2600, margin: 70, rating: 4.8 },
    { category: "Desserts", revenue: 95000, orders: 950, margin: 65, rating: 4.4 },
  ];

  // Item profitability matrix (BCG Matrix style)
  const profitabilityMatrix = [
    // Stars (High popularity, High margin)
    { name: "Ayurvedic Thali", popularity: 85, margin: 65, revenue: 112500, quadrant: "star" },
    { name: "Vata Balance Bowl", popularity: 78, margin: 62, revenue: 95000, quadrant: "star" },
    
    // Cash Cows (High popularity, Medium margin)
    { name: "Premium Biryani", popularity: 72, margin: 58, revenue: 90000, quadrant: "cash-cow" },
    { name: "Masala Dosa", popularity: 68, margin: 55, revenue: 85000, quadrant: "cash-cow" },
    
    // Question Marks (Low popularity, High margin)
    { name: "Exotic Salad", popularity: 35, margin: 72, revenue: 45000, quadrant: "question" },
    { name: "Superfood Bowl", popularity: 28, margin: 68, revenue: 38000, quadrant: "question" },
    
    // Dogs (Low popularity, Low margin)
    { name: "Basic Sandwich", popularity: 22, margin: 45, revenue: 28000, quadrant: "dog" },
    { name: "Plain Rice", popularity: 18, margin: 40, revenue: 22000, quadrant: "dog" },
  ];

  const detailedItemPerformance = [
    {
      name: "Ayurvedic Thali",
      category: "Lunch",
      units: 450,
      revenue: 112500,
      cost: 39375,
      profit: 73125,
      margin: 65,
      trend: 12,
      rating: 4.8,
    },
    {
      name: "Vata Balance Bowl",
      category: "Lunch",
      units: 380,
      revenue: 95000,
      cost: 36100,
      profit: 58900,
      margin: 62,
      trend: 8,
      rating: 4.7,
    },
    {
      name: "Premium Biryani",
      category: "Dinner",
      units: 300,
      revenue: 90000,
      cost: 37800,
      profit: 52200,
      margin: 58,
      trend: 15,
      rating: 4.9,
    },
    {
      name: "Pitta Cooling Salad",
      category: "Lunch",
      units: 320,
      revenue: 80000,
      cost: 24000,
      profit: 56000,
      margin: 70,
      trend: -3,
      rating: 4.5,
    },
    {
      name: "Kapha Warming Curry",
      category: "Dinner",
      units: 280,
      revenue: 70000,
      cost: 28000,
      profit: 42000,
      margin: 60,
      trend: 22,
      rating: 4.6,
    },
  ];

  const categoryRadarData = [
    {
      category: "Revenue",
      Breakfast: 65,
      Lunch: 95,
      Dinner: 70,
      Beverages: 55,
      Desserts: 45,
    },
    {
      category: "Popularity",
      Breakfast: 70,
      Lunch: 90,
      Dinner: 75,
      Beverages: 85,
      Desserts: 50,
    },
    {
      category: "Margin",
      Breakfast: 60,
      Lunch: 60,
      Dinner: 60,
      Beverages: 70,
      Desserts: 65,
    },
    {
      category: "Rating",
      Breakfast: 90,
      Lunch: 94,
      Dinner: 92,
      Beverages: 96,
      Desserts: 88,
    },
  ];

  const getQuadrantColor = (quadrant: string) => {
    switch (quadrant) {
      case "star":
        return "#10B981"; // Green
      case "cash-cow":
        return "#4F46E5"; // Blue
      case "question":
        return "#F59E0B"; // Yellow
      case "dog":
        return "#EF4444"; // Red
      default:
        return "#9CA3AF";
    }
  };

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting menu performance as ${format}...`);
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
              <h1 className="font-bold text-xl">Menu Performance</h1>
              <p className="text-xs text-muted-foreground">Menu item analysis and optimization</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Header with Filters */}
      <section className="border-b border-border bg-card/30 py-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold">Menu Analytics</h2>
              <p className="text-muted-foreground mt-1">
                Analyze menu performance and identify optimization opportunities
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
            <h3 className="text-xl font-semibold mb-4">Key Menu Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Menu Items"
                value={keyMetrics.totalItems}
                trend={keyMetrics.itemsTrend}
                trendLabel="new items added"
                icon={UtensilsCrossed}
                variant="default"
              />
              <MetricCard
                title="Top Performers"
                value={keyMetrics.topPerformers}
                trend={keyMetrics.topPerformersTrend}
                trendLabel="vs last period"
                icon={Star}
                variant="success"
              />
              <MetricCard
                title="Avg Profit Margin"
                value={`${keyMetrics.avgMargin}%`}
                trend={keyMetrics.avgMarginTrend}
                trendLabel="vs last period"
                icon={TrendingUp}
                variant="success"
              />
              <MetricCard
                title="Low Performers"
                value={keyMetrics.lowPerformers}
                trend={keyMetrics.lowPerformersTrend}
                trendLabel="improvement needed"
                icon={AlertTriangle}
                variant="warning"
              />
            </div>
          </section>

          {/* Category Performance */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Category Performance Comparison</CardTitle>
              <CardDescription>Revenue, orders, and margins by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#4F46E5"
                    radius={[8, 8, 0, 0]}
                    name="Revenue (₹)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="orders"
                    fill="#10B981"
                    radius={[8, 8, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Item Profitability Matrix */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Item Profitability Matrix</CardTitle>
              <CardDescription>
                BCG Matrix: Popularity vs Profit Margin (Bubble size = Revenue)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    type="number"
                    dataKey="popularity"
                    name="Popularity"
                    unit="%"
                    stroke="#6b7280"
                    label={{ value: "Popularity Score", position: "insideBottom", offset: -10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="margin"
                    name="Margin"
                    unit="%"
                    stroke="#6b7280"
                    label={{ value: "Profit Margin", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any, name: string) => {
                      if (name === "revenue") return [`₹${value.toLocaleString()}`, "Revenue"];
                      return [value, name];
                    }}
                  />
                  <Scatter name="Menu Items" data={profitabilityMatrix} fill="#8884d8">
                    {profitabilityMatrix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.quadrant)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Stars (High/High)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Cash Cows (High/Med)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Question Marks (Low/High)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Dogs (Low/Low)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Item Performance Table */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Detailed Item Performance</CardTitle>
              <CardDescription>Comprehensive metrics for top menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Item</th>
                      <th className="text-left py-3 px-4 font-semibold">Category</th>
                      <th className="text-right py-3 px-4 font-semibold">Units</th>
                      <th className="text-right py-3 px-4 font-semibold">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold">Cost</th>
                      <th className="text-right py-3 px-4 font-semibold">Profit</th>
                      <th className="text-right py-3 px-4 font-semibold">Margin</th>
                      <th className="text-right py-3 px-4 font-semibold">Trend</th>
                      <th className="text-right py-3 px-4 font-semibold">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedItemPerformance.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border/50 hover:bg-background/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{item.category}</td>
                        <td className="text-right py-3 px-4">{item.units}</td>
                        <td className="text-right py-3 px-4 font-semibold">
                          ₹{item.revenue.toLocaleString()}
                        </td>
                        <td className="text-right py-3 px-4">₹{item.cost.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 text-green-600 font-semibold">
                          ₹{item.profit.toLocaleString()}
                        </td>
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
                        <td className="text-right py-3 px-4">
                          <span className="flex items-center justify-end gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {item.rating}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-primary/20 bg-blue-50/50">
            <CardHeader>
              <CardTitle>AI-Powered Recommendations</CardTitle>
              <CardDescription>Actionable insights for menu optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Promote Star Items</h4>
                    <p className="text-sm text-muted-foreground">
                      "Ayurvedic Thali" and "Vata Balance Bowl" are your stars. Consider featuring
                      them prominently and creating combo offers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-yellow-200">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Optimize Question Marks</h4>
                    <p className="text-sm text-muted-foreground">
                      "Exotic Salad" has high margins but low sales. Consider better marketing or
                      price adjustment to increase popularity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-red-200">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Review Low Performers</h4>
                    <p className="text-sm text-muted-foreground">
                      "Basic Sandwich" and "Plain Rice" have low margins and popularity. Consider
                      removing or reimagining these items.
                    </p>
                  </div>
                </div>
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
