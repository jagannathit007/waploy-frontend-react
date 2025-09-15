import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface UseSocketEventsProps {
  onCompanyMessage?: (message: any) => void;
  onGlobalMessage?: (message: any) => void;
  onPrivateStatusChange?: (status: string) => void;
  onCustomerAdded?: (customer: any) => void;
}

export const useSocketEvents = ({
  onCompanyMessage,
  onGlobalMessage,
  onPrivateStatusChange,
  onCustomerAdded,
}: UseSocketEventsProps = {}) => {
  const { socket, isConnected, joinRoom, leaveRoom, sendToCompany, sendToAll, setPrivateOn, setPrivateOff } = useSocket();
  const { showCustomerAddedToast } = useToast();
  const { profile } = useAuth();

  // Memoize callback functions to prevent dependency array changes
  const stableOnCompanyMessage = useCallback(onCompanyMessage || (() => {}), [onCompanyMessage]);
  const stableOnGlobalMessage = useCallback(onGlobalMessage || (() => {}), [onGlobalMessage]);
  const stableOnPrivateStatusChange = useCallback(onPrivateStatusChange || (() => {}), [onPrivateStatusChange]);
  const stableOnCustomerAdded = useCallback(onCustomerAdded || (() => {}), [onCustomerAdded]);

  // Set up event listeners - matching utils/socket.js events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Company message handler - matches utils/socket.js 'companyMessage' event
    const handleCompanyMessage = (message: any) => {
      console.log('📨 Company message received:', message);
      
      // Handle customer added notification
      if (message && message.type === 'new customer add') {
        console.log('👤 Customer added notification received:', message);
        
        // Check if the current user is the one who added the customer
        const addedByUserId = message.userId || message.addedBy?.userId;
        const currentUserId = profile?._id;
        
        // Don't show popup if current user added the customer
        if (addedByUserId && currentUserId && addedByUserId === currentUserId) {
          console.log('🚫 Customer added by current user, not showing popup');
          return;
        }
        
        // Extract customer name from the content
        const customerName = message.content?.replace('new customer added of name ', '') || 'Unknown Customer';
        
        // Create a structured message for the toast
        const customerAddedData = {
          customerId: message.customerId || 'unknown',
          customerName: customerName,
          addedBy: {
            userId: addedByUserId || 'unknown',
            userName: message.addedBy?.userName || 'Team Member'
          },
          timestamp: new Date().toISOString()
        };
        
        console.log('✅ Showing customer added popup for:', customerAddedData);
        showCustomerAddedToast(customerAddedData);
        stableOnCustomerAdded(customerAddedData);
        return;
      }
      
      stableOnCompanyMessage(message);
    };

    // Global message handler - matches utils/socket.js 'message' event
    const handleGlobalMessage = (message: any) => {
      console.log('📨 Global message received:', message);
      stableOnGlobalMessage(message);
    };


    // Private status change handler - matches utils/socket.js 'companyMessage' for status updates
    const handlePrivateStatusChange = (status: string) => {
      console.log('🔒 Private status changed:', status);
      stableOnPrivateStatusChange(status);
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
  }, [socket, isConnected, stableOnCompanyMessage, stableOnGlobalMessage, stableOnPrivateStatusChange, stableOnCustomerAdded, showCustomerAddedToast, profile?._id]);

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
