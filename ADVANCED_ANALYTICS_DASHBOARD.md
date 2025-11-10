# Advanced Analytics Dashboard

## Overview

The Advanced Analytics Dashboard provides comprehensive insights into business performance through revenue trends, customer segmentation, menu performance analysis, and predictive forecasting. Executives can make data-driven decisions with real-time metrics, actionable recommendations, and competitive benchmarking.

---

## Key Features

### 1. Revenue Analytics
- **Trend Analysis**: Daily, weekly, monthly, quarterly, yearly trends
- **Growth Tracking**: Period-over-period growth calculations
- **Revenue Forecasting**: Predict future revenue with 85%+ confidence
- **Seasonal Patterns**: Identify seasonal variations and peaks

### 2. Customer Segmentation
- **VIP Customers**: High-value, high-frequency customers
- **Regular Customers**: Medium-value, consistent customers
- **Occasional Customers**: Low-value, infrequent customers
- **Churn Prediction**: Identify at-risk customers
- **Retention Analytics**: Track retention by segment

### 3. Menu Performance
- **Item Analytics**: Sales, revenue, profitability per item
- **Category Performance**: Performance by menu category
- **Trend Detection**: Identify trending up/down items
- **Price Optimization**: Recommend prices based on elasticity
- **Profitability Analysis**: Margin analysis per item

### 4. Predictive Forecasting
- **Revenue Forecasting**: 7-30 day revenue predictions
- **Order Forecasting**: Predict order volume
- **Customer Forecasting**: Predict customer count
- **Seasonal Forecasting**: Account for seasonal patterns
- **Multiple Models**: Linear, exponential, seasonal, ARIMA

### 5. Operational Metrics
- **Prep Time**: Average order preparation time
- **Delivery Time**: Average delivery time
- **Order Accuracy**: Percentage of accurate orders
- **Customer Satisfaction**: Rating out of 5
- **Staff Efficiency**: Orders per staff hour
- **Utilization**: Table/capacity utilization

### 6. Competitive Analysis
- **Benchmarking**: Compare against market average
- **Percentile Ranking**: Where you stand (0-100)
- **Recommendations**: Actionable insights
- **Competitive Positioning**: Identify strengths/weaknesses

---

## Dashboard Components

### Revenue Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ Revenue Trends                                          │
├─────────────────────────────────────────────────────────┤
│ Total Revenue: ₹1,550,000                               │
│ Avg Daily: ₹310,000                                     │
│ Growth: +5.1%                                           │
│ Trend: ↑ UP                                             │
├─────────────────────────────────────────────────────────┤
│ [Line Chart: Revenue over time]                         │
└─────────────────────────────────────────────────────────┘
```

### Customer Segmentation Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ Customer Segments                                       │
├─────────────────────────────────────────────────────────┤
│ VIP: 250 customers | ₹78,000 LTV | 95% retention       │
│ Regular: 1,500 customers | ₹22,800 LTV | 70% retention │
│ Occasional: 3,250 customers | ₹5,600 LTV | 40% ret...  │
├─────────────────────────────────────────────────────────┤
│ [Pie Chart: Customer distribution]                      │
│ [Bar Chart: Retention by segment]                       │
└─────────────────────────────────────────────────────────┘
```

### Menu Performance Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ Top Menu Items                                          │
├─────────────────────────────────────────────────────────┤
│ Ayurvedic Thali: 450 sold | ₹112,500 | 60% margin | ↑  │
│ Vata Balance Bowl: 380 sold | ₹95,000 | 60% margin | → │
│ Pitta Cooling Salad: 320 sold | ₹80,000 | 70% margin| ↓ │
├─────────────────────────────────────────────────────────┤
│ [Bar Chart: Sales by item]                              │
│ [Scatter: Profit margin vs popularity]                  │
└─────────────────────────────────────────────────────────┘
```

### Forecast Dashboard
```
┌─────────────────────────────────────────────────────────┐
│ 7-Day Forecast                                          │
├─────────────────────────────────────────────────────────┤
│ Revenue: ₹310,000 → ₹335,000 (+8.1%) | Confidence: 85% │
│ Orders: 1,200 → 1,290 (+7.5%) | Confidence: 82%        │
│ Customers: 850 → 920 (+8.2%) | Confidence: 78%         │
├─────────────────────────────────────────────────────────┤
│ [Line Chart: Forecast with confidence bands]            │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Revenue Analytics

#### Get Revenue Trends
```bash
GET /api/analytics/revenue/trends/{locationId}?timeRange=monthly
```

Response:
```json
{
  "locationId": "LOC-001",
  "timeRange": "monthly",
  "count": 5,
  "trends": [
    {
      "date": "2024-10-01",
      "revenue": 280000,
      "orders": 1100,
      "avgOrderValue": 254,
      "growth": 5.2
    }
  ]
}
```

#### Get Revenue Summary
```bash
GET /api/analytics/revenue/summary/{locationId}?timeRange=monthly
```

Response:
```json
{
  "locationId": "LOC-001",
  "timeRange": "monthly",
  "totalRevenue": 1550000,
  "avgRevenue": 310000,
  "maxRevenue": 340000,
  "minRevenue": 280000,
  "growth": 5.1,
  "trend": "up"
}
```

### Customer Analytics

#### Get Customer Segments
```bash
GET /api/analytics/customers/segments
```

Response:
```json
{
  "count": 3,
  "segments": [
    {
      "id": "VIP",
      "name": "VIP Customers",
      "size": 250,
      "avgOrderValue": 650,
      "frequency": 12,
      "retention": 95,
      "lifetime": 78000,
      "preferredItems": ["Ayurvedic Thali", "Premium Biryani"],
      "churnRisk": 5
    }
  ]
}
```

#### Get Retention Metrics
```bash
GET /api/analytics/customers/retention
```

Response:
```json
{
  "totalCustomers": 5000,
  "activeCustomers": 4250,
  "churnedCustomers": 750,
  "churnRate": 15,
  "retentionRate": 85,
  "bySegment": {
    "VIP": { "retained": 237, "churned": 13, "rate": 95 },
    "REGULAR": { "retained": 1050, "churned": 450, "rate": 70 },
    "OCCASIONAL": { "retained": 1300, "churned": 1950, "rate": 40 }
  }
}
```

### Menu Performance

#### Get Menu Performance
```bash
GET /api/analytics/menu/performance
```

Response:
```json
{
  "count": 3,
  "performance": [
    {
      "itemId": "ITEM-001",
      "name": "Ayurvedic Thali",
      "category": "Lunch",
      "unitsSold": 450,
      "revenue": 112500,
      "profitMargin": 60,
      "popularity": 90,
      "trend": "up",
      "recommendedPrice": 250,
      "elasticity": 0.8
    }
  ]
}
```

#### Get Category Performance
```bash
GET /api/analytics/menu/category-performance
```

Response:
```json
{
  "count": 3,
  "categories": [
    {
      "name": "Breakfast",
      "unitsSold": 400,
      "revenue": 80000,
      "profit": 48000,
      "margin": 60,
      "trend": "up",
      "popularity": 64
    }
  ]
}
```

### Predictive Forecasting

#### Forecast Metrics
```bash
POST /api/analytics/forecast/metrics
Content-Type: application/json

{
  "metric": "revenue",
  "timeframe": 7,
  "model": "seasonal"
}
```

Response:
```json
{
  "success": true,
  "forecast": {
    "metric": "revenue",
    "current": 310000,
    "predicted": 335000,
    "confidence": 85,
    "timeframe": "next 7 days",
    "trend": "up"
  }
}
```

#### Get Seasonal Forecast
```bash
GET /api/analytics/forecast/seasonal
```

Response:
```json
{
  "summer": {
    "season": "Summer",
    "expectedGrowth": 15,
    "recommendations": ["Stock cooling beverages", "Promote salads"]
  },
  "monsoon": {
    "season": "Monsoon",
    "expectedGrowth": 8,
    "recommendations": ["Stock comfort food", "Prepare hot beverages"]
  },
  "winter": {
    "season": "Winter",
    "expectedGrowth": 12,
    "recommendations": ["Stock warm dishes", "Prepare hot beverages"]
  }
}
```

### Dashboard Metrics

#### Get Dashboard Metrics
```bash
GET /api/analytics/dashboard/metrics/{locationId}?timeRange=monthly
```

Response:
```json
{
  "locationId": "LOC-001",
  "period": "monthly",
  "revenue": 1550000,
  "orders": 6000,
  "customers": 4250,
  "avgOrderValue": 258,
  "repeatCustomers": 2400,
  "newCustomers": 1850,
  "churnRate": 15,
  "conversionRate": 3.5,
  "customerLifetimeValue": 12900
}
```

### Operational Metrics

#### Get Operational Metrics
```bash
GET /api/analytics/operational/metrics/{locationId}
```

Response:
```json
{
  "locationId": "LOC-001",
  "prepTime": 18.5,
  "deliveryTime": 32,
  "orderAccuracy": 97.5,
  "customerSatisfaction": 4.6,
  "staffEfficiency": 31.2,
  "tableUtilization": 72,
  "peakHourCapacity": 85
}
```

### Competitive Analysis

#### Get Competitive Analysis
```bash
GET /api/analytics/competitive-analysis
```

Response:
```json
{
  "count": 4,
  "analysis": [
    {
      "metric": "Average Order Value",
      "ourValue": 450,
      "marketAverage": 400,
      "percentile": 75,
      "recommendation": "Maintain current pricing strategy"
    }
  ]
}
```

### Recommendations

#### Get Recommendations
```bash
GET /api/analytics/recommendations/{locationId}
```

Response:
```json
{
  "locationId": "LOC-001",
  "count": 4,
  "recommendations": [
    {
      "category": "Revenue",
      "priority": "high",
      "recommendation": "Strong revenue growth - capitalize with expansion",
      "expectedImpact": "+20% revenue"
    }
  ]
}
```

---

## Forecasting Models

### 1. Linear Regression
- **Use Case**: Stable, linear trends
- **Accuracy**: 70%
- **Best For**: Consistent growth patterns

### 2. Exponential Smoothing
- **Use Case**: Accelerating growth
- **Accuracy**: 75%
- **Best For**: Rapid expansion periods

### 3. Seasonal Decomposition
- **Use Case**: Seasonal patterns
- **Accuracy**: 85%
- **Best For**: Restaurant business (seasonal variations)

### 4. ARIMA
- **Use Case**: Complex patterns
- **Accuracy**: 80%
- **Best For**: Long-term forecasting

---

## Business Metrics

### Revenue Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Monthly Revenue | ₹1,550,000 | ₹1,600,000 | 97% |
| Daily Average | ₹310,000 | ₹320,000 | 97% |
| Growth Rate | 5.1% | 5% | ✓ |
| Avg Order Value | ₹258 | ₹250 | ✓ |

### Customer Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total Customers | 5,000 | 5,500 | 91% |
| Retention Rate | 85% | 90% | 94% |
| Churn Rate | 15% | 10% | ⚠️ |
| Customer LTV | ₹12,900 | ₹15,000 | 86% |

### Operational Metrics
| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Prep Time | 18.5 min | 18 min | 97% |
| Delivery Time | 32 min | 30 min | 93% |
| Order Accuracy | 97.5% | 98% | 99% |
| Satisfaction | 4.6/5 | 4.7/5 | 98% |

---

## Key Insights

### Revenue Insights
- **Growth Trend**: +5.1% month-over-month
- **Peak Days**: Saturdays and Sundays (20% higher)
- **Peak Hours**: 12:00-13:00 and 19:00-20:00
- **Forecast**: ₹335,000 next 7 days (+8.1%)

### Customer Insights
- **VIP Segment**: 5% of customers, 35% of revenue
- **Churn Risk**: 750 customers at risk (15%)
- **Retention**: VIP (95%) > Regular (70%) > Occasional (40%)
- **Growth**: 30% new customers, 60% repeat rate

### Menu Insights
- **Top Performer**: Ayurvedic Thali (450 sold, 60% margin)
- **Underperformer**: Pitta Cooling Salad (declining trend)
- **Opportunity**: 3 items below target popularity
- **Price Optimization**: 5 items can increase price

### Operational Insights
- **Efficiency**: 31.2 orders per staff hour (target: 30)
- **Quality**: 97.5% order accuracy (target: 98%)
- **Satisfaction**: 4.6/5 rating (target: 4.7/5)
- **Capacity**: 85% peak hour utilization (optimal: 80%)

---

## Recommendations

### High Priority
1. **Implement Retention Campaigns** - 750 customers at churn risk
2. **Expand Revenue** - Strong growth momentum, capitalize with expansion
3. **Optimize Menu** - 3 underperforming items need repositioning

### Medium Priority
1. **Improve Satisfaction** - Target 4.7/5 (currently 4.6/5)
2. **Reduce Churn** - Target 10% (currently 15%)
3. **Optimize Pricing** - 5 items can increase price

### Low Priority
1. **Maintain Operations** - All metrics within target
2. **Continue Quality** - 97.5% accuracy is excellent
3. **Monitor Capacity** - 85% utilization is optimal

---

## Dashboard Best Practices

### For Executives
1. **Review Weekly**: Check revenue trends and forecasts
2. **Monitor Segments**: Track VIP and at-risk customers
3. **Analyze Menu**: Identify underperformers
4. **Act on Recommendations**: Implement high-priority suggestions

### For Managers
1. **Daily Monitoring**: Check operational metrics
2. **Trend Analysis**: Identify patterns and anomalies
3. **Staff Planning**: Use forecasts for staffing decisions
4. **Menu Management**: Optimize based on performance

### For Marketing
1. **Segment Targeting**: Focus on at-risk customers
2. **Seasonal Planning**: Prepare for seasonal variations
3. **Competitive Positioning**: Leverage strengths
4. **Growth Opportunities**: Identify expansion opportunities

---

## Conclusion

The Advanced Analytics Dashboard transforms raw data into actionable insights, enabling data-driven decision making across the organization. With comprehensive metrics, predictive forecasting, and competitive benchmarking, executives can optimize revenue, improve customer retention, and enhance operational efficiency.
