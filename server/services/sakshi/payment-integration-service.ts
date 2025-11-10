/**
 * Payment Gateway Integration Service
 * Support for Stripe, Razorpay, and UPI payments
 */

import Stripe from "stripe";

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  customerId: string;
  paymentMethod: "stripe" | "razorpay" | "upi";
  metadata?: Record<string, string>;
}

interface PaymentResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: Date;
}

interface RefundRequest {
  transactionId: string;
  amount?: number;
  reason?: string;
}

/**
 * Stripe Payment Handler
 */
export class StripePaymentHandler {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2023-10-16",
    });
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(request: PaymentRequest): Promise<any> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to paise
        currency: request.currency.toLowerCase(),
        customer: request.customerId,
        description: `Order ${request.orderId}`,
        metadata: {
          orderId: request.orderId,
          ...request.metadata,
        },
      });

      return {
        success: true,
        clientSecret: intent.client_secret,
        intentId: intent.id,
      };
    } catch (error) {
      console.error("Stripe payment intent creation failed:", error);
      throw error;
    }
  }

  /**
   * Confirm payment
   */
  async confirmPayment(intentId: string): Promise<PaymentResponse> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(intentId);

      return {
        success: intent.status === "succeeded",
        transactionId: intent.id,
        amount: intent.amount / 100,
        status: intent.status === "succeeded" ? "completed" : "failed",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Stripe payment confirmation failed:", error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(request: RefundRequest): Promise<PaymentResponse> {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: request.transactionId,
        amount: request.amount ? Math.round(request.amount * 100) : undefined,
        reason: request.reason as any,
      });

      return {
        success: refund.status === "succeeded",
        transactionId: refund.id,
        amount: refund.amount / 100,
        status: "completed",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Stripe refund failed:", error);
      throw error;
    }
  }

  /**
   * Handle webhook
   */
  async handleWebhook(event: any): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("✅ Payment succeeded:", event.data.object.id);
        // Update order status in database
        break;

      case "payment_intent.payment_failed":
        console.log("❌ Payment failed:", event.data.object.id);
        // Update order status in database
        break;

      case "charge.refunded":
        console.log("💰 Refund processed:", event.data.object.id);
        // Update order status in database
        break;

      default:
        console.log("Unhandled webhook event:", event.type);
    }
  }
}

/**
 * Razorpay Payment Handler
 */
export class RazorpayPaymentHandler {
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = process.env.RAZORPAY_KEY_ID || "";
    this.apiSecret = process.env.RAZORPAY_KEY_SECRET || "";
  }

  /**
   * Create order
   */
  async createOrder(request: PaymentRequest): Promise<any> {
    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(request.amount * 100), // Convert to paise
          currency: request.currency,
          receipt: request.orderId,
          notes: request.metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.description || "Order creation failed");
      }

      return {
        success: true,
        orderId: data.id,
        amount: data.amount / 100,
      };
    } catch (error) {
      console.error("Razorpay order creation failed:", error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<PaymentResponse> {
    try {
      const crypto = require("crypto");

      // Verify signature
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", this.apiSecret)
        .update(body)
        .digest("hex");

      if (expectedSignature !== signature) {
        throw new Error("Invalid payment signature");
      }

      return {
        success: true,
        transactionId: paymentId,
        amount: 0, // Would fetch from database
        status: "completed",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Razorpay payment verification failed:", error);
      throw error;
    }
  }

  /**
   * Process refund
   */
  async processRefund(request: RefundRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(
        `https://api.razorpay.com/v1/payments/${request.transactionId}/refund`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: request.amount ? Math.round(request.amount * 100) : undefined,
            notes: {
              reason: request.reason,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.description || "Refund failed");
      }

      return {
        success: true,
        transactionId: data.id,
        amount: data.amount / 100,
        status: "completed",
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Razorpay refund failed:", error);
      throw error;
    }
  }
}

/**
 * Payment Service (Unified Interface)
 */
export class PaymentService {
  private stripeHandler: StripePaymentHandler;
  private razorpayHandler: RazorpayPaymentHandler;

  constructor() {
    this.stripeHandler = new StripePaymentHandler();
    this.razorpayHandler = new RazorpayPaymentHandler();
  }

  /**
   * Process payment
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    switch (request.paymentMethod) {
      case "stripe":
        return await this.processStripePayment(request);

      case "razorpay":
        return await this.processRazorpayPayment(request);

      case "upi":
        return await this.processUPIPayment(request);

      default:
        throw new Error("Unsupported payment method");
    }
  }

  /**
   * Process Stripe payment
   */
  private async processStripePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const intent = await this.stripeHandler.createPaymentIntent(request);
    // In production, client would complete payment and return intent ID
    return await this.stripeHandler.confirmPayment(intent.intentId);
  }

  /**
   * Process Razorpay payment
   */
  private async processRazorpayPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const order = await this.razorpayHandler.createOrder(request);
    // In production, client would complete payment and return payment ID
    return {
      success: true,
      transactionId: order.orderId,
      amount: order.amount,
      status: "pending",
      timestamp: new Date(),
    };
  }

  /**
   * Process UPI payment
   */
  private async processUPIPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // UPI integration would be similar to Razorpay
    return {
      success: true,
      transactionId: `UPI-${Date.now()}`,
      amount: request.amount,
      status: "pending",
      timestamp: new Date(),
    };
  }

  /**
   * Process refund
   */
  async processRefund(
    paymentMethod: string,
    request: RefundRequest
  ): Promise<PaymentResponse> {
    switch (paymentMethod) {
      case "stripe":
        return await this.stripeHandler.processRefund(request);

      case "razorpay":
        return await this.razorpayHandler.processRefund(request);

      default:
        throw new Error("Unsupported payment method");
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<any> {
    // Implementation would check payment status from respective gateway
    return {
      transactionId,
      status: "completed",
      timestamp: new Date(),
    };
  }

  /**
   * Handle payment webhook
   */
  async handleWebhook(source: string, event: any): Promise<void> {
    switch (source) {
      case "stripe":
        await this.stripeHandler.handleWebhook(event);
        break;

      case "razorpay":
        // Handle Razorpay webhook
        console.log("Razorpay webhook:", event);
        break;

      default:
        console.log("Unknown webhook source:", source);
    }
  }
}

/**
 * Payment reconciliation service
 */
export class PaymentReconciliation {
  /**
   * Reconcile payments with orders
   */
  async reconcilePayments(): Promise<any> {
    const unreconciled = await this.getUnreconciledPayments();

    for (const payment of unreconciled) {
      try {
        const status = await this.getPaymentStatus(payment.transactionId);

        if (status.status === "completed") {
          // Update order as paid
          console.log(`✅ Payment ${payment.transactionId} reconciled`);
        } else if (status.status === "failed") {
          // Mark order as payment failed
          console.log(`❌ Payment ${payment.transactionId} failed`);
        }
      } catch (error) {
        console.error(`Error reconciling payment ${payment.transactionId}:`, error);
      }
    }
  }

  /**
   * Get unreconciled payments
   */
  private async getUnreconciledPayments(): Promise<any[]> {
    // Query database for unreconciled payments
    return [];
  }

  /**
   * Get payment status
   */
  private async getPaymentStatus(transactionId: string): Promise<any> {
    // Check payment status from gateway
    return { status: "completed" };
  }
}

export default {
  StripePaymentHandler,
  RazorpayPaymentHandler,
  PaymentService,
  PaymentReconciliation,
};
