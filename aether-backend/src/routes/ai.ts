import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const router = Router();
router.use(authenticate);

const buildContext = async (userId: string): Promise<string> => {
  const [tasks, approvals, events] = await Promise.all([
    prisma.task.findMany({ where: { assigneeId: userId }, take: 5 }),
    prisma.approval.findMany({ where: { requesterId: userId }, take: 5 }),
    prisma.event.findMany({ where: {}, orderBy: { startTime: 'asc' }, take: 10 }),
  ]);

  return `
User's pending tasks: ${JSON.stringify(tasks.map((t) => ({ title: t.title, status: t.status, deadline: t.deadline })))}
User's approval requests: ${JSON.stringify(approvals.map((a) => ({ type: a.type, status: a.status })))}
Upcoming schedule: ${JSON.stringify(events.map((e) => ({ title: e.title, location: e.location, start: e.startTime, end: e.endTime })))}
`.trim();
};

// POST /api/ai/query  — text or transcribed voice query with triple-fallback
router.post('/query', async (req: AuthRequest, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });

  const context = await buildContext(req.user!.id);
  const fullPrompt = `You are the Aether AI Campus Copilot. You have the following live data about the user:\n\n${context}\n\nUser asks: "${prompt}"\n\nProvide a specific, concise, actionable response (max 3 sentences).`;

  // Attempt 1: Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    return res.json({ answer: text, source: 'gemini' });
  } catch (e1) {
    console.warn('[AI] Gemini failed, trying xAI fallback:', (e1 as Error).message);
  }

  // Attempt 2: xAI / Grok via Axios
  try {
    const xRes = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      { model: 'grok-3-mini-fast', messages: [{ role: 'user', content: fullPrompt }] },
      { headers: { Authorization: `Bearer ${process.env.FIRST_FALLBACK_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    const text = xRes.data.choices?.[0]?.message?.content;
    return res.json({ answer: text, source: 'xai-grok' });
  } catch (e2: any) {
    console.warn('[AI] xAI failed, trying Groq/Llama fallback:', e2?.response?.data || (e2 as Error).message);
  }

  // Attempt 3: Groq / Llama 3 via Axios
  try {
    const groqRes = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      { model: 'llama-3.1-8b-instant', messages: [{ role: 'user', content: fullPrompt }] },
      { headers: { Authorization: `Bearer ${process.env.SECOND_FALLBACK_API_KEY}`, 'Content-Type': 'application/json' }, timeout: 15000 }
    );
    const text = groqRes.data.choices?.[0]?.message?.content;
    return res.json({ answer: text, source: 'groq-llama3' });
  } catch (e3: any) {
    console.error('[AI] All fallbacks failed:', e3?.response?.data || (e3 as Error).message);
    return res.status(503).json({ error: 'AI service temporarily unavailable. Please try again.' });
  }
});

export default router;
