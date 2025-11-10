/**
 * Customer Support Ticketing System
 * Multi-channel support with SLA tracking and AI-powered responses
 */

type TicketChannel = 'email' | 'chat' | 'phone' | 'in_app' | 'social';
type TicketCategory = 'order_issue' | 'delivery' | 'quality' | 'payment' | 'account' | 'feedback' | 'other';
type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'escalated';

interface SupportTicket {
  id: string;
  customerId: string;
  orderId?: string;
  channel: TicketChannel;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  attachments?: string[];
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  slaDeadline: Date;
  messages: TicketMessage[];
  resolution?: string;
  rating?: number;
  feedback?: string;
}

interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'customer' | 'support' | 'system';
  senderName: string;
  message: string;
  attachments?: string[];
  timestamp: Date;
  isAIGenerated?: boolean;
}

interface SLA {
  priority: TicketPriority;
  responseTime: number; // minutes
  resolutionTime: number; // hours
  escalationTime?: number; // hours
}

interface SupportAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  channels: TicketChannel[];
  categories: TicketCategory[];
  status: 'available' | 'busy' | 'offline';
  activeTickets: number;
  maxTickets: number;
  averageResolutionTime: number;
  satisfactionRating: number;
  joinDate: Date;
}

interface TicketAnalytics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  averageSatisfactionRating: number;
  slaCompliance: number; // percentage
  channelDistribution: Record<TicketChannel, number>;
  categoryDistribution: Record<TicketCategory, number>;
  priorityDistribution: Record<TicketPriority, number>;
  topIssues: Array<{ category: string; count: number }>;
}

class SupportTicketingService {
  private tickets: Map<string, SupportTicket> = new Map();
  private agents: Map<string, SupportAgent> = new Map();
  private slas: Map<TicketPriority, SLA> = new Map();
  private aiResponses: Map<string, string> = new Map();

  constructor() {
    // Initialize SLAs
    this.slas.set('urgent', { priority: 'urgent', responseTime: 15, resolutionTime: 2, escalationTime: 1 });
    this.slas.set('high', { priority: 'high', responseTime: 30, resolutionTime: 4, escalationTime: 2 });
    this.slas.set('medium', { priority: 'medium', responseTime: 60, resolutionTime: 8, escalationTime: 4 });
    this.slas.set('low', { priority: 'low', responseTime: 120, resolutionTime: 24 });

    // Initialize AI responses
    this.initializeAIResponses();
  }

  /**
   * Initialize AI responses
   */
  private initializeAIResponses(): void {
    this.aiResponses.set('order_issue', 'Thank you for reporting this issue. We sincerely apologize for the inconvenience. Our team is investigating this matter and will get back to you within 2 hours with a resolution.');
    this.aiResponses.set('delivery', 'We understand your concern about the delivery. Let us check the status of your order and get back to you shortly with an update.');
    this.aiResponses.set('quality', 'We appreciate your feedback about the food quality. This helps us improve. Please share more details, and we will address this immediately.');
    this.aiResponses.set('payment', 'Thank you for bringing this payment issue to our attention. We are looking into it and will resolve it as soon as possible.');
    this.aiResponses.set('account', 'We are here to help with your account. Please provide more details so we can assist you better.');
    this.aiResponses.set('feedback', 'Thank you for your valuable feedback. We appreciate your input and will use it to improve our service.');
  }

  /**
   * Create support ticket
   */
  async createTicket(
    customerId: string,
    channel: TicketChannel,
    category: TicketCategory,
    subject: string,
    description: string,
    orderId?: string,
  ): Promise<SupportTicket> {
    // Determine priority
    let priority: TicketPriority = 'medium';
    if (category === 'order_issue' || category === 'delivery') priority = 'high';
    if (category === 'payment') priority = 'urgent';

    const sla = this.slas.get(priority)!;
    const slaDeadline = new Date(Date.now() + sla.resolutionTime * 60 * 60 * 1000);

    const ticket: SupportTicket = {
      id: `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      orderId,
      channel,
      category,
      priority,
      status: 'open',
      subject,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
      slaDeadline,
      messages: [],
    };

    // Add initial message
    const initialMessage: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId: ticket.id,
      sender: 'customer',
      senderName: customerId,
      message: description,
      timestamp: new Date(),
    };

    ticket.messages.push(initialMessage);

    // Add AI-generated response
    const aiResponse = this.aiResponses.get(category) || this.aiResponses.get('feedback')!;
    const aiMessage: TicketMessage = {
      id: `MSG-${Date.now()}-AI`,
      ticketId: ticket.id,
      sender: 'system',
      senderName: 'Support Bot',
      message: aiResponse,
      timestamp: new Date(Date.now() + 1000),
      isAIGenerated: true,
    };

    ticket.messages.push(aiMessage);

    this.tickets.set(ticket.id, ticket);

    // Assign to agent
    await this.assignTicketToAgent(ticket.id);

    return ticket;
  }

  /**
   * Assign ticket to agent
   */
  private async assignTicketToAgent(ticketId: string): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return;

    // Find available agent
    const availableAgents = Array.from(this.agents.values()).filter(
      (a) =>
        a.status !== 'offline' &&
        a.activeTickets < a.maxTickets &&
        a.channels.includes(ticket.channel) &&
        a.categories.includes(ticket.category),
    );

    if (availableAgents.length > 0) {
      // Assign to agent with least tickets
      const agent = availableAgents.sort((a, b) => a.activeTickets - b.activeTickets)[0];
      ticket.assignedTo = agent.id;
      agent.activeTickets++;
    }
  }

  /**
   * Get ticket
   */
  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    return this.tickets.get(ticketId) || null;
  }

  /**
   * Get customer tickets
   */
  async getCustomerTickets(customerId: string, status?: TicketStatus): Promise<SupportTicket[]> {
    let tickets = Array.from(this.tickets.values()).filter((t) => t.customerId === customerId);

    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }

    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Add message to ticket
   */
  async addMessage(ticketId: string, sender: 'customer' | 'support', senderName: string, message: string): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const newMessage: TicketMessage = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticketId,
      sender,
      senderName,
      message,
      timestamp: new Date(),
    };

    ticket.messages.push(newMessage);
    ticket.updatedAt = new Date();

    if (sender === 'customer') {
      ticket.status = 'in_progress';
    }

    return ticket;
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.status = status;
    ticket.updatedAt = new Date();

    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = new Date();

      // Update agent metrics
      if (ticket.assignedTo) {
        const agent = this.agents.get(ticket.assignedTo);
        if (agent) {
          agent.activeTickets--;
          agent.averageResolutionTime =
            (agent.averageResolutionTime * (agent.activeTickets) + (ticket.resolvedAt.getTime() - ticket.createdAt.getTime()) / (1000 * 60)) /
            (agent.activeTickets + 1);
        }
      }
    }

    return ticket;
  }

  /**
   * Resolve ticket
   */
  async resolveTicket(ticketId: string, resolution: string): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.status = 'resolved';
    ticket.resolution = resolution;
    ticket.resolvedAt = new Date();
    ticket.updatedAt = new Date();

    // Add resolution message
    const resolutionMessage: TicketMessage = {
      id: `MSG-${Date.now()}`,
      ticketId,
      sender: 'support',
      senderName: ticket.assignedTo || 'Support Team',
      message: `Resolution: ${resolution}`,
      timestamp: new Date(),
    };

    ticket.messages.push(resolutionMessage);

    return ticket;
  }

  /**
   * Rate ticket
   */
  async rateTicket(ticketId: string, rating: number, feedback?: string): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.rating = rating;
    ticket.feedback = feedback;
    ticket.status = 'closed';

    // Update agent satisfaction rating
    if (ticket.assignedTo) {
      const agent = this.agents.get(ticket.assignedTo);
      if (agent) {
        agent.satisfactionRating = (agent.satisfactionRating + rating) / 2;
      }
    }

    return ticket;
  }

  /**
   * Register support agent
   */
  async registerAgent(agent: Omit<SupportAgent, 'id | activeTickets | averageResolutionTime | satisfactionRating'>): Promise<SupportAgent> {
    const fullAgent: SupportAgent = {
      ...agent,
      id: `AGENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      activeTickets: 0,
      averageResolutionTime: 0,
      satisfactionRating: 5,
    };

    this.agents.set(fullAgent.id, fullAgent);
    return fullAgent;
  }

  /**
   * Get agent
   */
  async getAgent(agentId: string): Promise<SupportAgent | null> {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents
   */
  async getAllAgents(): Promise<SupportAgent[]> {
    return Array.from(this.agents.values());
  }

  /**
   * Get ticket analytics
   */
  async getTicketAnalytics(startDate: Date, endDate: Date): Promise<TicketAnalytics> {
    const allTickets = Array.from(this.tickets.values()).filter((t) => t.createdAt >= startDate && t.createdAt <= endDate);

    const analytics: TicketAnalytics = {
      totalTickets: allTickets.length,
      openTickets: allTickets.filter((t) => t.status === 'open').length,
      resolvedTickets: allTickets.filter((t) => t.status === 'resolved').length,
      closedTickets: allTickets.filter((t) => t.status === 'closed').length,
      averageResolutionTime: 0,
      averageSatisfactionRating: 0,
      slaCompliance: 0,
      channelDistribution: {} as Record<TicketChannel, number>,
      categoryDistribution: {} as Record<TicketCategory, number>,
      priorityDistribution: {} as Record<TicketPriority, number>,
      topIssues: [],
    };

    let totalResolutionTime = 0;
    let ratedTickets = 0;
    let slaCompliantTickets = 0;

    for (const ticket of allTickets) {
      // Channel distribution
      analytics.channelDistribution[ticket.channel] = (analytics.channelDistribution[ticket.channel] || 0) + 1;

      // Category distribution
      analytics.categoryDistribution[ticket.category] = (analytics.categoryDistribution[ticket.category] || 0) + 1;

      // Priority distribution
      analytics.priorityDistribution[ticket.priority] = (analytics.priorityDistribution[ticket.priority] || 0) + 1;

      // Resolution time
      if (ticket.resolvedAt) {
        totalResolutionTime += ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      }

      // Satisfaction rating
      if (ticket.rating) {
        analytics.averageSatisfactionRating += ticket.rating;
        ratedTickets++;
      }

      // SLA compliance
      if (ticket.resolvedAt && ticket.resolvedAt <= ticket.slaDeadline) {
        slaCompliantTickets++;
      }
    }

    analytics.averageResolutionTime = allTickets.filter((t) => t.resolvedAt).length > 0 ? totalResolutionTime / (allTickets.filter((t) => t.resolvedAt).length * 60 * 60 * 1000) : 0;
    analytics.averageSatisfactionRating = ratedTickets > 0 ? analytics.averageSatisfactionRating / ratedTickets : 0;
    analytics.slaCompliance = allTickets.length > 0 ? (slaCompliantTickets / allTickets.length) * 100 : 0;

    // Top issues
    const categoryCount: Record<string, number> = {};
    for (const ticket of allTickets) {
      categoryCount[ticket.category] = (categoryCount[ticket.category] || 0) + 1;
    }

    analytics.topIssues = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    return analytics;
  }

  /**
   * Get agent performance
   */
  async getAgentPerformance(agentId: string): Promise<any> {
    const agent = await this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const agentTickets = Array.from(this.tickets.values()).filter((t) => t.assignedTo === agentId);

    return {
      agentId: agent.id,
      name: agent.name,
      status: agent.status,
      activeTickets: agent.activeTickets,
      totalTicketsHandled: agentTickets.length,
      averageResolutionTime: agent.averageResolutionTime.toFixed(2),
      satisfactionRating: agent.satisfactionRating.toFixed(2),
      categories: agent.categories,
      channels: agent.channels,
    };
  }
}

export default SupportTicketingService;
