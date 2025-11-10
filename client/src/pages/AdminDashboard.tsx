import { useState } from 'react';
import { BarChart3, Users, CreditCard, TrendingUp, Download, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  division: string;
  spending: number;
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  division: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');

  // Mock data
  const metrics: MetricCard[] = [
    {
      title: 'Total Users',
      value: '2,543',
      change: '+12.5%',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      title: 'Total Revenue',
      value: '$45,230',
      change: '+8.2%',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      title: 'Active Memberships',
      value: '1,842',
      change: '+5.1%',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      change: '+0.8%',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-orange-500/10 text-orange-600',
    },
  ];

  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      joinDate: '2024-01-15',
      status: 'active',
      division: 'AVE',
      spending: 2500,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      joinDate: '2024-02-20',
      status: 'active',
      division: 'Sakshi',
      spending: 1800,
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      joinDate: '2024-01-10',
      status: 'inactive',
      division: 'SubCircle',
      spending: 500,
    },
  ];

  const payments: Payment[] = [
    {
      id: 'PAY001',
      userId: '1',
      amount: 299,
      date: '2024-03-15',
      status: 'completed',
      division: 'AVE',
    },
    {
      id: 'PAY002',
      userId: '2',
      amount: 99,
      date: '2024-03-14',
      status: 'completed',
      division: 'Sakshi',
    },
    {
      id: 'PAY003',
      userId: '3',
      amount: 199,
      date: '2024-03-13',
      status: 'pending',
      division: 'SubCircle',
    },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    console.log(`Exporting as ${format}`);
    // Implementation would go here
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, payments, and view platform analytics</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} className="p-6 hover:shadow-ghibli-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.color}`}>{metric.icon}</div>
                <span className="text-sm font-semibold text-green-600">{metric.change}</span>
              </div>
              <h3 className="text-sm text-muted-foreground mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold">{metric.value}</p>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-border">
          {(['overview', 'users', 'payments', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <Card className="lg:col-span-2 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
              <div className="space-y-4">
                {users.slice(0, 3).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  Add User
                </Button>
                <Button className="w-full" variant="outline">
                  View Reports
                </Button>
                <Button className="w-full" variant="outline">
                  Manage Payments
                </Button>
                <Button className="w-full" variant="outline">
                  System Settings
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">User Management</h2>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleExport('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleExport('pdf')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Divisions</option>
                <option value="ave">AVE</option>
                <option value="sakshi">Sakshi</option>
                <option value="subcircle">SubCircle</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Division</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Spending</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">{user.division}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">${user.spending}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="ghost">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'payments' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Payment Management</h2>
              <Button size="sm" variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Payment ID</th>
                    <th className="text-left py-3 px-4 font-semibold">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Division</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm">{payment.id}</td>
                      <td className="py-3 px-4">{payment.userId}</td>
                      <td className="py-3 px-4 font-medium">${payment.amount}</td>
                      <td className="py-3 px-4">{payment.division}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{payment.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
              <div className="h-64 flex items-end justify-between gap-2">
                {[30, 45, 35, 50, 65, 55, 70].map((height, i) => (
                  <div key={i} className="flex-1 bg-accent rounded-t" style={{ height: `${height}%` }} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">Last 7 days</p>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Division Breakdown</h2>
              <div className="space-y-3">
                {[
                  { name: 'AVE', percentage: 45, color: 'bg-blue-500' },
                  { name: 'Sakshi', percentage: 35, color: 'bg-green-500' },
                  { name: 'SubCircle', percentage: 20, color: 'bg-purple-500' },
                ].map((div) => (
                  <div key={div.name}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{div.name}</span>
                      <span className="text-sm font-semibold">{div.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className={`${div.color} h-2 rounded-full`} style={{ width: `${div.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
