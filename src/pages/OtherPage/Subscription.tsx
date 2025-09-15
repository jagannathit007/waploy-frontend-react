import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';
import axios from 'axios';
import Swal from 'sweetalert2';

// Define interfaces for TypeScript
interface SubscriptionPlan {
  _id: string;
  name: string;
  code: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    textMessages: number | string;
    audioMessages: number | string;
    videoMessages: number | string;
    templates: number | string;
    contacts: number | string;
    support: string;
    analytics: string;
    customBranding: boolean;
    multiUser: number | string;
  };
}

interface CurrentPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    textMessages: number | string;
    audioMessages: number | string;
    videoMessages: number | string;
    templates: number | string;
    contacts: number | string;
    support: string;
    analytics: string;
    customBranding: boolean;
    multiUser: number | string;
  };
  expiryDate: string;
  status: string;
}

const Subscription = () => {
  const { profile } = useAuth();
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNoSubscriptionPopup, setShowNoSubscriptionPopup] = useState(false);
  console.log(showNoSubscriptionPopup);
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  // Fetch subscription plans and current subscription
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE}/get-subscription-plans`,
          { page: 1, limit: 10 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.status === 200 && response.data.data) {
          setSubscriptionPlans(response.data.data.docs || []);
        } else {
          throw new Error('Failed to fetch subscription plans');
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        Toast.fire({ icon: 'error', title: 'Failed to fetch subscription plans' });
      }
    };

    const fetchCurrentPlan = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE}/get-current-subscription`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status === 200) {
          if (response.data.data) {
            setCurrentPlan(response.data.data);
            setShowNoSubscriptionPopup(false);
          } else {
            if (response.data.message && response.data.message.toLowerCase().includes('no active subscription')) {
              setCurrentPlan(null);
              setShowNoSubscriptionPopup(true);
            }
          }
        } else {
          throw new Error('No active subscription found');
        }
      } catch (error) {
        console.error('Error fetching current subscription:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          if (axiosError.response?.data?.message?.toLowerCase().includes('no active subscription')) {
            setCurrentPlan(null);
            setShowNoSubscriptionPopup(true);
          } else {
            Toast.fire({ icon: 'error', title: 'Failed to fetch current subscription' });
          }
        } else {
          Toast.fire({ icon: 'error', title: 'Failed to fetch current subscription' });
        }
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchCurrentPlan()]);
      setLoading(false);
    };

    if (profile) {
      fetchData();
    }
  }, [profile]);

  const handleBuyNow = async (plan: SubscriptionPlan) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE}/subscribe-to-plan`,
        { subscriptionPlanId: plan._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === 200) {
        Toast.fire({ icon: 'success', title: `Successfully subscribed to ${plan.name}` });
        setShowNoSubscriptionPopup(false);
        const currentPlanResponse = await axios.post(
          `${import.meta.env.VITE_API_BASE}/get-current-subscription`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (currentPlanResponse.data.status === 200 && currentPlanResponse.data.data) {
          setCurrentPlan(currentPlanResponse.data.data);
        }
      } else {
        throw new Error(response.data.message || 'Failed to subscribe to plan');
      }
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        const errorMessage = axiosError.response?.data?.message || 'Failed to subscribe to plan';
        Toast.fire({
          icon: 'error',
          title: errorMessage === 'You already have an active subscription. Only one active subscription is allowed!'
            ? errorMessage
            : 'Failed to subscribe to plan',
        });
      } else {
        Toast.fire({ icon: 'error', title: 'Failed to subscribe to plan' });
      }
    }
  };

  const formatFeatureValue = (value: number | string | boolean) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-IN');
    }
    return value;
  };

  // Determine button background classes based on plan code
  const getButtonClasses = (plan: SubscriptionPlan, isDisabled: boolean) => {
    if (isDisabled) {
      return 'opacity-50 cursor-not-allowed bg-gray-600';
    }
    switch (plan.code) {
      case 'basic':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'platinum':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'gold':
      default:
        return 'bg-emerald-600 hover:bg-emerald-700';
    }
  };

  if (!profile || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Subscription Plans | WhatsApp Business API"
        description="Choose the perfect WhatsApp Business API plan for your business needs"
      />

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Current Subscription Status */}
        {currentPlan ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Current Subscription
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your active plan details</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  currentPlan.status === 'Active'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {currentPlan.status}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{currentPlan.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires On</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(currentPlan.expiryDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Days Remaining</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.ceil(
                    (new Date(currentPlan.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg className="w-6 h-6 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  No Active Subscription
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  You don't have an active subscription plan
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-300">
                Please choose a subscription plan from the options below to get started with our services.
              </p>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 subscription-plans pt-6">
          {subscriptionPlans.map((plan) => {
            const price = plan.price.monthly; // Use yearly price as default
            const isCurrentPlan = currentPlan?.id === plan._id;
            const isPopular = plan.code === 'gold' && !currentPlan; // Only show "Most Popular" if no current plan
            // Disable all plans except the current one if a current plan exists
            const isDisabled = currentPlan ? !isCurrentPlan : false;

            return (
              <div
                key={plan._id}
                className={`relative rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  isCurrentPlan
                    ? 'border-emerald-500 dark:border-emerald-400 scale-105'
                    : isPopular
                    ? 'border-emerald-500 dark:border-emerald-400 scale-105'
                    : `border-${plan.code === 'basic' ? 'gray' : plan.code === 'platinum' ? 'purple' : 'gray'}-200 dark:border-${
                        plan.code === 'basic' ? 'gray' : plan.code === 'platinum' ? 'purple' : 'gray'
                      }-700`
                } bg-${plan.code === 'basic' ? 'gray' : plan.code === 'platinum' ? 'purple' : 'emerald'}-50 dark:bg-${
                  plan.code === 'basic' ? 'gray' : plan.code === 'platinum' ? 'purple' : 'emerald'
                }-900/20`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{price.toLocaleString('en-IN')}</span>
                      <span className="text-gray-600 dark:text-gray-400">/month</span>
                    </div>
                  </div>
                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        Text Messages
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatFeatureValue(plan.features.textMessages)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                        Audio Messages
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatFeatureValue(plan.features.audioMessages)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Video Messages
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatFeatureValue(plan.features.videoMessages)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Templates
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatFeatureValue(plan.features.templates)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Contacts
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatFeatureValue(plan.features.contacts)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Multi Users
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatFeatureValue(plan.features.multiUser)}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{plan.features.support}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{plan.features.analytics}</span>
                      </div>
                      {plan.features.customBranding && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Custom Branding</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Buy Now Button */}
                  <button
                    onClick={() => handleBuyNow(plan)}
                    className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 ${getButtonClasses(
                      plan,
                      isDisabled
                    )}`}
                    disabled={isDisabled}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Buy Now'}
                  </button>
                  {isCurrentPlan && (
                    <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                      ✓ Active Subscription
                    </p>
                  )}
                  {isDisabled && !isCurrentPlan && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                      Subscription Change Not Allowed
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Compare All Features</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Features</th>
                  {subscriptionPlans.map((plan) => (
                    <th key={plan._id} className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Yearly Price</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan._id} className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      ₹{plan.price.monthly.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Text Messages</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan._id} className="text-center py-3 px-4 text-gray-900 dark:text-white">
                      {formatFeatureValue(plan.features.textMessages)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Audio Messages</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan._id} className="text-center py-3 px-4 text-gray-900 dark:text-white">
                      {formatFeatureValue(plan.features.audioMessages)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Video Messages</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan._id} className="text-center py-3 px-4 text-gray-900 dark:text-white">
                      {formatFeatureValue(plan.features.videoMessages)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscription;