// src/services/api/auth.ts (New file)
// Assuming your backend API base URL is proxied (e.g., via Vite proxy to http://localhost:5000)
// If not, replace API_BASE with 'http://localhost:5000'
// const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = "http://localhost:3100/api/web";

interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

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
      .catch(() => ({ success: false, message: "Network error" }));
    throw new Error(errorData.message || "Sign in failed");
  }

  const data: ApiResponse<string> = await response.json();

  if (data.status != 200 || !data.data) {
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
      .catch(() => ({ success: false, message: "Network error" }));
    throw new Error(errorData.message || "Sign up failed");
  }

  const data: ApiResponse<string> = await response.json();
  if (!data.success || !data.data) {
    throw new Error(data.message || "Sign up failed");
  }
  return data;
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
      .catch(() => ({ success: false, message: "Request failed" }));
    throw new Error(errorData.message || "Request failed");
  }
  return response.json();
};
