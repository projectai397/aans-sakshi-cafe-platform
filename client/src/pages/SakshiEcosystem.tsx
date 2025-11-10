import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Users, MapPin, Calendar, Star, Check, BookOpen, TrendingUp, Plus, X } from 'lucide-react';

export default function SakshiEcosystem() {
  const [activeTab, setActiveTab] = useState<'centers' | 'programs' | 'membership' | 'dashboard'>('centers');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);

  const membershipTiers = [
    {
      name: 'Essential',
      price: '₹999/month',
      features: ['Access to 1 center', '4 classes/month', 'Community access', 'Basic tracking'],
      color: 'blue'
    },
    {
      name: 'Premium',
      price: '₹2,499/month',
      features: ['Access to all centers', 'Unlimited classes', 'Personal trainer', 'Advanced tracking', 'Nutrition plan'],
      color: 'purple',
      popular: true
    },
    {
      name: 'Elite',
      price: '₹4,999/month',
      features: ['VIP access', 'Unlimited everything', '1-on-1 coaching', 'Custom programs', 'Priority support', 'Wellness retreat'],
      color: 'amber'
    }
  ];

  const centers = [
    {
      id: 'C001',
      name: 'Bangalore Wellness Hub',
      location: 'Indiranagar, Bangalore',
      members: 2450,
      rating: 4.8,
      image: '🏢',
      facilities: ['Yoga', 'Meditation', 'Fitness', 'Nutrition'],
      programs: 12
    },
    {
      id: 'C002',
      name: 'Mumbai Serenity Center',
      location: 'Bandra, Mumbai',
      members: 1890,
      rating: 4.7,
      image: '🌆',
      facilities: ['Yoga', 'Ayurveda', 'Wellness', 'Coaching'],
      programs: 10
    },
    {
      id: 'C003',
      name: 'Delhi Holistic Hub',
      location: 'Gurgaon, Delhi',
      members: 1650,
      rating: 4.9,
      image: '🏛️',
      facilities: ['Fitness', 'Meditation', 'Nutrition', 'Therapy'],
      programs: 14
    },
    {
      id: 'C004',
      name: 'Pune Wellness Sanctuary',
      location: 'Koregaon Park, Pune',
      members: 1200,
      rating: 4.6,
      image: '🌿',
      facilities: ['Yoga', 'Wellness', 'Coaching', 'Community'],
      programs: 8
    },
  ];

  const programs = [
    {
      id: 'P001',
      name: 'Morning Yoga Flow',
      center: 'Bangalore Wellness Hub',
      time: '6:00 AM - 7:00 AM',
      instructor: 'Priya Sharma',
      capacity: 25,
      enrolled: 22,
      level: 'Beginner',
      rating: 4.8
    },
    {
      id: 'P002',
      name: 'Meditation & Mindfulness',
      center: 'Mumbai Serenity Center',
      time: '7:00 PM - 8:00 PM',
      instructor: 'Rajesh Kumar',
      capacity: 30,
      enrolled: 28,
      level: 'All Levels',
      rating: 4.9
    },
    {
      id: 'P003',
      name: 'Nutrition Masterclass',
      center: 'Delhi Holistic Hub',
      time: '5:00 PM - 6:30 PM',
      instructor: 'Dr. Anjali Patel',
      capacity: 20,
      enrolled: 18,
      level: 'Intermediate',
      rating: 4.7
    },
    {
      id: 'P004',
      name: 'Fitness & Strength',
      center: 'Pune Wellness Sanctuary',
      time: '6:30 AM - 7:30 AM',
      instructor: 'Vikram Singh',
      capacity: 15,
      enrolled: 14,
      level: 'Advanced',
      rating: 4.6
    },
  ];

  const userProgress = {
    classesCompleted: 45,
    hoursLogged: 67.5,
    streakDays: 23,
    wellnessScore: 78,
    nextMilestone: 50,
    progressToMilestone: 90
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-purple-900 to-pink-900 py-12">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Sakshi Wellness Ecosystem</h1>
          <p className="text-lg text-muted-foreground">Seven integrated wellness centers with programs, coaching, and community</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-slate-800">
        <div className="container max-w-6xl">
          <div className="flex gap-8">
            {[
              { id: 'centers', label: 'Centers', icon: MapPin },
              { id: 'programs', label: 'Programs', icon: Calendar },
              { id: 'membership', label: 'Membership', icon: Heart },
              { id: 'dashboard', label: 'My Dashboard', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl py-8">
        {/* Centers Tab */}
        {activeTab === 'centers' && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Our Wellness Centers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {centers.map(center => (
                <Card key={center.id} className="bg-slate-800 border-slate-700 overflow-hidden hover:border-purple-400 transition-colors">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{center.image}</div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-foreground font-semibold">{center.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{center.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{center.location}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {center.members} members
                      </span>
                      <span>{center.programs} programs</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {center.facilities.map(facility => (
                        <span key={facility} className="px-2 py-1 bg-slate-700 text-xs text-muted-foreground rounded">
                          {facility}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Explore Center</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Wellness Programs</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Browse All
              </Button>
            </div>
            <div className="space-y-4">
              {programs.map(program => (
                <Card key={program.id} className="bg-slate-800 border-slate-700 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{program.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {program.center}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {program.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {program.enrolled}/{program.capacity} enrolled
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Instructor: <span className="text-foreground font-semibold">{program.instructor}</span></span>
                        <span className="text-muted-foreground">Level: <span className="text-foreground font-semibold">{program.level}</span></span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {program.rating}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setSelectedCenter(program.id);
                        setShowBooking(true);
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Book Now
                    </Button>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(program.enrolled / program.capacity) * 100}%` }}
                    ></div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Membership Tab */}
        {activeTab === 'membership' && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Membership Tiers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {membershipTiers.map((tier, idx) => (
                <Card
                  key={idx}
                  className={`border-2 overflow-hidden transition-transform hover:scale-105 ${
                    tier.popular
                      ? 'bg-gradient-to-br from-purple-900 to-pink-900 border-purple-400'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  {tier.popular && (
                    <div className="bg-purple-600 text-white py-2 text-center text-sm font-bold">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{tier.name}</h3>
                    <p className="text-3xl font-bold text-purple-400 mb-6">{tier.price}</p>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, fidx) => (
                        <li key={fidx} className="flex items-center gap-3 text-muted-foreground">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full ${
                      tier.popular
                        ? 'bg-white text-purple-900 hover:bg-gray-100'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}>
                      Choose Plan
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">My Wellness Journey</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Classes Completed', value: userProgress.classesCompleted, icon: '📚' },
                { label: 'Hours Logged', value: `${userProgress.hoursLogged}h`, icon: '⏱️' },
                { label: 'Current Streak', value: `${userProgress.streakDays} days`, icon: '🔥' },
                { label: 'Wellness Score', value: `${userProgress.wellnessScore}/100`, icon: '⭐' },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-slate-800 border-slate-700 p-4">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-purple-400">{stat.value}</p>
                </Card>
              ))}
            </div>

            {/* Progress to Milestone */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Progress to Next Milestone</h3>
              <p className="text-muted-foreground mb-4">
                {userProgress.classesCompleted} of {userProgress.nextMilestone} classes completed
              </p>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all"
                  style={{ width: `${userProgress.progressToMilestone}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Complete {userProgress.nextMilestone - userProgress.classesCompleted} more classes to unlock Elite Membership benefits!
              </p>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {[
                  { date: 'Today', activity: 'Completed Morning Yoga Flow', center: 'Bangalore Hub' },
                  { date: 'Yesterday', activity: 'Attended Meditation Session', center: 'Mumbai Center' },
                  { date: '2 days ago', activity: 'Completed Nutrition Masterclass', center: 'Delhi Hub' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start py-3 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="text-foreground font-semibold">{item.activity}</p>
                      <p className="text-sm text-muted-foreground">{item.center}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-foreground">Book Class</h3>
              <button onClick={() => setShowBooking(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Select Date</label>
                <Input type="date" className="bg-slate-700 border-slate-600 text-foreground mt-2" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Number of Sessions</label>
                <Input type="number" min="1" max="10" defaultValue="1" className="bg-slate-700 border-slate-600 text-foreground mt-2" />
              </div>
              <div className="bg-slate-700 p-4 rounded">
                <p className="text-sm text-muted-foreground mb-2">Total Cost</p>
                <p className="text-2xl font-bold text-purple-400">₹999</p>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Confirm Booking</Button>
              <Button variant="outline" onClick={() => setShowBooking(false)} className="w-full">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
