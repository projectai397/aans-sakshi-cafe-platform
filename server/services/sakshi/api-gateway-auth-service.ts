/**
 * API Gateway & Authentication Service
 * Role-based access control and API security
 */

type UserRole = 'admin' | 'manager' | 'staff' | 'delivery_partner' | 'customer';
type Permission = string; // e.g., 'read:inventory', 'write:orders', 'manage:staff'

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  locationId?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

interface APIKey {
  id: string;
  userId: string;
  key: string;
  secret: string;
  name: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
}

interface AuthToken {
  token: string;
  userId: string;
  role: UserRole;
  permissions: Permission[];
  expiresAt: Date;
}

interface RolePermissionMap {
  [key in UserRole]: Permission[];
}

interface APIRequest {
  method: string;
  endpoint: string;
  userId?: string;
  apiKeyId?: string;
  timestamp: Date;
  ipAddress: string;
}

interface APILog {
  id: string;
  request: APIRequest;
  statusCode: number;
  responseTime: number;
  errorMessage?: string;
  timestamp: Date;
}

class APIGatewayAuthService {
  private users: Map<string, User> = new Map();
  private apiKeys: Map<string, APIKey> = new Map();
  private tokens: Map<string, AuthToken> = new Map();
  private apiLogs: Map<string, APILog> = new Map();
  private rolePermissions: RolePermissionMap = {
    admin: [
      'read:*',
      'write:*',
      'delete:*',
      'manage:users',
      'manage:staff',
      'manage:locations',
      'view:analytics',
      'view:financial',
    ],
    manager: [
      'read:inventory',
      'write:inventory',
      'read:orders',
      'write:orders',
      'read:staff',
      'write:staff',
      'view:analytics',
      'view:financial',
      'manage:staff',
    ],
    staff: [
      'read:inventory',
      'write:inventory',
      'read:orders',
      'write:orders',
      'view:schedule',
      'update:attendance',
    ],
    delivery_partner: [
      'read:orders',
      'update:order_status',
      'view:delivery_tracking',
      'update:location',
    ],
    customer: [
      'read:menu',
      'create:order',
      'read:order_history',
      'view:loyalty_points',
      'create:review',
    ],
  };

  /**
   * Create user
   */
  async createUser(user: Omit<User, 'id | createdAt | permissions'>): Promise<User> {
    const fullUser: User = {
      ...user,
      id: `USER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      permissions: this.rolePermissions[user.role],
      createdAt: new Date(),
    };

    this.users.set(fullUser.id, fullUser);
    return fullUser;
  }

  /**
   * Get user
   */
  async getUser(userId: string): Promise<User | null> {
    return this.users.get(userId) || null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find((u) => u.email === email) || null;
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    user.role = newRole;
    user.permissions = this.rolePermissions[newRole];
    return user;
  }

  /**
   * Create API key
   */
  async createAPIKey(userId: string, name: string, expiresIn?: number): Promise<APIKey> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const key = `sk_${Math.random().toString(36).substr(2, 32)}`;
    const secret = Math.random().toString(36).substr(2, 32);

    const apiKey: APIKey = {
      id: `KEY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      key,
      secret,
      name,
      permissions: user.permissions,
      isActive: true,
      createdAt: new Date(),
      expiresAt: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
    };

    this.apiKeys.set(apiKey.id, apiKey);
    return apiKey;
  }

  /**
   * Verify API key
   */
  async verifyAPIKey(key: string, secret: string): Promise<APIKey | null> {
    const apiKey = Array.from(this.apiKeys.values()).find((k) => k.key === key && k.secret === secret);

    if (!apiKey) {
      return null;
    }

    if (!apiKey.isActive) {
      return null;
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    apiKey.lastUsedAt = new Date();
    return apiKey;
  }

  /**
   * Create auth token
   */
  async createAuthToken(userId: string, expiresIn: number = 3600): Promise<AuthToken> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const token = `token_${Math.random().toString(36).substr(2, 32)}`;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    const authToken: AuthToken = {
      token,
      userId,
      role: user.role,
      permissions: user.permissions,
      expiresAt,
    };

    this.tokens.set(token, authToken);
    return authToken;
  }

  /**
   * Verify auth token
   */
  async verifyAuthToken(token: string): Promise<AuthToken | null> {
    const authToken = this.tokens.get(token);

    if (!authToken) {
      return null;
    }

    if (authToken.expiresAt < new Date()) {
      this.tokens.delete(token);
      return null;
    }

    return authToken;
  }

  /**
   * Check permission
   */
  async checkPermission(userId: string, requiredPermission: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) {
      return false;
    }

    // Admin has all permissions
    if (user.role === 'admin') {
      return true;
    }

    // Check exact permission
    if (user.permissions.includes(requiredPermission)) {
      return true;
    }

    // Check wildcard permissions
    const [resource, action] = requiredPermission.split(':');
    return user.permissions.some((p) => {
      const [pResource, pAction] = p.split(':');
      return (pResource === '*' || pResource === resource) && (pAction === '*' || pAction === action);
    });
  }

  /**
   * Log API request
   */
  async logAPIRequest(request: APIRequest, statusCode: number, responseTime: number, error?: string): Promise<APILog> {
    const log: APILog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      request,
      statusCode,
      responseTime,
      errorMessage: error,
      timestamp: new Date(),
    };

    this.apiLogs.set(log.id, log);
    return log;
  }

  /**
   * Get API logs
   */
  async getAPILogs(userId?: string, limit: number = 100): Promise<APILog[]> {
    let logs = Array.from(this.apiLogs.values());

    if (userId) {
      logs = logs.filter((l) => l.request.userId === userId);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Get API statistics
   */
  async getAPIStatistics(days: number = 7): Promise<any> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentLogs = Array.from(this.apiLogs.values()).filter((l) => l.timestamp >= startDate);

    const totalRequests = recentLogs.length;
    const successfulRequests = recentLogs.filter((l) => l.statusCode >= 200 && l.statusCode < 300).length;
    const failedRequests = recentLogs.filter((l) => l.statusCode >= 400).length;
    const averageResponseTime = recentLogs.length > 0 ? recentLogs.reduce((sum, l) => sum + l.responseTime, 0) / recentLogs.length : 0;

    const requestsByEndpoint: Record<string, number> = {};
    for (const log of recentLogs) {
      requestsByEndpoint[log.request.endpoint] = (requestsByEndpoint[log.request.endpoint] || 0) + 1;
    }

    const topEndpoints = Object.entries(requestsByEndpoint)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      period: `Last ${days} days`,
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      averageResponseTime: Math.round(averageResponseTime),
      topEndpoints,
      requestsByStatusCode: {
        '2xx': recentLogs.filter((l) => l.statusCode >= 200 && l.statusCode < 300).length,
        '3xx': recentLogs.filter((l) => l.statusCode >= 300 && l.statusCode < 400).length,
        '4xx': recentLogs.filter((l) => l.statusCode >= 400 && l.statusCode < 500).length,
        '5xx': recentLogs.filter((l) => l.statusCode >= 500).length,
      },
    };
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(keyId: string): Promise<void> {
    const apiKey = this.apiKeys.get(keyId);
    if (apiKey) {
      apiKey.isActive = false;
    }
  }

  /**
   * Revoke auth token
   */
  async revokeAuthToken(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  /**
   * Get all users
   */
  async getAllUsers(role?: UserRole): Promise<User[]> {
    let users = Array.from(this.users.values());

    if (role) {
      users = users.filter((u) => u.role === role);
    }

    return users.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    user.isActive = false;

    // Revoke all API keys
    const userKeys = Array.from(this.apiKeys.values()).filter((k) => k.userId === userId);
    for (const key of userKeys) {
      key.isActive = false;
    }

    return user;
  }

  /**
   * Get role permissions
   */
  async getRolePermissions(role: UserRole): Promise<Permission[]> {
    return this.rolePermissions[role];
  }

  /**
   * Add custom permission to user
   */
  async addPermissionToUser(userId: string, permission: Permission): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    if (!user.permissions.includes(permission)) {
      user.permissions.push(permission);
    }

    return user;
  }

  /**
   * Remove permission from user
   */
  async removePermissionFromUser(userId: string, permission: Permission): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    user.permissions = user.permissions.filter((p) => p !== permission);
    return user;
  }
}

export default APIGatewayAuthService;
