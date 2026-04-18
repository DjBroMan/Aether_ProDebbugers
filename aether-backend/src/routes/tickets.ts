import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import prisma from '../config/prisma';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { io } from '../index';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.use(authenticate);

// GET /api/tickets — all tickets (admin) or own (student)
router.get('/', async (req: AuthRequest, res) => {
  const { role, id } = req.user!;
  const tickets = role === 'ADMIN' || role === 'HOD' || role === 'PRINCIPAL'
    ? await prisma.ticket.findMany({ orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true, email: true } } } })
    : await prisma.ticket.findMany({ where: { authorId: id }, orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true, email: true } } } });
  res.json(tickets);
});

// POST /api/tickets — student reports issue with optional photo
router.post('/', upload.single('image'), async (req: AuthRequest, res) => {
  const { title, description, latitude, longitude } = req.body;
  let imageUrl: string | undefined;

  if (req.file) {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'aether/tickets', resource_type: 'image' }, (err, r) => {
        if (err) return reject(err);
        resolve(r);
      }).end(req.file!.buffer);
    });
    imageUrl = result.secure_url;
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      imageUrl,
      location: req.body.location, // Added string location field
      authorId: req.user!.id,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
    },
    include: { author: { select: { name: true, email: true } } },
  });

  // Push to Admin heatmap in real-time
  io.emit('ticket:new', ticket);
  res.status(201).json(ticket);
});

// PATCH /api/tickets/:id — admin updates status
router.patch('/:id', async (req: AuthRequest, res) => {
  const { status } = req.body;
  const ticket = await prisma.ticket.update({
    where: { id: req.params.id as string },
    data: { status },
    include: { author: { select: { name: true, email: true } } },
  });
  
  if (status === 'RESOLVED') {
    const notification = await prisma.notification.create({
      data: {
        userId: ticket.authorId,
        message: `Your reported issue "${ticket.title}" has been resolved`,
        type: 'TICKET_RESOLVED',
      }
    });
    io.to(`user:${ticket.authorId}`).emit('notification:new', notification);
  }

  io.emit('ticket:updated', ticket);
  res.json(ticket);
});

export default router;
