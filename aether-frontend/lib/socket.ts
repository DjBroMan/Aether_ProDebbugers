import io from 'socket.io-client';
import { SOCKET_URL } from '@/constants/api';

// Single global socket instance for zero-latency sync
export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: false,
});
