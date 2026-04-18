import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants/api';

class SocketService {
  private socket: Socket | null = null;

  connect(role: string, userId: string) {
    if (!this.socket) {
      this.socket = io(API_BASE_URL, {
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected to backend');
        this.socket?.emit('join', { role, userId });
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket] Disconnected from backend');
      });
    }
    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
