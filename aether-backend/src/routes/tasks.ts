import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res) => {
  const tasks = await prisma.task.findMany({ where: { assigneeId: req.user!.id }, orderBy: { deadline: 'asc' } });
  res.json(tasks);
});

router.post('/', async (req: AuthRequest, res) => {
  const { title, deadline } = req.body;
  const task = await prisma.task.create({ data: { title, deadline: new Date(deadline), assigneeId: req.user!.id } });
  res.status(201).json(task);
});

router.patch('/:id', async (req: AuthRequest, res) => {
  const task = await prisma.task.update({ where: { id: req.params.id as string }, data: { status: req.body.status } });
  res.json(task);
});

export default router;
