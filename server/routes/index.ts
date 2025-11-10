/**
 * Main API Routes
 * Aggregates all service routes
 */

import { Router } from 'express';

// Import route handlers
import authRoutes from './auth.routes';
import orderRoutes from './orders.routes';
import deliveryRoutes from './delivery.routes';
import customerRoutes from './customers.routes';
import staffRoutes from './staff.routes';
import analyticsRoutes from './analytics.routes';
import inventoryRoutes from './inventory.routes';
import menuRoutes from './menu.routes';
import loyaltyRoutes from './loyalty.routes';
import adminRoutes from './admin.routes';
import supportRoutes from './support.routes';

const router = Router();

// API version
const API_VERSION = '/api/v1';

// Mount all routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/delivery`, deliveryRoutes);
router.use(`${API_VERSION}/customers`, customerRoutes);
router.use(`${API_VERSION}/staff`, staffRoutes);
router.use(`${API_VERSION}/analytics`, analyticsRoutes);
router.use(`${API_VERSION}/inventory`, inventoryRoutes);
router.use(`${API_VERSION}/menu`, menuRoutes);
router.use(`${API_VERSION}/loyalty`, loyaltyRoutes);
router.use(`${API_VERSION}/admin`, adminRoutes);
router.use(`${API_VERSION}/support`, supportRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API documentation
router.get('/docs', (req, res) => {
  res.json({
    message: 'Sakshi Cafe API v1',
    endpoints: {
      auth: `${API_VERSION}/auth`,
      orders: `${API_VERSION}/orders`,
      delivery: `${API_VERSION}/delivery`,
      customers: `${API_VERSION}/customers`,
      staff: `${API_VERSION}/staff`,
      analytics: `${API_VERSION}/analytics`,
      inventory: `${API_VERSION}/inventory`,
      menu: `${API_VERSION}/menu`,
      loyalty: `${API_VERSION}/loyalty`,
      admin: `${API_VERSION}/admin`,
      support: `${API_VERSION}/support`,
    },
  });
});

export default router;
