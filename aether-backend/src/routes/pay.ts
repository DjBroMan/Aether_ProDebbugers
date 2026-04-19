import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// POST /api/pay — mock UPI/card payment clearinghouse
router.post('/', async (req: AuthRequest, res) => {
  const { amount, description, method, items } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // Generate a transaction record (no DB dependency for mock users)
  const transactionId = `AE-${Date.now()}`;
  
  return res.status(200).json({
    success: true,
    transactionId,
    amount,
    method: method || 'UPI',
    description: description || 'Campus Due',
    items: items || [],
    clearedAt: new Date().toISOString(),
  });
});

export default router;
