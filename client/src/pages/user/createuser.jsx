import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import { useSnackbar } from 'notistack';
import { MdPersonAdd, MdPerson, MdEmail, MdPhone, MdSecurity, MdBadge, MdCheckCircle, MdVerifiedUser, MdLock, MdShield } from 'react-icons/md';

// Custom CSS for toggle
const toggleStyles = `
  .toggle-checkbox:checked {
    right: 0;
    border-color: #10B981;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #10B981;
  }
  .toggle-label {
    transition: background-color 0.2s;
  }
`;

function CreateUser({ onUserAdded }) {
  // Add style tag with toggle CSS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = toggleStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    accessLevel: 'Staff Member',
    permissions: ['myInquiries'], // Initialize with required myInquiries
    password: '',
    confirmPassword: '',
    status: 'active', // Default status is active
  });
  const [error, setError] = useState('');

  // Available permissions for staff members - standardize with EditUserForm
  const availablePermissions = [
    { id: 'myInquiries', label: 'My Inquiries', description: 'Access to inquiries assigned to you', required: true },
    { id: 'inquiries', label: 'All Inquiries', description: 'Can view and manage all inquiries in the system' },
    { id: 'assignInquiries', label: 'Assign Users', description: 'Can assign inquiries to other users' },
    { id: 'addInquiry', label: 'Add Inquiries', description: 'Can create new inquiries in the system' },
  ];

  // Default permissions for staff members
  useEffect(() => {
    if (userData.accessLevel === 'Staff Member' && !userData.permissions.includes('myInquiries')) {
      // Ensure myInquiries is always included
      setUserData(prev => ({
        ...prev,
        permissions: [...prev.permissions, 'myInquiries']
      }));
    } else if (userData.accessLevel === 'Administrator') {
      // Administrators get all permissions
      setUserData({
        ...userData,
        permissions: availablePermissions.map(p => p.id)
      });
    }
  }, [userData.accessLevel, userData.permissions]);

  const handleInputChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  // Handle status toggle change
  const handleToggleChange = (e) => {
    setUserData({
      ...userData,
      status: e.target.checked ? 'active' : 'inactive'
    });
  };

  const handlePermissionChange = (permissionId) => {
    // Don't allow unchecking the "myInquiries" permission
    if (permissionId === 'myInquiries') return;
    
    const currentPermissions = [...userData.permissions];
    if (currentPermissions.includes(permissionId)) {
      // Remove permission if already exists
      setUserData({
        ...userData,
        permissions: currentPermissions.filter(id => id !== permissionId)
      });
    } else {
      // Add permission if it doesn't exist
      setUserData({
        ...userData,
        permissions: [...currentPermissions, permissionId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      enqueueSnackbar('Passwords do not match', { variant: 'error' });
      return;
    }

    // Validate form data
    if (!userData.name || !userData.email || !userData.phone || !userData.password) {
      setError('Please fill in all required fields');
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    // For staff members, ensure myInquiries permission is included
    if (userData.accessLevel === 'Staff Member') {
      const updatedPermissions = [...userData.permissions];
      if (!updatedPermissions.includes('myInquiries')) {
        updatedPermissions.push('myInquiries');
      }
      
      userData.permissions = updatedPermissions;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:5555/user', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        accessLevel: userData.accessLevel,
        permissions: userData.permissions,
        password: userData.password,
        status: userData.status // Send status to backend
      });
      
      setLoading(false);
      enqueueSnackbar('User created successfully', { variant: 'success' });
      
      // Reset form
      setUserData({
        name: '',
        email: '',
        phone: '',
        accessLevel: 'Staff Member',
        permissions: ['myInquiries'],
        password: '',
        confirmPassword: '',
        status: 'active', // Reset status to active
      });
      
      // Notify parent component if callback provided
      if (onUserAdded) {
        onUserAdded();
      }
      
    } catch (error) {
      setLoading(false);
      const errorMessage = error.response?.data?.message || 'Error creating user';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mr-4 shadow-lg">
          <MdPersonAdd className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-1">Create New User</h1>
          <p className="text-gray-600 mt-1">Add a new user to the system with appropriate access level and permissions</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-500 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner />
          <span className="ml-3 text-gray-600">Creating user...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <MdPerson className="text-indigo-500 mr-2" />
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
                    value={userData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter user's full name"
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
                    value={userData.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdPhone className="text-gray-500 mr-1.5" />
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Access & Security Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
              <MdSecurity className="text-indigo-500 mr-2" />
              Access & Security
            </h3>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
              <div className="sm:col-span-3">
                <label htmlFor="accessLevel" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <MdBadge className="text-gray-500 mr-1.5" />
                  Access Level
                </label>
                <div className="mt-1">
                  <select
                    id="accessLevel"
                    name="accessLevel"
                    value={userData.accessLevel}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-lg py-2.5 px-3 border"
                    required
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Staff Member">Staff Member</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {userData.accessLevel === 'Administrator' 
                      ? 'Administrators have full access to all system features and data' 
                      : 'Staff members have limited access based on assigned permissions'}
                  </p>
                </div>
              </div>

              {/* Status toggle switch with improved styling */}
              <div className="sm:col-span-3">
                <div className="flex items-center h-full">
                  <label htmlFor="status-toggle" className="flex items-center text-sm font-medium text-gray-700 mr-4">
                    <MdVerifiedUser className="text-gray-500 mr-1.5" />
                    User Status
                  </label>
                  <div className="relative inline-block w-14 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      id="status-toggle"
                      name="status-toggle"
                      checked={userData.status === 'active'}
                      onChange={handleToggleChange}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer"
                      style={{
                        transform: userData.status === 'active' ? 'translateX(0%)' : 'translateX(0)',
                        borderColor: userData.status === 'active' ? '#10B981' : '#D1D5DB'
                      }}
                    />
                    <label
                      htmlFor="status-toggle"
                      className="toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in"
                      style={{ 
                        backgroundColor: userData.status === 'active' ? '#10B981' : '#D1D5DB' 
                      }}
                    ></label>
                  </div>
                  <span className={`text-sm font-medium ml-2 ${
                    userData.status === 'active' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {userData.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 ml-6">
                  {userData.status === 'active'
                    ? 'User will be able to login immediately after creation'
                    : 'User will be created but unable to login until activated'}
                </p>
              </div>
            </div>

            {/* Permissions section with enhanced styling */}
            {userData.accessLevel === 'Staff Member' && (
              <div className="rounded-lg bg-gray-50 p-4 border border-gray-200 mb-6">
                <fieldset>
                  <legend className="flex items-center text-sm font-medium text-gray-700 mb-3">
                    <MdCheckCircle className="text-indigo-500 mr-1.5" />
                    User Permissions
                  </legend>
                  
                  <div className="bg-white rounded-lg p-3 border border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className={`flex items-start p-2 rounded-md hover:bg-gray-50 ${permission.required ? 'opacity-75' : ''}`}>
                          <div className="flex items-center h-5">
                            <input
                              id={`permission-${permission.id}`}
                              name={`permission-${permission.id}`}
                              type="checkbox"
                              checked={userData.permissions.includes(permission.id) || permission.required}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              disabled={permission.required}
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                              {permission.label}
                              {permission.required && <span className="text-xs text-indigo-600 ml-1">(Required)</span>}
                            </label>
                            <p className="text-gray-500 text-xs mt-0.5">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="mt-3 text-xs text-gray-500 italic">
                    Note: "My Inquiries" permission is required and cannot be disabled
                  </p>
                </fieldset>
              </div>
            )}

            {/* Password section with enhanced styling */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
                <MdLock className="text-indigo-500 mr-1.5" />
                User Password
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={userData.password}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      required
                      placeholder="Enter password"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters long</p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={userData.confirmPassword}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                      required
                      placeholder="Confirm password"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter the same password again to confirm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg shadow-sm transition-all"
            >
              <MdPersonAdd className="mr-2" />
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateUser;
