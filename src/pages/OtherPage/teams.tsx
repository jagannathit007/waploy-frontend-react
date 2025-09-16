import React, { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import Swal from "sweetalert2";

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
    "Content-Type": "application/json",
  },
});

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [teamForm, setTeamForm] = useState({
    id: "",
    name: "",
    description: "",
    teamMembers: [] as string[],
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token") || "";
  const userData = JSON.parse(localStorage.getItem("profile") || "{}");
  const userRole = userData?.role;

  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    },
  });

  const createTeam = async (data: {
    name: string;
    description: string;
    teamMembers?: string[];
  }): Promise<ApiResponse<Team>> => {
    try {
      const response: AxiosResponse<ApiResponse<Team>> = await api.post(
        "/create-team",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // Return full response to access message
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create team");
    }
  };

  const getTeams = async (data: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Team>>> => {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<Team>>> =
        await api.post("/get-teams", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      return response.data; // Return full response to access message
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch teams");
    }
  };

  const updateTeam = async (data: {
    id: string;
    name?: string;
    description?: string;
    teamMembers?: string[];
  }): Promise<ApiResponse<Team>> => {
    try {
      const response: AxiosResponse<ApiResponse<Team>> = await api.post(
        "/update-team",
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // Return full response to access message
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update team");
    }
  };

  const deleteTeam = async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      const response: AxiosResponse<ApiResponse<boolean>> = await api.post(
        "/delete-team",
        { id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data; // Return full response to access message
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete team");
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [search, page]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await getTeams({ search, page, limit: 10 });
      if (response.status === 200 && response.data) {
        setTeams(response.data.docs || []);
        setTotalPages(response.data.totalPages || 1);
        if (response.message) {
          // Toast.fire({
          //   icon: "success",
          //   title: response.message,
          // });
        }
      } else {
        Toast.fire({
          icon: "error",
          title: response.message || "Failed to fetch teams",
        });
      }
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title: error.message || "Failed to fetch teams",
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
        const response = await updateTeam(teamForm);
        if (response.status === 200 && response.data) {
          Toast.fire({
            icon: "success",
            title: response.message || "Team updated successfully!",
          });
          setTeamForm({ id: "", name: "", description: "", teamMembers: [] });
          setShowTeamForm(false);
          fetchTeams();
        } else {
          Toast.fire({
            icon: "error",
            title: response.message || "Failed to update team",
          });
        }
      } else {
        const response = await createTeam({
          name: teamForm.name,
          description: teamForm.description,
          teamMembers: teamForm.teamMembers,
        });
        if (response.status === 200 && response.data) {
          Toast.fire({
            icon: "success",
            title: response.message || "Team created successfully!",
          });
          setTeamForm({ id: "", name: "", description: "", teamMembers: [] });
          setShowTeamForm(false);
          fetchTeams();
        } else {
          Toast.fire({
            icon: "error",
            title: response.message || "Failed to create team",
          });
        }
      }
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title: error.message || "Failed to save team",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    setLoading(true);
    try {
      const response = await deleteTeam(id);
      if (response.status === 200 && response.data) {
        Toast.fire({
          icon: "success",
          title: response.message || "Team deleted successfully!",
        });
        fetchTeams();
      } else {
        Toast.fire({
          icon: "error",
          title: response.message || "Failed to delete team",
        });
      }
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title: error.message || "Failed to delete team",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setTeamForm({
      id: team._id,
      name: team.name,
      description: team.description,
      teamMembers: team.teamMembers,
    });
    setShowTeamForm(true);
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 p-6">
      <div className="col-span-12 space-y-6">
        {/* Header and Search */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Management
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your organization teams
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Box */}
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search teams..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
              />
            </div>

            {/* Create Team Button */}
            {userRole !== "team_member" && (<button
              onClick={() => {
                setTeamForm({
                  id: "",
                  name: "",
                  description: "",
                  teamMembers: [],
                }); // reset fields
                setShowTeamForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
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
              Create Team
            </button>)}
          </div>
        </div>

        {/* Teams Section */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Teams
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage your organization teams
              </p>
            </div>
            <button
              onClick={() => setShowTeamForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
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
              Create Team
            </button>
          </div> */}

          <div className="overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            )}

            {!loading && teams.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No teams found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating a new team.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Description
                      </th>
                      {userRole !== "team_member" && (<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>)}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-gray-800">
                    {teams.map((team) => (
                      <tr
                        key={team._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {team.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400">
                            {team.teamMembers.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {team.description && team.description.length > 30
                              ? team.description.substring(0, 30) + "..."
                              : team.description}
                          </div>
                        </td>

                        {userRole !== "team_member" && (<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditTeam(team)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <svg
                                className="h-3 w-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
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
                        </td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Page <span className="font-medium">{page}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <svg
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Next
                  <svg
                    className="h-4 w-4 ml-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
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
                {teamForm.id ? "Update Team" : "Add Team"}
              </h2>
            </div>
            <form onSubmit={handleTeamSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={teamForm.description}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter team description"
                  required
                />
              </div>
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
                  {loading ? "Saving..." : "Save Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
