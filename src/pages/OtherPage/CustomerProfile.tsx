// CustomerProfile.tsx
import React from 'react';

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
  id: string;
  from: "me" | "them";
  type: "text" | "image" | "video" | "audio" | "document" | "contact";
  content: string;
  time: string;
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
  selectedMediaType: "image" | "video" | "audio" | "document";
  setSelectedMediaType: React.Dispatch<React.SetStateAction<"image" | "video" | "audio" | "document">>;
  getMedia: (type: "image" | "video" | "audio" | "document") => Message[];
  handleBlock: (id: string) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>; // Added this prop
}

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
  getMedia,
  handleBlock,
  handleDelete,
  setSelectedCustomer, // Added to destructured props
}) => {
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
              <h3 className="font-medium text-gray-900 dark:text-white">
                Info
              </h3>
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
                {isEditingInfo ? "Save" : "Edit"}
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
              <div className="grid grid-cols-3 gap-2">
                {getMedia("image")
                  .slice(0, 4)
                  .map((m) => (
                    <img
                      key={m.id}
                      src={m.content}
                      alt="Image"
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
              </div>
            </div>
          </div>
          <hr className="my-4 border-gray-200 dark:border-gray-700" />
          <div className="space-y-2">
            <button
              onClick={() => handleBlock(selectedCustomer.id)}
              className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {selectedCustomer.isBlocked ? "Unblock contact" : "Block contact"}
            </button>
            <button
              onClick={() => handleDelete(selectedCustomer.id)}
              className="w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
            {["image", "video", "audio", "document"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setSelectedMediaType(type as "image" | "video" | "audio" | "document")
                }
                className={`px-2 py-1 rounded-lg ${
                  selectedMediaType === type
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s
              </button>
            ))}
          </div>
          <div className="space-y-4">
            {selectedMediaType === "image" && (
              <div className="grid grid-cols-3 gap-2">
                {getMedia("image").map((m) => (
                  <img
                    key={m.id}
                    src={m.content}
                    alt="Image"
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            )}
            {selectedMediaType === "video" && (
              <div className="grid grid-cols-3 gap-2">
                {getMedia("video").map((m) => (
                  <video
                    key={m.id}
                    src={m.content}
                    className="w-full h-32 object-cover rounded"
                    controls
                  />
                ))}
              </div>
            )}
            {selectedMediaType === "audio" && (
              <div className="space-y-2">
                {getMedia("audio").map((m) => (
                  <div key={m.id}>
                    <audio src={m.content} controls className="w-full" />
                  </div>
                ))}
              </div>
            )}
            {selectedMediaType === "document" && (
              <div className="space-y-2">
                {getMedia("document").map((m) => (
                  <a
                    key={m.id}
                    href={m.content}
                    className="block text-blue-500 dark:text-blue-400 mb-1"
                  >
                    {m.content}
                  </a>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default CustomerProfile;