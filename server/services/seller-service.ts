/**
 * Seller Service for SubCircle Marketplace
 * Handles all seller-related operations
 */

import { Seller, CreateSellerInput, UpdateSellerInput, SellerStats } from '@/server/models/seller'

class SellerService {
  private sellers: Map<string, Seller> = new Map()

  /**
   * Create a new seller account
   */
  async createSeller(input: CreateSellerInput): Promise<Seller> {
    const sellerId = `seller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const seller: Seller = {
      id: sellerId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      description: input.description || '',
      verified: false,
      logo_url: input.logo_url,
      banner_url: input.banner_url,
      rating: 0,
      total_reviews: 0,
      total_products: 0,
      total_orders: 0,
      total_revenue: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }

    this.sellers.set(sellerId, seller)
    return seller
  }

  /**
   * Get seller by ID
   */
  async getSellerById(sellerId: string): Promise<Seller | null> {
    return this.sellers.get(sellerId) || null
  }

  /**
   * Get seller by email
   */
  async getSellerByEmail(email: string): Promise<Seller | null> {
    for (const seller of this.sellers.values()) {
      if (seller.email === email) {
        return seller
      }
    }
    return null
  }

  /**
   * Update seller profile
   */
  async updateSeller(sellerId: string, input: UpdateSellerInput): Promise<Seller> {
    const seller = this.sellers.get(sellerId)
    if (!seller) {
      throw new Error(`Seller ${sellerId} not found`)
    }

    const updated: Seller = {
      ...seller,
      ...input,
      updated_at: new Date(),
    }

    this.sellers.set(sellerId, updated)
    return updated
  }

  /**
   * Verify seller account
   */
  async verifySeller(sellerId: string): Promise<Seller> {
    const seller = this.sellers.get(sellerId)
    if (!seller) {
      throw new Error(`Seller ${sellerId} not found`)
    }

    const verified: Seller = {
      ...seller,
      verified: true,
      updated_at: new Date(),
    }

    this.sellers.set(sellerId, verified)
    return verified
  }

  /**
   * Get all sellers (paginated)
   */
  async getAllSellers(
    limit: number = 10,
    offset: number = 0,
    verified?: boolean
  ): Promise<{ sellers: Seller[]; total: number }> {
    let sellers = Array.from(this.sellers.values())

    if (verified !== undefined) {
      sellers = sellers.filter((s) => s.verified === verified)
    }

    const total = sellers.length
    const paginated = sellers.slice(offset, offset + limit)

    return { sellers: paginated, total }
  }

  /**
   * Get seller statistics
   */
  async getSellerStats(sellerId: string): Promise<SellerStats> {
    const seller = this.sellers.get(sellerId)
    if (!seller) {
      throw new Error(`Seller ${sellerId} not found`)
    }

    return {
      total_products: seller.total_products,
      total_orders: seller.total_orders,
      total_revenue: seller.total_revenue,
      average_rating: seller.rating,
      total_reviews: seller.total_reviews,
      response_time_hours: 2,
      cancellation_rate: 0.5,
      return_rate: 1.2,
    }
  }

  /**
   * Update seller rating
   */
  async updateSellerRating(
    sellerId: string,
    rating: number,
    reviewCount: number
  ): Promise<Seller> {
    const seller = this.sellers.get(sellerId)
    if (!seller) {
      throw new Error(`Seller ${sellerId} not found`)
    }

    // Calculate new average rating
    const totalRating = seller.rating * seller.total_reviews + rating
    const newReviewCount = seller.total_reviews + 1
    const newAverageRating = totalRating / newReviewCount

    const updated: Seller = {
      ...seller,
      rating: Math.round(newAverageRating * 10) / 10,
      total_reviews: newReviewCount,
      updated_at: new Date(),
    }

    this.sellers.set(sellerId, updated)
    return updated
  }

  /**
   * Update seller revenue
   */
  async updateSellerRevenue(sellerId: string, amount: number): Promise<Seller> {
    const seller = this.sellers.get(sellerId)
    if (!seller) {
      throw new Error(`Seller ${sellerId} not found`)
    }

    const updated: Seller = {
      ...seller,
      total_revenue: seller.total_revenue + amount,
      updated_at: new Date(),
    }

    this.sellers.set(sellerId, updated)
    return updated
  }

  /**
   * Update seller product count
   */
  async updateProductCount(sellerId: string, count: number): Promise<Seller> {
    const seller = this.sellers.get(sellerId)
    if (!seller) {
      throw new Error(`Seller ${sellerId} not found`)
    }

    const updated: Seller = {
      ...seller,
      total_products: count,
      updated_at: new Date(),
    }

    this.sellers.set(sellerId, updated)
    return updated
  }

  /**
   * Search sellers
   */
  async searchSellers(query: string, limit: number = 10): Promise<Seller[]> {
    const queryLower = query.toLowerCase()
    const results = Array.from(this.sellers.values())
      .filter(
        (s) =>
          s.name.toLowerCase().includes(queryLower) ||
          s.description?.toLowerCase().includes(queryLower)
      )
      .slice(0, limit)

    return results
  }

  /**
   * Get top sellers by rating
   */
  async getTopSellersByRating(limit: number = 10): Promise<Seller[]> {
    return Array.from(this.sellers.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
  }

  /**
   * Get top sellers by revenue
   */
  async getTopSellersByRevenue(limit: number = 10): Promise<Seller[]> {
    return Array.from(this.sellers.values())
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, limit)
  }

  /**
   * Delete seller (soft delete)
   */
  async deleteSeller(sellerId: string): Promise<boolean> {
    const seller = this.sellers.get(sellerId)
    if (!seller) {
      throw new Error(`Seller ${sellerId} not found`)
    }

    this.sellers.delete(sellerId)
    return true
  }
}

export const sellerService = new SellerService()
