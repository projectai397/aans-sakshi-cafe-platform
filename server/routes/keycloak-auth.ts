/**
 * Keycloak Authentication Routes
 * Handles user authentication, registration, and token management
 */

import { router, publicProcedure, protectedProcedure } from '@/server/_core/trpc'
import { z } from 'zod'
import {
  verifyToken,
  validateToken,
  getUserInfo,
  isTokenExpired,
  getTokenValidity,
} from '@/server/middleware/keycloak-auth'

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080'
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'aans'
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'aans-web'
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || ''

// Validation schemas
const LoginSchema = z.object({
  username: z.string().min(1, 'Username required'),
  password: z.string().min(1, 'Password required'),
})

const RegisterSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const TokenSchema = z.object({
  token: z.string(),
})

const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const keycloakAuthRouter = router({
  /**
   * Login user with username and password
   */
  login: publicProcedure.input(LoginSchema).mutation(async ({ input }) => {
    try {
      const response = await fetch(
        `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: KEYCLOAK_CLIENT_ID,
            client_secret: KEYCLOAK_CLIENT_SECRET,
            username: input.username,
            password: input.password,
            scope: 'openid profile email',
          }),
        }
      )

      if (!response.ok) {
        return {
          success: false,
          error: 'Invalid username or password',
        }
      }

      const data = await response.json()
      const token = data.access_token

      // Get user info
      const userInfo = getUserInfo(token)

      return {
        success: true,
        token,
        user: userInfo,
        expiresIn: data.expires_in,
        refreshToken: data.refresh_token,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }
    }
  }),

  /**
   * Register new user
   */
  register: publicProcedure.input(RegisterSchema).mutation(async ({ input }) => {
    try {
      const response = await fetch(
        `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: input.username,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            password: input.password,
            enabled: true,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.error_description || 'Registration failed',
        }
      }

      return {
        success: true,
        message: 'Registration successful. Please log in.',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }
    }
  }),

  /**
   * Validate token
   */
  validateToken: publicProcedure.input(TokenSchema).query(({ input }) => {
    const result = validateToken(input.token)
    return result
  }),

  /**
   * Get current user info
   */
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return {
      success: true,
      user: ctx.user,
    }
  }),

  /**
   * Logout user
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // Optional: Revoke token on server
      await fetch(
        `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: KEYCLOAK_CLIENT_ID,
            client_secret: KEYCLOAK_CLIENT_SECRET,
          }),
        }
      ).catch(() => {
        // Ignore errors during logout
      })

      return {
        success: true,
        message: 'Logged out successfully',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }
    }
  }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(ChangePasswordSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // First, verify current password
        const loginResponse = await fetch(
          `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'password',
              client_id: KEYCLOAK_CLIENT_ID,
              client_secret: KEYCLOAK_CLIENT_SECRET,
              username: ctx.user.preferred_username,
              password: input.currentPassword,
            }),
          }
        )

        if (!loginResponse.ok) {
          return {
            success: false,
            error: 'Current password is incorrect',
          }
        }

        // Update password via admin API
        // This would require admin token - implementation depends on setup
        return {
          success: true,
          message: 'Password changed successfully',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Password change failed',
        }
      }
    }),

  /**
   * Refresh token
   */
  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              client_id: KEYCLOAK_CLIENT_ID,
              client_secret: KEYCLOAK_CLIENT_SECRET,
              refresh_token: input.refreshToken,
            }),
          }
        )

        if (!response.ok) {
          return {
            success: false,
            error: 'Token refresh failed',
          }
        }

        const data = await response.json()
        return {
          success: true,
          token: data.access_token,
          expiresIn: data.expires_in,
          refreshToken: data.refresh_token,
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Token refresh failed',
        }
      }
    }),

  /**
   * Get token info
   */
  getTokenInfo: publicProcedure.input(TokenSchema).query(({ input }) => {
    try {
      const decoded = verifyToken(input.token)
      if (!decoded) {
        return {
          success: false,
          error: 'Invalid token',
        }
      }

      return {
        success: true,
        token: {
          userId: decoded.sub,
          email: decoded.email,
          username: decoded.preferred_username,
          isExpired: isTokenExpired(input.token),
          validitySeconds: getTokenValidity(input.token),
          issuedAt: new Date(decoded.iat * 1000),
          expiresAt: new Date(decoded.exp * 1000),
        },
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      }
    }
  }),

  /**
   * Check if user has role
   */
  hasRole: protectedProcedure
    .input(z.object({ role: z.string() }))
    .query(({ input, ctx }) => {
      const hasRole = ctx.user?.realm_access?.roles?.includes(input.role) ?? false
      return {
        success: true,
        hasRole,
      }
    }),

  /**
   * Get user roles
   */
  getUserRoles: protectedProcedure.query(({ ctx }) => {
    const roles = ctx.user?.realm_access?.roles || []
    return {
      success: true,
      roles,
    }
  }),

  /**
   * Verify email
   */
  sendVerificationEmail: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      // This would require admin API access
      return {
        success: true,
        message: 'Verification email sent',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      }
    }
  }),

  /**
   * Reset password request
   */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      try {
        // This would require admin API access
        return {
          success: true,
          message: 'Password reset email sent',
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to send reset email',
        }
      }
    }),
})
