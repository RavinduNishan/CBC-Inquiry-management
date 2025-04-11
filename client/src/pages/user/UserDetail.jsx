import React, { useState, Fragment } from 'react';
import { format } from 'date-fns';
import { MdOutlineDelete, MdOutlineEdit, MdOutlinePersonOff, MdOutlinePersonAdd, MdLockReset } from 'react-icons/md';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import EditUserForm from './EditUserForm';
import { Dialog, Transition } from '@headlessui/react';

const UserDetail = ({ user, onBack, onUserUpdated }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
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
        enqueueSnackbar('User deleted successfully', { variant: 'success' });
        
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

  const handleResetPassword = async () => {
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
      console.log(`Sending password reset for user ${user._id} to ${user.name}`);
      
      // Use the endpoint from backend/routes/userRoute.js
      await axios.post(
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
      setIsResetPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      enqueueSnackbar(`Password for ${user.name} has been reset successfully`, { variant: 'success' });
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      {!showEditForm ? (
        // User Details View
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">User Details</h2>
            <button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
            >
              Back to Users
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                <p className="text-lg">{user.email}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                <p className="text-lg">{user.phone}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Access Level</h3>
                <p className="text-lg">{user.accessLevel}</p>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {/* Only show permissions section if user is not an Administrator */}
              {user.accessLevel !== 'Administrator' && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Permissions</h3>
                  {user.permissions && user.permissions.length > 0 ? (
                    <ul className="text-md list-disc pl-5">
                      {user.permissions.map((permission, index) => (
                        <li key={index}>{permission}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No specific permissions assigned</p>
                  )}
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
                <p className="text-md">{formatDate(user.createdAt)}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                <p className="text-md">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleEditUser}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition"
              >
                <MdOutlineEdit className="text-lg" />
                Edit User
              </button>
              
              <button
                onClick={() => setIsResetPasswordModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
              >
                <MdLockReset className="text-lg" />
                Reset Password
              </button>
              
              <button
                onClick={handleDeleteUser}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
              >
                <MdOutlineDelete className="text-lg" />
                Delete User
              </button>
            </div>
          </div>
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

      {/* Reset Password Modal */}
      <Transition appear show={isResetPasswordModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsResetPasswordModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Reset Password for {user.name}
                  </Dialog.Title>
                  
                  {resetPasswordError && (
                    <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                      {resetPasswordError}
                    </div>
                  )}
                  
                  {/* Proper form element to wrap password fields */}
                  <form 
                    name="passwordResetForm" 
                    id="passwordResetForm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}
                  >
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                          disabled={isResetting}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                          disabled={isResetting}
                          required
                        />
                      </div>

                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsResetPasswordModalOpen(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 text-sm font-medium transition-colors"
                          disabled={isResetting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${isResetting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                          disabled={isResetting}
                        >
                          {isResetting ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </div>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default UserDetail;