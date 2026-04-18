import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();
router.use(authenticate);

// POST /api/pay — mock UPI/card payment clearinghouse
router.post('/', async (req: AuthRequest, res) => {
  const { amount, description } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // In production this would hit Razorpay. Here we log a cleared ledger entry.
  const task = await prisma.task.create({
    data: {
      title: `Payment: ${description ?? 'Campus Due'} — ₹${amount}`,
      deadline: new Date(),
      status: 'CLEARED',
      assigneeId: req.user!.id,
    },
  });

  return res.status(200).json({
    success: true,
    transactionId: `AE-${Date.now()}`,
    amount,
    description,
    clearedAt: new Date().toISOString(),
    ledgerEntry: task.id,
  });
});

export default router;
