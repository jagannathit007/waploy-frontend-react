import React, { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';

interface AudioMessageProps {
  content: string;
  time: string;
  isMe: boolean;
  status?: string;
  messageId: string;
  createdAt?: string;
  onPlay?: (messageId: string) => void;
  onPause?: (messageId: string) => void;
}

const AudioMessage: React.FC<AudioMessageProps> = ({ 
  content, 
  time, 
  isMe, 
  status,
  messageId,
  createdAt,
  onPlay,
  onPause
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (onPause) onPause(messageId);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlay) onPlay(messageId);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (onPause) onPause(messageId);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [messageId, onPlay, onPause]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        Toast.fire({ icon: 'error', title: 'Failed to play audio' });
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_IMAGE_URL}${content}`);
      if (!response.ok) {
        throw new Error('Failed to download audio');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audio_${messageId}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      Toast.fire({ icon: "success", title: "Audio downloaded successfully" });
    } catch (error) {
      console.error('Download error:', error);
      Toast.fire({ icon: "error", title: "Failed to download audio" });
    }
  };

  return (
    <div className="relative w-80">
      <div className="flex items-center p-3">
        {/* Profile Picture with Microphone Overlay */}
        <div className="relative mr-3 flex-shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          </div>
          {/* Microphone overlay */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            </svg>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={togglePlayPause}
          className="mr-3 flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-600 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        >
          {isPlaying ? (
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Waveform Visualization */}
        <div className="flex-1 mr-3">
          <div className="flex items-center space-x-1 h-6">
            {[...Array(20)].map((_, i) => {
              const progress = duration > 0 ? (currentTime / duration) : 0;
              const isActive = i < (progress * 20);
              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-colors ${
                    isActive 
                      ? 'bg-blue-500 dark:bg-blue-400' 
                      : 'bg-gray-300 dark:bg-gray-500'
                  }`}
                  style={{
                    height: `${Math.random() * 12 + 4}px`,
                  }}
                ></div>
              );
            })}
          </div>
          
          {/* Time Display */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{duration > 0 ? formatDuration(Math.floor(duration)) : '0:00'}</span>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleAudioDownload}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
      
      {/* Time and Status */}
      <div className={`absolute bottom-1 right-1 text-[10px] ${isMe ? 'text-green-100' : 'text-gray-300'}`}>
        {createdAt
          ? new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
          : time}
        {isMe && (
          <span className="ml-1">
            {status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'}
          </span>
        )}
      </div>

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={`${import.meta.env.VITE_IMAGE_URL}${content}`}
        preload="metadata"
      />
    </div>
  );
};

export default AudioMessage;