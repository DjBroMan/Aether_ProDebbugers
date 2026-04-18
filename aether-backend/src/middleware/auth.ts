import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; name?: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  
  const token = auth.split(' ')[1];

  // Allow developer mock tokens to bypass proper JWT validation locally
  // This enables the "Enter Developer Mode" button on the frontend to work end-to-end
  if (token === 'DEV_TOKEN' || token === 'MOCK' || token === 'MOCK_TOKEN') {
    req.user = { id: 'dev123', name: 'Priyank (Dev)', email: 'dev@aether.com', role: 'STUDENT' };
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
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
