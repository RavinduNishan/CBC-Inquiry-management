import React, { useState } from 'react';
import axios from 'axios';

const UserProfile = ({ user, onBack, onProfileUpdate }) => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold text-gray-800'>My Profile</h1>
        <button
          onClick={onBack}
          className='bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 flex items-center text-sm font-medium transition-all duration-200 shadow-sm'
        >
          Back to Dashboard
        </button>
      </div>
      
      <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-6'>
        <div className="flex items-center mb-8">
          <div className="h-20 w-20 rounded-full bg-sky-100 flex items-center justify-center text-sky-500 text-2xl font-bold mr-6">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <p className="mt-1 inline-block px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">
              {user.accessLevel}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">User Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-lg">{user.phone || 'Not specified'}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Account Information</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Access Level</p>
                <p className="text-lg">{user.accessLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="text-lg">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Password Reset Section */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Security Settings</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">Password Management</h4>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <button 
                onClick={() => setShowPasswordReset(!showPasswordReset)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
              >
                {showPasswordReset ? 'Cancel' : 'Reset Password'}
              </button>
            </div>

            {/* Password Reset Form */}
            {showPasswordReset && (
              <div className="mt-6 border-t border-gray-200 pt-4">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {resetError && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                      {resetError}
                    </div>
                  )}
                  
                  {resetSuccess && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm">
                      {resetSuccess}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`px-4 py-2 ${
                        isLoading ? 'bg-gray-400' : 'bg-sky-600 hover:bg-sky-700'
                      } text-white rounded-lg transition-colors`}
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
