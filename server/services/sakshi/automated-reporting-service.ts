/**
 * Automated Reporting Service
 * Scheduled report generation and email delivery
 */

type ReportType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
type ReportFormat = 'pdf' | 'excel' | 'email' | 'dashboard';
type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

interface ReportSchedule {
  id: string;
  name: string;
  type: ReportType;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM format
  recipients: string[]; // Email addresses
  formats: ReportFormat[];
  enabled: boolean;
  createdAt: Date;
  lastRun?: Date;
  nextRun?: Date;
}

interface GeneratedReport {
  id: string;
  scheduleId: string;
  type: ReportType;
  generatedAt: Date;
  status: ReportStatus;
  fileUrl?: string;
  emailSentAt?: Date;
  recipients?: string[];
  errorMessage?: string;
  metrics: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
    customerCount: number;
    orderCount: number;
    averageOrderValue: number;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  sections: Array<{
    title: string;
    type: 'summary' | 'chart' | 'table' | 'metric';
    dataSource: string;
  }>;
  createdAt: Date;
}

class AutomatedReportingService {
  private schedules: Map<string, ReportSchedule> = new Map();
  private reports: Map<string, GeneratedReport> = new Map();
  private templates: Map<string, ReportTemplate> = new Map();
  private reportQueue: Array<{ scheduleId: string; scheduledTime: Date }> = [];

  /**
   * Create report schedule
   */
  async createReportSchedule(schedule: Omit<ReportSchedule, 'id | createdAt | lastRun | nextRun'>): Promise<ReportSchedule> {
    const fullSchedule: ReportSchedule = {
      ...schedule,
      id: `SCHED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      nextRun: this.calculateNextRunTime(schedule),
    };

    this.schedules.set(fullSchedule.id, fullSchedule);

    // Add to queue
    if (fullSchedule.enabled) {
      this.scheduleReportGeneration(fullSchedule);
    }

    return fullSchedule;
  }

  /**
   * Calculate next run time
   */
  private calculateNextRunTime(schedule: Omit<ReportSchedule, 'id | createdAt | lastRun | nextRun'>): Date {
    const [hours, minutes] = schedule.time.split(':').map(Number);
    const nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    if (nextRun <= new Date()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    if (schedule.frequency === 'weekly' && schedule.dayOfWeek !== undefined) {
      while (nextRun.getDay() !== schedule.dayOfWeek) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (schedule.frequency === 'monthly' && schedule.dayOfMonth !== undefined) {
      nextRun.setDate(schedule.dayOfMonth);
      if (nextRun <= new Date()) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }

    return nextRun;
  }

  /**
   * Schedule report generation
   */
  private scheduleReportGeneration(schedule: ReportSchedule): void {
    if (schedule.nextRun) {
      this.reportQueue.push({
        scheduleId: schedule.id,
        scheduledTime: schedule.nextRun,
      });
    }
  }

  /**
   * Get report schedule
   */
  async getReportSchedule(scheduleId: string): Promise<ReportSchedule | null> {
    return this.schedules.get(scheduleId) || null;
  }

  /**
   * Get all report schedules
   */
  async getAllReportSchedules(enabled?: boolean): Promise<ReportSchedule[]> {
    let schedules = Array.from(this.schedules.values());

    if (enabled !== undefined) {
      schedules = schedules.filter((s) => s.enabled === enabled);
    }

    return schedules.sort((a, b) => (a.nextRun?.getTime() || 0) - (b.nextRun?.getTime() || 0));
  }

  /**
   * Update report schedule
   */
  async updateReportSchedule(scheduleId: string, updates: Partial<ReportSchedule>): Promise<ReportSchedule> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    Object.assign(schedule, updates);
    schedule.nextRun = this.calculateNextRunTime(schedule);

    return schedule;
  }

  /**
   * Delete report schedule
   */
  async deleteReportSchedule(scheduleId: string): Promise<void> {
    this.schedules.delete(scheduleId);
    this.reportQueue = this.reportQueue.filter((r) => r.scheduleId !== scheduleId);
  }

  /**
   * Generate report manually
   */
  async generateReportManually(scheduleId: string): Promise<GeneratedReport> {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    const report: GeneratedReport = {
      id: `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scheduleId,
      type: schedule.type,
      generatedAt: new Date(),
      status: 'generating',
      metrics: {
        revenue: 1550000,
        expenses: 950000,
        profit: 600000,
        profitMargin: 38.7,
        customerCount: 2450,
        orderCount: 3200,
        averageOrderValue: 484,
      },
    };

    this.reports.set(report.id, report);

    // Simulate report generation
    setTimeout(() => {
      report.status = 'completed';
      report.fileUrl = `/reports/${report.id}.pdf`;

      // Send emails
      if (schedule.recipients.length > 0) {
        this.sendReportEmails(report, schedule);
      }
    }, 2000);

    return report;
  }

  /**
   * Send report emails
   */
  private async sendReportEmails(report: GeneratedReport, schedule: ReportSchedule): Promise<void> {
    for (const recipient of schedule.recipients) {
      try {
        // In production, this would use actual email service
        console.log(`Sending report ${report.id} to ${recipient}`);

        report.emailSentAt = new Date();
        report.recipients = schedule.recipients;
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
      }
    }
  }

  /**
   * Get generated report
   */
  async getGeneratedReport(reportId: string): Promise<GeneratedReport | null> {
    return this.reports.get(reportId) || null;
  }

  /**
   * Get all generated reports
   */
  async getAllGeneratedReports(scheduleId?: string, status?: ReportStatus): Promise<GeneratedReport[]> {
    let reports = Array.from(this.reports.values());

    if (scheduleId) {
      reports = reports.filter((r) => r.scheduleId === scheduleId);
    }

    if (status) {
      reports = reports.filter((r) => r.status === status);
    }

    return reports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
  }

  /**
   * Create report template
   */
  async createReportTemplate(template: Omit<ReportTemplate, 'id | createdAt'>): Promise<ReportTemplate> {
    const fullTemplate: ReportTemplate = {
      ...template,
      id: `TMPL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.templates.set(fullTemplate.id, fullTemplate);
    return fullTemplate;
  }

  /**
   * Get report template
   */
  async getReportTemplate(templateId: string): Promise<ReportTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get all report templates
   */
  async getAllReportTemplates(type?: ReportType): Promise<ReportTemplate[]> {
    let templates = Array.from(this.templates.values());

    if (type) {
      templates = templates.filter((t) => t.type === type);
    }

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get pending reports
   */
  async getPendingReports(): Promise<GeneratedReport[]> {
    return Array.from(this.reports.values())
      .filter((r) => r.status === 'pending' || r.status === 'generating')
      .sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime());
  }

  /**
   * Get reports due for generation
   */
  async getReportsDueForGeneration(): Promise<ReportSchedule[]> {
    const now = new Date();
    return Array.from(this.schedules.values()).filter((s) => {
      if (!s.enabled || !s.nextRun) return false;
      return s.nextRun <= now;
    });
  }

  /**
   * Process scheduled reports
   */
  async processScheduledReports(): Promise<void> {
    const dueReports = await this.getReportsDueForGeneration();

    for (const schedule of dueReports) {
      try {
        await this.generateReportManually(schedule.id);
        schedule.lastRun = new Date();
        schedule.nextRun = this.calculateNextRunTime(schedule);
      } catch (error) {
        console.error(`Failed to generate report for schedule ${schedule.id}:`, error);
      }
    }
  }

  /**
   * Get report statistics
   */
  async getReportStatistics(): Promise<any> {
    const allReports = Array.from(this.reports.values());
    const allSchedules = Array.from(this.schedules.values());

    const completedReports = allReports.filter((r) => r.status === 'completed').length;
    const failedReports = allReports.filter((r) => r.status === 'failed').length;
    const emailsSent = allReports.filter((r) => r.emailSentAt).length;

    const averageReportMetrics = {
      revenue: 0,
      expenses: 0,
      profit: 0,
      profitMargin: 0,
    };

    if (completedReports > 0) {
      const completedReportsList = allReports.filter((r) => r.status === 'completed');
      averageReportMetrics.revenue = completedReportsList.reduce((sum, r) => sum + r.metrics.revenue, 0) / completedReports;
      averageReportMetrics.expenses = completedReportsList.reduce((sum, r) => sum + r.metrics.expenses, 0) / completedReports;
      averageReportMetrics.profit = completedReportsList.reduce((sum, r) => sum + r.metrics.profit, 0) / completedReports;
      averageReportMetrics.profitMargin = completedReportsList.reduce((sum, r) => sum + r.metrics.profitMargin, 0) / completedReports;
    }

    return {
      totalSchedules: allSchedules.length,
      enabledSchedules: allSchedules.filter((s) => s.enabled).length,
      totalReports: allReports.length,
      completedReports,
      failedReports,
      emailsSent,
      averageReportMetrics,
      reportsByType: {
        daily: allReports.filter((r) => r.type === 'daily').length,
        weekly: allReports.filter((r) => r.type === 'weekly').length,
        monthly: allReports.filter((r) => r.type === 'monthly').length,
        quarterly: allReports.filter((r) => r.type === 'quarterly').length,
        annual: allReports.filter((r) => r.type === 'annual').length,
      },
    };
  }
}

export default AutomatedReportingService;
