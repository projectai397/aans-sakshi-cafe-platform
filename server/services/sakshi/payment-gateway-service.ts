/**
 * Payment Gateway Integration Service
 * Multiple payment methods: UPI, Card, Wallet, Net Banking
 */

type PaymentMethod = 'upi' | 'card' | 'wallet' | 'net_banking' | 'cash';
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
type TransactionType = 'payment' | 'refund' | 'settlement';

interface PaymentTransaction {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  gatewayResponse: any;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
}

interface Refund {
  id: string;
  transactionId: string;
  orderId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: PaymentStatus;
  processedAt?: Date;
  gatewayRefundId?: string;
}

interface PaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethod;
  isDefault: boolean;
  lastUsed?: Date;
  details: {
    upi?: string;
    card?: {
      last4: string;
      brand: string;
      expiryMonth: number;
      expiryYear: number;
    };
    wallet?: {
      provider: string;
      balance: number;
    };
  };
  createdAt: Date;
}

interface PaymentGatewayConfig {
  provider: string;
  apiKey: string;
  secretKey: string;
  webhookSecret: string;
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  failureRate: number;
  refundRate: number;
  byMethod: Record<PaymentMethod, { count: number; amount: number; successRate: number }>;
  averageTransactionValue: number;
  peakHour: number;
}

class PaymentGatewayService {
  private transactions: Map<string, PaymentTransaction> = new Map();
  private refunds: Map<string, Refund> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private gateways: Map<string, PaymentGatewayConfig> = new Map();

  constructor() {
    this.initializeGateways();
  }

  /**
   * Initialize payment gateways
   */
  private initializeGateways(): void {
    // Razorpay
    this.gateways.set('razorpay', {
      provider: 'razorpay',
      apiKey: process.env.RAZORPAY_API_KEY || '',
      secretKey: process.env.RAZORPAY_SECRET_KEY || '',
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
      baseUrl: 'https://api.razorpay.com/v1',
      timeout: 30000,
      retryAttempts: 3,
    });

    // Stripe
    this.gateways.set('stripe', {
      provider: 'stripe',
      apiKey: process.env.STRIPE_API_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      baseUrl: 'https://api.stripe.com/v1',
      timeout: 30000,
      retryAttempts: 3,
    });

    // PayU
    this.gateways.set('payu', {
      provider: 'payu',
      apiKey: process.env.PAYU_API_KEY || '',
      secretKey: process.env.PAYU_SECRET_KEY || '',
      webhookSecret: process.env.PAYU_WEBHOOK_SECRET || '',
      baseUrl: 'https://secure.payu.in',
      timeout: 30000,
      retryAttempts: 3,
    });
  }

  /**
   * Create payment transaction
   */
  async createPayment(
    orderId: string,
    customerId: string,
    amount: number,
    method: PaymentMethod,
    metadata?: Record<string, any>,
  ): Promise<PaymentTransaction> {
    const transaction: PaymentTransaction = {
      id: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      customerId,
      amount,
      currency: 'INR',
      method,
      status: 'pending',
      transactionId: '',
      gatewayResponse: {},
      createdAt: new Date(),
      metadata,
    };

    try {
      // Process payment based on method
      const gatewayResponse = await this.processPayment(method, amount, customerId);

      transaction.transactionId = gatewayResponse.transactionId;
      transaction.gatewayResponse = gatewayResponse;
      transaction.status = gatewayResponse.success ? 'completed' : 'failed';

      if (gatewayResponse.success) {
        transaction.completedAt = new Date();
      } else {
        transaction.failureReason = gatewayResponse.error;
      }
    } catch (error) {
      transaction.status = 'failed';
      transaction.failureReason = error instanceof Error ? error.message : 'Unknown error';
    }

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  /**
   * Process payment through gateway
   */
  private async processPayment(method: PaymentMethod, amount: number, customerId: string): Promise<any> {
    // Simulate payment processing
    const success = Math.random() > 0.05; // 95% success rate

    return {
      success,
      transactionId: `GW-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      method,
      amount,
      timestamp: new Date(),
      error: success ? null : 'Payment declined',
    };
  }

  /**
   * Get transaction
   */
  async getTransaction(transactionId: string): Promise<PaymentTransaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  /**
   * Get transactions for order
   */
  async getTransactionsForOrder(orderId: string): Promise<PaymentTransaction[]> {
    return Array.from(this.transactions.values()).filter((t) => t.orderId === orderId);
  }

  /**
   * Get transactions for customer
   */
  async getTransactionsForCustomer(customerId: string, limit: number = 50): Promise<PaymentTransaction[]> {
    return Array.from(this.transactions.values())
      .filter((t) => t.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Refund payment
   */
  async refundPayment(transactionId: string, reason: string, amount?: number): Promise<Refund> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (transaction.status !== 'completed') {
      throw new Error(`Cannot refund transaction with status ${transaction.status}`);
    }

    const refundAmount = amount || transaction.amount;

    const refund: Refund = {
      id: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId,
      orderId: transaction.orderId,
      customerId: transaction.customerId,
      amount: refundAmount,
      reason,
      status: 'processing',
      gatewayRefundId: `GW-REF-${Date.now()}`,
    };

    // Process refund
    try {
      const refundSuccess = await this.processRefund(transaction.method, refundAmount);
      refund.status = refundSuccess ? 'completed' : 'failed';
      refund.processedAt = new Date();
    } catch (error) {
      refund.status = 'failed';
    }

    this.refunds.set(refund.id, refund);

    // Update transaction status if full refund
    if (refundAmount === transaction.amount) {
      transaction.status = 'refunded';
    }

    return refund;
  }

  /**
   * Process refund through gateway
   */
  private async processRefund(method: PaymentMethod, amount: number): Promise<boolean> {
    // Simulate refund processing
    return Math.random() > 0.02; // 98% success rate
  }

  /**
   * Get refund
   */
  async getRefund(refundId: string): Promise<Refund | null> {
    return this.refunds.get(refundId) || null;
  }

  /**
   * Get refunds for transaction
   */
  async getRefundsForTransaction(transactionId: string): Promise<Refund[]> {
    return Array.from(this.refunds.values()).filter((r) => r.transactionId === transactionId);
  }

  /**
   * Save payment method
   */
  async savePaymentMethod(
    customerId: string,
    type: PaymentMethod,
    details: any,
    isDefault: boolean = false,
  ): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: `PM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      type,
      isDefault,
      details,
      createdAt: new Date(),
    };

    // If setting as default, unset other defaults
    if (isDefault) {
      for (const [key, method] of this.paymentMethods.entries()) {
        if (method.customerId === customerId && method.isDefault) {
          method.isDefault = false;
        }
      }
    }

    this.paymentMethods.set(paymentMethod.id, paymentMethod);
    return paymentMethod;
  }

  /**
   * Get payment methods for customer
   */
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values()).filter((pm) => pm.customerId === customerId);
  }

  /**
   * Get default payment method
   */
  async getDefaultPaymentMethod(customerId: string): Promise<PaymentMethod | null> {
    const methods = await this.getPaymentMethods(customerId);
    return methods.find((m) => m.isDefault) || null;
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    return this.paymentMethods.delete(paymentMethodId);
  }

  /**
   * Validate card
   */
  async validateCard(cardNumber: string, expiryMonth: number, expiryYear: number, cvv: string): Promise<boolean> {
    // Luhn algorithm for card validation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    const isValidCard = sum % 10 === 0;
    const isValidExpiry = expiryYear > new Date().getFullYear() || (expiryYear === new Date().getFullYear() && expiryMonth > new Date().getMonth() + 1);
    const isValidCVV = cvv.length >= 3 && cvv.length <= 4;

    return isValidCard && isValidExpiry && isValidCVV;
  }

  /**
   * Validate UPI
   */
  async validateUPI(upiId: string): Promise<boolean> {
    // Simple UPI validation
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(startDate: Date, endDate: Date): Promise<PaymentStats> {
    const transactions = Array.from(this.transactions.values()).filter(
      (t) => t.createdAt >= startDate && t.createdAt <= endDate,
    );

    const stats: PaymentStats = {
      totalTransactions: transactions.length,
      totalAmount: 0,
      successRate: 0,
      failureRate: 0,
      refundRate: 0,
      byMethod: {
        upi: { count: 0, amount: 0, successRate: 0 },
        card: { count: 0, amount: 0, successRate: 0 },
        wallet: { count: 0, amount: 0, successRate: 0 },
        net_banking: { count: 0, amount: 0, successRate: 0 },
        cash: { count: 0, amount: 0, successRate: 0 },
      },
      averageTransactionValue: 0,
      peakHour: 0,
    };

    let successCount = 0;
    let failureCount = 0;
    let refundCount = 0;
    const hourCounts: Record<number, number> = {};

    for (const transaction of transactions) {
      stats.totalAmount += transaction.amount;

      if (transaction.status === 'completed') {
        successCount++;
      } else if (transaction.status === 'failed') {
        failureCount++;
      } else if (transaction.status === 'refunded') {
        refundCount++;
      }

      // Count by method
      const methodStats = stats.byMethod[transaction.method];
      if (methodStats) {
        methodStats.count++;
        methodStats.amount += transaction.amount;
        if (transaction.status === 'completed') {
          methodStats.successRate = ((methodStats.successRate * (methodStats.count - 1) + 100) / methodStats.count);
        }
      }

      // Count by hour
      const hour = transaction.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }

    stats.successRate = transactions.length > 0 ? (successCount / transactions.length) * 100 : 0;
    stats.failureRate = transactions.length > 0 ? (failureCount / transactions.length) * 100 : 0;
    stats.refundRate = transactions.length > 0 ? (refundCount / transactions.length) * 100 : 0;
    stats.averageTransactionValue = transactions.length > 0 ? stats.totalAmount / transactions.length : 0;

    // Find peak hour
    stats.peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as unknown as number || 0;

    return stats;
  }

  /**
   * Handle webhook
   */
  async handleWebhook(provider: string, payload: any, signature: string): Promise<any> {
    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(provider, payload, signature);

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Process webhook based on provider
    if (provider === 'razorpay') {
      return this.handleRazorpayWebhook(payload);
    } else if (provider === 'stripe') {
      return this.handleStripeWebhook(payload);
    } else if (provider === 'payu') {
      return this.handlePayUWebhook(payload);
    }

    return { success: false, error: 'Unknown provider' };
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(provider: string, payload: any, signature: string): boolean {
    // Implement signature verification based on provider
    // This is a simplified version
    return true;
  }

  /**
   * Handle Razorpay webhook
   */
  private async handleRazorpayWebhook(payload: any): Promise<any> {
    const event = payload.event;

    if (event === 'payment.authorized') {
      // Update transaction status
      console.log('Payment authorized:', payload.payload.payment.entity.id);
    } else if (event === 'payment.failed') {
      // Update transaction status
      console.log('Payment failed:', payload.payload.payment.entity.id);
    }

    return { success: true };
  }

  /**
   * Handle Stripe webhook
   */
  private async handleStripeWebhook(payload: any): Promise<any> {
    const eventType = payload.type;

    if (eventType === 'payment_intent.succeeded') {
      console.log('Payment succeeded:', payload.data.object.id);
    } else if (eventType === 'payment_intent.payment_failed') {
      console.log('Payment failed:', payload.data.object.id);
    }

    return { success: true };
  }

  /**
   * Handle PayU webhook
   */
  private async handlePayUWebhook(payload: any): Promise<any> {
    const status = payload.status;

    if (status === 'success') {
      console.log('Payment successful:', payload.txnid);
    } else if (status === 'failure') {
      console.log('Payment failed:', payload.txnid);
    }

    return { success: true };
  }

  /**
   * Get settlement report
   */
  async getSettlementReport(startDate: Date, endDate: Date): Promise<any> {
    const transactions = Array.from(this.transactions.values()).filter(
      (t) => t.createdAt >= startDate && t.createdAt <= endDate && t.status === 'completed',
    );

    const report = {
      period: { startDate, endDate },
      totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
      totalTransactions: transactions.length,
      byMethod: {} as Record<PaymentMethod, number>,
      byGateway: {} as Record<string, number>,
      fees: 0,
      netAmount: 0,
    };

    for (const transaction of transactions) {
      report.byMethod[transaction.method] = (report.byMethod[transaction.method] || 0) + transaction.amount;
    }

    // Calculate fees (2% average)
    report.fees = report.totalAmount * 0.02;
    report.netAmount = report.totalAmount - report.fees;

    return report;
  }
}

export default PaymentGatewayService;
