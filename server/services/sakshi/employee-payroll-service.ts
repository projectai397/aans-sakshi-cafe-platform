/**
 * Employee Management & Payroll Service for Sakshi Cafe
 * Features: Employee profiles, shift management, payroll, performance tracking
 */

// Types
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string; // Chef, Server, Manager, etc.
  department: string;
  salary: number;
  joinDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  locationId: string;
  manager?: string;
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    accountHolder: string;
  };
}

interface Shift {
  id: string;
  employeeId: string;
  locationId: string;
  date: Date;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  status: 'present' | 'absent' | 'half_day' | 'leave';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes: string;
}

interface Payroll {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM
  baseSalary: number;
  allowances: { [key: string]: number }; // HRA, DA, etc.
  deductions: { [key: string]: number }; // Tax, PF, etc.
  bonus: number;
  commission: number;
  grossSalary: number;
  netSalary: number;
  status: 'draft' | 'approved' | 'processed';
  processedDate?: Date;
}

interface Performance {
  employeeId: string;
  month: string;
  salesPerEmployee: number;
  customerSatisfaction: number; // 1-5
  attendanceRate: number; // percentage
  orderAccuracy: number; // percentage
  trainingCompleted: number;
  promotionEligible: boolean;
}

interface Schedule {
  id: string;
  locationId: string;
  month: string; // YYYY-MM
  shifts: Shift[];
  createdDate: Date;
  status: 'draft' | 'published' | 'locked';
}

// Employee & Payroll Service
class EmployeePayrollService {
  private employees: Map<string, Employee> = new Map();
  private shifts: Map<string, Shift> = new Map();
  private attendance: Map<string, Attendance> = new Map();
  private payrolls: Map<string, Payroll> = new Map();
  private schedules: Map<string, Schedule> = new Map();

  /**
   * Employee Management
   */

  async createEmployee(employee: Employee): Promise<Employee> {
    this.employees.set(employee.id, employee);
    return employee;
  }

  async getEmployee(employeeId: string): Promise<Employee | null> {
    return this.employees.get(employeeId) || null;
  }

  async updateEmployee(employeeId: string, updates: Partial<Employee>): Promise<Employee> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    Object.assign(employee, updates);
    this.employees.set(employeeId, employee);
    return employee;
  }

  async getLocationEmployees(locationId: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter((e) => e.locationId === locationId && e.status === 'active');
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter((e) => e.status === 'active');
  }

  /**
   * Shift Management
   */

  async createShift(shift: Shift): Promise<Shift> {
    this.shifts.set(shift.id, shift);
    return shift;
  }

  async getShift(shiftId: string): Promise<Shift | null> {
    return this.shifts.get(shiftId) || null;
  }

  async getEmployeeShifts(employeeId: string, startDate: Date, endDate: Date): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter(
      (s) => s.employeeId === employeeId && s.date >= startDate && s.date <= endDate
    );
  }

  async getLocationShifts(locationId: string, date: Date): Promise<Shift[]> {
    return Array.from(this.shifts.values()).filter((s) => s.locationId === locationId && s.date.toDateString() === date.toDateString());
  }

  async swapShifts(shiftId1: string, shiftId2: string): Promise<void> {
    const shift1 = this.shifts.get(shiftId1);
    const shift2 = this.shifts.get(shiftId2);

    if (!shift1 || !shift2) {
      throw new Error('Shift not found');
    }

    // Swap employee assignments
    const tempEmployeeId = shift1.employeeId;
    shift1.employeeId = shift2.employeeId;
    shift2.employeeId = tempEmployeeId;

    this.shifts.set(shiftId1, shift1);
    this.shifts.set(shiftId2, shift2);
  }

  /**
   * Attendance Tracking
   */

  async markAttendance(employeeId: string, date: Date, status: string): Promise<Attendance> {
    const attendanceId = `ATT-${employeeId}-${date.toISOString().split('T')[0]}`;

    const attendanceRecord: Attendance = {
      id: attendanceId,
      employeeId,
      date,
      status: status as any,
      notes: '',
    };

    if (status === 'present') {
      attendanceRecord.checkInTime = new Date();
    }

    this.attendance.set(attendanceId, attendanceRecord);
    return attendanceRecord;
  }

  async checkOut(employeeId: string, date: Date): Promise<Attendance> {
    const attendanceId = `ATT-${employeeId}-${date.toISOString().split('T')[0]}`;
    const record = this.attendance.get(attendanceId);

    if (!record) {
      throw new Error('Attendance record not found');
    }

    record.checkOutTime = new Date();
    this.attendance.set(attendanceId, record);
    return record;
  }

  async getAttendanceReport(employeeId: string, month: string): Promise<any> {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

    const records = Array.from(this.attendance.values()).filter(
      (a) => a.employeeId === employeeId && a.date >= startDate && a.date <= endDate
    );

    const presentDays = records.filter((r) => r.status === 'present').length;
    const absentDays = records.filter((r) => r.status === 'absent').length;
    const halfDays = records.filter((r) => r.status === 'half_day').length;
    const leaveDays = records.filter((r) => r.status === 'leave').length;

    const attendanceRate = (presentDays + halfDays * 0.5) / (presentDays + absentDays + halfDays + leaveDays);

    return {
      employeeId,
      month,
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      attendanceRate: attendanceRate * 100,
      records,
    };
  }

  /**
   * Payroll Management
   */

  async createPayroll(payroll: Payroll): Promise<Payroll> {
    this.payrolls.set(payroll.id, payroll);
    return payroll;
  }

  async calculatePayroll(employeeId: string, month: string): Promise<Payroll> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const payrollId = `PAY-${employeeId}-${month}`;

    // Get attendance for the month
    const attendanceReport = await this.getAttendanceReport(employeeId, month);

    // Calculate salary components
    const baseSalary = employee.salary;
    const allowances = {
      HRA: baseSalary * 0.1,
      DA: baseSalary * 0.05,
    };

    const deductions: { [key: string]: number } = {};

    // Tax calculation (simplified)
    const grossSalary = baseSalary + Object.values(allowances).reduce((a, b) => a + b, 0);
    deductions['Income Tax'] = grossSalary * 0.1;
    deductions['PF'] = baseSalary * 0.12;

    // Attendance-based deductions
    const absentDeduction = employee.salary * 0.02 * attendanceReport.absentDays;
    deductions['Absent Deduction'] = absentDeduction;

    const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    const netSalary = grossSalary - totalDeductions;

    const payroll: Payroll = {
      id: payrollId,
      employeeId,
      month,
      baseSalary,
      allowances,
      deductions,
      bonus: 0,
      commission: 0,
      grossSalary,
      netSalary,
      status: 'draft',
    };

    return this.createPayroll(payroll);
  }

  async approvePayroll(payrollId: string): Promise<Payroll> {
    const payroll = this.payrolls.get(payrollId);
    if (!payroll) {
      throw new Error('Payroll not found');
    }

    payroll.status = 'approved';
    this.payrolls.set(payrollId, payroll);
    return payroll;
  }

  async processPayroll(payrollId: string): Promise<Payroll> {
    const payroll = this.payrolls.get(payrollId);
    if (!payroll) {
      throw new Error('Payroll not found');
    }

    payroll.status = 'processed';
    payroll.processedDate = new Date();
    this.payrolls.set(payrollId, payroll);
    return payroll;
  }

  async getPayslip(payrollId: string): Promise<any> {
    const payroll = this.payrolls.get(payrollId);
    if (!payroll) {
      throw new Error('Payroll not found');
    }

    const employee = this.employees.get(payroll.employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return {
      payrollId,
      employee: {
        id: employee.id,
        name: employee.name,
        position: employee.position,
      },
      month: payroll.month,
      baseSalary: payroll.baseSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      grossSalary: payroll.grossSalary,
      netSalary: payroll.netSalary,
      processedDate: payroll.processedDate,
    };
  }

  /**
   * Performance Tracking
   */

  async getEmployeePerformance(employeeId: string, month: string): Promise<Performance> {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    const attendanceReport = await this.getAttendanceReport(employeeId, month);

    const performance: Performance = {
      employeeId,
      month,
      salesPerEmployee: 50000, // Placeholder
      customerSatisfaction: 4.5, // Placeholder
      attendanceRate: attendanceReport.attendanceRate,
      orderAccuracy: 95, // Placeholder
      trainingCompleted: 2,
      promotionEligible: attendanceReport.attendanceRate > 90,
    };

    return performance;
  }

  /**
   * Schedule Management
   */

  async createSchedule(schedule: Schedule): Promise<Schedule> {
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async publishSchedule(scheduleId: string): Promise<Schedule> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    schedule.status = 'published';
    this.schedules.set(scheduleId, schedule);
    return schedule;
  }

  async getSchedule(scheduleId: string): Promise<Schedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  /**
   * Analytics
   */

  async getPayrollAnalytics(locationId: string, month: string): Promise<any> {
    const employees = Array.from(this.employees.values()).filter((e) => e.locationId === locationId);

    let totalPayroll = 0;
    let totalAllowances = 0;
    let totalDeductions = 0;

    for (const employee of employees) {
      const payroll = await this.calculatePayroll(employee.id, month);
      totalPayroll += payroll.netSalary;
      totalAllowances += Object.values(payroll.allowances).reduce((a, b) => a + b, 0);
      totalDeductions += Object.values(payroll.deductions).reduce((a, b) => a + b, 0);
    }

    return {
      locationId,
      month,
      totalEmployees: employees.length,
      totalPayroll,
      totalAllowances,
      totalDeductions,
      averageSalary: totalPayroll / employees.length,
    };
  }

  async getStaffingRecommendation(locationId: string): Promise<any> {
    const employees = Array.from(this.employees.values()).filter((e) => e.locationId === locationId);

    return {
      locationId,
      currentStaff: employees.length,
      recommendedStaff: Math.ceil(employees.length * 1.2),
      recommendation: 'Hire additional staff for peak hours',
    };
  }
}

export default EmployeePayrollService;
