import React, { useState } from 'react';

interface MultipleImagesMessageProps {
  images: string[];
  time: string;
  isMe: boolean;
  status?: string;
  caption?: string;
}

const MultipleImagesMessage: React.FC<MultipleImagesMessageProps> = ({ 
  images, 
  time, 
  isMe, 
  status, 
  caption 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>(new Array(images.length).fill(false));

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const renderImageGrid = () => {
    const imageCount = images.length;
    
    if (imageCount === 1) {
      return (
        <div className="relative">
          {!imageLoaded[0] && (
            <div className="w-64 h-48 bg-gray-300 animate-pulse flex items-center justify-center rounded-lg">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <img
            src={`${import.meta.env.VITE_IMAGE_URL}${images[0]}`}
            alt="Image"
            className={`w-full max-w-xs h-48 object-cover rounded-lg cursor-pointer transition-opacity ${imageLoaded[0] ? 'opacity-100' : 'opacity-0 absolute top-0'}`}
            onLoad={() => handleImageLoad(0)}
            onClick={() => openLightbox(0)}
          />
        </div>
      );
    }
    
    if (imageCount === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 max-w-xs">
          {images.map((img, index) => (
            <div key={index} className="relative">
              {!imageLoaded[index] && (
                <div className="w-full h-32 bg-gray-300 animate-pulse flex items-center justify-center rounded">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <img
                src={`${import.meta.env.VITE_IMAGE_URL}${img}`}
                alt={`Image ${index + 1}`}
                className={`w-full h-32 object-cover rounded cursor-pointer transition-opacity ${imageLoaded[index] ? 'opacity-100' : 'opacity-0 absolute top-0'}`}
                onLoad={() => handleImageLoad(index)}
                onClick={() => openLightbox(index)}
              />
            </div>
          ))}
        </div>
      );
    }
    
    if (imageCount === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 max-w-xs">
          <div className="relative">
            {!imageLoaded[0] && (
              <div className="w-full h-32 bg-gray-300 animate-pulse flex items-center justify-center rounded">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <img
              src={`${import.meta.env.VITE_IMAGE_URL}${images[0]}`}
              alt="Image 1"
              className={`w-full h-32 object-cover rounded cursor-pointer transition-opacity ${imageLoaded[0] ? 'opacity-100' : 'opacity-0 absolute top-0'}`}
              onLoad={() => handleImageLoad(0)}
              onClick={() => openLightbox(0)}
            />
          </div>
          <div className="grid grid-rows-2 gap-1">
            {images.slice(1, 3).map((img, index) => (
              <div key={index + 1} className="relative">
                {!imageLoaded[index + 1] && (
                  <div className="w-full h-15 bg-gray-300 animate-pulse flex items-center justify-center rounded">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <img
                  src={`${import.meta.env.VITE_IMAGE_URL}${img}`}
                  alt={`Image ${index + 2}`}
                  className={`w-full h-15 object-cover rounded cursor-pointer transition-opacity ${imageLoaded[index + 1] ? 'opacity-100' : 'opacity-0 absolute top-0'}`}
                  onLoad={() => handleImageLoad(index + 1)}
                  onClick={() => openLightbox(index + 1)}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // 4 or more images
    return (
      <div className="grid grid-cols-2 gap-1 max-w-xs">
        {images.slice(0, 3).map((img, index) => (
          <div key={index} className="relative">
            {!imageLoaded[index] && (
              <div className="w-full h-20 bg-gray-300 animate-pulse flex items-center justify-center rounded">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <img
              src={`${import.meta.env.VITE_IMAGE_URL}${img}`}
              alt={`Image ${index + 1}`}
              className={`w-full h-20 object-cover rounded cursor-pointer transition-opacity ${imageLoaded[index] ? 'opacity-100' : 'opacity-0 absolute top-0'}`}
              onLoad={() => handleImageLoad(index)}
              onClick={() => openLightbox(index)}
            />
          </div>
        ))}
        <div 
          className="relative w-full h-20 bg-gray-800 bg-opacity-50 rounded cursor-pointer flex items-center justify-center"
          onClick={() => openLightbox(3)}
        >
          {!imageLoaded[3] && (
            <div className="absolute inset-0 w-full h-20 bg-gray-300 animate-pulse rounded"></div>
          )}
          <img
            src={`${import.meta.env.VITE_IMAGE_URL}${images[3]}`}
            alt="Image 4"
            className={`w-full h-full object-cover rounded transition-opacity ${imageLoaded[3] ? 'opacity-30' : 'opacity-0'}`}
            onLoad={() => handleImageLoad(3)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-lg font-bold drop-shadow-lg">
              +{imageCount - 3}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`relative max-w-xs ${isMe ? 'ml-auto' : 'mr-auto'}`}>
        <div className={`relative rounded-lg overflow-hidden ${isMe ? 'bg-green-500' : 'bg-gray-600'}`}>
          {renderImageGrid()}
          
          {/* Time and status overlay */}
          <div className="absolute bottom-1 right-2 bg-black bg-opacity-50 rounded px-2 py-1 flex items-center text-white text-xs">
            <span>{time}</span>
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
      
      {/* Lightbox for viewing full images */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-4xl w-full h-full flex items-center justify-center p-4">
            <img
              src={`${import.meta.env.VITE_IMAGE_URL}${images[currentIndex]}`}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            
            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg bg-black bg-opacity-50 rounded px-3 py-1">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MultipleImagesMessage;