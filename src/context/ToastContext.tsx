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

interface ToastContextType {
  showCustomerAddedToast: (data: CustomerAddedData) => void;
  hideCustomerAddedToast: () => void;
  customerAddedToast: {
    isVisible: boolean;
    data: CustomerAddedData | null;
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

  const value: ToastContextType = {
    showCustomerAddedToast,
    hideCustomerAddedToast,
    customerAddedToast,
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
