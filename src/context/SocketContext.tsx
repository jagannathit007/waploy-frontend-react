import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRoom: (companyId: string) => void;
  leaveRoom: (companyId: string) => void;
  sendToCompany: (companyId: string, message: any) => void;
  sendToAll: (message: any) => void;
  setPrivateOn: (companyId: string, customerId: string) => void;
  setPrivateOff: (companyId: string, customerId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { profile } = useAuth();

  // Get backend URL from environment variables
  const BACKEND_URL = import.meta.env.VITE_API_BASE?.replace('/api/web', '') || 'http://localhost:3090';

  useEffect(() => {
    // utils/socket.js doesn't require authentication, but we still need company ID
    if (profile?.company?._id) {
      // Initialize socket connection - matching utils/socket.js CORS config
      const newSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔌 New client connected:', newSocket.id);
        setIsConnected(true);
        
        // Automatically join company room after connection
        const companyId = profile.company._id;
        if (companyId) {
          newSocket.emit('joinRoom', { companyId });
          console.log(`✅ ${newSocket.id} joined Company Room (companyId: ${companyId})`);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Client disconnected:', newSocket.id);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      // Message event handlers - matching utils/socket.js events
      newSocket.on('message', (msg) => {
        console.log('📨 Received global message:', msg);
        // Handle global messages here
      });

      newSocket.on('companyMessage', (message) => {
        console.log('📨 Received company message:', message);
        // Handle company-specific messages here
        // You can emit custom events or update state as needed
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        if (profile?.company?._id) {
          newSocket.emit('leaveRoom', { companyId: profile.company._id });
          console.log(`✅ ${newSocket.id} left Company Room (companyId: ${profile.company._id})`);
        }
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // No company profile, disconnect if socket exists
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [profile?.company?._id]);

  // Socket utility functions - matching utils/socket.js functionality
  const joinRoom = (companyId: string) => {
    if (socket && isConnected) {
      if (!companyId) {
        console.log(`❌ Missing companyId: ${JSON.stringify({ companyId })}`);
        return;
      }
      socket.emit('joinRoom', { companyId });
      console.log(`🗂️ Added mapping: companyId=${companyId} -> socketId=${socket.id}`);
      console.log(`✅ ${socket.id} joined Company Room (companyId: ${companyId})`);
    }
  };

  const leaveRoom = (companyId: string) => {
    if (socket && isConnected) {
      if (!companyId) {
        console.log(`❌ Missing companyId: ${JSON.stringify({ companyId })}`);
        return;
      }
      socket.emit('leaveRoom', { companyId });
      console.log(`✅ ${socket.id} left Company Room (companyId: ${companyId})`);
      console.log(`🗂️ Removed mapping: companyId=${companyId}`);
    }
  };

  const sendToCompany = (companyId: string, message: any) => {
    if (socket && isConnected) {
      socket.emit('sendToCompany', { companyId, message });
      console.log(`📤 Sending message to company ${companyId}:`, message);
    }
  };

  const sendToAll = (message: any) => {
    if (socket && isConnected) {
      socket.emit('sendToAll', message);
      console.log('📤 Sending message to all:', message);
    }
  };

  const setPrivateOn = (companyId: string, customerId: string) => {
    if (socket && isConnected) {
      socket.emit('isPrivateOn', { companyId, customerId });
      console.log(`🔒 Setting private ON for customer ${customerId} in company ${companyId}`);
    }
  };

  const setPrivateOff = (companyId: string, customerId: string) => {
    if (socket && isConnected) {
      socket.emit('isPrivateOff', { companyId, customerId });
      console.log(`🔓 Setting private OFF for customer ${customerId} in company ${companyId}`);
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendToCompany,
    sendToAll,
    setPrivateOn,
    setPrivateOff,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
