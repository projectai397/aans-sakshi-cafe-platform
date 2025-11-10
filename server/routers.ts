import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie("session", { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Blog articles router
  articles: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().default(10) }).optional())
      .query(async ({ input }) => {
        return db.getPublishedArticles(input?.limit || 10);
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getArticleBySlug(input.slug);
      }),
    
    byDivision: publicProcedure
      .input(z.object({ division: z.enum(["ave", "sakshi", "subcircle", "general"]) }))
      .query(async ({ input }) => {
        return db.getArticlesByDivision(input.division);
      }),
  }),

  // Newsletter router
  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({ email: z.string().email(), name: z.string().optional() }))
      .mutation(async ({ input }) => {
        const success = await db.subscribeNewsletter(input.email, input.name);
        return { success };
      }),
  }),

  // Division content router
  divisions: router({
    getContent: publicProcedure
      .input(z.object({ division: z.enum(["ave", "sakshi", "subcircle"]) }))
      .query(async ({ input }) => {
        return db.getDivisionContent(input.division);
      }),
    
    getAllContent: publicProcedure
      .query(async () => {
        return db.getAllDivisionsContent();
      }),
  }),

  // Seva tokens router
  sevaTokens: router({
    getUserTokens: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserSevaTokens(ctx.user.id);
      }),
  }),

  // Payment router
  payments: router({
    createOrder: protectedProcedure
      .input(z.object({
        orderType: z.enum(["membership", "product", "service"]),
        division: z.enum(["ave", "sakshi", "subcircle"]),
        itemId: z.number().optional(),
        itemName: z.string(),
        quantity: z.number().default(1),
        amount: z.number(),
        paymentMethod: z.enum(["stripe", "razorpay", "bank", "upi"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return db.createOrder({
          userId: ctx.user.id,
          orderNumber,
          orderType: input.orderType,
          division: input.division,
          itemId: input.itemId,
          itemName: input.itemName,
          quantity: input.quantity,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          status: "pending",
        });
      }),

    getUserOrders: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserOrders(ctx.user.id);
      }),

    getOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return db.getOrderById(input.orderId);
      }),

    updateOrderStatus: protectedProcedure
      .input(z.object({ orderId: z.number(), status: z.string() }))
      .mutation(async ({ input }) => {
        return db.updateOrderStatus(input.orderId, input.status);
      }),

    getPaymentMethods: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getPaymentMethods(ctx.user.id);
      }),

    addPaymentMethod: protectedProcedure
      .input(z.object({
        methodType: z.enum(["stripe", "razorpay", "bank", "upi"]),
        lastFourDigits: z.string().optional(),
        bankName: z.string().optional(),
        accountHolder: z.string().optional(),
        upiId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.addPaymentMethod({
          userId: ctx.user.id,
          methodType: input.methodType,
          lastFourDigits: input.lastFourDigits,
          bankName: input.bankName,
          accountHolder: input.accountHolder,
          upiId: input.upiId,
        });
      }),

    getUserInvoices: protectedProcedure
      .query(async ({ ctx }) => {
        return db.getUserInvoices(ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
