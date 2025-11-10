import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, articles, subscribers, divisionContent, sevaTokens, orders, invoices, transactions, paymentMethods } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Article queries
export async function getPublishedArticles(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).where(eq(articles.published, true)).orderBy(desc(articles.createdAt)).limit(limit);
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getArticlesByDivision(division: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).where(eq(articles.division, division as any)).orderBy(desc(articles.createdAt));
}

// Subscriber queries
export async function subscribeNewsletter(email: string, name?: string) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(subscribers).values({ email, name, subscribed: true }).onDuplicateKeyUpdate({
      set: { subscribed: true, updatedAt: new Date() },
    });
    return true;
  } catch (error) {
    console.error("[Database] Failed to subscribe:", error);
    return false;
  }
}

// Division content queries
export async function getDivisionContent(division: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(divisionContent).where(eq(divisionContent.division, division as any)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDivisionsContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(divisionContent);
}

// Seva Token queries
export async function getUserSevaTokens(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sevaTokens).where(eq(sevaTokens.userId, userId));
}

// Payment-related database functions
export async function createOrder(data: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return result;
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, orderId));
  return result[0] || null;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({ status: status as any }).where(eq(orders.id, orderId));
}

export async function createTransaction(data: typeof transactions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(data);
}

export async function getTransaction(transactionId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(transactions).where(eq(transactions.id, transactionId));
  return result[0] || null;
}

export async function createInvoice(data: typeof invoices.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(invoices).values(data);
}

export async function getUserInvoices(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.userId, userId));
}

export async function getPaymentMethods(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId));
}

export async function addPaymentMethod(data: typeof paymentMethods.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(paymentMethods).values(data);
}
