/**
 * Predictive Maintenance System Service
 * Equipment monitoring with predictive analytics to prevent breakdowns
 */

type EquipmentType = 'oven' | 'fryer' | 'grill' | 'refrigerator' | 'dishwasher' | 'pos_system' | 'delivery_bike';
type EquipmentStatus = 'operational' | 'warning' | 'critical' | 'maintenance' | 'out_of_service';
type MaintenanceType = 'preventive' | 'corrective' | 'emergency';

interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  locationId: string;
  serialNumber: string;
  purchaseDate: Date;
  warrantyExpiry: Date;
  status: EquipmentStatus;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  operatingHours: number;
  createdAt: Date;
}

interface EquipmentMetric {
  id: string;
  equipmentId: string;
  timestamp: Date;
  temperature?: number;
  pressure?: number;
  vibration?: number;
  errorCount?: number;
  efficiency?: number;
  powerConsumption?: number;
  cycleCount?: number;
}

interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  type: MaintenanceType;
  scheduledDate: Date;
  completedDate?: Date;
  technician: string;
  description: string;
  cost: number;
  parts: Array<{ name: string; cost: number }>;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface FailurePrediction {
  equipmentId: string;
  equipmentName: string;
  failureProbability: number; // 0-100%
  daysToFailure: number;
  confidence: number; // 0-100%
  recommendedAction: string;
  estimatedRepairCost: number;
}

interface MaintenanceAnalytics {
  totalEquipment: number;
  operationalEquipment: number;
  warningEquipment: number;
  criticalEquipment: number;
  averageEquipmentAge: number; // years
  totalOperatingHours: number;
  maintenanceScheduled: number;
  maintenanceCompleted: number;
  averageDowntime: number; // hours
  averageRepairCost: number;
  predictedFailures: FailurePrediction[];
  costSavings: number; // from preventive maintenance
}

class PredictiveMaintenanceService {
  private equipment: Map<string, Equipment> = new Map();
  private metrics: Map<string, EquipmentMetric[]> = new Map();
  private maintenanceRecords: Map<string, MaintenanceRecord> = new Map();
  private predictions: Map<string, FailurePrediction> = new Map();

  /**
   * Register equipment
   */
  async registerEquipment(equipment: Omit<Equipment, 'id | createdAt'>): Promise<Equipment> {
    const fullEquipment: Equipment = {
      ...equipment,
      id: `EQUIP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.equipment.set(fullEquipment.id, fullEquipment);
    this.metrics.set(fullEquipment.id, []);

    return fullEquipment;
  }

  /**
   * Get equipment
   */
  async getEquipment(equipmentId: string): Promise<Equipment | null> {
    return this.equipment.get(equipmentId) || null;
  }

  /**
   * Get all equipment
   */
  async getAllEquipment(locationId?: string, status?: EquipmentStatus): Promise<Equipment[]> {
    let equipment = Array.from(this.equipment.values());

    if (locationId) {
      equipment = equipment.filter((e) => e.locationId === locationId);
    }

    if (status) {
      equipment = equipment.filter((e) => e.status === status);
    }

    return equipment;
  }

  /**
   * Record equipment metric
   */
  async recordMetric(equipmentId: string, metric: Omit<EquipmentMetric, 'id'>): Promise<EquipmentMetric> {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) {
      throw new Error(`Equipment ${equipmentId} not found`);
    }

    const fullMetric: EquipmentMetric = {
      ...metric,
      id: `METRIC-${Date.now()}`,
    };

    const metrics = this.metrics.get(equipmentId) || [];
    metrics.push(fullMetric);

    // Keep only last 1000 metrics
    if (metrics.length > 1000) {
      metrics.shift();
    }

    this.metrics.set(equipmentId, metrics);

    // Update equipment status based on metrics
    await this.updateEquipmentStatus(equipmentId, metric);

    // Check for failure prediction
    await this.predictFailure(equipmentId);

    return fullMetric;
  }

  /**
   * Update equipment status based on metrics
   */
  private async updateEquipmentStatus(equipmentId: string, metric: Omit<EquipmentMetric, 'id'>): Promise<void> {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) return;

    let newStatus: EquipmentStatus = 'operational';

    // Check temperature
    if (metric.temperature && metric.temperature > 80) {
      newStatus = 'warning';
    }
    if (metric.temperature && metric.temperature > 90) {
      newStatus = 'critical';
    }

    // Check error count
    if (metric.errorCount && metric.errorCount > 10) {
      newStatus = 'warning';
    }
    if (metric.errorCount && metric.errorCount > 20) {
      newStatus = 'critical';
    }

    // Check efficiency
    if (metric.efficiency && metric.efficiency < 70) {
      newStatus = 'warning';
    }
    if (metric.efficiency && metric.efficiency < 50) {
      newStatus = 'critical';
    }

    equipment.status = newStatus;
  }

  /**
   * Predict equipment failure
   */
  private async predictFailure(equipmentId: string): Promise<void> {
    const equipment = this.equipment.get(equipmentId);
    const metrics = this.metrics.get(equipmentId) || [];

    if (!equipment || metrics.length < 10) return;

    // Get recent metrics (last 100)
    const recentMetrics = metrics.slice(-100);

    // Calculate failure probability based on metrics
    let failureProbability = 0;
    let daysToFailure = 365; // default 1 year

    // Analyze temperature trend
    const temps = recentMetrics.filter((m) => m.temperature).map((m) => m.temperature!);
    if (temps.length > 0) {
      const avgTemp = temps.reduce((a, b) => a + b) / temps.length;
      if (avgTemp > 75) failureProbability += 20;
      if (avgTemp > 85) failureProbability += 30;
    }

    // Analyze error trend
    const errors = recentMetrics.filter((m) => m.errorCount).map((m) => m.errorCount!);
    if (errors.length > 0) {
      const avgErrors = errors.reduce((a, b) => a + b) / errors.length;
      if (avgErrors > 5) failureProbability += 15;
      if (avgErrors > 15) failureProbability += 25;
    }

    // Analyze efficiency trend
    const efficiencies = recentMetrics.filter((m) => m.efficiency).map((m) => m.efficiency!);
    if (efficiencies.length > 0) {
      const avgEfficiency = efficiencies.reduce((a, b) => a + b) / efficiencies.length;
      if (avgEfficiency < 80) failureProbability += 10;
      if (avgEfficiency < 60) failureProbability += 25;
    }

    // Calculate days to failure
    if (failureProbability > 70) {
      daysToFailure = 7;
    } else if (failureProbability > 50) {
      daysToFailure = 30;
    } else if (failureProbability > 30) {
      daysToFailure = 90;
    }

    const prediction: FailurePrediction = {
      equipmentId,
      equipmentName: equipment.name,
      failureProbability: Math.min(100, failureProbability),
      daysToFailure,
      confidence: 75 + (recentMetrics.length / 100) * 25, // Confidence increases with more data
      recommendedAction:
        failureProbability > 70
          ? 'Schedule immediate maintenance'
          : failureProbability > 50
            ? 'Schedule maintenance within 1 week'
            : 'Monitor closely',
      estimatedRepairCost: this.estimateRepairCost(equipment.type, failureProbability),
    };

    this.predictions.set(equipmentId, prediction);

    // Schedule maintenance if needed
    if (failureProbability > 50) {
      await this.scheduleMaintenanceIfNeeded(equipmentId, prediction);
    }
  }

  /**
   * Estimate repair cost
   */
  private estimateRepairCost(equipmentType: EquipmentType, failureProbability: number): number {
    const baseCosts: Record<EquipmentType, number> = {
      oven: 15000,
      fryer: 12000,
      grill: 10000,
      refrigerator: 20000,
      dishwasher: 8000,
      pos_system: 5000,
      delivery_bike: 25000,
    };

    const baseCost = baseCosts[equipmentType];
    const probabilityMultiplier = 1 + failureProbability / 100;

    return Math.round(baseCost * probabilityMultiplier);
  }

  /**
   * Schedule maintenance if needed
   */
  private async scheduleMaintenanceIfNeeded(equipmentId: string, prediction: FailurePrediction): Promise<void> {
    const equipment = this.equipment.get(equipmentId);
    if (!equipment) return;

    // Check if maintenance already scheduled
    const existingRecords = Array.from(this.maintenanceRecords.values()).filter(
      (r) => r.equipmentId === equipmentId && r.status === 'scheduled'
    );

    if (existingRecords.length === 0) {
      const scheduledDate = new Date(Date.now() + prediction.daysToFailure * 24 * 60 * 60 * 1000);

      const record: MaintenanceRecord = {
        id: `MAINT-${Date.now()}`,
        equipmentId,
        type: 'preventive',
        scheduledDate,
        technician: 'Unassigned',
        description: prediction.recommendedAction,
        cost: prediction.estimatedRepairCost,
        parts: [],
        status: 'scheduled',
      };

      this.maintenanceRecords.set(record.id, record);
    }
  }

  /**
   * Schedule maintenance
   */
  async scheduleMaintenanceRecord(
    equipmentId: string,
    type: MaintenanceType,
    scheduledDate: Date,
    description: string,
    estimatedCost: number
  ): Promise<MaintenanceRecord> {
    const record: MaintenanceRecord = {
      id: `MAINT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      equipmentId,
      type,
      scheduledDate,
      technician: 'Unassigned',
      description,
      cost: estimatedCost,
      parts: [],
      status: 'scheduled',
    };

    this.maintenanceRecords.set(record.id, record);

    // Update equipment next maintenance date
    const equipment = this.equipment.get(equipmentId);
    if (equipment) {
      equipment.nextMaintenanceDate = scheduledDate;
    }

    return record;
  }

  /**
   * Complete maintenance
   */
  async completeMaintenanceRecord(recordId: string, actualCost: number, parts: Array<{ name: string; cost: number }>): Promise<MaintenanceRecord> {
    const record = this.maintenanceRecords.get(recordId);
    if (!record) {
      throw new Error(`Maintenance record ${recordId} not found`);
    }

    record.status = 'completed';
    record.completedDate = new Date();
    record.cost = actualCost;
    record.parts = parts;

    // Update equipment
    const equipment = this.equipment.get(record.equipmentId);
    if (equipment) {
      equipment.lastMaintenanceDate = new Date();
      equipment.status = 'operational';
      equipment.operatingHours = 0; // Reset for tracking
    }

    return record;
  }

  /**
   * Get maintenance schedule
   */
  async getMaintenanceSchedule(locationId?: string): Promise<MaintenanceRecord[]> {
    let records = Array.from(this.maintenanceRecords.values()).filter((r) => r.status === 'scheduled');

    if (locationId) {
      const locationEquipment = Array.from(this.equipment.values())
        .filter((e) => e.locationId === locationId)
        .map((e) => e.id);

      records = records.filter((r) => locationEquipment.includes(r.equipmentId));
    }

    return records.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  /**
   * Get maintenance analytics
   */
  async getMaintenanceAnalytics(locationId?: string): Promise<MaintenanceAnalytics> {
    let allEquipment = await this.getAllEquipment(locationId);
    const allRecords = Array.from(this.maintenanceRecords.values());
    const allPredictions = Array.from(this.predictions.values());

    const operationalEquipment = allEquipment.filter((e) => e.status === 'operational').length;
    const warningEquipment = allEquipment.filter((e) => e.status === 'warning').length;
    const criticalEquipment = allEquipment.filter((e) => e.status === 'critical').length;

    const totalAge = allEquipment.reduce((sum, e) => sum + (Date.now() - e.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365), 0);
    const averageEquipmentAge = allEquipment.length > 0 ? totalAge / allEquipment.length : 0;

    const totalOperatingHours = allEquipment.reduce((sum, e) => sum + e.operatingHours, 0);

    const maintenanceScheduled = allRecords.filter((r) => r.status === 'scheduled').length;
    const maintenanceCompleted = allRecords.filter((r) => r.status === 'completed').length;

    const completedRecords = allRecords.filter((r) => r.status === 'completed');
    const totalDowntime = completedRecords.reduce((sum, r) => {
      if (r.completedDate) {
        return sum + (r.completedDate.getTime() - r.scheduledDate.getTime()) / (1000 * 60 * 60);
      }
      return sum;
    }, 0);
    const averageDowntime = completedRecords.length > 0 ? totalDowntime / completedRecords.length : 0;

    const totalRepairCost = completedRecords.reduce((sum, r) => sum + r.cost, 0);
    const averageRepairCost = completedRecords.length > 0 ? totalRepairCost / completedRecords.length : 0;

    // Calculate cost savings from preventive maintenance
    const preventiveRecords = completedRecords.filter((r) => r.type === 'preventive');
    const preventiveCost = preventiveRecords.reduce((sum, r) => sum + r.cost, 0);
    const costSavings = preventiveCost * 2; // Assume preventive maintenance saves 2x the cost

    return {
      totalEquipment: allEquipment.length,
      operationalEquipment,
      warningEquipment,
      criticalEquipment,
      averageEquipmentAge: Math.round(averageEquipmentAge * 10) / 10,
      totalOperatingHours,
      maintenanceScheduled,
      maintenanceCompleted,
      averageDowntime: Math.round(averageDowntime * 10) / 10,
      averageRepairCost: Math.round(averageRepairCost),
      predictedFailures: allPredictions.filter((p) => p.failureProbability > 30),
      costSavings: Math.round(costSavings),
    };
  }

  /**
   * Get equipment health score
   */
  async getEquipmentHealthScore(equipmentId: string): Promise<number> {
    const equipment = this.equipment.get(equipmentId);
    const metrics = this.metrics.get(equipmentId) || [];

    if (!equipment || metrics.length === 0) return 100;

    let score = 100;

    // Deduct based on status
    switch (equipment.status) {
      case 'warning':
        score -= 20;
        break;
      case 'critical':
        score -= 50;
        break;
      case 'maintenance':
        score -= 30;
        break;
      case 'out_of_service':
        score = 0;
        break;
    }

    // Deduct based on recent metrics
    const recentMetrics = metrics.slice(-10);
    for (const metric of recentMetrics) {
      if (metric.temperature && metric.temperature > 80) score -= 5;
      if (metric.errorCount && metric.errorCount > 10) score -= 5;
      if (metric.efficiency && metric.efficiency < 70) score -= 5;
    }

    return Math.max(0, score);
  }
}

export default PredictiveMaintenanceService;
