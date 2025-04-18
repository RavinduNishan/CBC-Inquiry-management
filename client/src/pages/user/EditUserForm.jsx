import React, { useState, useEffect, useContext } from 'react';
import { MdArrowBack, MdPerson, MdEmail, MdPhone, MdSecurity, MdBadge, MdCheckCircle, MdVerifiedUser, MdSave } from 'react-icons/md';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import AuthContext from '../../context/AuthContext';

const EditUserForm = ({ user, onBack, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [editUserData, setEditUserData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    accessLevel: user.accessLevel,
    permissions: Array.isArray(user.permissions) ? [...user.permissions] : [], // Ensure proper initialization
    status: user.status || 'active',
  });
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser, logout } = useContext(AuthContext);
  
  // Check if the user being edited is the current logged-in user
  const isEditingSelf = currentUser && user._id === currentUser._id;

  // Available permissions for staff members
  const availablePermissions = [
    { id: 'myInquiries', label: 'My Inquiries', description: 'Access to inquiries assigned to you', required: true },
    { id: 'inquiries', label: 'All Inquiries', description: 'Can view and manage all inquiries in the system' },
    { id: 'assignInquiries', label: 'Assign Users', description: 'Can assign inquiries to other users (requires "All Inquiries" permission)' },
    { id: 'addInquiry', label: 'Add Inquiries', description: 'Can create new inquiries in the system' },
  ];

  const handleInputChange = (e) => {
    // For email field, trim spaces as the user types
    if (e.target.name === 'email') {
      setEditUserData({
        ...editUserData,
        [e.target.name]: e.target.value.trim()
      });
    } else {
      setEditUserData({
        ...editUserData,
        [e.target.name]: e.target.value
      });
    }
  };

  // Handle status toggle change
  const handleToggleChange = (e) => {
    setEditUserData({
      ...editUserData,
      status: e.target.checked ? 'active' : 'inactive'
    });
  };

  const handlePermissionChange = (permissionId) => {
    // Don't allow unchecking the "myInquiries" permission
    if (permissionId === 'myInquiries') return;
    
    const currentPermissions = [...(editUserData.permissions || [])];
    
    // Special handling for permission dependencies
    if (permissionId === 'inquiries') {
      // If unchecking "All Inquiries", also remove "Assign Users"
      if (currentPermissions.includes(permissionId)) {
        setEditUserData({
          ...editUserData,
          permissions: currentPermissions.filter(id => id !== permissionId && id !== 'assignInquiries')
        });
      } else {
        setEditUserData({
          ...editUserData,
          permissions: [...currentPermissions, permissionId]
        });
      }
    } 
    // Only allow adding "Assign Users" if "All Inquiries" is checked
    else if (permissionId === 'assignInquiries') {
      // Only add if "inquiries" permission exists
      if (currentPermissions.includes('inquiries')) {
        if (currentPermissions.includes(permissionId)) {
          setEditUserData({
            ...editUserData,
            permissions: currentPermissions.filter(id => id !== permissionId)
          });
        } else {
          setEditUserData({
            ...editUserData,
            permissions: [...currentPermissions, permissionId]
          });
        }
      }
    }
    // Normal handling for other permissions
    else {
      if (currentPermissions.includes(permissionId)) {
        // Remove permission if already exists
        setEditUserData({
          ...editUserData,
          permissions: currentPermissions.filter(id => id !== permissionId)
        });
      } else {
        // Add permission if it doesn't exist
        setEditUserData({
          ...editUserData,
          permissions: [...currentPermissions, permissionId]
        });
      }
    }
  };

  // Ensure myInquiries permission is always included for Staff Member
  useEffect(() => {
    if (editUserData.accessLevel === 'Staff Member') {
      const hasMyInquiries = editUserData.permissions.includes('myInquiries');
      if (!hasMyInquiries) {
        setEditUserData(prev => ({
          ...prev,
          permissions: [...prev.permissions, 'myInquiries']
        }));
      }
    }
  }, [editUserData.accessLevel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form data
    if (!editUserData.name || !editUserData.email || !editUserData.phone) {
      setError('Please fill in all required fields');
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    // Normalize email address (trim spaces and convert to lowercase)
    const normalizedEmail = editUserData.email.trim().toLowerCase();

    // For staff members, ensure myInquiries permission is included and no duplicates
    if (editUserData.accessLevel === 'Staff Member') {
      // Use Set to remove duplicates and ensure myInquiries is included
      const uniquePermissions = new Set(editUserData.permissions);
      uniquePermissions.add('myInquiries');
      
      // Convert back to array for submission
      editUserData.permissions = Array.from(uniquePermissions);
    } else if (editUserData.accessLevel === 'Administrator') {
      // For administrators, assign all permissions
      editUserData.permissions = availablePermissions.map(p => p.id);
    }

    try {
      setLoading(true);
      
      // Log what we're sending for debugging
      console.log('Submitting permissions:', editUserData.permissions);
      
      const response = await axios.put(`http://localhost:5555/user/${user._id}`, {
        name: editUserData.name,
        email: normalizedEmail, // Use the normalized email
        phone: editUserData.phone,
        accessLevel: editUserData.accessLevel,
        permissions: editUserData.permissions,
        status: editUserData.status
      });
      
      setLoading(false);
      
      // Check if the update requires a re-login
      if (response.data.requiresRelogin && isEditingSelf) {
        // Show success message but prepare for logout
        enqueueSnackbar('Your profile has been updated. You will be logged out.', { 
          variant: 'info',
          autoHideDuration: 3000
        });
        
        // Clear existing profile version to prevent auto-login loop
        localStorage.removeItem('profileVersion');
        
        // Add a delay to show the message before logout
        setTimeout(() => {
          // Set flag to prevent immediate check on logout
          localStorage.setItem('justLoggedOut', 'true');
          logout('Your account information has been updated. Please log in again.', '/login');
          // No need for window.location.href as the logout function handles it
        }, 3000);
      } else {
        // Regular success message for admin editing other users
        enqueueSnackbar('User updated successfully', { variant: 'success' });
        
        // Notify parent component to refresh data
        if (onUserUpdated) {
          onUserUpdated();
        }
      }
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Error updating user';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <MdPerson className="text-sky-500 text-2xl mr-2" />
          <h2 className="text-xl font-bold text-gray-800">Edit User Profile</h2>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm border border-gray-200"
        >
          <MdArrowBack className="text-lg" />
          Back to User Details
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <MdPerson className="text-sky-500 mr-2" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPerson className="text-gray-500 mr-1.5" />
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={editUserData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2 px-3 border"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdEmail className="text-gray-500 mr-1.5" />
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editUserData.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2 px-3 border"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPhone className="text-gray-500 mr-1.5" />
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={editUserData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2 px-3 border"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="accessLevel" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdBadge className="text-gray-500 mr-1.5" />
                  Access Level
                </label>
                <div className="mt-1">
                  <select
                    id="accessLevel"
                    name="accessLevel"
                    value={editUserData.accessLevel}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-sky-500 focus:border-sky-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2 px-3 border"
                    required
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Staff Member">Staff Member</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {editUserData.accessLevel === 'Administrator' 
                      ? 'Administrator has full access to all system features' 
                      : 'Staff members have limited access based on assigned permissions'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <MdSecurity className="text-sky-500 mr-2" />
              Account Settings
            </h3>

            {/* Status toggle switch with improved styling */}
            <div className="mb-6">
              <div className="flex items-center">
                <label htmlFor="status-toggle" className="flex items-center text-sm font-medium text-gray-700 mr-4">
                  <MdVerifiedUser className="text-gray-500 mr-1.5" />
                  User Status
                </label>
                <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    id="status-toggle"
                    name="status-toggle"
                    checked={editUserData.status === 'active'}
                    onChange={handleToggleChange}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                    style={{
                      top: '0px',
                      right: editUserData.status === 'active' ? '0px' : 'auto',
                      left: editUserData.status === 'active' ? 'auto' : '0px',
                      transition: 'all 0.3s',
                      transform: editUserData.status === 'active' ? 'translateX(0%)' : 'translateX(0)',
                      borderColor: editUserData.status === 'active' ? '#10B981' : '#D1D5DB'
                    }}
                  />
                  <label
                    htmlFor="status-toggle"
                    className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in"
                    style={{ 
                      backgroundColor: editUserData.status === 'active' ? '#10B981' : '#D1D5DB' 
                    }}
                  ></label>
                </div>
                <span className={`text-sm font-medium ml-2 ${
                  editUserData.status === 'active' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {editUserData.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 ml-6">
                {editUserData.status === 'active'
                  ? 'User can currently login and access the system'
                  : 'User is prevented from logging in to the system'}
              </p>
            </div>

            {/* Permissions field with enhanced styling */}
            {editUserData.accessLevel === 'Staff Member' && (
              <div>
                <fieldset className="mt-4">
                  <legend className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <MdCheckCircle className="text-gray-500 mr-1.5" />
                    User Permissions
                  </legend>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availablePermissions.map((permission) => {
                        // Check if permission should be disabled
                        const isDisabled = permission.required || 
                          (permission.id === 'assignInquiries' && !editUserData.permissions?.includes('inquiries'));
                        
                        return (
                          <div key={permission.id} className={`flex items-center ${isDisabled ? 'opacity-75' : ''}`}>
                            <input
                              id={`permission-${permission.id}`}
                              name={`permission-${permission.id}`}
                              type="checkbox"
                              checked={editUserData.permissions?.includes(permission.id) || permission.required}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                              disabled={isDisabled}
                            />
                            <label htmlFor={`permission-${permission.id}`} className="ml-3">
                              <span className="text-sm text-gray-700">{permission.label}</span>
                              {permission.required && <span className="text-xs text-sky-600 ml-1">(Required)</span>}
                              {permission.id === 'assignInquiries' && !editUserData.permissions?.includes('inquiries') && 
                                <span className="text-xs text-orange-600 ml-1">(Requires "All Inquiries")</span>
                              }
                              <p className="text-xs text-gray-500">{permission.description}</p>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-xs text-gray-500 italic">
                      Note: "My Inquiries" permission is required and cannot be disabled. "Assign Users" requires "All Inquiries" permission.
                    </p>
                  </div>
                </fieldset>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border border-gray-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-sm flex items-center"
            >
              <MdSave className="mr-1.5" /> Save Changes
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default EditUserForm;
