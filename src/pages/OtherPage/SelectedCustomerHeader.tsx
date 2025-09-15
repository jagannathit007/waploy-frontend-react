// SelectedCustomerHeader.tsx
import React from 'react';
import AssignChat from './assignChat';

interface Customer {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  pinned: boolean;
  isBlocked: boolean;
  email?: string;
  labels?: { _id: string; name: string; description?: string }[];
}

interface SelectedCustomerHeaderProps {
  selectedCustomer: Customer;
  getInitials: (name: string) => string;
  setShowProfileModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSearchModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleAssignmentComplete: () => void;
}

const SelectedCustomerHeader: React.FC<SelectedCustomerHeaderProps> = ({
  selectedCustomer,
  getInitials,
  setShowProfileModal,
  setShowSearchModal,
  handleAssignmentComplete,
}) => {
  return (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-between">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setShowProfileModal(true)}
      >
        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mr-3 text-lg font-semibold">
          {getInitials(selectedCustomer.name)}
        </div>
        <div>
          <h3 className="font-semibold dark:text-white">{selectedCustomer.name}</h3>
          <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <AssignChat
          selectedCustomer={selectedCustomer}
          onAssignmentComplete={handleAssignmentComplete}
        />
        <button
          onClick={() => setShowSearchModal(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 border border-gray-300 dark:border-gray-600 rounded-full"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button
          onClick={() => setShowProfileModal(true)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ⋯
        </button>
      </div>
    </div>
  );
};

export default SelectedCustomerHeader;