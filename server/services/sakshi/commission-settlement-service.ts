/**
 * Automated Commission Settlement Service
 * Handles monthly settlement reports, payment reconciliation, and invoice generation
 */

type Platform = 'swiggy' | 'zomato' | 'uber_eats';
type SettlementStatus = 'pending' | 'calculated' | 'approved' | 'settled' | 'failed';

interface Order {
  orderId: string;
  platform: Platform;
  orderDate: Date;
  orderAmount: number;
  commissionRate: number; // percentage
  commissionAmount: number;
  taxes: number;
  netAmount: number;
  status: 'completed' | 'cancelled' | 'refunded';
}

interface PlatformCommission {
  platform: Platform;
  month: string; // YYYY-MM
  totalOrders: number;
  totalOrderAmount: number;
  totalCommission: number;
  totalTaxes: number;
  totalNetAmount: number;
  averageCommissionRate: number;
  commissionBreakdown: {
    platformCommission: number;
    deliveryCharge: number;
    taxes: number;
    discounts: number;
  };
}

interface Settlement {
  id: string;
  month: string; // YYYY-MM
  platforms: Record<Platform, PlatformCommission>;
  totalCommission: number;
  totalTaxes: number;
  totalNetAmount: number;
  status: SettlementStatus;
  calculatedAt?: Date;
  approvedAt?: Date;
  settledAt?: Date;
  paymentDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    transactionId?: string;
    settledAmount?: number;
  };
  notes?: string;
}

interface Invoice {
  id: string;
  settlementId: string;
  platform: Platform;
  invoiceNumber: string;
  month: string;
  issueDate: Date;
  dueDate: Date;
  amount: number;
  taxes: number;
  totalAmount: number;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  pdfUrl?: string;
}

interface PaymentReconciliation {
  id: string;
  settlementId: string;
  platform: Platform;
  expectedAmount: number;
  receivedAmount: number;
  difference: number;
  status: 'matched' | 'discrepancy' | 'pending';
  notes?: string;
  resolvedAt?: Date;
}

class CommissionSettlementService {
  private orders: Map<string, Order> = new Map();
  private settlements: Map<string, Settlement> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private reconciliations: Map<string, PaymentReconciliation> = new Map();
  private platformRates: Record<Platform, number> = {
    swiggy: 25, // 25% commission
    zomato: 28, // 28% commission
    uber_eats: 30, // 30% commission
  };

  /**
   * Order Management
   */

  async addOrder(orderData: Partial<Order>): Promise<Order> {
    const id = orderData.orderId || `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const platform = orderData.platform || 'swiggy';
    const commissionRate = this.platformRates[platform];
    const commissionAmount = (orderData.orderAmount || 0) * (commissionRate / 100);
    const taxes = commissionAmount * 0.18; // 18% GST

    const order: Order = {
      orderId: id,
      platform,
      orderDate: orderData.orderDate || new Date(),
      orderAmount: orderData.orderAmount || 0,
      commissionRate,
      commissionAmount,
      taxes,
      netAmount: commissionAmount + taxes,
      status: orderData.status || 'completed',
    };

    this.orders.set(id, order);
    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  async getOrdersByMonth(month: string, platform?: Platform): Promise<Order[]> {
    const [year, monthNum] = month.split('-').map(Number);

    return Array.from(this.orders.values()).filter((order) => {
      const orderYear = order.orderDate.getFullYear();
      const orderMonth = order.orderDate.getMonth() + 1;

      const monthMatch = orderYear === year && orderMonth === monthNum;
      const platformMatch = !platform || order.platform === platform;

      return monthMatch && platformMatch && order.status === 'completed';
    });
  }

  /**
   * Settlement Calculation
   */

  async calculateSettlement(month: string): Promise<Settlement> {
    const id = `SETTLE-${month}-${Math.random().toString(36).substr(2, 9)}`;

    const platforms: Record<Platform, PlatformCommission> = {
      swiggy: await this.calculatePlatformCommission('swiggy', month),
      zomato: await this.calculatePlatformCommission('zomato', month),
      uber_eats: await this.calculatePlatformCommission('uber_eats', month),
    };

    const totalCommission = Object.values(platforms).reduce((sum, p) => sum + p.totalCommission, 0);
    const totalTaxes = Object.values(platforms).reduce((sum, p) => sum + p.totalTaxes, 0);
    const totalNetAmount = Object.values(platforms).reduce((sum, p) => sum + p.totalNetAmount, 0);

    const settlement: Settlement = {
      id,
      month,
      platforms,
      totalCommission,
      totalTaxes,
      totalNetAmount,
      status: 'calculated',
      calculatedAt: new Date(),
    };

    this.settlements.set(id, settlement);
    return settlement;
  }

  private async calculatePlatformCommission(platform: Platform, month: string): Promise<PlatformCommission> {
    const orders = await this.getOrdersByMonth(month, platform);

    const totalOrderAmount = orders.reduce((sum, o) => sum + o.orderAmount, 0);
    const totalCommission = orders.reduce((sum, o) => sum + o.commissionAmount, 0);
    const totalTaxes = orders.reduce((sum, o) => sum + o.taxes, 0);
    const totalNetAmount = totalCommission + totalTaxes;

    return {
      platform,
      month,
      totalOrders: orders.length,
      totalOrderAmount,
      totalCommission,
      totalTaxes,
      totalNetAmount,
      averageCommissionRate: orders.length > 0 ? totalCommission / totalOrderAmount : 0,
      commissionBreakdown: {
        platformCommission: totalCommission * 0.8,
        deliveryCharge: totalCommission * 0.15,
        taxes: totalTaxes,
        discounts: totalCommission * 0.05,
      },
    };
  }

  async approveSettlement(settlementId: string): Promise<Settlement | null> {
    const settlement = this.settlements.get(settlementId);
    if (!settlement) return null;

    settlement.status = 'approved';
    settlement.approvedAt = new Date();

    this.settlements.set(settlementId, settlement);

    // Generate invoices for each platform
    for (const [platform, commission] of Object.entries(settlement.platforms)) {
      await this.generateInvoice(settlementId, platform as Platform, commission);
    }

    return settlement;
  }

  async settlePayment(settlementId: string, paymentDetails: any): Promise<Settlement | null> {
    const settlement = this.settlements.get(settlementId);
    if (!settlement) return null;

    settlement.status = 'settled';
    settlement.settledAt = new Date();
    settlement.paymentDetails = paymentDetails;

    this.settlements.set(settlementId, settlement);

    // Create payment reconciliation records
    for (const [platform, commission] of Object.entries(settlement.platforms)) {
      await this.createReconciliation(settlementId, platform as Platform, commission.totalNetAmount, paymentDetails.settledAmount || 0);
    }

    return settlement;
  }

  async getSettlement(settlementId: string): Promise<Settlement | null> {
    return this.settlements.get(settlementId) || null;
  }

  async getSettlementsByMonth(month: string): Promise<Settlement[]> {
    return Array.from(this.settlements.values()).filter((s) => s.month === month);
  }

  async getAllSettlements(): Promise<Settlement[]> {
    return Array.from(this.settlements.values());
  }

  /**
   * Invoice Generation
   */

  private async generateInvoice(settlementId: string, platform: Platform, commission: PlatformCommission): Promise<Invoice> {
    const id = `INV-${settlementId}-${platform}-${Date.now()}`;
    const invoiceNumber = `INV-${platform.toUpperCase()}-${commission.month.replace('-', '')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const invoice: Invoice = {
      id,
      settlementId,
      platform,
      invoiceNumber,
      month: commission.month,
      issueDate,
      dueDate,
      amount: commission.totalCommission,
      taxes: commission.totalTaxes,
      totalAmount: commission.totalNetAmount,
      status: 'issued',
    };

    this.invoices.set(id, invoice);
    return invoice;
  }

  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    return this.invoices.get(invoiceId) || null;
  }

  async getInvoicesBySettlement(settlementId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter((i) => i.settlementId === settlementId);
  }

  async getInvoicesByPlatform(platform: Platform, month?: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter((i) => i.platform === platform && (!month || i.month === month));
  }

  async markInvoiceAsPaid(invoiceId: string): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return null;

    invoice.status = 'paid';
    this.invoices.set(invoiceId, invoice);
    return invoice;
  }

  /**
   * Payment Reconciliation
   */

  private async createReconciliation(
    settlementId: string,
    platform: Platform,
    expectedAmount: number,
    receivedAmount: number
  ): Promise<PaymentReconciliation> {
    const id = `RECON-${settlementId}-${platform}-${Date.now()}`;

    const difference = receivedAmount - expectedAmount;
    const status = Math.abs(difference) < 1 ? 'matched' : 'discrepancy';

    const reconciliation: PaymentReconciliation = {
      id,
      settlementId,
      platform,
      expectedAmount,
      receivedAmount,
      difference,
      status,
    };

    this.reconciliations.set(id, reconciliation);
    return reconciliation;
  }

  async getReconciliation(reconciliationId: string): Promise<PaymentReconciliation | null> {
    return this.reconciliations.get(reconciliationId) || null;
  }

  async getReconciliationsBySettlement(settlementId: string): Promise<PaymentReconciliation[]> {
    return Array.from(this.reconciliations.values()).filter((r) => r.settlementId === settlementId);
  }

  async resolveDiscrepancy(reconciliationId: string, notes: string): Promise<PaymentReconciliation | null> {
    const reconciliation = this.reconciliations.get(reconciliationId);
    if (!reconciliation) return null;

    reconciliation.status = 'matched';
    reconciliation.notes = notes;
    reconciliation.resolvedAt = new Date();

    this.reconciliations.set(reconciliationId, reconciliation);
    return reconciliation;
  }

  /**
   * Reports
   */

  async getMonthlyReport(month: string): Promise<any> {
    const settlements = await this.getSettlementsByMonth(month);
    const settlement = settlements[0];

    if (!settlement) return null;

    const invoices = await this.getInvoicesBySettlement(settlement.id);
    const reconciliations = await this.getReconciliationsBySettlement(settlement.id);

    return {
      month,
      settlement,
      invoices,
      reconciliations,
      summary: {
        totalOrders: Object.values(settlement.platforms).reduce((sum, p) => sum + p.totalOrders, 0),
        totalOrderAmount: Object.values(settlement.platforms).reduce((sum, p) => sum + p.totalOrderAmount, 0),
        totalCommission: settlement.totalCommission,
        totalTaxes: settlement.totalTaxes,
        totalNetAmount: settlement.totalNetAmount,
        platformBreakdown: Object.entries(settlement.platforms).map(([platform, commission]) => ({
          platform,
          orders: commission.totalOrders,
          commission: commission.totalCommission,
          taxes: commission.totalTaxes,
          net: commission.totalNetAmount,
        })),
      },
    };
  }

  async getPlatformReport(platform: Platform, month: string): Promise<any> {
    const orders = await this.getOrdersByMonth(month, platform);
    const commission = await this.calculatePlatformCommission(platform, month);

    return {
      platform,
      month,
      orders,
      commission,
      detailedBreakdown: {
        totalOrders: orders.length,
        totalOrderAmount: commission.totalOrderAmount,
        commissionRate: commission.averageCommissionRate,
        totalCommission: commission.totalCommission,
        totalTaxes: commission.totalTaxes,
        totalNetAmount: commission.totalNetAmount,
        topOrderDays: this.getTopOrderDays(orders),
        averageOrderValue: commission.totalOrderAmount / orders.length,
      },
    };
  }

  private getTopOrderDays(orders: Order[]): Array<{ date: string; count: number; amount: number }> {
    const dayMap: Record<string, { count: number; amount: number }> = {};

    for (const order of orders) {
      const dateStr = order.orderDate.toISOString().split('T')[0];
      if (!dayMap[dateStr]) {
        dayMap[dateStr] = { count: 0, amount: 0 };
      }
      dayMap[dateStr].count++;
      dayMap[dateStr].amount += order.orderAmount;
    }

    return Object.entries(dayMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Analytics
   */

  async getSettlementAnalytics(): Promise<any> {
    const allSettlements = await this.getAllSettlements();
    const totalSettlements = allSettlements.length;
    const settledAmount = allSettlements
      .filter((s) => s.status === 'settled')
      .reduce((sum, s) => sum + s.totalNetAmount, 0);

    const platformTotals: Record<Platform, number> = {
      swiggy: 0,
      zomato: 0,
      uber_eats: 0,
    };

    for (const settlement of allSettlements) {
      for (const [platform, commission] of Object.entries(settlement.platforms)) {
        platformTotals[platform as Platform] += commission.totalNetAmount;
      }
    }

    return {
      totalSettlements,
      settledAmount,
      pendingAmount: allSettlements
        .filter((s) => s.status !== 'settled')
        .reduce((sum, s) => sum + s.totalNetAmount, 0),
      platformTotals,
      averageSettlementAmount: totalSettlements > 0 ? settledAmount / totalSettlements : 0,
      settlementStatus: {
        pending: allSettlements.filter((s) => s.status === 'pending').length,
        calculated: allSettlements.filter((s) => s.status === 'calculated').length,
        approved: allSettlements.filter((s) => s.status === 'approved').length,
        settled: allSettlements.filter((s) => s.status === 'settled').length,
        failed: allSettlements.filter((s) => s.status === 'failed').length,
      },
    };
  }

  /**
   * Cleanup
   */

  async cleanupOldData(ageMonths: number = 12): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - ageMonths);

    let deletedCount = 0;

    for (const [id, order] of this.orders.entries()) {
      if (order.orderDate < cutoffDate) {
        this.orders.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

export default CommissionSettlementService;
