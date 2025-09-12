import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PageMeta from '../../components/common/PageMeta';

const Subscription = () => {
  const { profile } = useAuth();
  // const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  // Conversion rate: 1 USD = 83 INR
  const USD_TO_INR = 83;

  // Updated subscription plans data with INR prices and removed apiAccess
  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      description: 'Perfect for small businesses getting started',
      monthlyPrice: 29 * USD_TO_INR, // Converted to INR
      yearlyPrice: 290 * USD_TO_INR, // Converted to INR
      popular: false,
      features: {
        textMessages: 1000,
        audioMessages: 50,
        videoMessages: 20,
        templates: 5,
        contacts: 500,
        support: 'Email Support',
        analytics: 'Basic Analytics',
        customBranding: false,
        multiUser: 1
      },
      color: 'bg-gray-50 dark:bg-gray-800/50',
      borderColor: 'border-gray-200 dark:border-gray-700',
      buttonColor: 'bg-gray-600 hover:bg-gray-700'
    },
    {
      id: 'gold',
      name: 'Gold Plan',
      description: 'Most popular choice for growing businesses',
      monthlyPrice: 79 * USD_TO_INR, // Converted to INR
      yearlyPrice: 790 * USD_TO_INR, // Converted to INR
      popular: true,
      features: {
        textMessages: 5000,
        audioMessages: 500,
        videoMessages: 200,
        templates: 25,
        contacts: 2500,
        support: 'Priority Support',
        analytics: 'Advanced Analytics',
        customBranding: true,
        multiUser: 3
      },
      color: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-700',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      id: 'platinum',
      name: 'Platinum Plan',
      description: 'Unlimited power for enterprise businesses',
      monthlyPrice: 149 * USD_TO_INR, // Converted to INR
      yearlyPrice: 1490 * USD_TO_INR, // Converted to INR
      popular: false,
      features: {
        textMessages: 'Unlimited',
        audioMessages: 'Unlimited',
        videoMessages: 'Unlimited',
        templates: 'Unlimited',
        contacts: 'Unlimited',
        support: '24/7 Premium Support',
        analytics: 'Premium Analytics + Reports',
        customBranding: true,
        multiUser: 'Unlimited'
      },
      color: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-700',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    }
  ];

  const currentPlan = {
    id: 'gold',
    name: 'Gold Plan',
    expiryDate: '2024-12-25',
    status: 'Active'
  };

  const handleBuyNow = (plan:any) => {
    // setSelectedPlan(plan);
    console.log(`Purchasing ${plan.name} - ${billingCycle} billing`);
    alert(`Redirecting to payment for ${plan.name} (${billingCycle} billing)...`);
  };

  const formatFeatureValue = (value:any) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-IN');
    }
    return value;
  };

  const calculateSavings = (monthly:any, yearly:any) => {
    const monthlyCost = monthly * 12;
    const savings = monthlyCost - yearly;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { savings, percentage };
  };

  if (!profile) {
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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Current Subscription Status */}
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentPlan.status === 'Active' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
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
  )} days
</p>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4">
            <div className="relative flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {subscriptionPlans.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const savings = billingCycle === 'yearly' ? calculateSavings(plan.monthlyPrice, plan.yearlyPrice) : null;
            
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'border-emerald-500 dark:border-emerald-400 scale-105' 
                    : plan.borderColor
                } ${plan.color}`}
              >
                {plan.popular && (
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
                      <span className="text-gray-600 dark:text-gray-400">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    {savings && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                        Save ₹{savings.savings.toLocaleString('en-IN')} ({savings.percentage}%) yearly
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                    className={`w-full py-4 px-6 rounded-xl text-white font-semibold transition-all duration-200 transform hover:scale-105 ${plan.buttonColor} ${
                      currentPlan.id === plan.id 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:shadow-lg'
                    }`}
                    disabled={currentPlan.id === plan.id}
                  >
                    {currentPlan.id === plan.id ? 'Current Plan' : 'Buy Now'}
                  </button>

                  {currentPlan.id === plan.id && (
                    <p className="text-center text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                      ✓ Active Subscription
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Compare All Features
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Features</th>
                  {subscriptionPlans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Monthly Price</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      ₹{plan.monthlyPrice.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Text Messages</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 text-gray-900 dark:text-white">
                      {formatFeatureValue(plan.features.textMessages)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Audio Messages</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 text-gray-900 dark:text-white">
                      {formatFeatureValue(plan.features.audioMessages)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">Video Messages</td>
                  {subscriptionPlans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4 text-gray-900 dark:text-white">
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