/**
 * Mobile Staff App Service
 * Manages shift scheduling, attendance tracking, notifications, and performance dashboard
 */

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  locationId: string;
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: Date;
  profileImage?: string;
}

interface Shift {
  id: string;
  employeeId: string;
  locationId: string;
  date: Date;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: Date;
}

interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  checkInTime?: Date;
  checkOutTime?: Date;
  checkInLocation?: { lat: number; lng: number };
  checkOutLocation?: { lat: number; lng: number };
  notes?: string;
  createdAt: Date;
}

interface StaffNotification {
  id: string;
  employeeId: string;
  type: 'shift_reminder' | 'shift_change' | 'performance_alert' | 'payroll' | 'general';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

interface PerformanceMetrics {
  employeeId: string;
  totalShifts: number;
  completedShifts: number;
  noShowShifts: number;
  attendanceRate: number;
  onTimeRate: number;
  averageRating: number;
  totalHours: number;
  overtimeHours: number;
  lastUpdated: Date;
}

class MobileStaffAppService {
  private staffMembers: Map<string, StaffMember> = new Map();
  private shifts: Map<string, Shift> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private notifications: Map<string, StaffNotification[]> = new Map();
  private performanceMetrics: Map<string, PerformanceMetrics> = new Map();
  private shiftSwapRequests: Map<string, any> = new Map();

  /**
   * Staff Management
   */

  async createStaffMember(staffData: Partial<StaffMember>): Promise<StaffMember> {
    const id = `STAFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const staff: StaffMember = {
      id,
      name: staffData.name || '',
      email: staffData.email || '',
      phone: staffData.phone || '',
      position: staffData.position || '',
      department: staffData.department || '',
      locationId: staffData.locationId || '',
      status: 'active',
      joinDate: new Date(),
      profileImage: staffData.profileImage,
    };

    this.staffMembers.set(id, staff);
    this.performanceMetrics.set(id, {
      employeeId: id,
      totalShifts: 0,
      completedShifts: 0,
      noShowShifts: 0,
      attendanceRate: 0,
      onTimeRate: 0,
      averageRating: 0,
      totalHours: 0,
      overtimeHours: 0,
      lastUpdated: new Date(),
    });

    return staff;
  }

  async getStaffMember(employeeId: string): Promise<StaffMember | null> {
    return this.staffMembers.get(employeeId) || null;
  }

  async getLocationStaff(locationId: string): Promise<StaffMember[]> {
    return Array.from(this.staffMembers.values()).filter((s) => s.locationId === locationId && s.status === 'active');
  }

  async updateStaffMember(employeeId: string, updates: Partial<StaffMember>): Promise<StaffMember | null> {
    const staff = this.staffMembers.get(employeeId);
    if (!staff) return null;

    const updated = { ...staff, ...updates };
    this.staffMembers.set(employeeId, updated);
    return updated;
  }

  /**
   * Shift Management
   */

  async createShift(shiftData: Partial<Shift>): Promise<Shift> {
    const id = `SHIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const shift: Shift = {
      id,
      employeeId: shiftData.employeeId || '',
      locationId: shiftData.locationId || '',
      date: shiftData.date || new Date(),
      startTime: shiftData.startTime || '09:00',
      endTime: shiftData.endTime || '17:00',
      type: shiftData.type || 'morning',
      status: 'scheduled',
      notes: shiftData.notes,
      createdAt: new Date(),
    };

    this.shifts.set(id, shift);
    return shift;
  }

  async getEmployeeShifts(employeeId: string, days: number = 30): Promise<Shift[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return Array.from(this.shifts.values()).filter((s) => s.employeeId === employeeId && s.date >= cutoffDate);
  }

  async getUpcomingShifts(employeeId: string, days: number = 7): Promise<Shift[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return Array.from(this.shifts.values())
      .filter((s) => s.employeeId === employeeId && s.date >= now && s.date <= futureDate && s.status !== 'cancelled')
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getLocationShifts(locationId: string, date: Date): Promise<Shift[]> {
    const dateStr = date.toISOString().split('T')[0];
    const shiftDateStr = (shift: Shift) => shift.date.toISOString().split('T')[0];

    return Array.from(this.shifts.values()).filter((s) => s.locationId === locationId && shiftDateStr(s) === dateStr);
  }

  async updateShiftStatus(shiftId: string, status: Shift['status']): Promise<Shift | null> {
    const shift = this.shifts.get(shiftId);
    if (!shift) return null;

    shift.status = status;
    this.shifts.set(shiftId, shift);

    // Update performance metrics
    if (status === 'completed' || status === 'no_show') {
      await this.updatePerformanceMetrics(shift.employeeId, shift);
    }

    return shift;
  }

  /**
   * Shift Swap Management
   */

  async requestShiftSwap(shiftId: string, requestingEmployeeId: string, targetEmployeeId: string): Promise<any> {
    const shift = this.shifts.get(shiftId);
    if (!shift) return null;

    const swapRequestId = `SWAP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const swapRequest = {
      id: swapRequestId,
      shiftId,
      requestingEmployeeId,
      targetEmployeeId,
      status: 'pending',
      createdAt: new Date(),
      respondedAt: null,
    };

    this.shiftSwapRequests.set(swapRequestId, swapRequest);

    // Send notification to target employee
    await this.sendNotification(targetEmployeeId, {
      type: 'shift_change',
      title: 'Shift Swap Request',
      message: `${requestingEmployeeId} is requesting to swap shifts with you`,
      data: { swapRequestId, shiftId },
    });

    return swapRequest;
  }

  async approveShiftSwap(swapRequestId: string): Promise<any> {
    const swapRequest = this.shiftSwapRequests.get(swapRequestId);
    if (!swapRequest) return null;

    const shift = this.shifts.get(swapRequest.shiftId);
    if (!shift) return null;

    // Swap the employees
    const temp = shift.employeeId;
    shift.employeeId = swapRequest.targetEmployeeId;

    // Update shift
    this.shifts.set(shift.id, shift);

    // Update swap request
    swapRequest.status = 'approved';
    swapRequest.respondedAt = new Date();
    this.shiftSwapRequests.set(swapRequestId, swapRequest);

    // Send notifications
    await this.sendNotification(swapRequest.requestingEmployeeId, {
      type: 'shift_change',
      title: 'Shift Swap Approved',
      message: 'Your shift swap request has been approved',
      data: { shiftId: shift.id },
    });

    return swapRequest;
  }

  async rejectShiftSwap(swapRequestId: string): Promise<any> {
    const swapRequest = this.shiftSwapRequests.get(swapRequestId);
    if (!swapRequest) return null;

    swapRequest.status = 'rejected';
    swapRequest.respondedAt = new Date();
    this.shiftSwapRequests.set(swapRequestId, swapRequest);

    // Send notification
    await this.sendNotification(swapRequest.requestingEmployeeId, {
      type: 'shift_change',
      title: 'Shift Swap Rejected',
      message: 'Your shift swap request has been rejected',
      data: { swapRequestId },
    });

    return swapRequest;
  }

  async getPendingSwapRequests(employeeId: string): Promise<any[]> {
    return Array.from(this.shiftSwapRequests.values()).filter(
      (r) => r.targetEmployeeId === employeeId && r.status === 'pending'
    );
  }

  /**
   * Attendance Tracking
   */

  async checkIn(employeeId: string, latitude?: number, longitude?: number): Promise<Attendance> {
    const id = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance: Attendance = {
      id,
      employeeId,
      date: today,
      status: 'present',
      checkInTime: new Date(),
      checkInLocation: latitude && longitude ? { lat: latitude, lng: longitude } : undefined,
      createdAt: new Date(),
    };

    this.attendance.set(id, attendance);

    // Send notification
    await this.sendNotification(employeeId, {
      type: 'general',
      title: 'Check-In Successful',
      message: `You checked in at ${attendance.checkInTime?.toLocaleTimeString()}`,
      data: { attendanceId: id },
    });

    return attendance;
  }

  async checkOut(employeeId: string, latitude?: number, longitude?: number): Promise<Attendance | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendanceRecord = Array.from(this.attendance.values()).find(
      (a) => a.employeeId === employeeId && a.date.getTime() === today.getTime()
    );

    if (!attendanceRecord) return null;

    attendanceRecord.checkOutTime = new Date();
    attendanceRecord.checkOutLocation = latitude && longitude ? { lat: latitude, lng: longitude } : undefined;

    this.attendance.set(attendanceRecord.id, attendanceRecord);

    // Send notification
    await this.sendNotification(employeeId, {
      type: 'general',
      title: 'Check-Out Successful',
      message: `You checked out at ${attendanceRecord.checkOutTime?.toLocaleTimeString()}`,
      data: { attendanceId: attendanceRecord.id },
    });

    return attendanceRecord;
  }

  async getAttendanceRecord(employeeId: string, date: Date): Promise<Attendance | null> {
    const dateStr = date.toISOString().split('T')[0];

    return (
      Array.from(this.attendance.values()).find(
        (a) => a.employeeId === employeeId && a.date.toISOString().split('T')[0] === dateStr
      ) || null
    );
  }

  async getAttendanceHistory(employeeId: string, days: number = 30): Promise<Attendance[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return Array.from(this.attendance.values())
      .filter((a) => a.employeeId === employeeId && a.date >= cutoffDate)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  /**
   * Notifications
   */

  async sendNotification(employeeId: string, notificationData: Partial<StaffNotification>): Promise<StaffNotification> {
    const id = `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const notification: StaffNotification = {
      id,
      employeeId,
      type: (notificationData.type as any) || 'general',
      title: notificationData.title || '',
      message: notificationData.message || '',
      data: notificationData.data,
      read: false,
      createdAt: new Date(),
    };

    if (!this.notifications.has(employeeId)) {
      this.notifications.set(employeeId, []);
    }

    this.notifications.get(employeeId)!.push(notification);

    // Keep only last 100 notifications per employee
    const notifications = this.notifications.get(employeeId)!;
    if (notifications.length > 100) {
      this.notifications.set(employeeId, notifications.slice(-100));
    }

    return notification;
  }

  async getNotifications(employeeId: string, unreadOnly: boolean = false): Promise<StaffNotification[]> {
    const notifications = this.notifications.get(employeeId) || [];

    if (unreadOnly) {
      return notifications.filter((n) => !n.read);
    }

    return notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    for (const notifications of this.notifications.values()) {
      const notification = notifications.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Performance Metrics
   */

  private async updatePerformanceMetrics(employeeId: string, shift: Shift): Promise<void> {
    const metrics = this.performanceMetrics.get(employeeId);
    if (!metrics) return;

    metrics.totalShifts++;

    if (shift.status === 'completed') {
      metrics.completedShifts++;

      // Calculate hours worked
      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      const [endHour, endMin] = shift.endTime.split(':').map(Number);
      const hoursWorked = (endHour + endMin / 60) - (startHour + startMin / 60);

      metrics.totalHours += hoursWorked;

      // Check if on time (within 5 minutes)
      const attendance = await this.getAttendanceRecord(employeeId, shift.date);
      if (attendance?.checkInTime) {
        const shiftStartTime = new Date(shift.date);
        const [hour, min] = shift.startTime.split(':').map(Number);
        shiftStartTime.setHours(hour, min, 0);

        const lateMinutes = (attendance.checkInTime.getTime() - shiftStartTime.getTime()) / 60000;
        if (lateMinutes <= 5) {
          metrics.onTimeRate = ((metrics.onTimeRate * (metrics.completedShifts - 1) + 100) / metrics.completedShifts);
        } else {
          metrics.onTimeRate = ((metrics.onTimeRate * (metrics.completedShifts - 1)) / metrics.completedShifts);
        }
      }
    } else if (shift.status === 'no_show') {
      metrics.noShowShifts++;
    }

    metrics.attendanceRate = (metrics.completedShifts / metrics.totalShifts) * 100;
    metrics.lastUpdated = new Date();

    this.performanceMetrics.set(employeeId, metrics);
  }

  async getPerformanceMetrics(employeeId: string): Promise<PerformanceMetrics | null> {
    return this.performanceMetrics.get(employeeId) || null;
  }

  async getTeamPerformance(locationId: string): Promise<PerformanceMetrics[]> {
    const staff = await this.getLocationStaff(locationId);
    return staff
      .map((s) => this.performanceMetrics.get(s.id))
      .filter((m) => m !== undefined) as PerformanceMetrics[];
  }

  /**
   * Dashboard Data
   */

  async getDashboardData(employeeId: string): Promise<any> {
    const staff = await this.getStaffMember(employeeId);
    const upcomingShifts = await this.getUpcomingShifts(employeeId, 7);
    const todayAttendance = await this.getAttendanceRecord(employeeId, new Date());
    const unreadNotifications = await this.getNotifications(employeeId, true);
    const performance = await this.getPerformanceMetrics(employeeId);

    return {
      staff,
      upcomingShifts,
      todayAttendance,
      unreadNotifications,
      performance,
      timestamp: new Date(),
    };
  }

  /**
   * Payroll Information
   */

  async getPayrollInfo(employeeId: string, month: string): Promise<any> {
    const shifts = await this.getEmployeeShifts(employeeId, 30);
    const completedShifts = shifts.filter((s) => s.status === 'completed' && s.date.toISOString().startsWith(month));

    let totalHours = 0;
    let overtimeHours = 0;

    for (const shift of completedShifts) {
      const [startHour, startMin] = shift.startTime.split(':').map(Number);
      const [endHour, endMin] = shift.endTime.split(':').map(Number);
      const hoursWorked = (endHour + endMin / 60) - (startHour + startMin / 60);

      totalHours += hoursWorked;

      // Overtime if more than 8 hours per day
      if (hoursWorked > 8) {
        overtimeHours += hoursWorked - 8;
      }
    }

    return {
      employeeId,
      month,
      totalShifts: completedShifts.length,
      totalHours: Math.round(totalHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      baseSalary: 0, // To be populated from payroll system
      allowances: {},
      deductions: {},
      grossSalary: 0,
      netSalary: 0,
    };
  }

  /**
   * Cleanup
   */

  async cleanupOldData(ageHours: number = 720): Promise<number> {
    const cutoffTime = new Date(Date.now() - ageHours * 60 * 60 * 1000);
    let deletedCount = 0;

    // Clean up old attendance records
    for (const [id, record] of this.attendance.entries()) {
      if (record.createdAt < cutoffTime) {
        this.attendance.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

export default MobileStaffAppService;
