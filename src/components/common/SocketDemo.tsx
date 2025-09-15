import React, { useState, useEffect } from 'react';
import { useSocketEvents } from '../../hooks/useSocketEvents';
import { useAuth } from '../../context/AuthContext';
import SocketStatus from './SocketStatus';

interface SocketDemoProps {
  className?: string;
}

const SocketDemo: React.FC<SocketDemoProps> = ({ className = '' }) => {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [companyId, setCompanyId] = useState('');

  const {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendToCompany,
    sendToAll,
    setPrivateOn,
    setPrivateOff,
  } = useSocketEvents({
    onCompanyMessage: (message) => {
      console.log('Received company message:', message);
      setMessages(prev => [...prev, { 
        type: 'company', 
        content: message, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    },
    onGlobalMessage: (message) => {
      console.log('Received global message:', message);
      setMessages(prev => [...prev, { 
        type: 'global', 
        content: message, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    },
    onPrivateStatusChange: (status) => {
      console.log('Private status changed:', status);
      setMessages(prev => [...prev, { 
        type: 'status', 
        content: `Private status: ${status}`, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
    },
  });

  // Set company ID from profile
  useEffect(() => {
    if (profile?.company?._id) {
      setCompanyId(profile.company._id);
    }
  }, [profile]);

  const handleSendToCompany = () => {
    if (newMessage.trim() && companyId) {
      sendToCompany(companyId, {
        text: newMessage,
        timestamp: new Date().toISOString(),
        sender: profile?.name || 'Unknown'
      });
      setNewMessage('');
    }
  };

  const handleSendToAll = () => {
    if (newMessage.trim()) {
      sendToAll({
        text: newMessage,
        timestamp: new Date().toISOString(),
        sender: profile?.name || 'Unknown'
      });
      setNewMessage('');
    }
  };

  const handleJoinRoom = () => {
    if (companyId) {
      joinRoom(companyId);
    }
  };

  const handleLeaveRoom = () => {
    if (companyId) {
      leaveRoom(companyId);
    }
  };

  const handleSetPrivateOn = () => {
    if (companyId) {
      // Using a dummy customer ID for demo
      setPrivateOn(companyId, 'demo-customer-id');
    }
  };

  const handleSetPrivateOff = () => {
    if (companyId) {
      // Using a dummy customer ID for demo
      setPrivateOff(companyId, 'demo-customer-id');
    }
  };

  return (
    <div className={`p-6 bg-white rounded-lg shadow-md ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Socket.IO Demo (utils/socket.js)</h2>
        <SocketStatus />
        <p className="text-sm text-gray-600 mt-2">
          This demo connects to the backend utils/socket.js implementation
        </p>
      </div>

      {/* Connection Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <p><strong>Company ID:</strong> {companyId || 'Not available'}</p>
        <p><strong>Socket ID:</strong> {socket?.id || 'Not connected'}</p>
        <p><strong>Status:</strong> {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
        <p><strong>Backend:</strong> utils/socket.js (Simple implementation)</p>
      </div>

      {/* Room Controls */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={handleJoinRoom}
          disabled={!isConnected || !companyId}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Join Room
        </button>
        <button
          onClick={handleLeaveRoom}
          disabled={!isConnected || !companyId}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
        >
          Leave Room
        </button>
      </div>

      {/* Message Input */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendToCompany()}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendToCompany}
            disabled={!isConnected || !companyId}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300"
          >
            Send to Company
          </button>
          <button
            onClick={handleSendToAll}
            disabled={!isConnected}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-300"
          >
            Send to All
          </button>
        </div>
      </div>

      {/* Private Controls */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={handleSetPrivateOn}
          disabled={!isConnected || !companyId}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300"
        >
          Set Private ON
        </button>
        <button
          onClick={handleSetPrivateOff}
          disabled={!isConnected || !companyId}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:bg-gray-300"
        >
          Set Private OFF
        </button>
      </div>

      {/* Messages Display */}
      <div className="border rounded p-3 h-64 overflow-y-auto bg-gray-50">
        <h3 className="font-semibold mb-2">Messages:</h3>
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="mb-2 p-2 bg-white rounded border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm text-gray-600">
                  {msg.type === 'company' ? '🏢 Company' : 
                   msg.type === 'global' ? '🌍 Global' : 
                   '🔒 Status'}
                </span>
                <span className="text-xs text-gray-400">{msg.timestamp}</span>
              </div>
              <p className="text-sm mt-1">{msg.content}</p>
            </div>
          ))
        )}
      </div>

      {/* Backend Events Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">Backend Events (utils/socket.js):</h4>
        <div className="text-sm text-blue-700">
          <p><strong>Client → Server:</strong></p>
          <ul className="list-disc list-inside ml-2">
            <li>joinRoom - Join company room</li>
            <li>leaveRoom - Leave company room</li>
            <li>sendToCompany - Send to specific company</li>
            <li>sendToAll - Broadcast to all</li>
            <li>isPrivateOn/Off - Control customer privacy</li>
          </ul>
          <p className="mt-2"><strong>Server → Client:</strong></p>
          <ul className="list-disc list-inside ml-2">
            <li>message - Global messages</li>
            <li>companyMessage - Company-specific messages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SocketDemo;
