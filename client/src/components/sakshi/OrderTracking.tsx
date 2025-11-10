import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
  Phone,
  MessageSquare,
  Copy,
  AlertCircle,
} from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  deliveryType: "dine_in" | "takeaway" | "delivery";
  estimatedReadyTime?: Date;
  actualReadyTime?: Date;
  specialInstructions?: string;
  createdAt: Date;
}

interface OrderTrackingProps {
  order: Order;
  onCancel?: () => void;
  onContact?: () => void;
}

export default function OrderTracking({ order, onCancel, onContact }: OrderTrackingProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!order.estimatedReadyTime) return;

      const now = new Date();
      const estimated = new Date(order.estimatedReadyTime);
      const diff = estimated.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining("Ready now!");
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [order.estimatedReadyTime]);

  const getStatusSteps = () => {
    const steps = [
      { status: "pending", label: "Order Placed", icon: Clock },
      { status: "confirmed", label: "Confirmed", icon: CheckCircle2 },
      { status: "preparing", label: "Preparing", icon: ChefHat },
      { status: "ready", label: "Ready", icon: Package },
      { status: "completed", label: "Completed", icon: CheckCircle2 },
    ];

    const currentIndex = steps.findIndex((step) => step.status === order.status);
    return steps.map((step, index) => ({
      ...step,
      isActive: index === currentIndex,
      isCompleted: index < currentIndex,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-purple-100 text-purple-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusMessage = () => {
    switch (order.status) {
      case "pending":
        return "Your order has been received. We're confirming it now.";
      case "confirmed":
        return "Your order has been confirmed. We're starting to prepare it.";
      case "preparing":
        return "Your order is being prepared with fresh ingredients.";
      case "ready":
        return "Your order is ready! Please come pick it up.";
      case "completed":
        return "Thank you for your order! We hope you enjoyed it.";
      case "cancelled":
        return "Your order has been cancelled.";
      default:
        return "Tracking your order...";
    }
  };

  const steps = getStatusSteps();

  return (
    <div className="w-full space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
              <CardDescription>
                Placed on {new Date(order.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Message */}
          <div className="bg-blue-50 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">{getStatusMessage()}</p>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.status} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`rounded-full p-2 ${
                        step.isCompleted || step.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-0.5 h-12 mt-2 ${
                          step.isCompleted ? "bg-green-200" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`font-medium ${
                        step.isCompleted || step.isActive
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.isActive && order.estimatedReadyTime && (
                      <p className="text-sm text-green-600 font-medium">{timeRemaining}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Estimate */}
          {order.estimatedReadyTime && order.status !== "completed" && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm font-medium text-green-900 mb-1">Estimated Ready Time</p>
              <p className="text-lg font-bold text-green-600">
                {new Date(order.estimatedReadyTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items */}
          <div className="space-y-2">
            <h4 className="font-medium">Items</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (5%)</span>
              <span>
                ₹
                {Math.round(
                  order.items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.05
                )}
              </span>
            </div>
            {order.deliveryType === "delivery" && (
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>₹50</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span className="text-primary">₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Delivery Type */}
          <div className="bg-gray-50 rounded p-3">
            <p className="text-sm font-medium mb-1">Delivery Type</p>
            <p className="text-sm text-muted-foreground">
              {order.deliveryType === "dine_in"
                ? "Dine In"
                : order.deliveryType === "takeaway"
                  ? "Takeaway"
                  : "Delivery"}
            </p>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-blue-50 rounded p-3">
              <p className="text-sm font-medium mb-1">Special Instructions</p>
              <p className="text-sm text-blue-800">{order.specialInstructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customerPhone}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(order.customerPhone);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? "Copied" : "Copy"}
              </Button>
              {onContact && (
                <Button variant="outline" size="sm" onClick={onContact}>
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {order.status !== "completed" && order.status !== "cancelled" && (
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel Order
            </Button>
          )}
          <Button className="flex-1" variant="default">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
        </div>
      )}
    </div>
  );
}
