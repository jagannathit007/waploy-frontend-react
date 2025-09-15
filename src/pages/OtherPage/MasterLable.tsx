import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { apiCall } from "../../services/api/auth";

// Define interfaces for type safety
interface Label {
  _id: string;
  name: string;
  description: string;
  usageCount: number;
  isActive: boolean;
  createdBy: {
    _id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
}

// interface PaginatedResponse<T> {
//   docs: T[];
//   totalDocs: number;
//   limit: number;
//   page: number;
//   totalPages: number;
// }

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

const MasterLabel: React.FC = () => {
  const { token } = useAuth();
  const [labels, setLabels] = useState<Label[]>([]);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [labelForm, setLabelForm] = useState({
    _id: "",
    name: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch labels when component mounts or search/page changes
  useEffect(() => {
    fetchLabels();
  }, [search, page]);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        "/get-labels",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            search,
            page,
            limit: 10,
          }),
        },
        token ?? undefined
      );

      if (response && response.data) {
        setLabels(response.data.docs || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        throw new Error("Failed to fetch labels");
      }
    } catch (error: any) {
      console.error("Failed to fetch labels:", error);
      Toast.fire({
        icon: "error",
        title: error.message || "Failed to fetch labels",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLabelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiCall(
        "/upsert-label",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            labelId: labelForm._id || undefined,
            name: labelForm.name,
            description: labelForm.description,
          }),
        },
        token ?? undefined
      );

      if (response && response.data) {
        Toast.fire({
          icon: "success",
          title: labelForm._id
            ? "Label updated successfully!"
            : "Label created successfully!",
        });
        setLabelForm({
          _id: "",
          name: "",
          description: "",
        });
        setShowLabelForm(false);
        fetchLabels();
      } else {
        throw new Error("Failed to save label");
      }
    } catch (error: any) {
      console.error("Label save error:", error);
      Toast.fire({
        icon: "error",
        title: error.message || "Failed to save label",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will delete the label permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const response = await apiCall(
            "/delete-label",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ labelId }),
            },
            token ?? undefined
          );

          if (response) {
            Toast.fire({
              icon: "success",
              title: "Label deleted successfully!",
            });
            fetchLabels();
          }
        } catch (error: any) {
          console.error("Delete label error:", error);
          Toast.fire({
            icon: "error",
            title: error.message || "Failed to delete label",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleToggleLabelStatus = async (
    labelId: string,
    isActive: boolean
  ) => {
    setLoading(true);
    try {
      const response = await apiCall(
        "/toggle-label-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ labelId, isActive: !isActive }),
        },
        token ?? undefined
      );

      if (response && response.data) {
        Toast.fire({
          icon: "success",
          title: `Label ${
            isActive ? "deactivated" : "activated"
          } successfully!`,
        });
        fetchLabels();
      } else {
        Toast.fire({
        icon: "error",
        title: response.message || "Failed to toggle label status",
      });
      }
    } catch (error: any) {
      // console.error("Toggle label status error:", error);
      Toast.fire({
        icon: "error",
        title: error.message || "Failed to toggle label status",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditLabel = (label: Label) => {
    setLabelForm({
      _id: label._id,
      name: label.name,
      description: label.description,
    });
    setShowLabelForm(true);
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 p-6">
      <div className="col-span-12 space-y-6">
        {/* Header and Search */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Label Management
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage labels and their usage
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
                placeholder="Search labels..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
              />
            </div>
            {/* Add Label Button */}
            <button
              onClick={() => {
                setLabelForm({ _id: "", name: "", description: "" });
                setShowLabelForm(true);
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
              Add Label
            </button>
          </div>
        </div>

        {/* Labels Section */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading...
                </span>
              </div>
            )}

            {!loading && labels.length === 0 ? (
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
                    d="M7 7h10v10H7z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No labels found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by adding a new label.
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
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usage Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-gray-800">
                    {labels.map((label) => (
                      <tr
                        key={label._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-800/20 flex items-center justify-center">
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                  {label.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {label.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {label.description || "No description"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {label.usageCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {`${label.createdBy.profile.firstName} ${label.createdBy.profile.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            onClick={() =>
                              handleToggleLabelStatus(label._id, label.isActive)
                            }
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200
      ${
        label.isActive
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      }
      ${
        loading || label.usageCount > 0
          ? "opacity-50 cursor-not-allowed"
          : "hover:opacity-80"
      }
    `}
                          >
                            {label.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditLabel(label)}
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
                              onClick={() => handleDeleteLabel(label._id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                              disabled={label.usageCount > 0}
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
      </div>

      {/* Label Form Modal */}
      {showLabelForm && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-50 overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {labelForm._id ? "Update Label" : "Add Label"}
              </h2>
            </div>
            <form onSubmit={handleLabelSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={labelForm.name}
                  onChange={(e) =>
                    setLabelForm({ ...labelForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter label name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={labelForm.description}
                  onChange={(e) =>
                    setLabelForm({ ...labelForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter label description"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowLabelForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? "Saving..." : "Save Label"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterLabel;
