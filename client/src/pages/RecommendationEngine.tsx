import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, TrendingUp, Heart, Eye, Zap, Filter } from "lucide-react";

interface Recommendation {
  id: string;
  title: string;
  type: "article" | "product" | "program";
  division: string;
  rating: number;
  reviews: number;
  price?: number;
  matchScore: number;
  reason: string;
  image?: string;
}

const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "1",
    title: "Advanced Mindfulness Meditation",
    type: "program",
    division: "Sakshi",
    rating: 4.8,
    reviews: 234,
    matchScore: 98,
    reason: "Based on your wellness interests",
  },
  {
    id: "2",
    title: "Sustainable Fashion Guide 2025",
    type: "article",
    division: "SubCircle",
    rating: 4.6,
    reviews: 156,
    matchScore: 95,
    reason: "Trending in your favorite category",
  },
  {
    id: "3",
    title: "Premium Handmade Leather Bag",
    type: "product",
    division: "SubCircle",
    price: 2499,
    rating: 4.9,
    reviews: 89,
    matchScore: 92,
    reason: "Similar to items you loved",
  },
  {
    id: "4",
    title: "Business Automation Masterclass",
    type: "program",
    division: "AVE",
    rating: 4.7,
    reviews: 312,
    matchScore: 88,
    reason: "Recommended by similar users",
  },
  {
    id: "5",
    title: "Yoga for Flexibility",
    type: "program",
    division: "Sakshi",
    rating: 4.5,
    reviews: 178,
    matchScore: 85,
    reason: "Complements your current programs",
  },
  {
    id: "6",
    title: "Eco-Friendly Home Products",
    type: "article",
    division: "SubCircle",
    rating: 4.4,
    reviews: 92,
    matchScore: 82,
    reason: "Based on your browsing history",
  },
];

const RECOMMENDATION_REASONS = [
  "Based on your wellness interests",
  "Trending in your favorite category",
  "Similar to items you loved",
  "Recommended by similar users",
  "Complements your current programs",
  "Based on your browsing history",
  "Popular among your network",
  "New in your favorite category",
];

export default function RecommendationEngine() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"match" | "rating" | "recent">("match");

  const filteredRecommendations = MOCK_RECOMMENDATIONS.filter((rec) => {
    if (selectedType && rec.type !== selectedType) return false;
    if (selectedDivision && rec.division !== selectedDivision) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "match") return b.matchScore - a.matchScore;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const avgMatchScore = (
    MOCK_RECOMMENDATIONS.reduce((sum, r) => sum + r.matchScore, 0) /
    MOCK_RECOMMENDATIONS.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Personalized Recommendations</h1>
          <p className="text-muted-foreground">
            AI-powered suggestions based on your interests and behavior
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Avg Match Score</p>
                <p className="text-3xl font-bold text-cyan-500">{avgMatchScore}%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Recommendations</p>
                <p className="text-3xl font-bold text-foreground">
                  {MOCK_RECOMMENDATIONS.length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Avg Rating</p>
                <p className="text-3xl font-bold text-foreground">
                  {(
                    MOCK_RECOMMENDATIONS.reduce((sum, r) => sum + r.rating, 0) /
                    MOCK_RECOMMENDATIONS.length
                  ).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-foreground">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Type</label>
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
              >
                <option value="">All Types</option>
                <option value="article">Article</option>
                <option value="product">Product</option>
                <option value="program">Program</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Division</label>
              <select
                value={selectedDivision || ""}
                onChange={(e) => setSelectedDivision(e.target.value || null)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
              >
                <option value="">All Divisions</option>
                <option value="AVE">AVE</option>
                <option value="Sakshi">Sakshi</option>
                <option value="SubCircle">SubCircle</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "match" | "rating" | "recent")}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
              >
                <option value="match">Match Score</option>
                <option value="rating">Rating</option>
                <option value="recent">Recent</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedType(null);
                  setSelectedDivision(null);
                  setSortBy("match");
                }}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredRecommendations.map((rec) => (
            <Card
              key={rec.id}
              className="overflow-hidden hover:border-cyan-500/50 transition-colors group"
            >
              {/* Image Placeholder */}
              <div className="h-40 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-colors">
                <Eye className="w-12 h-12 text-muted-foreground/50" />
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Type Badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-cyan-500/20 text-cyan-700 px-2 py-1 rounded">
                    {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                  </span>
                  <span className="text-xs bg-purple-500/20 text-purple-700 px-2 py-1 rounded">
                    {rec.division}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{rec.title}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(rec.rating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {rec.rating} ({rec.reviews})
                  </span>
                </div>

                {/* Match Score */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">Match Score</span>
                    <span className="text-xs font-bold text-cyan-500">{rec.matchScore}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${rec.matchScore}%` }}
                    />
                  </div>
                </div>

                {/* Reason */}
                <p className="text-xs text-muted-foreground mb-4 italic">{rec.reason}</p>

                {/* Price & Button */}
                <div className="flex items-center justify-between">
                  {rec.price && (
                    <span className="font-bold text-cyan-500">₹{rec.price}</span>
                  )}
                  <Button className="ml-auto bg-cyan-500 hover:bg-cyan-600 text-white" size="sm">
                    <Heart className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* How It Works */}
        <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/50">
          <h3 className="text-lg font-bold text-foreground mb-4">How Our AI Recommends</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">👁️ Browsing History</h4>
              <p className="text-sm text-muted-foreground">
                We analyze what you view and how long you spend on each item
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">❤️ Preferences</h4>
              <p className="text-sm text-muted-foreground">
                Your likes, ratings, and saved items shape recommendations
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">👥 Collaborative</h4>
              <p className="text-sm text-muted-foreground">
                We learn from similar users to find hidden gems for you
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">🎯 Trending</h4>
              <p className="text-sm text-muted-foreground">
                Popular items in your categories get boosted in recommendations
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
