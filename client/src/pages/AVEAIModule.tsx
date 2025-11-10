import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, Ticket, BookOpen, BarChart3, Plus, X } from 'lucide-react';

export default function AVEAIModule() {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets' | 'kb' | 'analytics'>('chat');
  const [messages, setMessages] = useState<Array<{ id: string; type: 'user' | 'bot'; text: string; sentiment?: string }>>([
    { id: '1', type: 'bot', text: 'Hello! I\'m AVE Customer Service AI. How can I help you today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [showNewKB, setShowNewKB] = useState(false);

  const tickets = [
    { id: 'T001', title: 'Integration Issue', status: 'open', priority: 'high', created: '2025-11-09', sentiment: 'frustrated' },
    { id: 'T002', title: 'Feature Request', status: 'in-progress', priority: 'medium', created: '2025-11-08', sentiment: 'neutral' },
    { id: 'T003', title: 'Billing Question', status: 'resolved', priority: 'low', created: '2025-11-07', sentiment: 'satisfied' },
  ];

  const kbArticles = [
    { id: 'KB001', title: 'Getting Started with AVE', category: 'Onboarding', views: 1250 },
    { id: 'KB002', title: 'API Integration Guide', category: 'Technical', views: 890 },
    { id: 'KB003', title: 'Troubleshooting Common Issues', category: 'Support', views: 2100 },
    { id: 'KB004', title: 'Best Practices for Automation', category: 'Best Practices', views: 650 },
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), type: 'user' as const, text: inputText };
    setMessages([...messages, userMessage]);

    // Simulate bot response with sentiment analysis
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        text: 'Thank you for your message. I\'ve analyzed your query and created a support ticket. Our team will respond within 2 hours.',
        sentiment: 'positive'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);

    setInputText('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-slate-900 py-8">
        <div className="container max-w-6xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">AVE Customer Service AI</h1>
          <p className="text-lg text-muted-foreground">Multi-channel AI chatbot with NLP, ticket management, and knowledge base</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-slate-800">
        <div className="container max-w-6xl">
          <div className="flex gap-8">
            {[
              { id: 'chat', label: 'Chatbot', icon: MessageSquare },
              { id: 'tickets', label: 'Tickets', icon: Ticket },
              { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-6xl py-8">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700 h-[600px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.type === 'user'
                          ? 'bg-cyan-600 text-white'
                          : 'bg-slate-700 text-muted-foreground'
                      }`}>
                        <p>{msg.text}</p>
                        {msg.sentiment && msg.type === 'bot' && (
                          <p className="text-xs mt-2 opacity-70">Sentiment: {msg.sentiment}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="border-t border-slate-700 p-4 flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="bg-slate-700 border-slate-600 text-foreground"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Chat Info */}
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700 p-4">
                <h3 className="font-bold text-foreground mb-4">Chat Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Multi-language support</li>
                  <li>✓ Real-time sentiment analysis</li>
                  <li>✓ Automatic ticket creation</li>
                  <li>✓ Knowledge base integration</li>
                  <li>✓ Conversation history</li>
                  <li>✓ Escalation to human agents</li>
                </ul>
              </Card>

              <Card className="bg-slate-800 border-slate-700 p-4">
                <h3 className="font-bold text-foreground mb-4">NLP Capabilities</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Intent recognition</li>
                  <li>• Entity extraction</li>
                  <li>• Sentiment analysis</li>
                  <li>• Context awareness</li>
                  <li>• Response generation</li>
                </ul>
              </Card>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Support Tickets</h2>
              <Button
                onClick={() => setShowNewTicket(!showNewTicket)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Ticket
              </Button>
            </div>

            {showNewTicket && (
              <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-foreground">Create New Ticket</h3>
                  <button onClick={() => setShowNewTicket(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <Input placeholder="Ticket Title" className="bg-slate-700 border-slate-600 text-foreground" />
                  <Textarea placeholder="Description" className="bg-slate-700 border-slate-600 text-foreground" rows={4} />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="bg-slate-700 border border-slate-600 text-foreground rounded px-3 py-2">
                      <option>Priority: High</option>
                      <option>Priority: Medium</option>
                      <option>Priority: Low</option>
                    </select>
                    <select className="bg-slate-700 border border-slate-600 text-foreground rounded px-3 py-2">
                      <option>Category: Technical</option>
                      <option>Category: Billing</option>
                      <option>Category: Feature Request</option>
                    </select>
                  </div>
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Create Ticket</Button>
                </div>
              </Card>
            )}

            <div className="space-y-4">
              {tickets.map(ticket => (
                <Card key={ticket.id} className="bg-slate-800 border-slate-700 p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-foreground">{ticket.title}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          ticket.status === 'open' ? 'bg-red-900 text-red-200' :
                          ticket.status === 'in-progress' ? 'bg-yellow-900 text-yellow-200' :
                          'bg-green-900 text-green-200'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">ID: {ticket.id} • Created: {ticket.created}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-muted-foreground">Priority: <span className="text-foreground font-semibold">{ticket.priority}</span></span>
                        <span className="text-muted-foreground">Sentiment: <span className="text-foreground font-semibold">{ticket.sentiment}</span></span>
                      </div>
                    </div>
                    <Button variant="outline" className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'kb' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">Knowledge Base</h2>
              <Button
                onClick={() => setShowNewKB(!showNewKB)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Article
              </Button>
            </div>

            {showNewKB && (
              <Card className="bg-slate-800 border-slate-700 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-foreground">Create New Article</h3>
                  <button onClick={() => setShowNewKB(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <Input placeholder="Article Title" className="bg-slate-700 border-slate-600 text-foreground" />
                  <select className="w-full bg-slate-700 border border-slate-600 text-foreground rounded px-3 py-2">
                    <option>Category: Onboarding</option>
                    <option>Category: Technical</option>
                    <option>Category: Support</option>
                    <option>Category: Best Practices</option>
                  </select>
                  <Textarea placeholder="Article Content (Markdown supported)" className="bg-slate-700 border-slate-600 text-foreground" rows={6} />
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700">Create Article</Button>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kbArticles.map(article => (
                <Card key={article.id} className="bg-slate-800 border-slate-700 p-4 hover:border-cyan-400 transition-colors cursor-pointer">
                  <h3 className="font-bold text-foreground mb-2">{article.title}</h3>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span className="bg-slate-700 px-2 py-1 rounded">{article.category}</span>
                    <span>{article.views.toLocaleString()} views</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Conversations', value: '2,450', change: '+12%' },
                { label: 'Avg Response Time', value: '45s', change: '-8%' },
                { label: 'Resolution Rate', value: '87%', change: '+5%' },
                { label: 'Customer Satisfaction', value: '4.6/5', change: '+0.2' },
              ].map((stat, idx) => (
                <Card key={idx} className="bg-slate-800 border-slate-700 p-4">
                  <p className="text-muted-foreground text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-green-400">{stat.change} this week</p>
                </Card>
              ))}
            </div>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Sentiment Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Positive', value: 65, color: 'bg-green-600' },
                  { label: 'Neutral', value: 25, color: 'bg-blue-600' },
                  { label: 'Negative', value: 10, color: 'bg-red-600' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-semibold">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-800 border-slate-700 p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Top Issues</h3>
              <div className="space-y-3">
                {[
                  { issue: 'Integration problems', count: 245, trend: '↑' },
                  { issue: 'Feature requests', count: 189, trend: '→' },
                  { issue: 'Billing questions', count: 156, trend: '↓' },
                  { issue: 'Performance issues', count: 98, trend: '↓' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-700 last:border-0">
                    <span className="text-muted-foreground">{item.issue}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-foreground font-semibold">{item.count}</span>
                      <span className="text-cyan-400">{item.trend}</span>
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
