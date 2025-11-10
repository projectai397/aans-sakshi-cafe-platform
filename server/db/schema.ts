/**
 * Database Schema Definition
 * Using Drizzle ORM for type-safe database operations
 */

import { pgTable, text, varchar, integer, decimal, timestamp, boolean, enum as pgEnum, index, foreignKey, unique } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'staff', 'customer']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']);
export const deliveryTypeEnum = pgEnum('delivery_type', ['dine_in', 'takeaway', 'delivery']);
export const loyaltyTierEnum = pgEnum('loyalty_tier', ['bronze', 'silver', 'gold', 'platinum']);
export const staffStatusEnum = pgEnum('staff_status', ['active', 'inactive', 'on_leave']);
export const locationStatusEnum = pgEnum('location_status', ['active', 'inactive', 'maintenance']);

// Users Table
export const users = pgTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    role: userRoleEnum('role').notNull(),
    status: varchar('status', { length: 50 }).default('active'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    emailIdx: index('idx_email').on(table.email),
    roleIdx: index('idx_role').on(table.role),
    statusIdx: index('idx_status').on(table.status),
  })
);

// Locations Table
export const locations = pgTable(
  'locations',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address').notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    postalCode: varchar('postal_code', { length: 20 }),
    phone: varchar('phone', { length: 20 }),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    openingTime: varchar('opening_time', { length: 5 }),
    closingTime: varchar('closing_time', { length: 5 }),
    capacity: integer('capacity'),
    status: locationStatusEnum('status').default('active'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    cityIdx: index('idx_city').on(table.city),
    statusIdx: index('idx_status').on(table.status),
    nameIdx: index('idx_name').on(table.name),
  })
);

// Customers Table
export const customers = pgTable(
  'customers',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }).notNull(),
    address: text('address'),
    city: varchar('city', { length: 100 }),
    postalCode: varchar('postal_code', { length: 20 }),
    loyaltyPoints: integer('loyalty_points').default(0),
    loyaltyTier: loyaltyTierEnum('loyalty_tier').default('bronze'),
    totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
    orderCount: integer('order_count').default(0),
    lastOrderDate: timestamp('last_order_date'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
    phoneIdx: index('idx_phone').on(table.phone),
    tierIdx: index('idx_loyalty_tier').on(table.loyaltyTier),
    spentIdx: index('idx_total_spent').on(table.totalSpent),
  })
);

// Orders Table
export const orders = pgTable(
  'orders',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    customerId: varchar('customer_id', { length: 36 }).notNull(),
    locationId: varchar('location_id', { length: 36 }).notNull(),
    orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum('status').default('pending'),
    deliveryType: deliveryTypeEnum('delivery_type').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    customerFk: foreignKey({ columns: [table.customerId], foreignColumns: [customers.id] }),
    locationFk: foreignKey({ columns: [table.locationId], foreignColumns: [locations.id] }),
    customerIdx: index('idx_customer').on(table.customerId),
    locationIdx: index('idx_location').on(table.locationId),
    statusIdx: index('idx_status').on(table.status),
    createdIdx: index('idx_created_at').on(table.createdAt),
  })
);

// Menu Items Table
export const menuItems = pgTable(
  'menu_items',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    locationId: varchar('location_id', { length: 36 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    categoryId: varchar('category_id', { length: 36 }).notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    cost: decimal('cost', { precision: 10, scale: 2 }),
    isAvailable: boolean('is_available').default(true),
    preparationTime: integer('preparation_time'),
    calories: integer('calories'),
    allergens: text('allergens'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    locationFk: foreignKey({ columns: [table.locationId], foreignColumns: [locations.id] }),
    locationIdx: index('idx_location').on(table.locationId),
    categoryIdx: index('idx_category').on(table.categoryId),
    availableIdx: index('idx_available').on(table.isAvailable),
  })
);

// Inventory Table
export const inventory = pgTable(
  'inventory',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    locationId: varchar('location_id', { length: 36 }).notNull(),
    itemId: varchar('item_id', { length: 36 }).notNull(),
    currentStock: integer('current_stock').notNull(),
    reorderPoint: integer('reorder_point').notNull(),
    reorderQuantity: integer('reorder_quantity').notNull(),
    unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
    lastUpdated: timestamp('last_updated').defaultNow(),
  },
  (table) => ({
    locationFk: foreignKey({ columns: [table.locationId], foreignColumns: [locations.id] }),
    itemFk: foreignKey({ columns: [table.itemId], foreignColumns: [menuItems.id] }),
    locationIdx: index('idx_location').on(table.locationId),
    itemIdx: index('idx_item').on(table.itemId),
    stockIdx: index('idx_stock').on(table.currentStock),
  })
);

// Staff Table
export const staff = pgTable(
  'staff',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull().unique(),
    locationId: varchar('location_id', { length: 36 }).notNull(),
    position: varchar('position', { length: 100 }).notNull(),
    department: varchar('department', { length: 100 }),
    salary: decimal('salary', { precision: 12, scale: 2 }),
    joiningDate: varchar('joining_date', { length: 10 }),
    status: staffStatusEnum('status').default('active'),
    performanceRating: decimal('performance_rating', { precision: 3, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
    locationFk: foreignKey({ columns: [table.locationId], foreignColumns: [locations.id] }),
    locationIdx: index('idx_location').on(table.locationId),
    positionIdx: index('idx_position').on(table.position),
    statusIdx: index('idx_status').on(table.status),
  })
);

// Loyalty Points Table
export const loyaltyPoints = pgTable(
  'loyalty_points',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    customerId: varchar('customer_id', { length: 36 }).notNull(),
    points: integer('points').notNull(),
    reason: varchar('reason', { length: 255 }),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    customerFk: foreignKey({ columns: [table.customerId], foreignColumns: [customers.id] }),
    customerIdx: index('idx_customer').on(table.customerId),
  })
);

// Delivery Orders Table
export const deliveryOrders = pgTable(
  'delivery_orders',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    orderId: varchar('order_id', { length: 36 }).notNull(),
    platformId: varchar('platform_id', { length: 50 }).notNull(),
    platform: varchar('platform', { length: 50 }).notNull(), // 'swiggy', 'zomato', 'ubereats'
    driverId: varchar('driver_id', { length: 36 }),
    estimatedDeliveryTime: integer('estimated_delivery_time'),
    actualDeliveryTime: integer('actual_delivery_time'),
    commission: decimal('commission', { precision: 10, scale: 2 }),
    status: varchar('status', { length: 50 }).default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    orderFk: foreignKey({ columns: [table.orderId], foreignColumns: [orders.id] }),
    orderIdx: index('idx_order').on(table.orderId),
    platformIdx: index('idx_platform').on(table.platform),
  })
);

// Reviews Table
export const reviews = pgTable(
  'reviews',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    customerId: varchar('customer_id', { length: 36 }).notNull(),
    orderId: varchar('order_id', { length: 36 }).notNull(),
    rating: integer('rating').notNull(),
    comment: text('comment'),
    sentiment: varchar('sentiment', { length: 50 }), // 'positive', 'neutral', 'negative'
    platform: varchar('platform', { length: 50 }), // 'google', 'zomato', 'swiggy'
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    customerFk: foreignKey({ columns: [table.customerId], foreignColumns: [customers.id] }),
    orderFk: foreignKey({ columns: [table.orderId], foreignColumns: [orders.id] }),
    customerIdx: index('idx_customer').on(table.customerId),
    ratingIdx: index('idx_rating').on(table.rating),
  })
);

// Notifications Table
export const notifications = pgTable(
  'notifications',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    channel: varchar('channel', { length: 50 }).notNull(), // 'sms', 'email', 'push', 'whatsapp'
    status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'sent', 'failed'
    sentAt: timestamp('sent_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }),
    userIdx: index('idx_user').on(table.userId),
    typeIdx: index('idx_type').on(table.type),
  })
);

// Attendance Table
export const attendance = pgTable(
  'attendance',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    staffId: varchar('staff_id', { length: 36 }).notNull(),
    date: varchar('date', { length: 10 }).notNull(),
    checkinTime: varchar('checkin_time', { length: 5 }),
    checkoutTime: varchar('checkout_time', { length: 5 }),
    hoursWorked: decimal('hours_worked', { precision: 5, scale: 2 }),
    status: varchar('status', { length: 50 }).default('present'), // 'present', 'absent', 'late', 'early_leave'
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    staffFk: foreignKey({ columns: [table.staffId], foreignColumns: [staff.id] }),
    staffIdx: index('idx_staff').on(table.staffId),
    dateIdx: index('idx_date').on(table.date),
  })
);

// Payroll Table
export const payroll = pgTable(
  'payroll',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    staffId: varchar('staff_id', { length: 36 }).notNull(),
    month: varchar('month', { length: 7 }).notNull(), // 'YYYY-MM'
    baseSalary: decimal('base_salary', { precision: 12, scale: 2 }).notNull(),
    allowances: decimal('allowances', { precision: 12, scale: 2 }).default('0'),
    deductions: decimal('deductions', { precision: 12, scale: 2 }).default('0'),
    netSalary: decimal('net_salary', { precision: 12, scale: 2 }).notNull(),
    status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'approved', 'paid'
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (table) => ({
    staffFk: foreignKey({ columns: [table.staffId], foreignColumns: [staff.id] }),
    staffIdx: index('idx_staff').on(table.staffId),
    monthIdx: index('idx_month').on(table.month),
  })
);

export type User = typeof users.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type Staff = typeof staff.$inferSelect;
export type LoyaltyPoint = typeof loyaltyPoints.$inferSelect;
export type DeliveryOrder = typeof deliveryOrders.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type Payroll = typeof payroll.$inferSelect;
