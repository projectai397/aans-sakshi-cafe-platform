/**
 * Keycloak Authentication Middleware
 * Handles JWT validation and role-based access control
 */

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: any
      userId?: string
      userRoles?: string[]
      userEmail?: string
      userName?: string
    }
  }
}

interface DecodedToken {
  sub: string
  email: string
  name: string
  preferred_username: string
  realm_access?: {
    roles: string[]
  }
  resource_access?: {
    [key: string]: {
      roles: string[]
    }
  }
  iat: number
  exp: number
  iss: string
}

const KEYCLOAK_PUBLIC_KEY = process.env.KEYCLOAK_PUBLIC_KEY || ''
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'aans'
const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080'

/**
 * Verify JWT token from Keycloak
 */
export function verifyToken(token: string): DecodedToken | null {
  try {
    if (!KEYCLOAK_PUBLIC_KEY) {
      console.warn('KEYCLOAK_PUBLIC_KEY not configured')
      return null
    }

    const decoded = jwt.verify(token, KEYCLOAK_PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
    }) as DecodedToken

    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}

/**
 * Middleware: Authenticate request with JWT
 */
export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req)

  if (!token) {
    res.status(401).json({ error: 'No token provided' })
    return
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }

  // Attach user info to request
  req.user = decoded
  req.userId = decoded.sub
  req.userEmail = decoded.email
  req.userName = decoded.name || decoded.preferred_username
  req.userRoles = decoded.realm_access?.roles || []

  next()
}

/**
 * Middleware: Require specific role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRoles) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const hasRole = roles.some((role) => req.userRoles?.includes(role))
    if (!hasRole) {
      res.status(403).json({ error: 'Insufficient permissions' })
      return
    }

    next()
  }
}

/**
 * Middleware: Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }
  next()
}

/**
 * Get user info from token
 */
export function getUserInfo(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name,
    username: decoded.preferred_username,
    roles: decoded.realm_access?.roles || [],
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  const decoded = verifyToken(token)
  if (!decoded) return true

  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < now
}

/**
 * Get remaining token validity in seconds
 */
export function getTokenValidity(token: string): number {
  const decoded = verifyToken(token)
  if (!decoded) return 0

  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, decoded.exp - now)
}

/**
 * Validate token and return user info
 */
export function validateToken(token: string): { valid: boolean; user?: any; error?: string } {
  try {
    const decoded = verifyToken(token)
    if (!decoded) {
      return { valid: false, error: 'Invalid token' }
    }

    if (isTokenExpired(token)) {
      return { valid: false, error: 'Token expired' }
    }

    return {
      valid: true,
      user: {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        username: decoded.preferred_username,
        roles: decoded.realm_access?.roles || [],
      },
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Token validation failed',
    }
  }
}
