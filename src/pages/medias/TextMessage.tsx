import React from 'react';

interface TextMessageProps {
  content: string;
  time: string;
  isMe: boolean;
  status?: string;
  createdAt?: string;
}

const TextMessage: React.FC<TextMessageProps> = ({ 
  content, 
  time, 
  isMe, 
  status,
  createdAt
}) => {
  return (
    <div className="relative">
      <div className="text-white break-words whitespace-pre-wrap message-text">
        {content}
      </div>
      <div className={`absolute bottom-1 right-1 text-[10px] ${isMe ? 'text-green-100' : 'text-gray-300'} flex items-end`}>
        <span className="whitespace-nowrap">
          {createdAt
            ? new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            : time}
        </span>
        {isMe && (
          <span className="ml-1">
            {status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
};

export default TextMessage;