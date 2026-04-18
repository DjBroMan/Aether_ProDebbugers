import { Router } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import prisma from '../config/prisma';
import { io } from '../index';

const router = Router();
router.use(authenticate);

// GET /api/announcements — Fetch announcements relevant to user
router.get('/', async (req: AuthRequest, res) => {
  const { role } = req.user!;
  
  // Basic implementation: fetch recent announcements
  // In a full implementation, you'd filter by user's specific classes/subjects
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: {
        select: { name: true, role: true }
      }
    }
  });
  
  res.json(announcements);
});

// POST /api/announcements — Faculty/Admin pushes a notice
router.post('/', requireRole('PROFESSOR', 'HOD', 'PRINCIPAL', 'ADMIN', 'FACULTY'), async (req: AuthRequest, res) => {
  const { title, body, audience } = req.body;
  const { id, name } = req.user!;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body,
      audience: audience || 'ALL',
      authorId: id,
    },
    include: {
      author: {
        select: { name: true, role: true }
      }
    }
  });

  // Emitting the announcement real-time to connected clients
  io.emit('announcement:new', announcement);
  
  res.status(201).json(announcement);
});

export default router;
