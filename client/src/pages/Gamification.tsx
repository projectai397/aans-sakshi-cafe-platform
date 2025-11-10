import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Zap, Heart, Target, Award, TrendingUp } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  points: number;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  level: number;
  badge: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_purchase",
    name: "First Step",
    description: "Complete your first purchase",
    icon: <Star className="w-6 h-6" />,
    points: 100,
    unlockedAt: new Date(),
  },
  {
    id: "wellness_warrior",
    name: "Wellness Warrior",
    description: "Complete 10 wellness sessions",
    icon: <Heart className="w-6 h-6" />,
    points: 250,
    progress: 7,
    maxProgress: 10,
  },
  {
    id: "shopping_spree",
    name: "Shopping Spree",
    description: "Purchase 5 items from SubCircle",
    icon: <Zap className="w-6 h-6" />,
    points: 200,
    progress: 3,
    maxProgress: 5,
  },
  {
    id: "referral_master",
    name: "Referral Master",
    description: "Refer 3 friends successfully",
    icon: <Target className="w-6 h-6" />,
    points: 300,
    progress: 1,
    maxProgress: 3,
  },
  {
    id: "community_star",
    name: "Community Star",
    description: "Share 10 items on social media",
    icon: <Award className="w-6 h-6" />,
    points: 150,
    progress: 5,
    maxProgress: 10,
  },
  {
    id: "power_user",
    name: "Power User",
    description: "Use all three divisions",
    icon: <TrendingUp className="w-6 h-6" />,
    points: 400,
    progress: 2,
    maxProgress: 3,
  },
];

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Priya Singh", points: 4850, level: 12, badge: "🏆" },
  { rank: 2, name: "Rajesh Kumar", points: 4320, level: 11, badge: "🥈" },
  { rank: 3, name: "Ananya Patel", points: 3890, level: 10, badge: "🥉" },
  { rank: 4, name: "Vikram Sharma", points: 3450, level: 9, badge: "⭐" },
  { rank: 5, name: "Neha Gupta", points: 3120, level: 8, badge: "⭐" },
  { rank: 6, name: "You", points: 2850, level: 7, badge: "👤" },
  { rank: 7, name: "Arjun Verma", points: 2680, level: 7, badge: "⭐" },
  { rank: 8, name: "Divya Nair", points: 2340, level: 6, badge: "⭐" },
];

export default function Gamification() {
  const [selectedTab, setSelectedTab] = useState<"achievements" | "leaderboard" | "rewards">("achievements");
  const [userPoints, setUserPoints] = useState(2850);
  const [userLevel, setUserLevel] = useState(7);

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlockedAt).length;
  const totalPoints = ACHIEVEMENTS.reduce((sum, a) => sum + (a.unlockedAt ? a.points : 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-border p-8">
        <div className="container max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Gamification Hub</h1>
          <p className="text-muted-foreground mb-6">Earn points, unlock achievements, and climb the leaderboard!</p>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-background/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Points</p>
                    <p className="text-3xl font-bold text-cyan-500">{userPoints}</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Level</p>
                    <p className="text-3xl font-bold text-purple-500">{userLevel}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                    <p className="text-3xl font-bold text-green-500">
                      {unlockedCount}/{ACHIEVEMENTS.length}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex gap-4 mb-8 border-b border-border">
          <Button
            variant={selectedTab === "achievements" ? "default" : "ghost"}
            onClick={() => setSelectedTab("achievements")}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-cyan-500"
            data-active={selectedTab === "achievements"}
          >
            Achievements
          </Button>
          <Button
            variant={selectedTab === "leaderboard" ? "default" : "ghost"}
            onClick={() => setSelectedTab("leaderboard")}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-cyan-500"
            data-active={selectedTab === "leaderboard"}
          >
            Leaderboard
          </Button>
          <Button
            variant={selectedTab === "rewards" ? "default" : "ghost"}
            onClick={() => setSelectedTab("rewards")}
            className="rounded-none border-b-2 border-transparent data-[active=true]:border-cyan-500"
            data-active={selectedTab === "rewards"}
          >
            Rewards
          </Button>
        </div>

        {/* Achievements Tab */}
        {selectedTab === "achievements" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`${achievement.unlockedAt ? "border-cyan-500/50 bg-cyan-500/5" : "opacity-50"}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>

                        {achievement.progress !== undefined && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Progress</span>
                              <span>
                                {achievement.progress}/{achievement.maxProgress}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-cyan-500 h-2 rounded-full transition-all"
                                style={{
                                  width: `${(achievement.progress! / achievement.maxProgress!) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">+{achievement.points} pts</Badge>
                          {achievement.unlockedAt && (
                            <span className="text-xs text-green-500">✓ Unlocked</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {selectedTab === "leaderboard" && (
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {LEADERBOARD.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      entry.name === "You"
                        ? "bg-cyan-500/10 border-cyan-500/50"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold w-8">{entry.badge}</span>
                      <div>
                        <p className="font-semibold">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">Level {entry.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rewards Tab */}
        {selectedTab === "rewards" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redeem Your Points</CardTitle>
                <CardDescription>Use your points for exclusive rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: "₹100 Discount", cost: 500, icon: "🎁" },
                    { name: "Free Wellness Session", cost: 750, icon: "💆" },
                    { name: "₹500 SubCircle Credit", cost: 1000, icon: "🛍️" },
                    { name: "Premium AVE Features", cost: 1500, icon: "⭐" },
                    { name: "Exclusive Merchandise", cost: 2000, icon: "👕" },
                    { name: "VIP Event Access", cost: 3000, icon: "🎉" },
                  ].map((reward, idx) => (
                    <Card key={idx} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <p className="text-4xl mb-2">{reward.icon}</p>
                          <h3 className="font-bold mb-2">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{reward.cost} points</p>
                          <Button
                            size="sm"
                            disabled={userPoints < reward.cost}
                            className="w-full"
                          >
                            {userPoints >= reward.cost ? "Redeem" : "Not Enough Points"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
