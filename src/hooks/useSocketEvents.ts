import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

interface UseSocketEventsProps {
  onCompanyMessage?: (message: any) => void;
  onGlobalMessage?: (message: any) => void;
  onPrivateStatusChange?: (status: string) => void;
}

export const useSocketEvents = ({
  onCompanyMessage,
  onGlobalMessage,
  onPrivateStatusChange,
}: UseSocketEventsProps = {}) => {
  const { socket, isConnected, joinRoom, leaveRoom, sendToCompany, sendToAll, setPrivateOn, setPrivateOff } = useSocket();

  // Set up event listeners - matching utils/socket.js events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Company message handler - matches utils/socket.js 'companyMessage' event
    const handleCompanyMessage = (message: any) => {
      console.log('📨 Company message received:', message);
      if (onCompanyMessage) {
        onCompanyMessage(message);
      }
    };

    // Global message handler - matches utils/socket.js 'message' event
    const handleGlobalMessage = (message: any) => {
      console.log('📨 Global message received:', message);
      if (onGlobalMessage) {
        onGlobalMessage(message);
      }
    };

    // Private status change handler - matches utils/socket.js 'companyMessage' for status updates
    const handlePrivateStatusChange = (status: string) => {
      console.log('🔒 Private status changed:', status);
      if (onPrivateStatusChange) {
        onPrivateStatusChange(status);
      }
    };

    // Register event listeners - only the events that utils/socket.js emits
    socket.on('companyMessage', handleCompanyMessage);
    socket.on('message', handleGlobalMessage);
    
    // Listen for private status changes in company messages
    socket.on('companyMessage', (message) => {
      if (typeof message === 'string' && message.includes('isPrivate')) {
        handlePrivateStatusChange(message);
      }
    });

    // Cleanup
    return () => {
      socket.off('companyMessage', handleCompanyMessage);
      socket.off('message', handleGlobalMessage);
    };
  }, [socket, isConnected, onCompanyMessage, onGlobalMessage, onPrivateStatusChange]);

  // Wrapper functions with error handling - matching utils/socket.js functionality
  const safeJoinRoom = useCallback((companyId: string) => {
    try {
      if (!companyId) {
        console.log(`❌ Missing companyId: ${JSON.stringify({ companyId })}`);
        return;
      }
      joinRoom(companyId);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  }, [joinRoom]);

  const safeLeaveRoom = useCallback((companyId: string) => {
    try {
      if (!companyId) {
        console.log(`❌ Missing companyId: ${JSON.stringify({ companyId })}`);
        return;
      }
      leaveRoom(companyId);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [leaveRoom]);

  const safeSendToCompany = useCallback((companyId: string, message: any) => {
    try {
      if (!companyId || !message) {
        console.error(`❌ Missing parameters: ${JSON.stringify({ companyId, message })}`);
        return;
      }
      sendToCompany(companyId, message);
    } catch (error) {
      console.error('Error sending message to company:', error);
    }
  }, [sendToCompany]);

  const safeSendToAll = useCallback((message: any) => {
    try {
      if (!message) {
        console.error('❌ Missing message parameter');
        return;
      }
      sendToAll(message);
    } catch (error) {
      console.error('Error sending message to all:', error);
    }
  }, [sendToAll]);

  const safeSetPrivateOn = useCallback((companyId: string, customerId: string) => {
    try {
      if (!companyId || !customerId) {
        console.error(`❌ Missing parameters: ${JSON.stringify({ companyId, customerId })}`);
        return;
      }
      setPrivateOn(companyId, customerId);
    } catch (error) {
      console.error('Error setting private ON:', error);
    }
  }, [setPrivateOn]);

  const safeSetPrivateOff = useCallback((companyId: string, customerId: string) => {
    try {
      if (!companyId || !customerId) {
        console.error(`❌ Missing parameters: ${JSON.stringify({ companyId, customerId })}`);
        return;
      }
      setPrivateOff(companyId, customerId);
    } catch (error) {
      console.error('Error setting private OFF:', error);
    }
  }, [setPrivateOff]);

  return {
    socket,
    isConnected,
    joinRoom: safeJoinRoom,
    leaveRoom: safeLeaveRoom,
    sendToCompany: safeSendToCompany,
    sendToAll: safeSendToAll,
    setPrivateOn: safeSetPrivateOn,
    setPrivateOff: safeSetPrivateOff,
  };
};
