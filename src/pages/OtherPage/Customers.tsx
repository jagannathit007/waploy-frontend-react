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

interface Customer {
  _id: string;
  name: string;
  countryCode: string;
  phone: string;
  email: string;
  notes: string;
  isBlocked: boolean;
  isActive: boolean;
  user: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
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

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    _id: '',
    name: '',
    countryCode: '',
    phone: '',
    email: '',
  });
  const [originalMobile, setOriginalMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
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

  const sendOTP = async (
    data: { mobileNo: string; name: string }
  ): Promise<ApiResponse<number>> => {
    try {
      const response: AxiosResponse<ApiResponse<number>> = await api.post('/sendotp', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 200 || response.data.data !== 1) {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOTP = async (
    data: { mobileNo: string; otpCode: string }
  ): Promise<ApiResponse<number>> => {
    try {
      const response: AxiosResponse<ApiResponse<number>> = await api.post('/verifyotp', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 200 || response.data.data !== 1) {
        throw new Error(response.data.message || 'Failed to verify OTP');
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const getCustomers = async (
    data: { search?: string; page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Customer>>> => {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<Customer>>> = await api.post('/get-customers', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 200 || !response.data.data) {
        throw new Error(response.data.message || 'Failed to fetch customers');
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch customers');
    }
  };

  const createCustomer = async (
    data: { name: string; countryCode: string; phone: string; email?: string; notes?: string; metadata?: object }
  ): Promise<ApiResponse<Customer>> => {
    try {
      const response: AxiosResponse<ApiResponse<Customer>> = await api.post('/create-customer', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 200 || !response.data.data) {
        throw new Error(response.data.message || 'Failed to create customer');
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create customer');
    }
  };

  const updateCustomer = async (
    data: { _id: string; name?: string; countryCode?: string; phone?: string; email?: string; notes?: string; metadata?: object }
  ): Promise<ApiResponse<Customer>> => {
    try {
      const response: AxiosResponse<ApiResponse<Customer>> = await api.post('/update-customer', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 200 || !response.data.data) {
        throw new Error(response.data.message || 'Failed to update customer');
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update customer');
    }
  };

  const toggleBlock = async (
    data: { _id: string; value: boolean }
  ): Promise<ApiResponse<Customer>> => {
    try {
      const response: AxiosResponse<ApiResponse<Customer>> = await api.post('/toggle-block', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 200 || !response.data.data) {
        throw new Error(response.data.message || 'Failed to toggle block');
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to toggle block');
    }
  };

  const deleteCustomer = async (
    data: { _id: string }
  ): Promise<ApiResponse<boolean>> => {
    try {
      const response: AxiosResponse<ApiResponse<boolean>> = await api.post('/delete-customer', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status !== 200 || !response.data.data) {
        throw new Error(response.data.message || 'Failed to delete customer');
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await getCustomers({ search, page, limit: 10 });
      setCustomers(response.data?.docs || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to fetch customers',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      _id: '',
      name: '',
      countryCode: '',
      phone: '',
      email: '',
    });
    setOriginalMobile('');
    setOtpSent(false);
    setOtpCode('');
    setVerified(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentMobile = form.countryCode + form.phone;
    if (form.phone && (form._id ? currentMobile !== originalMobile : true) && !verified) {
      Toast.fire({
        icon: 'warning',
        title: 'Please verify the mobile number',
      });
      return;
    }
    setLoading(true);
    try {
      const data = {
        name: form.name,
        countryCode: form.countryCode,
        phone: form.phone,
        email: form.email,
        metadata: {}, // Placeholder, can be extended
      };
      if (form._id) {
        await updateCustomer({ _id: form._id, ...data });
        Toast.fire({
          icon: 'success',
          title: 'Customer updated successfully!',
        });
      } else {
        await createCustomer(data);
        Toast.fire({
          icon: 'success',
          title: 'Customer created successfully!',
        });
      }
      resetForm();
      setShowForm(false);
      fetchCustomers();
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to save customer',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!form.name || !form.countryCode || !form.phone) {
      Toast.fire({
        icon: 'warning',
        title: 'Name, country code, and phone are required to send OTP',
      });
      return;
    }
    setSendingOtp(true);
    try {
      await sendOTP({ mobileNo: form.countryCode + form.phone, name: form.name });
      setOtpSent(true);
      Toast.fire({
        icon: 'success',
        title: 'OTP sent successfully!',
      });
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to send OTP',
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    setVerifying(true);
    try {
      await verifyOTP({ mobileNo: form.countryCode + form.phone, otpCode });
      setVerified(true);
      setOtpSent(false);
      setOtpCode('');
      Toast.fire({
        icon: 'success',
        title: 'OTP verified successfully!',
      });
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to verify OTP',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setForm({
      _id: customer._id,
      name: customer.name,
      countryCode: customer.countryCode,
      phone: customer.phone,
      email: customer.email,
    });
    setOriginalMobile(customer.countryCode + customer.phone);
    setVerified(false);
    setOtpSent(false);
    setOtpCode('');
    setShowForm(true);
  };

  const handleToggleBlock = async (_id: string, currentBlocked: boolean) => {
    setLoading(true);
    try {
      await toggleBlock({ _id, value: !currentBlocked });
      Toast.fire({
        icon: 'success',
        title: `Customer ${!currentBlocked ? 'blocked' : 'unblocked'} successfully!`,
      });
      fetchCustomers();
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to toggle block',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    setLoading(true);
    try {
      await deleteCustomer({ _id });
      Toast.fire({
        icon: 'success',
        title: 'Customer deleted successfully!',
      });
      fetchCustomers();
    } catch (error: any) {
      Toast.fire({
        icon: 'error',
        title: error.message || 'Failed to delete customer',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (field: 'countryCode' | 'phone', value: string) => {
    setForm({ ...form, [field]: value });
    const newMobile = field === 'countryCode' ? value + form.phone : form.countryCode + value;
    if (form._id && newMobile !== originalMobile) {
      setVerified(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 p-6">
      <div className="col-span-12 space-y-6">
        {/* Header and Search */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Customer Management</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Manage your customers efficiently</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Customer
            </button>
          </div>
        </div>

        {/* Customers Section */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-hidden">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading...</span>
              </div>
            )}
            
            {!loading && customers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No customers found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new customer.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200 dark:divide-gray-800">
                    {customers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{customer.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.countryCode} {customer.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.isBlocked 
                              ? 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400' 
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400'
                          }`}>
                            {customer.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {`${customer.user.profile.firstName} ${customer.user.profile.lastName}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(customer)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleBlock(customer._id, customer.isBlocked)}
                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                                customer.isBlocked 
                                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500' 
                                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                              }`}
                            >
                              {customer.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              onClick={() => handleDelete(customer._id)}
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
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
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

      {/* Customer Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#c0d9c740] bg-opacity-50 overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {form._id ? 'Update Customer' : 'Add Customer'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter name"
                  required
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country Code</label>
                  <input
                    type="text"
                    value={form.countryCode}
                    onChange={(e) => handlePhoneChange('countryCode', e.target.value)}
                    disabled={verified}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    placeholder="+1"
                    required
                  />
                </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <div className="flex">
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => handlePhoneChange('phone', e.target.value)}
                      disabled={verified}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Enter phone"
                      required
                    />
                    {!verified && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={sendingOtp || !form.countryCode || !form.phone || !form.name}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-r-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {sendingOtp ? 'Sending...' : 'Send OTP'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {otpSent && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OTP Code</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="Enter OTP"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      disabled={verifying || !otpCode}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {verifying ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  placeholder="Enter email"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;