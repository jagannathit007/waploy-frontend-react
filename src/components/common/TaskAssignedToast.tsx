import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface TaskAssignedToastProps {
  isVisible: boolean;
  onClose: () => void;
  assignmentData: {
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
  };
}

export default function TaskAssignedToast({ isVisible, onClose, assignmentData }: TaskAssignedToastProps) {
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
    navigate('/tasks'); // Navigate to tasks panel (adjust route as needed)
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
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full">
          <svg
            className="w-8 h-8 text-purple-600 dark:text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Task Assigned
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Task{' '}
            <span className="font-medium text-gray-900 dark:text-white">
              "{assignmentData.taskTitle}"
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
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors"
            >
              View Tasks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
