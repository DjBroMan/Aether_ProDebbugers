import { Router } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();
router.use(authenticate);

// GET /api/users — admin only: all users
router.get('/', requireRole('ADMIN'), async (_req, res) => {
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  res.json(users);
});

// PATCH /api/users/:id/role — admin assigns role
router.patch('/:id/role', requireRole('ADMIN'), async (req: AuthRequest, res) => {
  const { role } = req.body;
  const validRoles = ['STUDENT', 'PROFESSOR', 'HOD', 'PRINCIPAL', 'ADMIN'];
  if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const user = await prisma.user.update({ where: { id: req.params.id as string }, data: { role } });
  res.json(user);
});

// GET /api/users/me — return current user profile
router.get('/me', async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  res.json(user);
});

export default router;
