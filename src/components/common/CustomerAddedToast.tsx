import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface CustomerAddedToastProps {
  isVisible: boolean;
  onClose: () => void;
  customerData: {
    customerId: string;
    customerName: string;
    addedBy: {
      userId: string;
      userName: string;
    };
    timestamp: string;
  };
}

export default function CustomerAddedToast({ isVisible, onClose, customerData }: CustomerAddedToastProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the customers page
  const isOnCustomersPage = location.pathname === '/customers';

  // Auto-close toast after 30 seconds (increased from 10 seconds) - only for non-customers page
  useEffect(() => {
    if (isVisible && !isOnCustomersPage) {
      const timer = setTimeout(() => {
        onClose();
      }, 30000); // Increased to 30 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, isOnCustomersPage]);

  const handleViewClick = () => {
    onClose();
    navigate('/customers'); // Navigate to customer panel
  };

  const handleOkayClick = () => {
    onClose();
  };

  if (!isVisible) return null;

  // If on customers page, show as a confirmation modal above the page
  if (isOnCustomersPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        {/* Modal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 mx-4 max-w-md w-full transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4 pointer-events-auto">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Customer Added
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              <span className="font-medium text-gray-900 dark:text-white">
                {customerData.customerName}
              </span>
              {' '}has been added by{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {customerData.addedBy.userName === 'Team Member' ? 'a team member' : customerData.addedBy.userName}
              </span>
            </p>
            
            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleOkayClick}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
              >
                Okay
              </button>
              <button
                onClick={handleViewClick}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default full-screen modal for other pages
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
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full">
          <svg
            className="w-8 h-8 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Customer Added
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            <span className="font-medium text-gray-900 dark:text-white">
              {customerData.customerName}
            </span>
            {' '}has been added by{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {customerData.addedBy.userName === 'Team Member' ? 'a team member' : customerData.addedBy.userName}
            </span>
          </p>
          
          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleOkayClick}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
              Okay
            </button>
            <button
              onClick={handleViewClick}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}