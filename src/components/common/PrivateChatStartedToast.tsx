import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

interface PrivateChatStartedToastProps {
  isVisible: boolean;
  onClose: () => void;
  chatData: {
    customerId: string;
    customerName: string;
    startedBy: {
      userId: string;
      userName: string;
    };
    timestamp: string;
  };
}

export default function PrivateChatStartedToast({ isVisible, onClose, chatData }: PrivateChatStartedToastProps) {
  const navigate = useNavigate();

  // Auto-close toast after 30 seconds (increased from 10 seconds)
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 30000); // Increased to 30 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleViewClick = () => {
    onClose();
    // Navigate to chats page with customer ID as state to auto-select the customer
    navigate('/chats', { 
      state: { 
        selectCustomer: chatData.customerId,
        customerName: chatData.customerName 
      } 
    });
  };

  const handleOkayClick = () => {
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
        onClick={handleOkayClick}
      />
      
      {/* Toast */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 mx-4 max-w-md w-full transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4">
        {/* Close button */}
        <button
          onClick={handleOkayClick}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Private Chat Started
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium text-gray-900 dark:text-white">
                {chatData.startedBy.userName}
              </span>
              {' '}started a private chat with{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {chatData.customerName}
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(chatData.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleViewClick}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            View Chat
          </button>
          <button
            onClick={handleOkayClick}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
