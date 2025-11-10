import { v4 as uuidv4 } from "uuid";

export interface Reservation {
  id: string;
  cafeId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  reservationTime: Date;
  specialRequests?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show";
  confirmationSent: boolean;
  reminderSent: boolean;
  tableAssigned?: string;
  actualArrivalTime?: Date;
  actualDepartureTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationSlot {
  time: string;
  available: boolean;
  capacity: number;
  reserved: number;
}

export interface CafeCapacity {
  cafeId: string;
  totalCapacity: number;
  tableConfigurations: {
    [key: string]: number; // table name -> capacity
  };
}

export class ReservationManager {
  private reservations: Map<string, Reservation> = new Map();
  private cafeCapacities: Map<string, CafeCapacity> = new Map();

  /**
   * Initialize cafe capacity
   */
  initializeCafeCapacity(
    cafeId: string,
    totalCapacity: number,
    tableConfigurations: { [key: string]: number }
  ): void {
    this.cafeCapacities.set(cafeId, {
      cafeId,
      totalCapacity,
      tableConfigurations,
    });
  }

  /**
   * Get available time slots for a given date
   */
  getAvailableSlots(
    cafeId: string,
    date: Date,
    slotDurationMinutes: number = 90
  ): ReservationSlot[] {
    const capacity = this.cafeCapacities.get(cafeId);
    if (!capacity) {
      throw new Error(`Cafe ${cafeId} not found`);
    }

    const slots: ReservationSlot[] = [];
    const startHour = 11; // 11 AM
    const endHour = 22; // 10 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);

        // Skip past times
        if (slotTime < new Date()) continue;

        const slotKey = slotTime.toISOString();
        const reserved = this.getReservedCapacityForSlot(cafeId, slotTime, slotDurationMinutes);
        const available = reserved < capacity.totalCapacity;

        slots.push({
          time: slotTime.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          available,
          capacity: capacity.totalCapacity,
          reserved,
        });
      }
    }

    return slots;
  }

  /**
   * Get reserved capacity for a specific time slot
   */
  private getReservedCapacityForSlot(
    cafeId: string,
    slotTime: Date,
    durationMinutes: number
  ): number {
    let reserved = 0;

    this.reservations.forEach((reservation) => {
      if (
        reservation.cafeId === cafeId &&
        reservation.status !== "cancelled" &&
        reservation.status !== "no-show"
      ) {
        const reservationStart = new Date(reservation.reservationTime);
        const reservationEnd = new Date(
          reservationStart.getTime() + durationMinutes * 60000
        );
        const slotEnd = new Date(slotTime.getTime() + durationMinutes * 60000);

        // Check if time slots overlap
        if (reservationStart < slotEnd && slotTime < reservationEnd) {
          reserved += reservation.partySize;
        }
      }
    });

    return reserved;
  }

  /**
   * Create a new reservation
   */
  createReservation(
    cafeId: string,
    customerName: string,
    customerPhone: string,
    partySize: number,
    reservationTime: Date,
    options?: {
      customerId?: string;
      customerEmail?: string;
      specialRequests?: string;
    }
  ): Reservation {
    const id = uuidv4();
    const now = new Date();

    const reservation: Reservation = {
      id,
      cafeId,
      customerId: options?.customerId,
      customerName,
      customerPhone,
      customerEmail: options?.customerEmail,
      partySize,
      reservationTime,
      specialRequests: options?.specialRequests,
      status: "pending",
      confirmationSent: false,
      reminderSent: false,
      createdAt: now,
      updatedAt: now,
    };

    this.reservations.set(id, reservation);
    return reservation;
  }

  /**
   * Get reservation by ID
   */
  getReservation(reservationId: string): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  /**
   * Get all reservations for a cafe on a specific date
   */
  getReservationsForDate(cafeId: string, date: Date): Reservation[] {
    const dateStr = date.toISOString().split("T")[0];
    return Array.from(this.reservations.values()).filter((r) => {
      const rDateStr = r.reservationTime.toISOString().split("T")[0];
      return r.cafeId === cafeId && rDateStr === dateStr;
    });
  }

  /**
   * Update reservation status
   */
  updateReservationStatus(
    reservationId: string,
    status: Reservation["status"]
  ): Reservation | undefined {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return undefined;

    reservation.status = status;
    reservation.updatedAt = new Date();

    this.reservations.set(reservationId, reservation);
    return reservation;
  }

  /**
   * Mark confirmation as sent
   */
  markConfirmationSent(reservationId: string): Reservation | undefined {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return undefined;

    reservation.confirmationSent = true;
    reservation.status = "confirmed";
    reservation.updatedAt = new Date();

    this.reservations.set(reservationId, reservation);
    return reservation;
  }

  /**
   * Mark reminder as sent
   */
  markReminderSent(reservationId: string): Reservation | undefined {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return undefined;

    reservation.reminderSent = true;
    reservation.updatedAt = new Date();

    this.reservations.set(reservationId, reservation);
    return reservation;
  }

  /**
   * Check in a customer
   */
  checkInCustomer(
    reservationId: string,
    tableAssigned: string
  ): Reservation | undefined {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return undefined;

    reservation.status = "completed";
    reservation.tableAssigned = tableAssigned;
    reservation.actualArrivalTime = new Date();
    reservation.updatedAt = new Date();

    this.reservations.set(reservationId, reservation);
    return reservation;
  }

  /**
   * Check out a customer
   */
  checkOutCustomer(reservationId: string): Reservation | undefined {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return undefined;

    reservation.actualDepartureTime = new Date();
    reservation.updatedAt = new Date();

    this.reservations.set(reservationId, reservation);
    return reservation;
  }

  /**
   * Mark reservation as no-show
   */
  markNoShow(reservationId: string): Reservation | undefined {
    const reservation = this.reservations.get(reservationId);
    if (!reservation) return undefined;

    reservation.status = "no-show";
    reservation.updatedAt = new Date();

    this.reservations.set(reservationId, reservation);
    return reservation;
  }

  /**
   * Get reservations needing confirmation (created but not confirmed)
   */
  getReservationsNeedingConfirmation(
    cafeId: string,
    hoursAhead: number = 24
  ): Reservation[] {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return Array.from(this.reservations.values()).filter((r) => {
      return (
        r.cafeId === cafeId &&
        r.status === "pending" &&
        !r.confirmationSent &&
        r.reservationTime <= cutoffTime &&
        r.reservationTime > now
      );
    });
  }

  /**
   * Get reservations needing reminders (confirmed but not reminded)
   */
  getReservationsNeedingReminder(
    cafeId: string,
    minutesBefore: number = 120
  ): Reservation[] {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + minutesBefore * 60 * 1000);

    return Array.from(this.reservations.values()).filter((r) => {
      return (
        r.cafeId === cafeId &&
        r.status === "confirmed" &&
        !r.reminderSent &&
        r.reservationTime <= reminderTime &&
        r.reservationTime > now
      );
    });
  }

  /**
   * Get no-show statistics for a cafe
   */
  getNoShowStats(cafeId: string, days: number = 30): {
    totalReservations: number;
    noShowCount: number;
    noShowRate: number;
    completedCount: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantReservations = Array.from(this.reservations.values()).filter(
      (r) => r.cafeId === cafeId && r.createdAt >= cutoffDate
    );

    const noShowCount = relevantReservations.filter(
      (r) => r.status === "no-show"
    ).length;
    const completedCount = relevantReservations.filter(
      (r) => r.status === "completed"
    ).length;

    return {
      totalReservations: relevantReservations.length,
      noShowCount,
      noShowRate:
        relevantReservations.length > 0
          ? (noShowCount / relevantReservations.length) * 100
          : 0,
      completedCount,
    };
  }

  /**
   * Get reservation analytics
   */
  getReservationAnalytics(cafeId: string, days: number = 30): {
    totalReservations: number;
    averagePartySize: number;
    peakHours: string[];
    occupancyRate: number;
    customerRetention: number;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const relevantReservations = Array.from(this.reservations.values()).filter(
      (r) => r.cafeId === cafeId && r.createdAt >= cutoffDate
    );

    const totalPartySize = relevantReservations.reduce(
      (sum, r) => sum + r.partySize,
      0
    );
    const averagePartySize =
      relevantReservations.length > 0
        ? totalPartySize / relevantReservations.length
        : 0;

    // Calculate peak hours
    const hourCounts: { [key: string]: number } = {};
    relevantReservations.forEach((r) => {
      const hour = r.reservationTime.getHours();
      const hourStr = `${hour}:00`;
      hourCounts[hourStr] = (hourCounts[hourStr] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => hour);

    const completedReservations = relevantReservations.filter(
      (r) => r.status === "completed"
    );
    const occupancyRate =
      relevantReservations.length > 0
        ? (completedReservations.length / relevantReservations.length) * 100
        : 0;

    // Calculate customer retention (repeat customers)
    const customerPhones = new Set<string>();
    const repeatCustomers = new Set<string>();

    relevantReservations.forEach((r) => {
      if (customerPhones.has(r.customerPhone)) {
        repeatCustomers.add(r.customerPhone);
      }
      customerPhones.add(r.customerPhone);
    });

    const customerRetention =
      customerPhones.size > 0
        ? (repeatCustomers.size / customerPhones.size) * 100
        : 0;

    return {
      totalReservations: relevantReservations.length,
      averagePartySize: Math.round(averagePartySize * 10) / 10,
      peakHours,
      occupancyRate: Math.round(occupancyRate),
      customerRetention: Math.round(customerRetention),
    };
  }
}

export const reservationManager = new ReservationManager();
