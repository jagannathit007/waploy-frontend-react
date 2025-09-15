import React from 'react';
import Swal from 'sweetalert2';

interface DocumentMessageProps {
  content: string;
  time: string;
  isMe: boolean;
  status?: string;
  fileName?: string;
  fileSize?: string;
  createdAt?: string;
}

const DocumentMessage: React.FC<DocumentMessageProps> = ({ 
  content, 
  time, 
  isMe, 
  status, 
  fileName, 
  // fileSize,
  createdAt
}) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const displayName = fileName || content;

  const getFileTypeInfo = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    switch (ext) {
      case 'pdf':
        return {
          icon: '📄',
          iconBg: 'bg-red-500',
          iconText: 'PDF',
          type: 'PDF'
        };
      case 'doc':
      case 'docx':
        return {
          icon: '📝',
          iconBg: 'bg-blue-500',
          iconText: 'W',
          type: 'DOCX'
        };
      case 'xls':
      case 'xlsx':
        return {
          icon: '📊',
          iconBg: 'bg-green-600',
          iconText: 'X',
          type: 'XLSX'
        };
      case 'ppt':
      case 'pptx':
        return {
          icon: '📈',
          iconBg: 'bg-orange-500',
          iconText: 'P',
          type: 'PPTX'
        };
      default:
        return {
          icon: '📄',
          iconBg: 'bg-gray-500',
          iconText: '?',
          type: ext.toUpperCase()
        };
    }
  };

  const fileInfo = getFileTypeInfo(displayName);
  
  // Clean the filename by removing any upload/media prefixes and paths
  const cleanFileName = displayName.replace(/^(uploads?[\\\/]media[\\\/]|uploads?[\\\/]|media[\\\/])/i, '');

  const handleDocumentDownload = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_IMAGE_URL}${content}`);
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = cleanFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      Toast.fire({ icon: "success", title: "File downloaded successfully" });
    } catch (error) {
      console.error('Download error:', error);
      Toast.fire({ icon: "error", title: "Failed to download file" });
    }
  };

  return (
    <div className="relative w-64">
      <div 
        className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-opacity-80 transition-opacity"
        onClick={handleDocumentDownload}
      >
        <div className={`w-12 h-12 ${fileInfo.iconBg} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
          <span className="text-white font-bold text-sm">{fileInfo.iconText}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium break-words text-sm">{cleanFileName}</div>
          <div className="text-white text-opacity-70 text-[10px]">
            {fileInfo.type}
          </div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <svg className="w-5 h-5 text-white text-opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      
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
  );
};

export default DocumentMessage;