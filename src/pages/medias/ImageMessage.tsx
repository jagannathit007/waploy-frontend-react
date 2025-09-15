import React, { useState } from 'react';

interface ImageMessageProps {
  content: string;
  time: string;
  isMe: boolean;
  status?: string;
  createdAt?: string;
  caption?: string;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ 
  content, 
  time, 
  isMe, 
  status,
  createdAt,
  caption
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        {!imageLoaded && !imageError && (
          <div className="w-64 h-48 bg-gray-300 animate-pulse flex items-center justify-center rounded-lg">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {imageError ? (
          <div className="w-64 h-48 bg-gray-300 flex flex-col items-center justify-center text-gray-500 rounded-lg">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Failed to load image</span>
          </div>
        ) : (
          <img 
            src={`${import.meta.env.VITE_IMAGE_URL}${content}`} 
            alt="Image" 
            className={`w-64 h-48 rounded-lg object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {/* Time and Status */}
        <div className={`absolute bottom-1 right-1 text-[10px] ${isMe ? 'text-white' : 'text-gray-300'}`}>
          {createdAt
            ? new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            : time}
          {isMe && (
            <span className="ml-1">
              {status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
      
      {caption && (
        <div className={`mt-1 px-3 py-2 rounded-lg ${isMe ? 'bg-green-500' : 'bg-gray-600'} text-white text-sm`}>
          {caption}
        </div>
      )}
    </div>
  );
};

export default ImageMessage;