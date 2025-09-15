import React from 'react';

interface LocationMessageProps {
  content: string;
  time: string;
  isMe: boolean;
  status?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  address?: string;
}

const LocationMessage: React.FC<LocationMessageProps> = ({ 
  content,
  time, 
  isMe, 
  status, 
  latitude, 
  longitude, 
  locationName, 
  address 
}) => {
  const handleOpenInMaps = () => {
    if (latitude && longitude) {
      // Open in Google Maps
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(mapsUrl, '_blank');
    } else if (address) {
      // Search by address
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleGetDirections = () => {
    if (latitude && longitude) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(directionsUrl, '_blank');
    } else if (address) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
      window.open(directionsUrl, '_blank');
    }
  };

  // Generate static map image URL (you can use Google Maps Static API or similar)
  const getStaticMapUrl = () => {
    if (latitude && longitude) {
      // Replace with your Google Maps API key
      return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&markers=color:red%7C${latitude},${longitude}&key=YOUR_API_KEY`;
    }
    return null;
  };

  const staticMapUrl = getStaticMapUrl();
  const displayName = locationName || address || content || 'Shared Location';

  return (
    <div className={`relative max-w-xs ${isMe ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`rounded-lg overflow-hidden ${isMe ? 'bg-green-500' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'} shadow-sm`}>
        
        {/* Map preview */}
        <div className="relative h-32 bg-gray-200 dark:bg-gray-600">
          {staticMapUrl ? (
            <img
              src={staticMapUrl}
              alt="Location preview"
              className="w-full h-full object-cover cursor-pointer"
              onClick={handleOpenInMaps}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 cursor-pointer" onClick={handleOpenInMaps}>
              <div className="text-center">
                <svg className="w-8 h-8 text-gray-500 dark:text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">Location Map</span>
              </div>
            </div>
          )}
          
          {/* Location pin overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-8 h-8 text-red-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        </div>

        {/* Location details */}
        <div className={`p-3 ${isMe ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          <div className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isMe 
                ? 'bg-white bg-opacity-20' 
                : 'bg-red-50 dark:bg-red-900'
            }`}>
              <svg className={`w-5 h-5 ${isMe ? 'text-white' : 'text-red-500 dark:text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              {address && address !== displayName && (
                <p className={`text-xs mt-1 ${isMe ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {address}
                </p>
              )}
              {latitude && longitude && (
                <p className={`text-xs mt-1 ${isMe ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button 
              onClick={handleOpenInMaps}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                isMe 
                  ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span>View</span>
              </div>
            </button>
            
            <button 
              onClick={handleGetDirections}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                isMe 
                  ? 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white' 
                  : 'bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900 dark:hover:bg-green-800 dark:text-green-300'
              }`}
            >
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Directions</span>
              </div>
            </button>
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
    </div>
  );
};

export default LocationMessage;