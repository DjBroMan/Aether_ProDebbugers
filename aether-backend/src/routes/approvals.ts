import { Router } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import prisma from '../config/prisma';
import { io } from '../index';
import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = Router();
router.use(authenticate);

/**
 * Approval Chain of Responsibility:
 *   PENDING_PROFESSOR → PENDING_HOD → PENDING_PRINCIPAL → COMPLETED
 *
 * Each role can only advance from their designated stage.
 * Any role with authority can reject at their stage.
 */

// ───────────────────────────────────────────────────────────────
// GET /api/approvals — role-based view
// ───────────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res) => {
  const { role, id } = req.user!;
  let approvals;

  if (role === 'STUDENT') {
    // Students see only THEIR OWN requests
    approvals = await prisma.approval.findMany({
      where: { requesterId: id },
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: { name: true, email: true } } },
    });
  } else {
    // Faculty (PROFESSOR, HOD, PRINCIPAL) and ADMIN see all requests
    // The frontend filters out what requires their immediate action vs what is purely informational/timeline
    approvals = await prisma.approval.findMany({
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: { name: true, email: true } } },
    });
  }

  res.json(approvals);
});

// ───────────────────────────────────────────────────────────────
// POST /api/approvals — student submits a new request
// ───────────────────────────────────────────────────────────────
router.post('/', requireRole('STUDENT'), async (req: AuthRequest, res) => {
  const { type, content } = req.body;
  if (!type) return res.status(400).json({ error: 'type is required' });

  const approval = await prisma.approval.create({
    data: {
      type,
      content: typeof content === 'string' ? content : JSON.stringify(content || {}),
      requesterId: req.user!.id,
      status: 'PENDING_PROFESSOR',
    },
    include: { requester: { select: { name: true, email: true } } },
  });

  // Real-time broadcast so faculty screens update immediately
  io.emit('approval:new', approval);
  console.log(`[Approval] NEW: ${approval.type} by ${approval.requester.name} → PENDING_PROFESSOR`);

  res.status(201).json(approval);
});

// ───────────────────────────────────────────────────────────────
// PATCH /api/approvals/:id/advance — advance through the chain
// ───────────────────────────────────────────────────────────────
router.patch('/:id/advance', async (req: AuthRequest, res) => {
  const { role } = req.user!;
  const approvalId = req.params.id as string;
  const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
  if (!approval) return res.status(404).json({ error: 'Not found' });

  // Validate: this role can only advance from its designated stage
  const ALLOWED: Record<string, string> = {
    PROFESSOR: 'PENDING_PROFESSOR',
    HOD: 'PENDING_HOD',
    PRINCIPAL: 'PENDING_PRINCIPAL',
  };
  const NEXT: Record<string, string> = {
    PROFESSOR: 'PENDING_HOD',
    HOD: 'PENDING_PRINCIPAL',
    PRINCIPAL: 'COMPLETED',
  };

  if (!ALLOWED[role] || approval.status !== ALLOWED[role]) {
    return res.status(403).json({
      error: `Cannot advance: you are ${role}, but approval is at ${approval.status}`,
    });
  }

  const nextStatus = NEXT[role];
  let pdfUrl = approval.pdfUrl;

  // When PRINCIPAL approves → chain complete → generate PDF certificate
  if (nextStatus === 'COMPLETED') {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
        api_key: process.env.CLOUDINARY_API_KEY as string,
        api_secret: process.env.CLOUDINARY_API_SECRET as string,
      });

      const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 40 });
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        doc.fontSize(22).fillColor('#7C3AED').text('AETHER CAMPUS', { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).fillColor('#000').text('Approval Certificate', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Type: ${approval.type}`);
        doc.text(`Details: ${approval.content}`);
        doc.text(`Requester: ${req.user!.email}`);
        doc.text(`Issued: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
        doc.fontSize(10).fillColor('#666').text(
          'Digitally signed via the Aether Chain of Responsibility.\nProfessor → HOD → Principal',
          { align: 'center' }
        );
        doc.end();
      });

      const uploadResult: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'raw', folder: 'aether/approvals', format: 'pdf' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        Readable.from(pdfBuffer).pipe(stream);
      });
      pdfUrl = uploadResult.secure_url;
    } catch (err) {
      console.warn('[Approval] PDF generation failed (non-blocking):', (err as Error).message);
    }
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: { status: nextStatus, pdfUrl: pdfUrl ?? undefined },
    include: { requester: { select: { name: true, email: true } } },
  });

  // Notify the student
  try {
    await prisma.notification.create({
      data: {
        userId: updated.requesterId,
        message: nextStatus === 'COMPLETED'
          ? `Your ${updated.type} request was fully approved! 🎉`
          : `Your ${updated.type} request advanced to ${nextStatus.replace('PENDING_', '').toLowerCase()} review.`,
        type: 'APPROVAL',
      },
    });
  } catch (e) { /* non-blocking */ }

  io.emit('approval:updated', updated);
  console.log(`[Approval] ADVANCED: ${updated.type} → ${nextStatus} by ${role}`);
  res.json(updated);
});

// ───────────────────────────────────────────────────────────────
// PATCH /api/approvals/:id/reject — reject at any stage
// ───────────────────────────────────────────────────────────────
router.patch('/:id/reject', async (req: AuthRequest, res) => {
  const { role } = req.user!;
  const approvalId = req.params.id as string;
  const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
  if (!approval) return res.status(404).json({ error: 'Not found' });

  // Only the role whose turn it is can reject
  const ALLOWED: Record<string, string> = {
    PROFESSOR: 'PENDING_PROFESSOR',
    HOD: 'PENDING_HOD',
    PRINCIPAL: 'PENDING_PRINCIPAL',
  };
  if (!ALLOWED[role] || approval.status !== ALLOWED[role]) {
    return res.status(403).json({ error: `Cannot reject: not your turn (${role} vs ${approval.status})` });
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: { status: 'REJECTED' },
    include: { requester: { select: { name: true, email: true } } },
  });

  try {
    await prisma.notification.create({
      data: {
        userId: updated.requesterId,
        message: `Your ${updated.type} request was rejected by ${role.toLowerCase()}.`,
        type: 'REJECTION',
      },
    });
  } catch (e) { /* non-blocking */ }

  io.emit('approval:updated', updated);
  console.log(`[Approval] REJECTED: ${updated.type} by ${role}`);
  res.json(updated);
});

export default router;
