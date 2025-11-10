import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Settings, Trash2, Check, X, Filter, Archive } from 'lucide-react';

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'preferences'>('all');
  const [notifications, setNotifications] = useState([
    {
      id: 'N001',
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed and will be shipped soon',
      timestamp: '5 minutes ago',
      read: false,
      icon: '📦',
      priority: 'high'
    },
    {
      id: 'N002',
      type: 'message',
      title: 'New Message from Support',
      message: 'Your support ticket has been updated. Click to view details.',
      timestamp: '1 hour ago',
      read: false,
      icon: '💬',
      priority: 'medium'
    },
    {
      id: 'N003',
      type: 'promotion',
      title: 'Special Offer: 30% Off',
      message: 'Limited time offer on wellness programs. Use code WELLNESS30',
      timestamp: '3 hours ago',
      read: true,
      icon: '🎉',
      priority: 'low'
    },
    {
      id: 'N004',
      type: 'event',
      title: 'Event Reminder: Yoga Class',
      message: 'Your yoga class starts in 30 minutes. See you there!',
      timestamp: '2 hours ago',
      read: true,
      icon: '🧘',
      priority: 'medium'
    },
    {
      id: 'N005',
      type: 'system',
      title: 'System Update',
      message: 'Platform maintenance completed successfully',
      timestamp: '1 day ago',
      read: true,
      icon: '⚙️',
      priority: 'low'
    },
    {
      id: 'N006',
      type: 'social',
      title: 'New Follower',
      message: 'Priya Sharma started following you',
      timestamp: '2 days ago',
      read: true,
      icon: '👥',
      priority: 'low'
    },
  ]);

  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    orders: true,
    messages: true,
    promotions: false,
    events: true,
    system: true,
    social: true,
    email: true,
    push: true,
    sms: false,
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const togglePreference = (key: string) => {
    setPreferences({
      ...preferences,
      [key]: !preferences[key]
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-slate-900 py-8">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold text-foreground">Notification Center</h1>
          </div>
          <p className="text-lg text-muted-foreground">Manage all your notifications in one place</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-slate-800">
        <div className="container max-w-4xl">
          <div className="flex gap-8">
            {[
              { id: 'all', label: 'All Notifications', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'preferences', label: 'Preferences', count: 0 },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-cyan-600 text-white text-xs rounded-full px-2 py-0.5">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl py-8">
        {/* All/Unread Notifications */}
        {(activeTab === 'all' || activeTab === 'unread') && (
          <div>
            {unreadCount > 0 && (
              <div className="mb-6 flex justify-between items-center">
                <p className="text-muted-foreground">
                  You have <span className="text-cyan-400 font-semibold">{unreadCount}</span> unread notifications
                </p>
                <Button
                  onClick={markAllAsRead}
                  variant="outline"
                  className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Mark all as read
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700 p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </Card>
              ) : (
                filteredNotifications.map(notification => (
                  <Card
                    key={notification.id}
                    className={`border-slate-700 p-4 transition-colors ${
                      notification.read
                        ? 'bg-slate-800'
                        : 'bg-slate-800 border-l-4 border-l-cyan-400'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className="text-3xl flex-shrink-0">{notification.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className={`font-bold ${
                              notification.read ? 'text-muted-foreground' : 'text-foreground'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${
                            notification.priority === 'high' ? 'bg-red-900 text-red-200' :
                            notification.priority === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-slate-700 text-muted-foreground'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">{notification.timestamp}</span>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button
                                onClick={() => markAsRead(notification.id)}
                                size="sm"
                                variant="outline"
                                className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteNotification(notification.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-400 border-red-400 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Notification Types</h2>
              <div className="space-y-4">
                {[
                  { key: 'orders', label: 'Order Updates', description: 'Notifications about your orders' },
                  { key: 'messages', label: 'Messages', description: 'New messages and support replies' },
                  { key: 'promotions', label: 'Promotions', description: 'Special offers and discounts' },
                  { key: 'events', label: 'Events', description: 'Event reminders and updates' },
                  { key: 'system', label: 'System Updates', description: 'Platform maintenance and updates' },
                  { key: 'social', label: 'Social', description: 'Followers and community activity' },
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="font-semibold text-foreground">{pref.label}</p>
                      <p className="text-sm text-muted-foreground">{pref.description}</p>
                    </div>
                    <button
                      onClick={() => togglePreference(pref.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences[pref.key]
                          ? 'bg-cyan-600'
                          : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences[pref.key]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-foreground mb-6">Delivery Methods</h2>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                  { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
                  { key: 'sms', label: 'SMS Alerts', description: 'Critical alerts via SMS' },
                ].map(method => (
                  <div key={method.key} className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="font-semibold text-foreground">{method.label}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <button
                      onClick={() => togglePreference(method.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences[method.key as keyof typeof preferences]
                          ? 'bg-cyan-600'
                          : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences[method.key as keyof typeof preferences]
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Quiet Hours</h2>
              <p className="text-muted-foreground mb-4">Pause non-urgent notifications during specific hours</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Start Time</label>
                  <input type="time" defaultValue="22:00" className="w-full bg-slate-700 border border-slate-600 text-foreground rounded px-3 py-2" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">End Time</label>
                  <input type="time" defaultValue="08:00" className="w-full bg-slate-700 border border-slate-600 text-foreground rounded px-3 py-2" />
                </div>
              </div>
              <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700">Save Quiet Hours</Button>
            </Card>

            <div className="flex gap-4">
              <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700">Save All Preferences</Button>
              <Button variant="outline" className="flex-1 text-muted-foreground border-slate-700 hover:bg-slate-700">Reset to Default</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
