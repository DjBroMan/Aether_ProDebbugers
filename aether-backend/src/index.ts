import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

export const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['websocket'],
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  socket.on('join', ({ role, userId }) => {
    console.log(`[Socket] ${socket.id} joined role: ${role}, user: ${userId}`);
    if (role) socket.join(`role:${role}`);
    if (userId) socket.join(`user:${userId}`);
    // Everyone joins the global 'ALL' room for campus-wide announcements
    socket.join('ALL');
  });

  socket.on('disconnect', () => console.log(`[Socket] Client disconnected: ${socket.id}`));
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`✅ Aether Backend listening on port ${PORT}`);
  });
}

