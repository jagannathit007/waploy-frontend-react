import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE;

interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const signIn = async (
  email: string,
  password: string
): Promise<ApiResponse<string>> => {
  const response = await fetch(`${API_BASE}/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData: ApiResponse<null> = await response
      .json()
      .catch(() => ({ status: 500, message: "Network error" }));
    throw new Error(errorData.message || "Sign in failed");
  }

  const data: ApiResponse<string> = await response.json();

  if (data.status !== 200 || !data.data) {
    throw new Error(data.message || "Sign in failed");
  }
  return data;
};

export const signUp = async (
  firstName: string,
  lastName: string,
  phone: string,
  email: string,
  password: string,
  companyName: string
): Promise<ApiResponse<string>> => {
  const response = await fetch(`${API_BASE}/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName,
      lastName,
      phone,
      email,
      password,
      companyName,
    }),
  });

  if (!response.ok) {
    const errorData: ApiResponse<null> = await response
      .json()
      .catch(() => ({ status: 500, message: "Network error" }));
    throw new Error(errorData.message || "Sign up failed");
  }

  const data: ApiResponse<string> = await response.json();
  if (data.status !== 200 || !data.data) {
    throw new Error(data.message || "Sign up failed");
  }
  return data;
};

export const sendOTP = async (
  data: { mobileNo: string; name: string }
): Promise<ApiResponse<number>> => {
  try {
    const response = await api.post('/sendotp', data);
    if (response.data.status !== 200 || response.data.data !== 1) {
      throw new Error(response.data.message || 'Failed to send OTP');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send OTP');
  }
};

export const verifyOTP = async (
  data: { mobileNo: string; otpCode: string }
): Promise<ApiResponse<number>> => {
  try {
    const response = await api.post('/verifyotp', data);
    if (response.data.status !== 200 || response.data.data !== 1) {
      throw new Error(response.data.message || 'Failed to verify OTP');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to verify OTP');
  }
};

export const getProfile = async (token: string): Promise<ApiResponse<any>> => {
  return await apiCall('/get-profile', { method: 'POST' }, token);
};

// Helper function to include token in future API calls (for protected endpoints)
export const apiCall = async (
  url: string,
  options: RequestInit = {},
  token?: string
) => {
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!response.ok) {
    const errorData: ApiResponse<null> = await response
      .json()
      .catch(() => ({ status: 500, message: "Request failed" }));
    throw new Error(errorData.message || "Request failed");
  }
  return response.json();
};