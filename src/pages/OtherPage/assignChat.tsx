import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { apiCall } from '../../services/api/auth';
// Define interfaces for type safety
interface Team {
  _id: string;
  name: string;
  description?: string;
}

interface TeamMember {
  _id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
  teamId?: {
    _id: string;
    name: string;
  };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  // Add other customer properties as needed
}

interface AssignChatProps {
  selectedCustomer: Customer | null;
  onAssignmentComplete?: () => void;
}

const Toast = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const AssignChat: React.FC<AssignChatProps> = ({ selectedCustomer, onAssignmentComplete }) => {
  const { token } = useAuth();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [assignForm, setAssignForm] = useState({
    teamId: '',
    teamMemberIds: [] as string[],
    chatAssigneeId: '',
  });

  // Fetch teams when modal opens
  useEffect(() => {
    if (showAssignModal) {
      fetchTeams();
    }
  }, [showAssignModal]);

  // Fetch team members when team is selected
  useEffect(() => {
    if (assignForm.teamId) {
      fetchTeamMembers(assignForm.teamId);
    } else {
      setTeamMembers([]);
      setAssignForm(prev => ({ ...prev, teamMemberIds: [], chatAssigneeId: '' }));
    }
  }, [assignForm.teamId]);

  // Reset chat assignee when team members selection changes
  useEffect(() => {
    if (!assignForm.teamMemberIds.includes(assignForm.chatAssigneeId)) {
      setAssignForm(prev => ({ ...prev, chatAssigneeId: '' }));
    }
  }, [assignForm.teamMemberIds]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await apiCall('/get-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          page: 1,
          limit: 100, // Get all teams
        })
      }, token ?? undefined);

      if (response && response.data && response.data.docs) {
        setTeams(response.data.docs);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      Toast.fire({
        icon: 'error',
        title: 'Failed to load teams',
      });
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchTeamMembers = async (teamId: string) => {
    setLoadingMembers(true);
    try {
      const response = await apiCall('/get-team-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamId,
          page: 1,
          limit: 100, // Get all team members
          isActive: true,
        })
      }, token ?? undefined);

      if (response && response.data && response.data.docs) {
        setTeamMembers(response.data.docs);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      Toast.fire({
        icon: 'error',
        title: 'Failed to load team members',
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleTeamMemberToggle = (memberId: string) => {
    setAssignForm(prev => {
      const isSelected = prev.teamMemberIds.includes(memberId);
      let newTeamMemberIds;
      
      if (isSelected) {
        newTeamMemberIds = prev.teamMemberIds.filter(id => id !== memberId);
      } else {
        newTeamMemberIds = [...prev.teamMemberIds, memberId];
      }
      
      return {
        ...prev,
        teamMemberIds: newTeamMemberIds,
      };
    });
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      Toast.fire({
        icon: 'error',
        title: 'No customer selected',
      });
      return;
    }

    if (!assignForm.teamId) {
      Toast.fire({
        icon: 'error',
        title: 'Please select a team',
      });
      return;
    }

    if (assignForm.teamMemberIds.length === 0) {
      Toast.fire({
        icon: 'error',
        title: 'Please select at least one team member',
      });
      return;
    }

    if (!assignForm.chatAssigneeId) {
      Toast.fire({
        icon: 'error',
        title: 'Please select a chat assignee',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiCall('/assign-team-and-chat-to-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          teamId: assignForm.teamId,
          teamMemberIds: assignForm.teamMemberIds,
          chatAssigneeId: assignForm.chatAssigneeId,
        })
      }, token ?? undefined);

      if (response && response.data) {
        Toast.fire({
          icon: 'success',
          title: 'Chat assigned successfully!',
        });
        
        resetForm();
        setShowAssignModal(false);
        
        if (onAssignmentComplete) {
          onAssignmentComplete();
        }
      }
    } catch (error) {
      console.error('Assignment error:', error);
      Toast.fire({
        icon: 'error',
        title: (error instanceof Error && error.message) ? error.message : 'Failed to assign chat',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAssignForm({
      teamId: '',
      teamMemberIds: [],
      chatAssigneeId: '',
    });
    setTeams([]);
    setTeamMembers([]);
  };

  const handleModalClose = () => {
    setShowAssignModal(false);
    resetForm();
  };

  const getSelectedTeamMembers = () => {
    return teamMembers.filter(member => assignForm.teamMemberIds.includes(member._id));
  };

  const getTeamMemberFullName = (member: TeamMember) => {
    return `${member.profile.firstName} ${member.profile.lastName}`;
  };

  return (
    <>
      {/* Assign Chat Button */}
      <button
        onClick={() => setShowAssignModal(true)}
        disabled={!selectedCustomer}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        Assign Chat
      </button>

     {/* Assign Chat Modal */}
{showAssignModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-6xl w-full mx-auto border-0 transform transition-all">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Assign Chat</h2>
              <p className="text-emerald-100 text-sm">
                Assign {selectedCustomer?.name} to your team
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleAssignSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Team Selection */}
          <div className="space-y-6">
            {/* Team Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Team</h3>
              </div>
              {loadingTeams ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <div className="ml-10">
                  <select
                    value={assignForm.teamId}
                    onChange={(e) => setAssignForm({ ...assignForm, teamId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white text-base"
                    required
                  >
                    <option value="">Choose a team...</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Team Members Selection */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  assignForm.teamId ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  <span className={`font-semibold text-sm ${
                    assignForm.teamId ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                  }`}>2</span>
                </div>
                <h3 className={`text-lg font-semibold ${
                  assignForm.teamId ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  Select Team Members
                  {assignForm.teamMemberIds.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-emerald-600 dark:text-emerald-400">
                      ({assignForm.teamMemberIds.length} selected)
                    </span>
                  )}
                </h3>
              </div>
              <div className="ml-10">
                {!assignForm.teamId ? (
                  <select
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed text-base"
                  >
                    <option>Select a team first...</option>
                  </select>
                ) : loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 h-80 overflow-y-auto">
                    {teamMembers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        No team members found
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {teamMembers.map((member) => (
                          <label
                            key={member._id}
                            className="flex items-center p-3 hover:bg-white dark:hover:bg-gray-700 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-700"
                          >
                            <input
                              type="checkbox"
                              checked={assignForm.teamMemberIds.includes(member._id)}
                              onChange={() => handleTeamMemberToggle(member._id)}
                              className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <div className="ml-4 flex-1">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                                    {member.profile.firstName.charAt(0)}{member.profile.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {getTeamMemberFullName(member)}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Chat Assignment & Summary */}
          <div className="space-y-6">
            {/* Chat Assignee Selection */}
            {assignForm.teamMemberIds.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Chat To</h3>
                </div>
                <div className="ml-10">
                  <select
                    value={assignForm.chatAssigneeId}
                    onChange={(e) => setAssignForm({ ...assignForm, chatAssigneeId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white text-base"
                    required
                  >
                    <option value="">Choose team member for chat...</option>
                    {getSelectedTeamMembers().map((member) => (
                      <option key={member._id} value={member._id}>
                        {getTeamMemberFullName(member)} - {member.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Assignment Summary */}
            {assignForm.teamId && assignForm.teamMemberIds.length > 0 && assignForm.chatAssigneeId && (
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Assignment Summary</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Customer:</span>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-1">{selectedCustomer?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Team:</span>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-1">{teams.find(t => t._id === assignForm.teamId)?.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Team Members:</span>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-1">{assignForm.teamMemberIds.length} selected</p>
                  </div>
                  <div>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Chat Assignee:</span>
                    <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                      {getTeamMemberFullName(teamMembers.find(m => m._id === assignForm.chatAssigneeId)!)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder when no assignment yet */}
            {(!assignForm.teamId || assignForm.teamMemberIds.length === 0 || !assignForm.chatAssigneeId) && (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Assignment summary will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleModalClose}
            className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !assignForm.teamId || assignForm.teamMemberIds.length === 0 || !assignForm.chatAssigneeId}
            className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 border border-transparent rounded-2xl hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Assigning...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Assign Chat
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </>
  );
};

export default AssignChat;