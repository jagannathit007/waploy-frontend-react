import React from 'react';
import { useSocket } from '../../context/SocketContext';

interface SocketStatusProps {
  className?: string;
}

const SocketStatus: React.FC<SocketStatusProps> = ({ className = '' }) => {
  const { isConnected, socket } = useSocket();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm text-gray-600">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      {socket && (
        <span className="text-xs text-gray-400">
          ({socket.id?.slice(0, 8)}...)
        </span>
      )}
    </div>
  );
};

export default SocketStatus;
