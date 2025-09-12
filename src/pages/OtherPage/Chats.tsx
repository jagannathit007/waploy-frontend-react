import React, { useState } from 'react';
import Swal from 'sweetalert2';

// Dummy data for customers
const dummyCustomers = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 123-456-7890',
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
const dummyChats = {
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

const Chats = () => {
  const [customers, setCustomers] = useState(dummyCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', countryCode: '', phone: '', email: '' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showMenu, setShowMenu] = useState(null); // For three-dot menu

  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Function to get initials from name
  const getInitials = (name) => {
    const nameParts = name.trim().split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };

  const filteredCustomers = customers
    .filter((c) =>
      (filter === 'all' || (filter === 'unread' && c.unread > 0)) &&
      c.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.pinned - a.pinned);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setMessages(dummyChats[customer.id] || []);
    setShowMenu(null);
  };

  const handlePin = (id) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    setShowMenu(null);
    Toast.fire({ icon: 'success', title: `Customer ${customers.find(c => c.id === id).pinned ? 'unpinned' : 'pinned'}` });
  };

  const handleBlock = (id) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, isBlocked: !c.isBlocked } : c));
    Toast.fire({ icon: 'success', title: 'Customer block status updated' });
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
    if (selectedCustomer?.id === id) setSelectedCustomer(null);
    Toast.fire({ icon: 'success', title: 'Customer deleted' });
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const newCustomer = {
      id: Date.now().toString(),
      ...form,
      lastMessage: '',
      lastTime: '',
      unread: 0,
      pinned: false,
      isBlocked: false,
    };
    setCustomers([...customers, newCustomer]);
    setShowAddForm(false);
    setForm({ name: '', countryCode: '', phone: '', email: '' });
    Toast.fire({ icon: 'success', title: 'Customer added' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage) return;
    const newMsg = { id: Date.now().toString(), from: 'me', type: 'text', content: newMessage, time: new Date().toLocaleTimeString() };
    setMessages([...messages, newMsg]);
    setCustomers(customers.map(c => c.id === selectedCustomer.id ? { ...c, lastMessage: newMessage, lastTime: newMsg.time } : c));
    setNewMessage('');
  };

  const renderMessage = (msg) => {
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

  const getMedia = (type) => messages.filter(m => m.type === type);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Left Sidebar */}
      <div className="w-1/4 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chats</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm"
            >
              Add Customer
            </button>
          </div>
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm ${filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-sm ${filter === 'unread' ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'}`}
            >
              Unread
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-170px)]">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => handleSelectCustomer(customer)}
              className={`flex items-center p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedCustomer?.id === customer.id ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
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
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mb-1">{customer.unread}</span>
                  )}
                  {customer.pinned && (
                    <span className="text-sm text-gray-500 ml-1 mb-1">📌</span>
                  )}
                </div>
                <span className="text-xs text-gray-500">{customer.lastTime}</span>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowMenu(showMenu === customer.id ? null : customer.id); }}
                  className="ml-2 text-gray-500"
                >
                  ⋯
                </button>
                {showMenu === customer.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handlePin(customer.id)}
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

      {/* Right Chat Area */}
      <div className="w-3/4 flex flex-col">
        {selectedCustomer ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-between">
              <div className="flex items-center cursor-pointer" onClick={() => setShowProfileModal(true)}>
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mr-3 text-lg font-semibold">
                  {getInitials(selectedCustomer.name)}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input type="text" placeholder="Search chat..." className="p-2 border rounded-lg dark:bg-gray-700 dark:text-white" />
                <button className="text-gray-500">⋯</button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
              {messages.map(renderMessage)}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-l-lg dark:bg-gray-700 dark:text-white"
              />
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-r-lg">Send</button>
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

      {/* Add Customer Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-96">
            <h2 className="text-lg font-semibold mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer}>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Country Code"
                value={form.countryCode}
                onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="text"
                placeholder="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-96 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Customer Profile</h2>
            <div className="mb-4">
              <h3 className="font-medium">Info</h3>
              <input
                type="text"
                value={selectedCustomer.name}
                onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                className="w-full p-2 border rounded-lg mb-2 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Label"
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-between mt-4">
                <button onClick={() => handleBlock(selectedCustomer.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                  {selectedCustomer.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button onClick={() => handleDelete(selectedCustomer.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-medium">Starred Messages</h3>
              <p className="text-sm text-gray-600">No starred messages yet.</p>
            </div>
            <div>
              <h3 className="font-medium">Media</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4>Images</h4>
                  {getMedia('image').map(m => <img key={m.id} src={m.content} alt="Image" className="w-full rounded" />)}
                </div>
                <div>
                  <h4>Videos</h4>
                  {getMedia('video').map(m => <video key={m.id} src={m.content} controls className="w-full rounded" />)}
                </div>
                <div>
                  <h4>Documents</h4>
                  {getMedia('document').map(m => <a key={m.id} href={m.content} className="block">{m.content}</a>)}
                </div>
                <div>
                  <h4>Audio</h4>
                  {getMedia('audio').map(m => <audio key={m.id} src={m.content} controls />)}
                </div>
              </div>
            </div>
            <button onClick={() => setShowProfileModal(false)} className="mt-4 px-4 py-2 border rounded-lg w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;