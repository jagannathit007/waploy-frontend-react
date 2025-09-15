import React, { useState, useEffect } from 'react';
import { useSocketEvents } from '../../hooks/useSocketEvents';

interface DebugMessage {
  id: string;
  timestamp: string;
  content: any;
  type: string;
}

const SocketDebugPanel: React.FC = () => {
  const [messages, setMessages] = useState<DebugMessage[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const { isConnected } = useSocketEvents({
    onCompanyMessage: (message) => {
      console.log('🔍 Debug Panel - Company Message:', message);
      setMessages(prev => [...prev, {
        id: `company_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        content: message,
        type: 'company'
      }]);
    },
    onGlobalMessage: (message) => {
      console.log('🔍 Debug Panel - Global Message:', message);
      setMessages(prev => [...prev, {
        id: `global_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        content: message,
        type: 'global'
      }]);
    },
    onPrivateStatusChange: (status) => {
      console.log('🔍 Debug Panel - Private Status:', status);
      setMessages(prev => [...prev, {
        id: `status_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        content: status,
        type: 'status'
      }]);
    }
  });

  // Toggle visibility with Ctrl+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg hover:bg-blue-600"
        >
          Debug Socket (Ctrl+D)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-sm">Socket Debug Panel</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages received yet...</p>
        ) : (
          messages.slice(-10).reverse().map((msg) => (
            <div key={msg.id} className="mb-2 p-2 bg-gray-50 rounded text-xs">
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium text-blue-600">{msg.type}</span>
                <span className="text-gray-500">{msg.timestamp}</span>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                {JSON.stringify(msg.content, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
      
      <div className="p-2 border-t border-gray-200 bg-gray-50">
        <button
          onClick={() => setMessages([])}
          className="text-xs text-gray-600 hover:text-gray-800"
        >
          Clear Messages
        </button>
        <span className="text-xs text-gray-500 ml-2">
          Total: {messages.length}
        </span>
      </div>
    </div>
  );
};

export default SocketDebugPanel;
