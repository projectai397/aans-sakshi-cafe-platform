/**
 * Delivery Partner Management System
 * Manage delivery fleet with real-time tracking, performance metrics, and payout automation
 */

type PartnerStatus = 'active' | 'inactive' | 'on_leave' | 'suspended' | 'terminated';
type VehicleType = 'bike' | 'scooter' | 'car' | 'cycle' | 'electric';
type DeliveryStatus = 'assigned' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
type PayoutStatus = 'pending' | 'processed' | 'paid' | 'failed';

interface DeliveryPartner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: PartnerStatus;
  joinDate: Date;
  bankAccount: {
    accountNumber: string;
    accountHolder: string;
    ifscCode: string;
    bankName: string;
  };
  vehicle: {
    type: VehicleType;
    registrationNumber: string;
    insuranceExpiry: Date;
  };
  documents: {
    aadhar: string;
    panCard: string;
    drivingLicense: string;
    licenseExpiry: Date;
  };
  serviceAreas: string[]; // location IDs
  rating: number; // 1-5
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number; // minutes
  acceptanceRate: number; // percentage
  cancellationRate: number; // percentage
  onlineHours: number; // per week
  totalEarnings: number;
  lastActive: Date;
}

interface DeliveryAssignment {
  id: string;
  partnerId: string;
  orderId: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: DeliveryStatus;
  assignedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  estimatedDeliveryTime: number; // minutes
  actualDeliveryTime?: number; // minutes
  distance: number; // km
  fare: number;
  tip?: number;
  rating?: number;
  feedback?: string;
  cancellationReason?: string;
}

interface PartnerPerformance {
  partnerId: string;
  date: Date;
  deliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  averageRating: number;
  earnings: number;
  onlineHours: number;
  acceptanceRate: number;
  cancellationRate: number;
}

interface Payout {
  id: string;
  partnerId: string;
  period: { startDate: Date; endDate: Date };
  totalEarnings: number;
  commissionDeducted: number;
  bonusEarned: number;
  netAmount: number;
  status: PayoutStatus;
  processedAt?: Date;
  transactionId?: string;
}

interface PartnerBonus {
  id: string;
  partnerId: string;
  reason: string;
  amount: number;
  period: { startDate: Date; endDate: Date };
  criteria: {
    minDeliveries?: number;
    minRating?: number;
    minAcceptanceRate?: number;
    maxCancellationRate?: number;
  };
  earnedAt: Date;
}

class DeliveryPartnerService {
  private partners: Map<string, DeliveryPartner> = new Map();
  private assignments: Map<string, DeliveryAssignment> = new Map();
  private performance: Map<string, PartnerPerformance[]> = new Map();
  private payouts: Map<string, Payout> = new Map();
  private bonuses: Map<string, PartnerBonus> = new Map();

  /**
   * Register delivery partner
   */
  async registerPartner(partner: Omit<DeliveryPartner, 'id' | 'rating' | 'totalDeliveries' | 'successfulDeliveries' | 'failedDeliveries' | 'averageDeliveryTime' | 'acceptanceRate' | 'cancellationRate' | 'onlineHours' | 'totalEarnings' | 'lastActive'>): Promise<DeliveryPartner> {
    const fullPartner: DeliveryPartner = {
      ...partner,
      id: `PARTNER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rating: 5,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      averageDeliveryTime: 0,
      acceptanceRate: 100,
      cancellationRate: 0,
      onlineHours: 0,
      totalEarnings: 0,
      lastActive: new Date(),
    };

    this.partners.set(fullPartner.id, fullPartner);
    this.performance.set(fullPartner.id, []);

    return fullPartner;
  }

  /**
   * Get partner
   */
  async getPartner(partnerId: string): Promise<DeliveryPartner | null> {
    return this.partners.get(partnerId) || null;
  }

  /**
   * Get all partners
   */
  async getAllPartners(status?: PartnerStatus): Promise<DeliveryPartner[]> {
    let partners = Array.from(this.partners.values());

    if (status) {
      partners = partners.filter((p) => p.status === status);
    }

    return partners;
  }

  /**
   * Get available partners
   */
  async getAvailablePartners(location: string): Promise<DeliveryPartner[]> {
    return Array.from(this.partners.values()).filter(
      (p) => p.status === 'active' && p.serviceAreas.includes(location),
    );
  }

  /**
   * Update partner status
   */
  async updatePartnerStatus(partnerId: string, status: PartnerStatus): Promise<DeliveryPartner> {
    const partner = this.partners.get(partnerId);
    if (!partner) {
      throw new Error(`Partner ${partnerId} not found`);
    }

    partner.status = status;
    return partner;
  }

  /**
   * Assign delivery
   */
  async assignDelivery(
    partnerId: string,
    orderId: string,
    pickupLocation: string,
    deliveryLocation: string,
    estimatedDeliveryTime: number,
    distance: number,
    fare: number,
  ): Promise<DeliveryAssignment> {
    const partner = await this.getPartner(partnerId);
    if (!partner) {
      throw new Error(`Partner ${partnerId} not found`);
    }

    const assignment: DeliveryAssignment = {
      id: `ASSIGN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      partnerId,
      orderId,
      pickupLocation,
      deliveryLocation,
      status: 'assigned',
      assignedAt: new Date(),
      estimatedDeliveryTime,
      distance,
      fare,
    };

    this.assignments.set(assignment.id, assignment);
    return assignment;
  }

  /**
   * Accept delivery
   */
  async acceptDelivery(assignmentId: string): Promise<DeliveryAssignment> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = 'accepted';
    assignment.acceptedAt = new Date();

    const partner = await this.getPartner(assignment.partnerId);
    if (partner) {
      partner.lastActive = new Date();
    }

    return assignment;
  }

  /**
   * Mark as picked up
   */
  async markPickedUp(assignmentId: string): Promise<DeliveryAssignment> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = 'picked_up';
    assignment.pickedUpAt = new Date();

    return assignment;
  }

  /**
   * Mark as in transit
   */
  async markInTransit(assignmentId: string): Promise<DeliveryAssignment> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = 'in_transit';
    return assignment;
  }

  /**
   * Mark as delivered
   */
  async markDelivered(
    assignmentId: string,
    rating: number,
    feedback?: string,
  ): Promise<DeliveryAssignment> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = 'delivered';
    assignment.deliveredAt = new Date();
    assignment.actualDeliveryTime = Math.round(
      (assignment.deliveredAt.getTime() - assignment.assignedAt.getTime()) / 60000,
    );
    assignment.rating = rating;
    assignment.feedback = feedback;

    // Update partner metrics
    const partner = await this.getPartner(assignment.partnerId);
    if (partner) {
      partner.totalDeliveries++;
      partner.successfulDeliveries++;
      partner.averageDeliveryTime =
        (partner.averageDeliveryTime * (partner.totalDeliveries - 1) + assignment.actualDeliveryTime) /
        partner.totalDeliveries;
      partner.rating = (partner.rating * (partner.totalDeliveries - 1) + rating) / partner.totalDeliveries;
      partner.totalEarnings += assignment.fare + (assignment.tip || 0);
      partner.lastActive = new Date();
    }

    return assignment;
  }

  /**
   * Mark as failed
   */
  async markFailed(assignmentId: string, reason: string): Promise<DeliveryAssignment> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = 'failed';
    assignment.cancellationReason = reason;

    // Update partner metrics
    const partner = await this.getPartner(assignment.partnerId);
    if (partner) {
      partner.totalDeliveries++;
      partner.failedDeliveries++;
    }

    return assignment;
  }

  /**
   * Cancel delivery
   */
  async cancelDelivery(assignmentId: string, reason: string): Promise<DeliveryAssignment> {
    const assignment = this.assignments.get(assignmentId);
    if (!assignment) {
      throw new Error(`Assignment ${assignmentId} not found`);
    }

    assignment.status = 'cancelled';
    assignment.cancellationReason = reason;

    // Update partner metrics
    const partner = await this.getPartner(assignment.partnerId);
    if (partner) {
      partner.totalDeliveries++;
      partner.failedDeliveries++;
    }

    return assignment;
  }

  /**
   * Get assignment
   */
  async getAssignment(assignmentId: string): Promise<DeliveryAssignment | null> {
    return this.assignments.get(assignmentId) || null;
  }

  /**
   * Get assignments for partner
   */
  async getAssignmentsForPartner(partnerId: string, status?: DeliveryStatus): Promise<DeliveryAssignment[]> {
    let assignments = Array.from(this.assignments.values()).filter((a) => a.partnerId === partnerId);

    if (status) {
      assignments = assignments.filter((a) => a.status === status);
    }

    return assignments.sort((a, b) => b.assignedAt.getTime() - a.assignedAt.getTime());
  }

  /**
   * Record performance
   */
  async recordPerformance(partnerId: string, performance: Omit<PartnerPerformance, 'partnerId'>): Promise<PartnerPerformance> {
    const fullPerformance: PartnerPerformance = {
      ...performance,
      partnerId,
    };

    const partnerPerformance = this.performance.get(partnerId) || [];
    partnerPerformance.push(fullPerformance);
    this.performance.set(partnerId, partnerPerformance);

    // Update partner metrics
    const partner = await this.getPartner(partnerId);
    if (partner) {
      partner.onlineHours += performance.onlineHours;
      partner.acceptanceRate = performance.acceptanceRate;
      partner.cancellationRate = performance.cancellationRate;
    }

    return fullPerformance;
  }

  /**
   * Get performance
   */
  async getPerformance(partnerId: string, days: number = 30): Promise<PartnerPerformance[]> {
    const allPerformance = this.performance.get(partnerId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return allPerformance.filter((p) => p.date >= cutoffDate);
  }

  /**
   * Calculate payout
   */
  async calculatePayout(partnerId: string, startDate: Date, endDate: Date): Promise<Payout> {
    const assignments = Array.from(this.assignments.values()).filter(
      (a) =>
        a.partnerId === partnerId &&
        a.status === 'delivered' &&
        a.deliveredAt &&
        a.deliveredAt >= startDate &&
        a.deliveredAt <= endDate,
    );

    const totalEarnings = assignments.reduce((sum, a) => sum + a.fare + (a.tip || 0), 0);
    const commissionDeducted = totalEarnings * 0.2; // 20% commission
    const bonusEarned = await this.calculateBonus(partnerId, startDate, endDate);
    const netAmount = totalEarnings - commissionDeducted + bonusEarned;

    const payout: Payout = {
      id: `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      partnerId,
      period: { startDate, endDate },
      totalEarnings,
      commissionDeducted,
      bonusEarned,
      netAmount,
      status: 'pending',
    };

    this.payouts.set(payout.id, payout);
    return payout;
  }

  /**
   * Calculate bonus
   */
  private async calculateBonus(partnerId: string, startDate: Date, endDate: Date): Promise<number> {
    const performance = await this.getPerformance(partnerId, 30);
    const periodPerformance = performance.filter((p) => p.date >= startDate && p.date <= endDate);

    if (periodPerformance.length === 0) return 0;

    const avgRating = periodPerformance.reduce((sum, p) => sum + p.averageRating, 0) / periodPerformance.length;
    const totalDeliveries = periodPerformance.reduce((sum, p) => sum + p.deliveries, 0);
    const avgAcceptanceRate = periodPerformance.reduce((sum, p) => sum + p.acceptanceRate, 0) / periodPerformance.length;

    let bonus = 0;

    if (totalDeliveries >= 100) bonus += 500;
    if (avgRating >= 4.8) bonus += 300;
    if (avgAcceptanceRate >= 95) bonus += 200;

    return bonus;
  }

  /**
   * Process payout
   */
  async processPayout(payoutId: string): Promise<Payout> {
    const payout = this.payouts.get(payoutId);
    if (!payout) {
      throw new Error(`Payout ${payoutId} not found`);
    }

    // Simulate payout processing
    const success = Math.random() > 0.05; // 95% success rate

    payout.status = success ? 'paid' : 'failed';
    payout.processedAt = new Date();
    payout.transactionId = `TXN-${Date.now()}`;

    return payout;
  }

  /**
   * Get payout
   */
  async getPayout(payoutId: string): Promise<Payout | null> {
    return this.payouts.get(payoutId) || null;
  }

  /**
   * Get payouts for partner
   */
  async getPayoutsForPartner(partnerId: string): Promise<Payout[]> {
    return Array.from(this.payouts.values()).filter((p) => p.partnerId === partnerId);
  }

  /**
   * Get partner analytics
   */
  async getPartnerAnalytics(partnerId: string): Promise<any> {
    const partner = await this.getPartner(partnerId);
    if (!partner) {
      throw new Error(`Partner ${partnerId} not found`);
    }

    const assignments = await this.getAssignmentsForPartner(partnerId);
    const performance = await this.getPerformance(partnerId, 30);

    return {
      partnerId,
      name: partner.name,
      status: partner.status,
      rating: partner.rating.toFixed(2),
      totalDeliveries: partner.totalDeliveries,
      successRate: ((partner.successfulDeliveries / Math.max(1, partner.totalDeliveries)) * 100).toFixed(2),
      averageDeliveryTime: partner.averageDeliveryTime.toFixed(2),
      acceptanceRate: partner.acceptanceRate.toFixed(2),
      cancellationRate: partner.cancellationRate.toFixed(2),
      totalEarnings: partner.totalEarnings.toFixed(2),
      onlineHours: partner.onlineHours,
      lastActive: partner.lastActive,
      monthlyDeliveries: assignments.filter((a) => {
        const month = new Date().getMonth();
        return a.assignedAt.getMonth() === month;
      }).length,
      monthlyEarnings: assignments
        .filter((a) => {
          const month = new Date().getMonth();
          return a.assignedAt.getMonth() === month && a.status === 'delivered';
        })
        .reduce((sum, a) => sum + a.fare + (a.tip || 0), 0)
        .toFixed(2),
    };
  }

  /**
   * Get fleet analytics
   */
  async getFleetAnalytics(): Promise<any> {
    const partners = await this.getAllPartners('active');
    const assignments = Array.from(this.assignments.values());

    const analytics = {
      totalPartners: partners.length,
      activePartners: partners.filter((p) => p.status === 'active').length,
      averageRating: (partners.reduce((sum, p) => sum + p.rating, 0) / Math.max(1, partners.length)).toFixed(2),
      totalDeliveries: assignments.length,
      successfulDeliveries: assignments.filter((a) => a.status === 'delivered').length,
      failedDeliveries: assignments.filter((a) => a.status === 'failed' || a.status === 'cancelled').length,
      averageDeliveryTime: (
        assignments.reduce((sum, a) => sum + (a.actualDeliveryTime || a.estimatedDeliveryTime), 0) /
        Math.max(1, assignments.length)
      ).toFixed(2),
      totalEarnings: partners.reduce((sum, p) => sum + p.totalEarnings, 0).toFixed(2),
      topPerformers: partners
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map((p) => ({ id: p.id, name: p.name, rating: p.rating.toFixed(2) })),
    };

    return analytics;
  }
}

export default DeliveryPartnerService;
