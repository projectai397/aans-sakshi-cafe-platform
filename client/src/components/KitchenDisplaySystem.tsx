/**
 * Kitchen Display System (KDS) Component
 * Real-time order queue visualization with drag-drop priority management
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Clock, AlertCircle, CheckCircle, ChefHat, Flame, Wind } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import '../styles/kitchen-display-system.css';

interface KitchenOrder {
  id: string;
  orderId: string;
  items: Array<{ itemId: string; quantity: number; specialInstructions?: string }>;
  assignedStations: Array<{ stationId: string; items: string[] }>;
  status: 'pending' | 'assigned' | 'preparing' | 'ready' | 'completed';
  priority: number;
  estimatedPrepTime: number;
  actualPrepTime?: number;
  createdAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface KitchenStation {
  id: string;
  name: string;
  type: 'grill' | 'tandoor' | 'fryer' | 'curry' | 'bread' | 'dessert' | 'salad' | 'beverage';
  capacity: number;
  currentLoad: number;
  avgPrepTime: number;
  specialties: string[];
  status: 'active' | 'inactive' | 'maintenance';
}

interface StationQueue {
  stationId: string;
  orders: KitchenOrder[];
  totalWaitTime: number;
  avgWaitTime: number;
  utilizationRate: number;
}

export default function KitchenDisplaySystem({ locationId }: { locationId: string }) {
  const [stations, setStations] = useState<KitchenStation[]>([]);
  const [queues, setQueues] = useState<Record<string, StationQueue>>({});
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [draggedOrder, setDraggedOrder] = useState<KitchenOrder | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing' | 'ready'>('all');
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const stationsRes = await fetch(`/api/kitchen/location/${locationId}/stations`);
        const stationsData = await stationsRes.json();
        setStations(stationsData.stations);

        const queuesRes = await fetch(`/api/kitchen/location/${locationId}/queues`);
        const queuesData = await queuesRes.json();

        const queueMap: Record<string, StationQueue> = {};
        queuesData.queues.forEach((queue: StationQueue) => {
          queueMap[queue.stationId] = queue;
        });
        setQueues(queueMap);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchData();
  }, [locationId]);

  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
          setConnectionStatus('connected');
          reconnectAttempts.current = 0;

          // Subscribe to location
          websocket.send(
            JSON.stringify({
              type: 'subscribe_location',
              payload: { locationId },
            })
          );
        };

        websocket.onmessage = (event) => {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'queue_update':
              setQueues((prev) => ({
                ...prev,
                [message.payload.stationId]: message.payload,
              }));
              break;

            case 'order_assigned':
              setQueues((prev) => {
                const updated = { ...prev };
                message.payload.assignedStations.forEach((assignment: any) => {
                  if (updated[assignment.stationId]) {
                    updated[assignment.stationId].orders.push(message.payload);
                  }
                });
                return updated;
              });
              break;

            case 'order_started':
              setQueues((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((stationId) => {
                  updated[stationId].orders = updated[stationId].orders.map((order) =>
                    order.id === message.payload.kitchenOrderId ? { ...order, status: 'preparing' } : order
                  );
                });
                return updated;
              });
              break;

            case 'order_completed':
              setQueues((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((stationId) => {
                  updated[stationId].orders = updated[stationId].orders.filter(
                    (order) => order.id !== message.payload.kitchenOrderId
                  );
                });
                return updated;
              });
              break;

            case 'heartbeat':
              websocket.send(JSON.stringify({ type: 'heartbeat' }));
              break;
          }
        };

        websocket.onerror = () => {
          setConnectionStatus('disconnected');
        };

        websocket.onclose = () => {
          setConnectionStatus('disconnected');

          // Attempt reconnection with exponential backoff
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            setConnectionStatus('reconnecting');
            setTimeout(() => connectWebSocket(), Math.pow(2, reconnectAttempts.current) * 1000);
          }
        };

        setWs(websocket);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        setConnectionStatus('disconnected');
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [locationId]);

  // Handle order start
  const handleStartOrder = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/kitchen/order/${orderId}/start`, {
        method: 'POST',
      });

      if (res.ok) {
        // Update local state
        setQueues((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((stationId) => {
            updated[stationId].orders = updated[stationId].orders.map((order) =>
              order.id === orderId ? { ...order, status: 'preparing', startedAt: new Date() } : order
            );
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to start order:', error);
    }
  }, []);

  // Handle order completion
  const handleCompleteOrder = useCallback(async (orderId: string) => {
    try {
      const res = await fetch(`/api/kitchen/order/${orderId}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        // Remove from queue
        setQueues((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((stationId) => {
            updated[stationId].orders = updated[stationId].orders.filter((order) => order.id !== orderId);
          });
          return updated;
        });
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to complete order:', error);
    }
  }, []);

  // Handle priority change
  const handlePriorityChange = useCallback(async (orderId: string, newPriority: number) => {
    try {
      const res = await fetch(`/api/kitchen/order/${orderId}/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (res.ok) {
        // Update local state
        setQueues((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((stationId) => {
            updated[stationId].orders = updated[stationId].orders.map((order) =>
              order.id === orderId ? { ...order, priority: newPriority } : order
            );
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  }, []);

  // Drag and drop handlers
  const handleDragStart = (order: KitchenOrder, stationId: string) => {
    setDraggedOrder(order);
    setDragSource(stationId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (stationId: string) => {
    if (!draggedOrder || !dragSource || dragSource === stationId) {
      return;
    }

    // Update priority based on drop position
    const targetQueue = queues[stationId];
    if (targetQueue) {
      const newPriority = Math.max(1, Math.min(5, draggedOrder.priority + 1));
      await handlePriorityChange(draggedOrder.id, newPriority);
    }

    setDraggedOrder(null);
    setDragSource(null);
  };

  // Filter orders
  const getFilteredOrders = (orders: KitchenOrder[]) => {
    if (filter === 'all') return orders;
    return orders.filter((order) => order.status === filter);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'preparing':
        return 'bg-blue-50 border-blue-200';
      case 'ready':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-red-100 text-red-800';
    if (priority === 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="kitchen-display-system">
      {/* Header */}
      <div className="kds-header">
        <div className="kds-title">
          <ChefHat className="w-8 h-8" />
          <h1>Kitchen Display System</h1>
        </div>

        <div className="kds-controls">
          <div className="filter-buttons">
            {(['all', 'pending', 'preparing', 'ready'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          <div className={`connection-status ${connectionStatus}`}>
            <div className="status-dot"></div>
            <span>{connectionStatus === 'connected' ? 'Live' : connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Offline'}</span>
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="stations-grid">
        {stations.map((station) => {
          const queue = queues[station.id];
          const orders = queue ? getFilteredOrders(queue.orders) : [];
          const utilizationColor =
            queue && queue.utilizationRate > 80 ? 'high' : queue && queue.utilizationRate > 50 ? 'medium' : 'low';

          return (
            <div key={station.id} className="station-card">
              {/* Station Header */}
              <div className="station-header">
                <div className="station-info">
                  <h2>{station.name}</h2>
                  <span className={`station-type ${station.type}`}>
                    {station.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="station-metrics">
                  <div className={`utilization ${utilizationColor}`}>
                    <span className="label">Utilization</span>
                    <span className="value">{queue?.utilizationRate.toFixed(0)}%</span>
                  </div>

                  <div className="queue-length">
                    <span className="label">Queue</span>
                    <span className="value">{orders.length}</span>
                  </div>

                  <div className="avg-wait">
                    <Clock className="w-4 h-4" />
                    <span>{queue?.avgWaitTime.toFixed(0)}m</span>
                  </div>
                </div>
              </div>

              {/* Orders Queue */}
              <div className="orders-queue" onDragOver={handleDragOver} onDrop={() => handleDrop(station.id)}>
                {orders.length === 0 ? (
                  <div className="empty-queue">
                    <span>No orders</span>
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className={`order-card ${getStatusColor(order.status)}`}
                      draggable
                      onDragStart={() => handleDragStart(order, station.id)}
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order Header */}
                      <div className="order-header">
                        <div className="order-id">
                          <span className="label">Order</span>
                          <span className="id">{order.orderId.slice(-4)}</span>
                        </div>

                        <div className={`priority-badge ${getPriorityColor(order.priority)}`}>
                          {order.priority === 5 ? '🔴' : order.priority === 4 ? '🟠' : '🟢'} P{order.priority}
                        </div>

                        <div className="status-badge">
                          {order.status === 'ready' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {order.status === 'preparing' && <Flame className="w-5 h-5 text-orange-600" />}
                          {order.status === 'pending' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="order-items">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="item">
                            <span className="qty">{item.quantity}x</span>
                            <span className="name">{item.itemId.slice(-10)}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && <div className="item-more">+{order.items.length - 3} more</div>}
                      </div>

                      {/* Order Timer */}
                      <div className="order-timer">
                        <span className="elapsed">
                          {order.startedAt ? Math.floor((Date.now() - new Date(order.startedAt).getTime()) / 60000) : 0}m
                        </span>
                        <span className="separator">/</span>
                        <span className="estimated">{order.estimatedPrepTime}m</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="order-actions">
                        {order.status === 'pending' && (
                          <Button size="sm" variant="default" onClick={() => handleStartOrder(order.id)}>
                            Start
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button size="sm" variant="default" onClick={() => handleCompleteOrder(order.id)}>
                            Ready
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Station Status */}
              <div className="station-status">
                {station.status === 'maintenance' && <span className="status-badge maintenance">Maintenance</span>}
                {station.status === 'inactive' && <span className="status-badge inactive">Inactive</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Panel */}
      {selectedOrder && (
        <div className="order-details-panel">
          <div className="panel-header">
            <h3>Order Details</h3>
            <button onClick={() => setSelectedOrder(null)}>✕</button>
          </div>

          <div className="panel-content">
            <div className="detail-section">
              <span className="label">Order ID</span>
              <span className="value">{selectedOrder.orderId}</span>
            </div>

            <div className="detail-section">
              <span className="label">Status</span>
              <span className={`status-badge ${selectedOrder.status}`}>{selectedOrder.status.toUpperCase()}</span>
            </div>

            <div className="detail-section">
              <span className="label">Priority</span>
              <div className="priority-selector">
                {[1, 2, 3, 4, 5].map((p) => (
                  <button
                    key={p}
                    className={`priority-btn ${selectedOrder.priority === p ? 'active' : ''}`}
                    onClick={() => handlePriorityChange(selectedOrder.id, p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <span className="label">Items</span>
              <div className="items-list">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="item">
                    <span className="qty">{item.quantity}x</span>
                    <span className="name">{item.itemId}</span>
                    {item.specialInstructions && <span className="instructions">{item.specialInstructions}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <span className="label">Estimated Time</span>
              <span className="value">{selectedOrder.estimatedPrepTime} minutes</span>
            </div>

            <div className="detail-section">
              <span className="label">Assigned Stations</span>
              <div className="stations-list">
                {selectedOrder.assignedStations.map((assignment, idx) => (
                  <div key={idx} className="station-assignment">
                    <span>{stations.find((s) => s.id === assignment.stationId)?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
