import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/analytics/MetricCard";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { ExportButton } from "@/components/analytics/ExportButton";
import {
  Phone,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AVEAnalytics() {
  const [dateRange, setDateRange] = useState("30days");

  // Mock data
  const keyMetrics = {
    totalCalls: 3842,
    callsTrend: 18.5,
    successRate: 89.2,
    successRateTrend: 3.2,
    avgDuration: 3.4,
    avgDurationTrend: -8.5,
    revenueGenerated: 285000,
    revenueTrend: 22.3,
  };

  const callTrendData = [
    { date: 'Week 1', calls: 850, successful: 760, failed: 90 },
    { date: 'Week 2', calls: 920, successful: 825, failed: 95 },
    { date: 'Week 3', calls: 980, successful: 875, failed: 105 },
    { date: 'Week 4', calls: 1092, successful: 975, failed: 117 },
  ];

  const performanceMetrics = [
    { metric: 'Recognition Accuracy', value: 94.5, target: 95 },
    { metric: 'Intent Classification', value: 92.3, target: 90 },
    { metric: 'Response Time', value: 1.2, target: 1.5 },
    { metric: 'Customer Satisfaction', value: 4.6, target: 4.5 },
  ];

  const hourlyDistribution = [
    { hour: '09:00', calls: 45 },
    { hour: '10:00', calls: 68 },
    { hour: '11:00', calls: 92 },
    { hour: '12:00', calls: 125 },
    { hour: '13:00', calls: 110 },
    { hour: '14:00', calls: 78 },
    { hour: '15:00', calls: 65 },
    { hour: '16:00', calls: 72 },
    { hour: '17:00', calls: 85 },
    { hour: '18:00', calls: 115 },
    { hour: '19:00', calls: 135 },
    { hour: '20:00', calls: 120 },
    { hour: '21:00', calls: 95 },
  ];

  const callOutcomes = [
    { outcome: 'Order Placed', count: 1245, percentage: 32.4 },
    { outcome: 'Reservation Made', count: 485, percentage: 12.6 },
    { outcome: 'Information Provided', count: 892, percentage: 23.2 },
    { outcome: 'Transferred to Agent', count: 325, percentage: 8.5 },
    { outcome: 'Call Dropped', count: 415, percentage: 10.8 },
    { outcome: 'Other', count: 480, percentage: 12.5 },
  ];

  const languageDistribution = [
    { language: 'English', calls: 2150, percentage: 56 },
    { language: 'Hindi', calls: 1150, percentage: 30 },
    { language: 'Hinglish', calls: 542, percentage: 14 },
  ];

  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    console.log(`Exporting AVE analytics as ${format}...`);
    alert(`Export as ${format.toUpperCase()} - Coming soon!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/ave/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">AVE Analytics</h1>
              <p className="text-xs text-muted-foreground">Performance metrics and insights</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border bg-card/30 py-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold">AVE Performance Analytics</h2>
              <p className="text-muted-foreground mt-1">
                Detailed metrics and performance insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangeFilter value={dateRange} onChange={setDateRange} />
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
                title="Total Calls"
                value={keyMetrics.totalCalls}
                trend={keyMetrics.callsTrend}
                trendLabel="vs last period"
                icon={Phone}
                variant="success"
              />
              <MetricCard
                title="Success Rate"
                value={`${keyMetrics.successRate}%`}
                trend={keyMetrics.successRateTrend}
                trendLabel="vs last period"
                icon={CheckCircle}
                variant="success"
              />
              <MetricCard
                title="Avg Duration"
                value={`${keyMetrics.avgDuration} min`}
                trend={keyMetrics.avgDurationTrend}
                trendLabel="vs last period (lower is better)"
                icon={Clock}
                variant="success"
              />
              <MetricCard
                title="Revenue Generated"
                value={`₹${(keyMetrics.revenueGenerated / 1000).toFixed(0)}K`}
                trend={keyMetrics.revenueTrend}
                trendLabel="vs last period"
                icon={DollarSign}
                variant="success"
              />
            </div>
          </section>

          {/* Call Trends */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Call Trends</CardTitle>
              <CardDescription>Weekly call volume and success rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={callTrendData}>
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
                    dataKey="calls"
                    stackId="1"
                    stroke="#4F46E5"
                    fill="#4F46E5"
                    fillOpacity={0.6}
                    name="Total Calls"
                  />
                  <Area
                    type="monotone"
                    dataKey="successful"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Successful"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stackId="3"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                    name="Failed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>System performance vs targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {performanceMetrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          Target: {metric.target}
                        </span>
                        <span className="font-semibold">{metric.value}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          metric.value >= metric.target ? "bg-green-500" : "bg-yellow-500"
                        }`}
                        style={{
                          width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hourly Distribution */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Hourly Call Distribution</CardTitle>
              <CardDescription>Peak hours and call patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hour" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="calls" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Call Outcomes & Language Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Call Outcomes */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Call Outcomes</CardTitle>
                <CardDescription>Distribution of call results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {callOutcomes.map((outcome, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{outcome.outcome}</span>
                          <span className="text-sm text-muted-foreground">
                            {outcome.count} ({outcome.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${outcome.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Distribution */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Language Distribution</CardTitle>
                <CardDescription>Calls by language preference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {languageDistribution.map((lang, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{lang.language}</span>
                        <span className="text-sm text-muted-foreground">
                          {lang.calls} calls ({lang.percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights & Recommendations */}
          <Card className="border-primary/20 bg-blue-50/50">
            <CardHeader>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>Recommendations for improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Peak Hour Optimization</h4>
                    <p className="text-sm text-muted-foreground">
                      Call volume peaks at 12 PM and 7 PM. Consider adding more AI capacity during
                      these hours to reduce wait times.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-blue-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">High Success Rate</h4>
                    <p className="text-sm text-muted-foreground">
                      Your 89.2% success rate is excellent! Focus on reducing the 10.8% call drop
                      rate to improve further.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-yellow-200">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Call Duration Improvement</h4>
                    <p className="text-sm text-muted-foreground">
                      Average call duration decreased by 8.5%. This indicates improved efficiency
                      in handling customer requests.
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
