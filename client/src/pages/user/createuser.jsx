import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../../components/Spinner';
import { useSnackbar } from 'notistack';

function CreateUser({ onUserAdded }) {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    accessLevel: 'Staff Member',
    permissions: [],
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  // Available permissions for staff members
  const availablePermissions = [
    { id: 'allInquiries', label: 'All Inquiries' },
    { id: 'myInquiries', label: 'My Inquiries' },
    { id: 'assignUsers', label: 'Assign Users' },
    { id: 'addInquiries', label: 'Add Inquiries' },
  ];

  // Default permissions for staff members
  useEffect(() => {
    if (userData.accessLevel === 'Staff Member' && userData.permissions.length === 0) {
      // Set default permissions for staff
      setUserData({
        ...userData,
        permissions: ['myInquiries']
      });
    } else if (userData.accessLevel === 'Administrator') {
      // Administrators get all permissions
      setUserData({
        ...userData,
        permissions: availablePermissions.map(p => p.id)
      });
    }
  }, [userData.accessLevel]);

  const handleInputChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handlePermissionChange = (permissionId) => {
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

    // For staff members, at least one permission must be selected
    if (userData.accessLevel === 'Staff Member' && userData.permissions.length === 0) {
      setError('Please select at least one permission for the staff member');
      enqueueSnackbar('Please select at least one permission', { variant: 'error' });
      return;
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
        status: 'active'
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
    <div className="max-w-3xl mx-auto">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center my-8">
          <Spinner />
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">User Information</h3>
            <p className="mt-1 text-sm text-gray-500">Please fill in the details to create a new user.</p>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="accessLevel" className="block text-sm font-medium text-gray-700">
                  Access Level *
                </label>
                <div className="mt-1">
                  <select
                    id="accessLevel"
                    name="accessLevel"
                    value={userData.accessLevel}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    required
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Staff Member">Staff Member</option>
                  </select>
                </div>
              </div>

              {/* Permissions field - only show for Staff Members */}
              {userData.accessLevel === 'Staff Member' && (
                <div className="sm:col-span-6">
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">
                      Permissions *
                    </legend>
                    <div className="bg-gray-50 rounded p-4 border border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        {availablePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start">
                            <div className="flex items-center h-5">
                              <input
                                id={`permission-${permission.id}`}
                                name={`permission-${permission.id}`}
                                type="checkbox"
                                checked={userData.permissions.includes(permission.id)}
                                onChange={() => handlePermissionChange(permission.id)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                                {permission.label}
                              </label>
                              <p className="text-gray-500">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </fieldset>
                </div>
              )}

              <div className="sm:col-span-3">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    required
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={userData.confirmPassword}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateUser;
