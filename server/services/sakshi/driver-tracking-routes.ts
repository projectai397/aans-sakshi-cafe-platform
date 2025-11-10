/**
 * Driver Tracking API Routes & WebSocket Handlers
 * Real-time location updates, ETA tracking, and driver analytics
 */

import { Router, Request, Response } from 'express';
import DriverTrackingService from './driver-tracking-service';

const router = Router();
const trackingService = new DriverTrackingService();

/**
 * Location Updates
 */

router.post('/location/update', async (req: Request, res: Response) => {
  try {
    const { driverId, latitude, longitude, accuracy, speed, heading } = req.body;

    if (!driverId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const location = await trackingService.updateDriverLocation(driverId, latitude, longitude, accuracy, speed, heading);

    res.json({
      success: true,
      location,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location/:driverId', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const location = await trackingService.getDriverLocation(driverId);

    if (!location) {
      return res.status(404).json({ error: 'Driver location not found' });
    }

    res.json(location);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/location-history/:driverId', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const { limit = '50' } = req.query;

    const history = await trackingService.getDriverLocationHistory(driverId, parseInt(limit as string));

    res.json({
      driverId,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Route Management
 */

router.post('/route/create', async (req: Request, res: Response) => {
  try {
    const { driverId, orderId, restaurantLocation, customerLocation, waypoints } = req.body;

    if (!driverId || !orderId || !restaurantLocation || !customerLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const route = await trackingService.createRoute(driverId, orderId, restaurantLocation, customerLocation, waypoints);

    res.json({
      success: true,
      route,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/route/:routeId/start', async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;
    const route = await trackingService.startRoute(routeId);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({
      success: true,
      route,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/route/:routeId/complete', async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;
    const { actualDistance, actualDuration } = req.body;

    if (actualDistance === undefined || actualDuration === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const route = await trackingService.completeRoute(routeId, actualDistance, actualDuration);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({
      success: true,
      route,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/route/:routeId/cancel', async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;
    const route = await trackingService.cancelRoute(routeId);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json({
      success: true,
      route,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/route/:routeId', async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;
    const route = await trackingService.getRoute(routeId);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/driver/:driverId/active-routes', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const routes = await trackingService.getDriverActiveRoutes(driverId);

    res.json({
      driverId,
      count: routes.length,
      routes,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * ETA Management
 */

router.get('/eta/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const eta = await trackingService.getETA(orderId);

    if (!eta) {
      return res.status(404).json({ error: 'ETA not found' });
    }

    res.json(eta);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/driver/:driverId/etas', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const etas = await trackingService.getAllETAs(driverId);

    res.json({
      driverId,
      count: etas.length,
      etas,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Route Optimization
 */

router.post('/route/optimize', async (req: Request, res: Response) => {
  try {
    const { driverId, restaurantLocation, deliveryLocations } = req.body;

    if (!driverId || !restaurantLocation || !deliveryLocations) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const optimizedRoute = await trackingService.optimizeRoute(driverId, restaurantLocation, deliveryLocations);

    res.json({
      driverId,
      optimizedRoute,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Driver Performance
 */

router.get('/performance/:driverId', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const performance = await trackingService.getDriverPerformance(driverId);

    if (!performance) {
      return res.status(404).json({ error: 'Performance data not found' });
    }

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/performance', async (req: Request, res: Response) => {
  try {
    const performance = await trackingService.getAllDriverPerformance();

    res.json({
      count: performance.length,
      performance,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/top-performers', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const topPerformers = await trackingService.getTopPerformers(parseInt(limit as string));

    res.json({
      count: topPerformers.length,
      topPerformers,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Analytics
 */

router.get('/analytics/driver/:driverId', async (req: Request, res: Response) => {
  try {
    const { driverId } = req.params;
    const analytics = await trackingService.getLocationAnalytics(driverId);

    if (!analytics) {
      return res.status(404).json({ error: 'Analytics data not found' });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/analytics/fleet', async (req: Request, res: Response) => {
  try {
    const analytics = await trackingService.getFleetAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Real-time Deliveries
 */

router.get('/active-deliveries', async (req: Request, res: Response) => {
  try {
    const deliveries = await trackingService.getActiveDeliveries();

    res.json({
      count: deliveries.length,
      deliveries,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Cleanup
 */

router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const { ageHours = 24 } = req.body;
    const deletedCount = await trackingService.cleanupOldData(ageHours);

    res.json({
      success: true,
      deletedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
