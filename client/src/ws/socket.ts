import { io, Socket } from "socket.io-client";

export function createSocket(serverUrl: string, userId: string, role: string): Socket {
  const backendUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  
  return io(backendUrl, {
    transports: ["websocket", "polling"], 
    query: { user_id: userId, role },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
}