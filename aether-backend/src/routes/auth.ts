import { Router, Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_WEB_CLIENT_ID);

// POST /api/auth/google  — verify Google token, assign role, return JWT
router.post('/google', async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.name) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    // Upsert user — create on first login, fetch on subsequent
    const user = await prisma.user.upsert({
      where: { email: payload.email },
      update: { name: payload.name, avatar: payload.picture },
      create: {
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        role: 'STUDENT', // default; admin can promote via /api/users/role
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('[Auth] Google verify error:', err);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
