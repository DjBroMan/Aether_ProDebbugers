import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import authRoutes from './routes/auth';
import approvalsRoutes from './routes/approvals';
import ticketsRoutes from './routes/tickets';
import scheduleRoutes from './routes/schedule';
import aiRoutes from './routes/ai';
import payRoutes from './routes/pay';
import usersRoutes from './routes/users';
import tasksRoutes from './routes/tasks';
import dashboardRoutes from './routes/dashboard';
import announcementsRoutes from './routes/announcements';

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'Aether Backend Online', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/approvals', approvalsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pay', payRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/announcements', announcementsRoutes);

export default app;
