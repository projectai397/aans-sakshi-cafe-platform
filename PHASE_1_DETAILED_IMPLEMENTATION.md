# Phase 1: Sakshi Cafe - Detailed Implementation Guide
## Task-by-Task Execution Plan with Code Examples

**Phase Duration:** 3 months (Months 1-3)  
**Status:** In Development  
**Current Progress:** 40% (Backend complete, Frontend components created)

---

## Phase 1.1: Analytics Dashboard & Integration (Month 1)

### Task 1.1.1: Build Cafe Manager Analytics Dashboard

#### Overview
Create a comprehensive analytics interface for cafe managers to track key performance indicators and make data-driven decisions.

#### Implementation Steps

**Step 1: Create Analytics Service**

```typescript
// server/services/sakshi-analytics.ts
import { db } from "@/server/db";
import { eq, gte, lte, and } from "drizzle-orm";

export class AnalyticsService {
  // Get daily call metrics
  async getDailyCallMetrics(cafeId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const metrics = await db.query.sakshiCallLogs.findMany({
      where: and(
        eq(db.schema.sakshiCallLogs.cafeId, cafeId),
        gte(db.schema.sakshiCallLogs.createdAt, startOfDay),
        lte(db.schema.sakshiCallLogs.createdAt, endOfDay)
      ),
    });

    return {
      totalCalls: metrics.length,
      answeredCalls: metrics.filter(m => m.answered).length,
      missedCalls: metrics.filter(m => !m.answered).length,
      averageResponseTime: this.calculateAverageResponseTime(metrics),
      callDuration: this.calculateAverageDuration(metrics),
    };
  }

  // Get reservation trends
  async getReservationTrends(cafeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reservations = await db.query.sakshiReservations.findMany({
      where: and(
        eq(db.schema.sakshiReservations.cafeId, cafeId),
        gte(db.schema.sakshiReservations.createdAt, startDate)
      ),
    });

    // Group by date
    const trends = this.groupByDate(reservations);
    return trends;
  }

  // Get revenue metrics
  async getRevenueMetrics(cafeId: string, startDate: Date, endDate: Date) {
    const orders = await db.query.sakshiOrders.findMany({
      where: and(
        eq(db.schema.sakshiOrders.cafeId, cafeId),
        gte(db.schema.sakshiOrders.createdAt, startDate),
        lte(db.schema.sakshiOrders.createdAt, endDate)
      ),
    });

    return {
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalOrders: orders.length,
      averageOrderValue: orders.length > 0 
        ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length 
        : 0,
      ordersByType: this.groupByDeliveryType(orders),
    };
  }

  // Get customer satisfaction
  async getCustomerSatisfaction(cafeId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const feedback = await db.query.sakshiFeedback.findMany({
      where: and(
        eq(db.schema.sakshiFeedback.cafeId, cafeId),
        gte(db.schema.sakshiFeedback.createdAt, startDate)
      ),
    });

    const ratings = feedback.map(f => f.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : 0;

    return {
      averageRating,
      totalReviews: feedback.length,
      ratingDistribution: this.getRatingDistribution(ratings),
      sentimentAnalysis: await this.analyzeSentiment(feedback),
    };
  }

  // Helper methods
  private calculateAverageResponseTime(metrics: any[]) {
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, m) => sum + (m.responseTime || 0), 0);
    return total / metrics.length;
  }

  private calculateAverageDuration(metrics: any[]) {
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return total / metrics.length;
  }

  private groupByDate(items: any[]) {
    const grouped: Record<string, number> = {};
    items.forEach(item => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  }

  private groupByDeliveryType(orders: any[]) {
    return {
      dineIn: orders.filter(o => o.deliveryType === 'dine_in').length,
      takeaway: orders.filter(o => o.deliveryType === 'takeaway').length,
      delivery: orders.filter(o => o.deliveryType === 'delivery').length,
    };
  }

  private getRatingDistribution(ratings: number[]) {
    return {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length,
    };
  }

  private async analyzeSentiment(feedback: any[]) {
    // Use Claude API for sentiment analysis
    // Implementation details in next section
    return {};
  }
}
```

**Step 2: Create Analytics API Routes**

```typescript
// server/routes/sakshi-analytics.ts
import { router, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { AnalyticsService } from "@/server/services/sakshi-analytics";

const analyticsService = new AnalyticsService();

export const sakshiAnalyticsRouter = router({
  getDailyMetrics: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      date: z.date(),
    }))
    .query(async ({ input }) => {
      return analyticsService.getDailyCallMetrics(input.cafeId, input.date);
    }),

  getReservationTrends: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      days: z.number().default(30),
    }))
    .query(async ({ input }) => {
      return analyticsService.getReservationTrends(input.cafeId, input.days);
    }),

  getRevenueMetrics: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      return analyticsService.getRevenueMetrics(
        input.cafeId,
        input.startDate,
        input.endDate
      );
    }),

  getCustomerSatisfaction: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      days: z.number().default(30),
    }))
    .query(async ({ input }) => {
      return analyticsService.getCustomerSatisfaction(input.cafeId, input.days);
    }),

  exportMetrics: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
      format: z.enum(['csv', 'pdf']),
    }))
    .mutation(async ({ input }) => {
      // Export implementation
      return { success: true };
    }),
});
```

**Step 3: Create Frontend Analytics Dashboard Component**

```typescript
// client/src/components/sakshi/AnalyticsDashboard.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Phone,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Download,
  Calendar,
} from "lucide-react";

interface AnalyticsDashboardProps {
  cafeId: string;
}

export default function AnalyticsDashboard({ cafeId }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const [metrics, setMetrics] = useState({
    dailyMetrics: null,
    reservationTrends: null,
    revenueMetrics: null,
    customerSatisfaction: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch all metrics from API
      const [daily, trends, revenue, satisfaction] = await Promise.all([
        fetch(`/api/sakshi/analytics/daily?cafeId=${cafeId}&date=${new Date().toISOString()}`),
        fetch(`/api/sakshi/analytics/trends?cafeId=${cafeId}`),
        fetch(`/api/sakshi/analytics/revenue?cafeId=${cafeId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        fetch(`/api/sakshi/analytics/satisfaction?cafeId=${cafeId}`),
      ]);

      const data = {
        dailyMetrics: await daily.json(),
        reservationTrends: await trends.json(),
        revenueMetrics: await revenue.json(),
        customerSatisfaction: await satisfaction.json(),
      };

      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/sakshi/analytics/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cafeId,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format,
        }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${format}`;
      a.click();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Date Range and Export */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dailyMetrics?.totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.dailyMetrics?.answeredCalls || 0} answered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(metrics.reservationTrends || {}).reduce((a: any, b: any) => a + b, 0)}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{metrics.revenueMetrics?.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.revenueMetrics?.totalOrders || 0} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.customerSatisfaction?.averageRating?.toFixed(1) || 0}/5
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.customerSatisfaction?.totalReviews || 0} reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Call Metrics Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Call Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[metrics.dailyMetrics]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="answeredCalls" fill="#10b981" />
                <Bar dataKey="missedCalls" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={Object.entries(metrics.reservationTrends || {}).map(([date, count]) => ({
                date,
                revenue: count,
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Dine In', value: metrics.revenueMetrics?.ordersByType?.dineIn || 0 },
                    { name: 'Takeaway', value: metrics.revenueMetrics?.ordersByType?.takeaway || 0 },
                    { name: 'Delivery', value: metrics.revenueMetrics?.ordersByType?.delivery || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="w-12 font-medium">{rating} ⭐</span>
                  <div className="flex-1 bg-gray-200 rounded h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded"
                      style={{
                        width: `${(metrics.customerSatisfaction?.ratingDistribution?.[rating] || 0) / (metrics.customerSatisfaction?.totalReviews || 1) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm">
                    {metrics.customerSatisfaction?.ratingDistribution?.[rating] || 0}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### Success Criteria
- ✅ All metrics display correctly
- ✅ Charts update in real-time
- ✅ Export to CSV/PDF functionality works
- ✅ Mobile responsive design

#### Estimated Time: 5 days

---

### Task 1.1.2: Implement Call Metrics Tracking

#### Overview
Create a comprehensive call tracking system to log and analyze all incoming calls.

#### Implementation Steps

**Step 1: Create Call Log Database Schema**

```typescript
// server/db/schema.ts - Add to existing schema
import { pgTable, uuid, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const sakshiCallLogs = pgTable("sakshi_call_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  cafeId: uuid("cafe_id").notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }),
  callDuration: integer("call_duration"), // in seconds
  responseTime: integer("response_time"), // in seconds
  answered: boolean("answered").default(false),
  callType: varchar("call_type", { length: 50 }), // incoming, outgoing
  purpose: varchar("purpose", { length: 100 }), // reservation, order, inquiry
  resolved: boolean("resolved").default(false),
  transferredToStaff: boolean("transferred_to_staff").default(false),
  recordingUrl: varchar("recording_url", { length: 500 }),
  notes: varchar("notes", { length: 1000 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sakshiCallMetrics = pgTable("sakshi_call_metrics", {
  id: uuid("id").primaryKey().defaultRandom(),
  cafeId: uuid("cafe_id").notNull(),
  date: timestamp("date").notNull(),
  totalCalls: integer("total_calls").default(0),
  answeredCalls: integer("answered_calls").default(0),
  missedCalls: integer("missed_calls").default(0),
  averageResponseTime: integer("average_response_time"), // in seconds
  averageCallDuration: integer("average_call_duration"), // in seconds
  resolutionRate: integer("resolution_rate"), // percentage
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Step 2: Create Call Tracking Service**

```typescript
// server/services/sakshi-call-tracking.ts
import { db } from "@/server/db";
import { sakshiCallLogs, sakshiCallMetrics } from "@/server/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export class CallTrackingService {
  // Log incoming call
  async logIncomingCall(cafeId: string, customerPhone: string) {
    const callLog = await db.insert(sakshiCallLogs).values({
      cafeId,
      customerPhone,
      callType: 'incoming',
      createdAt: new Date(),
    }).returning();

    return callLog[0];
  }

  // Mark call as answered
  async markCallAnswered(callId: string, responseTime: number) {
    await db.update(sakshiCallLogs)
      .set({
        answered: true,
        responseTime,
        updatedAt: new Date(),
      })
      .where(eq(sakshiCallLogs.id, callId));
  }

  // End call
  async endCall(callId: string, duration: number, resolved: boolean) {
    await db.update(sakshiCallLogs)
      .set({
        callDuration: duration,
        resolved,
        updatedAt: new Date(),
      })
      .where(eq(sakshiCallLogs.id, callId));
  }

  // Get daily metrics
  async getDailyMetrics(cafeId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const calls = await db.query.sakshiCallLogs.findMany({
      where: and(
        eq(sakshiCallLogs.cafeId, cafeId),
        gte(sakshiCallLogs.createdAt, startOfDay),
        lte(sakshiCallLogs.createdAt, endOfDay)
      ),
    });

    const answeredCalls = calls.filter(c => c.answered).length;
    const missedCalls = calls.filter(c => !c.answered).length;
    const resolvedCalls = calls.filter(c => c.resolved).length;

    const avgResponseTime = answeredCalls > 0
      ? calls
          .filter(c => c.answered && c.responseTime)
          .reduce((sum, c) => sum + (c.responseTime || 0), 0) / answeredCalls
      : 0;

    const avgDuration = answeredCalls > 0
      ? calls
          .filter(c => c.answered && c.callDuration)
          .reduce((sum, c) => sum + (c.callDuration || 0), 0) / answeredCalls
      : 0;

    // Save metrics
    await db.insert(sakshiCallMetrics).values({
      cafeId,
      date: startOfDay,
      totalCalls: calls.length,
      answeredCalls,
      missedCalls,
      averageResponseTime: Math.round(avgResponseTime),
      averageCallDuration: Math.round(avgDuration),
      resolutionRate: calls.length > 0 ? Math.round((resolvedCalls / calls.length) * 100) : 0,
    });

    return {
      totalCalls: calls.length,
      answeredCalls,
      missedCalls,
      averageResponseTime: Math.round(avgResponseTime),
      averageCallDuration: Math.round(avgDuration),
      resolutionRate: calls.length > 0 ? Math.round((resolvedCalls / calls.length) * 100) : 0,
    };
  }

  // Get metrics for date range
  async getMetricsForRange(cafeId: string, startDate: Date, endDate: Date) {
    const metrics = await db.query.sakshiCallMetrics.findMany({
      where: and(
        eq(sakshiCallMetrics.cafeId, cafeId),
        gte(sakshiCallMetrics.date, startDate),
        lte(sakshiCallMetrics.date, endDate)
      ),
    });

    return metrics;
  }
}
```

**Step 3: Create Call Tracking API Routes**

```typescript
// server/routes/sakshi-call-tracking.ts
import { router, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { CallTrackingService } from "@/server/services/sakshi-call-tracking";

const callTrackingService = new CallTrackingService();

export const sakshiCallTrackingRouter = router({
  logIncomingCall: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      customerPhone: z.string(),
    }))
    .mutation(async ({ input }) => {
      return callTrackingService.logIncomingCall(input.cafeId, input.customerPhone);
    }),

  markCallAnswered: publicProcedure
    .input(z.object({
      callId: z.string(),
      responseTime: z.number(),
    }))
    .mutation(async ({ input }) => {
      await callTrackingService.markCallAnswered(input.callId, input.responseTime);
      return { success: true };
    }),

  endCall: publicProcedure
    .input(z.object({
      callId: z.string(),
      duration: z.number(),
      resolved: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      await callTrackingService.endCall(input.callId, input.duration, input.resolved);
      return { success: true };
    }),

  getDailyMetrics: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      date: z.date(),
    }))
    .query(async ({ input }) => {
      return callTrackingService.getDailyMetrics(input.cafeId, input.date);
    }),

  getMetricsForRange: publicProcedure
    .input(z.object({
      cafeId: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      return callTrackingService.getMetricsForRange(
        input.cafeId,
        input.startDate,
        input.endDate
      );
    }),
});
```

#### Success Criteria
- ✅ Calls logged accurately
- ✅ Metrics calculated correctly
- ✅ Dashboard displays real-time data

#### Estimated Time: 3 days

---

## Remaining Tasks Summary

**Task 1.1.3: Create Reservation Trend Analysis** (4 days)
- Daily reservation count tracking
- Weekly/monthly trend visualization
- Peak reservation times identification
- Cancellation rate analysis
- No-show rate tracking
- Customer retention metrics

**Task 1.1.4: Build Customer Satisfaction Metrics** (4 days)
- Post-order feedback collection
- Rating system (1-5 stars)
- Comment/review collection
- Sentiment analysis using Claude API
- Feedback categorization
- Response rate tracking

**Task 1.1.5: Implement Export Functionality** (3 days)
- CSV export for all metrics
- PDF report generation
- Custom date range selection
- Email report scheduling
- Automated daily/weekly reports

---

## Phase 1.2: Notification Integration (Month 2)

### Task 1.2.1: Integrate Twilio for SMS Notifications

#### Implementation Overview

**Step 1: Setup Twilio Account**
1. Create Twilio account at twilio.com
2. Get Account SID and Auth Token
3. Get Twilio phone number
4. Add to environment variables

**Step 2: Create SMS Service**

```typescript
// server/services/sakshi-sms.ts
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export class SMSService {
  async sendReservationConfirmation(
    phoneNumber: string,
    reservationDetails: {
      date: string;
      time: string;
      partySize: number;
      cafeId: string;
    }
  ) {
    const message = `Your reservation for ${reservationDetails.partySize} people on ${reservationDetails.date} at ${reservationDetails.time} is confirmed. Reply CONFIRM to confirm or CANCEL to cancel.`;

    return twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  }

  async sendOrderReady(phoneNumber: string, orderId: string) {
    const message = `Your order is ready! Please come pick it up. Order ID: ${orderId}`;

    return twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  }

  async sendReminder(phoneNumber: string, reservationTime: string) {
    const message = `Reminder: Your reservation is in 2 hours at ${reservationTime}. See you soon!`;

    return twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  }
}
```

**Step 3: Create SMS API Routes**

```typescript
// server/routes/sakshi-sms.ts
import { router, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { SMSService } from "@/server/services/sakshi-sms";

const smsService = new SMSService();

export const sakshiSMSRouter = router({
  sendReservationConfirmation: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      date: z.string(),
      time: z.string(),
      partySize: z.number(),
      cafeId: z.string(),
    }))
    .mutation(async ({ input }) => {
      return smsService.sendReservationConfirmation(input.phoneNumber, {
        date: input.date,
        time: input.time,
        partySize: input.partySize,
        cafeId: input.cafeId,
      });
    }),

  sendOrderReady: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      orderId: z.string(),
    }))
    .mutation(async ({ input }) => {
      return smsService.sendOrderReady(input.phoneNumber, input.orderId);
    }),

  sendReminder: publicProcedure
    .input(z.object({
      phoneNumber: z.string(),
      reservationTime: z.string(),
    }))
    .mutation(async ({ input }) => {
      return smsService.sendReminder(input.phoneNumber, input.reservationTime);
    }),
});
```

#### Estimated Time: 4 days

---

## Implementation Timeline

| Task | Duration | Start | End | Status |
|------|----------|-------|-----|--------|
| 1.1.1 Analytics Dashboard | 5 days | Day 1 | Day 5 | In Progress |
| 1.1.2 Call Metrics | 3 days | Day 6 | Day 8 | Pending |
| 1.1.3 Reservation Trends | 4 days | Day 9 | Day 12 | Pending |
| 1.1.4 Customer Satisfaction | 4 days | Day 13 | Day 16 | Pending |
| 1.1.5 Export Functionality | 3 days | Day 17 | Day 19 | Pending |
| 1.2.1 Twilio Integration | 4 days | Day 20 | Day 23 | Pending |
| 1.2.2 SendGrid Integration | 4 days | Day 24 | Day 27 | Pending |
| 1.2.3 Notification Preferences | 3 days | Day 28 | Day 30 | Pending |
| 1.2.4 Notification History | 3 days | Day 31 | Day 33 | Pending |
| 1.3.1 Razorpay Integration | 5 days | Day 34 | Day 38 | Pending |
| 1.3.2 Payment History | 3 days | Day 39 | Day 41 | Pending |
| 1.4.1 Database Migrations | 4 days | Day 42 | Day 45 | Pending |
| 1.4.2 E2E Testing | 5 days | Day 46 | Day 50 | Pending |
| 1.4.3 Performance Optimization | 3 days | Day 51 | Day 53 | Pending |
| 1.4.4 Staging Environment | 2 days | Day 54 | Day 55 | Pending |
| 1.4.5 Production Deployment | 3 days | Day 56 | Day 58 | Pending |

---

## Next Steps

1. **Complete Task 1.1.1** - Build analytics dashboard (in progress)
2. **Implement Call Tracking** - Add call logging and metrics
3. **Setup Notifications** - Integrate Twilio and SendGrid
4. **Add Payments** - Integrate Razorpay
5. **Test & Deploy** - Comprehensive testing and production deployment

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Next Review:** After Task 1.1.1 completion
