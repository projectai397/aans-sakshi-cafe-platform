/**
 * Seller Model for SubCircle Marketplace
 * Represents a seller/vendor on the platform
 */

export interface Seller {
  id: string
  name: string
  email: string
  phone: string
  description?: string
  verified: boolean
  logo_url?: string
  banner_url?: string
  rating: number
  total_reviews: number
  total_products: number
  total_orders: number
  total_revenue: number
  created_at: Date
  updated_at: Date
  metadata?: Record<string, any>
}

export interface SellerProfile extends Seller {
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  business_type?: string
  tax_id?: string
  bank_account?: {
    account_holder: string
    account_number: string
    bank_name: string
    ifsc_code: string
  }
  social_links?: {
    instagram?: string
    facebook?: string
    twitter?: string
    website?: string
  }
  policies?: {
    return_policy?: string
    shipping_policy?: string
    cancellation_policy?: string
  }
}

export interface CreateSellerInput {
  name: string
  email: string
  phone: string
  description?: string
  logo_url?: string
  banner_url?: string
}

export interface UpdateSellerInput {
  name?: string
  description?: string
  logo_url?: string
  banner_url?: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  business_type?: string
  social_links?: Record<string, string>
}

export interface SellerStats {
  total_products: number
  total_orders: number
  total_revenue: number
  average_rating: number
  total_reviews: number
  response_time_hours: number
  cancellation_rate: number
  return_rate: number
}

export interface SellerVerification {
  seller_id: string
  verified: boolean
  verified_at?: Date
  verification_method?: 'email' | 'phone' | 'document' | 'manual'
  verification_documents?: string[]
  notes?: string
}
