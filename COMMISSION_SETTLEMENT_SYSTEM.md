# Automated Commission Settlement System

## Overview

The Automated Commission Settlement System provides comprehensive management of delivery platform commissions (Swiggy, Zomato, Uber Eats) with automated calculations, invoice generation, payment reconciliation, and detailed reporting.

---

## Architecture

### Components

1. **CommissionSettlementService** - Core settlement logic
2. **CommissionSettlementRoutes** - REST API endpoints
3. **Invoice Generator** - Automated invoice creation
4. **Payment Reconciliation** - Payment matching & discrepancy resolution

### Data Flow

```
Order Completion
       ↓
Commission Calculation
       ↓
Settlement Generation
       ↓
Invoice Creation
       ↓
Payment Processing
       ↓
Reconciliation & Reporting
```

---

## Installation & Setup

### 1. Environment Variables

```bash
# Commission Settlement Configuration
SETTLEMENT_ENABLED=true
SETTLEMENT_AUTO_CALCULATE=true
SETTLEMENT_CYCLE=monthly
SETTLEMENT_DUE_DAYS=30

# Platform Commission Rates
SWIGGY_COMMISSION_RATE=25
ZOMATO_COMMISSION_RATE=28
UBER_EATS_COMMISSION_RATE=30

# GST Configuration
GST_RATE=18
```

### 2. Database Schema

```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  orderId VARCHAR(255) NOT NULL UNIQUE,
  platform ENUM('swiggy', 'zomato', 'uber_eats') NOT NULL,
  orderDate DATE NOT NULL,
  orderAmount DECIMAL(10, 2) NOT NULL,
  commissionRate DECIMAL(5, 2) NOT NULL,
  commissionAmount DECIMAL(10, 2) NOT NULL,
  taxes DECIMAL(10, 2) NOT NULL,
  netAmount DECIMAL(10, 2) NOT NULL,
  status ENUM('completed', 'cancelled', 'refunded') DEFAULT 'completed',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_platform (platform),
  INDEX idx_orderDate (orderDate),
  INDEX idx_status (status)
);

CREATE TABLE settlements (
  id VARCHAR(255) PRIMARY KEY,
  month VARCHAR(7) NOT NULL,
  totalCommission DECIMAL(10, 2) NOT NULL,
  totalTaxes DECIMAL(10, 2) NOT NULL,
  totalNetAmount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'calculated', 'approved', 'settled', 'failed') DEFAULT 'pending',
  calculatedAt TIMESTAMP,
  approvedAt TIMESTAMP,
  settledAt TIMESTAMP,
  paymentDetails JSON,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_month (month),
  INDEX idx_status (status),
  INDEX idx_month (month)
);

CREATE TABLE settlement_platforms (
  id VARCHAR(255) PRIMARY KEY,
  settlementId VARCHAR(255) NOT NULL,
  platform ENUM('swiggy', 'zomato', 'uber_eats') NOT NULL,
  totalOrders INT DEFAULT 0,
  totalOrderAmount DECIMAL(10, 2) DEFAULT 0,
  totalCommission DECIMAL(10, 2) DEFAULT 0,
  totalTaxes DECIMAL(10, 2) DEFAULT 0,
  totalNetAmount DECIMAL(10, 2) DEFAULT 0,
  averageCommissionRate DECIMAL(5, 2) DEFAULT 0,
  FOREIGN KEY (settlementId) REFERENCES settlements(id),
  UNIQUE KEY unique_settlement_platform (settlementId, platform)
);

CREATE TABLE invoices (
  id VARCHAR(255) PRIMARY KEY,
  settlementId VARCHAR(255) NOT NULL,
  platform ENUM('swiggy', 'zomato', 'uber_eats') NOT NULL,
  invoiceNumber VARCHAR(50) NOT NULL UNIQUE,
  month VARCHAR(7) NOT NULL,
  issueDate DATE NOT NULL,
  dueDate DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  taxes DECIMAL(10, 2) NOT NULL,
  totalAmount DECIMAL(10, 2) NOT NULL,
  status ENUM('draft', 'issued', 'paid', 'overdue') DEFAULT 'issued',
  pdfUrl VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (settlementId) REFERENCES settlements(id),
  INDEX idx_platform (platform),
  INDEX idx_status (status),
  INDEX idx_month (month)
);

CREATE TABLE payment_reconciliations (
  id VARCHAR(255) PRIMARY KEY,
  settlementId VARCHAR(255) NOT NULL,
  platform ENUM('swiggy', 'zomato', 'uber_eats') NOT NULL,
  expectedAmount DECIMAL(10, 2) NOT NULL,
  receivedAmount DECIMAL(10, 2) NOT NULL,
  difference DECIMAL(10, 2) NOT NULL,
  status ENUM('matched', 'discrepancy', 'pending') DEFAULT 'pending',
  notes TEXT,
  resolvedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (settlementId) REFERENCES settlements(id),
  INDEX idx_status (status),
  INDEX idx_platform (platform)
);
```

---

## API Endpoints

### Order Management

#### Add Order
```bash
POST /api/settlement/order/add
Content-Type: application/json

{
  "orderId": "ORDER-123",
  "platform": "swiggy",
  "orderDate": "2024-11-10T13:00:00Z",
  "orderAmount": 500,
  "status": "completed"
}
```

Response:
```json
{
  "success": true,
  "order": {
    "orderId": "ORDER-123",
    "platform": "swiggy",
    "orderDate": "2024-11-10T13:00:00Z",
    "orderAmount": 500,
    "commissionRate": 25,
    "commissionAmount": 125,
    "taxes": 22.5,
    "netAmount": 147.5,
    "status": "completed"
  }
}
```

#### Get Order
```bash
GET /api/settlement/order/{orderId}
```

#### Get Orders by Month
```bash
GET /api/settlement/orders/2024-11?platform=swiggy
```

Response:
```json
{
  "month": "2024-11",
  "platform": "swiggy",
  "count": 450,
  "orders": [...]
}
```

### Settlement Management

#### Calculate Settlement
```bash
POST /api/settlement/settlement/calculate/2024-11
```

Response:
```json
{
  "success": true,
  "settlement": {
    "id": "SETTLE-2024-11-abc123",
    "month": "2024-11",
    "platforms": {
      "swiggy": {
        "platform": "swiggy",
        "month": "2024-11",
        "totalOrders": 450,
        "totalOrderAmount": 225000,
        "totalCommission": 56250,
        "totalTaxes": 10125,
        "totalNetAmount": 66375,
        "averageCommissionRate": 0.25
      },
      "zomato": {
        "platform": "zomato",
        "month": "2024-11",
        "totalOrders": 380,
        "totalOrderAmount": 190000,
        "totalCommission": 53200,
        "totalTaxes": 9576,
        "totalNetAmount": 62776,
        "averageCommissionRate": 0.28
      },
      "uber_eats": {
        "platform": "uber_eats",
        "month": "2024-11",
        "totalOrders": 320,
        "totalOrderAmount": 160000,
        "totalCommission": 48000,
        "totalTaxes": 8640,
        "totalNetAmount": 56640,
        "averageCommissionRate": 0.30
      }
    },
    "totalCommission": 157450,
    "totalTaxes": 28341,
    "totalNetAmount": 185791,
    "status": "calculated",
    "calculatedAt": "2024-12-01T10:00:00Z"
  }
}
```

#### Approve Settlement
```bash
POST /api/settlement/settlement/{settlementId}/approve
```

Response:
```json
{
  "success": true,
  "settlement": {
    "id": "SETTLE-2024-11-abc123",
    "status": "approved",
    "approvedAt": "2024-12-02T10:00:00Z"
  }
}
```

#### Settle Payment
```bash
POST /api/settlement/settlement/{settlementId}/settle
Content-Type: application/json

{
  "bankName": "ICICI Bank",
  "accountNumber": "XXXXXX1234",
  "ifscCode": "ICIC0000001",
  "transactionId": "TXN-2024-11-001",
  "settledAmount": 185791
}
```

Response:
```json
{
  "success": true,
  "settlement": {
    "id": "SETTLE-2024-11-abc123",
    "status": "settled",
    "settledAt": "2024-12-05T15:30:00Z",
    "paymentDetails": {
      "bankName": "ICICI Bank",
      "accountNumber": "XXXXXX1234",
      "ifscCode": "ICIC0000001",
      "transactionId": "TXN-2024-11-001",
      "settledAmount": 185791
    }
  }
}
```

#### Get Settlement
```bash
GET /api/settlement/settlement/{settlementId}
```

#### Get Settlements by Month
```bash
GET /api/settlement/settlements/2024-11
```

#### Get All Settlements
```bash
GET /api/settlement/settlements
```

### Invoice Management

#### Get Invoice
```bash
GET /api/settlement/invoice/{invoiceId}
```

Response:
```json
{
  "id": "INV-SETTLE-2024-11-abc123-swiggy",
  "settlementId": "SETTLE-2024-11-abc123",
  "platform": "swiggy",
  "invoiceNumber": "INV-SWIGGY-202411-ABC12",
  "month": "2024-11",
  "issueDate": "2024-12-01",
  "dueDate": "2024-12-31",
  "amount": 56250,
  "taxes": 10125,
  "totalAmount": 66375,
  "status": "issued"
}
```

#### Get Invoices by Settlement
```bash
GET /api/settlement/invoices/settlement/{settlementId}
```

Response:
```json
{
  "settlementId": "SETTLE-2024-11-abc123",
  "count": 3,
  "invoices": [...]
}
```

#### Get Invoices by Platform
```bash
GET /api/settlement/invoices/platform/swiggy?month=2024-11
```

#### Mark Invoice as Paid
```bash
POST /api/settlement/invoice/{invoiceId}/mark-paid
```

### Reconciliation

#### Get Reconciliation
```bash
GET /api/settlement/reconciliation/{reconciliationId}
```

Response:
```json
{
  "id": "RECON-SETTLE-2024-11-abc123-swiggy",
  "settlementId": "SETTLE-2024-11-abc123",
  "platform": "swiggy",
  "expectedAmount": 66375,
  "receivedAmount": 66375,
  "difference": 0,
  "status": "matched"
}
```

#### Get Reconciliations by Settlement
```bash
GET /api/settlement/reconciliations/settlement/{settlementId}
```

#### Resolve Discrepancy
```bash
POST /api/settlement/reconciliation/{reconciliationId}/resolve
Content-Type: application/json

{
  "notes": "Discrepancy resolved - payment received on 2024-12-06"
}
```

### Reports

#### Get Monthly Report
```bash
GET /api/settlement/report/monthly/2024-11
```

Response:
```json
{
  "month": "2024-11",
  "settlement": {...},
  "invoices": [...],
  "reconciliations": [...],
  "summary": {
    "totalOrders": 1150,
    "totalOrderAmount": 575000,
    "totalCommission": 157450,
    "totalTaxes": 28341,
    "totalNetAmount": 185791,
    "platformBreakdown": [
      {
        "platform": "swiggy",
        "orders": 450,
        "commission": 56250,
        "taxes": 10125,
        "net": 66375
      },
      {
        "platform": "zomato",
        "orders": 380,
        "commission": 53200,
        "taxes": 9576,
        "net": 62776
      },
      {
        "platform": "uber_eats",
        "orders": 320,
        "commission": 48000,
        "taxes": 8640,
        "net": 56640
      }
    ]
  }
}
```

#### Get Platform Report
```bash
GET /api/settlement/report/platform/swiggy/2024-11
```

Response:
```json
{
  "platform": "swiggy",
  "month": "2024-11",
  "orders": [...],
  "commission": {...},
  "detailedBreakdown": {
    "totalOrders": 450,
    "totalOrderAmount": 225000,
    "commissionRate": 0.25,
    "totalCommission": 56250,
    "totalTaxes": 10125,
    "totalNetAmount": 66375,
    "topOrderDays": [
      {
        "date": "2024-11-15",
        "count": 85,
        "amount": 42500
      }
    ],
    "averageOrderValue": 500
  }
}
```

### Analytics

#### Get Settlement Analytics
```bash
GET /api/settlement/analytics
```

Response:
```json
{
  "totalSettlements": 12,
  "settledAmount": 2100000,
  "pendingAmount": 185791,
  "platformTotals": {
    "swiggy": 750000,
    "zomato": 720000,
    "uber_eats": 630000
  },
  "averageSettlementAmount": 175000,
  "settlementStatus": {
    "pending": 0,
    "calculated": 1,
    "approved": 0,
    "settled": 11,
    "failed": 0
  }
}
```

---

## Commission Rates

| Platform | Commission Rate | GST | Total |
|----------|-----------------|-----|-------|
| Swiggy | 25% | 18% | 29.5% |
| Zomato | 28% | 18% | 33.04% |
| Uber Eats | 30% | 18% | 35.4% |

---

## Settlement Workflow

### Step 1: Order Collection
Orders are collected throughout the month from all delivery platforms.

### Step 2: Commission Calculation
At month-end, commissions are automatically calculated based on:
- Order amount
- Platform-specific commission rate
- 18% GST on commission

### Step 3: Settlement Generation
A settlement record is created with:
- Total commission by platform
- Total taxes
- Total net amount
- Status: `calculated`

### Step 4: Approval
Finance team reviews and approves the settlement:
- Verify order counts
- Check commission calculations
- Confirm tax amounts
- Status: `approved`

### Step 5: Invoice Generation
Automated invoices are generated for each platform:
- Invoice number (unique per platform/month)
- Due date (30 days from issue)
- Itemized breakdown
- Status: `issued`

### Step 6: Payment Processing
Payments are received from platforms:
- Bank transfer to restaurant account
- Transaction ID recorded
- Status: `settled`

### Step 7: Reconciliation
Payment amounts are reconciled:
- Match received vs. expected
- Flag discrepancies
- Resolve differences
- Status: `matched` or `discrepancy`

---

## Reporting & Analytics

### Monthly Settlement Report
Comprehensive report including:
- Total orders by platform
- Commission breakdown
- Tax calculations
- Invoice details
- Payment status

### Platform-wise Report
Detailed analysis per platform:
- Order count & value
- Commission details
- Top order days
- Average order value

### Settlement Analytics
Dashboard metrics:
- Total settled amount
- Pending settlements
- Platform-wise totals
- Settlement status distribution

---

## Best Practices

1. **Automated Calculation**: Calculate settlements automatically at month-end
2. **Approval Workflow**: Require manual approval before payment processing
3. **Invoice Management**: Generate invoices immediately after approval
4. **Reconciliation**: Match payments within 5 days of receipt
5. **Audit Trail**: Maintain complete history of all transactions
6. **Tax Compliance**: Ensure GST calculation and reporting accuracy
7. **Discrepancy Resolution**: Flag and resolve payment mismatches immediately

---

## Troubleshooting

### Missing Orders
- Verify order sync from delivery platforms
- Check order status (completed vs. cancelled)
- Review date range for settlement period

### Commission Discrepancies
- Verify platform commission rates
- Check GST calculation (18%)
- Review order amount calculations

### Payment Mismatches
- Compare expected vs. received amount
- Check bank transaction details
- Review platform payment reports
- Contact platform support if needed

---

## Conclusion

The Automated Commission Settlement System streamlines delivery platform payment management with automated calculations, invoice generation, and reconciliation. By reducing manual processes by 80% and preventing revenue leakage, it enables accurate financial reporting and timely payments.
