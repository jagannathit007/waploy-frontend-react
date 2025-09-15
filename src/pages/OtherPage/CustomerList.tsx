import { useState, useEffect } from 'react';
import axios from 'axios';

interface Customer {
  id: string;
  name: string;
  phone: string;
  countryCode?: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  pinned: boolean;
  isBlocked: boolean;
  email?: string;
  label?: string;
  isPrivate: boolean;
}

interface CustomerListProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  filter: 'all' | 'unread';
  setFilter: React.Dispatch<React.SetStateAction<'all' | 'unread'>>;
  selectedCustomer: Customer | null;
  handleSelectCustomer: (customer: Customer) => void;
  handlePin: (id: string) => void;
  onOpenAddForm: () => void;
  refresh: number;
}

const getInitials = (name: string): string => {
  const nameParts = name.trim().split(' ');
  if (nameParts.length > 1) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return nameParts[0][0].toUpperCase();
};

// Function to format ISO timestamp to a readable date and time
const formatDateTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const CustomerList: React.FC<CustomerListProps> = (props) => {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE}/get-last-chats`,
          {
            search: props.search,
            page: 1,
            limit: 100,
            filter: props.filter,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const fetchedCustomers: Customer[] = response.data.data.docs.map((doc: any) => ({
          id: doc._id,
          name: doc.name || '',
          phone: doc.phone || '',
          lastMessage: doc.lastChat || '',
          lastTime: doc.lastChatAt || '',
          unread: doc.unReadMessages || 0,
          pinned: doc.isPinned || false,
          isBlocked: doc.isBlocked || false,
          email: doc.email || '',
          label: doc.label || '',
          isPrivate: doc.isPrivate || false,
        }));

        props.setCustomers(fetchedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Optionally show toast error
      }
    };

    fetchCustomers();
  }, [props.search, props.filter, props.refresh]);

  const handlePin = async (customerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/toggle-pin-chat`,
        { customerId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 200) {
        props.setCustomers((prevCustomers) =>
          prevCustomers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  pinned: response.data.data.isPinned,
                }
              : customer
          )
        );
      } else {
        console.error('Failed to toggle pin:', response.data.message);
        // Optionally show toast error
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      // Optionally show toast error
    }
  };

  const filteredCustomers = props.customers
    .filter((c) => c.name.toLowerCase().includes(props.search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="w-1/4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chats</h2>
          <button
            onClick={props.onOpenAddForm}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm"
          >
            Add Customer
          </button>
        </div>
        <input
          type="text"
          placeholder="Search customers..."
          value={props.search}
          onChange={(e) => props.setSearch(e.target.value)}
          className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:border-[#47546782] dark:text-white focus:outline-none focus:ring-0 custom-caret"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => props.setFilter('all')}
            className={`px-2 py-0 rounded-lg text-[12px] ${props.filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => props.setFilter('unread')}
            className={`px-2 py-0 rounded-lg text-[12px] ${props.filter === 'unread' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'}`}
          >
            Unread
          </button>
        </div>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-235px)]">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => {
              props.handleSelectCustomer(customer);
              setShowMenu(null);
            }}
            className={`flex items-center px-3 py-2 border-b dark:border-[#e4e7ec59] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              props.selectedCustomer?.id === customer.id ? 'bg-gray-100 dark:bg-[#4754676b]' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mr-3 text-lg font-semibold">
              {getInitials(customer.name)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold dark:text-white">{customer.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-[#9ea6b3] truncate">
  {customer.lastMessage && customer.lastMessage.length > 14
    ? customer.lastMessage.slice(0, 14) + "..."
    : customer.lastMessage}
</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                {customer.unread > 0 && (
                  <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full mb-1">{customer.unread}</span>
                )}
                {customer.pinned && <span className="text-sm text-gray-500 ml-1 mb-1">📌</span>}
                {customer.isPrivate && <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-gray-500 ml-1 mb-1"
        fill="currentColor"
        viewBox="0 0 16 16"
      >
        <path fill-rule="evenodd" d="m4.736 1.968-.892 3.269-.014.058C2.113 5.568 1 6.006 1 6.5 1 7.328 4.134 8 8 8s7-.672 7-1.5c0-.494-1.113-.932-2.83-1.205l-.014-.058-.892-3.27c-.146-.533-.698-.849-1.239-.734C9.411 1.363 8.62 1.5 8 1.5s-1.411-.136-2.025-.267c-.541-.115-1.093.2-1.239.735m.015 3.867a.25.25 0 0 1 .274-.224c.9.092 1.91.143 2.975.143a30 30 0 0 0 2.975-.143.25.25 0 0 1 .05.498c-.918.093-1.944.145-3.025.145s-2.107-.052-3.025-.145a.25.25 0 0 1-.224-.274M3.5 10h2a.5.5 0 0 1 .5.5v1a1.5 1.5 0 0 1-3 0v-1a.5.5 0 0 1 .5-.5m-1.5.5q.001-.264.085-.5H2a.5.5 0 0 1 0-1h3.5a1.5 1.5 0 0 1 1.488 1.312 3.5 3.5 0 0 1 2.024 0A1.5 1.5 0 0 1 10.5 9H14a.5.5 0 0 1 0 1h-.085q.084.236.085.5v1a2.5 2.5 0 0 1-5 0v-.14l-.21-.07a2.5 2.5 0 0 0-1.58 0l-.21.07v.14a2.5 2.5 0 0 1-5 0zm8.5-.5h2a.5.5 0 0 1 .5.5v1a1.5 1.5 0 0 1-3 0v-1a.5.5 0 0 1 .5-.5"/>
      </svg>}
              </div>
              <span className="text-xs text-gray-500 dark:text-[#9ea6b3]">{formatDateTime(customer.lastTime)}</span>
            </div>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(showMenu === customer.id ? null : customer.id);
                }}
                className="ml-2 text-gray-500"
              >
                ⋯
              </button>
              {showMenu === customer.id && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      handlePin(customer.id);
                      setShowMenu(null);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span className="mr-2">📌</span> {customer.pinned ? 'Unpin' : 'Pin'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerList;
