import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { tokenManager } from '../lib/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (room: string) => void;
  unsubscribe: (room: string) => void;
  testConnection: () => void;
}

const SocketContext = createContext<SocketContextType>(null as unknown as SocketContextType);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

// Global socket reference for debugging
let debugSocket: Socket | null = null;

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔌 Initializing WebSocket connection...');
      console.log('WebSocket URL:', import.meta.env.VITE_WS_URL);
      console.log('Auth token available:', !!tokenManager.getToken());

      const newSocket = io(import.meta.env.VITE_WS_URL, {
        auth: {
          token: tokenManager.getToken(),
        },
        // Additional debugging options
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
      });

      setSocket(newSocket);

      // Expose socket for debugging
      (window as any).debugSocket = newSocket;
      debugSocket = newSocket;

      // Add verbose connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected!', newSocket.id);
        setIsConnected(true);
        toast.success('Connected to real-time updates');
      });

      newSocket.on('connect_error', error => {
        console.error('❌ Socket connection error:', error);
        toast.error(`Connection error: ${error.message}`);
      });

      newSocket.on('disconnect', reason => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
        toast.error(`Disconnected: ${reason}`);
      });

      newSocket.on('reconnect', attemptNumber => {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
        setIsConnected(true);
        toast.success('Reconnected to real-time updates');
      });

      // Debug listener for all events
      newSocket.onAny((event, ...args) => {
        console.log(`🔔 Socket event received: ${event}`, args);
      });

      return () => {
        console.log('🔌 Cleaning up socket connection');
        newSocket.offAny(); // Remove all listeners
        newSocket.off('connect');
        newSocket.off('connect_error');
        newSocket.off('disconnect');
        newSocket.off('reconnect');
        newSocket.close();

        // Clean up debug reference
        if ((window as any).debugSocket === newSocket) {
          (window as any).debugSocket = null;
        }
        if (debugSocket === newSocket) {
          debugSocket = null;
        }
      };
    } else {
      console.log('🔌 Not authenticated, no socket connection');
      setSocket(null);
      setIsConnected(false);
      return () => {}; // Return empty cleanup function
    }
  }, [isAuthenticated]);

  const subscribe = (room: string) => {
    if (socket) {
      console.log(`📩 Subscribing to ${room}`);
      socket.emit('subscribe', { room });
    } else {
      console.warn('⚠️ Cannot subscribe to', room, '- socket not connected');
    }
  };

  const unsubscribe = (room: string) => {
    if (socket) {
      console.log(`📤 Unsubscribing from ${room}`);
      socket.emit('unsubscribe', { room });
    }
  };

  // Temporary test function to verify connection, eventually remove
  const testConnection = () => {
    if (socket) {
      console.log('🧪 Testing socket connection...');
      socket.emit('debug');
      return true;
    } else {
      console.warn('⚠️ Cannot test - socket not connected');
      return false;
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, subscribe, unsubscribe, testConnection }}>
      {children}
    </SocketContext.Provider>
  );
};
