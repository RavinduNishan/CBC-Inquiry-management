import React, { useState } from 'react';
import { MdArrowBack } from 'react-icons/md';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const EditUserForm = ({ user, onBack, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [editUserData, setEditUserData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    accessLevel: user.accessLevel,
    permissions: user.permissions || [],
    status: user.status || 'active',
  });
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // Available permissions for staff members
  const availablePermissions = [
    { id: 'allInquiries', label: 'All Inquiries' },
    { id: 'myInquiries', label: 'My Inquiries' },
    { id: 'assignUsers', label: 'Assign Users' },
    { id: 'addInquiries', label: 'Add Inquiries' },
  ];

  const handleInputChange = (e) => {
    setEditUserData({
      ...editUserData,
      [e.target.name]: e.target.value
    });
  };

  // Handle status toggle change
  const handleToggleChange = (e) => {
    setEditUserData({
      ...editUserData,
      status: e.target.checked ? 'active' : 'inactive'
    });
  };

  const handlePermissionChange = (permissionId) => {
    const currentPermissions = [...(editUserData.permissions || [])];
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form data
    if (!editUserData.name || !editUserData.email || !editUserData.phone) {
      setError('Please fill in all required fields');
      enqueueSnackbar('Please fill in all required fields', { variant: 'error' });
      return;
    }

    // For staff members, at least one permission must be selected
    if (editUserData.accessLevel === 'Staff Member' && 
        (!editUserData.permissions || editUserData.permissions.length === 0)) {
      setError('Please select at least one permission for the staff member');
      enqueueSnackbar('Please select at least one permission', { variant: 'error' });
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.put(`http://localhost:5555/user/${user._id}`, {
        name: editUserData.name,
        email: editUserData.email,
        phone: editUserData.phone,
        accessLevel: editUserData.accessLevel,
        permissions: editUserData.permissions,
        status: editUserData.status
      });
      
      setLoading(false);
      enqueueSnackbar('User updated successfully', { variant: 'success' });
      
      // Notify parent component to refresh data
      if (onUserUpdated) {
        onUserUpdated();
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
        <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
        >
          <MdArrowBack className="text-lg" />
          Back to User Details
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={editUserData.name}
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
                  value={editUserData.email}
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
                  value={editUserData.phone}
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
                  value={editUserData.accessLevel}
                  onChange={handleInputChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                  required
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Staff Member">Staff Member</option>
                </select>
              </div>
            </div>

            {/* Status toggle switch */}
            <div className="sm:col-span-6">
              <div className="flex items-center">
                <label htmlFor="status-toggle" className="block text-sm font-medium text-gray-700 mr-4">
                  User Status
                </label>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="status-toggle"
                    name="status-toggle"
                    checked={editUserData.status === 'active'}
                    onChange={handleToggleChange}
                    className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    style={{
                      top: '0px',
                      right: editUserData.status === 'active' ? '0px' : 'auto',
                      left: editUserData.status === 'active' ? 'auto' : '0px',
                      transition: 'right 0.2s ease-in-out, left 0.2s ease-in-out, background-color 0.2s ease'
                    }}
                  />
                  <label
                    htmlFor="status-toggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      editUserData.status === 'active' ? 'bg-green-400' : 'bg-gray-300'
                    }`}
                    style={{ transition: 'background-color 0.2s ease' }}
                  ></label>
                </div>
                <span className="text-sm font-medium ml-2">
                  {editUserData.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Toggle to set whether this user account is active or inactive.
              </p>
            </div>

            {/* Permissions field - only show for Staff Members */}
            {editUserData.accessLevel === 'Staff Member' && (
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
                              checked={editUserData.permissions?.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor={`permission-${permission.id}`} className="font-medium text-gray-700">
                              {permission.label}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </fieldset>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
    </>
  );
};

export default EditUserForm;
