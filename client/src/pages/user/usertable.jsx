import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BsSearch, BsCheckCircle, BsXCircle } from 'react-icons/bs';
import { FiEdit, FiTrash2, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import axios from 'axios';

// Access level badge component
const accessLevelBadge = (accessLevel) => {
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
  
  if (!accessLevel) return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>N/A</span>;
  
  switch (accessLevel.toLowerCase()) {
    case 'administrator':
      return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>{accessLevel}</span>;
    case 'manager':
      return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>{accessLevel}</span>;
    case 'user':
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>{accessLevel}</span>;
    default:
      return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{accessLevel}</span>;
  }
};

const UserTable = ({ users, fetchUsers, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Initialize filtered users with all users on component mount
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const applyFilters = () => {
    const filtered = users.filter(user => {
      const matchesSearch = !searchTerm || 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = !roleFilter || user.accessLevel?.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = !statusFilter || user.status?.toLowerCase() === statusFilter.toLowerCase();
      
      return matchesSearch && matchesRole && matchesStatus;
    });
    
    setFilteredUsers(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Sticky Search and Filter Controls */}
      <div className="sticky top-0 z-30 bg-white backdrop-blur-sm shadow-md">
        <div className="bg-white rounded-t-lg border border-gray-200 p-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 items-end">
            {/* Search Input */}
            <div className="relative col-span-1">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <BsSearch className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 w-full py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            
            {/* Role and Status Filters */}
            <div className="flex space-x-1 flex-wrap">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Access Levels</option>
                <option value="administrator">Administrator</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {/* Action Buttons - Fixed layout */}
            <div className="flex items-center justify-end space-x-3">
              <div className="text-xs text-gray-500 flex items-center">
                <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs font-medium mr-1">
                  {filteredUsers.length}
                </span> 
                users found
              </div>
              
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* Single scrollable container for the entire table - increased height */}
      <div className="flex-1 overflow-auto border border-gray-200 rounded-b-lg" style={{ height: 'calc(100% - 90px)' }}>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 bg-white h-full flex items-center justify-center">
            <div>
              <p className="text-gray-500 text-lg">No users found matching your search criteria</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-sky-600 hover:text-sky-800 underline"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="relative min-w-full">
            <table className="min-w-full border-collapse">
              {/* Table header - sticky relative to the scrollable container */}
              <thead className="sticky top-0 z-20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Access Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-200 sticky top-0 right-0 z-30 shadow-lg">Actions</th>
                </tr>
              </thead>
              
              {/* Table body */}
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    className={`hover:bg-gray-50 ${
                      user.status === 'inactive' 
                        ? 'bg-gray-100' 
                        : user.accessLevel === 'Administrator' && user.status === 'active'
                          ? 'bg-red-50' // Light red background for active administrators
                          : ''
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {accessLevelBadge(user.accessLevel)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {user.status === 'active' ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                          <BsCheckCircle className="mr-1" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center">
                          <BsXCircle className="mr-1" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium sticky right-0 bg-white shadow-lg z-10 border-l border-gray-100">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => onViewDetails(user)}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-sky-500"
                        >
                          <FiUser className="mr-1" /> Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;