import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Share2, TrendingUp, Gift, Users, Award } from "lucide-react";

interface Referral {
  id: string;
  name: string;
  email: string;
  status: "pending" | "active" | "completed";
  joinDate?: string;
  reward?: number;
  division: string;
}

const MOCK_REFERRALS: Referral[] = [
  {
    id: "1",
    name: "Rahul Kumar",
    email: "rahul@example.com",
    status: "active",
    joinDate: "2025-01-10",
    reward: 500,
    division: "Sakshi",
  },
  {
    id: "2",
    name: "Priya Sharma",
    email: "priya@example.com",
    status: "active",
    joinDate: "2025-01-08",
    reward: 500,
    division: "SubCircle",
  },
  {
    id: "3",
    name: "Amit Patel",
    email: "amit@example.com",
    status: "pending",
    division: "AVE",
  },
  {
    id: "4",
    name: "Neha Singh",
    email: "neha@example.com",
    status: "completed",
    joinDate: "2025-01-05",
    reward: 1000,
    division: "Sakshi",
  },
];

const REWARD_TIERS = [
  { tier: 1, referrals: 1, reward: 500, badge: "Bronze Referrer" },
  { tier: 2, referrals: 5, reward: 2500, badge: "Silver Referrer" },
  { tier: 3, referrals: 10, reward: 6000, badge: "Gold Referrer" },
  { tier: 4, referrals: 20, reward: 15000, badge: "Platinum Referrer" },
];

export default function ReferralProgram() {
  const [referrals, setReferrals] = useState<Referral[]>(MOCK_REFERRALS);
  const [copied, setCopied] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  const referralLink = "https://aans.space/ref/USER123456";
  const activeReferrals = referrals.filter((r) => r.status === "active" || r.status === "completed").length;
  const totalRewards = referrals.reduce((sum, r) => sum + (r.reward || 0), 0);
  const pendingReferrals = referrals.filter((r) => r.status === "pending").length;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTier = REWARD_TIERS.find((t) => activeReferrals >= t.referrals) || REWARD_TIERS[0];
  const nextTier = REWARD_TIERS[Math.min(REWARD_TIERS.indexOf(currentTier) + 1, REWARD_TIERS.length - 1)];

  const filteredReferrals = selectedDivision
    ? referrals.filter((r) => r.division === selectedDivision)
    : referrals;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Referral Program</h1>
          <p className="text-muted-foreground">Earn rewards by inviting friends to join AANS</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Active Referrals</p>
                <p className="text-3xl font-bold text-foreground">{activeReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Pending</p>
                <p className="text-3xl font-bold text-foreground">{pendingReferrals}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Rewards</p>
                <p className="text-3xl font-bold text-cyan-500">₹{totalRewards}</p>
              </div>
              <Gift className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Current Tier</p>
                <p className="text-lg font-bold text-foreground">{currentTier.badge}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Referral Link & Tiers */}
          <div className="lg:col-span-1 space-y-6">
            {/* Referral Link */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Your Referral Link</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  className="bg-cyan-500 hover:bg-cyan-600"
                  size="sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              {copied && <p className="text-xs text-green-500">Copied to clipboard!</p>}

              <div className="space-y-2">
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 mb-2">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share on Social
                </Button>
                <Button variant="outline" className="w-full">
                  Email Friends
                </Button>
              </div>
            </Card>

            {/* Reward Tiers */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Reward Tiers</h2>
              <div className="space-y-3">
                {REWARD_TIERS.map((tier) => (
                  <div
                    key={tier.tier}
                    className={`p-3 rounded-lg border ${
                      activeReferrals >= tier.referrals
                        ? "bg-cyan-500/10 border-cyan-500"
                        : "bg-muted border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground">{tier.badge}</p>
                      <span className="text-xs text-muted-foreground">{tier.referrals} referrals</span>
                    </div>
                    <p className="text-sm text-cyan-500 font-bold">₹{tier.reward} reward</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Progress to Next Tier */}
            {activeReferrals < nextTier.referrals && (
              <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/50">
                <h3 className="text-sm font-bold text-foreground mb-3">Next Tier: {nextTier.badge}</h3>
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(activeReferrals / nextTier.referrals) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextTier.referrals - activeReferrals} more referrals to unlock
                </p>
              </Card>
            )}
          </div>

          {/* Right Column - Referrals List */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">Your Referrals</h2>
                <select
                  value={selectedDivision || ""}
                  onChange={(e) => setSelectedDivision(e.target.value || null)}
                  className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
                >
                  <option value="">All Divisions</option>
                  <option value="AVE">AVE</option>
                  <option value="Sakshi">Sakshi</option>
                  <option value="SubCircle">SubCircle</option>
                </select>
              </div>

              <div className="space-y-3">
                {filteredReferrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border hover:border-cyan-500/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{referral.name}</p>
                      <p className="text-xs text-muted-foreground">{referral.email}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            referral.status === "active"
                              ? "bg-green-500/20 text-green-700"
                              : referral.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-700"
                                : "bg-blue-500/20 text-blue-700"
                          }`}
                        >
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </span>
                        {referral.joinDate && (
                          <p className="text-xs text-muted-foreground mt-1">{referral.joinDate}</p>
                        )}
                      </div>

                      {referral.reward && (
                        <div className="text-right">
                          <p className="font-bold text-cyan-500">₹{referral.reward}</p>
                          <p className="text-xs text-muted-foreground">{referral.division}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredReferrals.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No referrals yet. Start sharing your link!</p>
                </div>
              )}
            </Card>

            {/* How It Works */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-bold text-foreground mb-4">How It Works</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <span className="text-cyan-500 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Share Your Link</p>
                    <p className="text-sm text-muted-foreground">Copy and share your unique referral link with friends</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <span className="text-cyan-500 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">They Join</p>
                    <p className="text-sm text-muted-foreground">Friends sign up using your link and join any division</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <span className="text-cyan-500 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">You Earn</p>
                    <p className="text-sm text-muted-foreground">Get ₹500 per active referral and unlock reward tiers</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
