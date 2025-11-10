import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { BarChart3, TrendingUp, Users, Eye, MousePointerClick, Download, Calendar, Filter } from "lucide-react";
import { useState } from "react";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7days");
  const [selectedMetric, setSelectedMetric] = useState<"all" | "ave" | "sakshi" | "subcircle">("all");

  // Mock analytics data
  const analyticsData = {
    totalPageViews: 45230,
    uniqueVisitors: 12450,
    totalConversions: 1240,
    avgSessionDuration: "4m 32s",
    bounceRate: "32.5%",
    conversionRate: "9.9%",
  };

  const pageViewsTrend = [
    { date: "Nov 1", views: 3200, conversions: 240 },
    { date: "Nov 2", views: 3800, conversions: 280 },
    { date: "Nov 3", views: 4100, conversions: 310 },
    { date: "Nov 4", views: 3900, conversions: 290 },
    { date: "Nov 5", views: 4500, conversions: 350 },
    { date: "Nov 6", views: 5200, conversions: 420 },
    { date: "Nov 7", views: 6000, conversions: 480 },
    { date: "Nov 8", views: 5800, conversions: 450 },
    { date: "Nov 9", views: 6130, conversions: 471 },
  ];

  const trafficSources = [
    { source: "Direct", visitors: 4200, percentage: 33.7 },
    { source: "Organic Search", visitors: 3850, percentage: 30.9 },
    { source: "Social Media", visitors: 2100, percentage: 16.9 },
    { source: "Referral", visitors: 1450, percentage: 11.6 },
    { source: "Paid Ads", visitors: 850, percentage: 6.8 },
  ];

  const divisionMetrics = [
    { name: "AVE", pageViews: 18500, visitors: 5200, conversions: 620, revenue: "₹2.4L" },
    { name: "Sakshi", pageViews: 15800, visitors: 4100, conversions: 380, revenue: "₹1.8L" },
    { name: "SubCircle", pageViews: 8200, visitors: 2150, conversions: 180, revenue: "₹0.9L" },
    { name: "General", pageViews: 2730, visitors: 1000, conversions: 60, revenue: "₹0.3L" },
  ];

  const topPages = [
    { path: "/", title: "Home", views: 8500, avgTime: "2m 15s", bounceRate: "28%" },
    { path: "/company", title: "Company Overview", views: 6200, avgTime: "3m 42s", bounceRate: "22%" },
    { path: "/company/about", title: "About Us", views: 5100, avgTime: "4m 10s", bounceRate: "18%" },
    { path: "/ave", title: "AVE Division", views: 4800, avgTime: "5m 30s", bounceRate: "15%" },
    { path: "/sakshi", title: "Sakshi Division", views: 4200, avgTime: "4m 45s", bounceRate: "20%" },
    { path: "/blog", title: "Blog", views: 3900, avgTime: "3m 20s", bounceRate: "35%" },
  ];

  const conversionFunnels = [
    { stage: "Page View", count: 45230, percentage: 100 },
    { stage: "Engaged (>30s)", count: 32100, percentage: 71 },
    { stage: "Form Interaction", count: 8500, percentage: 19 },
    { stage: "Form Submission", count: 1240, percentage: 2.7 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/company" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
              A
            </div>
            <span className="font-bold text-xl">Analytics</span>
          </Link>
          <Link href="/company">
            <Button variant="ghost" size="sm">Back</Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border bg-card/30 py-8">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
              <p className="text-muted-foreground mt-2">Track website performance and user engagement</p>
            </div>
            <Button className="gap-2">
              <Download className="h-4 w-4" /> Export Report
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="24hours">Last 24 Hours</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="all">All Divisions</option>
                <option value="ave">AVE Only</option>
                <option value="sakshi">Sakshi Only</option>
                <option value="subcircle">SubCircle Only</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container space-y-8">
          {/* Key Metrics */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Page Views", value: analyticsData.totalPageViews.toLocaleString(), icon: Eye, trend: "+12%" },
                { label: "Unique Visitors", value: analyticsData.uniqueVisitors.toLocaleString(), icon: Users, trend: "+8%" },
                { label: "Conversions", value: analyticsData.totalConversions.toLocaleString(), icon: MousePointerClick, trend: "+15%" },
                { label: "Avg. Session", value: analyticsData.avgSessionDuration, icon: BarChart3, trend: "+2%" },
                { label: "Bounce Rate", value: analyticsData.bounceRate, icon: TrendingUp, trend: "-3%" },
                { label: "Conv. Rate", value: analyticsData.conversionRate, icon: TrendingUp, trend: "+4%" },
              ].map((metric, idx) => {
                const Icon = metric.icon;
                return (
                  <Card key={idx} className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 text-primary" />
                        <Badge className="bg-green-500/20 text-green-600">{metric.trend}</Badge>
                      </div>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{metric.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Page Views Trend */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Page Views & Conversions Trend</CardTitle>
              <CardDescription>Daily page views and conversion count over the last 9 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageViewsTrend.map((day, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm font-medium w-16">{day.date}</span>
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 bg-primary/20 rounded h-8 flex items-center justify-center">
                        <div
                          className="bg-primary h-full rounded transition-all"
                          style={{ width: `${(day.views / 6000) * 100}%` }}
                        />
                      </div>
                      <div className="w-24 text-right text-sm">{day.views.toLocaleString()} views</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Division Metrics */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Performance by Division</CardTitle>
              <CardDescription>Metrics for each AANS division</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Division</th>
                      <th className="text-right py-3 px-4 font-semibold">Page Views</th>
                      <th className="text-right py-3 px-4 font-semibold">Visitors</th>
                      <th className="text-right py-3 px-4 font-semibold">Conversions</th>
                      <th className="text-right py-3 px-4 font-semibold">Est. Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {divisionMetrics.map((div, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{div.name}</td>
                        <td className="text-right py-3 px-4">{div.pageViews.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{div.visitors.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{div.conversions.toLocaleString()}</td>
                        <td className="text-right py-3 px-4 font-semibold text-primary">{div.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>Where your visitors are coming from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trafficSources.map((source, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-sm text-muted-foreground">{source.visitors.toLocaleString()} ({source.percentage}%)</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Top Performing Pages</CardTitle>
              <CardDescription>Most visited pages on your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Page</th>
                      <th className="text-right py-3 px-4 font-semibold">Views</th>
                      <th className="text-right py-3 px-4 font-semibold">Avg. Time</th>
                      <th className="text-right py-3 px-4 font-semibold">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPages.map((page, idx) => (
                      <tr key={idx} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">{page.title}</p>
                            <p className="text-xs text-muted-foreground">{page.path}</p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">{page.views.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{page.avgTime}</td>
                        <td className="text-right py-3 px-4">{page.bounceRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnel */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey from page view to conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnels.map((stage, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-sm text-muted-foreground">{stage.count.toLocaleString()} ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-border rounded h-8">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-8 rounded transition-all flex items-center justify-end pr-4"
                        style={{ width: `${stage.percentage}%` }}
                      >
                        {stage.percentage > 10 && <span className="text-xs font-semibold text-white">{stage.percentage}%</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Analytics data is updated in real-time. Last updated: {new Date().toLocaleString()}</p>
        </div>
      </footer>
    </div>
  );
}
