import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import CustomerList from './CustomerList';
import { sendWhatsAppMessage, sendWhatsAppMedia, getChats, searchChats } from '../../services/api/whatsappService';
import { useAuth } from '../../context/AuthContext';
import { useSocketEvents } from '../../hooks/useSocketEvents';
import CustomerProfile from "./CustomerProfile";
import SelectedCustomerHeader from "./SelectedCustomerHeader"; // Add this import
import AudioMessage from '../medias/AudioMessage';
import ImageMessage from '../medias/ImageMessage';
import VideoMessage from '../medias/VideoMessage';
import DocumentMessage from '../medias/DocumentMessage';
import TextMessage from '../medias/TextMessage';

interface Label {
  _id: string;
  name: string;
  description?: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  countryCode?: string;
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

const dummyChats: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      from: "them",
      type: "text",
      content: "Hello!",
      time: "10:30 AM",
    },
    {
      id: "m2",
      from: "me",
      type: "text",
      content: "Hi John!",
      time: "10:32 AM",
    },
    {
      id: "m3",
      from: "them",
      type: "image",
      content: "https://via.placeholder.com/200?text=Image",
      time: "10:35 AM",
    },
    {
      id: "m4",
      from: "me",
      type: "video",
      content: "https://via.placeholder.com/200?text=Video",
      time: "10:40 AM",
    },
    {
      id: "m5",
      from: "them",
      type: "document",
      content: "Document.pdf",
      time: "10:42 AM",
    },
    {
      id: "m6",
      from: "me",
      type: "audio",
      content: "Audio.mp3",
      time: "10:45 AM",
    },
    {
      id: "m7",
      from: "them",
      type: "contact",
      content: "Contact: Bob",
      time: "10:50 AM",
    },
  ],
  "2": [
    {
      id: "m1",
      from: "them",
      type: "text",
      content: "Good morning!",
      time: "9:00 AM",
    },
  ],
  "3": [
    {
      id: "m1",
      from: "them",
      type: "text",
      content: "Update on project",
      time: "Yesterday",
    },
  ],
};

const starredMessages: StarredMessage[] = [
  { id: 1, content: "Message 1" },
  { id: 2, content: "Message 2" },
];

const Chats = () => {
  const { token, profile } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    countryCode: "",
    phone: "",
    email: "",
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showAllStarred, setShowAllStarred] = useState(false);
  const [showAllMedia, setShowAllMedia] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState<
    "image" | "video" | "audio" | "document"
  >("image");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1); // Track pagination page
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Track loading state for more data
  const [scrollReference, setScrollReference] = useState<{ messageId: string, offset: number } | null>(null); // Track scroll reference
  const [showMediaOptions, setShowMediaOptions] = useState(false); // Track media options visibility
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showVoiceRecordingUI, setShowVoiceRecordingUI] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState<number | null>(null);
  const [refreshTimeout, setRefreshTimeout] = useState<number | null>(null);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Debounced refresh function to avoid multiple rapid API calls
  const debouncedRefreshChat = (customerId: string) => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    const timeout = setTimeout(() => {
      console.log('🔄 Executing debounced chat refresh...');
      loadChatMessages(customerId, 1, true);
      setRefresh(prev => prev + 1);
    }, 500); // 500ms delay
    
    setRefreshTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refreshTimeout]);

  // Socket functionality for real-time messaging
  const { socket, isConnected, sendToCompany } = useSocketEvents({
    onCompanyMessage: (message) => {
      console.log('📨 Received real-time message in chat:', message);
      
      // Handle incoming messages - refresh chat instead of parsing content
      if (message && typeof message === 'object') {
        // Handle different message formats from backend
        if (message.type === 'incomming-message' || message.type === 'incoming-message') {
          console.log('🔄 Incoming message detected, refreshing chat...');
          
          // Extract phone number to check if it matches selected customer
          const phoneMatch = message.content?.match(/(\d{10,})/);
          const phoneNumber = phoneMatch ? phoneMatch[1] : null;
          
          if (phoneNumber && selectedCustomer) {
            // Normalize phone numbers for comparison
            const normalizePhone = (phone: string) => {
              return phone.replace(/[\s\-\+\(\)]/g, '').replace(/^91/, '');
            };
            
            const normalizedIncomingPhone = normalizePhone(phoneNumber);
            const normalizedSelectedPhone = normalizePhone(selectedCustomer.phone);
            
            console.log('📞 Checking phone match:', {
              incoming: normalizedIncomingPhone,
              selected: normalizedSelectedPhone
            });
            
            // If phone numbers match, refresh the chat
            if (normalizedSelectedPhone.includes(normalizedIncomingPhone) || 
                normalizedIncomingPhone.includes(normalizedSelectedPhone)) {
              console.log('✅ Phone match found, scheduling chat refresh...');
              
              // Use debounced refresh to avoid multiple rapid API calls
              debouncedRefreshChat(selectedCustomer.id);
              
              console.log('✅ Chat refresh scheduled');
            } else {
              console.log('❌ Phone does not match selected customer');
            }
          } else {
            console.log('❌ No phone number found or no customer selected');
          }
        } else if (message.customerId) {
          // Handle messages with customerId field
          if (selectedCustomer && message.customerId === selectedCustomer.id) {
            console.log('🔄 Customer-specific message detected, scheduling chat refresh...');
            debouncedRefreshChat(selectedCustomer.id);
          }
        } else {
          console.log('📨 Received other type of company message:', message);
        }
      }
    },
    onGlobalMessage: (message) => {
      console.log('📨 Received global message in chat:', message);
      // Handle global messages if needed
    },
    onPrivateStatusChange: (status) => {
      console.log('🔒 Private status changed in chat:', status);
      // Handle privacy status changes if needed
    },
    onCustomerAdded: (customer) => {
      console.log('👤 Customer added event received in Chats:', customer);
      // Toast is handled globally, no need to show it here
    }
  });

  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Fetch labels when component mounts
  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE}/get-active-labels`,
          { page: 1, limit: 100 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.data.status === 200 && response.data.data) {
          setLabels(response.data.data.docs || []);
        }
      } catch (error) {
        console.error("Error fetching labels:", error);
        Toast.fire({ icon: "error", title: "Failed to fetch labels" });
      }
    };
    fetchLabels();
  }, []);

  // Update selectedLabels when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer?.labels) {
      setSelectedLabels(selectedCustomer.labels.map((label:any) => label._id));
    } else {
      setSelectedLabels([]);
    }
  }, [selectedCustomer]);

  const handleAssignLabels = async () => {
    if (!selectedCustomer) return;
    setIsEditingInfo(false); // Exit edit mode
    try {
      const token = localStorage.getItem('token');

      // Update customer name
      const nameResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE}/update-customer-name`,
        { customerId: selectedCustomer.id, name: selectedCustomer.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update labels
      const labelResponse = await axios.post(
        `${import.meta.env.VITE_API_BASE}/assign-label-to-customer`,
        { customerId: selectedCustomer.id, labelIds: selectedLabels },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (nameResponse.data.status === 200 && labelResponse.data.status === 200) {
        const updatedCustomer = nameResponse.data.data.customer;
        const updatedLabels = labelResponse.data.data.labels || [];
        setCustomers(
          customers.map((c) =>
            c.id === selectedCustomer.id
              ? {
                  ...c,
                  name: updatedCustomer.name,
                  email: updatedCustomer.email,
                  phone: updatedCustomer.phone,
                  labels: updatedLabels,
                }
              : c
          )
        );
        setSelectedCustomer({
          ...selectedCustomer,
          name: updatedCustomer.name,
          email: updatedCustomer.email,
          phone: updatedCustomer.phone,
          labels: updatedLabels,
        });
        Toast.fire({ icon: 'success', title: 'Customer details and labels updated successfully' });
      } else {
        throw new Error('Failed to update customer details or labels');
      }
    } catch (error: any) {
      console.error('Update customer error:', error);
      Toast.fire({ icon: 'error', title: error.message || 'Failed to update customer details' });
    }
  };

  const getInitials = (name: string): string => {
    // Handle empty or invalid name
    if (!name || name.trim() === "") {
      return "?";
    }
    const nameParts = name.trim().split(" ");
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return nameParts[0][0]?.toUpperCase() || "?";
  };

  const loadChatMessages = async (customerId: string, pageNum: number = 1, isInitialLoad: boolean = false) => {
    if (!token) return;

    try {
      const response = await getChats(customerId, token, pageNum, 20, -1); // page, limit, sort
      if (response.status === 200 && response.data) {
        const transformedMessages: Message[] = response.data.docs.map((msg: any) => {
          const fromValue = msg.from === profile?._id ? 'me' : 'them';

          // Determine message type and content
          let messageType = 'text';
          let messageContent = msg.content?.text || '';

          if (msg.content?.media && msg.content.media.length > 0) {
            const media = msg.content.media[0]; // Take first media item
            messageType = media.type || 'image';
            messageContent = media.url || '';
          }

          return {
            _id: msg._id,
            id: msg._id,
            from: fromValue,
            to: msg.to,
            type: messageType,
            content: messageContent,
            time: new Date(msg.createdAt).toLocaleTimeString(),
            createdAt: msg.createdAt,
            status: msg.status
          };
        });

        if (isInitialLoad) {
          // Initial load: replace messages and scroll to bottom
          setMessages(transformedMessages.reverse());
          setScrollReference(null); // Clear reference for initial load
        } else {
          // Loading more: prepend older messages and maintain reference position
          const container = messageContainerRef.current;
          if (container) {
            // Store current scroll position before updating
            const prevScrollTop = container.scrollTop;
            const prevScrollHeight = container.scrollHeight;

            // Prepend new older messages
            setMessages((prevMessages) => [...transformedMessages.reverse(), ...prevMessages]);

            // Restore scroll position using height difference
            requestAnimationFrame(() => {
              if (container) {
                const newScrollHeight = container.scrollHeight;
                const heightDifference = newScrollHeight - prevScrollHeight;
                const newScrollTop = prevScrollTop + heightDifference;
                container.scrollTop = newScrollTop;

                // Verify the scroll position was set correctly
                setTimeout(() => {
                  // Scroll position verification
                }, 100);
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
      if (isInitialLoad) {
        setMessages(dummyChats[customerId] || []);
      }
    }
  };

  const handleSearchChats = async (searchQuery: string) => {
    if (!token || !selectedCustomer || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await searchChats(selectedCustomer.id, searchQuery, token);
      if (response.status === 200 && response.data) {
        const transformedMessages: Message[] = response.data.map((msg: any) => {
          const fromValue = msg.from === profile?._id ? 'me' : 'them';

          // Determine message type and content
          let messageType = 'text';
          let messageContent = msg.content?.text || '';

          if (msg.content?.media && msg.content.media.length > 0) {
            const media = msg.content.media[0]; // Take first media item
            messageType = media.type || 'image';
            messageContent = media.url || '';
          }

          return {
            _id: msg._id,
            id: msg._id,
            from: fromValue,
            to: msg.to,
            type: messageType,
            content: messageContent,
            time: new Date(msg.createdAt).toLocaleTimeString(),
            createdAt: msg.createdAt,
            status: msg.status
          };
        });
        setSearchResults(transformedMessages.reverse());
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching chats:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };


  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (chatSearchQuery.trim()) {
        handleSearchChats(chatSearchQuery);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [chatSearchQuery]);

  // Close media options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMediaOptions) {
        const target = event.target as HTMLElement;
        if (!target.closest('.media-options-container')) {
          setShowMediaOptions(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMediaOptions]);

  // Scroll to bottom when messages change (only for initial load or new messages)
  useEffect(() => {
    if (messageContainerRef.current && !isLoadingMore && !scrollReference) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages, isLoadingMore, scrollReference]);

  // Handle socket connection status and customer selection
  useEffect(() => {
    if (selectedCustomer && isConnected) {
      console.log(`🔌 Socket connected for customer: ${selectedCustomer.name} (${selectedCustomer.id})`);
      console.log(`📡 Listening for real-time messages in company room: ${profile?.company?._id}`);
    } else if (selectedCustomer && !isConnected) {
      console.log(`❌ Socket disconnected - real-time messages unavailable for: ${selectedCustomer.name}`);
    }
  }, [selectedCustomer, isConnected, profile?.company?._id]);


  // Handle scroll to load more messages with reference tracking
  const handleScroll = () => {
    if (!messageContainerRef.current || !selectedCustomer || isLoadingMore) return;

    const container = messageContainerRef.current;
    const { scrollTop } = container;

    // Capture reference message when near top (within 50px) and no reference set yet
    if (scrollTop <= 50 && !scrollReference && messages.length > 0) {
      // Find the first visible message as reference
      const messageElements = container.querySelectorAll('[data-message-id]');
      if (messageElements.length > 0) {
        const firstVisibleMessage = messageElements[0] as HTMLElement;
        const messageId = firstVisibleMessage.getAttribute('data-message-id');

        if (messageId) {
          // Calculate offset from top of container
          const messageRect = firstVisibleMessage.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const offset = messageRect.top - containerRect.top + scrollTop;

          setScrollReference({ messageId, offset });
        }
      }
    }

    // Load more messages when at top
    if (scrollTop === 0 && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);

      loadChatMessages(selectedCustomer.id, nextPage, false).finally(() => {
        setIsLoadingMore(false);
      });
    }
  };

  const handleMediaSelect = async (mediaType: 'image' | 'video' | 'audio' | 'document') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = mediaType === 'image' ? 'image/*' :
      mediaType === 'video' ? 'video/*' :
        mediaType === 'audio' ? 'audio/*' :
          '.pdf,.doc,.docx,.txt,.xlsx,.xls';
    
    // Allow multiple selection for images
    if (mediaType === 'image') {
      input.multiple = true;
    }

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || !selectedCustomer || !token || !profile?.company?._id || !profile?._id) {
        return;
      }

      // Convert FileList to Array
      const fileArray = Array.from(files);
      
      setIsSendingMessage(true);

      try {
        // Process multiple files for images, single file for others
        if (mediaType === 'image' && fileArray.length > 1) {
          // Handle multiple images
          for (let i = 0; i < fileArray.length; i++) {
            const file = fileArray[i];
            
            // Create a temporary message for each image
            const tempMessage: Message = {
              id: `${Date.now()}-${i}`,
              from: 'me',
              type: mediaType,
              content: file.name,
              time: new Date().toLocaleTimeString(),
            };

            // Add temporary message to UI
            setMessages(prev => [...prev, tempMessage]);

            // Send each image
            const response = await sendWhatsAppMedia(
              profile.company._id,
              selectedCustomer.phone,
              file,
              mediaType,
              '', // caption
              selectedCustomer.id,
              profile._id,
              false,
              token
            );

            if (!response.success) {
              // Remove temporary message on failure
              setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
              console.error(`Failed to send image ${file.name}:`, response.message);
            }
          }

          // Show success message for multiple images
          Toast.fire({
            icon: 'success',
            title: `${fileArray.length} images sent successfully!`
          });

          // Reload messages to get the actual sent messages
          await loadChatMessages(selectedCustomer.id, 1, true);
        } else {
          // Handle single file (or first file if multiple selected for non-image types)
          const file = fileArray[0];
          
          // Create a temporary message to show in UI
          const tempMessage: Message = {
            id: Date.now().toString(),
            from: 'me',
            type: mediaType,
            content: file.name,
            time: new Date().toLocaleTimeString(),
          };

          // Add temporary message to UI
          setMessages(prev => [...prev, tempMessage]);

          // Send media through API
          const response = await sendWhatsAppMedia(
            profile.company._id,
            selectedCustomer.phone,
            file,
            mediaType,
            '', // caption
            selectedCustomer.id,
            profile._id,
            false,
            token
          );

          if (response.success) {
            Toast.fire({
              icon: 'success',
              title: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} sent successfully!`
            });

            // Reload messages to get the actual sent message
            await loadChatMessages(selectedCustomer.id, 1, true);
          } else {
            // Remove temporary message on failure
            setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));

            Toast.fire({
              icon: 'error',
              title: response.message || `Failed to send ${mediaType}`
            });
          }
        }
      } catch (error) {
        console.error('Error sending media:', error);

        Toast.fire({
          icon: 'error',
          title: `Failed to send ${mediaType}. Please try again.`
        });
      } finally {
        setIsSendingMessage(false);
      }
    };

    input.click();
    setShowMediaOptions(false);
  };
  const handleSelectCustomer = async (customer: Customer) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/get-customer-by-id`,
        { customerId: customer.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 200 && response.data.data) {
        const customerData = response.data.data;
        const updatedCustomer = {
          id: customerData._id,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          labels: customerData.labels || [],
          lastMessage: customerData.lastChat || '',
          lastTime: customerData.lastChatAt
            ? new Date(customerData.lastChatAt).toLocaleTimeString()
            : '',
          unread: customer.unread || 0,
          pinned: customer.pinned || false,
          isBlocked: customer.isBlocked || false,
        };
        setSelectedCustomer(updatedCustomer);
        
        // Reset pagination state for new customer
        setPage(1);
        setScrollReference(null);
        
        // Load chat messages for the selected customer
        await loadChatMessages(customer.id, 1, true);
      } else {
        throw new Error('Failed to fetch customer details');
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      Toast.fire({ icon: 'error', title: 'Failed to fetch customer details' });
      // Fallback to basic customer data
      setSelectedCustomer(customer);
      // Reset pagination state for new customer
      setPage(1);
      setScrollReference(null);
      // Still try to load chat messages even with fallback data
      await loadChatMessages(customer.id, 1, true);
    }
  };

  const handleAssignmentComplete = () => {
    Toast.fire({
      icon: 'success',
      title: 'Chat assignment completed successfully!',
    });
  };

  const handlePin = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const customer = customers.find((c) => c.id === id);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE}/update-customer/${id}`,
        { pinned: !customer?.pinned },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCustomers(
          customers.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
        );
        Toast.fire({
          icon: "success",
          title: `Customer ${customer?.pinned ? "unpinned" : "pinned"}`,
        });
      }
    } catch (error) {
      console.error("Error pinning customer:", error);
      Toast.fire({ icon: "error", title: "Failed to pin customer" });
    }
  };

  const handleBlock = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const customer = customers.find((c) => c.id === id);
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE}/update-customer/${id}`,
        { isBlocked: !customer?.isBlocked },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.success) {
        setCustomers(
          customers.map((c) =>
            c.id === id ? { ...c, isBlocked: !c.isBlocked } : c
          )
        );
        Toast.fire({ icon: "success", title: "Customer block status updated" });
      }
    } catch (error) {
      console.error("Error blocking customer:", error);
      Toast.fire({ icon: "error", title: "Failed to update block status" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${import.meta.env.VITE_API_BASE}/delete-customer/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.data.success) {
        setCustomers(customers.filter((c) => c.id !== id));
        if (selectedCustomer?.id === id) setSelectedCustomer(null);
        Toast.fire({ icon: "success", title: "Customer deleted" });
        setRefresh((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      Toast.fire({ icon: "error", title: "Failed to delete customer" });
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/create-customer`,
        {
          name: form.name,
          phone: form.phone,
          countryCode: form.countryCode,
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.data !== null) {
        setShowAddForm(false);
        setForm({ name: "", countryCode: "", phone: "", email: "" });
        Toast.fire({ icon: "success", title: "Customer added" });
        setRefresh((prev) => prev + 1);
      }else {
        Toast.fire({ icon: 'error', title: response.data.message || 'Failed to add customer' });
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      Toast.fire({ icon: "error", title: "Failed to add customer" });
    }
  };


  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        setShowVoiceRecordingUI(false);
        setRecordingDuration(0);
        if (recordingTimer) {
          clearInterval(recordingTimer);
          setRecordingTimer(null);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setShowVoiceRecordingUI(true);
      setRecordingDuration(0);
      
      // Start timer for recording duration
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setRecordingTimer(timer as unknown as number);
      
      // Toast.fire({ icon: "info", title: "Recording started..." });
    } catch (error) {
      console.error('Error starting recording:', error);
      Toast.fire({ icon: "error", title: "Failed to start recording" });
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      setShowVoiceRecordingUI(false);
      setRecordingDuration(0);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      Toast.fire({ icon: "success", title: "Recording stopped" });
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      setShowVoiceRecordingUI(false);
      setRecordingDuration(0);
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!selectedCustomer || !token || !profile?.company?._id || !profile?._id) {
      return;
    }

    setIsSendingMessage(true);

    // Create a temporary message
    const tempMessage: Message = {
      id: Date.now().toString(),
      from: 'me',
      type: 'audio',
      content: 'Recording...',
      time: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, tempMessage]);

    try {

      // Send audio through API
      const response = await sendWhatsAppMedia(
        profile.company._id,
        selectedCustomer.phone,
        audioBlob as any, // Convert Blob to File-like object
        'audio',
        '', // caption
        selectedCustomer.id, // customerId
        profile._id, // userId
        false, // isPrivate
        token
      );

      if (response.success) {
        Toast.fire({ icon: "success", title: "Audio sent successfully" });
        // Reload messages to get the actual sent message
        await loadChatMessages(selectedCustomer.id, 1, true);
      } else {
        Toast.fire({ icon: "error", title: "Failed to send audio" });
        // Remove temporary message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }
    } catch (error) {
      console.error('Error sending audio:', error);
      Toast.fire({ icon: "error", title: "Failed to send audio" });
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || !selectedCustomer || !token || !profile?.company?._id || !profile?._id) return;

    setIsSendingMessage(true);

    const newMsg: Message = {
      id: Date.now().toString(),
      from: 'me',
      type: 'text',
      content: newMessage,
      time: new Date().toLocaleTimeString(),
    };

    try {

      // Add message to UI immediately for better UX
      setMessages([...messages, newMsg]);
      setCustomers(customers.map((c) => (c.id === selectedCustomer?.id ? { ...c, lastMessage: newMessage, lastTime: newMsg.time } : c)));

      // Send message via socket for real-time communication
      if (isConnected && socket && profile?.company?._id) {
        const socketMessage = {
          type: 'chat_message',
          customerId: selectedCustomer.id,
          customerName: selectedCustomer.name,
          customerPhone: selectedCustomer.phone,
          message: {
            id: newMsg.id,
            content: newMessage,
            type: 'text',
            from: profile._id,
            fromName: profile?.profile?.firstName || 'User',
            timestamp: new Date().toISOString(),
            status: 'sending'
          }
        };
        
        sendToCompany(profile.company._id, socketMessage);
        console.log('📤 Sent message via socket:', socketMessage);
      }

      const phoneNumber = selectedCustomer.phone;

      const response = await sendWhatsAppMessage(
        profile.company._id,
        phoneNumber,
        newMessage,
        selectedCustomer.id,
        profile._id,
        false,
        token
      );

      if (response.success) {
        // Update message status to sent
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'sent' }
              : msg
          )
        );
        
        if (selectedCustomer) {
          await loadChatMessages(selectedCustomer.id, 1, true);
        }
      } else {
        // Update message status to failed
        setMessages(prev => 
          prev.map(msg => 
            msg.id === newMsg.id 
              ? { ...msg, status: 'failed' }
              : msg
          )
        );
        
        Toast.fire({
          icon: 'error',
          title: response.message || 'Failed to send message',
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMsg.id 
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
      
      Toast.fire({
        icon: 'error',
        title: 'Failed to send message. Please try again.',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const renderMessage = (msg: Message) => {
    const isMe = msg.from === 'me' || msg.from === profile?._id;
    const messageContent = msg.content;

    let content;

    switch (msg.type) {
      case 'image':
        content = (
          <ImageMessage
            content={messageContent}
            time={msg.time}
            isMe={isMe}
            status={msg.status}
            createdAt={msg.createdAt}
          />
        );
        break;
      case 'video':
        content = (
          <VideoMessage
            content={messageContent}
            time={msg.time}
            isMe={isMe}
            status={msg.status}
            createdAt={msg.createdAt}
          />
        );
        break;
      case 'audio':
        content = (
          <AudioMessage
            content={messageContent}
            time={msg.time}
            isMe={isMe}
            status={msg.status}
            messageId={msg.id}
            createdAt={msg.createdAt}
          />
        );
        break;
      case 'document':
        content = (
          <DocumentMessage
            content={messageContent}
            time={msg.time}
            isMe={isMe}
            status={msg.status}
            createdAt={msg.createdAt}
          />
        );
        break;
      case 'contact':
        content = <div className="bg-gray-100 p-2 rounded">{messageContent}</div>;
        break;
      default:
        content = (
          <TextMessage
            content={messageContent}
            time={msg.time}
            isMe={isMe}
            status={msg.status}
            createdAt={msg.createdAt}
          />
        );
    }

    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`} data-message-id={msg._id || msg.id}>
        <div className={`relative ${msg.type === 'image' || msg.type === 'video' ? 'max-w-xs p-1' : msg.type === 'document' ? 'max-w-sm p-1 overflow-hidden' : 'max-w-md px-3 py-2'} rounded-lg ${isMe ? 'bg-green-500' : 'bg-gray-600'} ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'} ${msg.type === 'image' || msg.type === 'video' || msg.type === 'document' ? '' : 'overflow-wrap-anywhere'}`}>
          {isMe ? (
            <svg
              className="absolute top-0 right-[-5px] w-3 h-3 text-green-500 transform rotate-90"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0L6 6L0 12V0Z" fill="currentColor" />
            </svg>
          ) : (
            <svg
              className="absolute top-0 left-[-5px] w-3 h-3 text-gray-600 transform rotate-90"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0L6 6L0 12V0Z" fill="currentColor" />
            </svg>
          )}

          <div className="flex items-end justify-end">
            {content}
          </div>
        </div>
      </div>
    );
  };

const getMedia = (type: "image" | "video" | "audio" | "document") =>
    messages.filter((m) => m.type === type);


  return (
    <div className="flex max-h-[calc(100vh-77px)] overflow-hidden bg-gray-100 dark:bg-gray-900">
      <CustomerList
        customers={customers}
        setCustomers={setCustomers}
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        selectedCustomer={selectedCustomer}
        handleSelectCustomer={handleSelectCustomer}
        handlePin={handlePin}
        onOpenAddForm={() => setShowAddForm(true)}
        refresh={refresh}
      />

      <div className="w-3/4 flex flex-col">
        {selectedCustomer?.id ? (
          <>
            <SelectedCustomerHeader
              selectedCustomer={selectedCustomer}
              getInitials={getInitials}
              setShowProfileModal={setShowProfileModal}
              setShowSearchModal={setShowSearchModal}
              handleAssignmentComplete={handleAssignmentComplete}
            />
            <div 
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
              onScroll={handleScroll}
            >
              {messages.map((msg, index) => (
                <div key={msg._id || msg.id || index} data-message-id={msg._id || msg.id}>
                  {renderMessage(msg)}
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex relative">
              {/* Plus Icon for Media */}
              <div className="relative media-options-container">
                <button
                  type="button"
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                {/* Media Options Dropdown */}
                {showMediaOptions && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-10 w-48">
                    <div className="flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={() => handleMediaSelect('image')}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Image</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMediaSelect('video')}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="font-medium">Video</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMediaSelect('audio')}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span className="font-medium">Audio File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMediaSelect('document')}
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium">Document</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-l-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-0 custom-caret"
                disabled={isSendingMessage}
              />
              
              {/* Show microphone by default, send button only when text is typed */}
              {newMessage.trim() ? (
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-r-lg flex items-center ${isSendingMessage
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  disabled={isSendingMessage || !newMessage.trim()}
                >
                  {isSendingMessage ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <g transform="rotate(45 12 12)">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </g>
                      </svg>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={isRecording ? stopAudioRecording : startAudioRecording}
                  className={`p-2 rounded-r-lg ${isRecording 
                    ? 'text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  disabled={isSendingMessage}
                >
                  {isRecording ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>
              )}
            </form>

            {/* Voice Recording UI */}
            {showVoiceRecordingUI && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center justify-between bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                  {/* Left side - Delete button and recording indicator */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={cancelRecording}
                      className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    {/* Recording indicator */}
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    
                    {/* Duration */}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatDuration(recordingDuration)}
                    </span>
                  </div>

                  {/* Middle - Waveform visualization */}
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center space-x-1">
                      {[...Array(20)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 20 + 8}px`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Right side - Controls */}
                  <div className="flex items-center space-x-2">
                    {/* Pause button */}
                    <button
                      onClick={isRecording ? stopAudioRecording : startAudioRecording}
                      className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {isRecording ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      )}
                    </button>

                    {/* Send button */}
                    <button
                      onClick={stopAudioRecording}
                      className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-full"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2 dark:text-white">Select a chat</h2>
              <p className="text-gray-600">
                Choose a customer to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-50 overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800 transform transition-all duration-300 scale-100">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 dark:bg-emerald-800/20 rounded-xl mr-3">
                    <svg
                      className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Add New Customer
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Create a new customer profile
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors duration-200"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleAddCustomer} className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Country Code *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    +
                  </span>
                  <input
                    type="text"
                    placeholder="91"
                    value={form.countryCode}
                    onChange={(e) =>
                      setForm({ ...form, countryCode: e.target.value })
                    }
                    className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 border border-transparent rounded-xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm flex items-center"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && selectedCustomer?.id && (
        <div
          className="fixed inset-0 bg-[#47546782] bg-opacity-30 z-50"
          onClick={() => setShowProfileModal(false)}
        >
          <div
            className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showAllStarred
                  ? "Starred Messages"
                  : showAllMedia
                  ? "Media, docs and links"
                  : "Contact Info"}
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <CustomerProfile
              selectedCustomer={selectedCustomer}
              getInitials={getInitials}
              isEditingInfo={isEditingInfo}
              setIsEditingInfo={setIsEditingInfo}
              handleAssignLabels={handleAssignLabels}
              selectedLabels={selectedLabels}
              setSelectedLabels={setSelectedLabels}
              labels={labels}
              starredMessages={starredMessages}
              showAllStarred={showAllStarred}
              setShowAllStarred={setShowAllStarred}
              showAllMedia={showAllMedia}
              setShowAllMedia={setShowAllMedia}
              selectedMediaType={selectedMediaType}
              setSelectedMediaType={setSelectedMediaType}
              // getMedia={getMedia}
              handleBlock={handleBlock}
              handleDelete={handleDelete}
              setSelectedCustomer={setSelectedCustomer}
            />
          </div>
        </div>
      )}

      {showSearchModal && selectedCustomer?.id && (
        <div className="fixed inset-0 bg-[#47546782] bg-opacity-30 z-50" onClick={() => setShowSearchModal(false)}>
          <div className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Search Messages</h2>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                placeholder="Search in chat..."
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                className="w-full p-2 border rounded-lg mb-4 dark:bg-gray-800 dark:text-white dark:border-gray-600"
              />
              <div className="space-y-4 bg-green-50 p-4 rounded-lg min-h-[400px] relative">
                {isSearching ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Searching...</span>
                  </div>
                ) : chatSearchQuery && searchResults.length > 0 ? (
                  searchResults.map((msg) => renderMessage(msg))
                ) : chatSearchQuery ? (
                  <div className="flex justify-center items-center py-8">
                    <p className="text-sm text-gray-600 dark:text-gray-400">No messages found.</p>
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-8">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Type to search messages.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Chats;
