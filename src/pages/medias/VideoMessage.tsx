import React, { useState } from 'react';

interface VideoMessageProps {
  content: string;
  time: string;
  isMe: boolean;
  status?: string;
  duration?: string;
  caption?: string;
  createdAt?: string;
}

const VideoMessage: React.FC<VideoMessageProps> = ({ 
  content, 
  time, 
  isMe, 
  status, 
  duration, 
  caption,
  createdAt
}) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        {!videoLoaded && !videoError && (
          <div className="w-64 h-48 bg-gray-300 animate-pulse flex items-center justify-center rounded-lg">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {videoError ? (
          <div className="w-64 h-48 bg-gray-300 flex flex-col items-center justify-center text-gray-500 rounded-lg">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">Failed to load video</span>
          </div>
        ) : (
          <div className="relative">
            <video
              src={`${import.meta.env.VITE_IMAGE_URL}${content}`}
              className={`w-64 h-48 rounded-lg object-cover ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoadedData={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
              controls
              preload="metadata"
            />
            
            {/* Play button overlay when not loaded */}
            {!videoLoaded && !videoError && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Duration badge */}
        {duration && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded px-2 py-1 text-white text-xs">
            {duration}
          </div>
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

export default VideoMessage;