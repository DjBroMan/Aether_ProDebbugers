import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();
router.use(authenticate);

// GET /api/notifications - Fetch user's notifications
router.get('/', async (req: AuthRequest, res) => {
  const { id } = req.user!;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: id as string, userId },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
