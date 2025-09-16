import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CustomerAddedData {
  customerId: string;
  customerName: string;
  addedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface ChatAssignedData {
  chatId: string;
  customerName: string;
  assignedTo: {
    userId: string;
    userName: string;
  };
  assignedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface TaskAssignedData {
  taskId: string;
  taskTitle: string;
  assignedTo: {
    userId: string;
    userName: string;
  };
  assignedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface PrivateChatStartedData {
  customerId: string;
  customerName: string;
  startedBy: {
    userId: string;
    userName: string;
  };
  timestamp: string;
}

interface ToastContextType {
  showCustomerAddedToast: (data: CustomerAddedData) => void;
  hideCustomerAddedToast: () => void;
  customerAddedToast: {
    isVisible: boolean;
    data: CustomerAddedData | null;
  };
  showChatAssignedToast: (data: ChatAssignedData) => void;
  hideChatAssignedToast: () => void;
  chatAssignedToast: {
    isVisible: boolean;
    data: ChatAssignedData | null;
  };
  showTaskAssignedToast: (data: TaskAssignedData) => void;
  hideTaskAssignedToast: () => void;
  taskAssignedToast: {
    isVisible: boolean;
    data: TaskAssignedData | null;
  };
  showPrivateChatStartedToast: (data: PrivateChatStartedData) => void;
  hidePrivateChatStartedToast: () => void;
  privateChatStartedToast: {
    isVisible: boolean;
    data: PrivateChatStartedData | null;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [customerAddedToast, setCustomerAddedToast] = useState<{
    isVisible: boolean;
    data: CustomerAddedData | null;
  }>({
    isVisible: false,
    data: null,
  });

  const [chatAssignedToast, setChatAssignedToast] = useState<{
    isVisible: boolean;
    data: ChatAssignedData | null;
  }>({
    isVisible: false,
    data: null,
  });

  const [taskAssignedToast, setTaskAssignedToast] = useState<{
    isVisible: boolean;
    data: TaskAssignedData | null;
  }>({
    isVisible: false,
    data: null,
  });

  const [privateChatStartedToast, setPrivateChatStartedToast] = useState<{
    isVisible: boolean;
    data: PrivateChatStartedData | null;
  }>({
    isVisible: false,
    data: null,
  });

  const showCustomerAddedToast = (data: CustomerAddedData) => {
    setCustomerAddedToast({
      isVisible: true,
      data,
    });
  };

  const hideCustomerAddedToast = () => {
    setCustomerAddedToast({
      isVisible: false,
      data: null,
    });
  };

  const showChatAssignedToast = (data: ChatAssignedData) => {
    setChatAssignedToast({
      isVisible: true,
      data,
    });
  };

  const hideChatAssignedToast = () => {
    setChatAssignedToast({
      isVisible: false,
      data: null,
    });
  };

  const showTaskAssignedToast = (data: TaskAssignedData) => {
    setTaskAssignedToast({
      isVisible: true,
      data,
    });
  };

  const hideTaskAssignedToast = () => {
    setTaskAssignedToast({
      isVisible: false,
      data: null,
    });
  };

  const showPrivateChatStartedToast = (data: PrivateChatStartedData) => {
    setPrivateChatStartedToast({
      isVisible: true,
      data,
    });
  };

  const hidePrivateChatStartedToast = () => {
    setPrivateChatStartedToast({
      isVisible: false,
      data: null,
    });
  };

  const value: ToastContextType = {
    showCustomerAddedToast,
    hideCustomerAddedToast,
    customerAddedToast,
    showChatAssignedToast,
    hideChatAssignedToast,
    chatAssignedToast,
    showTaskAssignedToast,
    hideTaskAssignedToast,
    taskAssignedToast,
    showPrivateChatStartedToast,
    hidePrivateChatStartedToast,
    privateChatStartedToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
