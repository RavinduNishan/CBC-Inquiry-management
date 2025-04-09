import React, { useState } from 'react';
import { format } from 'date-fns';
import { MdOutlineDelete, MdOutlineEdit, MdOutlinePersonOff, MdOutlinePersonAdd } from 'react-icons/md';
import axios from 'axios';

const UserDetail = ({ user, onBack, onUserUpdated }) => {
  const [loading, setLoading] = useState(false);
  
  // Format date for readability
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'PPP p');
  };

  const handleEditUser = () => {
    // This should be implemented to show the edit modal
    // You can reuse the existing edit functionality
  };

  const handleDeleteUser = () => {
    // This should be implemented to show the delete confirmation
    // You can reuse the existing delete functionality
  };

  const handleChangePermissions = () => {
    // Implement permission changes here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
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
            onClick={handleChangePermissions}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition"
          >
            {user.status === 'active' ? (
              <>
                <MdOutlinePersonOff className="text-lg" />
                Change Permissions
              </>
            ) : (
              <>
                <MdOutlinePersonAdd className="text-lg" />
                Change Permissions
              </>
            )}
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
    </div>
  );
};

export default UserDetail;