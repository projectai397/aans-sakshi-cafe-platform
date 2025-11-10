/**
 * Staff Scheduling API Routes
 * Automated shift scheduling and staff management
 */

import { Router, Request, Response } from 'express';
import StaffSchedulingService from './staff-scheduling-service';

const router = Router();
const schedulingService = new StaffSchedulingService();

/**
 * Staff Member Management
 */

router.post('/staff/add', async (req: Request, res: Response) => {
  try {
    const staffData = req.body;
    const staff = await schedulingService.addStaffMember(staffData);

    res.json({
      success: true,
      staff,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/staff/:staffId', async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    const staff = await schedulingService.getStaffMember(staffId);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/staff/role/:role', async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const staff = await schedulingService.getStaffByRole(role as any);

    res.json({
      role,
      count: staff.length,
      staff,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/staff/active', async (req: Request, res: Response) => {
  try {
    const staff = await schedulingService.getActiveStaff();

    res.json({
      count: staff.length,
      staff,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Historical Data Management
 */

router.post('/historical-data/add', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    await schedulingService.addHistoricalData(data);

    res.json({
      success: true,
      message: 'Historical data added',
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/historical-data/:dayOfWeek/metrics', async (req: Request, res: Response) => {
  try {
    const { dayOfWeek } = req.params;
    const metrics = await schedulingService.getAverageMetrics(dayOfWeek);

    res.json({
      dayOfWeek,
      metrics,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Schedule Generation & Management
 */

router.post('/schedule/generate', async (req: Request, res: Response) => {
  try {
    const { locationId, weekStartDate } = req.body;

    const schedule = await schedulingService.generateOptimalSchedule(locationId, new Date(weekStartDate));

    res.json({
      success: true,
      schedule,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/schedule/:scheduleId', async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await schedulingService.getSchedule(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/schedule/location/:locationId', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const schedules = await schedulingService.getSchedulesByLocation(locationId);

    res.json({
      locationId,
      count: schedules.length,
      schedules,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/schedule/:scheduleId/publish', async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const schedule = await schedulingService.publishSchedule(scheduleId);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      success: true,
      schedule,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Schedule Optimization
 */

router.post('/schedule/:scheduleId/optimize', async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const optimization = await schedulingService.optimizeSchedule(scheduleId);

    if (!optimization) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      success: true,
      optimization,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Analytics & Reporting
 */

router.get('/analytics/location/:locationId', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const analytics = await schedulingService.getSchedulingAnalytics(locationId);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Shift Management
 */

router.post('/shift/create', async (req: Request, res: Response) => {
  try {
    const shiftData = req.body;
    const shift = await schedulingService.createShift(shiftData);

    res.json({
      success: true,
      shift,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/shift/:shiftId/assign', async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    const { staffId, role } = req.body;

    const shift = await schedulingService.assignStaffToShift(shiftId, staffId, role);

    if (!shift) {
      return res.status(404).json({ error: 'Shift or staff not found' });
    }

    res.json({
      success: true,
      shift,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
