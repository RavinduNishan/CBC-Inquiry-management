import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Add date-fns for consistent date formatting
import { format } from 'date-fns';

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
      
      // Try different ways to get the authentication token
      let token = null;
      
      // Method 1: Check if user object passed as prop has token
      if (user && user.token) {
        token = user.token;
      } 
      // Method 2: Try to retrieve from localStorage as userInfo object
      else {
        try {
          const userInfo = localStorage.getItem('userInfo');
          if (userInfo) {
            const parsedUserInfo = JSON.parse(userInfo);
            if (parsedUserInfo && parsedUserInfo.token) {
              token = parsedUserInfo.token;
            }
          }
        } catch (err) {
          console.error('Error parsing localStorage data:', err);
        }
      }
      
      // Method 3: Try direct token storage
      if (!token) {
        token = localStorage.getItem('token') || sessionStorage.getItem('token');
      }
      
      if (!token) {
        console.error('No authentication token found in storage');
        setResetError('Authentication required. Please log in again.');
        setIsLoading(false);
        return;
      }

      console.log('Using token for authentication:', token.substring(0, 10) + '...');
      
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

      setResetSuccess('Password has been reset successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close the password reset form after successful reset
      setTimeout(() => {
        setShowPasswordReset(false);
        
        // If onProfileUpdate callback exists, use it to refresh user data
        if (typeof onProfileUpdate === 'function') {
          onProfileUpdate();
        } else {
          // Otherwise, reload the page after a short delay to show the success message
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
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
      console.log("Permissions type:", typeof user.permissions);
      console.log("Permissions value:", user.permissions);
    }
  }, [user]);

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-2xl font-bold text-gray-800'>My Profile</h1>
        <button
          onClick={onBack}
          className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5'>
        {/* User header and basic info */}
        <div className="flex items-center mb-5">
          <div className="h-16 w-16 rounded-full bg-sky-100 flex items-center justify-center text-sky-500 text-xl font-bold mr-5">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="mt-1 inline-block px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">
              {user.accessLevel}
            </p>
          </div>
        </div>

        {/* Main content in 3-column grid for better space usage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Column 1: User Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-3">User Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-sm font-medium">{user.phone || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          {/* Column 2: Account Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-3">Account Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Access Level</p>
                <p className="text-sm font-medium">{user.accessLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Account Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Permissions</p>
                {user.accessLevel === 'Administrator' ? (
                  <span className="text-xs text-gray-600">All permissions</span>
                ) : (
                  <div className="mt-1">
                    {user.permissions && Array.isArray(user.permissions) && user.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.map((permission, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No permissions</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Column 3: Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-md font-medium text-gray-700 mb-3">Account Timeline</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Account Created</p>
                <p className="text-sm font-medium">
                  {formatDate(user.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDate(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Reset Section - More compact */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800 text-sm">Password Management</h4>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>
              <button 
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm"
              >
                {showPasswordReset ? 'Cancel' : 'Reset Password'}
              </button>
            </div>

            {/* Password Reset Form */}
            {showPasswordReset && (
              <div className="mt-4 border-t border-gray-200 pt-3">
                <form onSubmit={handleResetPassword} className="space-y-3">
                  {resetError && (
                    <div className="bg-red-50 text-red-700 p-2 rounded-md text-xs">
                      {resetError}
                    </div>
                  )}
                  
                  {resetSuccess && (
                    <div className="bg-green-50 text-green-700 p-2 rounded-md text-xs">
                      {resetSuccess}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        autocomplete="current-password"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        autocomplete="new-password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        autocomplete="new-password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-3 py-1.5 ${
                        isLoading ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'
                      } text-white rounded-lg transition-colors text-sm`}
                    >
                      {isLoading ? 'Resetting...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
