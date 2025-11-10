import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Gift, Building2, Heart, Palette } from "lucide-react";

interface TokenRedemption {
  name: string;
  tokensRequired: number;
  description: string;
}

export default function SevaTokenCalculator() {
  const [division, setDivision] = useState<"ave" | "sakshi" | "subcircle">("ave");
  const [activity, setActivity] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [totalTokens, setTotalTokens] = useState<number>(0);

  // Token earning rates by division and activity
  const tokenRates = {
    ave: {
      "efficiency-improvement": { name: "Efficiency Improvement (10%)", tokensPerUnit: 500, unit: "per improvement" },
      "esg-milestone": { name: "ESG Milestone Achievement", tokensPerUnit: 1000, unit: "per milestone" },
      "employee-wellness": { name: "Employee Wellness Program", tokensPerUnit: 750, unit: "per 10 employees" },
      "customer-milestone": { name: "Customer Milestone (100 customers)", tokensPerUnit: 2000, unit: "per milestone" },
    },
    sakshi: {
      "purchase": { name: "Purchase (₹100 spent)", tokensPerUnit: 10, unit: "per ₹100" },
      "wellness-milestone": { name: "Wellness Milestone", tokensPerUnit: 500, unit: "per milestone" },
      "community-participation": { name: "Community Participation", tokensPerUnit: 250, unit: "per event" },
      "referral": { name: "Successful Referral", tokensPerUnit: 1000, unit: "per referral" },
    },
    subcircle: {
      "sustainable-purchase": { name: "Sustainable Fashion Purchase", tokensPerUnit: 50, unit: "per piece" },
      "event-attendance": { name: "Event Attendance", tokensPerUnit: 200, unit: "per event" },
      "creator-contribution": { name: "Creator Contribution", tokensPerUnit: 500, unit: "per contribution" },
      "circle-membership": { name: "Circle Membership (Monthly)", tokensPerUnit: 300, unit: "per month" },
    },
  };

  const redemptions: Record<string, TokenRedemption[]> = {
    ave: [
      { name: "Premium Module Upgrade", tokensRequired: 5000, description: "Unlock advanced features" },
      { name: "Training Program (3 months)", tokensRequired: 3000, description: "Professional development" },
      { name: "Sakshi Wellness Package", tokensRequired: 2000, description: "Employee wellness benefit" },
      { name: "SubCircle Culture Pass", tokensRequired: 1500, description: "Quarterly cultural events" },
    ],
    sakshi: [
      { name: "Premium Membership (1 month)", tokensRequired: 500, description: "All center access" },
      { name: "Exclusive Wellness Retreat", tokensRequired: 3000, description: "Weekend wellness package" },
      { name: "Organic Product Bundle", tokensRequired: 1000, description: "Curated sustainable goods" },
      { name: "Social Impact Donation", tokensRequired: 2000, description: "Community project funding" },
    ],
    subcircle: [
      { name: "Premium Thrift Piece (₹5000 value)", tokensRequired: 2000, description: "Exclusive fashion item" },
      { name: "Event VIP Ticket (SUB CIRCLE VOL.)", tokensRequired: 1000, description: "Premium access + perks" },
      { name: "Creator Collaboration", tokensRequired: 1500, description: "Feature your work" },
      { name: "Circle Membership (3 months)", tokensRequired: 800, description: "Premium community access" },
    ],
  };

  const currentRates = tokenRates[division];
  const currentRedemptions = redemptions[division];

  const handleActivityChange = (newActivity: string) => {
    setActivity(newActivity);
    setQuantity(1);
    calculateTokens(newActivity, 1);
  };

  const calculateTokens = (act: string, qty: number) => {
    if (!act) {
      setTotalTokens(0);
      return;
    }
    const rate = currentRates[act as keyof typeof currentRates] as any;
    if (rate) {
      setTotalTokens(rate.tokensPerUnit * qty);
    }
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    setQuantity(newQty);
    calculateTokens(activity, newQty);
  };

  const getDivisionColor = () => {
    switch (division) {
      case "ave":
        return "text-primary";
      case "sakshi":
        return "text-accent";
      case "subcircle":
        return "text-primary";
      default:
        return "text-primary";
    }
  };

  const getDivisionBgColor = () => {
    switch (division) {
      case "ave":
        return "bg-primary/5 border-primary/20";
      case "sakshi":
        return "bg-accent/5 border-accent/20";
      case "subcircle":
        return "bg-primary/5 border-primary/20";
      default:
        return "bg-primary/5 border-primary/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Division Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className={`h-5 w-5 ${getDivisionColor()}`} />
            Select Your Division
          </CardTitle>
          <CardDescription>
            Choose which division you belong to to calculate your Seva Token earnings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setDivision("ave");
                setActivity("");
                setQuantity(1);
                setTotalTokens(0);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                division === "ave"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-semibold">AVE</span>
              </div>
              <p className="text-sm text-muted-foreground">Business Automation</p>
            </button>

            <button
              onClick={() => {
                setDivision("sakshi");
                setActivity("");
                setQuantity(1);
                setTotalTokens(0);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                division === "sakshi"
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-5 w-5 text-accent" />
                <span className="font-semibold">Sakshi</span>
              </div>
              <p className="text-sm text-muted-foreground">Wellness & Living</p>
            </button>

            <button
              onClick={() => {
                setDivision("subcircle");
                setActivity("");
                setQuantity(1);
                setTotalTokens(0);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                division === "subcircle"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-primary" />
                <span className="font-semibold">SubCircle</span>
              </div>
              <p className="text-sm text-muted-foreground">Culture & Thrift</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Activity and Quantity Selector */}
      <Card className={`border-2 ${getDivisionBgColor()}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className={`h-5 w-5 ${getDivisionColor()}`} />
            Calculate Your Earnings
          </CardTitle>
          <CardDescription>
            Select an activity and quantity to see how many Seva Tokens you can earn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Select Activity</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(currentRates).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleActivityChange(key)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    activity === key
                      ? getDivisionColor() === "text-primary"
                        ? "border-primary bg-primary/10"
                        : "border-accent bg-accent/10"
                      : "border-border hover:border-border/80"
                  }`}
                >
                  <div className="font-medium text-sm">{value.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(value as any).tokensPerUnit} tokens {(value as any).unit}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          {activity && (
            <div className="space-y-3">
              <label className="text-sm font-medium">
                Quantity ({(currentRates[activity as keyof typeof currentRates] as any)?.unit})
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-card transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    handleQuantityChange(val);
                  }}
                  className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-card transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Token Earnings Display */}
          {activity && (
            <div className={`p-6 rounded-lg ${getDivisionBgColor()} border-2`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Tokens Earned</p>
                  <p className={`text-4xl font-bold ${getDivisionColor()}`}>{totalTokens.toLocaleString()}</p>
                </div>
                <Coins className={`h-12 w-12 ${getDivisionColor()} opacity-20`} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redemption Options */}
      {activity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className={`h-5 w-5 ${getDivisionColor()}`} />
              What Can You Redeem?
            </CardTitle>
            <CardDescription>
              Use your {totalTokens.toLocaleString()} tokens to redeem these benefits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {currentRedemptions.map((redemption, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    totalTokens >= redemption.tokensRequired
                      ? getDivisionColor() === "text-primary"
                        ? "border-primary/50 bg-primary/5"
                        : "border-accent/50 bg-accent/5"
                      : "border-border/50 bg-muted/20 opacity-60"
                  } transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{redemption.name}</h4>
                    <Badge
                      variant={
                        totalTokens >= redemption.tokensRequired ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {redemption.tokensRequired.toLocaleString()} tokens
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{redemption.description}</p>
                  {totalTokens >= redemption.tokensRequired && (
                    <p className="text-xs text-primary font-medium mt-2">✓ You can redeem this!</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
