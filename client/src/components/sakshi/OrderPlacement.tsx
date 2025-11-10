import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Trash2, Phone, User, MapPin, Clock } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  preparationTime: number;
}

interface OrderPlacementProps {
  cartItems: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onPlaceOrder: (orderData: any) => void;
  isLoading?: boolean;
}

export default function OrderPlacement({
  cartItems,
  onRemoveItem,
  onUpdateQuantity,
  onPlaceOrder,
  isLoading = false,
}: OrderPlacementProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"dine_in" | "takeaway" | "delivery">(
    "dine_in"
  );
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const estimatedDeliveryFee = deliveryType === "delivery" ? 50 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const total = subtotal + estimatedDeliveryFee + tax;

  const maxPreparationTime = Math.max(
    ...(cartItems.length > 0 ? cartItems.map((item) => item.preparationTime) : [0])
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = "Name is required";
    }

    if (!customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    } else if (!/^\d{10}$/.test(customerPhone.replace(/\D/g, ""))) {
      newErrors.customerPhone = "Please enter a valid 10-digit phone number";
    }

    if (cartItems.length === 0) {
      newErrors.cart = "Please add items to your cart";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!validateForm()) {
      return;
    }

    const orderData = {
      customerName,
      customerPhone,
      deliveryType,
      items: cartItems.map((item) => ({
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      specialInstructions: specialInstructions || undefined,
      totalAmount: total,
    };

    onPlaceOrder(orderData);
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) {
                      setErrors((prev) => ({ ...prev, customerName: "" }));
                    }
                  }}
                  className={errors.customerName ? "border-red-500" : ""}
                />
                {errors.customerName && (
                  <p className="text-sm text-red-500">{errors.customerName}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  placeholder="10-digit phone number"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.customerPhone) {
                      setErrors((prev) => ({ ...prev, customerPhone: "" }));
                    }
                  }}
                  className={errors.customerPhone ? "border-red-500" : ""}
                />
                {errors.customerPhone && (
                  <p className="text-sm text-red-500">{errors.customerPhone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Type *</label>
                <Select value={deliveryType} onValueChange={(value: any) => setDeliveryType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine_in">Dine In</SelectItem>
                    <SelectItem value="takeaway">Takeaway</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {deliveryType === "delivery" && (
                <div className="bg-blue-50 rounded p-3 text-sm text-blue-800">
                  Delivery fee of ₹{estimatedDeliveryFee} will be added to your order.
                </div>
              )}

              <div className="bg-green-50 rounded p-3 flex items-center gap-2 text-sm text-green-800">
                <Clock className="h-4 w-4" />
                <span>Estimated ready time: {maxPreparationTime + 5} minutes</span>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
              <CardDescription>Any dietary restrictions or special requests?</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., No onions, Extra spicy, Allergic to nuts..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">₹{item.price * item.quantity}</span>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Your cart is empty
                  </p>
                )}
              </div>

              {cartItems.length > 0 && (
                <>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (5%)</span>
                      <span>₹{tax}</span>
                    </div>
                    {estimatedDeliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee</span>
                        <span>₹{estimatedDeliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-primary">₹{total}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isLoading || cartItems.length === 0}
                  >
                    {isLoading ? "Placing Order..." : "Place Order"}
                  </Button>
                </>
              )}

              {errors.cart && (
                <div className="bg-red-50 rounded p-3 text-sm text-red-800">{errors.cart}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
