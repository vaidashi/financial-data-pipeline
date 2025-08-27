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
}

const SocketContext = createContext<SocketContextType>(null as unknown as SocketContextType);

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context!;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io(import.meta.env.VITE_API_BASE_URL, {
        auth: {
          token: tokenManager.getToken(),
        },
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        toast.success('Connected to real-time updates');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        toast.error('Disconnected from real-time updates');
      });

      newSocket.on('reconnect', () => {
        setIsConnected(true);
        toast.success('Reconnected to real-time updates');
      });

      return () => {
        newSocket.off('connect');
        newSocket.off('disconnect');
        newSocket.off('reconnect');
        newSocket.close();
      };
    }
  }, [isAuthenticated]);

  const subscribe = (room: string) => {
    socket?.emit('subscribe', { room });
  };

  const unsubscribe = (room: string) => {
    socket?.emit('unsubscribe', { room });
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, subscribe, unsubscribe }}>
      {children}
    </SocketContext.Provider>
  );
};
