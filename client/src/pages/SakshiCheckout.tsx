import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, CreditCard, Building2, Smartphone } from "lucide-react";

type MembershipTier = "essential" | "premium" | "elite";
type PaymentMethod = "stripe" | "razorpay" | "bank" | "upi";

const MEMBERSHIP_TIERS = {
  essential: {
    name: "Essential",
    price: 999,
    duration: "1 Month",
    features: [
      "Access to 3 wellness centers",
      "5 classes per month",
      "Basic fitness tracking",
      "Community access",
      "Email support",
    ],
  },
  premium: {
    name: "Premium",
    price: 2499,
    duration: "3 Months",
    features: [
      "Access to all 7 wellness centers",
      "Unlimited classes",
      "Advanced fitness tracking",
      "1-on-1 coaching sessions",
      "Priority support",
      "Exclusive events",
    ],
  },
  elite: {
    name: "Elite",
    price: 4999,
    duration: "6 Months",
    features: [
      "Access to all 7 wellness centers",
      "Unlimited classes + workshops",
      "Personal trainer access",
      "Nutrition consultation",
      "VIP events",
      "24/7 premium support",
      "Wellness retreat access",
    ],
  },
};

const PAYMENT_METHODS = [
  { id: "stripe", name: "Credit/Debit Card (Stripe)", icon: CreditCard },
  { id: "razorpay", name: "Razorpay", icon: CreditCard },
  { id: "bank", name: "Bank Transfer", icon: Building2 },
  { id: "upi", name: "UPI", icon: Smartphone },
];

export default function SakshiCheckout() {
  const [selectedTier, setSelectedTier] = useState<MembershipTier>("premium");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);

  const tier = MEMBERSHIP_TIERS[selectedTier];
  const totalAmount = tier.price;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call to create order
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In real implementation, this would call the tRPC endpoint
      // const result = await trpc.payments.createOrder.mutate({
      //   orderType: "membership",
      //   division: "sakshi",
      //   itemName: `Sakshi ${tier.name} Membership`,
      //   amount: totalAmount,
      //   paymentMethod: selectedPayment,
      // });

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
              <p className="text-muted-foreground">Your membership order has been created successfully.</p>
            </div>

            <div className="bg-card rounded-lg p-6 mb-6 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Membership Tier</p>
                  <p className="text-lg font-semibold text-foreground">{tier.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-lg font-semibold text-foreground">{tier.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-semibold text-foreground">₹{totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="text-lg font-semibold text-foreground capitalize">{selectedPayment}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              A confirmation email has been sent to your registered email address. You can now access all membership benefits.
            </p>

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
          <h1 className="text-4xl font-bold text-foreground mb-4">Sakshi Membership Checkout</h1>
          <p className="text-xl text-muted-foreground">Choose your wellness journey and get started today</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {(Object.entries(MEMBERSHIP_TIERS) as [MembershipTier, typeof MEMBERSHIP_TIERS[MembershipTier]][]).map(
            ([key, tierData]) => (
              <Card
                key={key}
                className={`p-6 cursor-pointer transition-all ${
                  selectedTier === key
                    ? "border-cyan-500 border-2 bg-cyan-500/5"
                    : "border-border hover:border-cyan-500/50"
                }`}
                onClick={() => setSelectedTier(key)}
              >
                <h3 className="text-2xl font-bold text-foreground mb-2">{tierData.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-cyan-500">₹{tierData.price}</span>
                  <span className="text-muted-foreground ml-2">/ {tierData.duration}</span>
                </div>

                <div className="space-y-3 mb-6">
                  {tierData.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full ${
                    selectedTier === key
                      ? "bg-cyan-500 hover:bg-cyan-600"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                  onClick={() => setSelectedTier(key)}
                >
                  {selectedTier === key ? "Selected" : "Select Plan"}
                </Button>
              </Card>
            )
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
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

            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Order Summary</h2>

              <div className="space-y-3 pb-4 border-b border-border mb-4">
                <div className="flex justify-between">
                  <span className="text-foreground">Sakshi {tier.name} Membership</span>
                  <span className="text-foreground">₹{tier.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duration: {tier.duration}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-bold text-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-cyan-500">₹{totalAmount.toLocaleString()}</span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 text-lg"
              >
                {isProcessing ? "Processing..." : "Proceed to Payment"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Your payment is secure and encrypted. We accept all major payment methods.
              </p>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-cyan-500/5 border-cyan-500/30">
              <h3 className="font-bold text-foreground mb-4">Benefits of {tier.name}</h3>
              <ul className="space-y-3">
                {tier.features.slice(0, 4).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
