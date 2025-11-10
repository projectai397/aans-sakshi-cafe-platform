/**
 * Customer Feedback Loop System
 * Automated follow-up surveys, sentiment tracking, and continuous improvement
 */

type FeedbackType = 'delivery' | 'food_quality' | 'service' | 'packaging' | 'overall';
type SurveyStatus = 'pending' | 'sent' | 'completed' | 'skipped' | 'failed';
type SentimentType = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

interface Survey {
  id: string;
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  type: FeedbackType;
  status: SurveyStatus;
  sentAt?: Date;
  completedAt?: Date;
  responses?: SurveyResponse;
  reminders: number;
  createdAt: Date;
}

interface SurveyResponse {
  rating: number; // 1-5
  sentiment: SentimentType;
  comment?: string;
  tags?: string[];
  wouldRecommend: boolean;
  likelyToRepeat: boolean;
  respondedAt: Date;
}

interface FeedbackAnalysis {
  totalSurveys: number;
  completionRate: number;
  averageRating: number;
  sentimentDistribution: Record<SentimentType, number>;
  commonIssues: string[];
  strengths: string[];
  improvementAreas: string[];
  nps: number; // Net Promoter Score
  trends: any[];
}

interface ActionItem {
  id: string;
  feedbackId: string;
  issue: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: Date;
  resolvedAt?: Date;
}

class FeedbackLoopService {
  private surveys: Map<string, Survey> = new Map();
  private responses: Map<string, SurveyResponse> = new Map();
  private actionItems: Map<string, ActionItem> = new Map();
  private feedbackHistory: SurveyResponse[] = [];

  /**
   * Create survey
   */
  async createSurvey(
    orderId: string,
    customerId: string,
    customerEmail: string,
    customerPhone: string,
    type: FeedbackType,
  ): Promise<Survey> {
    const survey: Survey = {
      id: `SURVEY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      customerId,
      customerEmail,
      customerPhone,
      type,
      status: 'pending',
      reminders: 0,
      createdAt: new Date(),
    };

    this.surveys.set(survey.id, survey);
    return survey;
  }

  /**
   * Send survey
   */
  async sendSurvey(surveyId: string): Promise<Survey> {
    const survey = this.surveys.get(surveyId);
    if (!survey) {
      throw new Error(`Survey ${surveyId} not found`);
    }

    // Simulate sending survey via email/SMS
    survey.status = 'sent';
    survey.sentAt = new Date();

    console.log(`Survey sent to ${survey.customerEmail} / ${survey.customerPhone}`);

    return survey;
  }

  /**
   * Submit survey response
   */
  async submitResponse(surveyId: string, response: Omit<SurveyResponse, 'respondedAt'>): Promise<Survey> {
    const survey = this.surveys.get(surveyId);
    if (!survey) {
      throw new Error(`Survey ${surveyId} not found`);
    }

    const fullResponse: SurveyResponse = {
      ...response,
      respondedAt: new Date(),
    };

    survey.responses = fullResponse;
    survey.status = 'completed';
    survey.completedAt = new Date();

    this.responses.set(surveyId, fullResponse);
    this.feedbackHistory.push(fullResponse);

    // Analyze sentiment and create action items if needed
    await this.analyzeFeedback(survey, fullResponse);

    return survey;
  }

  /**
   * Analyze feedback and create action items
   */
  private async analyzeFeedback(survey: Survey, response: SurveyResponse): Promise<void> {
    // Create action items for negative feedback
    if (response.rating <= 2) {
      const issue = response.comment || `Low satisfaction (${response.rating}/5) for ${survey.type}`;

      const actionItem: ActionItem = {
        id: `ACTION-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        feedbackId: survey.id,
        issue,
        priority: response.rating === 1 ? 'critical' : 'high',
        status: 'open',
        createdAt: new Date(),
      };

      this.actionItems.set(actionItem.id, actionItem);
    }
  }

  /**
   * Send reminder
   */
  async sendReminder(surveyId: string): Promise<Survey> {
    const survey = this.surveys.get(surveyId);
    if (!survey) {
      throw new Error(`Survey ${surveyId} not found`);
    }

    if (survey.status !== 'sent') {
      throw new Error(`Cannot send reminder for survey with status ${survey.status}`);
    }

    survey.reminders++;

    if (survey.reminders > 3) {
      survey.status = 'skipped';
    }

    console.log(`Reminder ${survey.reminders} sent to ${survey.customerEmail}`);

    return survey;
  }

  /**
   * Get survey
   */
  async getSurvey(surveyId: string): Promise<Survey | null> {
    return this.surveys.get(surveyId) || null;
  }

  /**
   * Get surveys for customer
   */
  async getSurveysForCustomer(customerId: string): Promise<Survey[]> {
    return Array.from(this.surveys.values()).filter((s) => s.customerId === customerId);
  }

  /**
   * Get surveys for order
   */
  async getSurveysForOrder(orderId: string): Promise<Survey[]> {
    return Array.from(this.surveys.values()).filter((s) => s.orderId === orderId);
  }

  /**
   * Get pending surveys
   */
  async getPendingSurveys(): Promise<Survey[]> {
    return Array.from(this.surveys.values()).filter((s) => s.status === 'pending' || s.status === 'sent');
  }

  /**
   * Get completed surveys
   */
  async getCompletedSurveys(limit: number = 100): Promise<Survey[]> {
    return Array.from(this.surveys.values())
      .filter((s) => s.status === 'completed')
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
      .slice(0, limit);
  }

  /**
   * Analyze feedback
   */
  async analyzeFeedback(): Promise<FeedbackAnalysis> {
    const completedSurveys = await this.getCompletedSurveys(1000);

    const analysis: FeedbackAnalysis = {
      totalSurveys: this.surveys.size,
      completionRate: 0,
      averageRating: 0,
      sentimentDistribution: {
        very_negative: 0,
        negative: 0,
        neutral: 0,
        positive: 0,
        very_positive: 0,
      },
      commonIssues: [],
      strengths: [],
      improvementAreas: [],
      nps: 0,
      trends: [],
    };

    if (completedSurveys.length === 0) {
      return analysis;
    }

    // Calculate completion rate
    analysis.completionRate = (completedSurveys.length / this.surveys.size) * 100;

    // Calculate average rating and sentiment
    let totalRating = 0;
    let promoters = 0;
    let detractors = 0;
    const issueCount: Record<string, number> = {};
    const strengthCount: Record<string, number> = {};

    for (const survey of completedSurveys) {
      if (survey.responses) {
        const rating = survey.responses.rating;
        totalRating += rating;

        // NPS calculation
        if (rating >= 4) promoters++;
        if (rating <= 2) detractors++;

        // Sentiment distribution
        analysis.sentimentDistribution[survey.responses.sentiment]++;

        // Track issues and strengths
        if (survey.responses.tags) {
          for (const tag of survey.responses.tags) {
            if (rating <= 2) {
              issueCount[tag] = (issueCount[tag] || 0) + 1;
            } else {
              strengthCount[tag] = (strengthCount[tag] || 0) + 1;
            }
          }
        }
      }
    }

    // Calculate metrics
    analysis.averageRating = totalRating / completedSurveys.length;
    analysis.nps = ((promoters - detractors) / completedSurveys.length) * 100;

    // Get top issues and strengths
    analysis.commonIssues = Object.entries(issueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);

    analysis.strengths = Object.entries(strengthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strength]) => strength);

    // Improvement areas
    analysis.improvementAreas = this.getImprovementAreas(analysis.commonIssues);

    // Trends
    analysis.trends = this.calculateTrends(completedSurveys);

    return analysis;
  }

  /**
   * Get improvement areas
   */
  private getImprovementAreas(issues: string[]): string[] {
    const improvements: Record<string, string> = {
      'delivery_time': 'Optimize delivery routes and timing',
      'food_quality': 'Improve food preparation standards',
      'packaging': 'Upgrade packaging materials',
      'temperature': 'Ensure proper food temperature',
      'missing_items': 'Implement order verification system',
      'customer_service': 'Enhance staff training',
      'cleanliness': 'Improve hygiene standards',
      'portion_size': 'Review portion standards',
    };

    return issues
      .filter((issue) => improvements[issue])
      .map((issue) => improvements[issue]);
  }

  /**
   * Calculate trends
   */
  private calculateTrends(surveys: Survey[]): any[] {
    const trends: Record<string, { rating: number; count: number }> = {};

    for (const survey of surveys) {
      if (survey.completedAt && survey.responses) {
        const date = survey.completedAt.toISOString().split('T')[0];
        if (!trends[date]) {
          trends[date] = { rating: 0, count: 0 };
        }
        trends[date].rating += survey.responses.rating;
        trends[date].count++;
      }
    }

    return Object.entries(trends)
      .map(([date, data]) => ({
        date,
        averageRating: (data.rating / data.count).toFixed(2),
        surveyCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get action items
   */
  async getActionItems(status?: string): Promise<ActionItem[]> {
    let items = Array.from(this.actionItems.values());

    if (status) {
      items = items.filter((a) => a.status === status);
    }

    return items.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Update action item
   */
  async updateActionItem(actionItemId: string, updates: Partial<ActionItem>): Promise<ActionItem> {
    const actionItem = this.actionItems.get(actionItemId);
    if (!actionItem) {
      throw new Error(`Action item ${actionItemId} not found`);
    }

    const updated = { ...actionItem, ...updates };

    if (updates.status === 'resolved') {
      updated.resolvedAt = new Date();
    }

    this.actionItems.set(actionItemId, updated);
    return updated;
  }

  /**
   * Get NPS score
   */
  async getNPSScore(): Promise<number> {
    const analysis = await this.analyzeFeedback();
    return analysis.nps;
  }

  /**
   * Get satisfaction trend
   */
  async getSatisfactionTrend(days: number = 30): Promise<any[]> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentSurveys = Array.from(this.surveys.values()).filter(
      (s) => s.completedAt && s.completedAt >= cutoffDate && s.responses,
    );

    const trend: Record<string, { rating: number; count: number }> = {};

    for (const survey of recentSurveys) {
      if (survey.completedAt && survey.responses) {
        const date = survey.completedAt.toISOString().split('T')[0];
        if (!trend[date]) {
          trend[date] = { rating: 0, count: 0 };
        }
        trend[date].rating += survey.responses.rating;
        trend[date].count++;
      }
    }

    return Object.entries(trend)
      .map(([date, data]) => ({
        date,
        averageRating: parseFloat((data.rating / data.count).toFixed(2)),
        surveyCount: data.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get feedback by type
   */
  async getFeedbackByType(type: FeedbackType): Promise<any> {
    const surveys = Array.from(this.surveys.values()).filter((s) => s.type === type && s.responses);

    const feedback = {
      type,
      totalSurveys: surveys.length,
      averageRating: 0,
      sentimentDistribution: {
        very_negative: 0,
        negative: 0,
        neutral: 0,
        positive: 0,
        very_positive: 0,
      },
      commonComments: [] as string[],
    };

    let totalRating = 0;
    const comments: Record<string, number> = {};

    for (const survey of surveys) {
      if (survey.responses) {
        totalRating += survey.responses.rating;
        feedback.sentimentDistribution[survey.responses.sentiment]++;

        if (survey.responses.comment) {
          comments[survey.responses.comment] = (comments[survey.responses.comment] || 0) + 1;
        }
      }
    }

    feedback.averageRating = surveys.length > 0 ? totalRating / surveys.length : 0;
    feedback.commonComments = Object.entries(comments)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([comment]) => comment);

    return feedback;
  }
}

export default FeedbackLoopService;
