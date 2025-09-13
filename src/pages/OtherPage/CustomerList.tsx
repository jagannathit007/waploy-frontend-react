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

const CustomerList: React.FC<CustomerListProps> = (props) => {
  const [showMenu, setShowMenu] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE}/get-customers`,
          {
            search: props.search,
            page: 1,
            limit: 100,
            tags: [],
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        // Assuming response structure: { success: true, message: string, data: { docs: [], ... } }
        const fetchedCustomers: Customer[] = response.data.data.docs.map((doc: any) => ({
          id: doc._id,
          name: doc.name || `${doc.user?.profile?.firstName || ''} ${doc.user?.profile?.lastName || ''}`.trim(),
          phone: doc.phone,
          countryCode: doc.countryCode,
          lastMessage: doc.lastMessage || '',
          lastTime: doc.lastTime || '',
          unread: doc.unread || 0,
          pinned: doc.pinned || false,
          isBlocked: doc.isBlocked || false,
          email: doc.email || doc.user?.email,
          label: doc.label || '',
        }));

        props.setCustomers(fetchedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
        // Optionally show toast error
      }
    };

    fetchCustomers();
  }, [props.search, props.refresh]);

  const filteredCustomers = props.customers
    .filter((c) => (props.filter === 'all' || (props.filter === 'unread' && c.unread > 0)) && c.name.toLowerCase().includes(props.search.toLowerCase()))
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
          className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => props.setFilter('all')}
            className={`px-1 py-0 rounded-lg text-[12px] ${props.filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'}`}
          >
            All
          </button>
          <button
            onClick={() => props.setFilter('unread')}
            className={`px-1 py-0 rounded-lg text-[12px] ${props.filter === 'unread' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'}`}
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
            className={`flex items-center px-3 py-2 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
              props.selectedCustomer?.id === customer.id ? 'bg-gray-100 dark:bg-gray-600' : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mr-3 text-lg font-semibold">
              {getInitials(customer.name)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold">{customer.name}</h3>
              </div>
              <p className="text-sm text-gray-600 truncate">{customer.lastMessage}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                {customer.unread > 0 && (
                  <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full mb-1">{customer.unread}</span>
                )}
                {customer.pinned && <span className="text-sm text-gray-500 ml-1 mb-1">📌</span>}
              </div>
              <span className="text-xs text-gray-500">{customer.lastTime}</span>
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
                      props.handlePin(customer.id);
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