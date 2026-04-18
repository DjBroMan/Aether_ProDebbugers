import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name?: string };
}

import prisma from '../config/prisma';

// Map frontend role names to Prisma Role enum values
const ROLE_MAP: Record<string, string> = {
  STUDENT: 'STUDENT',
  FACULTY: 'PROFESSOR',   // Frontend sends FACULTY, DB uses PROFESSOR
  PROFESSOR: 'PROFESSOR',
  HOD: 'HOD',
  PRINCIPAL: 'PRINCIPAL',
  ADMIN: 'ADMIN',
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = auth.split(' ')[1];

  if (token === 'DEV_TOKEN' || token === 'MOCK' || token === 'MOCK_TOKEN') {
    const rawRole = (req.headers['x-mock-role'] as string) || 'STUDENT';
    // Normalize role: FACULTY → PROFESSOR for DB compatibility
    const dbRole = ROLE_MAP[rawRole] || rawRole;
    const id = `demo-${rawRole.toLowerCase()}`;
    console.log(`[AUTH] Mock login detected. Raw role: ${rawRole}, DB role: ${dbRole}`);
    
    try {
      await prisma.user.upsert({
        where: { id },
        update: { role: dbRole as any },
        create: { id, name: `Demo ${rawRole}`, email: `${id}@aether.com`, role: dbRole as any }
      });
    } catch (err) {
      console.error('[AUTH] Failed to upsert mock user:', err);
    }

    // IMPORTANT: req.user.role uses the DB-normalized role so route logic works correctly
    req.user = { id, name: `Demo ${rawRole}`, email: `${id}@aether.com`, role: dbRole };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    console.log(`[AUTH] requireRole checking if user role ${req.user?.role} is in [${roles.join(', ')}]`);
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(`[AUTH] Forbidden!`);
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
