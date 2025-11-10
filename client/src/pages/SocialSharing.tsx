import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Share2, Facebook, Twitter, Linkedin, Mail, Copy, TrendingUp, Eye, Heart, MessageCircle } from "lucide-react";

interface ShareMetric {
  platform: string;
  icon: any;
  shares: number;
  clicks: number;
  engagement: number;
  color: string;
}

const MOCK_METRICS: ShareMetric[] = [
  {
    platform: "Facebook",
    icon: Facebook,
    shares: 245,
    clicks: 1203,
    engagement: 8.5,
    color: "bg-blue-600",
  },
  {
    platform: "Twitter",
    icon: Twitter,
    shares: 189,
    clicks: 892,
    engagement: 6.2,
    color: "bg-sky-500",
  },
  {
    platform: "LinkedIn",
    icon: Linkedin,
    shares: 156,
    clicks: 734,
    engagement: 5.1,
    color: "bg-blue-700",
  },
  {
    platform: "Email",
    icon: Mail,
    shares: 312,
    clicks: 1456,
    engagement: 10.1,
    color: "bg-red-600",
  },
];

interface SharedContent {
  id: string;
  title: string;
  type: "article" | "product" | "program";
  platform: string;
  date: string;
  shares: number;
  clicks: number;
  engagement: number;
}

const MOCK_SHARED_CONTENT: SharedContent[] = [
  {
    id: "1",
    title: "Mindfulness Meditation for Beginners",
    type: "article",
    platform: "Facebook",
    date: "2025-01-15",
    shares: 45,
    clicks: 234,
    engagement: 7.2,
  },
  {
    id: "2",
    title: "Sustainable Fashion Guide",
    type: "article",
    platform: "LinkedIn",
    date: "2025-01-14",
    shares: 38,
    clicks: 189,
    engagement: 5.8,
  },
  {
    id: "3",
    title: "Premium Handmade Leather Wallet",
    type: "product",
    platform: "Instagram",
    date: "2025-01-13",
    shares: 67,
    clicks: 412,
    engagement: 9.1,
  },
  {
    id: "4",
    title: "Yoga and Flexibility Class",
    type: "program",
    platform: "Twitter",
    date: "2025-01-12",
    shares: 29,
    clicks: 145,
    engagement: 4.3,
  },
  {
    id: "5",
    title: "Business Automation with AVE",
    type: "article",
    platform: "Email",
    date: "2025-01-11",
    shares: 156,
    clicks: 723,
    engagement: 11.2,
  },
];

export default function SocialSharing() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const totalShares = MOCK_METRICS.reduce((sum, m) => sum + m.shares, 0);
  const totalClicks = MOCK_METRICS.reduce((sum, m) => sum + m.clicks, 0);
  const avgEngagement = (MOCK_METRICS.reduce((sum, m) => sum + m.engagement, 0) / MOCK_METRICS.length).toFixed(1);

  const shareLink = "https://aans.space/article/mindfulness-meditation";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredContent = selectedPlatform
    ? MOCK_SHARED_CONTENT.filter((c) => c.platform === selectedPlatform)
    : MOCK_SHARED_CONTENT;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Social Sharing Analytics</h1>
          <p className="text-muted-foreground">Track and optimize your content sharing across social platforms</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Shares</p>
                <p className="text-3xl font-bold text-foreground">{totalShares}</p>
              </div>
              <Share2 className="w-8 h-8 text-cyan-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total Clicks</p>
                <p className="text-3xl font-bold text-foreground">{totalClicks}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Avg Engagement</p>
                <p className="text-3xl font-bold text-cyan-500">{avgEngagement}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Content Pieces</p>
                <p className="text-3xl font-bold text-foreground">{MOCK_SHARED_CONTENT.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Platform Performance */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-6">Platform Performance</h2>
              <div className="space-y-4">
                {MOCK_METRICS.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.platform}
                      className="p-4 bg-muted rounded-lg border border-border hover:border-cyan-500/50 transition-colors cursor-pointer"
                      onClick={() =>
                        setSelectedPlatform(
                          selectedPlatform === metric.platform ? null : metric.platform
                        )
                      }
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`${metric.color} p-2 rounded-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{metric.platform}</p>
                            <p className="text-xs text-muted-foreground">
                              {metric.engagement}% engagement rate
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Shares</p>
                          <p className="text-lg font-bold text-foreground">{metric.shares}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Clicks</p>
                          <p className="text-lg font-bold text-cyan-500">{metric.clicks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">CTR</p>
                          <p className="text-lg font-bold text-green-500">
                            {((metric.clicks / metric.shares) * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Quick Share */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Quick Share</h2>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-xs"
                    />
                    <Button
                      onClick={copyToClipboard}
                      size="sm"
                      className="bg-cyan-500 hover:bg-cyan-600"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  {copied && <p className="text-xs text-green-500 mt-1">Copied!</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </Button>
                <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
                <Button className="w-full bg-blue-700 hover:bg-blue-800 text-white">
                  <Linkedin className="w-4 h-4 mr-2" />
                  Share on LinkedIn
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Shared Content Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Content Performance</h2>
            <select
              value={selectedPlatform || ""}
              onChange={(e) => setSelectedPlatform(e.target.value || null)}
              className="px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm"
            >
              <option value="">All Platforms</option>
              <option value="Facebook">Facebook</option>
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Instagram">Instagram</option>
              <option value="Email">Email</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Content
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Platform
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Shares
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Clicks
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredContent.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{item.title}</p>
                        <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.platform}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{item.date}</td>
                    <td className="py-3 px-4 text-center font-semibold text-foreground">
                      {item.shares}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-cyan-500">
                      {item.clicks}
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-green-500">
                      {item.engagement}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Tips */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/50">
          <h3 className="text-lg font-bold text-foreground mb-4">Sharing Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">📱 Best Time</h4>
              <p className="text-sm text-muted-foreground">
                Share content Tuesday-Thursday, 9-11 AM for maximum engagement
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">✍️ Compelling Copy</h4>
              <p className="text-sm text-muted-foreground">
                Use action-oriented language and ask questions to boost engagement
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">🎯 Target Audience</h4>
              <p className="text-sm text-muted-foreground">
                Share relevant content to specific communities for higher CTR
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
