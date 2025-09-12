import React, { useState, useEffect } from 'react';
import axios, { AxiosResponse } from 'axios';
import Swal from 'sweetalert2';

// const API_BASE = "https://waploy.itfuturz.in/api/web";
const API_BASE = import.meta.env.VITE_API_BASE;


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
  isActive: boolean;
}

interface TeamMember {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  teamId?: any;
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

const TeamMembers: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  // const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ id: '', name: '', description: '', teamMembers: [] as string[] });
  const [memberForm, setMemberForm] = useState({ _id: '', firstName: '', lastName: '', email: '', teamId: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token') || '';

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

  const createTeam = async (
    data: { name: string; description: string; teamMembers?: string[] }
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

  const getTeams = async (
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

  const updateTeam = async (
    data: { id: string; name?: string; description?: string; teamMembers?: string[] }
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

  const deleteTeam = async (
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

  const createTeamMember = async (
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

  const updateTeamMember = async (
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

  const getTeamMembers = async (
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

  const toggleActivationTeamMember = async (
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

  useEffect(() => {
    fetchTeams();
    fetchTeamMembers();
  }, [search, page]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await getTeams({ search, page, limit: 10 });
      setTeams(response.data?.docs || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to fetch teams',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await getTeamMembers({ search, page, limit: 10, isActive: true });
      setTeamMembers(response.data?.docs || []);
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to fetch team members',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (teamForm.id) {
        await updateTeam(teamForm);
        Toast.fire({
          icon: 'success',
          title: 'Team updated successfully!',
        });
      } else {
        await createTeam({ name: teamForm.name, description: teamForm.description, teamMembers: teamForm.teamMembers });
        Toast.fire({
          icon: 'success',
          title: 'Team created successfully!',
        });
      }
      setTeamForm({ id: '', name: '', description: '', teamMembers: [] });
      setShowTeamForm(false);
      fetchTeams();
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to save team',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (memberForm._id) {
        await updateTeamMember(memberForm);
        Toast.fire({
          icon: 'success',
          title: 'Team member updated successfully!',
        });
      } else {
        await createTeamMember({ ...memberForm, password: 'defaultPassword' });
        Toast.fire({
          icon: 'success',
          title: 'Team member created successfully!',
        });
      }
      setMemberForm({ _id: '', firstName: '', lastName: '', email: '', teamId: '' });
      setShowMemberForm(false);
      fetchTeamMembers();
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to save team member',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    setLoading(true);
    try {
      await deleteTeam(id);
      Toast.fire({
        icon: 'success',
        title: 'Team deleted successfully!',
      });
      fetchTeams();
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to delete team',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivation = async (id: string, value: boolean) => {
    setLoading(true);
    try {
      await toggleActivationTeamMember(id, value);
      Toast.fire({
        icon: 'success',
        title: `Team member ${value ? 'activated' : 'deactivated'} successfully!`,
      });
      fetchTeamMembers();
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to toggle activation',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setTeamForm({ id: team._id, name: team.name, description: team.description, teamMembers: team.teamMembers });
    setShowTeamForm(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setMemberForm({ _id: member._id, firstName: member.profile.firstName, lastName: member.profile.lastName, email: member.email, teamId: member.teamId || '' });
    setShowMemberForm(true);
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 space-y-6">
        {/* Header and Search */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Team Management</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage your teams and team members efficiently</p>
          </div>
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search teams or members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
            />
          </div>
        </div>

        {/* Teams and Team Members Sections */}
        <div className="grid grid-cols-12 gap-6">
          {/* Teams Section - 4/12 */}
          <div className="col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Teams</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your organization teams</p>
                </div>
                <button
                  onClick={() => setShowTeamForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Team
                </button>
              </div>
              
              <div className="overflow-hidden">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
                  </div>
                )}
                
                {!loading && teams.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No teams found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new team.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                          {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th> */}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Members</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-gray-800">
                        {teams.map((team) => (
                          <tr key={team._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {/* <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-800/20 flex items-center justify-center">
                                    <svg className="text-emerald-600 size-5 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                  </div>
                                </div> */}
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {team.name}
                                  </div>
                                  <p>{team.description}</p>
                                </div>
                              </div>
                            </td>
                            {/* <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{team.description}</td> */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400">
                                {team.teamMembers.length}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEditTeam(team)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                >
                                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(team._id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Members Section - 8/12 */}
          <div className="col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Members</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage individual team members</p>
                </div>
                <button
                  onClick={() => setShowMemberForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Member
                </button>
              </div>
              
              <div className="overflow-hidden">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
                  </div>
                )}
                
                {!loading && teamMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No team members found</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new team member.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Team</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-gray-800">
                        {teamMembers.map((member) => {
                          // const team = teams.find(t => t._id === member.teamId);
                          return (
                            <tr key={member._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-800/20 flex items-center justify-center">
                                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                        {member.profile.firstName.charAt(0)}{member.profile.lastName.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {`${member.profile.firstName} ${member.profile.lastName}`}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{member.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                  {member.teamId ? member.teamId.name : 'No Team'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  member.isActive 
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'
                                }`}>
                                  {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleEditMember(member)}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                  >
                                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleToggleActivation(member._id, !member.isActive)}
                                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                                      member.isActive 
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                                        : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                                    }`}
                                  >
                                    {member.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                
        {/* Pagination */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Next
                <svg className="h-4 w-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Team Form Modal */}
      {showTeamForm && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-50 overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {teamForm.id ? 'Update Team' : 'Create Team'}
              </h2>
            </div>
            <form onSubmit={handleTeamSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter team description"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Members</label>
                <select
                  multiple
                  value={teamForm.teamMembers}
                  onChange={(e) => setTeamForm({ ...teamForm, teamMembers: Array.from(e.target.selectedOptions, option => option.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 h-32 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  {teamMembers.map((member) => (
                    <option key={member._id} value={member._id} className="py-1">
                      {`${member.profile.firstName} ${member.profile.lastName}`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple members</p>
              </div> */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowTeamForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Saving...' : 'Save Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Form Modal */}
      {showMemberForm && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-50 overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {memberForm._id ? 'Update Team Member' : 'Add Team Member'}
              </h2>
            </div>
            <form onSubmit={handleMemberSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={memberForm.firstName}
                  onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={memberForm.lastName}
                  onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter last name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                <select
                  value={memberForm.teamId}
                  onChange={(e) => setMemberForm({ ...memberForm, teamId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">No Team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>{team.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowMemberForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMembers;