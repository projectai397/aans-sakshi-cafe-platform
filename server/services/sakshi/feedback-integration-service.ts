/**
 * Customer Feedback Integration Service
 * Aggregates reviews from multiple platforms with sentiment analysis
 */

type Platform = 'google' | 'zomato' | 'swiggy' | 'instagram' | 'facebook' | 'internal';
type Sentiment = 'positive' | 'neutral' | 'negative';
type ResponseStatus = 'pending' | 'responded' | 'resolved';

interface Review {
  id: string;
  platform: Platform;
  platformReviewId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  sentiment: Sentiment;
  sentimentScore: number; // 0-1
  keywords: string[];
  reviewDate: Date;
  locationId: string;
  orderId?: string;
}

interface ReviewResponse {
  id: string;
  reviewId: string;
  responseText: string;
  respondedBy: string;
  respondedAt: Date;
  status: ResponseStatus;
}

interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  sentimentScore: number; // 0-1
  responseRate: number; // percentage
  averageResponseTime: number; // hours
  ratingDistribution: Record<number, number>; // 1-5 stars
  platformBreakdown: Record<Platform, { reviews: number; avgRating: number }>;
  topKeywords: Array<{ keyword: string; count: number; sentiment: Sentiment }>;
  reviewTrends: Array<{ date: string; reviews: number; avgRating: number }>;
  improvementAreas: Array<{ keyword: string; count: number; sentiment: 'negative' }>;
}

class FeedbackIntegrationService {
  private reviews: Map<string, Review> = new Map();
  private responses: Map<string, ReviewResponse> = new Map();
  private platformIntegrations: Map<Platform, any> = new Map();

  /**
   * Add review
   */
  async addReview(review: Omit<Review, 'id | sentiment | sentimentScore | keywords'>): Promise<Review> {
    const { sentiment, sentimentScore, keywords } = this.analyzeSentiment(review.comment);

    const fullReview: Review = {
      ...review,
      id: `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentiment,
      sentimentScore,
      keywords,
    };

    this.reviews.set(fullReview.id, fullReview);

    // Create auto-response for negative reviews
    if (sentiment === 'negative') {
      await this.createAutoResponse(fullReview);
    }

    return fullReview;
  }

  /**
   * Analyze sentiment
   */
  private analyzeSentiment(text: string): { sentiment: Sentiment; sentimentScore: number; keywords: string[] } {
    const positiveWords = ['excellent', 'amazing', 'great', 'good', 'love', 'perfect', 'awesome', 'best', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'poor', 'hate', 'worst', 'horrible', 'disgusting', 'rude', 'slow'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    const keywords: string[] = [];

    for (const word of positiveWords) {
      if (lowerText.includes(word)) {
        positiveCount++;
        keywords.push(word);
      }
    }

    for (const word of negativeWords) {
      if (lowerText.includes(word)) {
        negativeCount++;
        keywords.push(word);
      }
    }

    let sentiment: Sentiment = 'neutral';
    let sentimentScore = 0.5;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      sentimentScore = Math.min(1, 0.5 + positiveCount * 0.1);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      sentimentScore = Math.max(0, 0.5 - negativeCount * 0.1);
    }

    return { sentiment, sentimentScore, keywords };
  }

  /**
   * Create auto response for negative reviews
   */
  private async createAutoResponse(review: Review): Promise<void> {
    const autoResponses: Record<string, string> = {
      slow: "We apologize for the delayed delivery. We're working to improve our delivery times.",
      cold: "We're sorry the food arrived cold. Please contact us for a replacement or refund.",
      quality: "We regret the quality issue. Please reach out to us for resolution.",
      rude: "We apologize for the poor service. We'll address this with our team immediately.",
      default: "Thank you for your feedback. We appreciate your input and will work to improve.",
    };

    let responseText = autoResponses.default;

    for (const [keyword, response] of Object.entries(autoResponses)) {
      if (review.keywords.includes(keyword)) {
        responseText = response;
        break;
      }
    }

    const response: ReviewResponse = {
      id: `RESP-${Date.now()}`,
      reviewId: review.id,
      responseText,
      respondedBy: 'Auto-Response',
      respondedAt: new Date(),
      status: 'pending',
    };

    this.responses.set(response.id, response);
  }

  /**
   * Get review
   */
  async getReview(reviewId: string): Promise<Review | null> {
    return this.reviews.get(reviewId) || null;
  }

  /**
   * Get all reviews
   */
  async getAllReviews(locationId?: string, platform?: Platform, sentiment?: Sentiment): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values());

    if (locationId) {
      reviews = reviews.filter((r) => r.locationId === locationId);
    }

    if (platform) {
      reviews = reviews.filter((r) => r.platform === platform);
    }

    if (sentiment) {
      reviews = reviews.filter((r) => r.sentiment === sentiment);
    }

    return reviews.sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
  }

  /**
   * Add response to review
   */
  async addResponse(reviewId: string, responseText: string, respondedBy: string): Promise<ReviewResponse> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    // Check if response already exists
    const existing = Array.from(this.responses.values()).find((r) => r.reviewId === reviewId);
    if (existing) {
      existing.responseText = responseText;
      existing.respondedBy = respondedBy;
      existing.respondedAt = new Date();
      existing.status = 'responded';
      return existing;
    }

    const response: ReviewResponse = {
      id: `RESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reviewId,
      responseText,
      respondedBy,
      respondedAt: new Date(),
      status: 'responded',
    };

    this.responses.set(response.id, response);
    return response;
  }

  /**
   * Get review response
   */
  async getReviewResponse(reviewId: string): Promise<ReviewResponse | null> {
    return Array.from(this.responses.values()).find((r) => r.reviewId === reviewId) || null;
  }

  /**
   * Get review analytics
   */
  async getReviewAnalytics(locationId?: string): Promise<ReviewAnalytics> {
    let reviews = await this.getAllReviews(locationId);
    const allResponses = Array.from(this.responses.values());

    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    const positiveReviews = reviews.filter((r) => r.sentiment === 'positive').length;
    const neutralReviews = reviews.filter((r) => r.sentiment === 'neutral').length;
    const negativeReviews = reviews.filter((r) => r.sentiment === 'negative').length;

    const sentimentScore = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.sentimentScore, 0) / reviews.length : 0.5;

    const respondedReviews = allResponses.filter((r) => r.status === 'responded').length;
    const responseRate = totalReviews > 0 ? (respondedReviews / totalReviews) * 100 : 0;

    const responseTimeDiffs = allResponses
      .filter((r) => r.status === 'responded')
      .map((r) => {
        const review = reviews.find((rv) => rv.id === r.reviewId);
        if (review) {
          return (r.respondedAt.getTime() - review.reviewDate.getTime()) / (1000 * 60 * 60);
        }
        return 0;
      });
    const averageResponseTime = responseTimeDiffs.length > 0 ? responseTimeDiffs.reduce((a, b) => a + b) / responseTimeDiffs.length : 0;

    // Rating distribution
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of reviews) {
      ratingDistribution[review.rating]++;
    }

    // Platform breakdown
    const platformBreakdown: Record<Platform, { reviews: number; avgRating: number }> = {
      google: { reviews: 0, avgRating: 0 },
      zomato: { reviews: 0, avgRating: 0 },
      swiggy: { reviews: 0, avgRating: 0 },
      instagram: { reviews: 0, avgRating: 0 },
      facebook: { reviews: 0, avgRating: 0 },
      internal: { reviews: 0, avgRating: 0 },
    };

    for (const review of reviews) {
      platformBreakdown[review.platform].reviews++;
      platformBreakdown[review.platform].avgRating += review.rating;
    }

    for (const platform of Object.keys(platformBreakdown) as Platform[]) {
      if (platformBreakdown[platform].reviews > 0) {
        platformBreakdown[platform].avgRating /= platformBreakdown[platform].reviews;
      }
    }

    // Top keywords
    const keywordCounts: Record<string, { count: number; sentiment: Sentiment }> = {};
    for (const review of reviews) {
      for (const keyword of review.keywords) {
        if (!keywordCounts[keyword]) {
          keywordCounts[keyword] = { count: 0, sentiment: review.sentiment };
        }
        keywordCounts[keyword].count++;
      }
    }

    const topKeywords = Object.entries(keywordCounts)
      .map(([keyword, data]) => ({ keyword, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Review trends (last 30 days)
    const reviewTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const dayReviews = reviews.filter((r) => {
        const reviewDate = new Date(r.reviewDate);
        return reviewDate.toDateString() === date.toDateString();
      });

      const avgRating = dayReviews.length > 0 ? dayReviews.reduce((sum, r) => sum + r.rating, 0) / dayReviews.length : 0;

      reviewTrends.push({
        date: dateStr,
        reviews: dayReviews.length,
        avgRating: Math.round(avgRating * 10) / 10,
      });
    }

    // Improvement areas
    const improvementAreas = reviews
      .filter((r) => r.sentiment === 'negative')
      .flatMap((r) => r.keywords)
      .reduce((acc: Record<string, number>, keyword) => {
        acc[keyword] = (acc[keyword] || 0) + 1;
        return acc;
      }, {});

    const improvementAreasList = Object.entries(improvementAreas)
      .map(([keyword, count]) => ({ keyword, count, sentiment: 'negative' as const }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      positiveReviews,
      neutralReviews,
      negativeReviews,
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      responseRate: Math.round(responseRate),
      averageResponseTime: Math.round(averageResponseTime),
      ratingDistribution,
      platformBreakdown,
      topKeywords,
      reviewTrends,
      improvementAreas: improvementAreasList,
    };
  }

  /**
   * Get negative reviews requiring response
   */
  async getNegativeReviewsNeedingResponse(): Promise<Review[]> {
    const reviews = Array.from(this.reviews.values()).filter((r) => r.sentiment === 'negative');

    const reviewsNeedingResponse = reviews.filter((r) => {
      const response = Array.from(this.responses.values()).find((resp) => resp.reviewId === r.id);
      return !response || response.status === 'pending';
    });

    return reviewsNeedingResponse.sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
  }

  /**
   * Get review by platform
   */
  async getReviewsByPlatform(platform: Platform): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((r) => r.platform === platform)
      .sort((a, b) => b.reviewDate.getTime() - a.reviewDate.getTime());
  }

  /**
   * Sync reviews from platform
   */
  async syncReviewsFromPlatform(platform: Platform, locationId: string): Promise<number> {
    // This would integrate with actual platform APIs
    // For now, it's a placeholder
    console.log(`Syncing reviews from ${platform} for location ${locationId}`);
    return 0;
  }
}

export default FeedbackIntegrationService;
