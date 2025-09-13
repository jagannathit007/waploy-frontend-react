import { apiCall } from './auth';

interface WhatsAppMessageResponse {
  success: boolean;
  message: string;
  messageId?: string;
  storeResult?: any;
}

interface WhatsAppStatusResponse {
  success: boolean;
  data: {
    companyId: string;
    name: string;
    sessionInfo: any;
    whatsappStatus: string;
    qrCode: string;
  };
}

export const sendWhatsAppMessage = async (
  companyId: string,
  phoneNumber: string,
  message: string,
  customerId: string,
  userId: string,
  isPrivate: boolean = false,
  token: string
): Promise<WhatsAppMessageResponse> => {
  try {
    const requestBody = {
      phoneNumber,
      message,
      customerId,
      userId,
      isPrivate
    };
    
    console.log('Sending WhatsApp message with:', requestBody);
    
    const response = await apiCall(
      `/whatsapp/${companyId}/send-message`,
      {
        method: 'POST',
        body: JSON.stringify(requestBody)
      },
      token
    );
    
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};

export const sendWhatsAppMedia = async (
  companyId: string,
  phoneNumber: string,
  file: File,
  mediaType: string,
  caption: string = '',
  token: string
): Promise<WhatsAppMessageResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('phoneNumber', phoneNumber);
    formData.append('mediaType', mediaType);
    formData.append('caption', caption);

    const response = await fetch(`${import.meta.env.VITE_API_BASE}/whatsapp/${companyId}/send-media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Network error" }));
      throw new Error(errorData.message || "Failed to send media");
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending WhatsApp media:', error);
    throw error;
  }
};

export const getWhatsAppStatus = async (
  companyId: string,
  token: string
): Promise<WhatsAppStatusResponse> => {
  try {
    const response = await apiCall(
      `/whatsapp/${companyId}/status`,
      {
        method: 'GET'
      },
      token
    );
    
    return response;
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    throw error;
  }
};

export const connectWhatsApp = async (
  companyId: string,
  token: string
): Promise<any> => {
  try {
    const response = await apiCall(
      `/whatsapp/${companyId}/connect`,
      {
        method: 'POST'
      },
      token
    );
    
    return response;
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    throw error;
  }
};

export const getQRCode = async (
  companyId: string,
  token: string
): Promise<any> => {
  try {
    const response = await apiCall(
      `/whatsapp/${companyId}/qrcode`,
      {
        method: 'GET'
      },
      token
    );
    
    return response;
  } catch (error) {
    console.error('Error getting QR code:', error);
    throw error;
  }
};

export const getChats = async (
  customerId: string,
  token: string,
  page: number = 1,
  limit: number = 50,
  sort: number = -1
): Promise<any> => {
  try {
    const response = await apiCall(
      '/get-chats',
      {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          page,
          limit,
          sort
        })
      },
      token
    );
    
    return response;
  } catch (error) {
    console.error('Error getting chats:', error);
    throw error;
  }
};

export const searchChats = async (
  customerId: string,
  searchQuery: string,
  token: string
): Promise<any> => {
  try {
    const response = await apiCall(
      '/search-chats',
      {
        method: 'POST',
        body: JSON.stringify({
          customerId,
          search: searchQuery
        })
      },
      token
    );
    
    return response;
  } catch (error) {
    console.error('Error searching chats:', error);
    throw error;
  }
};