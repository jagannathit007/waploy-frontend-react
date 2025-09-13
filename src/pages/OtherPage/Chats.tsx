import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import TextMessage from '../medias/TextMessage';
import VideoMessage from '../medias/VideoMessage';
import AudioMessage from '../medias/AudioMessage';
import DocumentMessage from '../medias/DocumentMessage';
import ImageGroup from '../medias/ImageGroup';
import ContactMessage from '../medias/ContactMessage';
import { useAuth } from '../../context/AuthContext';
import { sendWhatsAppMessage } from '../../services/api/whatsappService';
import axios from 'axios';
import CustomerList from './CustomerList';
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
  label?: string;
}

export interface Message {
  id: string;
  from: 'me' | 'them';
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'contact';
  content: string;
  time: string;
  isForwarded?: boolean;
  meta?: {
    pages?: number;
    size?: string;
    duration?: string;
  };
}

interface StarredMessage {
  id: number;
  content: string;
}

// Dummy data for customers
const dummyCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+919773050108',
    lastMessage: 'Hey, how are you?',
    lastTime: '10:45 AM',
    unread: 2,
    pinned: true,
    isBlocked: false,
  },
  {
    id: '2',
    name: 'Jane Smith',
    phone: '+1 987-654-3210',
    lastMessage: 'Meeting at 2 PM',
    lastTime: 'Yesterday',
    unread: 0,
    pinned: false,
    isBlocked: false,
  },
  {
    id: '3',
    name: 'Alice',
    phone: '+1 555-123-4567',
    lastMessage: 'Check the report',
    lastTime: '2 days ago',
    unread: 1,
    pinned: false,
    isBlocked: true,
  },
];

// Dummy chat messages for each customer
const dummyChats: Record<string, Message[]> = {
  '1': [
    { id: 'm1', from: 'them', type: 'text', content: 'Hello!', time: '10:30 AM' },
    { id: 'm2', from: 'me', type: 'text', content: 'Hi John!', time: '10:32 AM' },
    { id: 'm3', from: 'them', type: 'image', content: 'https://via.placeholder.com/200?text=Image', time: '10:35 AM' },
    { id: 'm4', from: 'me', type: 'video', content: 'https://via.placeholder.com/200?text=Video', time: '10:40 AM' },
    { id: 'm5', from: 'them', type: 'document', content: 'Document.pdf', time: '10:42 AM' },
    { id: 'm6', from: 'me', type: 'audio', content: 'Audio.mp3', time: '10:45 AM' },
    { id: 'm7', from: 'them', type: 'contact', content: 'Contact: Bob', time: '10:50 AM' },
  ],
  '2': [
    { id: 'm1', from: 'them', type: 'text', content: 'Good morning!', time: '9:00 AM' },
  ],
  '3': [
    { id: 'm1', from: 'them', type: 'text', content: 'Update on project', time: 'Yesterday' },
  ],
};

const starredMessages: StarredMessage[] = [
  { id: 1, content: 'Message 1' },
  { id: 2, content: 'Message 2' },
];


const Chats = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', countryCode: '', phone: '', email: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showAllStarred, setShowAllStarred] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video' | 'audio' | 'document'>('image');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [refresh, setRefresh] = useState(0);

  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Get company ID from user context
  useEffect(() => {
    if (profile?.company?._id) {
      setCompanyId(profile.company._id);
    }
  }, [profile]);

  // Function to get initials from name
  const getInitials = (name: string): string => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setMessages(dummyChats[customer.id] || []);
  };

  const handleAssignmentComplete = () => {
    // Refresh customer data or perform any updates after assignment
    Toast.fire({
      icon: "success",
      title: "Chat assignment completed successfully!",
    });
    // You can add any additional logic here like refreshing customer list
  };

  const handlePin = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const customer = customers.find((c) => c.id === id);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE}/update-customer/${id}`,
        { pinned: !customer?.pinned },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setCustomers(customers.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)));
        Toast.fire({ icon: 'success', title: `Customer ${customer?.pinned ? 'unpinned' : 'pinned'}` });
      }
    } catch (error) {
      console.error('Error pinning customer:', error);
      Toast.fire({ icon: 'error', title: 'Failed to pin customer' });
    }
  };

  const handleBlock = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const customer = customers.find((c) => c.id === id);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE}/update-customer/${id}`,
        { isBlocked: !customer?.isBlocked },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setCustomers(customers.map((c) => (c.id === id ? { ...c, isBlocked: !c.isBlocked } : c)));
        Toast.fire({ icon: 'success', title: 'Customer block status updated' });
      }
    } catch (error) {
      console.error('Error blocking customer:', error);
      Toast.fire({ icon: 'error', title: 'Failed to update block status' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE}/delete-customer/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setCustomers(customers.filter((c) => c.id !== id));
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
        Toast.fire({ icon: 'success', title: 'Customer deleted' });
        setRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      Toast.fire({ icon: 'error', title: 'Failed to delete customer' });
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/add-customer`,
        {
          name: form.name,
          phone: `+${form.countryCode}${form.phone}`,
          email: form.email,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setShowAddForm(false);
        setForm({ name: '', countryCode: '', phone: '', email: '' });
        Toast.fire({ icon: 'success', title: 'Customer added' });
        setRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      Toast.fire({ icon: 'error', title: 'Failed to add customer' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCustomer || !companyId || !token) {
      Toast.fire({ 
        icon: 'warning', 
        title: 'Please select a customer and ensure WhatsApp is connected' 
      });
      return;
    }
    
    setIsSending(true);
    
    // Create optimistic message for immediate UI update
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      from: 'me',
      type: 'text',
      content: newMessage,
      time: new Date().toLocaleTimeString(),
    };
    
    // Add message to UI immediately
    setMessages(prev => [...prev, tempMsg]);
    setCustomers(customers.map((c) => (c.id === selectedCustomer?.id ? { ...c, lastMessage: newMessage, lastTime: tempMsg.time } : c)));
    
    const messageToSend = newMessage;
    setNewMessage(''); // Clear input immediately
    
    try {
      // Call WhatsApp API
      const response = await sendWhatsAppMessage(
        companyId,
        selectedCustomer.phone,
        messageToSend,
        token
      );
      
      if (response.success) {
        // Update the temporary message with real message ID
        const realMsg: Message = {
          ...tempMsg,
          id: response.messageId || tempMsg.id,
        };
        
        setMessages(prev => 
          prev.map(msg => msg.id === tempMsg.id ? realMsg : msg)
        );
        
        Toast.fire({ 
          icon: 'success', 
          title: 'Message sent successfully!' 
        });
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMsg.id));
      
      // Restore the message in input
      setNewMessage(messageToSend);
      
      Toast.fire({ 
        icon: 'error', 
        title: error instanceof Error ? error.message : 'Failed to send message' 
      });
    } finally {
      setIsSending(false);
    }
  };

  const renderMessages = () => {
    const groups: { type: 'imageGroup' | 'single'; messages?: Message[]; message?: Message }[] = [];
    let currentImageGroup: Message[] = [];

    messages.forEach((msg, index) => {
      const previous = messages[index - 1];

      if (msg.type === 'image' && previous?.type === 'image' && previous.from === msg.from) {
        currentImageGroup.push(msg);
      } else {
        if (currentImageGroup.length > 0) {
          groups.push({ type: 'imageGroup', messages: currentImageGroup });
          currentImageGroup = [];
        }
        if (msg.type === 'image') {
          currentImageGroup.push(msg);
        } else {
          groups.push({ type: 'single', message: msg });
        }
      }
    });

    if (currentImageGroup.length > 0) {
      groups.push({ type: 'imageGroup', messages: currentImageGroup });
    }

    return groups.map((group, idx) => {
      if (group.type === 'imageGroup' && group.messages) {
        return <ImageGroup key={idx} messages={group.messages} />;
      } else if (group.message) {
        const isMe = group.message.from === 'me';
        switch (group.message.type) {
          case 'text':
            return <TextMessage key={idx} msg={group.message} isMe={isMe} />;
          case 'video':
            return <VideoMessage key={idx} msg={group.message} isMe={isMe} />;
          case 'audio':
            return <AudioMessage key={idx} msg={group.message} isMe={isMe} />;
          case 'document':
            return <DocumentMessage key={idx} msg={group.message} isMe={isMe} />;
          case 'contact':
            return <ContactMessage key={idx} msg={group.message} isMe={isMe} />;
          default:
            return null;
        }
      }
      return null;
    });
  };

  const renderMessage = (msg: Message) => {
    const isMe = msg.from === 'me';
    let content;
    switch (msg.type) {
      case 'image':
        content = <img src={msg.content} alt="Image" className="max-w-xs rounded-lg" />;
        break;
      case 'video':
        content = <video src={msg.content} controls className="max-w-xs rounded-lg" />;
        break;
      case 'audio':
        content = <audio src={msg.content} controls />;
        break;
      case 'document':
        content = <a href={msg.content} className="text-blue-500">{msg.content}</a>;
        break;
      case 'contact':
        content = <div className="bg-gray-100 p-2 rounded">{msg.content}</div>;
        break;
      default:
        content = <p>{msg.content}</p>;
    }
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`max-w-xs px-4 py-2 rounded-lg ${isMe ? 'bg-green-100 text-right' : 'bg-gray-100 text-left'}`}>
          {content}
          <span className="text-xs text-gray-500 ml-2">{msg.time}</span>
        </div>
      </div>
    );
  };

  const getMedia = (type: 'image' | 'video' | 'audio' | 'document') => messages.filter((m) => m.type === type);

  const filteredMessages = messages.filter((msg) => msg.type === 'text' && chatSearchQuery && msg.content.toLowerCase().includes(chatSearchQuery.toLowerCase()));

  return (
    <div className="flex max-h-[calc(100vh-77px)] overflow-hidden bg-gray-100 dark:bg-gray-900">
      <CustomerList
        customers={customers}
        setCustomers={setCustomers}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        selectedCustomer={selectedCustomer}
        handleSelectCustomer={handleSelectCustomer}
        handlePin={handlePin}
        onOpenAddForm={() => setShowAddForm(true)}
        refresh={refresh}
      />

      <div className="w-3/4 flex flex-col">
        {selectedCustomer?.id ? (
          <>
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-between">
              <div className="flex items-center cursor-pointer" onClick={() => setShowProfileModal(true)}>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mr-3 text-lg font-semibold">
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{selectedCustomer.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${whatsappConnected ? 'bg-green-500' : 'bg-red-500'}`} title={whatsappConnected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}></div>
                  </div>
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">{renderMessages()}</div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={isSending}
                className="flex-1 p-2 border rounded-l-lg dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isSending || !newMessage.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Select a chat</h2>
              <p className="text-gray-600">Choose a customer to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-50 overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800 transform transition-all duration-300 scale-100">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-800/20 rounded-xl mr-3">
                    <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Customer</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create a new customer profile</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors duration-200"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleAddCustomer} className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country Code *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">+</span>
                  <input
                    type="text"
                    placeholder="91"
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                    className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 border border-transparent rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm flex items-center"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && selectedCustomer?.id && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-30 z-50" onClick={() => setShowProfileModal(false)}>
          <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showAllStarred ? 'Starred Messages' : showAllMedia ? 'Media, docs and links' : 'Contact Info'}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {!showAllStarred && !showAllMedia ? (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-32 h-32 rounded-full bg-emerald-600 text-white flex items-center justify-center text-5xl font-semibold mb-4">
                      {getInitials(selectedCustomer.name)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{selectedCustomer.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.phone}</p>
                    {selectedCustomer.email && <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCustomer.email}</p>}
                  </div>
                  <hr className="my-4 border-gray-200 dark:border-gray-700" />
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">Info</h3>
                      <button
                        onClick={() => setIsEditingInfo(!isEditingInfo)}
                        className="text-emerald-600 dark:text-emerald-400 text-sm"
                      >
                        {isEditingInfo ? 'Save' : 'Edit'}
                      </button>
                    </div>
                    {isEditingInfo ? (
                      <>
                        <input
                          type="text"
                          value={selectedCustomer.name}
                          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                          className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={selectedCustomer.label || ''}
                          onChange={(e) => setSelectedCustomer({ ...selectedCustomer, label: e.target.value })}
                          className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                          placeholder="Label"
                        />
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Name: {selectedCustomer.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Label: {selectedCustomer.label || 'N/A'}</p>
                      </>
                    )}
                  </div>
                  <hr className="my-4 border-gray-200 dark:border-gray-700" />
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-900 dark:text-white">Starred Messages</h3>
                      <button onClick={() => setShowAllStarred(true)} className="text-emerald-600 dark:text-emerald-400 text-sm">
                        See all
                      </button>
                    </div>
                    {starredMessages && starredMessages.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {starredMessages.slice(0, 3).map((message) => (
                          <p key={message.id} className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                            {message.content}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">No starred messages yet.</p>
                    )}
                  </div>
                  <hr className="my-4 border-gray-200 dark:border-gray-700" />
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">Media, docs and links</h3>
                      <button onClick={() => setShowAllMedia(true)} className="text-emerald-600 dark:text-emerald-400 text-sm">
                        See all
                      </button>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Images</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {getMedia('image').slice(0, 4).map((m) => (
                          <img key={m.id} src={m.content} alt="Image" className="w-full h-20 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <hr className="my-4 border-gray-200 dark:border-gray-700" />
                  <div className="space-y-2">
                    <button
                      onClick={() => handleBlock(selectedCustomer.id)}
                      className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      {selectedCustomer.isBlocked ? 'Unblock contact' : 'Block contact'}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedCustomer.id)}
                      className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      Delete chat
                    </button>
                  </div>
                </>
              ) : showAllStarred ? (
                <>
                  <button onClick={() => setShowAllStarred(false)} className="text-emerald-600 dark:text-emerald-400 text-sm mb-4">
                    Back to Profile
                  </button>
                  <div className="space-y-4">
                    {starredMessages && starredMessages.length > 0 ? (
                      starredMessages.map((message) => (
                        <p key={message.id} className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                          {message.content}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No starred messages yet.</p>
                    )}
                  </div>
                </>
              ) : showAllMedia ? (
                <>
                  <button onClick={() => setShowAllMedia(false)} className="text-emerald-600 dark:text-emerald-400 text-sm mb-4">
                    Back to Profile
                  </button>
                  <div className="flex space-x-4 mb-4">
                    {['image', 'video', 'audio', 'document'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedMediaType(type as 'image' | 'video' | 'audio' | 'document')}
                        className={`px-2 py-1 rounded-lg ${
                          selectedMediaType === type ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}s
                      </button>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {selectedMediaType === 'image' && (
                      <div className="grid grid-cols-3 gap-2">
                        {getMedia('image').map((m) => (
                          <img key={m.id} src={m.content} alt="Image" className="w-full h-32 object-cover rounded" />
                        ))}
                      </div>
                    )}
                    {selectedMediaType === 'video' && (
                      <div className="grid grid-cols-3 gap-2">
                        {getMedia('video').map((m) => (
                          <video key={m.id} src={m.content} className="w-full h-32 object-cover rounded" controls />
                        ))}
                      </div>
                    )}
                    {selectedMediaType === 'audio' && (
                      <div className="space-y-2">
                        {getMedia('audio').map((m) => (
                          <div key={m.id}>
                            <audio src={m.content} controls className="w-full" />
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedMediaType === 'document' && (
                      <div className="space-y-2">
                        {getMedia('document').map((m) => (
                          <a key={m.id} href={m.content} className="block text-blue-500 dark:text-blue-400 mb-1">
                            {m.content}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showSearchModal && selectedCustomer?.id && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-30 z-50" onClick={() => setShowSearchModal(false)}>
          <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search Messages</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder="Search in chat..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
              <div className="space-y-4">
                {chatSearchQuery && filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => renderMessage(msg))
                ) : chatSearchQuery ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No messages found.</p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Type to search messages.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
