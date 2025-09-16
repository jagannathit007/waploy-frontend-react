import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { apiCall } from '../services/api/auth';
import PageMeta from "../components/common/PageMeta";


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

const UserProfiles = () => {
  const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL || 'http://localhost:3090/';
  const { profile, token, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [companyForm, setCompanyForm] = useState({
    name: '',
    website: '',
    business: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const userData = JSON.parse(localStorage.getItem("profile") || "{}");
  const userRole = userData?.role;

  useEffect(() => {
    if (profile) {
      setUserForm({
        firstName: profile?.profile?.firstName || '',
        lastName: profile?.profile?.lastName || '',
        phone: profile?.profile?.phone || '',
      });
      setCompanyForm({
        name: profile.company.name || '',
        website: profile.company.website || '',
        business: profile.company.business || '',
      });
      
      // Set existing profile image preview from backend
      if (profile?.profile?.avatar) {
        setProfileImagePreview(VITE_IMAGE_URL + profile.profile.avatar);
      }
    }
  }, [profile]);

  const refreshProfile = async () => {
    try {
      const response = await apiCall('/get-profile', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, token ?? undefined);
      
      if (response && response.data) {
        localStorage.setItem('profile', JSON.stringify(response.data));
        if (updateProfile) {
          updateProfile(response.data);
        }
        return response.data;
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      throw error;
    }
  };

  type PasswordField = "current" | "new" | "confirm";

  const togglePasswordVisibility = (field: PasswordField) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const resetPasswordForm = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>, isDirectUpload: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Toast.fire({
          icon: 'error',
          title: 'Please select a valid image file',
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Toast.fire({
          icon: 'error',
          title: 'Image size must be less than 5MB',
        });
        return;
      }
      
      setProfileImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // If it's direct upload from header camera icon, upload immediately
      if (isDirectUpload) {
        setTimeout(() => {
          handleDirectImageUpload(file);
        }, 100);
      }
    }
  };

  const handleDirectImageUpload = async (file: File) => {
    if (!file) {
      Toast.fire({
        icon: 'error',
        title: 'Please select an image first',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      // Keep existing user details
      formData.append('firstName', profile?.profile?.firstName || '');
      formData.append('lastName', profile?.profile?.lastName || '');
      if (profile?.profile?.phone) {
        formData.append('phone', profile.profile.phone);
      }
      
      await apiCall(
        '/update-detail', 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );
      
      Toast.fire({
        icon: 'success',
        title: 'Profile image updated successfully!',
      });
      
      // Reset file inputs
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (headerFileInputRef.current) {
        headerFileInputRef.current.value = '';
      }
      
      setProfileImageFile(null);
      await refreshProfile();
      
    } catch (error) {
      console.error('Update profile image error:', error);
      Toast.fire({
        icon: 'error',
        title: (error instanceof Error && error.message) ? error.message : 'Failed to update profile image',
      });
    } finally {
      setLoading(false);
    }
  };

  // const handleImageRemove = async () => {
  //   const result = await Swal.fire({
  //     title: 'Remove Profile Image?',
  //     text: 'Are you sure you want to remove your profile image?',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     confirmButtonText: 'Yes, remove it!'
  //   });

  //   if (result.isConfirmed) {
  //     setLoading(true);
  //     try {
  //       const formData = new FormData();
  //       formData.append('removeProfileImage', 'true');
  //       // Keep existing user details
  //       formData.append('firstName', profile?.profile?.firstName || '');
  //       formData.append('lastName', profile?.profile?.lastName || '');
  //       if (profile?.profile?.phone) {
  //         formData.append('phone', profile.profile.phone);
  //       }
        
  //       await apiCall(
  //         '/update-detail', 
  //         {
  //           method: 'POST',
  //           headers: {
  //             'Authorization': `Bearer ${token}`
  //           },
  //           body: formData
  //         }
  //       );
        
  //       Toast.fire({
  //         icon: 'success',
  //         title: 'Profile image removed successfully!',
  //       });
        
  //       setProfileImagePreview(null);
  //       setProfileImageFile(null);
  //       await refreshProfile();
  //     } catch (error) {
  //       console.error('Remove profile image error:', error);
  //       Toast.fire({
  //         icon: 'error',
  //         title: (error instanceof Error && error.message) ? error.message : 'Failed to remove profile image',
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  // };

  const handleUserSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('firstName', userForm.firstName);
      formData.append('lastName', userForm.lastName);
      if (userForm.phone) {
        formData.append('phone', userForm.phone);
      }
      if (profileImageFile) {
        formData.append('avatar', profileImageFile);
      }
      
      await apiCall('/update-detail', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      Toast.fire({
        icon: 'success',
        title: 'User details updated successfully!',
      });
      
      if (profileImageFile) {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setProfileImageFile(null);
      }
      
      await refreshProfile();
      setShowUserForm(false);
    } catch (error) {
      console.error('Update user details error:', error);
      Toast.fire({
        icon: 'error',
        title: error instanceof Error ? error.message : 'Failed to update user details',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall(
        '/update-company-detail', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: companyForm.name,
            website: companyForm.website,
            business: companyForm.business,
          })
        }
      );
      
      Toast.fire({
        icon: 'success',
        title: 'Company details updated successfully!',
      });
      
      await refreshProfile();
      setShowCompanyForm(false);
    } catch (error) {
      console.error('Update company details error:', error);
      Toast.fire({
        icon: 'error',
        title: (error instanceof Error && error.message) ? error.message : 'Failed to update company details',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Toast.fire({
        icon: 'error',
        title: 'New password and confirm password do not match',
      });
      return;
    }
    setLoading(true);
    try {
      await apiCall(
        '/change-password', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          })
        }
      );
      
      Toast.fire({
        icon: 'success',
        title: 'Password changed successfully!',
      });
      
      resetPasswordForm();
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Change password error:', error);
      Toast.fire({
        icon: 'error',
        title: (error instanceof Error && error.message) ? error.message : 'Failed to change password',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'UD';
  };

  return (
    <>
      <PageMeta
        title="React.js Profile Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Profile Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className='p-6'>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white text-2xl font-semibold backdrop-blur-sm">
                    {profileImagePreview || profile?.profile?.avatar ? (
                      <img 
                        src={profileImagePreview || profile?.profile?.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(profile?.profile?.firstName, profile?.profile?.lastName)
                    )}
                  </div>
                  
                  {/* Camera Icon Overlay for Direct Upload */}
                  <label 
                    htmlFor="header-profile-image"
                    className={`absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Upload profile image"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </label>
                  
                  {/* Remove Image Button */}
                  {/* {(profileImagePreview || profile?.profile?.avatar) && (
                    <button
                      onClick={handleImageRemove}
                      disabled={loading}
                      className="absolute -top-1 -right-1 w-8 h-8 bg-red-600 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                      title="Remove profile image"
                    >
                      ×
                    </button>
                  )} */}
                  
                  <input
                    ref={headerFileInputRef}
                    id="header-profile-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProfileImageChange(e, true)}
                    className="hidden"
                    disabled={loading}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile?.profile?.firstName} {profile?.profile?.lastName}
                  </h1>
                  <p className="text-emerald-100">{profile.email}</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mt-2">
                    {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            
            {/* Personal Information */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal details</p>
                </div>
                <button
                  onClick={() => setShowUserForm(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile?.profile?.firstName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile?.profile?.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile?.profile?.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Information */}
            {userRole !== "team_member" && (<div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Company Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your company details</p>
                </div>
                <button
                  onClick={() => setShowCompanyForm(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile.company.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile.company.website || 'Not set'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile.company.business || 'Not set'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</label>
                    <p className="text-gray-900 dark:text-white font-medium">{profile.company.phone || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>)}

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Security Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Update your password and security preferences</p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* User Form Modal */}
          {showUserForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800 transform transition-all">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-t-2xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update Profile</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Edit your personal information</p>
                </div>
                <form onSubmit={handleUserSubmit} className="px-6 py-6 space-y-5">
                  {/* Profile Image Upload in User Form */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Profile Image</label>
                    <div className="relative">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600">
                            {profileImagePreview || profile?.profile?.avatar ? (
                              <img 
                                src={profileImagePreview || profile?.profile?.avatar} 
                                alt="Profile preview" 
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="text-gray-400 text-sm text-center">
                                {getInitials(profile?.profile?.firstName, profile?.profile?.lastName)}
                              </div>
                            )}
                          </div>
                          <label 
                            htmlFor="modal-profile-image"
                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-600 border-2 border-white rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </label>
                        </div>
                        <div className="flex-1">
                          <input
                            ref={fileInputRef}
                            id="modal-profile-image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleProfileImageChange(e, false)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            disabled={loading}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={userForm.firstName}
                      onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={userForm.lastName}
                      onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                  {/* <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="Enter phone number"
                    />
                  </div> */}
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserForm(false);
                        setProfileImageFile(null);
                        // Reset preview to current avatar
                        if (profile?.profile?.avatar) {
                          setProfileImagePreview(profile.profile.avatar);
                        } else {
                          setProfileImagePreview(null);
                        }
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-[100px]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Company Form Modal */}
          {showCompanyForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800 transform transition-all">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-t-2xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Update Company Details</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Edit your company information</p>
                </div>
                <form onSubmit={handleCompanySubmit} className="px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="Enter company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Website</label>
                    <input
                      type="text"
                      value={companyForm.website}
                      onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="Enter website URL"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Business Type</label>
                    <input
                      type="text"
                      value={companyForm.business}
                      onChange={(e) => setCompanyForm({ ...companyForm, business: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                      placeholder="Enter business type"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setShowCompanyForm(false)}
                      className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-[100px]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Password Form Modal */}
          {showPasswordForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto h-full w-full z-[999] flex items-center justify-center p-4">
              <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-auto border border-gray-200 dark:border-gray-800 transform transition-all">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-t-2xl">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update your account password</p>
                </div>
                <form onSubmit={handlePasswordSubmit} className="px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {showPasswords.current ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                        placeholder="Enter new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {showPasswords.new ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                      >
                        {showPasswords.confirm ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        resetPasswordForm();
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-[120px]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </div>
                      ) : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UserProfiles;