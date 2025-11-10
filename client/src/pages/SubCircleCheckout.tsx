import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CreditCard, Building2, Smartphone, Trash2, Plus, Minus } from "lucide-react";

type PaymentMethod = "stripe" | "razorpay" | "bank" | "upi";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "Organic Cotton T-Shirt",
    price: 499,
    category: "Apparel",
    image: "🌿",
  },
  {
    id: 2,
    name: "Handmade Ceramic Mug",
    price: 799,
    category: "Home",
    image: "🏺",
  },
  {
    id: 3,
    name: "Sustainable Backpack",
    price: 1299,
    category: "Accessories",
    image: "🎒",
  },
];

const PAYMENT_METHODS = [
  { id: "stripe", name: "Credit/Debit Card", icon: CreditCard },
  { id: "razorpay", name: "Razorpay", icon: CreditCard },
  { id: "bank", name: "Bank Transfer", icon: Building2 },
  { id: "upi", name: "UPI", icon: Smartphone },
];

export default function SubCircleCheckout() {
  const [cart, setCart] = useState<CartItem[]>([
    { ...SAMPLE_PRODUCTS[0], quantity: 1 },
    { ...SAMPLE_PRODUCTS[1], quantity: 1 },
  ]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const updateQuantity = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 1000 ? 0 : 100;
  const total = subtotal + tax + shipping;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOrderCreated(true);
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderCreated) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center border-green-500/30 bg-green-500/5">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h2>
              <p className="text-muted-foreground">Your SubCircle order has been placed successfully.</p>
            </div>

            <div className="bg-card rounded-lg p-6 mb-6 text-left">
              <p className="text-sm text-muted-foreground mb-2">Items Ordered: {cart.length}</p>
              <p className="text-lg font-semibold text-foreground mb-4">Total: ₹{total.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">
                Confirmation email sent. Your order will be shipped within 2-3 business days.
              </p>
            </div>

            <Button onClick={() => setOrderCreated(false)} className="w-full">
              Continue Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">SubCircle Checkout</h1>
          <p className="text-xl text-muted-foreground">Support sustainable creators and get unique products</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Shopping Cart</h2>

              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="text-4xl">{item.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right min-w-24">
                        <p className="font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-500/10 rounded text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Select Payment Method</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                      className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        selectedPayment === method.id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-border hover:border-cyan-500/50"
                      }`}
                    >
                      <Icon className="w-5 h-5 text-cyan-500" />
                      <span className="text-sm font-medium text-foreground">{method.name}</span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-bold text-foreground mb-6">Order Summary</h3>

              <div className="space-y-3 pb-4 border-b border-border mb-4">
                <div className="flex justify-between">
                  <span className="text-foreground">Subtotal</span>
                  <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Tax (18%)</span>
                  <span className="text-foreground">₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-green-500 font-semibold" : "text-foreground"}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-cyan-500">₹{total.toLocaleString()}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 text-lg mb-4"
              >
                {isProcessing ? "Processing..." : "Complete Purchase"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Secure payment. All transactions are encrypted.
              </p>

              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Support Creators</h4>
                <p className="text-xs text-muted-foreground">
                  Every purchase directly supports independent creators and sustainable fashion brands.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
