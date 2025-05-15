import React, { useState, useContext, useEffect } from 'react';
import { format } from 'date-fns';
import { MdOutlineDelete, MdOutlineEdit, MdLockReset, MdArrowBack, MdPerson, MdSecurity, MdAccessTime, MdBusiness } from 'react-icons/md';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import EditUserForm from './EditUserForm';
import AuthContext from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDetail = ({ user, onBack, onUserUpdated }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const { user: currentUser, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate(); // Add this
  
  // Add security check to redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      console.log('Non-admin attempted to access user details');
      enqueueSnackbar('You do not have permission to manage users', { 
        variant: 'error' 
      });
      // Go back to dashboard
      if (onBack) onBack();
      // As backup, navigate to dashboard
      navigate('/dashboard');
    }
  }, [isAdmin, navigate, enqueueSnackbar, onBack]);
  
  // Add debug log
  useEffect(() => {
    console.log('UserDetail rendered with isAdmin:', isAdmin);
    console.log('Current user:', currentUser);
    console.log('User being viewed:', user);
  }, [isAdmin, currentUser, user]);
  
  // Format date for readability
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP p');
  };

  const handleEditUser = () => {
    setShowEditForm(true);
  };

  const handleDeleteUser = async () => {
    // Show a confirmation dialog
    const confirmDelete = window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`);
    
    if (confirmDelete) {
      try {
        // Get the token to include in the request
        const token = localStorage.getItem('token');
        
        // Make the delete request
        await axios.delete(`http://localhost:5555/user/${user._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Show success notification
        enqueueSnackbar(`User ${user.name} was deleted successfully and logged out if they were online.`, { variant: 'success' });
        
        // Call the callback to refresh the list and go back to the users list
        if (onUserUpdated) onUserUpdated();
      } catch (error) {
        console.error('Error deleting user:', error);
        enqueueSnackbar(error.response?.data?.message || 'Failed to delete user', { 
          variant: 'error' 
        });
      }
    }
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setResetPasswordError('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setResetPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsResetting(true);
      setResetPasswordError('');
      
      // Get auth token
      const token = localStorage.getItem('token');
      
      // Log request to help debug
      console.log(`Sending password reset for user ${user._id}`);
      
      // Use the endpoint from backend/routes/userRoute.js
      const response = await axios.post(
        `http://localhost:5555/user/${user._id}/set-password`,
        { 
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Close modal and show success message
      setShowPasswordReset(false);
      setNewPassword('');
      setConfirmPassword('');
      
      // Get notification status from response
      const notificationSent = response.data.notificationSent;
      
      // Show appropriate success message
      if (notificationSent) {
        enqueueSnackbar(`Password for ${user.name} has been reset. User has been notified and logged out.`, { variant: 'success' });
      } else {
        enqueueSnackbar(`Password for ${user.name} has been reset successfully. User will be logged out on next login.`, { variant: 'success' });
      }
    } catch (error) {
      console.error('Admin password reset error:', error);
      // More focused error message
      let errorMsg = 'Failed to reset password';
      
      if (error.response) {
        if (error.response.status === 403) {
          errorMsg = 'You do not have permission to reset passwords';
        } else if (error.response.status === 404) {
          errorMsg = 'User not found';
        } else if (error.response.data && error.response.data.message) {
          errorMsg = error.response.data.message;
        }
      }
      
      setResetPasswordError(errorMsg);
    } finally {
      setIsResetting(false);
    }
  };

  const togglePasswordReset = () => {
    setShowPasswordReset(!showPasswordReset);
    if (!showPasswordReset) {
      // Reset form state when opening
      setNewPassword('');
      setConfirmPassword('');
      setResetPasswordError('');
    }
  };

  // Function to get badge styling based on access level
  const getAccessLevelBadge = (accessLevel) => {
    switch (accessLevel) {
      case 'admin':
        return <span className="px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-purple-100 text-purple-800 border border-purple-200">Admin</span>;
      case 'manager':
        return <span className="px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-blue-100 text-blue-800 border border-blue-200">Department Manager</span>;
      case 'staff':
        return <span className="px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-green-100 text-green-800 border border-green-200">Staff Member</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-gray-100 text-gray-800 border border-gray-200">Unknown</span>;
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-md border border-gray-200 p-6">
      {!showEditForm ? (
        // User Details View
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-sky-500 pb-1">User Profile</h2>
              <span className="ml-2 px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-md">ID: {user._id?.substring(0, 8) || 'N/A'}</span>
            </div>
            <button
              onClick={onBack}
              className="bg-white hover:bg-gray-100 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm border border-gray-200 flex items-center"
            >
              <MdArrowBack className="mr-1" /> Back to Users
            </button>
          </div>

          {/* Enhanced user header with larger avatar */}
          <div className="flex flex-col md:flex-row items-center md:items-start mb-8 p-5 bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-bl-full opacity-50 z-0"></div>
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mr-5 shadow-lg z-10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center md:text-left mt-4 md:mt-0 z-10">
              <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
              <div className="flex flex-col md:flex-row md:items-center mt-1 mb-2">
                <p className="text-gray-600">{user.email}</p>
                {user.phone && (
                  <p className="md:ml-3 text-gray-500 text-sm">{user.phone}</p>
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
                {getAccessLevelBadge(user.accessLevel)}
              </div>
            </div>
          </div>

          {/* Main content with enhanced 2-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Column 1: User Details with icons */}
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
                  <p className="text-sm font-medium">{user.phone || 'Not provided'}</p>
                </div>
                <div className="border-l-2 border-sky-200 pl-3">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-sm font-medium">{user.department || 'Not assigned'}</p>
                </div>
                <div className="border-l-2 border-sky-200 pl-3">
                  <p className="text-xs text-gray-500">Access Level</p>
                  <p className="text-sm font-medium capitalize">{user.accessLevel || 'Staff Member'}</p>
                </div>
              </div>
            </div>
            
            {/* Column 2: Timeline with icons */}
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
                  <p className="text-sm font-medium">{formatDate(user.createdAt)}</p>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-0 top-0 h-full border-l-2 border-dashed border-sky-200"></div>
                  <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-sky-500"></div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">{formatDate(user.updatedAt)}</p>
                </div>
                <div className="relative pl-6 pb-4">
                  <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-sky-500"></div>
                  <p className="text-xs text-gray-500">Last Activity</p>
                  <p className="text-sm font-medium">
                    {user.lastActivity ? formatDate(user.lastActivity) : 'No recent activity'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons with enhanced styling */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-4">User Management Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleEditUser}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg transition shadow-sm"
              >
                <MdOutlineEdit className="text-lg" />
                Edit User Profile
              </button>
              
              <button
                onClick={handleDeleteUser}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition shadow-sm"
                title="Permanently delete this user"
              >
                <MdOutlineDelete className="text-lg" />
                Delete User
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Note: Editing a user allows you to change their details. Deleting a user cannot be undone.
            </p>
          </div>

          {/* Password Reset Section - Only show for admins */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 text-md">Admin Password Management</h4>
                    <p className="text-sm text-gray-600">Reset password for {user.name}</p>
                  </div>
                  <button 
                    onClick={togglePasswordReset}
                    className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center ${
                      showPasswordReset 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                        : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                    }`}
                  >
                    <MdLockReset className="mr-1.5 text-lg" />
                    {showPasswordReset ? 'Cancel' : 'Reset Password'}
                  </button>
                </div>
              </div>

              {/* Enhanced Password Reset Form */}
              {showPasswordReset && (
                <div className="p-5">
                  <div className="mb-4 bg-blue-50 text-blue-700 p-3 rounded-md text-sm border-l-4 border-blue-400">
                    <strong>Admin Action:</strong> This will reset the user's password without requiring their old password.
                    Make sure to communicate the new password securely to the user.
                  </div>
                
                  {resetPasswordError && (
                    <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm border-l-4 border-red-400">
                      <strong>Error:</strong> {resetPasswordError}
                    </div>
                  )}
                  
                  <form 
                    id="passwordResetForm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          disabled={isResetting}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                        />
                        <p className="mt-1 text-xs text-gray-500">Minimum 6 characters required</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                          disabled={isResetting}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                        />
                        <p className="mt-1 text-xs text-gray-500">Must match the password above</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className={`px-4 py-2 rounded-lg shadow-sm font-medium flex items-center ${
                          isResetting 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white'
                        }`}
                        disabled={isResetting}
                      >
                        <MdLockReset className="mr-1.5" />
                        {isResetting ? 'Resetting Password...' : 'Set New Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        // Edit User Form Component
        <EditUserForm 
          user={user} 
          onBack={() => setShowEditForm(false)} 
          onUserUpdated={() => {
            setShowEditForm(false);
            if (onUserUpdated) onUserUpdated();
          }} 
        />
      )}
    </div>
  );
};

export default UserDetail;