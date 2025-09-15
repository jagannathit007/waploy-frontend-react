import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import PageMeta from "../../components/common/PageMeta";
import axios from "axios";
import Swal from "sweetalert2";

interface Feature {
  name: string;
  value: string | boolean; // Matches backend: string or boolean
  included: boolean; // Added to match backend schema
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  code: string;
  description: string;
  messageLimit: number;
  price: {
    monthly: number;
    yearly: number;
  };
  features: Feature[]; // Updated to array of Feature objects
  teamMembersLimit: number;
  bulkMessaging: boolean;
  prioritySupport: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlanFormData {
  name: string;
  code: string;
  description: string;
  messageLimit: number;
  price: {
    monthly: number;
    yearly: number;
  };
  features: Feature[];
  teamMembersLimit: number;
  bulkMessaging: boolean;
  prioritySupport: boolean;
  isActive?: boolean; // Added for update functionality
}

const SubscriptionManagement = () => {
  const { profile } = useAuth();
  const [subscriptionPlans, setSubscriptionPlans] = useState<
    SubscriptionPlan[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    code: "",
    description: "",
    messageLimit: 0,
    price: {
      monthly: 0,
      yearly: 0,
    },
    features: [
      { name: "textMessages", value: "0", included: true },
      { name: "audioMessages", value: "0", included: true },
      { name: "videoMessages", value: "0", included: true },
      { name: "templates", value: "0", included: true },
      { name: "contacts", value: "0", included: true },
      { name: "support", value: "Email", included: true },
      { name: "analytics", value: "Basic", included: true },
      { name: "customBranding", value: false, included: true },
      { name: "multiUser", value: "1", included: true },
    ],
    teamMembersLimit: 1,
    bulkMessaging: false,
    prioritySupport: false,
  });

  const [touched, setTouched] = useState<{ 
    [key: string]: boolean; 
    name: boolean;
    code: boolean;
    description: boolean;
    monthlyPrice: boolean;
    yearlyPrice: boolean;
    messageLimit: boolean;
    teamMembersLimit: boolean;
    feature_storage: boolean;
    feature_users: boolean;
    feature_support: boolean;
    feature_analytics: boolean;
    // Add other feature fields as needed based on formData.features
  }>({
    name: false,
    code: false,
    description: false,
    monthlyPrice: false,
    yearlyPrice: false,
    messageLimit: false,
    teamMembersLimit: false,
    // Dynamically add feature fields
    feature_storage: false,
    feature_users: false,
    feature_support: false,
    feature_analytics: false,
    // Add other feature fields as needed based on formData.features
  });

  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const subscriptionTypes = [
    { value: "free", label: "Free Plan", color: "gray" }, // Added 'free' to match backend enum
    { value: "basic", label: "Basic Plan", color: "gray" },
    { value: "gold", label: "Gold Plan", color: "emerald" },
    { value: "platinum", label: "Platinum Plan", color: "purple" },
  ];

  // Fetch subscription plans
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/get-subscriptions`,
        { page: 1, limit: 100 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 200 && response.data.data) {
        setSubscriptionPlans(response.data.data.docs || []);
      } else {
        Toast.fire({
          icon: "error",
          title: response.data.message || "Failed to fetch plans",
        });
      }
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      Toast.fire({
        icon: "error",
        title:
          error.response?.data?.message || "Failed to fetch subscription plans",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      fetchPlans();
    }
  }, [profile, fetchPlans]);

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      messageLimit: 0,
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: [
        { name: "textMessages", value: "0", included: true },
        { name: "audioMessages", value: "0", included: true },
        { name: "videoMessages", value: "0", included: true },
        { name: "templates", value: "0", included: true },
        { name: "contacts", value: "0", included: true },
        { name: "support", value: "Email", included: true },
        { name: "analytics", value: "Basic", included: true },
        { name: "customBranding", value: false, included: true },
        { name: "multiUser", value: "1", included: true },
      ],
      teamMembersLimit: 1,
      bulkMessaging: false,
      prioritySupport: false,
    });
  };

  const validateForm = () => {
    return (
      formData.name.trim() !== "" &&
      formData.code !== "" &&
      // formData.description.trim() !== "" &&
      formData.price.monthly >= 0 &&
      formData.price.yearly >= 0 &&
      formData.messageLimit >= 0 &&
      formData.teamMembersLimit >= 1 &&
      formData.features.every((feature) => {
        if (typeof feature.value === "boolean") return true;
        if (typeof feature.value === "string")
          return feature.value.trim() !== "";
        return true;
      })
    );
  };

  const handleCreatePlan = async () => {
    if (!validateForm()) {
      Toast.fire({
        icon: "error",
        title: "Please fill all required fields correctly",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const payload = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        messageLimit: formData.messageLimit,
        price: {
          monthly: formData.price.monthly,
          yearly: formData.price.yearly,
        },
        features: formData.features.map((feature) => ({
          name: feature.name,
          value: feature.value,
          included: feature.included,
        })),
        teamMembersLimit: formData.teamMembersLimit,
        bulkMessaging: formData.bulkMessaging,
        prioritySupport: formData.prioritySupport,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/create-subscription-plan`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 200) {
        Toast.fire({ icon: "success", title: response.data.message });
        setSubscriptionPlans((prev) => [...prev, response.data.data]);
        setShowCreateModal(false);
        resetForm();
        fetchPlans();
      } else {
        Toast.fire({ icon: "error", title: response.data.message });
      }
    } catch (error: any) {
      console.error("Error creating plan:", error);
      Toast.fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to create plan",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan || !validateForm()) {
      Toast.fire({
        icon: "error",
        title: "Please fill all required fields correctly",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");

      const payload = {
        id: editingPlan._id,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        messageLimit: formData.messageLimit,
        price: {
          monthly: formData.price.monthly,
          yearly: formData.price.yearly,
        },
        features: formData.features.map((feature) => ({
          name: feature.name,
          value: feature.value,
          included: feature.included,
        })),
        teamMembersLimit: formData.teamMembersLimit,
        bulkMessaging: formData.bulkMessaging,
        prioritySupport: formData.prioritySupport,
        isActive: formData.isActive !== undefined ? formData.isActive : true,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/update-subscription-plan`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 200) {
        Toast.fire({ icon: "success", title: response.data.message });
        setSubscriptionPlans((prev) =>
          prev.map((plan) =>
            plan._id === editingPlan._id ? response.data.data : plan
          )
        );
        setShowEditModal(false);
        setEditingPlan(null);
        resetForm();
        fetchPlans();
      } else {
        Toast.fire({ icon: "error", title: response.data.message });
      }
    } catch (error: any) {
      console.error("Error updating plan:", error);
      Toast.fire({
        icon: "error",
        title: error.response?.data?.message || "Failed to update plan",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will deactivate the subscription plan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, deactivate it!",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE}/update-subscription-plan`,
          { id: planId, isActive: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === 200) {
          Toast.fire({
            icon: "success",
            title: "Plan deactivated successfully!",
          });
          setSubscriptionPlans((prev) =>
            prev.map((plan) =>
              plan._id === planId ? { ...plan, isActive: false } : plan
            )
          );
        } else {
          Toast.fire({ icon: "error", title: response.data.message });
        }
      } catch (error: any) {
        console.error("Error deactivating plan:", error);
        Toast.fire({
          icon: "error",
          title: error.response?.data?.message || "Failed to deactivate plan",
        });
      }
    }
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description,
      messageLimit: plan.messageLimit,
      price: plan.price,
      features: [
        {
          name: "textMessages",
          value: String(
            plan.features.find((f) => f.name === "textMessages")?.value || "0"
          ),
          included:
            plan.features.find((f) => f.name === "textMessages")?.included ??
            true,
        },
        {
          name: "audioMessages",
          value: String(
            plan.features.find((f) => f.name === "audioMessages")?.value || "0"
          ),
          included:
            plan.features.find((f) => f.name === "audioMessages")?.included ??
            true,
        },
        {
          name: "videoMessages",
          value: String(
            plan.features.find((f) => f.name === "videoMessages")?.value || "0"
          ),
          included:
            plan.features.find((f) => f.name === "videoMessages")?.included ??
            true,
        },
        {
          name: "templates",
          value: String(
            plan.features.find((f) => f.name === "templates")?.value || "0"
          ),
          included:
            plan.features.find((f) => f.name === "templates")?.included ?? true,
        },
        {
          name: "contacts",
          value: String(
            plan.features.find((f) => f.name === "contacts")?.value || "0"
          ),
          included:
            plan.features.find((f) => f.name === "contacts")?.included ?? true,
        },
        {
          name: "support",
          value:
            plan.features.find((f) => f.name === "support")?.value || "Email",
          included:
            plan.features.find((f) => f.name === "support")?.included ?? true,
        },
        {
          name: "analytics",
          value:
            plan.features.find((f) => f.name === "analytics")?.value || "Basic",
          included:
            plan.features.find((f) => f.name === "analytics")?.included ?? true,
        },
        {
          name: "customBranding",
          value:
            plan.features.find((f) => f.name === "customBranding")?.value ??
            false,
          included:
            plan.features.find((f) => f.name === "customBranding")?.included ??
            true,
        },
        {
          name: "multiUser",
          value: String(
            plan.features.find((f) => f.name === "multiUser")?.value || "1"
          ),
          included:
            plan.features.find((f) => f.name === "multiUser")?.included ?? true,
        },
      ],
      teamMembersLimit: plan.teamMembersLimit,
      bulkMessaging: plan.bulkMessaging,
      prioritySupport: plan.prioritySupport,
      isActive: plan.isActive,
    });
    setShowEditModal(true);
  };

  const updateFeature = (
    featureName: string,
    field: "value" | "included",
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature) =>
        feature.name === featureName
          ? {
              ...feature,
              [field]:
                field === "value" && typeof feature.value === "boolean"
                  ? value
                  : field === "value"
                  ? String(value).trim()
                  : value,
            }
          : feature
      ),
    }));
  };

  const getColorClasses = (code: string | null | undefined) => {
    const planCode = code || "gold"; // Default to "gold" if code is null/undefined
    switch (planCode) {
      case "free":
      case "basic":
        return {
          bg: "bg-gray-50 dark:bg-gray-800",
          border: "border-gray-200 dark:border-gray-800",
          text: "text-gray-900 dark:text-gray-100",
          hover: "hover:bg-gray-100 dark:hover:bg-gray-700",
        };
      case "platinum":
        return {
          bg: "bg-purple-50 dark:bg-purple-900/20",
          border: "border-purple-200 dark:border-purple-800",
          text: "text-purple-900 dark:text-purple-200",
          hover: "hover:bg-purple-100 dark:hover:bg-purple-800/30",
        };
      case "gold":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-900 dark:text-emerald-200",
          hover: "hover:bg-emerald-100 dark:hover:bg-emerald-800/30",
        };
      default:
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-200 dark:border-emerald-800",
          text: "text-emerald-900 dark:text-emerald-200",
          hover: "hover:bg-emerald-100 dark:hover:bg-emerald-800/30",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Subscription Management | Admin Panel"
        description="Manage subscription plans and pricing"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Subscription Plans
          </h2>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="mt-4 sm:mt-0 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            Create New Plan
          </button>
        </div>

        {subscriptionPlans.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No subscription plans available. Create one to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              if (!plan) return null;
              const colorClasses = getColorClasses(plan.code || "gold");

              return (
                <div
                  key={plan._id}
                  className={`rounded-xl shadow-md border-2 p-6 transition-all duration-200 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-xl font-bold ${colorClasses.text}`}>
                      {plan.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit Plan"
                      >
                        <svg
                          className="w-5 h-5"
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
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan._id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Deactivate Plan"
                      >
                        <svg
                          className="w-5 h-5"
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
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="mb-4">
                    <span className={`text-2xl font-bold ${colorClasses.text}`}>
                      ₹{plan.price.monthly.toLocaleString("en-IN")}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      /month
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Text Messages
                      </span>
                      <span className={`font-medium ${colorClasses.text}`}>
                        {plan.features.find((f) => f.name === "textMessages")
                          ?.value || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Audio Messages
                      </span>
                      <span className={`font-medium ${colorClasses.text}`}>
                        {plan.features.find((f) => f.name === "audioMessages")
                          ?.value || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Video Messages
                      </span>
                      <span className={`font-medium ${colorClasses.text}`}>
                        {plan.features.find((f) => f.name === "videoMessages")
                          ?.value || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Templates
                      </span>
                      <span className={`font-medium ${colorClasses.text}`}>
                        {plan.features.find((f) => f.name === "templates")
                          ?.value || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">
                        Support
                      </span>
                      <span className={`font-medium ${colorClasses.text}`}>
                        {plan.features.find((f) => f.name === "support")
                          ?.value || "Email"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        plan.isActive
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* create and edit model */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-[1000] flex items-center justify-center p-4 sm:p-6">
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] mx-auto border-0 transform transition-all flex flex-col">
              {/* Header - Sticky */}
              <div className="px-4 py-3 sm:px-6 sm:py-4 rounded-t-2xl border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <svg
                        className="h-5 w-5 text-gray-500 dark:text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {showCreateModal ? "Create New Plan" : "Edit Plan"}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {showCreateModal
                          ? "Create a new subscription plan"
                          : `Update plan: ${editingPlan?.name || ""}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      setEditingPlan(null);
                      resetForm();
                    }}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                    title="Close"
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

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    showCreateModal ? handleCreatePlan() : handleUpdatePlan();
                  }}
                  className="p-4 sm:p-6"
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
                    {/* Left Side - Basic Details */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                              1
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Basic Details
                          </h3>
                        </div>
                        <div className="ml-0 sm:ml-10 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Plan Name <code className="text-red-500">*</code>
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  name: e.target.value.trim(),
                                }))
                              }
                              onBlur={() =>
                                setTouched((prev) => ({ ...prev, name: true }))
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                              placeholder="Enter plan name"
                              required
                            />
                            {touched.name && formData.name.trim() === "" && (
                              <p className="text-red-500 text-xs mt-1">
                                Plan name is required
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Select Plan{" "}
                              <code className="text-red-500">*</code>
                            </label>
                            <select
                              value={formData.code}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  code: e.target.value,
                                }))
                              }
                              onBlur={() =>
                                setTouched((prev) => ({ ...prev, code: true }))
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                              required
                            >
                              <option value="">Select plan type</option>
                              {subscriptionTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.label}
                                </option>
                              ))}
                            </select>
                            {touched.code && formData.code === "" && (
                              <p className="text-red-500 text-xs mt-1">
                                Plan type is required
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Description
                            </label>
                            <textarea
                              value={formData.description}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  description: e.target.value.trim(),
                                }))
                              }
                              onBlur={() =>
                                setTouched((prev) => ({
                                  ...prev,
                                  description: true,
                                }))
                              }
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                              placeholder="Enter plan description"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Pricing */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                              2
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Pricing
                          </h3>
                        </div>
                        <div className="ml-0 sm:ml-10 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Monthly Price (₹){" "}
                              <code className="text-red-500">*</code>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.price.monthly}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  price: {
                                    ...prev.price,
                                    monthly: Math.max(
                                      0,
                                      Number(e.target.value)
                                    ),
                                  },
                                }))
                              }
                              onBlur={() =>
                                setTouched((prev) => ({
                                  ...prev,
                                  monthlyPrice: true,
                                }))
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                              required
                            />
                            {touched.monthlyPrice &&
                              formData.price.monthly <= 0 && (
                                <p className="text-red-500 text-xs mt-1">
                                  Monthly price must be greater than 0
                                </p>
                              )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Yearly Price (₹){" "}
                              <code className="text-red-500">*</code>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.price.yearly}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  price: {
                                    ...prev.price,
                                    yearly: Math.max(0, Number(e.target.value)),
                                  },
                                }))
                              }
                              onBlur={() =>
                                setTouched((prev) => ({
                                  ...prev,
                                  yearlyPrice: true,
                                }))
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                              required
                            />
                            {touched.yearlyPrice &&
                              formData.price.yearly <= 0 && (
                                <p className="text-red-500 text-xs mt-1">
                                  Yearly price must be greater than 0
                                </p>
                              )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Message Limit{" "}
                              <code className="text-red-500">*</code>
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={formData.messageLimit}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  messageLimit: Math.max(
                                    0,
                                    Number(e.target.value)
                                  ),
                                }))
                              }
                              onBlur={() =>
                                setTouched((prev) => ({
                                  ...prev,
                                  messageLimit: true,
                                }))
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                              required
                            />
                            {touched.messageLimit &&
                              formData.messageLimit < 0 && (
                                <p className="text-red-500 text-xs mt-1">
                                  Message limit cannot be negative
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 mt-6">
                    {/* Left Side - Features */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                              3
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Features
                          </h3>
                        </div>
                        <div className="ml-0 sm:ml-10 space-y-4">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {formData.features.map((feature) => (
                              <div key={feature.name}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {feature.name.charAt(0).toUpperCase() +
                                    feature.name
                                      .slice(1)
                                      .replace(/([A-Z])/g, " $1")}
                                </label>
                                <div className="space-y-2">
                                  {typeof feature.value === "boolean" ? (
                                    <label className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={feature.value as boolean}
                                        onChange={(e) =>
                                          updateFeature(
                                            feature.name,
                                            "value",
                                            e.target.checked
                                          )
                                        }
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                      />
                                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                        Enabled
                                      </span>
                                    </label>
                                  ) : feature.name === "support" ? (
                                    <select
                                      value={feature.value as string}
                                      onChange={(e) =>
                                        updateFeature(
                                          feature.name,
                                          "value",
                                          e.target.value
                                        )
                                      }
                                      onBlur={() =>
                                        setTouched((prev) => ({
                                          ...prev,
                                          [`feature_${feature.name}`]: true,
                                        }))
                                      }
                                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                                    >
                                      <option value="Email">Email</option>
                                      <option value="Phone">Phone</option>
                                      <option value="Premium">Premium</option>
                                      <option value="24/7 Premium Support">
                                        24/7 Premium Support
                                      </option>
                                    </select>
                                  ) : feature.name === "analytics" ? (
                                    <select
                                      value={feature.value as string}
                                      onChange={(e) =>
                                        updateFeature(
                                          feature.name,
                                          "value",
                                          e.target.value
                                        )
                                      }
                                      onBlur={() =>
                                        setTouched((prev) => ({
                                          ...prev,
                                          [`feature_${feature.name}`]: true,
                                        }))
                                      }
                                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                                    >
                                      <option value="Basic">Basic</option>
                                      <option value="Advanced">Advanced</option>
                                      <option value="Pro">Pro</option>
                                      <option value="Premium Analytics + Reports">
                                        Premium Analytics + Reports
                                      </option>
                                    </select>
                                  ) : (
                                    <div className="space-y-2">
                                      <input
                                        type="text"
                                        value={feature.value as string}
                                        onChange={(e) =>
                                          updateFeature(
                                            feature.name,
                                            "value",
                                            e.target.value
                                          )
                                        }
                                        onBlur={() =>
                                          setTouched((prev) => ({
                                            ...prev,
                                            [`feature_${feature.name}`]: true,
                                          }))
                                        }
                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                                        placeholder="e.g., Unlimited, 1000, 5000"
                                      />
                                      {touched[`feature_${feature.name}`] &&
                                        feature.value === "" && (
                                          <p className="text-red-500 text-xs">
                                            This field is required
                                          </p>
                                        )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Additional Settings */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                              4
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Additional Settings
                          </h3>
                        </div>
                        <div className="ml-0 sm:ml-10 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Team Members Limit{" "}
                              <code className="text-red-500">*</code>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={formData.teamMembersLimit}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  teamMembersLimit: Math.max(
                                    1,
                                    Number(e.target.value)
                                  ),
                                }))
                              }
                              onBlur={() =>
                                setTouched((prev) => ({
                                  ...prev,
                                  teamMembersLimit: true,
                                }))
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 dark:bg-gray-800 dark:text-white"
                              required
                            />
                            {touched.teamMembersLimit &&
                              formData.teamMembersLimit < 1 && (
                                <p className="text-red-500 text-xs mt-1">
                                  Team members limit must be at least 1
                                </p>
                              )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.bulkMessaging}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    bulkMessaging: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Bulk Messaging
                              </span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.prioritySupport}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    prioritySupport: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Priority Support
                              </span>
                            </label>
                          </div>
                          {showEditModal && (
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={
                                  formData.isActive !== undefined
                                    ? formData.isActive
                                    : true
                                }
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    isActive: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                Active
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validation Summary */}
                  <div className="mt-6">
                    {(!formData.name ||
                      !formData.code ||
                      formData.price.monthly <= 0 ||
                      formData.price.yearly <= 0 ||
                      formData.messageLimit < 0 ||
                      formData.teamMembersLimit < 1) && (
                      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-2xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg
                            className="h-5 w-5 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                          <h4 className="font-semibold text-red-800 dark:text-red-300">
                            Please fix the following issues:
                          </h4>
                        </div>
                        <ul className="text-red-700 dark:text-red-400 text-sm list-disc list-inside space-y-1">
                          {!formData.name && <li>Plan name is required</li>}
                          {!formData.code && <li>Plan code is required</li>}
                          {formData.price.monthly <= 0 && (
                            <li>Monthly price must be greater than 0</li>
                          )}
                          {formData.price.yearly <= 0 && (
                            <li>Yearly price must be greater than 0</li>
                          )}
                          {formData.messageLimit < 0 && (
                            <li>Message limit cannot be negative</li>
                          )}
                          {formData.teamMembersLimit < 1 && (
                            <li>Team members limit must be at least 1</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mt-6">
                    {formData.name &&
                      formData.code &&
                      formData.price.monthly > 0 &&
                      formData.price.yearly > 0 &&
                      formData.messageLimit >= 0 &&
                      formData.teamMembersLimit >= 1 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-2xl p-4">
                          <div className="flex items-center space-x-2 mb-4">
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">
                              Plan Summary
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                Plan Name:
                              </span>
                              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                                {formData.name}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                Plan Type:
                              </span>
                              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                                {subscriptionTypes.find(
                                  (type) => type.value === formData.code
                                )?.label || formData.code}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                Monthly Price:
                              </span>
                              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                                ₹
                                {formData.price.monthly.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                Yearly Price:
                              </span>
                              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                                ₹{formData.price.yearly.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                Message Limit:
                              </span>
                              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                                {formData.messageLimit.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                                Team Members:
                              </span>
                              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                                {formData.teamMembersLimit}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Action Buttons - Sticky Footer */}
                  <div className="sticky bottom-0 bg-white dark:bg-gray-900 pt-4 mt-6 -mb-4 -mx-6 px-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-end space-x-4 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setShowEditModal(false);
                          setEditingPlan(null);
                          resetForm();
                        }}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 dark:text-gray-300"
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !validateForm()}
                        className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 border border-transparent rounded-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                      >
                        {submitting ? (
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : null}
                        {showCreateModal ? "Create Plan" : "Update Plan"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SubscriptionManagement;
