/**
 * Mobile Staff App API Routes
 * Handles staff management, shifts, attendance, and notifications
 */

import { Router, Request, Response } from 'express';
import MobileStaffAppService from './mobile-staff-app-service';

const router = Router();
const staffService = new MobileStaffAppService();

/**
 * Staff Management
 */

router.post('/staff/create', async (req: Request, res: Response) => {
  try {
    const staffData = req.body;
    const staff = await staffService.createStaffMember(staffData);

    res.json({
      success: true,
      staff,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/staff/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const staff = await staffService.getStaffMember(employeeId);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:locationId/staff', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const staff = await staffService.getLocationStaff(locationId);

    res.json({
      locationId,
      count: staff.length,
      staff,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/staff/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const updates = req.body;

    const staff = await staffService.updateStaffMember(employeeId, updates);

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({
      success: true,
      staff,
    });
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
    const shift = await staffService.createShift(shiftData);

    res.json({
      success: true,
      shift,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/staff/:employeeId/shifts', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { days = '30' } = req.query;

    const shifts = await staffService.getEmployeeShifts(employeeId, parseInt(days as string));

    res.json({
      employeeId,
      count: shifts.length,
      shifts,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/staff/:employeeId/upcoming-shifts', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { days = '7' } = req.query;

    const shifts = await staffService.getUpcomingShifts(employeeId, parseInt(days as string));

    res.json({
      employeeId,
      count: shifts.length,
      shifts,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:locationId/shifts', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { date } = req.query;

    const shiftDate = date ? new Date(date as string) : new Date();
    const shifts = await staffService.getLocationShifts(locationId, shiftDate);

    res.json({
      locationId,
      date: shiftDate.toISOString().split('T')[0],
      count: shifts.length,
      shifts,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/shift/:shiftId/status', async (req: Request, res: Response) => {
  try {
    const { shiftId } = req.params;
    const { status } = req.body;

    const shift = await staffService.updateShiftStatus(shiftId, status);

    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    res.json({
      success: true,
      shift,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Shift Swap Management
 */

router.post('/shift-swap/request', async (req: Request, res: Response) => {
  try {
    const { shiftId, requestingEmployeeId, targetEmployeeId } = req.body;

    const swapRequest = await staffService.requestShiftSwap(shiftId, requestingEmployeeId, targetEmployeeId);

    res.json({
      success: true,
      swapRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/shift-swap/:swapRequestId/approve', async (req: Request, res: Response) => {
  try {
    const { swapRequestId } = req.params;

    const swapRequest = await staffService.approveShiftSwap(swapRequestId);

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    res.json({
      success: true,
      swapRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/shift-swap/:swapRequestId/reject', async (req: Request, res: Response) => {
  try {
    const { swapRequestId } = req.params;

    const swapRequest = await staffService.rejectShiftSwap(swapRequestId);

    if (!swapRequest) {
      return res.status(404).json({ error: 'Swap request not found' });
    }

    res.json({
      success: true,
      swapRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/staff/:employeeId/pending-swaps', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const swapRequests = await staffService.getPendingSwapRequests(employeeId);

    res.json({
      employeeId,
      count: swapRequests.length,
      swapRequests,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Attendance Tracking
 */

router.post('/attendance/check-in', async (req: Request, res: Response) => {
  try {
    const { employeeId, latitude, longitude } = req.body;

    const attendance = await staffService.checkIn(employeeId, latitude, longitude);

    res.json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/attendance/check-out', async (req: Request, res: Response) => {
  try {
    const { employeeId, latitude, longitude } = req.body;

    const attendance = await staffService.checkOut(employeeId, latitude, longitude);

    if (!attendance) {
      return res.status(404).json({ error: 'No check-in record found for today' });
    }

    res.json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/attendance/:employeeId/today', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const attendance = await staffService.getAttendanceRecord(employeeId, new Date());

    res.json(attendance || { message: 'No attendance record for today' });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/attendance/:employeeId/history', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { days = '30' } = req.query;

    const history = await staffService.getAttendanceHistory(employeeId, parseInt(days as string));

    res.json({
      employeeId,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Notifications
 */

router.post('/notification/send', async (req: Request, res: Response) => {
  try {
    const { employeeId, type, title, message, data } = req.body;

    const notification = await staffService.sendNotification(employeeId, {
      type,
      title,
      message,
      data,
    });

    res.json({
      success: true,
      notification,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/notifications/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { unreadOnly = 'false' } = req.query;

    const notifications = await staffService.getNotifications(employeeId, unreadOnly === 'true');

    res.json({
      employeeId,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/notification/:notificationId/read', async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    const success = await staffService.markNotificationAsRead(notificationId);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Performance Metrics
 */

router.get('/performance/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const performance = await staffService.getPerformanceMetrics(employeeId);

    if (!performance) {
      return res.status(404).json({ error: 'Performance data not found' });
    }

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:locationId/team-performance', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const performance = await staffService.getTeamPerformance(locationId);

    res.json({
      locationId,
      count: performance.length,
      performance,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Dashboard
 */

router.get('/dashboard/:employeeId', async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    const dashboardData = await staffService.getDashboardData(employeeId);

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Payroll
 */

router.get('/payroll/:employeeId/:month', async (req: Request, res: Response) => {
  try {
    const { employeeId, month } = req.params;

    const payrollInfo = await staffService.getPayrollInfo(employeeId, month);

    res.json(payrollInfo);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Cleanup
 */

router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { ageHours = 720 } = req.body;

    const deletedCount = await staffService.cleanupOldData(ageHours);

    res.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
