import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { io } from '../index';

const router = Router();
router.use(authenticate);

// GET /api/schedule — all events for this user (by professor or all for student)
router.get('/', async (req: AuthRequest, res) => {
  const events = await prisma.event.findMany({ orderBy: { startTime: 'asc' } });
  res.json(events);
});

// POST /api/schedule — create event with Clash Detection
router.post('/', async (req: AuthRequest, res) => {
  const { title, startTime, endTime, location } = req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);

  // Clash Detection algorithm — check if room is double-booked
  const clash = await prisma.event.findFirst({
    where: {
      location,
      AND: [
        { startTime: { lt: end } },
        { endTime: { gt: start } },
      ],
    },
  });

  if (clash) {
    return res.status(409).json({
      error: 'Scheduling clash detected',
      clashWith: clash,
      message: `Room "${location}" is already booked from ${clash.startTime} to ${clash.endTime}`,
    });
  }

  const event = await prisma.event.create({
    data: { title, startTime: start, endTime: end, location, professorId: req.user!.id },
  });

  // Cross-calendar sync push — all users see new event instantly
  io.emit('schedule:new', event);
  res.status(201).json(event);
});

// DELETE /api/schedule/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  await prisma.event.delete({ where: { id: req.params.id as string } });
  io.emit('schedule:deleted', { id: req.params.id as string });
  res.json({ success: true });
});

export default router;
