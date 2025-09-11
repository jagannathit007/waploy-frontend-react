const API_BASE = "https://waploy.itfuturz.in/api/web";

import axios, { AxiosResponse } from 'axios';

interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
}

interface Team {
  _id: string;
  name: string;
  description: string;
  teamMembers: string[];
  extraDetails: Record<string, any>;
  isActive: boolean;
}

interface TeamMember {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  teamId?: string;
  isActive: boolean;
}

interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createTeam = async (
  token: string,
  data: { name: string; description: string; teamMembers?: string[]; extraDetails?: Record<string, any> }
): Promise<ApiResponse<Team>> => {
  try {
    const response: AxiosResponse<ApiResponse<Team>> = await api.post('/create-team', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create team');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create team');
  }
};

export const getTeams = async (
  token: string,
  data: { search?: string; page?: number; limit?: number }
): Promise<ApiResponse<PaginatedResponse<Team>>> => {
  try {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<Team>>> = await api.post('/get-teams', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch teams');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch teams');
  }
};

export const getTeamById = async (
  token: string,
  id: string
): Promise<ApiResponse<Team>> => {
  try {
    const response: AxiosResponse<ApiResponse<Team>> = await api.post('/get-team', { id }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch team');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch team');
  }
};

export const updateTeam = async (
  token: string,
  data: { id: string; name?: string; description?: string; teamMembers?: string[]; extraDetails?: Record<string, any> }
): Promise<ApiResponse<Team>> => {
  try {
    const response: AxiosResponse<ApiResponse<Team>> = await api.post('/update-team', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update team');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update team');
  }
};

export const deleteTeam = async (
  token: string,
  id: string
): Promise<ApiResponse<boolean>> => {
  try {
    const response: AxiosResponse<ApiResponse<boolean>> = await api.post('/delete-team', { id }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to delete team');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to delete team');
  }
};

export const createTeamMember = async (
  token: string,
  data: { firstName: string; lastName: string; email: string; password?: string; teamId?: string }
): Promise<ApiResponse<TeamMember>> => {
  try {
    const response: AxiosResponse<ApiResponse<TeamMember>> = await api.post('/create-team-member', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create team member');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create team member');
  }
};

export const updateTeamMember = async (
  token: string,
  data: { _id: string; firstName?: string; lastName?: string; email?: string; teamId?: string }
): Promise<ApiResponse<TeamMember>> => {
  try {
    const response: AxiosResponse<ApiResponse<TeamMember>> = await api.post('/update-team-member', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to update team member');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update team member');
  }
};

export const getTeamMembers = async (
  token: string,
  data: { search?: string; page?: number; limit?: number; teamId?: string; isActive?: boolean }
): Promise<ApiResponse<PaginatedResponse<TeamMember>>> => {
  try {
    const response: AxiosResponse<ApiResponse<PaginatedResponse<TeamMember>>> = await api.post('/get-team-member', data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch team members');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to fetch team members');
  }
};

export const toggleActivationTeamMember = async (
  token: string,
  id: string,
  value: boolean
): Promise<ApiResponse<boolean>> => {
  try {
    const response: AxiosResponse<ApiResponse<boolean>> = await api.post('/toggle-activation-team-member', { id, value }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.data.status !== 200 || !response.data.data) {
      throw new Error(response.data.message || 'Failed to toggle team member activation');
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to toggle team member activation');
  }
};