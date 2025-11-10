/**
 * Keycloak Authentication Hook for React
 * Manages user authentication and token lifecycle
 */

import { useEffect, useState, useCallback, useRef } from 'react'

interface KeycloakConfig {
  url: string
  realm: string
  clientId: string
}

interface UserInfo {
  id: string
  email: string
  name: string
  username: string
  roles: string[]
}

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: UserInfo | null
  token: string | null
  error: string | null
}

const KEYCLOAK_CONFIG: KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'aans',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'aans-web',
}

export function useKeycloak() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
    error: null,
  })

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Initialize Keycloak
   */
  const initKeycloak = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      // Check for existing token in localStorage
      const storedToken = localStorage.getItem('keycloak_token')
      if (storedToken) {
        const isValid = await validateToken(storedToken)
        if (isValid) {
          const userInfo = await getUserInfo(storedToken)
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: userInfo,
            token: storedToken,
            error: null,
          })
          return
        } else {
          localStorage.removeItem('keycloak_token')
        }
      }

      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null,
      })
    } catch (error) {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: error instanceof Error ? error.message : 'Initialization failed',
      })
    }
  }, [])

  /**
   * Login user
   */
  const login = useCallback(async (username: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))

      const response = await fetch(
        `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'password',
            client_id: KEYCLOAK_CONFIG.clientId,
            username,
            password,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      const token = data.access_token

      // Store token
      localStorage.setItem('keycloak_token', token)

      // Get user info
      const userInfo = await getUserInfo(token)

      setState({
        isAuthenticated: true,
        isLoading: false,
        user: userInfo,
        token,
        error: null,
      })

      return { success: true, user: userInfo }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed'
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: errorMsg,
      })
      return { success: false, error: errorMsg }
    }
  }, [])

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('keycloak_token')
      if (token) {
        // Optional: Revoke token on server
        await fetch(
          `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/logout`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: KEYCLOAK_CONFIG.clientId,
              refresh_token: token,
            }),
          }
        ).catch(() => {
          // Ignore errors during logout
        })
      }

      localStorage.removeItem('keycloak_token')
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: null,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Logout failed' }
    }
  }, [])

  /**
   * Register new user
   */
  const register = useCallback(
    async (userData: {
      username: string
      email: string
      firstName: string
      lastName: string
      password: string
    }) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))

        const response = await fetch(
          `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/register`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: userData.username,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              password: userData.password,
              enabled: true,
            }),
          }
        )

        if (!response.ok) {
          throw new Error('Registration failed')
        }

        setState((prev) => ({ ...prev, isLoading: false }))
        return { success: true, message: 'Registration successful' }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Registration failed'
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }))
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  /**
   * Validate token
   */
  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/token/introspect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: KEYCLOAK_CONFIG.clientId,
            token,
          }),
        }
      )

      if (!response.ok) return false

      const data = await response.json()
      return data.active === true
    } catch {
      return false
    }
  }, [])

  /**
   * Get user info from token
   */
  const getUserInfo = useCallback(async (token: string): Promise<UserInfo | null> => {
    try {
      const response = await fetch(
        `${KEYCLOAK_CONFIG.url}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) return null

      const data = await response.json()
      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        username: data.preferred_username,
        roles: data.realm_access?.roles || [],
      }
    } catch {
      return null
    }
  }, [])

  /**
   * Check if user has role
   */
  const hasRole = useCallback(
    (role: string): boolean => {
      return state.user?.roles.includes(role) ?? false
    },
    [state.user]
  )

  /**
   * Refresh token
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('keycloak_token')
      if (!token) return false

      const isValid = await validateToken(token)
      if (!isValid) {
        localStorage.removeItem('keycloak_token')
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
          error: 'Token expired',
        })
        return false
      }

      return true
    } catch {
      return false
    }
  }, [validateToken])

  /**
   * Initialize on mount
   */
  useEffect(() => {
    initKeycloak()
  }, [initKeycloak])

  /**
   * Setup token refresh interval
   */
  useEffect(() => {
    if (state.isAuthenticated) {
      // Refresh token every 5 minutes
      refreshIntervalRef.current = setInterval(() => {
        refreshToken()
      }, 5 * 60 * 1000)
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [state.isAuthenticated, refreshToken])

  return {
    ...state,
    login,
    logout,
    register,
    hasRole,
    validateToken,
    getUserInfo,
    refreshToken,
  }
}
