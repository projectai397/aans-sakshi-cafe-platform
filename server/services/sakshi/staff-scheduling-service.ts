/**
 * Automated Staff Scheduling Service
 * AI-powered shift scheduling based on historical data and staff availability
 */

type ShiftType = 'morning' | 'afternoon' | 'evening' | 'night' | 'full_day';
type ScheduleStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
type StaffRole = 'chef' | 'cook' | 'helper' | 'cashier' | 'manager' | 'delivery';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: StaffRole;
  hourlyRate: number;
  maxHoursPerWeek: number;
  minHoursPerWeek: number;
  availability: Record<string, string[]>; // day -> available hours
  skills: string[];
  certifications: string[];
  performanceRating: number; // 1-5
  status: 'active' | 'inactive' | 'on_leave';
  joinDate: Date;
}

interface Shift {
  id: string;
  date: Date;
  type: ShiftType;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  requiredStaff: number;
  preferredRoles: StaffRole[];
  assignedStaff: Array<{ staffId: string; role: StaffRole }>;
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  createdAt: Date;
}

interface Schedule {
  id: string;
  locationId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  shifts: Shift[];
  totalHours: number;
  totalCost: number;
  status: ScheduleStatus;
  optimizationScore: number; // 0-100
  publishedAt?: Date;
  createdAt: Date;
}

interface HistoricalData {
  date: Date;
  dayOfWeek: string;
  totalOrders: number;
  peakHour: string;
  peakOrderCount: number;
  avgOrderValue: number;
  requiredStaff: number;
  actualStaff: number;
  laborCost: number;
  efficiency: number; // orders per staff hour
}

interface SchedulingConstraint {
  id: string;
  type: 'max_hours' | 'min_hours' | 'consecutive_days' | 'rest_days' | 'skill_requirement';
  staffId?: string;
  value: number;
  description: string;
}

interface ScheduleOptimization {
  currentSchedule: Schedule;
  optimizedSchedule: Schedule;
  improvements: {
    costSavings: number;
    efficiencySavings: number;
    staffSatisfaction: number;
  };
  recommendations: string[];
}

class StaffSchedulingService {
  private staffMembers: Map<string, StaffMember> = new Map();
  private shifts: Map<string, Shift> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private historicalData: HistoricalData[] = [];
  private constraints: Map<string, SchedulingConstraint> = new Map();

  /**
   * Staff Member Management
   */

  async addStaffMember(staffData: Partial<StaffMember>): Promise<StaffMember> {
    const id = staffData.id || `STAFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const staff: StaffMember = {
      id,
      name: staffData.name || '',
      email: staffData.email || '',
      phone: staffData.phone || '',
      role: staffData.role || 'helper',
      hourlyRate: staffData.hourlyRate || 200,
      maxHoursPerWeek: staffData.maxHoursPerWeek || 48,
      minHoursPerWeek: staffData.minHoursPerWeek || 20,
      availability: staffData.availability || {},
      skills: staffData.skills || [],
      certifications: staffData.certifications || [],
      performanceRating: staffData.performanceRating || 3,
      status: 'active',
      joinDate: new Date(),
    };

    this.staffMembers.set(id, staff);
    return staff;
  }

  async getStaffMember(staffId: string): Promise<StaffMember | null> {
    return this.staffMembers.get(staffId) || null;
  }

  async getActiveStaff(): Promise<StaffMember[]> {
    return Array.from(this.staffMembers.values()).filter((s) => s.status === 'active');
  }

  async getStaffByRole(role: StaffRole): Promise<StaffMember[]> {
    return Array.from(this.staffMembers.values()).filter((s) => s.role === role && s.status === 'active');
  }

  /**
   * Historical Data Management
   */

  async addHistoricalData(data: HistoricalData): Promise<void> {
    this.historicalData.push(data);
  }

  async getHistoricalDataByDayOfWeek(dayOfWeek: string): Promise<HistoricalData[]> {
    return this.historicalData.filter((d) => d.dayOfWeek === dayOfWeek);
  }

  async getAverageMetrics(dayOfWeek: string): Promise<any> {
    const data = this.getHistoricalDataByDayOfWeek(dayOfWeek);

    if (data.length === 0) {
      return {
        avgOrders: 0,
        avgStaffRequired: 0,
        peakHour: '12:00',
        avgLaborCost: 0,
        avgEfficiency: 0,
      };
    }

    const avgOrders = data.reduce((sum, d) => sum + d.totalOrders, 0) / data.length;
    const avgStaffRequired = data.reduce((sum, d) => sum + d.requiredStaff, 0) / data.length;
    const avgLaborCost = data.reduce((sum, d) => sum + d.laborCost, 0) / data.length;
    const avgEfficiency = data.reduce((sum, d) => sum + d.efficiency, 0) / data.length;

    return {
      avgOrders: Math.round(avgOrders),
      avgStaffRequired: Math.ceil(avgStaffRequired),
      peakHour: this.getMostCommonPeakHour(data),
      avgLaborCost: Math.round(avgLaborCost),
      avgEfficiency: Math.round(avgEfficiency * 100) / 100,
    };
  }

  private getMostCommonPeakHour(data: HistoricalData[]): string {
    const hourCounts: Record<string, number> = {};

    for (const d of data) {
      hourCounts[d.peakHour] = (hourCounts[d.peakHour] || 0) + 1;
    }

    let maxHour = '12:00';
    let maxCount = 0;

    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > maxCount) {
        maxCount = count;
        maxHour = hour;
      }
    }

    return maxHour;
  }

  /**
   * Shift Management
   */

  async createShift(shiftData: Partial<Shift>): Promise<Shift> {
    const id = shiftData.id || `SHIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const shift: Shift = {
      id,
      date: shiftData.date || new Date(),
      type: shiftData.type || 'full_day',
      startTime: shiftData.startTime || '09:00',
      endTime: shiftData.endTime || '21:00',
      requiredStaff: shiftData.requiredStaff || 5,
      preferredRoles: shiftData.preferredRoles || [],
      assignedStaff: [],
      status: 'open',
      createdAt: new Date(),
    };

    this.shifts.set(id, shift);
    return shift;
  }

  async assignStaffToShift(shiftId: string, staffId: string, role: StaffRole): Promise<Shift | null> {
    const shift = this.shifts.get(shiftId);
    const staff = this.staffMembers.get(staffId);

    if (!shift || !staff) return null;

    shift.assignedStaff.push({ staffId, role });

    if (shift.assignedStaff.length >= shift.requiredStaff) {
      shift.status = 'assigned';
    }

    this.shifts.set(shiftId, shift);
    return shift;
  }

  /**
   * Schedule Generation & Optimization
   */

  async generateOptimalSchedule(locationId: string, weekStartDate: Date): Promise<Schedule> {
    const id = `SCHEDULE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const weekEndDate = new Date(weekStartDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Get active staff
    const activeStaff = await this.getActiveStaff();

    // Generate shifts for the week
    const shifts: Shift[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStartDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

      // Get historical metrics for this day
      const metrics = await this.getAverageMetrics(dayOfWeek);

      // Create shifts based on metrics
      const morningShift = await this.createShift({
        date,
        type: 'morning',
        startTime: '09:00',
        endTime: '13:00',
        requiredStaff: Math.ceil(metrics.avgStaffRequired / 2),
      });

      const eveningShift = await this.createShift({
        date,
        type: 'evening',
        startTime: '17:00',
        endTime: '21:00',
        requiredStaff: Math.ceil(metrics.avgStaffRequired / 2),
      });

      shifts.push(morningShift, eveningShift);
    }

    // Assign staff to shifts using optimization algorithm
    for (const shift of shifts) {
      const bestStaff = this.findBestStaffForShift(shift, activeStaff);

      for (const staff of bestStaff) {
        await this.assignStaffToShift(shift.id, staff.id, staff.role);
      }
    }

    // Calculate schedule metrics
    const totalHours = shifts.reduce((sum, s) => {
      const [startH, startM] = s.startTime.split(':').map(Number);
      const [endH, endM] = s.endTime.split(':').map(Number);
      const hours = (endH - startH) + (endM - startM) / 60;
      return sum + hours * s.assignedStaff.length;
    }, 0);

    const totalCost = shifts.reduce((sum, s) => {
      return (
        sum +
        s.assignedStaff.reduce((shiftSum, assignment) => {
          const staff = this.staffMembers.get(assignment.staffId);
          if (!staff) return shiftSum;

          const [startH, startM] = s.startTime.split(':').map(Number);
          const [endH, endM] = s.endTime.split(':').map(Number);
          const hours = (endH - startH) + (endM - startM) / 60;

          return shiftSum + hours * staff.hourlyRate;
        }, 0)
      );
    }, 0);

    const schedule: Schedule = {
      id,
      locationId,
      weekStartDate,
      weekEndDate,
      shifts,
      totalHours,
      totalCost,
      status: 'draft',
      optimizationScore: this.calculateOptimizationScore(shifts, activeStaff),
      createdAt: new Date(),
    };

    this.schedules.set(id, schedule);
    return schedule;
  }

  private findBestStaffForShift(shift: Shift, staff: StaffMember[]): Array<{ id: string; role: StaffRole }> {
    // Filter staff by availability
    const availableStaff = staff.filter((s) => {
      const dayOfWeek = shift.date.toLocaleDateString('en-US', { weekday: 'long' });
      const availability = s.availability[dayOfWeek] || [];
      return availability.length > 0;
    });

    // Sort by performance rating (descending)
    const sorted = availableStaff.sort((a, b) => b.performanceRating - a.performanceRating);

    // Select top staff for shift
    const selected = sorted.slice(0, shift.requiredStaff);

    return selected.map((s) => ({
      id: s.id,
      role: s.role,
    }));
  }

  private calculateOptimizationScore(shifts: Shift[], staff: StaffMember[]): number {
    let score = 100;

    // Deduct for unassigned shifts
    const unassignedCount = shifts.filter((s) => s.status === 'open').length;
    score -= unassignedCount * 5;

    // Bonus for balanced workload
    const staffHours: Record<string, number> = {};
    for (const shift of shifts) {
      for (const assignment of shift.assignedStaff) {
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const hours = (endH - startH) + (endM - startM) / 60;

        staffHours[assignment.staffId] = (staffHours[assignment.staffId] || 0) + hours;
      }
    }

    const avgHours = Object.values(staffHours).reduce((a, b) => a + b, 0) / Object.keys(staffHours).length;
    const variance = Object.values(staffHours).reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / Object.keys(staffHours).length;

    if (variance < 10) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  async publishSchedule(scheduleId: string): Promise<Schedule | null> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) return null;

    schedule.status = 'published';
    schedule.publishedAt = new Date();

    this.schedules.set(scheduleId, schedule);
    return schedule;
  }

  async getSchedule(scheduleId: string): Promise<Schedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  async getSchedulesByLocation(locationId: string): Promise<Schedule[]> {
    return Array.from(this.schedules.values()).filter((s) => s.locationId === locationId);
  }

  /**
   * Optimization & Analytics
   */

  async optimizeSchedule(scheduleId: string): Promise<ScheduleOptimization | null> {
    const currentSchedule = this.schedules.get(scheduleId);
    if (!currentSchedule) return null;

    // Generate optimized version
    const optimizedSchedule = await this.generateOptimalSchedule(currentSchedule.locationId, currentSchedule.weekStartDate);

    // Calculate improvements
    const costSavings = currentSchedule.totalCost - optimizedSchedule.totalCost;
    const efficiencySavings = optimizedSchedule.optimizationScore - currentSchedule.optimizationScore;
    const staffSatisfaction = this.calculateStaffSatisfaction(optimizedSchedule);

    const recommendations = this.generateRecommendations(currentSchedule, optimizedSchedule);

    return {
      currentSchedule,
      optimizedSchedule,
      improvements: {
        costSavings,
        efficiencySavings,
        staffSatisfaction,
      },
      recommendations,
    };
  }

  private calculateStaffSatisfaction(schedule: Schedule): number {
    let satisfaction = 80;

    // Check for reasonable shift distribution
    const staffHours: Record<string, number> = {};
    for (const shift of schedule.shifts) {
      for (const assignment of shift.assignedStaff) {
        const [startH, startM] = shift.startTime.split(':').map(Number);
        const [endH, endM] = shift.endTime.split(':').map(Number);
        const hours = (endH - startH) + (endM - startM) / 60;

        staffHours[assignment.staffId] = (staffHours[assignment.staffId] || 0) + hours;
      }
    }

    // Bonus for balanced hours
    const avgHours = Object.values(staffHours).reduce((a, b) => a + b, 0) / Object.keys(staffHours).length;
    const variance = Object.values(staffHours).reduce((sum, h) => sum + Math.pow(h - avgHours, 2), 0) / Object.keys(staffHours).length;

    if (variance < 5) {
      satisfaction += 15;
    }

    return Math.min(100, satisfaction);
  }

  private generateRecommendations(current: Schedule, optimized: Schedule): string[] {
    const recommendations: string[] = [];

    if (optimized.totalCost < current.totalCost) {
      const savings = Math.round((current.totalCost - optimized.totalCost) / current.totalCost * 100);
      recommendations.push(`Optimized schedule can save ${savings}% on labor costs`);
    }

    if (optimized.optimizationScore > current.optimizationScore) {
      recommendations.push(`Improved schedule optimization score by ${optimized.optimizationScore - current.optimizationScore} points`);
    }

    const unassignedShifts = current.shifts.filter((s) => s.status === 'open').length;
    if (unassignedShifts > 0) {
      recommendations.push(`${unassignedShifts} shifts remain unassigned - consider hiring or adjusting availability`);
    }

    return recommendations;
  }

  async getSchedulingAnalytics(locationId: string): Promise<any> {
    const schedules = await this.getSchedulesByLocation(locationId);
    const publishedSchedules = schedules.filter((s) => s.status === 'published');

    const totalCost = publishedSchedules.reduce((sum, s) => sum + s.totalCost, 0);
    const avgOptimizationScore = publishedSchedules.length > 0 ? publishedSchedules.reduce((sum, s) => sum + s.optimizationScore, 0) / publishedSchedules.length : 0;

    return {
      totalSchedules: schedules.length,
      publishedSchedules: publishedSchedules.length,
      totalLaborCost: totalCost,
      averageOptimizationScore: Math.round(avgOptimizationScore),
      staffCount: this.staffMembers.size,
      activeStaffCount: Array.from(this.staffMembers.values()).filter((s) => s.status === 'active').length,
    };
  }
}

export default StaffSchedulingService;
