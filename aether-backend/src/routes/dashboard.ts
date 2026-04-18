import { Router } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import prisma from '../config/prisma';

const router = Router();
router.use(authenticate);

// GET /api/dashboard/student
router.get('/student', requireRole('STUDENT'), async (req: AuthRequest, res) => {
  const { id } = req.user!;
  
  try {
    // 1. Get today's classes (Mocking Timetable for now, or fetching from Events if fully implemented)
    // 2. Get pending tasks for student
    const pendingTasks = await prisma.task.findMany({
      where: { assigneeId: id, status: 'PENDING' },
      take: 5
    });

    // 3. Get latest announcements
    const announcements = await prisma.announcement.findMany({
      where: { audience: { in: ['ALL', 'STUDENT'] } },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { author: { select: { name: true } } }
    });

    res.json({
      classesToday: 4, // Example hardcoded until timetable is fully modeled
      pendingTasks: pendingTasks.length,
      tasks: pendingTasks,
      announcements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student dashboard' });
  }
});

// GET /api/dashboard/faculty
router.get('/faculty', requireRole('PROFESSOR', 'HOD', 'PRINCIPAL', 'FACULTY', 'ADMIN'), async (req: AuthRequest, res) => {
  const { role } = req.user!;
  
  try {
    let pendingApprovalsCount = 0;
    
    // Determine queue size based on authority
    if (role === 'PROFESSOR' || role === 'FACULTY') {
      pendingApprovalsCount = await prisma.approval.count({ where: { status: 'PENDING_PROFESSOR' } });
    } else if (role === 'HOD') {
      pendingApprovalsCount = await prisma.approval.count({ where: { status: 'PENDING_HOD' } });
    } else if (role === 'PRINCIPAL') {
      pendingApprovalsCount = await prisma.approval.count({ where: { status: 'PENDING_PRINCIPAL' } });
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { author: { select: { name: true } } }
    });

    res.json({
      queueSize: pendingApprovalsCount,
      students: 128, // Mocked until enrollment is mapped
      attendancePercent: 88,
      announcements
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch faculty dashboard' });
  }
});

export default router;
