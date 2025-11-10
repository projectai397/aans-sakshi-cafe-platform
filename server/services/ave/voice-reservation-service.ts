/**
 * AVE Voice Reservation Service
 * Handles table reservations placed via voice calls
 * Integrates with table management and booking systems
 */

import { Entity, EntityType, IntentResult } from './nlp-service';

export interface VoiceReservation {
  reservationId: string;
  callId: string;
  customerId?: string;
  customerPhone: string;
  customerName?: string;
  date: Date;
  time: string;
  partySize: number;
  tableId?: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  confirmedAt?: Date;
}

export interface AvailableSlot {
  time: string;
  availableTables: number;
  capacity: number;
}

export interface TableInfo {
  tableId: string;
  capacity: number;
  location: string;
  available: boolean;
}

/**
 * Voice Reservation Service Class
 */
export class VoiceReservationService {
  private activeReservations: Map<string, VoiceReservation> = new Map();

  // Mock table data
  private tables: TableInfo[] = [
    { tableId: 'T1', capacity: 2, location: 'window', available: true },
    { tableId: 'T2', capacity: 2, location: 'center', available: true },
    { tableId: 'T3', capacity: 4, location: 'corner', available: true },
    { tableId: 'T4', capacity: 4, location: 'center', available: true },
    { tableId: 'T5', capacity: 6, location: 'private', available: true },
    { tableId: 'T6', capacity: 8, location: 'private', available: true },
  ];

  // Business hours
  private businessHours = {
    open: '11:00',
    close: '22:00',
    slots: ['11:00', '12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'],
  };

  /**
   * Process reservation from voice transcription
   */
  async processReservationFromVoice(
    intentResult: IntentResult,
    callId: string
  ): Promise<{ reservation: VoiceReservation | null; response: string }> {
    console.log(`[AVE Voice Reservation] Processing reservation for call ${callId}`);

    // Extract entities
    const dateEntity = intentResult.entities.find((e) => e.type === EntityType.DATE);
    const timeEntity = intentResult.entities.find((e) => e.type === EntityType.TIME);
    const partySizeEntity = intentResult.entities.find(
      (e) => e.type === EntityType.PARTY_SIZE
    );

    // Get or create reservation
    let reservation = this.activeReservations.get(callId);
    if (!reservation) {
      reservation = this.createNewReservation(callId);
    }

    let response = '';
    const missingInfo: string[] = [];

    // Update reservation with extracted info
    if (dateEntity) {
      reservation.date = this.parseDate(dateEntity.value);
    } else {
      missingInfo.push('date');
    }

    if (timeEntity) {
      reservation.time = this.parseTime(timeEntity.value);
    } else {
      missingInfo.push('time');
    }

    if (partySizeEntity) {
      reservation.partySize = parseInt(partySizeEntity.value);
    } else {
      missingInfo.push('number of guests');
    }

    // Check if all required info is collected
    if (missingInfo.length === 0) {
      // Check availability
      const available = await this.checkAvailability(
        reservation.date,
        reservation.time,
        reservation.partySize
      );

      if (available.length > 0) {
        response = `Great! We have tables available for ${reservation.partySize} people on ${this.formatDate(reservation.date)} at ${reservation.time}. May I have your name and phone number to confirm the reservation?`;
      } else {
        // Suggest alternative times
        const alternatives = await this.suggestAlternativeTimes(
          reservation.date,
          reservation.partySize
        );

        if (alternatives.length > 0) {
          const altTimes = alternatives.slice(0, 3).map((a) => a.time).join(', ');
          response = `I'm sorry, we don't have availability at ${reservation.time}. However, we have tables available at ${altTimes}. Would any of these work for you?`;
        } else {
          response = `I'm sorry, we're fully booked on ${this.formatDate(reservation.date)}. Would you like to try a different date?`;
        }
      }
    } else {
      response = `I'd be happy to help you with a reservation. Could you please provide the ${missingInfo.join(', ')}?`;
    }

    return { reservation, response };
  }

  /**
   * Create new reservation
   */
  private createNewReservation(callId: string): VoiceReservation {
    const reservation: VoiceReservation = {
      reservationId: `RES_${Date.now()}`,
      callId,
      customerPhone: '',
      date: new Date(),
      time: '',
      partySize: 0,
      status: 'pending',
      createdAt: new Date(),
    };

    this.activeReservations.set(callId, reservation);
    return reservation;
  }

  /**
   * Check availability for given date, time, and party size
   */
  async checkAvailability(
    date: Date,
    time: string,
    partySize: number
  ): Promise<AvailableSlot[]> {
    console.log(
      `[AVE Voice Reservation] Checking availability for ${partySize} people at ${time}`
    );

    // Find tables that can accommodate the party size
    const suitableTables = this.tables.filter(
      (table) => table.capacity >= partySize && table.available
    );

    if (suitableTables.length > 0) {
      return [
        {
          time,
          availableTables: suitableTables.length,
          capacity: Math.max(...suitableTables.map((t) => t.capacity)),
        },
      ];
    }

    return [];
  }

  /**
   * Suggest alternative times
   */
  async suggestAlternativeTimes(
    date: Date,
    partySize: number
  ): Promise<AvailableSlot[]> {
    const alternatives: AvailableSlot[] = [];

    for (const time of this.businessHours.slots) {
      const available = await this.checkAvailability(date, time, partySize);
      if (available.length > 0) {
        alternatives.push(available[0]);
      }
    }

    return alternatives;
  }

  /**
   * Confirm reservation
   */
  async confirmReservation(
    callId: string,
    customerInfo: { phone: string; name?: string; specialRequests?: string }
  ): Promise<{ success: boolean; response: string }> {
    const reservation = this.activeReservations.get(callId);
    if (!reservation) {
      return {
        success: false,
        response: 'No active reservation found. Would you like to make a new reservation?',
      };
    }

    // Validate reservation
    if (!reservation.date || !reservation.time || !reservation.partySize) {
      return {
        success: false,
        response: 'I need more information to complete your reservation. Could you provide the date, time, and number of guests?',
      };
    }

    // Check availability one more time
    const available = await this.checkAvailability(
      reservation.date,
      reservation.time,
      reservation.partySize
    );

    if (available.length === 0) {
      return {
        success: false,
        response: 'I\'m sorry, that time slot is no longer available. Would you like to try a different time?',
      };
    }

    // Assign table
    const table = this.assignTable(reservation.partySize);
    if (!table) {
      return {
        success: false,
        response: 'I\'m sorry, we couldn\'t assign a table. Please try again.',
      };
    }

    // Update reservation
    reservation.customerPhone = customerInfo.phone;
    reservation.customerName = customerInfo.name;
    reservation.specialRequests = customerInfo.specialRequests;
    reservation.tableId = table.tableId;
    reservation.status = 'confirmed';
    reservation.confirmedAt = new Date();

    const response = `Perfect! Your reservation is confirmed for ${reservation.partySize} people on ${this.formatDate(reservation.date)} at ${reservation.time}. Reservation ID is ${reservation.reservationId}. Table ${table.tableId} is reserved for you. You'll receive an SMS confirmation shortly. We look forward to seeing you at Sakshi Cafe!`;

    // Save reservation
    await this.saveReservation(reservation);

    // Remove from active reservations
    this.activeReservations.delete(callId);

    return { success: true, response };
  }

  /**
   * Assign suitable table
   */
  private assignTable(partySize: number): TableInfo | null {
    // Find the smallest table that fits the party size
    const suitableTables = this.tables
      .filter((table) => table.capacity >= partySize && table.available)
      .sort((a, b) => a.capacity - b.capacity);

    if (suitableTables.length > 0) {
      const table = suitableTables[0];
      table.available = false;
      return table;
    }

    return null;
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(
    reservationId: string
  ): Promise<{ success: boolean; response: string }> {
    // TODO: Find reservation in database
    console.log(`[AVE Voice Reservation] Cancelling reservation ${reservationId}`);

    return {
      success: true,
      response: `Your reservation ${reservationId} has been cancelled. We hope to see you another time!`,
    };
  }

  /**
   * Modify reservation
   */
  async modifyReservation(
    reservationId: string,
    changes: Partial<VoiceReservation>
  ): Promise<{ success: boolean; response: string }> {
    console.log(`[AVE Voice Reservation] Modifying reservation ${reservationId}`);

    // TODO: Update reservation in database

    return {
      success: true,
      response: `Your reservation has been updated successfully.`,
    };
  }

  /**
   * Parse date from natural language
   */
  private parseDate(dateString: string): Date {
    const today = new Date();
    const normalized = dateString.toLowerCase();

    if (normalized === 'today') {
      return today;
    } else if (normalized === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else if (normalized === 'tonight') {
      return today;
    } else {
      // Try to parse as date
      const parsed = new Date(dateString);
      return isNaN(parsed.getTime()) ? today : parsed;
    }
  }

  /**
   * Parse time from natural language
   */
  private parseTime(timeString: string): string {
    const normalized = timeString.toLowerCase();

    // Extract hour and period (am/pm)
    const match = normalized.match(/(\d{1,2})\s*(am|pm|o'clock)?/);
    if (match) {
      let hour = parseInt(match[1]);
      const period = match[2];

      if (period === 'pm' && hour < 12) {
        hour += 12;
      } else if (period === 'am' && hour === 12) {
        hour = 0;
      }

      return `${hour.toString().padStart(2, '0')}:00`;
    }

    return timeString;
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-IN', options);
  }

  /**
   * Save reservation to database
   */
  private async saveReservation(reservation: VoiceReservation): Promise<void> {
    try {
      console.log('[AVE Voice Reservation] Saving reservation:', reservation.reservationId);

      // TODO: Save to MongoDB
      // await db.collection('reservations').insertOne(reservation);

      // Send SMS confirmation
      await this.sendReservationConfirmation(reservation);
    } catch (error) {
      console.error('[AVE Voice Reservation] Failed to save reservation:', error);
    }
  }

  /**
   * Send reservation confirmation SMS
   */
  private async sendReservationConfirmation(
    reservation: VoiceReservation
  ): Promise<void> {
    console.log(`[AVE Voice Reservation] Sending SMS to ${reservation.customerPhone}`);
    // TODO: Integrate with SMS service
  }

  /**
   * Get active reservations count
   */
  getActiveReservationsCount(): number {
    return this.activeReservations.size;
  }

  /**
   * Get reservation by call ID
   */
  getReservation(callId: string): VoiceReservation | undefined {
    return this.activeReservations.get(callId);
  }
}

// Export singleton instance
export const voiceReservationService = new VoiceReservationService();
