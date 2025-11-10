/**
 * Real-Time Driver Tracking Service
 * Manages driver locations, ETA calculation, route optimization, and performance analytics
 */

interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
}

interface DeliveryRoute {
  id: string;
  driverId: string;
  orderId: string;
  restaurantLocation: { lat: number; lng: number };
  customerLocation: { lat: number; lng: number };
  waypoints: Array<{ lat: number; lng: number }>;
  distance: number; // in km
  duration: number; // in minutes
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  actualDistance?: number;
  actualDuration?: number;
}

interface DriverPerformance {
  driverId: string;
  totalDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  averageRating: number;
  totalDistance: number;
  totalDuration: number;
  averageDeliveryTime: number;
  onTimeDeliveries: number;
  onTimePercentage: number;
  lastUpdated: Date;
}

interface ETAUpdate {
  orderId: string;
  driverId: string;
  currentLocation: { lat: number; lng: number };
  estimatedArrivalTime: Date;
  distanceRemaining: number;
  timeRemaining: number;
  confidence: number; // 0-100
}

class DriverTrackingService {
  private driverLocations: Map<string, DriverLocation> = new Map();
  private activeRoutes: Map<string, DeliveryRoute> = new Map();
  private driverPerformance: Map<string, DriverPerformance> = new Map();
  private etaUpdates: Map<string, ETAUpdate> = new Map();
  private locationHistory: Map<string, DriverLocation[]> = new Map();

  /**
   * Location Tracking
   */

  async updateDriverLocation(
    driverId: string,
    latitude: number,
    longitude: number,
    accuracy: number,
    speed?: number,
    heading?: number
  ): Promise<DriverLocation> {
    const location: DriverLocation = {
      driverId,
      latitude,
      longitude,
      accuracy,
      timestamp: new Date(),
      speed,
      heading,
    };

    this.driverLocations.set(driverId, location);

    // Store in history
    if (!this.locationHistory.has(driverId)) {
      this.locationHistory.set(driverId, []);
    }
    this.locationHistory.get(driverId)!.push(location);

    // Keep only last 100 locations per driver
    const history = this.locationHistory.get(driverId)!;
    if (history.length > 100) {
      this.locationHistory.set(driverId, history.slice(-100));
    }

    // Update ETA if driver has active route
    await this.updateETAForDriver(driverId);

    return location;
  }

  async getDriverLocation(driverId: string): Promise<DriverLocation | null> {
    return this.driverLocations.get(driverId) || null;
  }

  async getDriverLocationHistory(driverId: string, limit: number = 50): Promise<DriverLocation[]> {
    const history = this.locationHistory.get(driverId) || [];
    return history.slice(-limit);
  }

  /**
   * Route Management
   */

  async createRoute(
    driverId: string,
    orderId: string,
    restaurantLocation: { lat: number; lng: number },
    customerLocation: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>
  ): Promise<DeliveryRoute> {
    const routeId = `ROUTE-${driverId}-${orderId}-${Date.now()}`;

    // Calculate distance and duration using Haversine formula
    const distance = this.calculateDistance(restaurantLocation, customerLocation);
    const duration = this.estimateDuration(distance);

    const route: DeliveryRoute = {
      id: routeId,
      driverId,
      orderId,
      restaurantLocation,
      customerLocation,
      waypoints: waypoints || [],
      distance,
      duration,
      status: 'pending',
    };

    this.activeRoutes.set(routeId, route);
    return route;
  }

  async startRoute(routeId: string): Promise<DeliveryRoute | null> {
    const route = this.activeRoutes.get(routeId);
    if (!route) return null;

    route.status = 'active';
    route.startTime = new Date();
    this.activeRoutes.set(routeId, route);

    return route;
  }

  async completeRoute(routeId: string, actualDistance: number, actualDuration: number): Promise<DeliveryRoute | null> {
    const route = this.activeRoutes.get(routeId);
    if (!route) return null;

    route.status = 'completed';
    route.endTime = new Date();
    route.actualDistance = actualDistance;
    route.actualDuration = actualDuration;

    // Update driver performance
    await this.updateDriverPerformance(route.driverId, route, true);

    this.activeRoutes.set(routeId, route);
    return route;
  }

  async cancelRoute(routeId: string): Promise<DeliveryRoute | null> {
    const route = this.activeRoutes.get(routeId);
    if (!route) return null;

    route.status = 'cancelled';
    route.endTime = new Date();

    // Update driver performance
    await this.updateDriverPerformance(route.driverId, route, false);

    this.activeRoutes.set(routeId, route);
    return route;
  }

  async getRoute(routeId: string): Promise<DeliveryRoute | null> {
    return this.activeRoutes.get(routeId) || null;
  }

  async getDriverActiveRoutes(driverId: string): Promise<DeliveryRoute[]> {
    return Array.from(this.activeRoutes.values()).filter((r) => r.driverId === driverId && r.status === 'active');
  }

  /**
   * ETA Calculation & Updates
   */

  private async updateETAForDriver(driverId: string): Promise<void> {
    const activeRoutes = await this.getDriverActiveRoutes(driverId);
    const currentLocation = this.driverLocations.get(driverId);

    if (!currentLocation || activeRoutes.length === 0) return;

    for (const route of activeRoutes) {
      const distanceRemaining = this.calculateDistance(
        { lat: currentLocation.latitude, lng: currentLocation.longitude },
        route.customerLocation
      );

      const timeRemaining = this.estimateDuration(distanceRemaining);
      const estimatedArrivalTime = new Date(Date.now() + timeRemaining * 60 * 1000);

      // Calculate confidence based on accuracy
      const confidence = Math.max(0, Math.min(100, 100 - currentLocation.accuracy * 10));

      const etaUpdate: ETAUpdate = {
        orderId: route.orderId,
        driverId,
        currentLocation: { lat: currentLocation.latitude, lng: currentLocation.longitude },
        estimatedArrivalTime,
        distanceRemaining,
        timeRemaining,
        confidence,
      };

      this.etaUpdates.set(route.orderId, etaUpdate);
    }
  }

  async getETA(orderId: string): Promise<ETAUpdate | null> {
    return this.etaUpdates.get(orderId) || null;
  }

  async getAllETAs(driverId: string): Promise<ETAUpdate[]> {
    return Array.from(this.etaUpdates.values()).filter((e) => e.driverId === driverId);
  }

  /**
   * Distance & Duration Calculation
   */

  private calculateDistance(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) *
        Math.cos(this.toRad(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private estimateDuration(distanceKm: number): number {
    // Average speed: 30 km/h in city
    const averageSpeed = 30;
    const baseTime = (distanceKm / averageSpeed) * 60; // in minutes

    // Add buffer for traffic (20% extra)
    return Math.ceil(baseTime * 1.2);
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Route Optimization
   */

  async optimizeRoute(
    driverId: string,
    restaurantLocation: { lat: number; lng: number },
    deliveryLocations: Array<{ orderId: string; lat: number; lng: number }>
  ): Promise<Array<{ orderId: string; sequence: number; distance: number }>> {
    // Nearest neighbor algorithm for route optimization
    const optimizedRoute: Array<{ orderId: string; sequence: number; distance: number }> = [];
    let currentLocation = restaurantLocation;
    const remainingLocations = [...deliveryLocations];
    let sequence = 1;

    while (remainingLocations.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      // Find nearest unvisited location
      for (let i = 0; i < remainingLocations.length; i++) {
        const distance = this.calculateDistance(currentLocation, {
          lat: remainingLocations[i].lat,
          lng: remainingLocations[i].lng,
        });

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      const nearest = remainingLocations[nearestIndex];
      optimizedRoute.push({
        orderId: nearest.orderId,
        sequence,
        distance: nearestDistance,
      });

      currentLocation = { lat: nearest.lat, lng: nearest.lng };
      remainingLocations.splice(nearestIndex, 1);
      sequence++;
    }

    return optimizedRoute;
  }

  /**
   * Driver Performance Tracking
   */

  private async updateDriverPerformance(driverId: string, route: DeliveryRoute, completed: boolean): Promise<void> {
    let performance = this.driverPerformance.get(driverId);

    if (!performance) {
      performance = {
        driverId,
        totalDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        averageRating: 0,
        totalDistance: 0,
        totalDuration: 0,
        averageDeliveryTime: 0,
        onTimeDeliveries: 0,
        onTimePercentage: 0,
        lastUpdated: new Date(),
      };
    }

    performance.totalDeliveries++;

    if (completed) {
      performance.completedDeliveries++;
      performance.totalDistance += route.actualDistance || 0;
      performance.totalDuration += route.actualDuration || 0;
      performance.averageDeliveryTime = performance.totalDuration / performance.completedDeliveries;

      // Check if delivery was on time (within estimated duration)
      if (route.actualDuration && route.actualDuration <= route.duration * 1.1) {
        // 10% buffer
        performance.onTimeDeliveries++;
      }

      performance.onTimePercentage = (performance.onTimeDeliveries / performance.completedDeliveries) * 100;
    } else {
      performance.cancelledDeliveries++;
    }

    performance.lastUpdated = new Date();
    this.driverPerformance.set(driverId, performance);
  }

  async getDriverPerformance(driverId: string): Promise<DriverPerformance | null> {
    return this.driverPerformance.get(driverId) || null;
  }

  async getAllDriverPerformance(): Promise<DriverPerformance[]> {
    return Array.from(this.driverPerformance.values());
  }

  async getTopPerformers(limit: number = 10): Promise<DriverPerformance[]> {
    return Array.from(this.driverPerformance.values())
      .sort((a, b) => {
        // Sort by on-time percentage, then by completed deliveries
        if (b.onTimePercentage !== a.onTimePercentage) {
          return b.onTimePercentage - a.onTimePercentage;
        }
        return b.completedDeliveries - a.completedDeliveries;
      })
      .slice(0, limit);
  }

  /**
   * Analytics & Reporting
   */

  async getLocationAnalytics(driverId: string): Promise<any> {
    const history = this.locationHistory.get(driverId) || [];
    const performance = this.driverPerformance.get(driverId);

    if (history.length === 0) {
      return null;
    }

    // Calculate coverage area
    let minLat = history[0].latitude;
    let maxLat = history[0].latitude;
    let minLng = history[0].longitude;
    let maxLng = history[0].longitude;

    for (const loc of history) {
      minLat = Math.min(minLat, loc.latitude);
      maxLat = Math.max(maxLat, loc.latitude);
      minLng = Math.min(minLng, loc.longitude);
      maxLng = Math.max(maxLng, loc.longitude);
    }

    // Calculate average speed
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < history.length; i++) {
      const distance = this.calculateDistance(
        { lat: history[i - 1].latitude, lng: history[i - 1].longitude },
        { lat: history[i].latitude, lng: history[i].longitude }
      );

      const timeMs = history[i].timestamp.getTime() - history[i - 1].timestamp.getTime();
      totalDistance += distance;
      totalTime += timeMs;
    }

    const averageSpeed = totalTime > 0 ? (totalDistance / (totalTime / 1000 / 3600)) * 1000 : 0; // m/s to km/h

    return {
      driverId,
      coverageArea: {
        minLat,
        maxLat,
        minLng,
        maxLng,
        center: {
          lat: (minLat + maxLat) / 2,
          lng: (minLng + maxLng) / 2,
        },
      },
      totalDistance,
      totalTime: totalTime / 1000 / 60, // in minutes
      averageSpeed,
      locationCount: history.length,
      performance,
    };
  }

  async getFleetAnalytics(): Promise<any> {
    const allPerformance = await this.getAllDriverPerformance();
    const allLocations = Array.from(this.driverLocations.values());

    const totalDeliveries = allPerformance.reduce((sum, p) => sum + p.completedDeliveries, 0);
    const totalDistance = allPerformance.reduce((sum, p) => sum + p.totalDistance, 0);
    const averageRating = allPerformance.length > 0 ? allPerformance.reduce((sum, p) => sum + p.averageRating, 0) / allPerformance.length : 0;
    const averageOnTimePercentage = allPerformance.length > 0 ? allPerformance.reduce((sum, p) => sum + p.onTimePercentage, 0) / allPerformance.length : 0;

    return {
      totalDrivers: allPerformance.length,
      activeDrivers: allLocations.length,
      totalDeliveries,
      totalDistance,
      averageDeliveryTime: allPerformance.length > 0 ? allPerformance.reduce((sum, p) => sum + p.averageDeliveryTime, 0) / allPerformance.length : 0,
      averageRating,
      averageOnTimePercentage,
      topPerformers: await this.getTopPerformers(5),
    };
  }

  /**
   * Real-time Updates
   */

  async getActiveDeliveries(): Promise<any[]> {
    const activeRoutes = Array.from(this.activeRoutes.values()).filter((r) => r.status === 'active');
    const deliveries = [];

    for (const route of activeRoutes) {
      const location = this.driverLocations.get(route.driverId);
      const eta = this.etaUpdates.get(route.orderId);

      deliveries.push({
        orderId: route.orderId,
        driverId: route.driverId,
        currentLocation: location ? { lat: location.latitude, lng: location.longitude } : null,
        destination: route.customerLocation,
        eta: eta ? eta.estimatedArrivalTime : null,
        distanceRemaining: eta ? eta.distanceRemaining : null,
        timeRemaining: eta ? eta.timeRemaining : null,
        status: route.status,
      });
    }

    return deliveries;
  }

  /**
   * Cleanup
   */

  async cleanupOldData(ageHours: number = 24): Promise<number> {
    const cutoffTime = new Date(Date.now() - ageHours * 60 * 60 * 1000);
    let deletedCount = 0;

    // Clean up completed routes
    for (const [routeId, route] of this.activeRoutes.entries()) {
      if (route.status === 'completed' && route.endTime && route.endTime < cutoffTime) {
        this.activeRoutes.delete(routeId);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

export default DriverTrackingService;
