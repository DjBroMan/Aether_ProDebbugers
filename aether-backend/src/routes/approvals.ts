import { Router } from 'express';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import prisma from '../config/prisma';
import { io } from '../index';
import PDFDocument from 'pdfkit';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const router = Router();
router.use(authenticate);

// GET /api/approvals — fetch user's own requests (student) or incoming queue
router.get('/', async (req: AuthRequest, res) => {
  const { role, id } = req.user!;
  let approvals;
  if (role === 'STUDENT') {
    approvals = await prisma.approval.findMany({ where: { requesterId: id }, orderBy: { createdAt: 'desc' }, include: { requester: { select: { name: true, email: true } } } });
  } else if (role === 'PROFESSOR') {
    approvals = await prisma.approval.findMany({ where: { status: 'PENDING_PROFESSOR' }, orderBy: { createdAt: 'desc' }, include: { requester: { select: { name: true, email: true } } } });
  } else if (role === 'HOD') {
    approvals = await prisma.approval.findMany({ where: { status: 'PENDING_HOD' }, orderBy: { createdAt: 'desc' }, include: { requester: { select: { name: true, email: true } } } });
  } else if (role === 'PRINCIPAL') {
    approvals = await prisma.approval.findMany({ where: { status: 'PENDING_PRINCIPAL' }, orderBy: { createdAt: 'desc' }, include: { requester: { select: { name: true, email: true } } } });
  } else {
    approvals = await prisma.approval.findMany({ orderBy: { createdAt: 'desc' }, include: { requester: { select: { name: true, email: true } } } });
  }
  res.json(approvals);
});

// POST /api/approvals — student creates a request
router.post('/', requireRole('STUDENT'), async (req: AuthRequest, res) => {
  const { type, content } = req.body;
  const approval = await prisma.approval.create({
    data: { type, content, requesterId: req.user!.id, status: 'PENDING_PROFESSOR' },
    include: { requester: { select: { name: true, email: true } } },
  });
  // Notify all professors in real-time
  io.emit('approval:new', approval);
  res.status(201).json(approval);
});

// PATCH /api/approvals/:id/advance — professor/HOD/principal advances the chain
router.patch('/:id/advance', async (req: AuthRequest, res) => {
  const { role } = req.user!;
  const approvalId = req.params.id as string;
  const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
  if (!approval) return res.status(404).json({ error: 'Not found' });

  const transitions: Record<string, string> = {
    PROFESSOR: 'PENDING_HOD',
    HOD: 'PENDING_PRINCIPAL',
    PRINCIPAL: 'COMPLETED',
  };
  const nextStatus = transitions[role];
  if (!nextStatus) return res.status(403).json({ error: 'Not authorized to advance' });

  let pdfUrl = approval.pdfUrl;

  // When PRINCIPAL approves → chain complete → generate PDF
  if (nextStatus === 'COMPLETED') {
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
      doc.fontSize(22).fillColor('#1E40AF').text('AETHER CAMPUS', { align: 'center' });
      doc.moveDown();
      doc.fontSize(16).fillColor('#000').text(`Approval Certificate`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Type: ${approval.type}`);
      doc.text(`Details: ${approval.content}`);
      doc.text(`Issued: ${new Date().toLocaleDateString()}`);
      doc.moveDown();
      doc.text('This document was digitally signed via the Aether Chain of Responsibility.', { align: 'center' });
      doc.end();
    });

    const uploadResult: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ resource_type: 'raw', folder: 'aether/approvals', format: 'pdf' }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
      Readable.from(pdfBuffer).pipe(stream);
    });
    pdfUrl = uploadResult.secure_url;
  }

  const updated = await prisma.approval.update({
    where: { id: approvalId },
    data: { status: nextStatus, pdfUrl: pdfUrl ?? undefined },
    include: { requester: { select: { name: true, email: true } } },
  });

  // Real-time push to ALL clients — student sees status change instantly
  io.emit('approval:updated', updated);
  res.json(updated);
});

// PATCH /api/approvals/:id/reject
router.patch('/:id/reject', async (req: AuthRequest, res) => {
  const updated = await prisma.approval.update({
    where: { id: req.params.id as string },
    data: { status: 'REJECTED' },
    include: { requester: { select: { name: true, email: true } } },
  });
  io.emit('approval:updated', updated);
  res.json(updated);
});

export default router;
