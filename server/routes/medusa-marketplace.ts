/**
 * Medusa Marketplace Routes
 * Handles seller and product management for SubCircle marketplace
 */

import { router, publicProcedure, protectedProcedure } from '@/server/_core/trpc'
import { z } from 'zod'
import { sellerService } from '@/server/services/seller-service'

// Validation schemas
const CreateSellerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
})

const UpdateSellerSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().url().optional(),
  banner_url: z.string().url().optional(),
})

const ProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  category: z.string(),
  images: z.array(z.string().url()).optional(),
  stock: z.number().int().nonnegative().optional(),
})

const CartItemSchema = z.object({
  product_id: z.string(),
  variant_id: z.string(),
  quantity: z.number().int().positive(),
})

const OrderSchema = z.object({
  customer_name: z.string(),
  customer_email: z.string().email(),
  customer_phone: z.string(),
  items: z.array(CartItemSchema),
  shipping_address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
  payment_method: z.enum(['card', 'upi', 'netbanking', 'wallet']),
})

export const medusaMarketplaceRouter = router({
  // ==================== SELLER ROUTES ====================

  /**
   * Create a new seller account
   */
  createSeller: protectedProcedure
    .input(CreateSellerSchema)
    .mutation(async ({ input }) => {
      try {
        const seller = await sellerService.createSeller(input)
        return {
          success: true,
          seller,
          message: 'Seller account created successfully',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create seller',
        }
      }
    }),

  /**
   * Get seller profile by ID
   */
  getSellerProfile: publicProcedure
    .input(z.object({ sellerId: z.string() }))
    .query(async ({ input }) => {
      try {
        const seller = await sellerService.getSellerById(input.sellerId)
        if (!seller) {
          return { success: false, error: 'Seller not found' }
        }
        return { success: true, seller }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch seller',
        }
      }
    }),

  /**
   * Update seller profile
   */
  updateSellerProfile: protectedProcedure
    .input(
      z.object({
        sellerId: z.string(),
        data: UpdateSellerSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        const seller = await sellerService.updateSeller(input.sellerId, input.data)
        return {
          success: true,
          seller,
          message: 'Seller profile updated successfully',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update seller',
        }
      }
    }),

  /**
   * Verify seller account (admin only)
   */
  verifySeller: protectedProcedure
    .input(z.object({ sellerId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const seller = await sellerService.verifySeller(input.sellerId)
        return {
          success: true,
          seller,
          message: 'Seller verified successfully',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to verify seller',
        }
      }
    }),

  /**
   * Get seller statistics
   */
  getSellerStats: publicProcedure
    .input(z.object({ sellerId: z.string() }))
    .query(async ({ input }) => {
      try {
        const stats = await sellerService.getSellerStats(input.sellerId)
        return { success: true, stats }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch stats',
        }
      }
    }),

  /**
   * Get all sellers (paginated)
   */
  getAllSellers: publicProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(10),
        offset: z.number().int().nonnegative().default(0),
        verified: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const result = await sellerService.getAllSellers(
          input.limit,
          input.offset,
          input.verified
        )
        return { success: true, ...result }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch sellers',
        }
      }
    }),

  /**
   * Search sellers
   */
  searchSellers: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().positive().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const sellers = await sellerService.searchSellers(input.query, input.limit)
        return { success: true, sellers }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to search sellers',
        }
      }
    }),

  /**
   * Get top sellers by rating
   */
  getTopSellersByRating: publicProcedure
    .input(z.object({ limit: z.number().int().positive().default(10) }))
    .query(async ({ input }) => {
      try {
        const sellers = await sellerService.getTopSellersByRating(input.limit)
        return { success: true, sellers }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch top sellers',
        }
      }
    }),

  /**
   * Get top sellers by revenue
   */
  getTopSellersByRevenue: publicProcedure
    .input(z.object({ limit: z.number().int().positive().default(10) }))
    .query(async ({ input }) => {
      try {
        const sellers = await sellerService.getTopSellersByRevenue(input.limit)
        return { success: true, sellers }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch top sellers',
        }
      }
    }),

  // ==================== PRODUCT ROUTES ====================

  /**
   * Create product (seller only)
   */
  createProduct: protectedProcedure
    .input(
      z.object({
        sellerId: z.string(),
        product: ProductSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify seller exists
        const seller = await sellerService.getSellerById(input.sellerId)
        if (!seller) {
          return { success: false, error: 'Seller not found' }
        }

        // Create product (in real implementation, would save to database)
        const product = {
          id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          seller_id: input.sellerId,
          ...input.product,
          created_at: new Date(),
          updated_at: new Date(),
        }

        // Update seller product count
        await sellerService.updateProductCount(input.sellerId, seller.total_products + 1)

        return {
          success: true,
          product,
          message: 'Product created successfully',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create product',
        }
      }
    }),

  // ==================== CART ROUTES ====================

  /**
   * Create cart
   */
  createCart: publicProcedure
    .input(z.object({ region_id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const cart = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          region_id: input.region_id,
          items: [],
          total: 0,
          created_at: new Date(),
          updated_at: new Date(),
        }

        return { success: true, cart }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create cart',
        }
      }
    }),

  /**
   * Add item to cart
   */
  addToCart: publicProcedure
    .input(
      z.object({
        cart_id: z.string(),
        item: CartItemSchema,
      })
    )
    .mutation(async ({ input }) => {
      try {
        // In real implementation, would update cart in database
        return {
          success: true,
          message: 'Item added to cart',
          item: input.item,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to add item to cart',
        }
      }
    }),

  // ==================== ORDER ROUTES ====================

  /**
   * Create order
   */
  createOrder: publicProcedure
    .input(OrderSchema)
    .mutation(async ({ input }) => {
      try {
        const order = {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...input,
          status: 'pending',
          total: input.items.reduce((sum, item) => sum + item.quantity * 100, 0), // Placeholder
          created_at: new Date(),
          updated_at: new Date(),
        }

        return {
          success: true,
          order,
          message: 'Order created successfully',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create order',
        }
      }
    }),

  /**
   * Get order by ID
   */
  getOrder: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      try {
        // In real implementation, would fetch from database
        return {
          success: true,
          order: {
            id: input.orderId,
            status: 'pending',
            created_at: new Date(),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to fetch order',
        }
      }
    }),

  /**
   * Update order status
   */
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return {
          success: true,
          message: 'Order status updated',
          order: {
            id: input.orderId,
            status: input.status,
            updated_at: new Date(),
          },
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update order',
        }
      }
    }),
})
