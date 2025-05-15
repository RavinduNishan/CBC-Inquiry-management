import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { MdArrowBack, MdPerson, MdAccessTime, MdLock, MdEmail, MdPhone, MdBusiness, MdSecurity } from 'react-icons/md';
import AuthContext from '../../context/AuthContext';

const UserProfile = ({ user: initialUser, onBack, onProfileUpdate }) => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(initialUser);
  const { logout } = useContext(AuthContext);

  // Fetch complete user data directly from API to ensure we have all fields
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await axios.get('http://localhost:5555/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          console.log("Fresh user data from API:", response.data);
          setUser({...initialUser, ...response.data});
        }
      } catch (error) {
        console.error("Failed to fetch user profile data:", error);
      }
    };
    
    fetchUserData();
  }, [initialUser]);

  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    // Clear error/success messages when user starts typing
    setResetError('');
    setResetSuccess('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setResetError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setResetError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await axios.put(
        'http://localhost:5555/user/reset-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResetSuccess('Password has been reset successfully. You will need to log in again.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Make sure we clear this flag to prevent auto-logout loop
      localStorage.removeItem('profileVersion');
      
      // Close the password reset form after successful reset
      setTimeout(() => {
        setShowPasswordReset(false);
        
        // Force logout with a message - but set a flag to avoid immediate re-login checks
        setTimeout(() => {
          localStorage.setItem('justLoggedOut', 'true');
          logout('Your password has been updated. Please log in again with your new password.', '/login');
          // No need for window.location.href redirect as the logout function handles it
        }, 1500);
      }, 1500);
      
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setResetError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to help troubleshoot the data structure
  useEffect(() => {
    console.log("User data in profile:", user);
  }, [user]);

  // Format date using the EXACT same approach as in inquiryTable.jsx
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date format error';
    }
  };

  // Fetch fresh user data to ensure we have timestamps
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch user profile data
        const response = await axios.get('http://localhost:5555/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Log timestamps for debugging
        console.log("API Response User Data:", response.data);
        console.log("createdAt from API:", response.data.createdAt);
        console.log("updatedAt from API:", response.data.updatedAt);
        
        // Update the component if callback exists
        if (onProfileUpdate && response.data) {
          onProfileUpdate(response.data);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserData();
  }, []);

  // Add a diagnostic function to help debug user data
  useEffect(() => {
    if (user) {
      console.log("User data:", user);
      console.log("Created date type:", typeof user.createdAt);
      console.log("Created date value:", user.createdAt);
      console.log("Updated date type:", typeof user.updatedAt);
      console.log("Updated date value:", user.updatedAt);
    }
  }, [user]);

  // Function to get access level display name
  const getAccessLevelName = (level) => {
    switch (level) {
      case 'admin': return 'Administrator';
      case 'manager': return 'Department Manager';
      case 'staff': return 'Staff Member';
      default: return 'Staff Member';
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6 m-0">
      <div className='flex justify-between items-center mb-6'>
        <div className="flex items-center">
          <h1 className='text-2xl font-bold text-gray-800 border-b-2 border-sky-500 pb-1'>My Profile</h1>
          <span className="ml-2 px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-md">
            {user._id?.substring(0, 8) || 'User'}
          </span>
        </div>
        <button
          onClick={onBack}
          className='bg-white hover:bg-gray-100 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm border border-gray-200'
        >
          <MdArrowBack className="mr-2" /> Back to Dashboard
        </button>
      </div>
      
      {/* Enhanced user header with decorative elements */}
      <div className="flex flex-col md:flex-row items-center md:items-start mb-8 p-5 bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-bl-full opacity-50 z-0"></div>
        <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mr-5 shadow-lg z-10">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left mt-4 md:mt-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <div className="flex flex-col md:flex-row md:items-center mt-1 mb-2">
            <div className="flex items-center justify-center md:justify-start">
              <MdEmail className="text-gray-500 mr-1" />
              <p className="text-gray-600">{user.email}</p>
            </div>
            {user.phone && (
              <div className="flex items-center justify-center md:justify-start mt-1 md:mt-0 md:ml-3">
                <MdPhone className="text-gray-500 mr-1" />
                <p className="text-gray-500 text-sm">{user.phone}</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
              user.status === 'active' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {user.status === 'active' ? '● Active' : '● Inactive'}
            </span>
            {/* Add access level badge */}
            <span className="px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-blue-100 text-blue-800 border border-blue-200">
              {getAccessLevelName(user.accessLevel)}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Column 1: User Details */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transform transition-transform hover:scale-[1.02] hover:shadow-md">
          <div className="flex items-center mb-4">
            <MdPerson className="text-sky-500 text-xl mr-2" />
            <h3 className="text-md font-semibold text-gray-700">Personal Information</h3>
          </div>
          <div className="space-y-4">
            <div className="border-l-2 border-sky-200 pl-3">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="text-sm font-medium">{user.name}</p>
            </div>
            <div className="border-l-2 border-sky-200 pl-3">
              <p className="text-xs text-gray-500">Email Address</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div className="border-l-2 border-sky-200 pl-3">
              <p className="text-xs text-gray-500">Phone Number</p>
              <p className="text-sm font-medium">{user.phone || 'Not specified'}</p>
            </div>
            <div className="border-l-2 border-sky-200 pl-3">
              <p className="text-xs text-gray-500">Department</p>
              <p className="text-sm font-medium">{user.department || 'Not assigned'}</p>
            </div>
            <div className="border-l-2 border-sky-200 pl-3">
              <p className="text-xs text-gray-500">Access Level</p>
              <p className="text-sm font-medium">{getAccessLevelName(user.accessLevel)}</p>
            </div>
          </div>
        </div>
        
        {/* Column 2: Timeline */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transform transition-transform hover:scale-[1.02] hover:shadow-md">
          <div className="flex items-center mb-4">
            <MdAccessTime className="text-sky-500 text-xl mr-2" />
            <h3 className="text-md font-semibold text-gray-700">Account Timeline</h3>
          </div>
          <div className="space-y-4">
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 h-full border-l-2 border-dashed border-sky-200"></div>
              <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-sky-500"></div>
              <p className="text-xs text-gray-500">Account Created</p>
              <p className="text-sm font-medium">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div className="relative pl-6 pb-4">
              <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-sky-500"></div>
              <p className="text-xs text-gray-500">Last Updated</p>
              <p className="text-sm font-medium">
                {formatDate(user.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Password Reset Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MdLock className="text-sky-600 text-xl mr-2" />
              <div>
                <h4 className="font-semibold text-gray-800 text-md">Password Management</h4>
                <p className="text-sm text-gray-600">Change your account password</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPasswordReset(!showPasswordReset)}
              className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center ${
                showPasswordReset 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                  : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
              }`}
            >
              {showPasswordReset ? 'Cancel' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Password Reset Form */}
        {showPasswordReset && (
          <div className="p-5">
            {resetError && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm border-l-4 border-red-400">
                <strong>Error:</strong> {resetError}
              </div>
            )}
            
            {resetSuccess && (
              <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md text-sm border-l-4 border-green-400">
                <strong>Success:</strong> {resetSuccess}
              </div>
            )}
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    autoComplete="current-password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Enter current password"
                  />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    autoComplete="new-password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Enter new password"
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 6 characters required</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg shadow-sm flex items-center ${
                    isLoading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                  }`}
                >
                  <MdLock className="mr-1.5" />
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
