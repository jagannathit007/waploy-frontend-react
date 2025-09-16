import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChatAssignedToastProps {
  isVisible: boolean;
  onClose: () => void;
  assignmentData: {
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
  };
}

export default function ChatAssignedToast({ isVisible, onClose, assignmentData }: ChatAssignedToastProps) {
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
    navigate('/chats'); // Navigate to chats panel
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
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full">
          <svg
            className="w-8 h-8 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Chat Assigned
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Chat with{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {assignmentData.customerName}
            </span>
            {' '}has been assigned to{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {assignmentData.assignedTo.userName === 'Team Member' ? 'a team member' : assignmentData.assignedTo.userName}
            </span>
            {' '}by{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              {assignmentData.assignedBy.userName === 'Team Member' ? 'a team member' : assignmentData.assignedBy.userName}
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
              View Chats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
