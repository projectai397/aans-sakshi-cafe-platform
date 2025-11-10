/**
 * Admin Control Panel Service
 * Comprehensive system management for locations, staff, menu, and settings
 */

type AdminRole = 'super_admin' | 'location_admin' | 'manager' | 'supervisor';
type MenuItemStatus = 'active' | 'inactive' | 'archived';
type LocationStatus = 'active' | 'inactive' | 'maintenance';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  locationIds?: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

interface LocationSettings {
  locationId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  status: LocationStatus;
  operatingHours: OperatingHours;
  deliveryRadius: number;
  deliveryCharge: number;
  minOrderValue: number;
  capacity: number;
  staff: number;
  createdAt: Date;
  updatedAt: Date;
}

interface OperatingHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

interface TimeRange {
  open: string; // HH:MM format
  close: string; // HH:MM format
  isClosed: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  image: string;
  status: MenuItemStatus;
  isVegetarian: boolean;
  isVegan: boolean;
  allergens: string[];
  nutritionInfo?: NutritionInfo;
  availability: boolean;
  preparationTime: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  locationId: string;
  salary: number;
  joinDate: Date;
  status: 'active' | 'inactive' | 'on_leave';
  performance: number; // 0-100
  createdAt: Date;
}

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  timezone: string;
  currency: string;
  language: string;
  maintenanceMode: boolean;
  analyticsEnabled: boolean;
  notificationsEnabled: boolean;
  backupFrequency: string;
  updatedAt: Date;
}

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, any>;
  timestamp: Date;
}

class AdminControlPanelService {
  private admins: Map<string, AdminUser> = new Map();
  private locations: Map<string, LocationSettings> = new Map();
  private menuItems: Map<string, MenuItem> = new Map();
  private menuCategories: Map<string, MenuCategory> = new Map();
  private staff: Map<string, StaffMember> = new Map();
  private systemSettings: SystemSettings = this.getDefaultSettings();
  private auditLogs: Map<string, AuditLog> = new Map();

  /**
   * Create admin user
   */
  async createAdminUser(admin: Omit<AdminUser, 'id | createdAt'>): Promise<AdminUser> {
    const fullAdmin: AdminUser = {
      ...admin,
      id: `ADMIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.admins.set(fullAdmin.id, fullAdmin);
    return fullAdmin;
  }

  /**
   * Get admin user
   */
  async getAdminUser(adminId: string): Promise<AdminUser | null> {
    return this.admins.get(adminId) || null;
  }

  /**
   * Get all admin users
   */
  async getAllAdminUsers(role?: AdminRole): Promise<AdminUser[]> {
    let admins = Array.from(this.admins.values());

    if (role) {
      admins = admins.filter((a) => a.role === role);
    }

    return admins.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Update admin user
   */
  async updateAdminUser(adminId: string, updates: Partial<AdminUser>): Promise<AdminUser> {
    const admin = this.admins.get(adminId);
    if (!admin) {
      throw new Error(`Admin ${adminId} not found`);
    }

    Object.assign(admin, updates);
    return admin;
  }

  /**
   * Create location
   */
  async createLocation(location: Omit<LocationSettings, 'createdAt | updatedAt'>): Promise<LocationSettings> {
    const fullLocation: LocationSettings = {
      ...location,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.locations.set(location.locationId, fullLocation);
    return fullLocation;
  }

  /**
   * Get location
   */
  async getLocation(locationId: string): Promise<LocationSettings | null> {
    return this.locations.get(locationId) || null;
  }

  /**
   * Get all locations
   */
  async getAllLocations(status?: LocationStatus): Promise<LocationSettings[]> {
    let locations = Array.from(this.locations.values());

    if (status) {
      locations = locations.filter((l) => l.status === status);
    }

    return locations.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Update location
   */
  async updateLocation(locationId: string, updates: Partial<LocationSettings>): Promise<LocationSettings> {
    const location = this.locations.get(locationId);
    if (!location) {
      throw new Error(`Location ${locationId} not found`);
    }

    Object.assign(location, updates);
    location.updatedAt = new Date();
    return location;
  }

  /**
   * Create menu item
   */
  async createMenuItem(item: Omit<MenuItem, 'id | createdAt | updatedAt'>): Promise<MenuItem> {
    const fullItem: MenuItem = {
      ...item,
      id: `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.menuItems.set(fullItem.id, fullItem);
    return fullItem;
  }

  /**
   * Get menu item
   */
  async getMenuItem(itemId: string): Promise<MenuItem | null> {
    return this.menuItems.get(itemId) || null;
  }

  /**
   * Get all menu items
   */
  async getAllMenuItems(category?: string, status?: MenuItemStatus): Promise<MenuItem[]> {
    let items = Array.from(this.menuItems.values());

    if (category) {
      items = items.filter((i) => i.category === category);
    }

    if (status) {
      items = items.filter((i) => i.status === status);
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Update menu item
   */
  async updateMenuItem(itemId: string, updates: Partial<MenuItem>): Promise<MenuItem> {
    const item = this.menuItems.get(itemId);
    if (!item) {
      throw new Error(`Menu item ${itemId} not found`);
    }

    Object.assign(item, updates);
    item.updatedAt = new Date();
    return item;
  }

  /**
   * Create menu category
   */
  async createMenuCategory(category: Omit<MenuCategory, 'id'>): Promise<MenuCategory> {
    const fullCategory: MenuCategory = {
      ...category,
      id: `CAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.menuCategories.set(fullCategory.id, fullCategory);
    return fullCategory;
  }

  /**
   * Get all menu categories
   */
  async getAllMenuCategories(): Promise<MenuCategory[]> {
    return Array.from(this.menuCategories.values()).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  /**
   * Add staff member
   */
  async addStaffMember(staff: Omit<StaffMember, 'id | createdAt'>): Promise<StaffMember> {
    const fullStaff: StaffMember = {
      ...staff,
      id: `STAFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.staff.set(fullStaff.id, fullStaff);
    return fullStaff;
  }

  /**
   * Get staff member
   */
  async getStaffMember(staffId: string): Promise<StaffMember | null> {
    return this.staff.get(staffId) || null;
  }

  /**
   * Get all staff
   */
  async getAllStaff(locationId?: string, status?: string): Promise<StaffMember[]> {
    let staff = Array.from(this.staff.values());

    if (locationId) {
      staff = staff.filter((s) => s.locationId === locationId);
    }

    if (status) {
      staff = staff.filter((s) => s.status === status);
    }

    return staff.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Update staff member
   */
  async updateStaffMember(staffId: string, updates: Partial<StaffMember>): Promise<StaffMember> {
    const staff = this.staff.get(staffId);
    if (!staff) {
      throw new Error(`Staff member ${staffId} not found`);
    }

    Object.assign(staff, updates);
    return staff;
  }

  /**
   * Get system settings
   */
  async getSystemSettings(): Promise<SystemSettings> {
    return this.systemSettings;
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    Object.assign(this.systemSettings, updates);
    this.systemSettings.updatedAt = new Date();
    return this.systemSettings;
  }

  /**
   * Get default system settings
   */
  private getDefaultSettings(): SystemSettings {
    return {
      siteName: 'Sakshi Cafe',
      siteDescription: 'Premium food delivery and restaurant management',
      contactEmail: 'contact@sakshicafe.com',
      contactPhone: '+91-9999999999',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      language: 'en',
      maintenanceMode: false,
      analyticsEnabled: true,
      notificationsEnabled: true,
      backupFrequency: 'daily',
      updatedAt: new Date(),
    };
  }

  /**
   * Log audit event
   */
  async logAuditEvent(adminId: string, action: string, entity: string, entityId: string, changes: Record<string, any>): Promise<AuditLog> {
    const log: AuditLog = {
      id: `AUDIT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      adminId,
      action,
      entity,
      entityId,
      changes,
      timestamp: new Date(),
    };

    this.auditLogs.set(log.id, log);
    return log;
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(adminId?: string, limit: number = 100): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());

    if (adminId) {
      logs = logs.filter((l) => l.adminId === adminId);
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
  }

  /**
   * Get system health
   */
  async getSystemHealth(): Promise<any> {
    const locations = await this.getAllLocations('active');
    const staff = await this.getAllStaff();
    const menuItems = await this.getAllMenuItems('active');

    return {
      activeLocations: locations.length,
      totalStaff: staff.length,
      activeMenuItems: menuItems.length,
      systemStatus: this.systemSettings.maintenanceMode ? 'maintenance' : 'operational',
      lastUpdated: new Date(),
    };
  }

  /**
   * Get admin dashboard
   */
  async getAdminDashboard(): Promise<any> {
    const health = await this.getSystemHealth();
    const locations = await this.getAllLocations();
    const staff = await this.getAllStaff();
    const recentLogs = await this.getAuditLogs(undefined, 10);

    return {
      health,
      locations: locations.length,
      staff: staff.length,
      menuItems: Array.from(this.menuItems.values()).length,
      recentActivity: recentLogs,
      settings: this.systemSettings,
    };
  }
}

export default AdminControlPanelService;
