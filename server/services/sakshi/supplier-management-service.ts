/**
 * Supplier Management Portal Service
 * Vendor portal for order placement, invoice tracking, and quality feedback
 */

type SupplierStatus = 'active' | 'inactive' | 'suspended' | 'blacklisted';
type OrderStatus = 'draft' | 'submitted' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue';
type QualityRating = 1 | 2 | 3 | 4 | 5;

interface Supplier {
  id: string;
  name: string;
  category: string; // vegetables, meat, dairy, spices, etc.
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  status: SupplierStatus;
  rating: number; // 0-5
  totalOrders: number;
  totalSpent: number;
  averageDeliveryTime: number; // days
  createdAt: Date;
}

interface SupplierProduct {
  id: string;
  supplierId: string;
  productName: string;
  category: string;
  unit: string; // kg, liter, piece, etc.
  unitPrice: number;
  minimumOrderQuantity: number;
  leadTime: number; // days
  available: boolean;
  lastUpdated: Date;
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  locationId: string;
  orderDate: Date;
  deliveryDate?: Date;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdBy: string;
}

interface Invoice {
  id: string;
  orderId: string;
  supplierId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentDate?: Date;
  paymentMethod?: string;
  notes?: string;
}

interface QualityFeedback {
  id: string;
  supplierId: string;
  orderId: string;
  rating: QualityRating;
  comment: string;
  issues: string[];
  createdAt: Date;
  createdBy: string;
}

interface SupplierAnalytics {
  totalSuppliers: number;
  activeSuppliers: number;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  averageDeliveryTime: number;
  qualityRating: number;
  paymentOnTimeRate: number;
  topSuppliers: Array<{ id: string; name: string; orders: number; spent: number }>;
  supplierPerformance: Array<{ id: string; name: string; rating: number; deliveryTime: number; paymentRate: number }>;
  costTrends: Array<{ month: string; spent: number }>;
}

class SupplierManagementService {
  private suppliers: Map<string, Supplier> = new Map();
  private products: Map<string, SupplierProduct> = new Map();
  private orders: Map<string, PurchaseOrder> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private feedback: Map<string, QualityFeedback> = new Map();

  /**
   * Register supplier
   */
  async registerSupplier(supplier: Omit<Supplier, 'id | createdAt | totalOrders | totalSpent'>): Promise<Supplier> {
    const fullSupplier: Supplier = {
      ...supplier,
      id: `SUPP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      totalOrders: 0,
      totalSpent: 0,
    };

    this.suppliers.set(fullSupplier.id, fullSupplier);
    return fullSupplier;
  }

  /**
   * Get supplier
   */
  async getSupplier(supplierId: string): Promise<Supplier | null> {
    return this.suppliers.get(supplierId) || null;
  }

  /**
   * Get all suppliers
   */
  async getAllSuppliers(status?: SupplierStatus, category?: string): Promise<Supplier[]> {
    let suppliers = Array.from(this.suppliers.values());

    if (status) {
      suppliers = suppliers.filter((s) => s.status === status);
    }

    if (category) {
      suppliers = suppliers.filter((s) => s.category === category);
    }

    return suppliers.sort((a, b) => b.rating - a.rating);
  }

  /**
   * Add supplier product
   */
  async addSupplierProduct(product: Omit<SupplierProduct, 'id | lastUpdated'>): Promise<SupplierProduct> {
    const fullProduct: SupplierProduct = {
      ...product,
      id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastUpdated: new Date(),
    };

    this.products.set(fullProduct.id, fullProduct);
    return fullProduct;
  }

  /**
   * Get supplier products
   */
  async getSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
    return Array.from(this.products.values())
      .filter((p) => p.supplierId === supplierId && p.available)
      .sort((a, b) => a.productName.localeCompare(b.productName));
  }

  /**
   * Create purchase order
   */
  async createPurchaseOrder(order: Omit<PurchaseOrder, 'id | subtotal | tax | totalAmount'>): Promise<PurchaseOrder> {
    const subtotal = order.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.18; // 18% GST
    const totalAmount = subtotal + tax;

    const fullOrder: PurchaseOrder = {
      ...order,
      id: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subtotal,
      tax,
      totalAmount,
    };

    this.orders.set(fullOrder.id, fullOrder);

    // Create invoice
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      orderId: fullOrder.id,
      supplierId: order.supplierId,
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate,
      dueDate,
      amount: totalAmount,
      paidAmount: 0,
      status: 'pending',
    };

    this.invoices.set(invoice.id, invoice);

    // Update supplier stats
    const supplier = this.suppliers.get(order.supplierId);
    if (supplier) {
      supplier.totalOrders++;
      supplier.totalSpent += totalAmount;
    }

    return fullOrder;
  }

  /**
   * Get purchase orders
   */
  async getPurchaseOrders(supplierId?: string, status?: OrderStatus): Promise<PurchaseOrder[]> {
    let orders = Array.from(this.orders.values());

    if (supplierId) {
      orders = orders.filter((o) => o.supplierId === supplierId);
    }

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    return orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, deliveryDate?: Date): Promise<PurchaseOrder> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    order.status = status;
    if (deliveryDate) {
      order.deliveryDate = deliveryDate;

      // Update supplier delivery time
      const supplier = this.suppliers.get(order.supplierId);
      if (supplier && order.orderDate) {
        const deliveryTime = (deliveryDate.getTime() - order.orderDate.getTime()) / (1000 * 60 * 60 * 24);
        supplier.averageDeliveryTime = (supplier.averageDeliveryTime + deliveryTime) / 2;
      }
    }

    return order;
  }

  /**
   * Record payment
   */
  async recordPayment(invoiceId: string, amount: number, paymentMethod: string): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    invoice.paidAmount += amount;

    if (invoice.paidAmount >= invoice.amount) {
      invoice.status = 'paid';
      invoice.paymentDate = new Date();
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    invoice.paymentMethod = paymentMethod;

    return invoice;
  }

  /**
   * Get invoices
   */
  async getInvoices(supplierId?: string, status?: PaymentStatus): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());

    if (supplierId) {
      invoices = invoices.filter((i) => i.supplierId === supplierId);
    }

    if (status) {
      invoices = invoices.filter((i) => i.status === status);
    }

    return invoices.sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
  }

  /**
   * Submit quality feedback
   */
  async submitQualityFeedback(feedback: Omit<QualityFeedback, 'id | createdAt'>): Promise<QualityFeedback> {
    const fullFeedback: QualityFeedback = {
      ...feedback,
      id: `FB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.feedback.set(fullFeedback.id, fullFeedback);

    // Update supplier rating
    const supplier = this.suppliers.get(feedback.supplierId);
    if (supplier) {
      const allFeedback = Array.from(this.feedback.values()).filter((f) => f.supplierId === feedback.supplierId);
      const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;
      supplier.rating = Math.round(avgRating * 10) / 10;
    }

    return fullFeedback;
  }

  /**
   * Get supplier feedback
   */
  async getSupplierFeedback(supplierId: string): Promise<QualityFeedback[]> {
    return Array.from(this.feedback.values())
      .filter((f) => f.supplierId === supplierId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get supplier analytics
   */
  async getSupplierAnalytics(): Promise<SupplierAnalytics> {
    const allSuppliers = Array.from(this.suppliers.values());
    const activeSuppliers = allSuppliers.filter((s) => s.status === 'active').length;
    const allOrders = Array.from(this.orders.values());
    const allInvoices = Array.from(this.invoices.values());

    const totalSpent = allSuppliers.reduce((sum, s) => sum + s.totalSpent, 0);
    const averageOrderValue = allOrders.length > 0 ? totalSpent / allOrders.length : 0;
    const averageDeliveryTime = allSuppliers.filter((s) => s.averageDeliveryTime > 0).length > 0 ? allSuppliers.reduce((sum, s) => sum + s.averageDeliveryTime, 0) / allSuppliers.filter((s) => s.averageDeliveryTime > 0).length : 0;

    const paidInvoices = allInvoices.filter((i) => i.status === 'paid').length;
    const paymentOnTimeRate = allInvoices.length > 0 ? (paidInvoices / allInvoices.length) * 100 : 0;

    const allFeedback = Array.from(this.feedback.values());
    const qualityRating = allFeedback.length > 0 ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length : 0;

    // Top suppliers
    const topSuppliers = allSuppliers
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        name: s.name,
        orders: s.totalOrders,
        spent: s.totalSpent,
      }));

    // Supplier performance
    const supplierPerformance = allSuppliers
      .filter((s) => s.totalOrders > 0)
      .map((s) => {
        const supplierFeedback = allFeedback.filter((f) => f.supplierId === s.id);
        const supplierInvoices = allInvoices.filter((i) => i.supplierId === s.id);
        const paidCount = supplierInvoices.filter((i) => i.status === 'paid').length;
        const paymentRate = supplierInvoices.length > 0 ? (paidCount / supplierInvoices.length) * 100 : 0;

        return {
          id: s.id,
          name: s.name,
          rating: s.rating,
          deliveryTime: Math.round(s.averageDeliveryTime * 10) / 10,
          paymentRate: Math.round(paymentRate),
        };
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);

    // Cost trends (last 12 months)
    const costTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const monthOrders = allOrders.filter((o) => {
        const orderMonth = new Date(o.orderDate);
        return orderMonth.getMonth() === date.getMonth() && orderMonth.getFullYear() === date.getFullYear();
      });

      const monthSpent = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      costTrends.push({
        month: monthYear,
        spent: monthSpent,
      });
    }

    return {
      totalSuppliers: allSuppliers.length,
      activeSuppliers,
      totalOrders: allOrders.length,
      totalSpent: Math.round(totalSpent),
      averageOrderValue: Math.round(averageOrderValue),
      averageDeliveryTime: Math.round(averageDeliveryTime * 10) / 10,
      qualityRating: Math.round(qualityRating * 10) / 10,
      paymentOnTimeRate: Math.round(paymentOnTimeRate),
      topSuppliers,
      supplierPerformance,
      costTrends,
    };
  }

  /**
   * Get supplier scorecard
   */
  async getSupplierScorecard(supplierId: string): Promise<any> {
    const supplier = this.suppliers.get(supplierId);
    if (!supplier) {
      throw new Error(`Supplier ${supplierId} not found`);
    }

    const supplierOrders = Array.from(this.orders.values()).filter((o) => o.supplierId === supplierId);
    const supplierInvoices = Array.from(this.invoices.values()).filter((i) => i.supplierId === supplierId);
    const supplierFeedback = Array.from(this.feedback.values()).filter((f) => f.supplierId === supplierId);

    const paidInvoices = supplierInvoices.filter((i) => i.status === 'paid').length;
    const paymentOnTimeRate = supplierInvoices.length > 0 ? (paidInvoices / supplierInvoices.length) * 100 : 0;

    const avgQuality = supplierFeedback.length > 0 ? supplierFeedback.reduce((sum, f) => sum + f.rating, 0) / supplierFeedback.length : 0;

    return {
      supplierId,
      supplierName: supplier.name,
      status: supplier.status,
      rating: supplier.rating,
      totalOrders: supplierOrders.length,
      totalSpent: supplier.totalSpent,
      averageOrderValue: supplierOrders.length > 0 ? supplier.totalSpent / supplierOrders.length : 0,
      averageDeliveryTime: supplier.averageDeliveryTime,
      paymentOnTimeRate: Math.round(paymentOnTimeRate),
      qualityRating: Math.round(avgQuality * 10) / 10,
      overallScore: Math.round((supplier.rating + avgQuality + paymentOnTimeRate / 100) / 3 * 100) / 100,
    };
  }
}

export default SupplierManagementService;
