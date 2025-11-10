/**
 * Driver Tracking Client Library
 * Provides utilities for driver app and customer app integration
 */

interface DriverLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
}

interface ETAData {
  orderId: string;
  estimatedArrivalTime: Date;
  distanceRemaining: number;
  timeRemaining: number;
  confidence: number;
}

class DriverTrackingClient {
  private apiBaseUrl: string;
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private driverId: string | null = null;
  private userId: string | null = null;
  private locationWatcher: number | null = null;
  private updateInterval: number = 5000; // 5 seconds
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(apiBaseUrl: string, wsUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
    this.wsUrl = wsUrl;
  }

  /**
   * Connection Management
   */

  async connect(userId: string, driverId?: string): Promise<void> {
    this.userId = userId;
    if (driverId) {
      this.driverId = driverId;
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;

          // Authenticate
          this.send({
            type: 'auth',
            payload: { userId: this.userId },
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      console.log(`Attempting to reconnect in ${delay}ms...`);

      setTimeout(() => {
        this.connect(this.userId!, this.driverId || undefined).catch(console.error);
      }, delay);
    }
  }

  async disconnect(): Promise<void> {
    if (this.locationWatcher !== null) {
      navigator.geolocation.clearWatch(this.locationWatcher);
    }

    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Message Handling
   */

  private send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(message: any): void {
    const { type, payload } = message;

    // Emit event to listeners
    const listeners = this.listeners.get(type) || [];
    listeners.forEach((listener) => listener(payload || message));

    switch (type) {
      case 'authenticated':
        this.emit('authenticated', message);
        break;
      case 'driver_location_update':
        this.emit('driver_location_update', message);
        break;
      case 'eta_update':
        this.emit('eta_update', message);
        break;
      case 'heartbeat':
        this.send({ type: 'heartbeat' });
        break;
    }
  }

  /**
   * Location Tracking
   */

  async startLocationTracking(): Promise<void> {
    if (!this.driverId) {
      throw new Error('Driver ID not set');
    }

    return new Promise((resolve, reject) => {
      this.locationWatcher = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const speed = position.coords.speed || undefined;
          const heading = position.coords.heading || undefined;

          this.updateLocation(latitude, longitude, accuracy, speed, heading).catch(console.error);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      resolve();
    });
  }

  async stopLocationTracking(): Promise<void> {
    if (this.locationWatcher !== null) {
      navigator.geolocation.clearWatch(this.locationWatcher);
      this.locationWatcher = null;
    }
  }

  private async updateLocation(
    latitude: number,
    longitude: number,
    accuracy: number,
    speed?: number,
    heading?: number
  ): Promise<void> {
    // Send via WebSocket if connected
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'location_update',
        payload: {
          driverId: this.driverId,
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
        },
      });
    } else {
      // Fallback to REST API
      try {
        await fetch(`${this.apiBaseUrl}/tracking/location/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            driverId: this.driverId,
            latitude,
            longitude,
            accuracy,
            speed,
            heading,
          }),
        });
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    }
  }

  /**
   * Subscription Management
   */

  async subscribeToDriver(driverId: string): Promise<void> {
    this.send({
      type: 'subscribe_driver',
      payload: { driverId },
    });
  }

  async subscribeToOrder(orderId: string): Promise<void> {
    this.send({
      type: 'subscribe_order',
      payload: { orderId },
    });
  }

  async unsubscribeFromDriver(driverId: string): Promise<void> {
    this.send({
      type: 'unsubscribe_driver',
      payload: { driverId },
    });
  }

  async unsubscribeFromOrder(orderId: string): Promise<void> {
    this.send({
      type: 'unsubscribe_order',
      payload: { orderId },
    });
  }

  /**
   * REST API Methods
   */

  async getDriverLocation(driverId: string): Promise<DriverLocation> {
    const response = await fetch(`${this.apiBaseUrl}/tracking/location/${driverId}`);
    if (!response.ok) throw new Error('Failed to fetch driver location');
    return response.json();
  }

  async getETA(orderId: string): Promise<ETAData> {
    const response = await fetch(`${this.apiBaseUrl}/tracking/eta/${orderId}`);
    if (!response.ok) throw new Error('Failed to fetch ETA');
    const data = await response.json();
    return {
      ...data,
      estimatedArrivalTime: new Date(data.estimatedArrivalTime),
    };
  }

  async getActiveDeliveries(): Promise<any[]> {
    const response = await fetch(`${this.apiBaseUrl}/tracking/active-deliveries`);
    if (!response.ok) throw new Error('Failed to fetch active deliveries');
    const data = await response.json();
    return data.deliveries;
  }

  async getDriverPerformance(driverId: string): Promise<any> {
    const response = await fetch(`${this.apiBaseUrl}/tracking/performance/${driverId}`);
    if (!response.ok) throw new Error('Failed to fetch performance data');
    return response.json();
  }

  async getFleetAnalytics(): Promise<any> {
    const response = await fetch(`${this.apiBaseUrl}/tracking/analytics/fleet`);
    if (!response.ok) throw new Error('Failed to fetch fleet analytics');
    return response.json();
  }

  /**
   * Event Listeners
   */

  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((listener) => listener(data));
  }

  /**
   * Utilities
   */

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  setUpdateInterval(interval: number): void {
    this.updateInterval = interval;
  }
}

/**
 * React Hook for Driver Tracking
 */

export function useDriverTracking(apiBaseUrl: string, wsUrl: string) {
  const [client] = React.useState(() => new DriverTrackingClient(apiBaseUrl, wsUrl));
  const [isConnected, setIsConnected] = React.useState(false);
  const [driverLocation, setDriverLocation] = React.useState<DriverLocation | null>(null);
  const [eta, setEta] = React.useState<ETAData | null>(null);
  const [activeDeliveries, setActiveDeliveries] = React.useState<any[]>([]);

  React.useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);
    const handleLocationUpdate = (data: any) => setDriverLocation(data.location);
    const handleETAUpdate = (data: any) => setEta(data.eta);

    client.on('authenticated', handleConnected);
    client.on('driver_location_update', handleLocationUpdate);
    client.on('eta_update', handleETAUpdate);

    return () => {
      client.off('authenticated', handleConnected);
      client.off('driver_location_update', handleLocationUpdate);
      client.off('eta_update', handleETAUpdate);
    };
  }, [client]);

  return {
    client,
    isConnected,
    driverLocation,
    eta,
    activeDeliveries,
  };
}

export default DriverTrackingClient;
