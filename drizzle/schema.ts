import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Blog articles for news and updates
 */
export const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  division: mysqlEnum("division", ["ave", "sakshi", "subcircle", "general"]).default("general"),
  author: varchar("author", { length: 255 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  published: boolean("published").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Newsletter subscribers
 */
export const subscribers = mysqlTable("subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  subscribed: boolean("subscribed").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscriber = typeof subscribers.$inferSelect;
export type InsertSubscriber = typeof subscribers.$inferInsert;

/**
 * Division-specific content and features
 */
export const divisionContent = mysqlTable("divisionContent", {
  id: int("id").autoincrement().primaryKey(),
  division: mysqlEnum("division", ["ave", "sakshi", "subcircle"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  features: text("features"),
  metrics: text("metrics"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DivisionContent = typeof divisionContent.$inferSelect;
export type InsertDivisionContent = typeof divisionContent.$inferInsert;

/**
 * Seva Token tracking for users
 */
export const sevaTokens = mysqlTable("sevaTokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  division: mysqlEnum("division", ["ave", "sakshi", "subcircle"]).notNull(),
  activity: varchar("activity", { length: 255 }).notNull(),
  tokensEarned: int("tokensEarned").notNull(),
  tokensRedeemed: int("tokensRedeemed").default(0),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SevaToken = typeof sevaTokens.$inferSelect;
export type InsertSevaToken = typeof sevaTokens.$inferInsert;


/**
 * Payment methods and configurations
 */
export const paymentMethods = mysqlTable("paymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  methodType: mysqlEnum("methodType", ["stripe", "razorpay", "bank", "upi"]).notNull(),
  isDefault: boolean("isDefault").default(false),
  lastFourDigits: varchar("lastFourDigits", { length: 4 }),
  expiryMonth: int("expiryMonth"),
  expiryYear: int("expiryYear"),
  bankName: varchar("bankName", { length: 255 }),
  accountHolder: varchar("accountHolder", { length: 255 }),
  upiId: varchar("upiId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * Orders for products and memberships
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  orderType: mysqlEnum("orderType", ["membership", "product", "service"]).notNull(),
  division: mysqlEnum("division", ["ave", "sakshi", "subcircle"]).notNull(),
  itemId: int("itemId"),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: int("quantity").default(1),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled", "refunded"]).default("pending"),
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "razorpay", "bank", "upi"]),
  transactionId: varchar("transactionId", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Invoices for orders
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  tax: int("tax").default(0),
  totalAmount: int("totalAmount").notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  status: mysqlEnum("status", ["draft", "issued", "paid", "overdue", "cancelled"]).default("issued"),
  issueDate: timestamp("issueDate").defaultNow(),
  dueDate: timestamp("dueDate"),
  paidDate: timestamp("paidDate"),
  pdfUrl: varchar("pdfUrl", { length: 512 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Payment transactions
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("INR"),
  paymentGateway: mysqlEnum("paymentGateway", ["stripe", "razorpay", "manual"]).notNull(),
  gatewayTransactionId: varchar("gatewayTransactionId", { length: 255 }).unique(),
  status: mysqlEnum("status", ["initiated", "processing", "success", "failed", "refunded"]).default("initiated"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  errorMessage: text("errorMessage"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
