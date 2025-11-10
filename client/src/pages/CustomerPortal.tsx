/**
 * Customer Portal
 * Customer-facing dashboard for orders, loyalty, and account management
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Gift, MapPin, Phone, Mail, LogOut, Settings, Heart, Star } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'delivered' | 'pending' | 'preparing';
  items: string[];
}

interface LoyaltyData {
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierPoints: number;
  rewardsAvailable: number;
}

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState('orders');
  const [loyaltyData] = useState<LoyaltyData>({
    points: 850,
    tier: 'gold',
    nextTierPoints: 1000,
    rewardsAvailable: 3,
  });

  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-1001',
      date: '2025-11-09',
      total: 450,
      status: 'delivered',
      items: ['Hyderabadi Biryani', 'Naan', 'Mango Lassi'],
    },
    {
      id: '2',
      orderNumber: 'ORD-1002',
      date: '2025-11-08',
      total: 520,
      status: 'delivered',
      items: ['Butter Chicken', 'Gulab Jamun', 'Lassi'],
    },
    {
      id: '3',
      orderNumber: 'ORD-1003',
      date: '2025-11-07',
      total: 380,
      status: 'delivered',
      items: ['Biryani', 'Raita', 'Chai'],
    },
  ]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'text-amber-700';
      case 'silver':
        return 'text-gray-500';
      case 'gold':
        return 'text-yellow-500';
      case 'platinum':
        return 'text-blue-400';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, John!</h1>
          <p className="text-gray-600 mt-2">Manage your orders and loyalty rewards</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loyalty Card */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Loyalty Tier</p>
              <h2 className={`text-3xl font-bold capitalize ${getTierColor(loyaltyData.tier)}`}>
                {loyaltyData.tier}
              </h2>
            </div>
            <Gift className="h-8 w-8" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-yellow-100 text-sm">Current Points</p>
              <p className="text-2xl font-bold">{loyaltyData.points}</p>
            </div>
            <div>
              <p className="text-yellow-100 text-sm">Rewards Available</p>
              <p className="text-2xl font-bold">{loyaltyData.rewardsAvailable}</p>
            </div>
          </div>

          <div>
            <p className="text-yellow-100 text-sm mb-2">Progress to next tier</p>
            <div className="w-full bg-yellow-200 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${(loyaltyData.points / loyaltyData.nextTierPoints) * 100}%` }}
              />
            </div>
            <p className="text-yellow-100 text-xs mt-2">
              {loyaltyData.nextTierPoints - loyaltyData.points} points to next tier
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-lg">{order.orderNumber}</p>
                      <p className="text-gray-600 text-sm">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{order.total}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Items:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Reorder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: '₹100 Discount', points: 200, description: 'Get ₹100 off on your next order' },
                  { name: 'Free Dessert', points: 150, description: 'Get any dessert free' },
                  { name: '₹500 Voucher', points: 500, description: 'Get ₹500 voucher' },
                ].map((reward, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-semibold">{reward.name}</p>
                      <p className="text-sm text-gray-600">{reward.description}</p>
                    </div>
                    <Button
                      size="sm"
                      disabled={loyaltyData.points < reward.points}
                      variant={loyaltyData.points >= reward.points ? 'default' : 'outline'}
                    >
                      {reward.points} pts
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reward History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: '2025-11-05', reward: '₹100 Discount', points: -200 },
                    { date: '2025-10-28', reward: 'Free Dessert', points: -150 },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center pb-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.reward}</p>
                        <p className="text-sm text-gray-600">{item.date}</p>
                      </div>
                      <p className="font-semibold text-red-600">{item.points} pts</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Hyderabadi Biryani', rating: 4.8, orders: 12 },
              { name: 'Butter Chicken', rating: 4.6, orders: 8 },
              { name: 'Naan', rating: 4.7, orders: 15 },
            ].map((item, idx) => (
              <Card key={idx}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">{item.name}</h3>
                    <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{item.rating}</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">Ordered {item.orders} times</p>

                  <Button className="w-full">Order Again</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    defaultValue="John Doe"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="john@example.com"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue="+91-98765-43210"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Address
                  </label>
                  <input
                    type="text"
                    defaultValue="123 Customer Street, Bangalore"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Preferences</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 mr-3" />
                    <span className="text-sm">Receive order updates via SMS</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="w-4 h-4 mr-3" />
                    <span className="text-sm">Receive promotional offers</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 mr-3" />
                    <span className="text-sm">Receive loyalty rewards notifications</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Changes</Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
