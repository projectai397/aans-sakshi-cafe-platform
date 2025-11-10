/**
 * Loyalty Service API Routes
 * Member management, rewards, and Seva Token integration
 */

import { Router, Request, Response } from 'express';
import LoyaltyService from './loyalty-service';

const router = Router();
const loyaltyService = new LoyaltyService();

/**
 * Member Management
 */

router.post('/member/create', async (req: Request, res: Response) => {
  try {
    const memberData = req.body;
    const member = await loyaltyService.createMember(memberData);

    res.json({
      success: true,
      member,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member = await loyaltyService.getMember(memberId);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/member/email/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const member = await loyaltyService.getMemberByEmail(email);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/member/referral/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const member = await loyaltyService.getMemberByReferralCode(code);

    if (!member) {
      return res.status(404).json({ error: 'Referral code not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.put('/member/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const updates = req.body;

    const member = await loyaltyService.updateMember(memberId, updates);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({
      success: true,
      member,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Points Management
 */

router.post('/points/add', async (req: Request, res: Response) => {
  try {
    const { memberId, points, type, description, orderId } = req.body;

    const transaction = await loyaltyService.addPoints(memberId, points, type, description, orderId);

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/points/history/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const { limit = 50 } = req.query;

    const history = await loyaltyService.getPointsHistory(memberId, parseInt(limit as string));

    res.json({
      memberId,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Tier Management
 */

router.get('/tier/:tier/benefits', async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const benefits = await loyaltyService.getTierBenefits(tier as any);

    res.json(benefits);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Reward Management
 */

router.post('/reward/create', async (req: Request, res: Response) => {
  try {
    const rewardData = req.body;
    const reward = await loyaltyService.createReward(rewardData);

    res.json({
      success: true,
      reward,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/reward/:rewardId', async (req: Request, res: Response) => {
  try {
    const { rewardId } = req.params;
    const reward = await loyaltyService.getReward(rewardId);

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json(reward);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/rewards/available/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const rewards = await loyaltyService.getAvailableRewards(memberId);

    res.json({
      memberId,
      count: rewards.length,
      rewards,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Reward Redemption
 */

router.post('/redemption/redeem', async (req: Request, res: Response) => {
  try {
    const { memberId, rewardId, orderId } = req.body;

    const redemption = await loyaltyService.redeemReward(memberId, rewardId, orderId);

    if (!redemption) {
      return res.status(400).json({ error: 'Failed to redeem reward' });
    }

    res.json({
      success: true,
      redemption,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/redemption/:redemptionId/complete', async (req: Request, res: Response) => {
  try {
    const { redemptionId } = req.params;

    const redemption = await loyaltyService.completeRedemption(redemptionId);

    if (!redemption) {
      return res.status(404).json({ error: 'Redemption not found' });
    }

    res.json({
      success: true,
      redemption,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/redemption/history/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    const history = await loyaltyService.getRedemptionHistory(memberId);

    res.json({
      memberId,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Referral Program
 */

router.post('/referral/process', async (req: Request, res: Response) => {
  try {
    const { referrerId, newMemberId } = req.body;

    const transaction = await loyaltyService.processReferral(referrerId, newMemberId);

    if (!transaction) {
      return res.status(400).json({ error: 'Failed to process referral' });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Seva Token Management
 */

router.post('/seva-token/exchange', async (req: Request, res: Response) => {
  try {
    const { memberId, sevaTokens, toDivision } = req.body;

    const exchange = await loyaltyService.exchangeSevaTokens(memberId, sevaTokens, toDivision);

    if (!exchange) {
      return res.status(400).json({ error: 'Failed to exchange Seva Tokens' });
    }

    res.json({
      success: true,
      exchange,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.post('/seva-token/:exchangeId/complete', async (req: Request, res: Response) => {
  try {
    const { exchangeId } = req.params;

    const exchange = await loyaltyService.completeSevaExchange(exchangeId);

    if (!exchange) {
      return res.status(404).json({ error: 'Exchange not found' });
    }

    res.json({
      success: true,
      exchange,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Dashboard & Analytics
 */

router.get('/dashboard/loyalty-metrics', async (req: Request, res: Response) => {
  try {
    const metrics = await loyaltyService.getLoyaltyMetrics();

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

router.get('/dashboard/member/:memberId', async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;

    const metrics = await loyaltyService.getMemberMetrics(memberId);

    if (!metrics) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

/**
 * Maintenance
 */

router.post('/maintenance/cleanup-rewards', async (req: Request, res: Response) => {
  try {
    const expiredCount = await loyaltyService.cleanupExpiredRewards();

    res.json({
      success: true,
      expiredCount,
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
