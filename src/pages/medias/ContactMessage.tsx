import React from 'react';

interface ContactMessageProps {
  content: string;
  time: string;
  isMe: boolean;
  status?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

const ContactMessage: React.FC<ContactMessageProps> = ({ 
  time, 
  isMe, 
  status, 
  contactName, 
  contactPhone,
  contactEmail,
  content 
}) => {
  // Parse contact info from content if not provided separately
  const name = contactName || content.replace('Contact: ', '') || 'Unknown Contact';
  
  const getInitials = (name: string): string => {
    if (!name || name.trim() === "" || name === "Unknown Contact") {
      return "?";
    }
    const nameParts = name.trim().split(" ");
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0]?.toUpperCase() || "?";
  };

  const handleAddContact = () => {
    // Logic to add contact to phone's contact list
    console.log('Add contact:', { name, phone: contactPhone, email: contactEmail });
    // You can implement actual contact addition logic here
  };

  const handleCall = () => {
    if (contactPhone) {
      window.open(`tel:${contactPhone}`, '_self');
    }
  };

  const handleMessage = () => {
    if (contactPhone) {
      // Logic to open chat with this contact
      console.log('Start chat with:', contactPhone);
    }
  };

  return (
    <div className={`relative max-w-xs ${isMe ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`px-4 py-4 rounded-lg ${isMe ? 'bg-green-500' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'} ${isMe ? 'text-white' : 'text-gray-900 dark:text-white'} shadow-sm`}>
        
        {/* Contact Header */}
        <div className="flex items-center space-x-3 mb-3">
          {/* Contact Avatar */}
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
            isMe 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
          }`}>
            {getInitials(name)}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{name}</p>
            <p className={`text-xs ${isMe ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>
              Contact
            </p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-2 mb-4">
          {contactPhone && (
            <div className="flex items-center space-x-2">
              <svg className={`w-4 h-4 ${isMe ? 'text-green-100' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-xs">{contactPhone}</span>
            </div>
          )}
          
          {contactEmail && (
            <div className="flex items-center space-x-2">
              <svg className={`w-4 h-4 ${isMe ? 'text-green-100' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-xs truncate">{contactEmail}</span>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="space-y-2">
          <button 
            onClick={handleAddContact}
            className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              isMe 
                ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Contact</span>
            </div>
          </button>
          
          {contactPhone && (
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleMessage}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  isMe 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                    : 'bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Message</span>
                </div>
              </button>
              
              <button 
                onClick={handleCall}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  isMe 
                    ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Call</span>
                </div>
              </button>
            </div>
          )}
        </div>
        
        {/* Time and status */}
        <div className="flex items-center justify-end mt-3 pt-2 border-t border-white border-opacity-20">
          <span className={`text-xs ${isMe ? 'opacity-80' : 'text-gray-500 dark:text-gray-400'}`}>
            {time}
          </span>
          {isMe && (
            <span className="ml-1 text-xs opacity-80">
              {status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessage;