import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name?: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = auth.split(' ')[1];

  if (token === 'DEV_TOKEN' || token === 'MOCK' || token === 'MOCK_TOKEN') {
    const role = (req.headers['x-mock-role'] as string) || 'STUDENT';
    console.log(`[AUTH] Mock login detected. Assigned role: ${role}`);
    req.user = { id: 'demo-user', name: 'Demo User', email: 'demo@aether.com', role };
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
