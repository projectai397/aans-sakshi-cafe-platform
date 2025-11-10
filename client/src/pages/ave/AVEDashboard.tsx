import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/analytics/MetricCard";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  TrendingUp,
  Users,
  ShoppingCart,
  Calendar,
  Activity,
  AlertCircle,
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

export default function AVEDashboard() {
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Mock real-time data
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeCalls: 3,
    queuedCalls: 2,
    avgWaitTime: 45,
    callsToday: 127,
    ordersPlaced: 45,
    reservationsBooked: 18,
    avgCallDuration: 3.2,
    recognitionAccuracy: 94.5,
  });

  const callVolumeData = [
    { time: '09:00', calls: 5 },
    { time: '10:00', calls: 8 },
    { time: '11:00', calls: 12 },
    { time: '12:00', calls: 18 },
    { time: '13:00', calls: 15 },
    { time: '14:00', calls: 10 },
    { time: '15:00', calls: 7 },
    { time: '16:00', calls: 9 },
  ];

  const intentDistribution = [
    { name: 'Order Food', value: 45, color: '#4F46E5' },
    { name: 'Reservation', value: 18, color: '#10B981' },
    { name: 'Menu Inquiry', value: 32, color: '#F59E0B' },
    { name: 'Order Status', value: 15, color: '#EF4444' },
    { name: 'Other', value: 17, color: '#9CA3AF' },
  ];

  const conversionFunnel = [
    { stage: 'Calls', count: 127, rate: 100 },
    { stage: 'Intent Recognized', count: 120, rate: 94.5 },
    { stage: 'Order Started', count: 78, rate: 61.4 },
    { stage: 'Order Confirmed', count: 45, rate: 35.4 },
  ];

  const activeCalls = [
    {
      callId: 'CALL_001',
      from: '+91 98765 43210',
      duration: '2:34',
      intent: 'Order Food',
      status: 'In Progress',
    },
    {
      callId: 'CALL_002',
      from: '+91 98765 43211',
      duration: '1:12',
      intent: 'Reservation',
      status: 'In Progress',
    },
    {
      callId: 'CALL_003',
      from: '+91 98765 43212',
      duration: '0:45',
      intent: 'Menu Inquiry',
      status: 'In Progress',
    },
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeMetrics((prev) => ({
        ...prev,
        activeCalls: Math.max(0, prev.activeCalls + Math.floor(Math.random() * 3) - 1),
        queuedCalls: Math.max(0, prev.queuedCalls + Math.floor(Math.random() * 3) - 1),
      }));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">AVE Dashboard</h1>
              <p className="text-xs text-muted-foreground">AI Voice Engine Real-Time Monitor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="border-b border-border bg-card/30 py-6">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold">Real-Time Call Monitoring</h2>
              <p className="text-muted-foreground mt-1">
                Monitor active calls and system performance
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <AlertCircle className="h-4 w-4 mr-2" />
                View Alerts
              </Button>
              <Link href="/ave/analytics">
                <Button size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex-1 py-8">
        <div className="container space-y-8">
          {/* Real-Time Metrics */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Real-Time Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Active Calls"
                value={realtimeMetrics.activeCalls}
                icon={Phone}
                variant="success"
              />
              <MetricCard
                title="Queued Calls"
                value={realtimeMetrics.queuedCalls}
                icon={Clock}
                variant="warning"
              />
              <MetricCard
                title="Avg Wait Time"
                value={`${realtimeMetrics.avgWaitTime}s`}
                icon={Clock}
                variant="default"
              />
              <MetricCard
                title="Recognition Accuracy"
                value={`${realtimeMetrics.recognitionAccuracy}%`}
                icon={TrendingUp}
                variant="success"
              />
            </div>
          </section>

          {/* Today's Performance */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Today's Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Calls"
                value={realtimeMetrics.callsToday}
                trend={12.5}
                trendLabel="vs yesterday"
                icon={PhoneIncoming}
                variant="success"
              />
              <MetricCard
                title="Orders Placed"
                value={realtimeMetrics.ordersPlaced}
                trend={8.3}
                trendLabel="vs yesterday"
                icon={ShoppingCart}
                variant="success"
              />
              <MetricCard
                title="Reservations"
                value={realtimeMetrics.reservationsBooked}
                trend={15.2}
                trendLabel="vs yesterday"
                icon={Calendar}
                variant="success"
              />
              <MetricCard
                title="Avg Call Duration"
                value={`${realtimeMetrics.avgCallDuration} min`}
                trend={-5.1}
                trendLabel="vs yesterday (lower is better)"
                icon={Clock}
                variant="success"
              />
            </div>
          </section>

          {/* Active Calls */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Active Calls</CardTitle>
              <CardDescription>Currently ongoing calls</CardDescription>
            </CardHeader>
            <CardContent>
              {activeCalls.length > 0 ? (
                <div className="space-y-4">
                  {activeCalls.map((call, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Phone className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{call.from}</p>
                          <p className="text-sm text-muted-foreground">{call.callId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{call.intent}</p>
                          <p className="text-xs text-muted-foreground">{call.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{call.duration}</p>
                          <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Monitor
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active calls at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Call Volume */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Call Volume Today</CardTitle>
                <CardDescription>Calls per hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={callVolumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="time" stroke="#6b7280" />
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

            {/* Intent Distribution */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Intent Distribution</CardTitle>
                <CardDescription>Call purposes breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={intentDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {intentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Call to order conversion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="stage" type="category" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} (${props.payload.rate}%)`,
                      name,
                    ]}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-card/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Last updated: {new Date().toLocaleString()} • Auto-refresh every 5 seconds</p>
        </div>
      </footer>
    </div>
  );
}
