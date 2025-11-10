/**
 * Delivery Platform Webhook Integration Service
 * Handles real-time order sync from Swiggy, Zomato, and Uber Eats
 * Features: Order sync, status updates, commission tracking, reconciliation
 */

interface DeliveryOrder {
  id: string;
  platform: 'swiggy' | 'zomato' | 'uber_eats';
  platformOrderId: string;
  locationId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  platformCommission: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  orderTime: Date;
  deliveryTime?: Date;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverLocation?: { lat: number; lng: number };
  estimatedDeliveryTime?: Date;
  notes?: string;
}

interface WebhookPayload {
  event: string;
  timestamp: number;
  data: any;
}

interface PlatformConfig {
  platform: string;
  apiKey: string;
  apiSecret: string;
  webhookUrl: string;
  baseUrl: string;
  locationId: string;
}

class DeliveryWebhookService {
  private orders: Map<string, DeliveryOrder> = new Map();
  private platformConfigs: Map<string, PlatformConfig> = new Map();
  private webhookLogs: Array<any> = [];

  /**
   * Platform Configuration
   */

  async registerPlatform(config: PlatformConfig): Promise<void> {
    this.platformConfigs.set(config.platform, config);
    console.log(`Platform ${config.platform} registered for location ${config.locationId}`);
  }

  async getPlatformConfig(platform: string): Promise<PlatformConfig | null> {
    return this.platformConfigs.get(platform) || null;
  }

  /**
   * Webhook Handlers
   */

  async handleSwiggyWebhook(payload: WebhookPayload): Promise<void> {
    const { event, data } = payload;

    switch (event) {
      case 'order_placed':
        await this.handleSwiggyOrderPlaced(data);
        break;
      case 'order_confirmed':
        await this.handleSwiggyOrderConfirmed(data);
        break;
      case 'order_preparing':
        await this.handleSwiggyOrderPreparing(data);
        break;
      case 'order_ready':
        await this.handleSwiggyOrderReady(data);
        break;
      case 'order_picked_up':
        await this.handleSwiggyOrderPickedUp(data);
        break;
      case 'order_delivered':
        await this.handleSwiggyOrderDelivered(data);
        break;
      case 'order_cancelled':
        await this.handleSwiggyOrderCancelled(data);
        break;
      default:
        console.log(`Unknown Swiggy event: ${event}`);
    }

    this.logWebhook('swiggy', event, payload);
  }

  async handleZomatoWebhook(payload: WebhookPayload): Promise<void> {
    const { event, data } = payload;

    switch (event) {
      case 'order_received':
        await this.handleZomatoOrderReceived(data);
        break;
      case 'order_accepted':
        await this.handleZomatoOrderAccepted(data);
        break;
      case 'order_in_preparation':
        await this.handleZomatoOrderInPreparation(data);
        break;
      case 'order_ready_for_pickup':
        await this.handleZomatoOrderReadyForPickup(data);
        break;
      case 'order_picked_up':
        await this.handleZomatoOrderPickedUp(data);
        break;
      case 'order_delivered':
        await this.handleZomatoOrderDelivered(data);
        break;
      case 'order_cancelled':
        await this.handleZomatoOrderCancelled(data);
        break;
      default:
        console.log(`Unknown Zomato event: ${event}`);
    }

    this.logWebhook('zomato', event, payload);
  }

  async handleUberEatsWebhook(payload: WebhookPayload): Promise<void> {
    const { event, data } = payload;

    switch (event) {
      case 'order.created':
        await this.handleUberEatsOrderCreated(data);
        break;
      case 'order.confirmed':
        await this.handleUberEatsOrderConfirmed(data);
        break;
      case 'order.status_changed':
        await this.handleUberEatsOrderStatusChanged(data);
        break;
      case 'order.delivered':
        await this.handleUberEatsOrderDelivered(data);
        break;
      case 'order.cancelled':
        await this.handleUberEatsOrderCancelled(data);
        break;
      case 'driver_location_updated':
        await this.handleUberEatsDriverLocationUpdated(data);
        break;
      default:
        console.log(`Unknown Uber Eats event: ${event}`);
    }

    this.logWebhook('uber_eats', event, payload);
  }

  /**
   * Swiggy Event Handlers
   */

  private async handleSwiggyOrderPlaced(data: any): Promise<void> {
    const order: DeliveryOrder = {
      id: `SWIGGY-${data.order_id}`,
      platform: 'swiggy',
      platformOrderId: data.order_id,
      locationId: data.restaurant_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      deliveryAddress: data.delivery_address,
      items: data.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: data.subtotal,
      deliveryFee: data.delivery_fee,
      platformCommission: data.commission,
      tax: data.tax,
      totalAmount: data.total,
      status: 'pending',
      orderTime: new Date(data.order_time * 1000),
    };

    this.orders.set(order.id, order);
    console.log(`Swiggy order placed: ${order.id}`);
  }

  private async handleSwiggyOrderConfirmed(data: any): Promise<void> {
    const order = this.orders.get(`SWIGGY-${data.order_id}`);
    if (order) {
      order.status = 'confirmed';
      this.orders.set(order.id, order);
      console.log(`Swiggy order confirmed: ${order.id}`);
    }
  }

  private async handleSwiggyOrderPreparing(data: any): Promise<void> {
    const order = this.orders.get(`SWIGGY-${data.order_id}`);
    if (order) {
      order.status = 'preparing';
      this.orders.set(order.id, order);
      console.log(`Swiggy order preparing: ${order.id}`);
    }
  }

  private async handleSwiggyOrderReady(data: any): Promise<void> {
    const order = this.orders.get(`SWIGGY-${data.order_id}`);
    if (order) {
      order.status = 'ready';
      this.orders.set(order.id, order);
      console.log(`Swiggy order ready: ${order.id}`);
    }
  }

  private async handleSwiggyOrderPickedUp(data: any): Promise<void> {
    const order = this.orders.get(`SWIGGY-${data.order_id}`);
    if (order) {
      order.status = 'out_for_delivery';
      order.driverId = data.delivery_partner_id;
      order.driverName = data.delivery_partner_name;
      order.driverPhone = data.delivery_partner_phone;
      order.estimatedDeliveryTime = new Date(data.estimated_delivery_time * 1000);
      this.orders.set(order.id, order);
      console.log(`Swiggy order picked up: ${order.id}`);
    }
  }

  private async handleSwiggyOrderDelivered(data: any): Promise<void> {
    const order = this.orders.get(`SWIGGY-${data.order_id}`);
    if (order) {
      order.status = 'delivered';
      order.deliveryTime = new Date(data.delivery_time * 1000);
      this.orders.set(order.id, order);
      console.log(`Swiggy order delivered: ${order.id}`);
    }
  }

  private async handleSwiggyOrderCancelled(data: any): Promise<void> {
    const order = this.orders.get(`SWIGGY-${data.order_id}`);
    if (order) {
      order.status = 'cancelled';
      this.orders.set(order.id, order);
      console.log(`Swiggy order cancelled: ${order.id}`);
    }
  }

  /**
   * Zomato Event Handlers
   */

  private async handleZomatoOrderReceived(data: any): Promise<void> {
    const order: DeliveryOrder = {
      id: `ZOMATO-${data.order_id}`,
      platform: 'zomato',
      platformOrderId: data.order_id,
      locationId: data.restaurant_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      deliveryAddress: data.delivery_address,
      items: data.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: data.subtotal,
      deliveryFee: data.delivery_fee,
      platformCommission: data.commission,
      tax: data.tax,
      totalAmount: data.total,
      status: 'pending',
      orderTime: new Date(data.order_time),
    };

    this.orders.set(order.id, order);
    console.log(`Zomato order received: ${order.id}`);
  }

  private async handleZomatoOrderAccepted(data: any): Promise<void> {
    const order = this.orders.get(`ZOMATO-${data.order_id}`);
    if (order) {
      order.status = 'confirmed';
      this.orders.set(order.id, order);
      console.log(`Zomato order accepted: ${order.id}`);
    }
  }

  private async handleZomatoOrderInPreparation(data: any): Promise<void> {
    const order = this.orders.get(`ZOMATO-${data.order_id}`);
    if (order) {
      order.status = 'preparing';
      this.orders.set(order.id, order);
      console.log(`Zomato order in preparation: ${order.id}`);
    }
  }

  private async handleZomatoOrderReadyForPickup(data: any): Promise<void> {
    const order = this.orders.get(`ZOMATO-${data.order_id}`);
    if (order) {
      order.status = 'ready';
      this.orders.set(order.id, order);
      console.log(`Zomato order ready for pickup: ${order.id}`);
    }
  }

  private async handleZomatoOrderPickedUp(data: any): Promise<void> {
    const order = this.orders.get(`ZOMATO-${data.order_id}`);
    if (order) {
      order.status = 'out_for_delivery';
      order.driverId = data.delivery_partner_id;
      order.driverName = data.delivery_partner_name;
      order.driverPhone = data.delivery_partner_phone;
      order.estimatedDeliveryTime = new Date(data.estimated_delivery_time);
      this.orders.set(order.id, order);
      console.log(`Zomato order picked up: ${order.id}`);
    }
  }

  private async handleZomatoOrderDelivered(data: any): Promise<void> {
    const order = this.orders.get(`ZOMATO-${data.order_id}`);
    if (order) {
      order.status = 'delivered';
      order.deliveryTime = new Date(data.delivery_time);
      this.orders.set(order.id, order);
      console.log(`Zomato order delivered: ${order.id}`);
    }
  }

  private async handleZomatoOrderCancelled(data: any): Promise<void> {
    const order = this.orders.get(`ZOMATO-${data.order_id}`);
    if (order) {
      order.status = 'cancelled';
      this.orders.set(order.id, order);
      console.log(`Zomato order cancelled: ${order.id}`);
    }
  }

  /**
   * Uber Eats Event Handlers
   */

  private async handleUberEatsOrderCreated(data: any): Promise<void> {
    const order: DeliveryOrder = {
      id: `UBEREATS-${data.order_id}`,
      platform: 'uber_eats',
      platformOrderId: data.order_id,
      locationId: data.restaurant_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      deliveryAddress: data.delivery_address,
      items: data.items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: data.subtotal,
      deliveryFee: data.delivery_fee,
      platformCommission: data.commission,
      tax: data.tax,
      totalAmount: data.total,
      status: 'pending',
      orderTime: new Date(data.order_time),
    };

    this.orders.set(order.id, order);
    console.log(`Uber Eats order created: ${order.id}`);
  }

  private async handleUberEatsOrderConfirmed(data: any): Promise<void> {
    const order = this.orders.get(`UBEREATS-${data.order_id}`);
    if (order) {
      order.status = 'confirmed';
      this.orders.set(order.id, order);
      console.log(`Uber Eats order confirmed: ${order.id}`);
    }
  }

  private async handleUberEatsOrderStatusChanged(data: any): Promise<void> {
    const order = this.orders.get(`UBEREATS-${data.order_id}`);
    if (order) {
      order.status = data.status;
      this.orders.set(order.id, order);
      console.log(`Uber Eats order status changed: ${order.id} -> ${data.status}`);
    }
  }

  private async handleUberEatsOrderDelivered(data: any): Promise<void> {
    const order = this.orders.get(`UBEREATS-${data.order_id}`);
    if (order) {
      order.status = 'delivered';
      order.deliveryTime = new Date(data.delivery_time);
      this.orders.set(order.id, order);
      console.log(`Uber Eats order delivered: ${order.id}`);
    }
  }

  private async handleUberEatsOrderCancelled(data: any): Promise<void> {
    const order = this.orders.get(`UBEREATS-${data.order_id}`);
    if (order) {
      order.status = 'cancelled';
      this.orders.set(order.id, order);
      console.log(`Uber Eats order cancelled: ${order.id}`);
    }
  }

  private async handleUberEatsDriverLocationUpdated(data: any): Promise<void> {
    const order = this.orders.get(`UBEREATS-${data.order_id}`);
    if (order) {
      order.driverLocation = {
        lat: data.latitude,
        lng: data.longitude,
      };
      this.orders.set(order.id, order);
      console.log(`Uber Eats driver location updated: ${order.id}`);
    }
  }

  /**
   * Order Management
   */

  async getOrder(orderId: string): Promise<DeliveryOrder | null> {
    return this.orders.get(orderId) || null;
  }

  async getLocationOrders(locationId: string, status?: string): Promise<DeliveryOrder[]> {
    const orders = Array.from(this.orders.values()).filter((o) => o.locationId === locationId);
    if (status) {
      return orders.filter((o) => o.status === status);
    }
    return orders;
  }

  async getPlatformOrders(platform: string, locationId: string): Promise<DeliveryOrder[]> {
    return Array.from(this.orders.values()).filter((o) => o.platform === platform && o.locationId === locationId);
  }

  /**
   * Commission & Revenue Tracking
   */

  async getCommissionReport(locationId: string, period: string): Promise<any> {
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const orders = Array.from(this.orders.values()).filter(
      (o) => o.locationId === locationId && o.orderTime >= startDate && o.orderTime <= endDate && o.status === 'delivered'
    );

    const platforms = ['swiggy', 'zomato', 'uber_eats'];
    const report: any = {
      period,
      locationId,
      totalOrders: orders.length,
      totalRevenue: 0,
      totalCommission: 0,
      platformBreakdown: {},
    };

    for (const platform of platforms) {
      const platformOrders = orders.filter((o) => o.platform === platform);
      const platformRevenue = platformOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const platformCommission = platformOrders.reduce((sum, o) => sum + o.platformCommission, 0);

      report.platformBreakdown[platform] = {
        orders: platformOrders.length,
        revenue: platformRevenue,
        commission: platformCommission,
        netRevenue: platformRevenue - platformCommission,
        commissionPercentage: (platformCommission / platformRevenue) * 100,
      };

      report.totalRevenue += platformRevenue;
      report.totalCommission += platformCommission;
    }

    report.netRevenue = report.totalRevenue - report.totalCommission;
    report.averageCommissionPercentage = (report.totalCommission / report.totalRevenue) * 100;

    return report;
  }

  /**
   * Reconciliation
   */

  async reconcileOrders(locationId: string, platform: string): Promise<any> {
    const orders = await this.getPlatformOrders(platform, locationId);

    const reconciliation = {
      platform,
      locationId,
      totalOrders: orders.length,
      deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
      cancelledOrders: orders.filter((o) => o.status === 'cancelled').length,
      pendingOrders: orders.filter((o) => ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      totalCommission: orders.reduce((sum, o) => sum + o.platformCommission, 0),
      discrepancies: [] as any[],
    };

    return reconciliation;
  }

  /**
   * Webhook Logging
   */

  private logWebhook(platform: string, event: string, payload: WebhookPayload): void {
    this.webhookLogs.push({
      platform,
      event,
      timestamp: new Date(),
      payload,
    });

    // Keep only last 1000 logs
    if (this.webhookLogs.length > 1000) {
      this.webhookLogs = this.webhookLogs.slice(-1000);
    }
  }

  async getWebhookLogs(platform?: string, limit: number = 100): Promise<any[]> {
    let logs = this.webhookLogs;
    if (platform) {
      logs = logs.filter((l) => l.platform === platform);
    }
    return logs.slice(-limit);
  }

  /**
   * Health Check
   */

  async healthCheck(): Promise<any> {
    return {
      status: 'healthy',
      platforms: Array.from(this.platformConfigs.keys()),
      totalOrders: this.orders.size,
      webhookLogsCount: this.webhookLogs.length,
      timestamp: new Date(),
    };
  }
}

export default DeliveryWebhookService;
