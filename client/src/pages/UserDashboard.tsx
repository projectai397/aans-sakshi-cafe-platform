import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  Edit2,
  Download,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Leaf,
} from "lucide-react";
import { useState } from "react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  location: string;
  tier: string;
}

interface Order {
  id: number;
  orderNumber: string;
  date: string;
  amount: number;
  status: string;
  division: string;
}

interface Membership {
  id: number;
  division: string;
  tier: string;
  status: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  benefits: string[];
}

interface Activity {
  id: number;
  type: string;
  description: string;
  date: string;
  icon: string;
}

const USER_PROFILE: UserProfile = {
  id: 1,
  name: "Rajesh Kumar",
  email: "rajesh.kumar@example.com",
  phone: "+91 98765 43210",
  avatar: "👤",
  joinDate: "2025-01-15",
  location: "Bangalore, India",
  tier: "Premium",
};

const USER_ORDERS: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-1762698000-abc",
    date: "2025-11-09",
    amount: 2499,
    status: "Completed",
    division: "Sakshi",
  },
  {
    id: 2,
    orderNumber: "ORD-1762697500-xyz",
    date: "2025-11-08",
    amount: 2597,
    status: "Completed",
    division: "SubCircle",
  },
  {
    id: 3,
    orderNumber: "ORD-1762697000-pqr",
    date: "2025-11-07",
    amount: 5000,
    status: "Completed",
    division: "AVE",
  },
];

const USER_MEMBERSHIPS: Membership[] = [
  {
    id: 1,
    division: "Sakshi",
    tier: "Premium",
    status: "Active",
    startDate: "2025-01-15",
    endDate: "2026-01-15",
    renewalDate: "2026-01-15",
    benefits: ["Unlimited center access", "Priority booking", "Weekly 1-on-1 sessions"],
  },
  {
    id: 2,
    division: "SubCircle",
    tier: "Rising Star",
    status: "Active",
    startDate: "2025-02-01",
    endDate: "2026-02-01",
    renewalDate: "2026-02-01",
    benefits: ["Premium storefront", "Unlimited listings", "Featured placement"],
  },
];

const USER_ACTIVITIES: Activity[] = [
  {
    id: 1,
    type: "purchase",
    description: "Purchased Premium Sakshi Membership",
    date: "2025-11-09",
    icon: "🛍️",
  },
  {
    id: 2,
    type: "achievement",
    description: "Earned 'Culture Creator' Achievement",
    date: "2025-11-08",
    icon: "🏆",
  },
  {
    id: 3,
    type: "referral",
    description: "Referred 3 friends to AANS",
    date: "2025-11-07",
    icon: "👥",
  },
  {
    id: 4,
    type: "milestone",
    description: "Reached 500 Seva Tokens",
    date: "2025-11-05",
    icon: "⭐",
  },
];

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header - Ghibli styled */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur shadow-ghibli">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display font-bold text-xl text-primary">My Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Profile Card - Ghibli styled */}
        <div className="card-ghibli mb-8 animate-soft-fade">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-5xl shadow-ghibli">
                {USER_PROFILE.avatar}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h2 className="font-display font-bold text-3xl text-foreground mb-2">{USER_PROFILE.name}</h2>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                    {USER_PROFILE.tier} Member
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Member since {new Date(USER_PROFILE.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  {USER_PROFILE.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  {USER_PROFILE.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {USER_PROFILE.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Joined {new Date(USER_PROFILE.joinDate).toLocaleDateString()}
                </div>
              </div>

              <Button className="gap-2 btn-ghibli">
                <Edit2 className="h-4 w-4" /> Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Spent", value: "₹10,096", icon: ShoppingBag },
            { label: "Active Memberships", value: "2", icon: Heart },
            { label: "Seva Tokens", value: "450", icon: Award },
            { label: "Achievements", value: "8", icon: TrendingUp },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border overflow-x-auto">
          {[
            { id: "overview", label: "Overview" },
            { id: "orders", label: "Orders" },
            { id: "memberships", label: "Memberships" },
            { id: "activity", label: "Activity" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-soft-fade">
            {/* Recent Orders */}
            <section>
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">Recent Orders</h3>
              <div className="space-y-4">
                {USER_ORDERS.map((order, idx) => (
                  <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <ShoppingBag className="h-5 w-5 text-primary" />
                          <span className="font-semibold text-foreground">{order.orderNumber}</span>
                          <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {order.division}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg text-foreground">₹{order.amount}</p>
                        <p className="text-sm text-primary flex items-center gap-1 justify-end">
                          <CheckCircle className="h-4 w-4" /> {order.status}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Active Memberships */}
            <section>
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">Active Memberships</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {USER_MEMBERSHIPS.map((membership, idx) => (
                  <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="mb-4">
                      <h4 className="font-display font-bold text-xl text-foreground mb-2">{membership.division}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">
                          {membership.tier}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {membership.status}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Renews: {new Date(membership.renewalDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" className="w-full btn-ghibli rounded-full">
                      Manage Membership
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="animate-soft-fade">
            <h3 className="font-display font-bold text-2xl text-foreground mb-6">Order History</h3>
            <div className="space-y-4">
              {USER_ORDERS.map((order, idx) => (
                <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground">{order.orderNumber}</span>
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {order.division}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg text-foreground">₹{order.amount}</p>
                      <Button size="sm" variant="outline" className="gap-1 mt-2">
                        <Download className="h-4 w-4" /> Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "memberships" && (
          <div className="animate-soft-fade">
            <h3 className="font-display font-bold text-2xl text-foreground mb-6">All Memberships</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {USER_MEMBERSHIPS.map((membership, idx) => (
                <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="mb-4">
                    <h4 className="font-display font-bold text-xl text-foreground mb-2">{membership.division}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold">
                        {membership.tier}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {membership.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Started: {new Date(membership.startDate).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Renews: {new Date(membership.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-foreground mb-2">Benefits:</p>
                    <ul className="space-y-1">
                      {membership.benefits.map((benefit, bidx) => (
                        <li key={bidx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <Sparkles className="h-3 w-3 text-accent" /> {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button size="sm" className="w-full btn-ghibli rounded-full">
                    Renew or Upgrade
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="animate-soft-fade">
            <h3 className="font-display font-bold text-2xl text-foreground mb-6">Activity Timeline</h3>
            <div className="space-y-4">
              {USER_ACTIVITIES.map((activity, idx) => (
                <div key={idx} className="card-ghibli animate-soft-fade" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="flex items-start gap-4">
                    <div className="text-3xl mt-1">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="animate-soft-fade">
            <h3 className="font-display font-bold text-2xl text-foreground mb-6">Account Settings</h3>
            <div className="space-y-6">
              <div className="card-ghibli">
                <h4 className="font-semibold text-foreground mb-4">Notification Preferences</h4>
                <div className="space-y-3">
                  {[
                    { label: "Order updates", checked: true },
                    { label: "Membership reminders", checked: true },
                    { label: "Promotional emails", checked: false },
                    { label: "Community updates", checked: true },
                  ].map((pref, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={pref.checked} className="w-4 h-4" />
                      <span className="text-sm text-foreground">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card-ghibli">
                <h4 className="font-semibold text-foreground mb-4">Privacy Settings</h4>
                <div className="space-y-3">
                  {[
                    { label: "Show profile publicly", checked: true },
                    { label: "Allow community messages", checked: true },
                    { label: "Share activity with friends", checked: false },
                  ].map((pref, idx) => (
                    <label key={idx} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={pref.checked} className="w-4 h-4" />
                      <span className="text-sm text-foreground">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="card-ghibli">
                <h4 className="font-semibold text-foreground mb-4">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="destructive" className="btn-ghibli">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
