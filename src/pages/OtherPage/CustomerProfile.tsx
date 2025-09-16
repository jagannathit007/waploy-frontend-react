// CustomerProfile.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { apiCall } from '../../services/api/auth';
import { File, FileText, FileSpreadsheet, ExternalLink } from 'lucide-react';

interface Label {
  _id: string;
  name: string;
  description?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  pinned: boolean;
  isBlocked: boolean;
  email?: string;
  labels?: Label[];
}

interface Message {
  _id?: string;
  id: string;
  from: 'me' | 'them';
  to?: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'contact';
  content: string;
  time: string;
  createdAt?: string;
  status?: string;
}

interface StarredMessage {
  id: number;
  content: string;
}

interface CustomerProfileProps {
  selectedCustomer: Customer;
  getInitials: (name: string) => string;
  isEditingInfo: boolean;
  setIsEditingInfo: React.Dispatch<React.SetStateAction<boolean>>;
  handleAssignLabels: () => void;
  selectedLabels: string[];
  setSelectedLabels: React.Dispatch<React.SetStateAction<string[]>>;
  labels: Label[];
  starredMessages: StarredMessage[];
  showAllStarred: boolean;
  setShowAllStarred: React.Dispatch<React.SetStateAction<boolean>>;
  showAllMedia: boolean;
  setShowAllMedia: React.Dispatch<React.SetStateAction<boolean>>;
  selectedMediaType: 'image' | 'video' | 'audio' | 'document';
  setSelectedMediaType: React.Dispatch<
    React.SetStateAction<'image' | 'video' | 'audio' | 'document'>
  >;
  handleBlock: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
}

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const CustomerProfile: React.FC<CustomerProfileProps> = ({
  selectedCustomer,
  getInitials,
  isEditingInfo,
  setIsEditingInfo,
  handleAssignLabels,
  selectedLabels,
  setSelectedLabels,
  labels,
  starredMessages,
  showAllStarred,
  setShowAllStarred,
  showAllMedia,
  setShowAllMedia,
  selectedMediaType,
  setSelectedMediaType,
  handleBlock,
  handleDelete,
  setSelectedCustomer,
}) => {
  const { token, profile } = useAuth();
  const [mediaItems, setMediaItems] = useState<Message[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL || '';

  // Fetch media when component mounts or customer changes
  useEffect(() => {
    const fetchCustomerMedia = async () => {
      if (!token || !profile?.company?._id) {
        console.log('Missing token or companyId:', { token, companyId: profile?.company?._id });
        Toast.fire({
          icon: 'error',
          title: 'Authentication or company information missing',
        });
        return;
      }
      setLoadingMedia(true);
      try {
        console.log('Making API call to:', `/whatsapp/${profile.company._id}/customerWiseMedia`);
        console.log('Request body:', {
          customerId: selectedCustomer.id,
          page: 1,
          limit: 50,
        });
        const response = await apiCall(
          `/whatsapp/${profile.company._id}/customerWiseMedia`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              customerId: selectedCustomer.id,
              page: 1,
              limit: 50,
            }),
          },
          token
        );

        console.log('-----------------------------------------------', response.data);

        if (response && response.data && response.success) {
          const mediaData = response.data.media || {};
          const { images = [], videos = [], audios = [], documents = [] } = mediaData;
          // Combine all media types and transform to Message interface
          const transformedMessages: Message[] = [
            ...images.map((item: any) => ({
              _id: item.messageId,
              id: item.messageId,
              from: item.direction === 'incoming' ? 'them' : 'me',
              to: item.to,
              type: 'image' as const,
              content: `${VITE_IMAGE_URL}/${item.url}`,
              time: new Date(item.createdAt).toLocaleTimeString(),
              createdAt: item.createdAt,
              status: item.status,
            })),
            ...videos.map((item: any) => ({
              _id: item.messageId,
              id: item.messageId,
              from: item.direction === 'incoming' ? 'them' : 'me',
              to: item.to,
              type: 'video' as const,
              content: `${VITE_IMAGE_URL}/${item.url}`,
              time: new Date(item.createdAt).toLocaleTimeString(),
              createdAt: item.createdAt,
              status: item.status,
            })),
            ...audios.map((item: any) => ({
              _id: item.messageId || '', // Fallback if messageId is missing
              id: item.messageId || '',
              from: item.direction === 'incoming' ? 'them' : 'me',
              to: item.to,
              type: 'audio' as const,
              content: `${VITE_IMAGE_URL}/${item.url}`,
              time: new Date(item.createdAt).toLocaleTimeString(),
              createdAt: item.createdAt,
              status: item.status,
            })),
            ...documents.map((item: any) => ({
              _id: item.messageId,
              id: item.messageId,
              from: item.direction === 'incoming' ? 'them' : 'me',
              to: item.to,
              type: 'document' as const,
              content: `${VITE_IMAGE_URL}/${item.url}`,
              time: new Date(item.createdAt).toLocaleTimeString(),
              createdAt: item.createdAt,
              status: item.status,
            })),
          ];
          // Sort by createdAt (latest first)
          const sortedMedia = transformedMessages.sort(
            (a, b) =>
              new Date(b.createdAt || b.time).getTime() -
              new Date(a.createdAt || a.time).getTime()
          );
          setMediaItems(sortedMedia);
          console.log('Transformed Media Items:', sortedMedia);
        } else {
          throw new Error(response?.data?.message || 'Failed to fetch media');
        }
      } catch (error: any) {
        console.error('Failed to fetch media:', error);
        Toast.fire({
          icon: 'error',
          title: `Failed to fetch media: ${error.message}`,
        });
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchCustomerMedia();
  }, [selectedCustomer.id, token, profile?.company?._id]);

  // Helper function to filter media by type
  const filterMediaByType = (type: 'image' | 'video' | 'audio' | 'document') =>
    mediaItems.filter((m) => m.type === type);

  return (
    <div className="p-4">
      {!showAllStarred && !showAllMedia ? (
        <>
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full bg-emerald-600 text-white flex items-center justify-center text-5xl font-semibold mb-4">
              {getInitials(selectedCustomer.name)}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {selectedCustomer.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCustomer.phone}
            </p>
            {selectedCustomer.email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCustomer.email}
              </p>
            )}
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">Info</h3>
              <button
                onClick={() => {
                  if (isEditingInfo) {
                    handleAssignLabels(); // Save name and labels
                  } else {
                    setIsEditingInfo(true);
                  }
                }}
                className="text-emerald-600 dark:text-emerald-400 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-2 py-1 rounded transition-colors duration-200"
              >
                {isEditingInfo ? 'Save' : 'Edit'}
              </button>
            </div>
            {isEditingInfo ? (
              <div className="space-y-3">
                {/* Name Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.name}
                    onChange={(e) =>
                      setSelectedCustomer({
                        ...selectedCustomer,
                        name: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter customer name"
                  />
                </div>
                {/* Label Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Labels ({selectedLabels.length} selected)
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800">
                    {labels.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                        No labels available
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {labels.map((label) => (
                          <label
                            key={label._id}
                            className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors duration-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLabels.includes(label._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedLabels([...selectedLabels, label._id]);
                                } else {
                                  setSelectedLabels(
                                    selectedLabels.filter((id) => id !== label._id)
                                  );
                                }
                              }}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mr-2"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {label.name}
                              </div>
                              {label.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {label.description}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Selected Labels Preview */}
                  {selectedLabels.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Selected Labels:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {selectedLabels.map((labelId) => {
                          const label = labels.find((l) => l._id === labelId);
                          return label ? (
                            <span
                              key={labelId}
                              className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-full"
                            >
                              {label.name}
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedLabels(
                                    selectedLabels.filter((id) => id !== labelId)
                                  )
                                }
                                className="ml-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200"
                              >
                                ×
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {selectedCustomer.name}
                  </span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Labels:
                  </span>
                  <div className="mt-1">
                    {selectedCustomer.labels && selectedCustomer.labels.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedCustomer.labels.map((label) => (
                          <span
                            key={label._id}
                            className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs rounded-full"
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        No labels assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Starred Messages
              </h3>
              <button
                onClick={() => setShowAllStarred(true)}
                className="text-emerald-600 dark:text-emerald-400 text-sm"
              >
                See all
              </button>
            </div>
            {starredMessages && starredMessages.length > 0 ? (
              <div className="mt-2 space-y-2">
                {starredMessages.slice(0, 3).map((message) => (
                  <p
                    key={message.id}
                    className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    {message.content}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                No starred messages yet.
              </p>
            )}
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Media, docs and links
              </h3>
              <button
                onClick={() => setShowAllMedia(true)}
                className="text-emerald-600 dark:text-emerald-400 text-sm"
              >
                See all
              </button>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Images
              </h4>
              {loadingMedia ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Loading images...
                  </span>
                </div>
              ) : filterMediaByType('image').length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {filterMediaByType('image')
                    .slice(0, 3)
                    .map((m) => (
                      <img
                        key={m.id}
                        src={m.content}
                        alt="Image"
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No images available.
                </p>
              )}
            </div>
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <div className="flex space-x-2">
            <button
              onClick={() => handleBlock(selectedCustomer.id)}
              className="flex-1 px-4 py-2 text-center text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {selectedCustomer.isBlocked ? 'Unblock contact' : 'Block contact'}
            </button>
            <button
              onClick={() => handleDelete(selectedCustomer.id)}
              className="flex-1 px-4 py-2 text-center text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              Delete chat
            </button>
          </div>
        </>
      ) : showAllStarred ? (
        <>
          <button
            onClick={() => setShowAllStarred(false)}
            className="text-emerald-600 dark:text-emerald-400 text-sm mb-4"
          >
            Back to Profile
          </button>
          <div className="space-y-4">
            {starredMessages && starredMessages.length > 0 ? (
              starredMessages.map((message) => (
                <p
                  key={message.id}
                  className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-100 dark:bg-gray-800 rounded"
                >
                  {message.content}
                </p>
              ))
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No starred messages yet.
              </p>
            )}
          </div>
        </>
      ) : showAllMedia ? (
        <>
          <button
            onClick={() => setShowAllMedia(false)}
            className="text-emerald-600 dark:text-emerald-400 text-sm mb-4"
          >
            Back to Profile
          </button>
          <div className="flex space-x-4 mb-4">
            {['image', 'video', 'audio', 'document'].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setSelectedMediaType(
                    type as 'image' | 'video' | 'audio' | 'document'
                  )
                }
                className={`px-2 py-1 rounded-lg ${
                  selectedMediaType === type
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </button>
            ))}
          </div>
         <div className="space-y-4">
  {loadingMedia ? (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        Loading media...
      </span>
    </div>
  ) : (
    <>
      {selectedMediaType === 'image' && (
        <div className="grid grid-cols-3 gap-2">
          {filterMediaByType('image').length > 0 ? (
            filterMediaByType('image').map((m) => (
              <div
                key={m.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg"
              >
                <img
                  src={m.content}
                  alt="Image"
                  className="w-full h-32 object-cover transform group-hover:scale-105 transition-transform duration-200"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No images available.
            </p>
          )}
        </div>
      )}
      {selectedMediaType === 'video' && (
        <div className="grid grid-cols-3 gap-2">
          {filterMediaByType('video').length > 0 ? (
            filterMediaByType('video').map((m) => (
              <video
                key={m.id}
                src={m.content}
                className="w-full h-32 object-cover rounded"
                controls
              />
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No videos available.
            </p>
          )}
        </div>
      )}
      {selectedMediaType === 'audio' && (
        <div className="space-y-2">
          {filterMediaByType('audio').length > 0 ? (
            filterMediaByType('audio').map((m) => (
              <div key={m.id}>
                <audio src={m.content} controls className="w-full" />
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No audio files available.
            </p>
          )}
        </div>
      )}
      {selectedMediaType === 'document' && (
        <div className="space-y-2">
          {filterMediaByType('document').length > 0 ? (
            filterMediaByType('document').map((m) => {
              // Extract file extension from content URL
              const fileName = m.content.split('/').pop() || 'Document';
              const fileExtension = fileName.split('.').pop()?.toLowerCase() || '';
              // Determine display name based on type
              let displayName = 'Document';
              if (fileExtension === 'pdf') {
                displayName = 'PDF Document';
              } else if (['doc', 'docx'].includes(fileExtension)) {
                displayName = 'Word Document';
              } else if (['xls', 'xlsx'].includes(fileExtension)) {
                displayName = 'Excel Document';
              } else if (['ppt', 'pptx'].includes(fileExtension)) {
                displayName = 'PowerPoint Document';
              }
              // Determine icon based on file extension (using Lucide icons)
              let IconComponent = File;
              let iconColor = 'text-gray-500';
              if (fileExtension === 'pdf') {
                IconComponent = FileText;
                iconColor = 'text-red-500';
              } else if (['doc', 'docx'].includes(fileExtension)) {
                IconComponent = FileText;
                iconColor = 'text-blue-500';
              } else if (['xls', 'xlsx'].includes(fileExtension)) {
                IconComponent = FileSpreadsheet;
                iconColor = 'text-green-500';
              } else if (['ppt', 'pptx'].includes(fileExtension)) {
                IconComponent = FileText;
                iconColor = 'text-orange-500';
              }
              return (
                <a
                  key={m.id}
                  href={m.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <IconComponent className={`${iconColor} mr-3`} size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {fileExtension.toUpperCase()} • {m.time}
                    </p>
                  </div>
                  <ExternalLink className="text-gray-400 dark:text-gray-500" size={16} />
                </a>
              );
            })
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No documents available.
            </p>
          )}
        </div>
      )}
    </>
  )}
</div>
        </>
      ) : null}
    </div>
  );
};

export default CustomerProfile;