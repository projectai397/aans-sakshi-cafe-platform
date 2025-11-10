/**
 * Customer Review & Rating System
 * Multi-platform review collection, sentiment analysis, response management
 */

type ReviewSource = 'app' | 'swiggy' | 'zomato' | 'uber_eats' | 'google' | 'website';
type SentimentType = 'positive' | 'neutral' | 'negative';
type ReviewStatus = 'pending' | 'published' | 'flagged' | 'responded';

interface Review {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  title: string;
  content: string;
  source: ReviewSource;
  sentiment: SentimentType;
  sentimentScore: number; // -1 to 1
  tags: string[];
  images?: string[];
  helpful: number;
  unhelpful: number;
  status: ReviewStatus;
  publishedAt: Date;
  response?: ReviewResponse;
  createdAt: Date;
}

interface ReviewResponse {
  id: string;
  reviewId: string;
  responderId: string;
  responderName: string;
  content: string;
  createdAt: Date;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  sentimentDistribution: Record<SentimentType, number>;
  bySource: Record<ReviewSource, number>;
  helpfulCount: number;
  responseRate: number;
  trendsOverTime: any[];
}

interface ReviewAnalysis {
  topPositiveKeywords: string[];
  topNegativeKeywords: string[];
  commonIssues: string[];
  strengths: string[];
  improvements: string[];
}

class ReviewRatingService {
  private reviews: Map<string, Review> = new Map();
  private responses: Map<string, ReviewResponse> = new Map();
  private keywords: Map<string, number> = new Map();

  /**
   * Add review
   */
  async addReview(review: Omit<Review, 'id' | 'sentiment' | 'sentimentScore' | 'helpful' | 'unhelpful' | 'createdAt'>): Promise<Review> {
    const { sentiment, sentimentScore } = this.analyzeSentiment(review.content);

    const fullReview: Review = {
      ...review,
      id: `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentiment,
      sentimentScore,
      helpful: 0,
      unhelpful: 0,
      createdAt: new Date(),
    };

    this.reviews.set(fullReview.id, fullReview);

    // Extract keywords
    this.extractKeywords(review.content, sentiment);

    return fullReview;
  }

  /**
   * Analyze sentiment
   */
  private analyzeSentiment(text: string): { sentiment: SentimentType; sentimentScore: number } {
    const positiveWords = [
      'excellent',
      'great',
      'amazing',
      'fantastic',
      'wonderful',
      'delicious',
      'fresh',
      'tasty',
      'perfect',
      'love',
      'best',
      'awesome',
    ];
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'poor',
      'worse',
      'stale',
      'cold',
      'late',
      'disappointed',
      'hate',
      'worst',
      'horrible',
    ];

    let score = 0;
    const words = text.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (positiveWords.some((pw) => word.includes(pw))) score++;
      if (negativeWords.some((nw) => word.includes(nw))) score--;
    }

    const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(1, words.length)));

    let sentiment: SentimentType = 'neutral';
    if (normalizedScore > 0.2) sentiment = 'positive';
    if (normalizedScore < -0.2) sentiment = 'negative';

    return { sentiment, sentimentScore: normalizedScore };
  }

  /**
   * Extract keywords
   */
  private extractKeywords(text: string, sentiment: SentimentType): void {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'is', 'was', 'are'];
    const words = text.toLowerCase().split(/\s+/);

    for (const word of words) {
      if (word.length > 3 && !stopWords.includes(word)) {
        const key = `${sentiment}:${word}`;
        this.keywords.set(key, (this.keywords.get(key) || 0) + 1);
      }
    }
  }

  /**
   * Get review
   */
  async getReview(reviewId: string): Promise<Review | null> {
    return this.reviews.get(reviewId) || null;
  }

  /**
   * Get reviews for order
   */
  async getReviewsForOrder(orderId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((r) => r.orderId === orderId);
  }

  /**
   * Get reviews for customer
   */
  async getReviewsForCustomer(customerId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((r) => r.customerId === customerId);
  }

  /**
   * Get all reviews
   */
  async getAllReviews(limit: number = 100): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get reviews by rating
   */
  async getReviewsByRating(rating: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((r) => r.rating === rating);
  }

  /**
   * Get reviews by sentiment
   */
  async getReviewsBySentiment(sentiment: SentimentType): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((r) => r.sentiment === sentiment);
  }

  /**
   * Get reviews by source
   */
  async getReviewsBySource(source: ReviewSource): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((r) => r.source === source);
  }

  /**
   * Mark review as helpful
   */
  async markHelpful(reviewId: string): Promise<Review> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    review.helpful++;
    return review;
  }

  /**
   * Mark review as unhelpful
   */
  async markUnhelpful(reviewId: string): Promise<Review> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    review.unhelpful++;
    return review;
  }

  /**
   * Flag review
   */
  async flagReview(reviewId: string): Promise<Review> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    review.status = 'flagged';
    return review;
  }

  /**
   * Publish review
   */
  async publishReview(reviewId: string): Promise<Review> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    review.status = 'published';
    review.publishedAt = new Date();
    return review;
  }

  /**
   * Add response to review
   */
  async respondToReview(reviewId: string, responderId: string, responderName: string, content: string): Promise<Review> {
    const review = this.reviews.get(reviewId);
    if (!review) {
      throw new Error(`Review ${reviewId} not found`);
    }

    const response: ReviewResponse = {
      id: `RESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      reviewId,
      responderId,
      responderName,
      content,
      createdAt: new Date(),
    };

    review.response = response;
    review.status = 'responded';
    this.responses.set(response.id, response);

    return review;
  }

  /**
   * Get review statistics
   */
  async getReviewStats(): Promise<ReviewStats> {
    const reviews = Array.from(this.reviews.values());

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentDistribution: Record<SentimentType, number> = { positive: 0, neutral: 0, negative: 0 };
    const bySource: Record<ReviewSource, number> = {
      app: 0,
      swiggy: 0,
      zomato: 0,
      uber_eats: 0,
      google: 0,
      website: 0,
    };

    let totalRating = 0;
    let helpfulCount = 0;
    let respondedCount = 0;

    for (const review of reviews) {
      ratingDistribution[review.rating]++;
      sentimentDistribution[review.sentiment]++;
      bySource[review.source]++;
      totalRating += review.rating;
      helpfulCount += review.helpful;
      if (review.response) respondedCount++;
    }

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const responseRate = reviews.length > 0 ? (respondedCount / reviews.length) * 100 : 0;

    return {
      totalReviews: reviews.length,
      averageRating: parseFloat(averageRating.toFixed(2)),
      ratingDistribution,
      sentimentDistribution,
      bySource,
      helpfulCount,
      responseRate: parseFloat(responseRate.toFixed(2)),
      trendsOverTime: this.calculateTrends(reviews),
    };
  }

  /**
   * Calculate trends over time
   */
  private calculateTrends(reviews: Review[]): any[] {
    const trends: Record<string, { rating: number; count: number }> = {};

    for (const review of reviews) {
      const date = review.createdAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { rating: 0, count: 0 };
      }
      trends[date].rating += review.rating;
      trends[date].count++;
    }

    return Object.entries(trends).map(([date, data]) => ({
      date,
      averageRating: (data.rating / data.count).toFixed(2),
      reviewCount: data.count,
    }));
  }

  /**
   * Analyze reviews
   */
  async analyzeReviews(): Promise<ReviewAnalysis> {
    const positiveKeywords: Record<string, number> = {};
    const negativeKeywords: Record<string, number> = {};

    for (const [key, count] of this.keywords.entries()) {
      const [sentiment, word] = key.split(':');
      if (sentiment === 'positive') {
        positiveKeywords[word] = count;
      } else if (sentiment === 'negative') {
        negativeKeywords[word] = count;
      }
    }

    const topPositiveKeywords = Object.entries(positiveKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    const topNegativeKeywords = Object.entries(negativeKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);

    const negativeReviews = Array.from(this.reviews.values()).filter((r) => r.sentiment === 'negative');
    const commonIssues = this.extractCommonIssues(negativeReviews);

    const positiveReviews = Array.from(this.reviews.values()).filter((r) => r.sentiment === 'positive');
    const strengths = this.extractStrengths(positiveReviews);

    return {
      topPositiveKeywords,
      topNegativeKeywords,
      commonIssues,
      strengths,
      improvements: this.getImprovementAreas(commonIssues),
    };
  }

  /**
   * Extract common issues
   */
  private extractCommonIssues(reviews: Review[]): string[] {
    const issues: Record<string, number> = {};

    for (const review of reviews) {
      const tags = review.tags || [];
      for (const tag of tags) {
        issues[tag] = (issues[tag] || 0) + 1;
      }
    }

    return Object.entries(issues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  /**
   * Extract strengths
   */
  private extractStrengths(reviews: Review[]): string[] {
    const strengths: Record<string, number> = {};

    for (const review of reviews) {
      const tags = review.tags || [];
      for (const tag of tags) {
        strengths[tag] = (strengths[tag] || 0) + 1;
      }
    }

    return Object.entries(strengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([strength]) => strength);
  }

  /**
   * Get improvement areas
   */
  private getImprovementAreas(issues: string[]): string[] {
    const improvements: Record<string, string> = {
      'delivery_time': 'Optimize delivery logistics and routing',
      'food_quality': 'Improve food preparation and quality control',
      'packaging': 'Upgrade packaging materials and methods',
      'temperature': 'Ensure proper food temperature during delivery',
      'missing_items': 'Implement order verification system',
      'customer_service': 'Enhance customer support training',
      'cleanliness': 'Improve kitchen and packaging hygiene',
      'portion_size': 'Review portion size standards',
    };

    return issues
      .filter((issue) => improvements[issue])
      .map((issue) => improvements[issue]);
  }

  /**
   * Get platform comparison
   */
  async getPlatformComparison(): Promise<any> {
    const platforms: Record<ReviewSource, { rating: number; count: number; sentiment: Record<SentimentType, number> }> = {
      app: { rating: 0, count: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } },
      swiggy: { rating: 0, count: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } },
      zomato: { rating: 0, count: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } },
      uber_eats: { rating: 0, count: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } },
      google: { rating: 0, count: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } },
      website: { rating: 0, count: 0, sentiment: { positive: 0, neutral: 0, negative: 0 } },
    };

    for (const review of this.reviews.values()) {
      platforms[review.source].rating += review.rating;
      platforms[review.source].count++;
      platforms[review.source].sentiment[review.sentiment]++;
    }

    const comparison: Record<string, any> = {};
    for (const [platform, data] of Object.entries(platforms)) {
      if (data.count > 0) {
        comparison[platform] = {
          averageRating: (data.rating / data.count).toFixed(2),
          reviewCount: data.count,
          sentiment: data.sentiment,
        };
      }
    }

    return comparison;
  }

  /**
   * Get reviews needing response
   */
  async getReviewsNeedingResponse(): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter((r) => !r.response && r.sentiment === 'negative');
  }

  /**
   * Get response metrics
   */
  async getResponseMetrics(): Promise<any> {
    const reviews = Array.from(this.reviews.values());
    const reviewsWithResponse = reviews.filter((r) => r.response);

    const avgResponseTime = this.calculateAvgResponseTime(reviewsWithResponse);

    return {
      totalReviews: reviews.length,
      reviewsWithResponse: reviewsWithResponse.length,
      responseRate: ((reviewsWithResponse.length / reviews.length) * 100).toFixed(2),
      averageResponseTime: avgResponseTime,
      negativeReviewsResponded: reviewsWithResponse.filter((r) => r.sentiment === 'negative').length,
    };
  }

  /**
   * Calculate average response time
   */
  private calculateAvgResponseTime(reviews: Review[]): string {
    if (reviews.length === 0) return '0 hours';

    let totalTime = 0;
    for (const review of reviews) {
      if (review.response) {
        const time = review.response.createdAt.getTime() - review.createdAt.getTime();
        totalTime += time;
      }
    }

    const avgHours = (totalTime / reviews.length / (1000 * 60 * 60)).toFixed(2);
    return `${avgHours} hours`;
  }
}

export default ReviewRatingService;
